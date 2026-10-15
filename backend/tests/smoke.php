<?php

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\HttpFoundation\Request;

require dirname(__DIR__).'/vendor/autoload.php';
(new Dotenv())->bootEnv(dirname(__DIR__).'/.env');
$kernel = new Kernel('test', false);
$request = Request::create('/api/health');
$response = $kernel->handle($request);
$data = json_decode($response->getContent(), true, flags: JSON_THROW_ON_ERROR);
if ($response->getStatusCode() !== 200 || $data !== ['status' => 'ok']) {
    throw new RuntimeException('Health response is invalid');
}
$kernel->terminate($request, $response);
$kernel->shutdown();
echo "OK: Symfony health endpoint\n";
