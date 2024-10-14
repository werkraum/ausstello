<?php

namespace Werkraum\Ausstello\TCA;

use Werkraum\Ausstello\Domain\Service\AusstelloClientInterface;

class EventFilterValueProvider
{

    public function __construct(
        protected AusstelloClientInterface $ausstello
    ) {
    }

    private function populateItems(array &$params, string $metaKey, string $labelKey = 'name', string $valueKey = 'id'): void
    {
        $meta = $this->ausstello->get('meta');
        $data = $meta[$metaKey] ?? [];
        $params['items'][] = ['label' => '---', 'value' => ''];
        foreach ($data as $entry) {
            $params['items'][] = ['label' => $entry[$labelKey], 'value' => $entry[$valueKey]];
        }
    }

    public function getLocations(array &$params): void
    {
        $this->populateItems($params, 'locations');
    }

    public function getPrimaryCategory(array &$params): void
    {
        $this->populateItems($params, 'primary_categories');
    }

    public function getSecondaryCategory(array &$params): void
    {
        $this->populateItems($params, 'secondary_categories');
    }

    public function getTags(array &$params): void
    {
        $this->populateItems($params, 'tags');
    }

}
