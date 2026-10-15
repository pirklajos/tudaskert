<?php
namespace DoctrineMigrations;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
final class Version20261011130000 extends AbstractMigration
{
    public function getDescription(): string { return 'Parent-configurable writing acceptance percentage'; }
    public function up(Schema $schema): void { $this->addSql('ALTER TABLE practice_settings ADD writing_threshold INT DEFAULT 70 NOT NULL'); }
    public function down(Schema $schema): void { $this->addSql('ALTER TABLE practice_settings DROP writing_threshold'); }
}
