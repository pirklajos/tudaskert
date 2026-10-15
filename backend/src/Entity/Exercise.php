<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Exercise
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    public LearningSession $session;

    #[ORM\Column]
    public bool $completed = false;

    #[ORM\Column]
    public \DateTimeImmutable $createdAt;

    #[ORM\Column(length: 40)]
    public string $type;

    #[ORM\Column(length: 80)]
    public string $skill;

    #[ORM\Column]
    public int $difficulty;

    #[ORM\Column(type: 'json')]
    public array $payload;

    #[ORM\Column]
    public bool $enabled = true;

    public function __construct(string $type, string $skill, int $difficulty, array $payload)
    {
        $this->type = $type;
        $this->skill = $skill;
        $this->difficulty = $difficulty;
        $this->payload = $payload;
        $this->createdAt = new \DateTimeImmutable();
    }
}
