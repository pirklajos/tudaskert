<?php

namespace App\Controller;

use App\Api\BrowserContext;
use Symfony\Component\HttpFoundation\{JsonResponse, Request};
use Symfony\Component\HttpKernel\Exception\{AccessDeniedHttpException, TooManyRequestsHttpException, UnprocessableEntityHttpException};
use Symfony\Component\Routing\Attribute\Route;

final class ParentController
{
    public function __construct(private BrowserContext $context, private \App\Learning\Catalog $catalog, private \Doctrine\ORM\EntityManagerInterface $em, private \App\Learning\PracticeSettings $settings) {}

    #[Route('/api/parent/letters', methods: ['GET', 'PUT'])]
    public function letters(Request $request): JsonResponse
    {
        if ($request->getSession()->get('parentUntil', 0) < time()) throw new AccessDeniedHttpException('Szülői belépés szükséges.');
        $child = $this->context->requiredChild($request);
        if ($request->isMethod('PUT')) {
            $data = $this->context->input($request);
            $letters = $data['letters'] ?? null;
            if (!is_array($letters) || !array_is_list($letters) || !$letters || count($letters) > count($this->catalog->units())) throw new UnprocessableEntityHttpException('Válassz legalább egy betűt.');
            foreach ($letters as $letter) if (!is_string($letter) || !in_array($letter, $this->catalog->units(), true)) throw new UnprocessableEntityHttpException('Ismeretlen betű.');
            $child->practiceLetters = array_values(array_unique($letters));
            $this->em->flush();
            $this->settings->save($child->practiceLetters);
        }
        return new JsonResponse(['letters' => $this->settings->letters(), 'available' => $this->catalog->units(), 'writingThreshold' => $this->settings->writingThreshold(), 'writingCoverage' => $this->settings->writingCoverage()]);
    }

    #[Route('/api/parent/writing', methods: ['PUT'])]
    public function writing(Request $request): JsonResponse
    {
        if ($request->getSession()->get('parentUntil', 0) < time()) throw new AccessDeniedHttpException('Szülői belépés szükséges.');
        $data = $this->context->input($request);
        $percent = $data['acceptancePercent'] ?? null;
        $coverage = $data['coveragePercent'] ?? $this->settings->writingCoverage();
        if (!is_int($percent) || $percent < 1 || $percent > 100) throw new UnprocessableEntityHttpException('1 és 100 közötti egész százalék szükséges.');
        if (!is_int($coverage) || $coverage < 1 || $coverage > 100) throw new UnprocessableEntityHttpException('1 és 100 közötti egész lefedettség szükséges.');
        $this->settings->saveWritingThreshold($percent, $coverage);
        return new JsonResponse(['writingThreshold' => $percent, 'writingCoverage' => $coverage]);
    }

    #[Route('/api/parent/challenge', methods: ['GET'])]
    public function challenge(Request $request): JsonResponse
    {
        $session = $request->getSession();
        if ($session->get('parentBlockedUntil', 0) > time()) throw new TooManyRequestsHttpException(30, 'Próbáld meg egy kicsit később.');
        $left = random_int(6, 12); $right = random_int(6, 9);
        $session->set('parentChallenge', ['answer' => $left * $right, 'expires' => time() + 120]);
        return new JsonResponse(['question' => "$left × $right = ?"]);
    }

    #[Route('/api/parent/unlock', methods: ['POST'])]
    public function unlock(Request $request): JsonResponse
    {
        $data = $this->context->input($request); $session = $request->getSession();
        if ($session->get('parentBlockedUntil', 0) > time()) throw new TooManyRequestsHttpException(30);
        $challenge = $session->get('parentChallenge');
        if (!$challenge || $challenge['expires'] < time()) throw new AccessDeniedHttpException('Kérj új ellenőrző feladatot.');
        if (!is_int($data['answer'] ?? null) || $data['answer'] !== $challenge['answer']) {
            $failures = $session->get('parentFailures', 0) + 1; $session->set('parentFailures', $failures);
            if ($failures >= 5) { $session->set('parentBlockedUntil', time() + 30); $session->remove('parentChallenge'); $session->set('parentFailures', 0); }
            throw new UnprocessableEntityHttpException('A válasz nem egyezik. Próbáld újra.');
        }
        $session->remove('parentChallenge'); $session->set('parentFailures', 0); $session->set('parentUntil', time() + 900);
        return new JsonResponse(['unlocked' => true]);
    }

    #[Route('/api/parent/lock', methods: ['POST'])]
    public function lock(Request $request): JsonResponse
    {
        $this->context->input($request); $request->getSession()->remove('parentUntil');
        return new JsonResponse(['locked' => true]);
    }
}
