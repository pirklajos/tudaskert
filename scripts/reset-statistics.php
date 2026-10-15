<?php
// Explicitly invoked maintenance operation for the local development database.
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;
if (($argv[1] ?? '') !== '--statistics-only') throw new RuntimeException('Explicit --statistics-only argument required.');
require dirname(__DIR__).'/backend/vendor/autoload.php';
(new Dotenv())->bootEnv(dirname(__DIR__).'/backend/.env');
$kernel = new Kernel('dev', false); $kernel->boot();
$db = $kernel->getContainer()->get('doctrine')->getManager()->getConnection();
if ($db->getDatabase() !== 'zorka_learning') throw new RuntimeException('Unexpected database; nothing changed.');
$before = $db->fetchAllAssociative('SELECT * FROM practice_settings ORDER BY id');
$profiles = $db->fetchAllAssociative('SELECT * FROM child_profile ORDER BY id');
$rewards = $db->fetchAllAssociative('SELECT * FROM child_reward ORDER BY id');
$cutoff = gmdate('Y-m-d\TH:i:s\Z');
$db->beginTransaction();
try {
    $attempts = $db->executeStatement('DELETE FROM exercise_attempt');
    $skills = $db->executeStatement('DELETE FROM skill_progress');
    // Retire issued tasks so queued answers cannot bring deleted statistics back.
    $db->executeStatement('UPDATE exercise SET enabled = 0');
    if ($before !== $db->fetchAllAssociative('SELECT * FROM practice_settings ORDER BY id') || $profiles !== $db->fetchAllAssociative('SELECT * FROM child_profile ORDER BY id') || $rewards !== $db->fetchAllAssociative('SELECT * FROM child_reward ORDER BY id')) throw new RuntimeException('Preservation check failed.');
    $db->commit();
} catch (Throwable $error) { $db->rollBack(); throw $error; }
file_put_contents(dirname(__DIR__).'/public/js/statistics-reset.js', 'export const STATISTICS_RESET_AT = '.json_encode($cutoff, JSON_THROW_ON_ERROR).";\n");
echo "Statistics cleared: $attempts answers, $skills skill records. Settings, profiles and rewards preserved.\n";
echo 'Remaining answers: '.$db->fetchOne('SELECT COUNT(*) FROM exercise_attempt')."\n";
