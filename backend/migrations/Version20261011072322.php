<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261011072322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Initial learning schema, browser-scoped exercises and unique response numbers';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE child_profile (id INT AUTO_INCREMENT NOT NULL, display_name VARCHAR(40) NOT NULL, birth_year INT DEFAULT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE child_reward (id INT AUTO_INCREMENT NOT NULL, earned_at DATETIME NOT NULL, child_id INT NOT NULL, reward_id INT NOT NULL, UNIQUE INDEX child_reward_unique (child_id, reward_id), INDEX IDX_2784B60FDD62C21B (child_id), INDEX IDX_2784B60FE466ACA1 (reward_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE exercise (id INT AUTO_INCREMENT NOT NULL, completed TINYINT NOT NULL, created_at DATETIME NOT NULL, type VARCHAR(40) NOT NULL, skill VARCHAR(80) NOT NULL, difficulty INT NOT NULL, payload JSON NOT NULL, enabled TINYINT NOT NULL, session_id INT NOT NULL, INDEX IDX_AEDAD51C613FECDF (session_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE exercise_attempt (id INT AUTO_INCREMENT NOT NULL, expected_answer JSON NOT NULL, given_answer JSON NOT NULL, correct TINYINT NOT NULL, response_time_ms INT NOT NULL, attempt_number INT NOT NULL, created_at DATETIME NOT NULL, child_id INT NOT NULL, session_id INT NOT NULL, exercise_id INT NOT NULL, INDEX attempt_child_date (child_id, created_at), UNIQUE INDEX exercise_attempt_number (exercise_id, attempt_number), INDEX IDX_C2F9F523DD62C21B (child_id), INDEX IDX_C2F9F523613FECDF (session_id), INDEX IDX_C2F9F523E934951A (exercise_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE learning_session (id INT AUTO_INCREMENT NOT NULL, started_at DATETIME NOT NULL, ended_at DATETIME DEFAULT NULL, device_type VARCHAR(20) DEFAULT NULL, child_id INT NOT NULL, INDEX IDX_14E36D27DD62C21B (child_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE reward (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(40) NOT NULL, reward_key VARCHAR(80) NOT NULL, metadata JSON NOT NULL, UNIQUE INDEX UNIQ_4ED17253407136E8 (reward_key), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE skill_progress (id INT AUTO_INCREMENT NOT NULL, skill_key VARCHAR(80) NOT NULL, score DOUBLE PRECISION NOT NULL, confidence DOUBLE PRECISION NOT NULL, last_practiced_at DATETIME DEFAULT NULL, child_id INT NOT NULL, UNIQUE INDEX progress_child_skill (child_id, skill_key), INDEX IDX_60A99FB4DD62C21B (child_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE child_reward ADD CONSTRAINT FK_2784B60FDD62C21B FOREIGN KEY (child_id) REFERENCES child_profile (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE child_reward ADD CONSTRAINT FK_2784B60FE466ACA1 FOREIGN KEY (reward_id) REFERENCES reward (id)');
        $this->addSql('ALTER TABLE exercise ADD CONSTRAINT FK_AEDAD51C613FECDF FOREIGN KEY (session_id) REFERENCES learning_session (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE exercise_attempt ADD CONSTRAINT FK_C2F9F523DD62C21B FOREIGN KEY (child_id) REFERENCES child_profile (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE exercise_attempt ADD CONSTRAINT FK_C2F9F523613FECDF FOREIGN KEY (session_id) REFERENCES learning_session (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE exercise_attempt ADD CONSTRAINT FK_C2F9F523E934951A FOREIGN KEY (exercise_id) REFERENCES exercise (id)');
        $this->addSql('ALTER TABLE learning_session ADD CONSTRAINT FK_14E36D27DD62C21B FOREIGN KEY (child_id) REFERENCES child_profile (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE skill_progress ADD CONSTRAINT FK_60A99FB4DD62C21B FOREIGN KEY (child_id) REFERENCES child_profile (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE child_reward DROP FOREIGN KEY FK_2784B60FDD62C21B');
        $this->addSql('ALTER TABLE child_reward DROP FOREIGN KEY FK_2784B60FE466ACA1');
        $this->addSql('ALTER TABLE exercise DROP FOREIGN KEY FK_AEDAD51C613FECDF');
        $this->addSql('ALTER TABLE exercise_attempt DROP FOREIGN KEY FK_C2F9F523DD62C21B');
        $this->addSql('ALTER TABLE exercise_attempt DROP FOREIGN KEY FK_C2F9F523613FECDF');
        $this->addSql('ALTER TABLE exercise_attempt DROP FOREIGN KEY FK_C2F9F523E934951A');
        $this->addSql('ALTER TABLE learning_session DROP FOREIGN KEY FK_14E36D27DD62C21B');
        $this->addSql('ALTER TABLE skill_progress DROP FOREIGN KEY FK_60A99FB4DD62C21B');
        $this->addSql('DROP TABLE child_profile');
        $this->addSql('DROP TABLE child_reward');
        $this->addSql('DROP TABLE exercise');
        $this->addSql('DROP TABLE exercise_attempt');
        $this->addSql('DROP TABLE learning_session');
        $this->addSql('DROP TABLE reward');
        $this->addSql('DROP TABLE skill_progress');
    }
}
