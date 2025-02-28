<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

use TYPO3\CMS\Core\Cache\Frontend\VariableFrontend;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Extbase\Utility\ExtensionUtility;
use Werkraum\Ausstello\Controller\EventController;
use Werkraum\Ausstello\Routing\Aspect\StaticEventMapper;

defined('TYPO3') or die;

ExtensionUtility::configurePlugin(
    'Ausstello',
    'Event',
    [EventController::class => 'list,detail'],
    [EventController::class => 'list,detail'],
);
ExtensionUtility::configurePlugin(
    'Ausstello',
    'Detail',
    [EventController::class => 'detail'],
    [EventController::class => 'detail'],
);
ExtensionUtility::configurePlugin(
    'Ausstello',
    'List',
    [EventController::class => 'list'],
    [EventController::class => 'list'],
);

$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['ausstello_event']
    ??= [];
$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['ausstello_event']['frontend']
    ??= VariableFrontend::class;
$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['ausstello_event']['groups']
    ??= ['pages'];
$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['ausstello_event']['options']
    ??= ['defaultLifetime' => 86400];

$GLOBALS['TYPO3_CONF_VARS']['SYS']['routing']['aspects']['StaticEventMapper']
    = StaticEventMapper::class;

$GLOBALS['TYPO3_CONF_VARS']['FE']['cacheHash']['excludedParameters'][] = '^tx_ausstello_event[search]';

if (ExtensionManagementUtility::isLoaded('seo')) {
    $GLOBALS['TYPO3_CONF_VARS']['FE']['additionalCanonicalizedUrlParameters'] = array_merge(
        $GLOBALS['TYPO3_CONF_VARS']['FE']['additionalCanonicalizedUrlParameters'] ?? [],
        [
            'tx_ausstello_event[action]',
            'tx_ausstello_event[controller]',
            'tx_ausstello_event[event]',
        ]
    );
}
