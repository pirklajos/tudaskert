<?php

namespace App\Api;

use App\Entity\Child;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

final class BrowserContext
{
    public function __construct(private EntityManagerInterface $em, private CsrfTokenManagerInterface $csrf) {}

    public function token(): string { return $this->csrf->getToken('learning')->getValue(); }

    public function child(Request $request, bool $create = false): ?Child
    {
        $id = $request->getSession()->get('childId');
        $child = $id ? $this->em->find(Child::class, $id) : null;
        if (!$child && $create) {
            $child = new Child();
            $this->em->persist($child); $this->em->flush();
            $request->getSession()->migrate(true);
            $request->getSession()->set('childId', $child->id);
        }
        return $child;
    }

    public function requiredChild(Request $request): Child
    {
        return $this->child($request) ?? throw new AccessDeniedHttpException('Előbb kezdd el a gyakorlást.');
    }

    public function input(Request $request): array
    {
        if (!$this->csrf->isTokenValid(new CsrfToken('learning', $request->headers->get('X-CSRF-Token', '')))) throw new AccessDeniedHttpException('A kérés nem ellenőrizhető.');
        $origin = $request->headers->get('Origin');
        if (($origin && $origin !== $request->getSchemeAndHttpHost()) || $request->headers->get('Sec-Fetch-Site') === 'cross-site') throw new AccessDeniedHttpException();
        if (!str_starts_with($request->headers->get('Content-Type', ''), 'application/json') || strlen($request->getContent()) > 262144) throw new BadRequestHttpException('JSON kérés szükséges.');
        try { $data = json_decode($request->getContent(), true, 32, JSON_THROW_ON_ERROR); }
        catch (\JsonException) { throw new BadRequestHttpException('Érvénytelen JSON.'); }
        if (!is_array($data) || array_is_list($data) && $data !== []) throw new BadRequestHttpException('JSON objektum szükséges.');
        return $data;
    }
}
