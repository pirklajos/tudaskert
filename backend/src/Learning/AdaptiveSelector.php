<?php

namespace App\Learning;

final class AdaptiveSelector
{
    public function weight(float $score, float $confidence): float
    {
        $score = max(0, min(1, $score)); $confidence = max(0, min(1, $confidence));
        return 2 * (1 - $confidence) + (1 + 4 * (1 - $score)) * $confidence;
    }

    /** Reproducible weighted draw, excluding the last two units when possible. */
    public function choose(array $units, array $progress, array $recent, string $seed): string
    {
        if (!$units) throw new \InvalidArgumentException('Learning units required');
        $available = array_values(array_diff($units, array_slice($recent, 0, 2)));
        if (!$available) $available = $units;
        $weights = [];
        foreach ($available as $unit) {
            $record = $progress[$unit] ?? ['score' => 0, 'confidence' => 0];
            $weights[$unit] = $this->weight($record['score'], $record['confidence']);
        }
        $ticket = hexdec(substr(hash('sha256', $seed), 0, 8)) / 4294967296 * array_sum($weights);
        foreach ($weights as $unit => $weight) { $ticket -= $weight; if ($ticket < 0) return $unit; }
        return $available[array_key_last($available)];
    }
}
