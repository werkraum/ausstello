<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

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
        $this->populateItems($params, 'filter_tags');
    }

}
