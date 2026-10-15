<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Index(columns: ['child_id', 'created_at'], name: 'attempt_child_date')]
#[ORM\UniqueConstraint(name: 'exercise_attempt_number', columns: ['exercise_id', 'attempt_number'])]
class ExerciseAttempt
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    public Child $child;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    public LearningSession $session;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)]
    public Exercise $exercise;

    #[ORM\Column(type: 'json')]
    public array $expectedAnswer;

    #[ORM\Column(type: 'json')]
    public array $givenAnswer;

    #[ORM\Column]
    public bool $correct;

    #[ORM\Column]
    public int $responseTimeMs;

    #[ORM\Column]
    public int $attemptNumber;

    #[ORM\Column]
    public \DateTimeImmutable $createdAt;

    public function __construct(Child $child, LearningSession $session, Exercise $exercise, array $expectedAnswer, array $givenAnswer, bool $correct, int $responseTimeMs, int $attemptNumber)
    {
        $this->child = $child;
        $this->session = $session;
        $this->exercise = $exercise;
        $this->expectedAnswer = $expectedAnswer;
        $this->givenAnswer = $givenAnswer;
        $this->correct = $correct;
        $this->responseTimeMs = $responseTimeMs;
        $this->attemptNumber = $attemptNumber;
        $this->createdAt = new \DateTimeImmutable();
    }
}
