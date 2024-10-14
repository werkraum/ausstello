<?php

namespace Werkraum\Ausstello\Domain\Search;

use TYPO3\CMS\Core\Utility\GeneralUtility;

class Search
{

    protected ?string $query = null;
    protected ?string $sortBy = null;
    protected ?string $sortDirection = null;
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
    protected ?int $itemsPerPage = null;

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

    public function getItemsPerPage(): ?int
    {
        return $this->itemsPerPage;
    }

    public function setItemsPerPage(?int $itemsPerPage): void
    {
        $this->itemsPerPage = $itemsPerPage;
    }

    public function getSortBy(): ?string
    {
        return $this->sortBy;
    }

    public function setSortBy(?string $sortBy): Search
    {
        $this->sortBy = $sortBy;
        return $this;
    }

    public function getSortDirection(): ?string
    {
        return strtolower($this->sortDirection) === 'asc' ? 'ASC' : 'DESC';
    }

    public function setSortDirection(?string $sortDirection): Search
    {
        $this->sortDirection = $sortDirection;
        return $this;
    }

    public function getSorting(): ?string
    {
        if ($this->getSortBy() === null || $this->getSortBy() === '') {
            return null;
        }

        return $this->getSortBy() . ' ' . $this->getSortDirection();
    }

}
