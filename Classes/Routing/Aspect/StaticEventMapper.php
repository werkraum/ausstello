<?php

namespace Werkraum\Ausstello\Routing\Aspect;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use Werkraum\Ausstello\Domain\Repository\EventRepository;

class StaticEventMapper implements \TYPO3\CMS\Core\Routing\Aspect\StaticMappableAspectInterface, \Countable
{

    private EventRepository $eventRepository;

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
        return $values[$value] ?? null;
    }

    /** $value is the slug of the event, we respond with an ID */
    public function resolve(string $value): ?string
    {
        $values = $this->buildValues();
        $values = array_flip($values);
        return $values[$value] ?? null;
    }

    private function buildValues(): array
    {
        $events = $this->eventRepository->findAllEvents();
        $values = [];
        foreach ($events['pager']['items'] as $event) {
            $values[$event['id']] = $event['slug'];
        }
        return $values;
    }

}
