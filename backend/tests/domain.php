<?php

use App\Learning\{Catalog, AttemptEvaluator, TraceEvaluator, AdaptiveSelector};
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
require dirname(__DIR__).'/vendor/autoload.php';
$catalog = new Catalog(dirname(__DIR__, 2).'/public/data/learning.json');
$evaluator = new AttemptEvaluator($catalog, new TraceEvaluator());
$checks = 0;
function check(bool $condition): void { global $checks; if (!$condition) throw new RuntimeException('Domain check failed'); $checks++; }
foreach (['initial', 'pair', 'build', 'type'] as $mode) {
    $exercise = $catalog->generate('words', $mode, 1);
    $rows = $evaluator->evaluate($exercise, [['value' => $exercise['expected'], 'responseTimeMs' => 50]], 50);
    check($rows[0]['correct']);
}
for ($index = 0; $index < 10; $index++) {
    $exercise = $catalog->generate('writing', 'trace', 1, $index);
    $rows = $evaluator->evaluate($exercise, [['strokes' => $exercise['trace']['strokes'], 'responseTimeMs' => 100]], 100);
    check($rows[0]['correct']);
}
$exercise = $catalog->generate('writing', 'trace', 1, 0);
try { $evaluator->evaluate($exercise, [['strokes' => [[[0, 0], [300, 0]]], 'correct' => true, 'responseTimeMs' => 100]], 100); check(false); }
catch (UnprocessableEntityHttpException) { check(true); }
$exercise = $catalog->generate('clouds', 'pop', 1);
$targets = array_values(array_filter($exercise['choices'], fn ($item) => $item['value'] === $exercise['target']));
try { $evaluator->evaluate($exercise, [['id' => $targets[0]['id'], 'responseTimeMs' => 10], ['id' => $targets[0]['id'], 'responseTimeMs' => 20]], 20); check(false); }
catch (UnprocessableEntityHttpException) { check(true); }
$selector = new AdaptiveSelector();
check($selector->weight(0, 1) > $selector->weight(1, 1));
$units = ['A', 'E', 'I', 'O'];
$progress = ['A' => ['score' => 0, 'confidence' => 1], 'E' => ['score' => 1, 'confidence' => 1]];
$counts = array_fill_keys($units, 0);
for ($i = 0; $i < 5000; $i++) $counts[$selector->choose($units, $progress, [], 'test:'.$i)]++;
check($counts['A'] > 3 * $counts['E']);
check($selector->choose($units, $progress, ['A', 'E'], 'same') === $selector->choose($units, $progress, ['A', 'E'], 'same'));
for ($i = 0; $i < 100; $i++) check(!in_array($selector->choose($units, $progress, ['A', 'E'], (string) $i), ['A', 'E'], true));
$guide = [[[0,50],[100,50]]];
$drawn = [...$guide, [[0,150],[100,150]]];
foreach ([49 => true, 50 => true, 51 => false] as $threshold => $correct) {
    $result = (new TraceEvaluator())->evaluate($drawn, $guide, array_replace($catalog->traceConfig(), ['tolerance' => 10, 'acceptancePercent' => $threshold]));
    check($result['percent'] === 50); check($result['correct'] === $correct);
}
$a = $catalog->generate('writing', 'trace', 1, 0);
$partial = (new TraceEvaluator())->evaluate([$a['trace']['strokes'][1]], $a['trace']['strokes'], $catalog->traceConfig());
check($partial['precision'] === 1 || $partial['precision'] === 1.0);
check($partial['coverage'] < 0.5);
check(!$partial['correct']);
check($partial['percent'] === (int) round($partial['coverage'] * 100));
$coverageLimit = (int) round($partial['coverage'] * 100);
check((new TraceEvaluator())->evaluate([$a['trace']['strokes'][1]], $a['trace']['strokes'], array_replace($catalog->traceConfig(), ['acceptancePercent' => 90, 'coveragePercent' => $coverageLimit]))['correct']);
check(!(new TraceEvaluator())->evaluate([$a['trace']['strokes'][1]], $a['trace']['strokes'], array_replace($catalog->traceConfig(), ['acceptancePercent' => 90, 'coveragePercent' => $coverageLimit + 1]))['correct']);
try { $evaluator->evaluate($a, [['strokes' => [$a['trace']['strokes'][1]], 'responseTimeMs' => 10]], 10); check(false); }
catch (UnprocessableEntityHttpException) { check(true); }
echo "OK: $checks server domain checks\n";
