<?php

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
