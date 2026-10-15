<?php
// Single origin local server: static frontend plus Symfony API.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
date_default_timezone_set('UTC');
if (str_starts_with($path, '/api/')) {
    require __DIR__.'/backend/vendor/autoload.php';
    $_SERVER['APP_ENV'] = $_ENV['APP_ENV'] = getenv('APP_ENV') ?: 'dev';
    (new Symfony\Component\Dotenv\Dotenv())->bootEnv(__DIR__.'/backend/.env');
    $debug = getenv('APP_DEBUG') === false ? $_SERVER['APP_ENV'] === 'dev' : filter_var(getenv('APP_DEBUG'), FILTER_VALIDATE_BOOL);
    $kernel = new App\Kernel($_SERVER['APP_ENV'], $debug);
    $request = Symfony\Component\HttpFoundation\Request::createFromGlobals();
    $response = $kernel->handle($request);
    $response->send();
    $kernel->terminate($request, $response);
    return true;
}
return false;
