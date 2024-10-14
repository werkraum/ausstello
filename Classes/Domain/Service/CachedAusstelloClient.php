<?php

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
