<?php
namespace DoctrineMigrations;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
final class Version20261011140000 extends AbstractMigration
{
    public function getDescription(): string { return 'Independent minimum writing coverage percentage'; }
    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE practice_settings ADD writing_coverage INT DEFAULT 70 NOT NULL');
        $this->addSql('UPDATE practice_settings SET writing_coverage = writing_threshold');
    }
    public function down(Schema $schema): void { $this->addSql('ALTER TABLE practice_settings DROP writing_coverage'); }
}
