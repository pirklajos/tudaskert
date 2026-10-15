<?php
namespace App\Learning;
use Doctrine\DBAL\Connection;
final class PracticeSettings
{
    public function __construct(private Connection $connection) {}
    public function letters(): ?array
    {
        $value = $this->connection->fetchOne('SELECT letters FROM practice_settings WHERE id = 1');
        return $value ? json_decode($value, true, flags: JSON_THROW_ON_ERROR) : null;
    }
    public function save(array $letters): void
    {
        $this->connection->executeStatement('INSERT INTO practice_settings (id, letters) VALUES (1, ?) ON DUPLICATE KEY UPDATE letters = VALUES(letters)', [json_encode($letters, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)]);
    }
    public function writingThreshold(): int
    {
        return (int) ($this->connection->fetchOne('SELECT writing_threshold FROM practice_settings WHERE id = 1') ?: 70);
    }
    public function writingCoverage(): int
    {
        return (int) ($this->connection->fetchOne('SELECT writing_coverage FROM practice_settings WHERE id = 1') ?: 70);
    }
    public function saveWritingThreshold(int $percent, ?int $coverage = null): void
    {
        $this->connection->executeStatement('INSERT INTO practice_settings (id, writing_threshold, writing_coverage) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE writing_threshold = VALUES(writing_threshold), writing_coverage = VALUES(writing_coverage)', [$percent, $coverage ?? $this->writingCoverage()]);
    }
}
