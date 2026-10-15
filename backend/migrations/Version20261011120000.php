<?php
namespace DoctrineMigrations;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
final class Version20261011120000 extends AbstractMigration
{
    public function getDescription(): string { return 'Persist installation-wide practice letters across browsers and devices'; }
    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE practice_settings (id INT NOT NULL, letters JSON DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('INSERT INTO practice_settings (id, letters) SELECT 1, practice_letters FROM child_profile WHERE practice_letters IS NOT NULL ORDER BY id DESC LIMIT 1');
    }
    public function down(Schema $schema): void { $this->addSql('DROP TABLE practice_settings'); }
}
