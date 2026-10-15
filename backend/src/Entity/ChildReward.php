<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\UniqueConstraint(name: 'child_reward_unique', columns: ['child_id', 'reward_id'])]
class ChildReward
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    public Child $child;

    #[ORM\ManyToOne, ORM\JoinColumn(nullable: false)]
    public Reward $reward;

    #[ORM\Column]
    public \DateTimeImmutable $earnedAt;

    public function __construct(Child $child, Reward $reward)
    {
        $this->child = $child;
        $this->reward = $reward;
        $this->earnedAt = new \DateTimeImmutable();
    }
}
