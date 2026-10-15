<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'child_profile')]
class Child
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    public ?int $id = null;

    #[ORM\Column(length: 40)]
    public string $displayName;

    #[ORM\Column(nullable: true)]
    public ?int $birthYear = null;

    #[ORM\Column(type: 'json', nullable: true)]
    public ?array $practiceLetters = null;

    #[ORM\Column]
    public \DateTimeImmutable $createdAt;

    public function __construct(string $displayName = 'Zorka')
    {
        $this->displayName = $displayName;
        $this->createdAt = new \DateTimeImmutable();
    }
}
