<?php
namespace DoctrineMigrations;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
final class Version20261011110000 extends AbstractMigration
{
    public function getDescription(): string { return 'Parent-selected practice letters'; }
    public function up(Schema $schema): void { $this->addSql('ALTER TABLE child_profile ADD practice_letters JSON DEFAULT NULL'); }
    public function down(Schema $schema): void { $this->addSql('ALTER TABLE child_profile DROP practice_letters'); }
}
