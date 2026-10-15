<?php

namespace App\Learning;

final class TraceEvaluator
{
    public function evaluate(array $strokes, array $guide, array $config): array
    {
        $drawn = $this->sample($strokes, $config['sampleStep']);
        $expected = $this->sample($guide, $config['sampleStep']);
        if (count($drawn) < $config['minPoints'] || !$expected) return ['correct' => false, 'coverage' => 0, 'precision' => 0, 'percent' => 0];
        $coverage = count(array_filter($expected, fn ($point) => $this->nearby($point, $drawn, $config['tolerance']))) / count($expected);
        $precision = count(array_filter($drawn, fn ($point) => $this->nearby($point, $expected, $config['tolerance']))) / count($drawn);
        $percent = (int) min(round($precision * 100), round($coverage * 100));
        return ['correct' => round($precision * 100) >= ($config['acceptancePercent'] ?? 70) && round($coverage * 100) >= ($config['coveragePercent'] ?? $config['acceptancePercent'] ?? 70), 'coverage' => $coverage, 'precision' => $precision, 'percent' => $percent];
    }

    private function sample(array $paths, int $step): array
    {
        $result = [];
        foreach ($paths as $path) for ($i = 1; $i < count($path); $i++) {
            [$x1, $y1] = $path[$i - 1]; [$x2, $y2] = $path[$i];
            $count = max(1, (int) ceil(hypot($x2 - $x1, $y2 - $y1) / $step));
            for ($n = 0; $n <= $count; $n++) $result[] = [$x1 + ($x2 - $x1) * $n / $count, $y1 + ($y2 - $y1) * $n / $count];
        }
        return $result;
    }

    private function nearby(array $point, array $points, int $tolerance): bool
    {
        foreach ($points as $other) if (hypot($point[0] - $other[0], $point[1] - $other[1]) <= $tolerance) return true;
        return false;
    }
}
