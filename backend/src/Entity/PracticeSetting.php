<?php
namespace App\Entity;
use Doctrine\ORM\Mapping as ORM;
#[ORM\Entity, ORM\Table(name: 'practice_settings')]
class PracticeSetting
{
    #[ORM\Id, ORM\Column]
    public int $id = 1;
    #[ORM\Column(type: 'json', nullable: true)]
    public ?array $letters = null;
    #[ORM\Column(options: ['default' => 70])]
    public int $writingThreshold = 70;
    #[ORM\Column(options: ['default' => 70])]
    public int $writingCoverage = 70;
}
