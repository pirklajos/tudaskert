<?php

namespace App\Api;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

final class ApiErrors
{
    #[AsEventListener(event: 'kernel.exception', priority: 10)]
    public function error(ExceptionEvent $event): void
    {
        if (!str_starts_with($event->getRequest()->getPathInfo(), '/api/')) return;
        $exception = $event->getThrowable();
        $status = $exception instanceof HttpExceptionInterface ? $exception->getStatusCode() : 500;
        $event->setResponse(new JsonResponse(['error' => $status >= 500 ? 'Most nem sikerült a mentés. Próbáld később!' : ($exception->getMessage() ?: 'A kérés nem teljesíthető.')], $status));
    }

    #[AsEventListener(event: 'kernel.response')]
    public function headers(ResponseEvent $event): void
    {
        if (!str_starts_with($event->getRequest()->getPathInfo(), '/api/')) return;
        $headers = $event->getResponse()->headers;
        $headers->set('Cache-Control', 'no-store, private');
        $headers->set('X-Content-Type-Options', 'nosniff');
    }
}
