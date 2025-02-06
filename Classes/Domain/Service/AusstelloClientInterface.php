<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Domain\Service;

interface AusstelloClientInterface
{
    public function get(string $path, array $query = [], array $additionalOptions = []): array;

    public function post(string $path, array $data, array $additionalOptions = []): array;
}
