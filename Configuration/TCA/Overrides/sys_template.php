<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

defined('TYPO3') or die;

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
    'ausstello',
    'Configuration/TypoScript',
    'ausstello - Default Template'
);

if (\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::isLoaded('seo')) {
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
        'ausstello',
        'Configuration/TypoScript/Seo',
        'ausstello - Seo'
    );
}
