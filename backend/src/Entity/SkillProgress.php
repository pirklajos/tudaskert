<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\UniqueConstraint(name: 'progress_child_skill', columns: ['child_id', 'skill_key'])]
class SkillProgress
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    public Child $child;

    #[ORM\Column(length: 80)]
    public string $skillKey;

    #[ORM\Column]
    public float $score = 0;

    #[ORM\Column]
    public float $confidence = 0;

    #[ORM\Column(nullable: true)]
    public ?\DateTimeImmutable $lastPracticedAt = null;

    public function __construct(Child $child, string $skillKey)
    {
        $this->child = $child;
        $this->skillKey = $skillKey;
    }
}
