<?php

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
