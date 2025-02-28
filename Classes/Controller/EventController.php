<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Controller;

use GuzzleHttp\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Error\Http\PageNotFoundException;
use TYPO3\CMS\Core\Http\ImmediateResponseException;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Http\ForwardResponse;
use TYPO3\CMS\Extbase\Mvc\Controller\ActionController;
use TYPO3\CMS\Frontend\Controller\ErrorController;
use Werkraum\Ausstello\Domain\Repository\EventRepository;
use Werkraum\Ausstello\Domain\Search\Search;
use Werkraum\Ausstello\Domain\Search\SearchDemand;
use Werkraum\Ausstello\Seo\EventTitleProvider;
use Werkraum\Ausstello\Seo\JsonSchema;

class EventController extends ActionController
{

    public function __construct(
        private readonly EventRepository $eventRepository,
        private readonly EventTitleProvider $eventTitleProvider
    ) {
    }

    public function initializeListAction()
    {
        $this->arguments->getArgument('search')
            ->getPropertyMappingConfiguration()
            ->allowAllProperties();
    }

    public function listAction(?Search $search = null): ResponseInterface
    {
        $search ??= new Search;

        if ($search->getPage() === null) {
            $search->setPage((int)($this->request->getQueryParams()['page'] ?? 1));
        }

        $meta = $this->eventRepository->getMetaData();
        $this->setDateTimezone($meta['date']['timezone'] ?? 'Europe/Berlin');

        $demand = $this->buildSearchDemandFromSettings($this->settings);
        $demand = $this->extendDemandBySearch($demand, $search);

        $events = $this->eventRepository->findByDemand($demand);
        if (array_key_exists('total_pages', $events['pager']['pagination'])) {
            $events['pager']['pagination']['total_pages'] = array_fill(0, (int) $events['pager']['pagination']['total_pages'], '');
        }
        $this->view->assign('events', $events);
        $this->view->assign('meta', $meta);
        $this->view->assign('search', $search);
        $this->view->assign('displayType', $this->displayType());
        return $this->htmlResponse();
    }

    /**
     * @throws PageNotFoundException
     * @throws ImmediateResponseException
     */
    public function detailAction(?int $event = null): ResponseInterface
    {
        if (($this->settings['templateType'] ?? '') === "teaser") {
            return new ForwardResponse('list');
        }
        if ($event === null) {
            $this->eventNotFound();
        }
        if (empty($GLOBALS['EXT']['ausstello']['alreadyDisplayed'])) {
            $GLOBALS['EXT']['ausstello']['alreadyDisplayed'] = [];
        }

        if (array_key_exists($event, $GLOBALS['EXT']['ausstello']['alreadyDisplayed'])) {
            return new Response(200);
        }

        $GLOBALS['EXT']['ausstello']['alreadyDisplayed'][$event] = $event;

        $data =  $this->eventRepository->findEvent($event);
        if (empty($data)) {
            $this->eventNotFound();
        }

        $meta = $this->eventRepository->getMetaData();
        $this->setDateTimezone($meta['date']['timezone'] ?? 'Europe/Berlin');
        $this->eventTitleProvider->setTitle($data['title']);
        $this->generateJsonSchema($data, $meta);

        $this->view->assign('event', $data);
        $this->view->assign('meta', $meta);
        return $this->htmlResponse();
    }

    /**
     * @throws PageNotFoundException
     * @throws ImmediateResponseException
     */
    private function eventNotFound(): void
    {
        $response = (GeneralUtility::makeInstance(ErrorController::class))
            ->pageNotFoundAction($this->request, 'Event not found', []);
        throw new ImmediateResponseException($response);
    }

    private function generateJsonSchema(array $event, array $meta): void
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'Event',
            'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
            'name' => $event['title'],
            'description' => strip_tags($event['abstract']),
        ];
        if ($start = $event['startDate']) {
            $data['startDate'] = date_create_from_format(\DateTimeInterface::W3C, $start)->format('Y-m-d');
        }
        if ($startTime = $event['startTime']) {
            $data['startDate'] .= date_create_from_format(\DateTimeInterface::W3C, $startTime)->format('\TH:i:s');
        }
        if ($end = $event['endDate']) {
            $data['endDate'] = date_create_from_format(\DateTimeInterface::W3C, $end)->format('Y-m-d');;
        }
        if ($endTime = $event['endTime']) {
            $data['endDate'] .= date_create_from_format(\DateTimeInterface::W3C, $endTime)->format('\TH:i:s');
        }
        if ($images = $event['images']) {
            $data['image'] = \array_map(static function ($image) {
                return $image['file']['publicUrl'];
            }, $images);
        }
        if ($place = $event['location'][0]) {
            $location = array_filter($meta['locations'], static function ($location) use ($place) {
                return $location['id'] === $place;
            })[0] ?? null;
            $data['location'] = [
                '@type' => 'Place',
                'name' => $location['name'] ?? '',
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $location['address'] ?? '',
                    'addressLocality' => $location['city'] ?? '',
                    'addressCountry' => $location['country'] ?? '',
                    'postalCode' => $location['zip'] ?? '',
                ]
            ];
        }

        $data['eventStatus'] = 'https://schema.org/EventScheduled';

        JsonSchema::addSchemaToPage($data);
    }

    private function buildSearchDemandFromSettings(array $settings): SearchDemand
    {
        $demand = new SearchDemand();

        $demand->setTags($settings['query']['tag'] ?? null);
        $demand->setLocations($settings['query']['location'] ?? null);
        $demand->setPrimaryCategories($settings['query']['primaryCategory'] ?? null);
        $demand->setSecondaryCategories($settings['query']['secondaryCategory'] ?? null);

        $demand->setTagConjunction($settings['query']['tagConjunction'] ?? "");
        $demand->setLocationConjunction($settings['query']['locationConjunction'] ?? "");
        $demand->setPrimaryCategoryConjunction($settings['query']['primaryCategoryConjunction'] ?? "");
        $demand->setSecondaryCategoryConjunction($settings['query']['secondaryCategoryConjunction'] ?? "");

        $demand->setItemsPerPage($settings['pagination']['itemsPerPage'] ?? "");
        return $demand;
    }

    private function extendDemandBySearch(SearchDemand $demand, Search $search): SearchDemand
    {
        if (($this->settings['disableFrontendFilter'] ?? null) !== '1') {
            $demand->setPage($search->getPage());
            $demand->setQuery($search->getQuery());
            $demand->setStartDate($search->getStartDate());
            if (!empty($search->getTags())) {
                $demand->setTags($search->getTags());
            }
            if (!empty($search->getLocations())) {
                $demand->setLocations($search->getLocations());
            }
            if (!empty($search->getPrimaryCategories())) {
                $demand->setPrimaryCategories($search->getPrimaryCategories());
            }
            if (!empty($search->getSecondaryCategories())) {
                $demand->setSecondaryCategories($search->getSecondaryCategories());
            }
        }
        return $demand;
    }

    private function displayType(): string
    {
        $hasBackendFilters = !(empty($this->settings['query']['tag'])
            && empty($this->settings['query']['location'])
            && empty($this->settings['query']['primaryCategory'])
            && empty($this->settings['query']['secondaryCategory']));
        $templateType = $this->settings['templateType'] ?? 'list';
        if ($templateType === "") {
            $templateType = "list";
        }

        if ($templateType === 'list') {
            if ($hasBackendFilters) {
                return 'listWithQuery';
            }
            return 'list';
        }
        return 'teaser';
    }

    private function setDateTimezone(string $timezone): void
    {
        $system = date_default_timezone_get();
        if ($system !== $timezone) {
            date_default_timezone_set($timezone);
        }
    }
}
