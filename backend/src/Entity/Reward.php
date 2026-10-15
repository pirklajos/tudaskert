<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reward
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\Column(length: 40)]
    public string $type;

    #[ORM\Column(name: 'reward_key', length: 80, unique: true)]
    public string $key;

    #[ORM\Column(type: 'json')]
    public array $metadata = [];

    public function __construct(string $type, string $key, array $metadata = [])
    {
        $this->type = $type;
        $this->key = $key;
        $this->metadata = $metadata;
    }
}
