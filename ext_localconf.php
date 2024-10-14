<?php

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

$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['ausstello_event']
    ??= [];
$GLOBALS['TYPO3_CONF_VARS']['SYS']['caching']['cacheConfigurations']['ausstello_event']['frontend']
    ??= VariableFrontend::class;

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
