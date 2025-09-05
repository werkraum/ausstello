<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Seo;

use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Seo\XmlSitemap\AbstractXmlSitemapDataProvider;
use Werkraum\Ausstello\Domain\Repository\EventRepository;

class EventsXmlSitemapDataProvider extends AbstractXmlSitemapDataProvider
{

    // no pagination
    protected int $numberOfItemsPerPage = 99999;

    protected EventRepository $eventRepository;

    public function __construct(ServerRequestInterface $request, string $key, array $config = [], ?ContentObjectRenderer $cObj = null)
    {
        parent::__construct($request, $key, $config, $cObj);
        $this->eventRepository = GeneralUtility::makeInstance(EventRepository::class);
        $this->generateItems();
    }

    private function generateItems(): void
    {
        $items = $this->eventRepository->findAllEvents();

        foreach ($items['pager']['items'] as $item) {
            $modifiedAt = $item['modifiedAt'] ?? 0;
            $modifiedAt = date_create_from_format(\DateTimeInterface::W3C, $modifiedAt);
            $this->items[] = [
                'data' => $item,
                'lastMod' => $modifiedAt !== false ? $modifiedAt->format('U') : 0,
            ];
        }
    }

    protected function defineUrl(array $data): array
    {
        $pageId = $this->config['url']['pageId'] ?? $GLOBALS['TSFE']->id;
        $additionalParams = [];
        $additionalParams = $this->getUrlFieldParameterMap($additionalParams, $data['data']);
        $additionalParams = $this->getUrlAdditionalParams($additionalParams);
        $additionalParamsString = http_build_query(
            $additionalParams,
            '',
            '&',
            PHP_QUERY_RFC3986
        );
        $typoLinkConfig = [
            'parameter' => $pageId,
            'additionalParams' => $additionalParamsString ? '&' . $additionalParamsString : '',
            'forceAbsoluteUrl' => 1,
        ];
        $data['loc'] = $this->cObj->typoLink_URL($typoLinkConfig);
        return $data;
    }

    protected function getUrlFieldParameterMap(array $additionalParams, array $data): array
    {
        if (!empty($this->config['url']['fieldToParameterMap']) &&
            \is_array($this->config['url']['fieldToParameterMap'])) {
            foreach ($this->config['url']['fieldToParameterMap'] as $field => $urlPart) {
                $additionalParams[$urlPart] = $data[$field];
            }
        }

        return $additionalParams;
    }

    protected function getUrlAdditionalParams(array $additionalParams): array
    {
        if (!empty($this->config['url']['additionalGetParameters']) &&
            is_array($this->config['url']['additionalGetParameters'])) {
            foreach ($this->config['url']['additionalGetParameters'] as $extension => $extensionConfig) {
                foreach ($extensionConfig as $key => $value) {
                    $additionalParams[$extension . '[' . $key . ']'] = $value;
                }
            }
        }

        return $additionalParams;
    }
}
