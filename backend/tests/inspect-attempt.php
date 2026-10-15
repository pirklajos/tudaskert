<?php
// CLI-only persistence probe for the isolated test database.
use App\Kernel;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Dotenv\Dotenv;
require dirname(__DIR__).'/vendor/autoload.php';
(new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
$kernel = new Kernel('test', false);
$kernel->boot();
$connection = $kernel->getContainer()->get('doctrine')->getManager()->getConnection();
$id = filter_var($argv[1] ?? '', FILTER_VALIDATE_INT);
if (!$id) throw new RuntimeException('Exercise id required');
$rows = $connection->fetchAllAssociative('SELECT correct, attempt_number, given_answer FROM exercise_attempt WHERE exercise_id = ? ORDER BY attempt_number', [$id]);
echo json_encode($rows, JSON_THROW_ON_ERROR)."\n";
