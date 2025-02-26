<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Routing\Aspect;

use TYPO3\CMS\Core\Cache\CacheManager;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use Werkraum\Ausstello\Domain\Repository\EventRepository;

class StaticEventMapper implements \TYPO3\CMS\Core\Routing\Aspect\StaticMappableAspectInterface, \Countable
{

    private EventRepository $eventRepository;

    private static $cache = null;

    public function count(): int
    {
        return count($this->eventRepository->findAllEvents());
    }

    public function __construct(
        private array $settings,
    ) {
        $this->eventRepository = GeneralUtility::makeInstance(EventRepository::class);
    }

    /** $value is the ID of the event, we respond with a slug */
    public function generate(string $value): ?string
    {
        $values = $this->buildValues();
        if (!array_key_exists($value, $values)) {
            GeneralUtility::makeInstance(CacheManager::class)
                ?->getCache('ausstello_event')
                ?->flush();
            self::$cache = null;
            $values = $this->buildValues();
        }
        return $values[$value] ?? null;
    }

    /** $value is the slug of the event, we respond with an ID */
    public function resolve(string $value): ?string
    {
        $values = $this->buildValues();
        $values = array_flip($values);
        if (!array_key_exists($value, $values)) {
            GeneralUtility::makeInstance(CacheManager::class)
                ?->getCache('ausstello_event')
                ?->flush();
            self::$cache = null;
            $values = $this->buildValues();
            $values = array_flip($values);
        }
        return $values[$value] ?? null;
    }

    private function buildValues(): array
    {
        if (self::$cache === null) {
            $events = $this->eventRepository->findAllEvents();
            $values = [];
            foreach ($events['pager']['items'] as $event) {
                $values[$event['id']] = $event['slug'];
            }
            self::$cache = $values;
        }

        return self::$cache;
    }

}
