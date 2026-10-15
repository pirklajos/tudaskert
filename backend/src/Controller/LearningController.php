<?php

namespace App\Controller;

use App\Api\BrowserContext;
use App\Entity\{Exercise, ExerciseAttempt, LearningSession, ChildReward, SkillProgress};
use App\Learning\{Catalog, AttemptEvaluator, AdaptiveSelector, ProgressService, RewardService};
use Doctrine\DBAL\LockMode;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\{JsonResponse, Request};
use Symfony\Component\HttpKernel\Exception\{AccessDeniedHttpException, NotFoundHttpException, UnprocessableEntityHttpException, ConflictHttpException};
use Symfony\Component\Routing\Attribute\Route;

final class LearningController
{
    public function __construct(private EntityManagerInterface $em, private BrowserContext $context, private Catalog $catalog, private AttemptEvaluator $evaluator, private AdaptiveSelector $adaptive, private ProgressService $progress, private RewardService $rewardService, private \App\Learning\PracticeSettings $settings) {}

    #[Route('/api/child/current', methods: ['GET'])]
    public function current(Request $request): JsonResponse
    {
        $child = $this->context->child($request);
        return new JsonResponse(['child' => $child ? ['id' => $child->id, 'displayName' => $child->displayName] : null, 'practiceLetters' => $this->settings->letters(), 'writingThreshold' => $this->settings->writingThreshold(), 'writingCoverage' => $this->settings->writingCoverage(), 'csrfToken' => $this->context->token()]);
    }

    #[Route('/api/world', methods: ['GET'])]
    public function world(Request $request): JsonResponse
    {
        $child = $this->context->child($request);
        $rewards = $child ? $this->em->getRepository(ChildReward::class)->findBy(['child' => $child]) : [];
        return new JsonResponse(['modules' => ['clouds', 'words', 'writing', 'reading'], 'decorations' => array_map(fn ($item) => $item->reward->metadata['decoration'], $rewards)]);
    }

    #[Route('/api/sessions', methods: ['POST'])]
    public function session(Request $request): JsonResponse
    {
        $data = $this->context->input($request);
        $device = $data['deviceType'] ?? 'unknown';
        if (!in_array($device, ['phone', 'tablet', 'desktop', 'unknown'], true)) throw new UnprocessableEntityHttpException('Érvénytelen eszköztípus.');
        $child = $this->context->child($request, true);
        $id = $request->getSession()->get('learningId');
        $session = $id ? $this->em->find(LearningSession::class, $id) : null;
        if (!$session || $session->child->id !== $child->id || $session->endedAt) {
            $session = new LearningSession($child); $session->deviceType = $device;
            $this->em->persist($session); $this->em->flush();
            $request->getSession()->set('learningId', $session->id);
        }
        return new JsonResponse(['id' => $session->id, 'childId' => $child->id, 'startedAt' => $session->startedAt->format(DATE_ATOM)], 201);
    }

    #[Route('/api/sessions/{id}/finish', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function finish(int $id, Request $request): JsonResponse
    {
        $this->context->input($request);
        $child = $this->context->requiredChild($request);
        $session = $this->em->find(LearningSession::class, $id);
        if (!$session || $session->child->id !== $child->id) throw new NotFoundHttpException();
        $session->endedAt ??= new \DateTimeImmutable(); $this->em->flush();
        if ($request->getSession()->get('learningId') === $id) $request->getSession()->remove('learningId');
        return new JsonResponse(['id' => $id, 'endedAt' => $session->endedAt->format(DATE_ATOM)]);
    }

    #[Route('/api/exercises/next', methods: ['GET'])]
    public function next(Request $request): JsonResponse
    {
        $child = $this->context->requiredChild($request);
        $id = $request->getSession()->get('learningId');
        $session = $id ? $this->em->find(LearningSession::class, $id) : null;
        if (!$session || $session->child->id !== $child->id || $session->endedAt) throw new ConflictHttpException('Kezdj új gyakorlást.');
        $module = $request->query->get('module', 'clouds');
        $mode = $request->query->get('mode', $module === 'words' ? 'initial' : 'find');
        $difficulty = filter_var($request->query->get('difficulty', '1'), FILTER_VALIDATE_INT);
        $index = filter_var($request->query->get('index', '0'), FILTER_VALIDATE_INT);
        if ($difficulty === false || $index === false) throw new UnprocessableEntityHttpException();
        $unit = null;
        if ($module === 'clouds') {
            $records = $this->em->getRepository(SkillProgress::class)->findBy(['child' => $child]);
            $progress = [];
            foreach ($records as $record) if (str_starts_with($record->skillKey, 'letter:')) $progress[substr($record->skillKey, 7)] = ['score' => $record->score, 'confidence' => $record->confidence];
            $recent = $this->em->getConnection()->fetchFirstColumn('SELECT e.skill FROM exercise e JOIN learning_session s ON s.id = e.session_id WHERE s.child_id = ? AND e.type LIKE ? ORDER BY e.id DESC LIMIT 2', [$child->id, 'clouds:%']);
            $recent = array_map(fn ($skill) => substr($skill, 7), $recent);
            $sequence = $this->em->getConnection()->fetchOne('SELECT COUNT(*) FROM exercise e JOIN learning_session s ON s.id = e.session_id WHERE s.child_id = ?', [$child->id]);
            $unit = $this->adaptive->choose($this->settings->letters() ?? $this->catalog->letters(), $progress, $recent, $child->id.':'.$sequence);
        }
        $payload = $this->catalog->generate($module, $mode, $difficulty, $index, $unit, $this->settings->letters());
        if ($module === 'writing') $payload['traceConfig'] = array_replace($this->catalog->traceConfig(), ['acceptancePercent' => $this->settings->writingThreshold(), 'coveragePercent' => $this->settings->writingCoverage()]);
        if ($payload['unavailable'] ?? false) return new JsonResponse($payload);
        $exercise = new Exercise($module.':'.$payload['mode'], $payload['skill'], $payload['difficulty'], $payload);
        $exercise->session = $session; $this->em->persist($exercise); $this->em->flush();
        return new JsonResponse($payload + ['id' => (string) $exercise->id, 'serverIssued' => true]);
    }

    #[Route('/api/attempts', methods: ['POST'])]
    public function attempt(Request $request): JsonResponse
    {
        $data = $this->context->input($request); $child = $this->context->requiredChild($request);
        if (!isset($data['exerciseId'], $data['responses'], $data['responseTimeMs']) || !(is_string($data['exerciseId']) || is_int($data['exerciseId'])) || !ctype_digit((string) $data['exerciseId']) || !is_array($data['responses']) || !is_int($data['responseTimeMs'])) throw new UnprocessableEntityHttpException('Érvénytelen eredmény.');
        $this->em->beginTransaction();
        try {
            $this->em->lock($child, LockMode::PESSIMISTIC_WRITE);
            $exercise = $this->em->find(Exercise::class, (int) $data['exerciseId'], LockMode::PESSIMISTIC_WRITE);
            if (!$exercise || $exercise->session->child->id !== $child->id) throw new NotFoundHttpException();
            if (!$exercise->enabled) throw new NotFoundHttpException('Ez a korábbi gyakorlás már lezárult.');
            if ($exercise->completed) { $this->em->commit(); return new JsonResponse(['saved' => true, 'duplicate' => true]); }
            $rows = $this->evaluator->evaluate($exercise->payload, $data['responses'], $data['responseTimeMs']);
            foreach ($rows as $number => $row) {
                $attempt = new ExerciseAttempt($child, $exercise->session, $exercise, $row['expected'], $row['given'], $row['correct'], $row['durationMs'], $number + 1);
                $this->em->persist($attempt);
            }
            $exercise->completed = true; $this->em->flush();
            $this->progress->update($child, $exercise->skill);
            $this->rewardService->award($child); $this->em->flush(); $this->em->commit();
        } catch (\Throwable $error) { $this->em->rollback(); throw $error; }
        return new JsonResponse(['saved' => true, 'attempts' => count($rows), 'correct' => !in_array(false, array_column($rows, 'correct'), true)], 201);
    }

    #[Route('/api/rewards', methods: ['GET'])]
    public function rewards(Request $request): JsonResponse
    {
        $child = $this->context->requiredChild($request);
        $rewards = $this->em->getRepository(ChildReward::class)->findBy(['child' => $child]);
        return new JsonResponse(['rewards' => array_map(fn ($item) => ['key' => $item->reward->key, 'metadata' => $item->reward->metadata, 'earnedAt' => $item->earnedAt->format(DATE_ATOM)], $rewards)]);
    }

    #[Route('/api/progress', methods: ['GET'])]
    public function progress(Request $request): JsonResponse
    {
        if ($request->getSession()->get('parentUntil', 0) < time()) throw new AccessDeniedHttpException('Szülői belépés szükséges.');
        return new JsonResponse($this->progress->summary($this->context->requiredChild($request)));
    }
}
