<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class LearningSession
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    public Child $child;

    #[ORM\Column]
    public \DateTimeImmutable $startedAt;

    #[ORM\Column(nullable: true)]
    public ?\DateTimeImmutable $endedAt = null;

    #[ORM\Column(length: 20, nullable: true)]
    public ?string $deviceType = null;

    public function __construct(Child $child)
    {
        $this->child = $child;
        $this->startedAt = new \DateTimeImmutable();
    }
}
