<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Seo;

use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class JsonSchema
{

    public static function addSchemaToPage(array $schema): void
    {
        try {
            GeneralUtility::makeInstance(PageRenderer::class)
                ->addFooterData("<script type='application/ld+json'>" . json_encode($schema, \JSON_THROW_ON_ERROR) . '</script>');
        } catch (\Exception $exception) {
            // do nothing
        }

    }

}
