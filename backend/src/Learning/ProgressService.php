<?php

namespace App\Learning;

use App\Entity\{Child, SkillProgress};
use Doctrine\ORM\EntityManagerInterface;

final class ProgressService
{
    public function __construct(private EntityManagerInterface $em) {}

    public function update(Child $child, string $skill): void
    {
        $row = $this->em->getConnection()->fetchAssociative('SELECT COUNT(*) AS total, SUM(a.correct) AS successes, MAX(a.created_at) AS last_date FROM exercise_attempt a JOIN exercise e ON e.id = a.exercise_id WHERE a.child_id = ? AND e.skill = ?', [$child->id, $skill]);
        $record = $this->em->getRepository(SkillProgress::class)->findOneBy(['child' => $child, 'skillKey' => $skill]) ?? new SkillProgress($child, $skill);
        $count = (int) $row['total'];
        $record->score = $count ? (int) $row['successes'] / $count : 0;
        $record->confidence = min(1, $count / 12);
        $record->lastPracticedAt = $row['last_date'] ? new \DateTimeImmutable($row['last_date'], new \DateTimeZone('UTC')) : null;
        $this->em->persist($record);
    }

    public function summary(Child $child): array
    {
        // This installation represents one child (Zorka), with separate browser
        // identities for request ownership. Parent statistics span those identities.
        $rows = $this->em->getConnection()->fetchAllAssociative('SELECT a.*, e.skill, e.type, s.device_type FROM exercise_attempt a JOIN exercise e ON e.id = a.exercise_id JOIN learning_session s ON s.id = a.session_id ORDER BY a.created_at, a.id');
        $total = count($rows); $correct = 0; $duration = 0; $exercises = []; $skills = []; $modules = []; $confusions = []; $history = []; $activity = [];
        foreach ($rows as $row) {
            $success = (int) $row['correct']; $time = (int) $row['response_time_ms'];
            $correct += $success; $duration += $time; $exercises[$row['exercise_id']] = true;
            $module = explode(':', $row['type'], 2)[0]; $day = (new \DateTimeImmutable($row['created_at'], new \DateTimeZone('UTC')))->setTimezone(new \DateTimeZone('Europe/Budapest'))->format('Y-m-d');
            $item = &$activity[$row['exercise_id']];
            $item ??= ['module' => $module, 'skill' => $row['skill'], 'deviceType' => $row['device_type'], 'attempts' => 0, 'correct' => 0, 'timeMs' => 0];
            $item['attempts']++; $item['correct'] += $success; $item['timeMs'] += $time;
            $item['practicedAt'] = str_replace(' ', 'T', $row['created_at']).'Z';
            if ($module === 'writing') {
                $given = json_decode($row['given_answer'], true);
                $item['writingPercent'] = $given['percent'] ?? (isset($given['precision'], $given['coverage']) ? (int) min(round($given['precision'] * 100), round($given['coverage'] * 100)) : null);
            }
            unset($item);
            foreach (['skills' => $row['skill'], 'modules' => $module, 'history' => $day] as $group => $key) {
                $bucket = &${$group}[$key];
                $bucket ??= ['attempts' => 0, 'correct' => 0, 'timeMs' => 0];
                $bucket['attempts']++; $bucket['correct'] += $success; $bucket['timeMs'] += $time;
                unset($bucket);
            }
            if (!$success && $module !== 'writing') {
                $expected = json_decode($row['expected_answer'], true)['value'] ?? '';
                $given = json_decode($row['given_answer'], true)['value'] ?? '';
                $key = $expected.'→'.$given;
                $confusions[$key] ??= ['expected' => $expected, 'given' => $given, 'count' => 0];
                $confusions[$key]['count']++;
            }
        }
        foreach ($skills as &$bucket) $bucket['rate'] = $bucket['correct'] / $bucket['attempts'];
        unset($bucket);
        usort($confusions, fn ($a, $b) => $b['count'] <=> $a['count']);
        usort($activity, fn ($a, $b) => strcmp($b['practicedAt'], $a['practicedAt']));
        return ['recentActivity' => array_slice(array_values($activity), 0, 50), 'attempts' => $total, 'completedExercises' => count($exercises), 'correct' => $correct, 'practiceTimeMs' => $duration, 'averageResponseTimeMs' => $total ? (int) round($duration / $total) : 0, 'lastPracticedAt' => $rows ? str_replace(' ', 'T', $rows[array_key_last($rows)]['created_at']).'Z' : null, 'skills' => $skills, 'modules' => $modules, 'confusions' => array_values($confusions), 'history' => $history];
    }
}
