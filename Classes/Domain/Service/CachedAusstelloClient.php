<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Domain\Service;

use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;

class CachedAusstelloClient implements AusstelloClientInterface
{

    public function __construct(
        private readonly AusstelloClientInterface $inner,
        private readonly FrontendInterface $cache
    ) {
    }

    public function get(string $path, array $query = [], array $additionalOptions = []): array
    {
        $identifier = md5(json_encode([$path, $query, $additionalOptions]));
        $result = $this->cache->get($identifier);
        if ($result === false) {
            $result = $this->inner->get($path, $query, $additionalOptions);
            $this->cache->set($identifier, $result);
        }
        return $result;
    }

    public function post(string $path, array $data, array $additionalOptions = []): array
    {
        return $this->inner->post($path, $data, $additionalOptions);
    }
}
