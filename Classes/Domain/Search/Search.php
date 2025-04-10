<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Domain\Search;

use TYPO3\CMS\Core\Utility\GeneralUtility;

class Search
{

    protected ?string $query = null;
    protected ?string $startDate = null;

    /** @var array|null */
    protected ?array $locations = null;
    /** @var array|null */
    protected ?array $primaryCategories = null;
    /** @var array|null */
    protected ?array $secondaryCategories = null;
    /** @var array|null */
    protected ?array $tags = null;

    protected ?int $page = null;

    public function getQuery(): ?string
    {
        return $this->query;
    }

    public function setQuery(?string $query): void
    {
        $this->query = $query;
    }

    public function getStartDate(): ?string
    {
        return $this->startDate;
    }

    public function setStartDate(?string $startDate): void
    {
        $this->startDate = $startDate;
    }

    public function getTags(): array
    {
        return $this->tags ?? [];
    }

    /**
     * @param array
     * @phpstan-var array|string|null
     * @return void
     */
    public function setTags(array|string|null $tags): void
    {
        if (!is_array($tags) && !is_null($tags)) {
            $tags = GeneralUtility::intExplode(',', $tags);
        }
        $this->tags = $tags;
    }

    /**
     * Gets the locations property.
     *
     * @return array|null
     */
    public function getLocations(): ?array
    {
        return $this->locations;
    }

    /**
     * @param array
     * @phpstan-var array|string|null
     * @return void
     */
    public function setLocations(array|string|null $locations): void
    {
        if (!is_array($locations) && !is_null($locations)) {
            $locations = GeneralUtility::intExplode(',', $locations);
        }
        $this->locations = $locations;
    }

    public function getPrimaryCategories(): array
    {
        return $this->primaryCategories ?? [];
    }

    /**
     * @param array
     * @phpstan-var array|string|null
     * @return void
     */
    public function setPrimaryCategories(array|string|null $primaryCategories): void
    {
        if (!is_array($primaryCategories) && !is_null($primaryCategories)) {
            $primaryCategories = GeneralUtility::intExplode(',', $primaryCategories);
        }
        $this->primaryCategories = $primaryCategories;
    }

    public function getSecondaryCategories(): array
    {
        return $this->secondaryCategories ?? [];
    }

    /**
     * @param array
     * @phpstan-var array|string|null
     * @return void
     */
    public function setSecondaryCategories(array|string|null $secondaryCategories): void
    {
        if (!is_array($secondaryCategories) && !is_null($secondaryCategories)) {
            $secondaryCategories = GeneralUtility::intExplode(',', $secondaryCategories);
        }
        $this->secondaryCategories = $secondaryCategories;
    }

    public function getPage(): ?int
    {
        return $this->page;
    }

    public function setPage(?int $page): void
    {
        $this->page = $page;
    }

}
