<?php

namespace Werkraum\Ausstello\Domain\Service;

interface AusstelloClientInterface
{
    public function get(string $path, array $query = [], array $additionalOptions = []): array;

    public function post(string $path, array $data, array $additionalOptions = []): array;
}
