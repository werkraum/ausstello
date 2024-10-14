<?php

namespace Werkraum\Ausstello\Domain\Search;

class SearchDemand extends Search
{
    protected ?string $tagConjunction = null;
    protected ?string $locationConjunction = null;
    protected ?string $primaryCategoryConjunction = null;
    protected ?string $secondaryCategoryConjunction = null;

    public function getTagConjunction(): ?string
    {
        return $this->tagConjunction;
    }

    public function setTagConjunction(?string $tagConjunction): void
    {
        $this->tagConjunction = $tagConjunction;
    }

    public function getLocationConjunction(): ?string
    {
        return $this->locationConjunction;
    }

    public function setLocationConjunction(?string $locationConjunction): void
    {
        $this->locationConjunction = $locationConjunction;
    }

    public function getPrimaryCategoryConjunction(): ?string
    {
        return $this->primaryCategoryConjunction;
    }

    public function setPrimaryCategoryConjunction(?string $primaryCategoryConjunction): void
    {
        $this->primaryCategoryConjunction = $primaryCategoryConjunction;
    }

    public function getSecondaryCategoryConjunction(): ?string
    {
        return $this->secondaryCategoryConjunction;
    }

    public function setSecondaryCategoryConjunction(?string $secondaryCategoryConjunction): void
    {
        $this->secondaryCategoryConjunction = $secondaryCategoryConjunction;
    }

    public function buildQuery(): array
    {
        return [
            'filter' => [
                'tags' => $this->getTags(),
                'locations' => $this->getLocations(),
                'primary_category' => $this->getPrimaryCategories(),
                'secondary_category' => $this->getSecondaryCategories(),
                'tags_conjunction' => $this->getTagConjunction(),
                'locations_conjunction' => $this->getLocationConjunction(),
                'primary_category_conjunction' => $this->getPrimaryCategoryConjunction(),
                'secondary_category_conjunction' => $this->getSecondaryCategoryConjunction(),
                'startDate' => $this->getStartDate(),
                'query' => $this->getQuery(),
            ],
            'sorting' => $this->getSorting(),
            'page' => $this->getPage(),
            'itemsPerPage' => $this->getItemsPerPage(),
        ];
    }

}
