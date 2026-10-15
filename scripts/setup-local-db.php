<?php
// Optional local WSL bootstrap: run as the MySQL socket administrator.
// Creates ONLY dedicated Zorka databases/accounts. Never prints credentials.
$target = dirname(__DIR__).'/backend/.env.local';
if (is_file($target)) {
    fwrite(STDOUT, "Local environment exists; no account or database changed.\n");
    exit(0);
}
$db = new mysqli('localhost', 'root');
foreach (['zorka_learning', 'zorka_learning_test'] as $name) {
    $existing = $db->query("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '$name'");
    if ($existing->num_rows) throw new RuntimeException('Zorka database already exists; configure env manually.');
}
$password = bin2hex(random_bytes(24));
$secret = bin2hex(random_bytes(32));
$version = explode('-', $db->server_info)[0];
$db->query("CREATE USER 'zorka_local'@'127.0.0.1' IDENTIFIED BY '$password'");
foreach (['zorka_learning', 'zorka_learning_test'] as $name) {
    $db->query("CREATE DATABASE `$name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $db->query("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES ON `$name`.* TO 'zorka_local'@'127.0.0.1'");
}
$content = "APP_SECRET=$secret\nDATABASE_URL=\"mysql://zorka_local:$password@127.0.0.1:3306/zorka_learning?serverVersion=$version&charset=utf8mb4\"\n";
file_put_contents($target, $content);
chmod($target, 0600);
file_put_contents(dirname($target).'/.env.test.local', $content);
chmod(dirname($target).'/.env.test.local', 0600);
// Preserve workspace ownership when this helper is run through wsl -u root.
$owner = fileowner(dirname($target));
if ($owner !== false) chown($target, $owner);
if ($owner !== false) chown(dirname($target).'/.env.test.local', $owner);
echo "Created isolated local databases and ignored .env.local; credentials were not printed.\n";
