<?php

namespace App\Learning;

use App\Entity\{Child, Reward, ChildReward};
use Doctrine\ORM\EntityManagerInterface;

final class RewardService
{
    public function __construct(private EntityManagerInterface $em, private Catalog $catalog) {}

    public function award(Child $child): void
    {
        $count = (int) $this->em->getConnection()->fetchOne('SELECT COUNT(*) FROM exercise e JOIN learning_session s ON s.id = e.session_id WHERE s.child_id = ? AND e.completed = 1', [$child->id]);
        foreach ($this->catalog->rewards() as $rule) {
            if ($count < $rule['threshold']) continue;
            // Shared definitions can be initialized concurrently by different browsers.
            $this->em->getConnection()->executeStatement('INSERT INTO reward (type, reward_key, metadata) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reward_key = VALUES(reward_key)', ['sticker', $rule['key'], json_encode($rule, JSON_THROW_ON_ERROR)]);
            $reward = $this->em->getRepository(Reward::class)->findOneBy(['key' => $rule['key']]);
            if (!$this->em->getRepository(ChildReward::class)->findOneBy(['child' => $child, 'reward' => $reward])) $this->em->persist(new ChildReward($child, $reward));
        }
    }
}
