<?php

namespace App\Learning;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class Catalog
{
    private array $data;

    public function __construct(#[Autowire('%kernel.project_dir%/../public/data/learning.json')] string $path)
    {
        $this->data = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }

    public function generate(string $module, string $mode, int $difficulty, ?int $index = null, ?string $unit = null, ?array $practiceLetters = null): array
    {
        if (!in_array($difficulty, [1, 2, 3], true)) $this->invalid();
        if ($module === 'clouds') {
            if (!in_array($mode, ['find', 'pop', 'match'], true)) $this->invalid();
            $letters = $practiceLetters ?? $this->data['letters'];
            $target = $unit !== null && in_array($unit, $letters, true) ? $unit : $letters[random_int(0, count($letters) - 1)];
            $others = array_values(array_diff($letters, [$target]));
            shuffle($others);
            $choices = array_merge([$target], array_slice($others, 0, [3, 4, 6][$difficulty - 1] - 1));
            if ($mode === 'pop') $choices[] = $target;
            shuffle($choices);
            $choices = array_map(fn ($value, $id) => ['id' => (string) $id, 'value' => $value, 'label' => $difficulty === 3 && $id % 2 ? mb_strtolower($value) : $value], $choices, array_keys($choices));
            return compact('module', 'mode', 'difficulty', 'target', 'choices') + ['skill' => 'letter:'.$target];
        }
        if ($module === 'words') {
            if (!in_array($mode, ['initial', 'pair', 'build', 'type'], true)) $this->invalid();
            $words = $this->data['words'];
            if ($practiceLetters !== null) $words = array_values(array_filter($words, fn ($item) => !array_diff(array_map('mb_strtoupper', $mode === 'initial' ? [$item['units'][0]] : $item['units']), $practiceLetters)));
            if (!$words) return ['module' => $module, 'unavailable' => true];
            $entry = $words[random_int(0, count($words) - 1)];
            $expected = $mode === 'initial' ? mb_strtoupper($entry['units'][0]) : $entry['word'];
            if ($mode === 'initial') {
                $others = array_values(array_diff($practiceLetters ?? $this->data['units'], [$expected]));
                shuffle($others);
                $choices = array_merge([$expected], array_slice($others, 0, 3));
            } elseif ($mode === 'pair') {
                $others = array_values(array_diff(array_column($words, 'word'), [$expected]));
                shuffle($others);
                $choices = array_merge([$expected], array_slice($others, 0, 3));
            } else {
                $choices = $entry['units'];
                if ($mode === 'type') $choices = array_values(array_unique(array_merge($choices, $practiceLetters !== null ? array_map('mb_strtolower', $practiceLetters) : ['a', 'e', 'i', 'o', 'ö', 'u', 'ü', 'á', 'é'])));
            }
            shuffle($choices);
            $difficulty = $mode === 'initial' ? 1 : 2;
            return compact('module', 'mode', 'difficulty', 'entry', 'expected', 'choices') + ['skill' => $entry['id']];
        }
        if ($module === 'reading') {
            $entries = array_values(array_filter($this->data['readings'], fn ($item) => $item['mode'] === $mode));
            if (!$entries) $this->invalid();
            if ($practiceLetters !== null) $entries = array_values(array_filter($entries, fn ($item) => $this->canRead($item['text'].' '.implode(' ', $item['choices']), $practiceLetters)));
            if (!$entries) return ['module' => $module, 'unavailable' => true];
            $entry = $entries[random_int(0, count($entries) - 1)];
            shuffle($entry['choices']);
            return $entry + ['module' => $module, 'skill' => 'reading:'.$entry['key'], 'difficulty' => in_array($mode, ['syllables', 'word'], true) ? 1 : 2];
        }
        if ($module === 'writing') {
            if ($index === null || !isset($this->data['traces'][$index])) $this->invalid();
            $trace = $this->data['traces'][$index];
            if ($practiceLetters !== null && !in_array(mb_strtoupper($trace['letter']), $practiceLetters, true)) $this->invalid();
            return ['module' => $module, 'mode' => 'trace', 'difficulty' => 1, 'skill' => 'trace:'.$trace['letter'], 'trace' => $trace, 'index' => $index];
        }
        $this->invalid();
    }

    public function traceConfig(): array { return $this->data['traceConfig']; }
    public function letters(): array { return $this->data['letters']; }
    public function units(): array { return $this->data['units']; }
    public function rewards(): array { return $this->data['rewards']; }

    private function canRead(string $text, array $letters): bool
    {
        preg_match_all('/DZS|DZ|CS|GY|LY|NY|SZ|TY|ZS|[A-ZÁÉÍÓÖŐÚÜŰ]/u', mb_strtoupper($text), $matches);
        return !array_diff($matches[0], $letters);
    }

    private function invalid(): never { throw new UnprocessableEntityHttpException('Érvénytelen feladatbeállítás.'); }
}
