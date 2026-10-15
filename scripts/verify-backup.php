<?php
// Run only against the generated TEST database using local MySQL socket admin.
$source = 'zorka_learning_test'; $target = 'zorka_restore_probe';
$db = new mysqli('localhost', 'root');
if ($db->query("SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '$target'")->num_rows) throw new RuntimeException('Scratch database exists; no data changed.');
$directory = dirname(__DIR__).'/var';
if (!is_dir($directory)) mkdir($directory, 0700);
$dump = tempnam($directory, 'test-backup-'); chmod($dump, 0600);
$backup = proc_open(['mysqldump', '--single-transaction', '--skip-comments', $source], [0 => ['file', '/dev/null', 'r'], 1 => ['file', $dump, 'w'], 2 => STDERR], $pipes);
if (proc_close($backup) !== 0) throw new RuntimeException('Backup failed');
$created = false;
try {
    $db->query("CREATE DATABASE `$target` CHARACTER SET utf8mb4"); $created = true;
    $restore = proc_open(['mysql', $target], [0 => ['file', $dump, 'r'], 1 => STDOUT, 2 => STDERR], $pipes);
    if (proc_close($restore) !== 0) throw new RuntimeException('Restore failed');
    foreach (['child_profile', 'learning_session', 'exercise', 'exercise_attempt', 'skill_progress', 'reward', 'child_reward', 'doctrine_migration_versions'] as $table) {
        $a = $db->query("SELECT COUNT(*) FROM `$source`.`$table`")->fetch_row()[0];
        $b = $db->query("SELECT COUNT(*) FROM `$target`.`$table`")->fetch_row()[0];
        if ($a !== $b) throw new RuntimeException('Restored table count differs');
    }
    echo "OK: test database backup restored; eight table counts match.\n";
} finally {
    // Dispose ONLY the constant scratch database created by this invocation.
    if ($created) $db->query("DROP DATABASE `$target`");
    unlink($dump);
}
