<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Domain\Repository;

use Werkraum\Ausstello\Domain\Search\SearchDemand;
use Werkraum\Ausstello\Domain\Service\AusstelloClientInterface;

class EventRepository
{

    public function __construct(
        private readonly AusstelloClientInterface $ausstelloClient
    ) {
    }

    public function findByDemand(SearchDemand $demand): array
    {
        if ($demand->getQuery() !== null) {
            return $this->ausstelloClient->post('event', $demand->buildQuery());
        }
        return $this->ausstelloClient->get('event', $demand->buildQuery());
    }

    public function findAllEvents(): array
    {
        return $this->ausstelloClient->get('event');
    }

    public function getMetaData(): array
    {
        $meta = $this->ausstelloClient->get('meta');
        $temp = [];
        $temp['settings'] = $meta['settings'];
        unset($meta['settings']);
        foreach ($meta as $entryKey => $entry) {
            foreach ($entry as $entity) {
                $temp[$entryKey][$entity['id']] = $entity;
            }
        }
        unset($meta);
        return $temp;
    }

    public function findEvent(int $event): array
    {
        return $this->ausstelloClient->get('event/' . $event);
    }

}
