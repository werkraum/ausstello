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
        return $this->ausstelloClient->get('event', ['itemsPerPage' => 9999]);
    }

    public function getMetaData(): array
    {
        $meta = $this->ausstelloClient->get('meta');
        $temp = [];
        $temp['settings'] = $meta['settings'];
        $temp['date'] = $meta['date'] ?? ['timezone' => 'Europe/Berlin'];
        unset($meta['settings'], $meta['date']);
        foreach ($meta as $entryKey => $entry) {
            foreach ($entry as $entity) {
                $temp[$entryKey][$entity['id']] = $entity;
            }
        }
        unset($meta);
        if (isset($temp['settings']['publish']['placeholderImages'])) {
            $temp['settings']['publish']['placeholderImages'] = array_values($temp['settings']['publish']['placeholderImages']);
        }
        return $temp;
    }

    public function findEvent(int $event): array
    {
        return $this->ausstelloClient->get('event/' . $event);
    }

    public function getRoutingInfos(): array
    {
        return $this->ausstelloClient->get('slugs');
    }

}
