<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Domain\Service;

use TYPO3\CMS\Core\Configuration\ExtensionConfiguration;
use TYPO3\CMS\Core\Http\RequestFactory;
use TYPO3\CMS\Core\Utility\HttpUtility;

class AusstelloClient implements AusstelloClientInterface
{

    public const API_VERSION = 'v1';

    public function __construct(
        private readonly RequestFactory $requestFactory,
        private readonly ExtensionConfiguration $extensionConfiguration,
    ) {
    }

    public function get(string $path, array $query = [], array $additionalOptions = []): array
    {
        if (!empty($query)) {
            $additionalOptions['query'] = $query;
        }
        return $this->request($path, 'GET', $additionalOptions);
    }

    public function post(string $path, array $data, array $additionalOptions = []): array
    {
        if (!empty($data)) {
            $additionalOptions['form_params'] = $data;
        }
        return $this->request($path, 'POST', $additionalOptions);
    }

    private function request(string $path, string $method = 'GET', array $additionalOptions = []): array
    {
        $token = $this->extensionConfiguration->get('ausstello', 'apiToken');
        $backendUrl = $this->extensionConfiguration->get('ausstello', 'backendUrl');

        if (empty($token)) {
            throw new \RuntimeException('API token not configured');
        }
        if (empty($backendUrl)) {
            throw new \RuntimeException('Backend URL not configured');
        }

        $backendUrl = parse_url($backendUrl);

        if (!is_array($backendUrl)) {
            throw new \RuntimeException('Could not parse backend URL');
        }

        $url = HttpUtility::buildUrl($backendUrl + [
            'path' => "/api/" . self::API_VERSION . "/$path",
            'scheme' => 'https',
        ]);

        // Additional headers for this specific request
        // See: https://docs.guzzlephp.org/en/stable/request-options.html
        $additionalOptions = [
            'headers' => [
                'Cache-Control' => 'no-cache',
                'x-api-token' => $token,
            ],
            'allow_redirects' => true,
            'verify' => false,
            'timeout' => 15,
        ] + $additionalOptions;

        // Get a PSR-7-compliant response object
        $response = $this->requestFactory->request(
            $url,
            $method,
            $additionalOptions,
        );

        if ($response->getStatusCode() !== 200) {
            throw new \RuntimeException(
                'Returned status code is ' . $response->getStatusCode(),
            );
        }

        if ($response->getHeaderLine('Content-Type') !== 'application/json') {
            throw new \RuntimeException(
                'The request did not return JSON data',
            );
        }
        // Get the content as a string on a successful request
        $content = $response->getBody()->getContents();
        $result = json_decode($content, true, flags: JSON_THROW_ON_ERROR);

        return $result;
    }

}
