<?php

use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Mutation;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationCollection;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationMode;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\UriValue;
use TYPO3\CMS\Core\Type\Map;

return Map::fromEntries([
    Scope::frontend(),
    new MutationCollection(
        new Mutation(
            MutationMode::Extend,
            Directive::ScriptSrc,
            new UriValue('*.ausstello.de'),
        ),
        new Mutation(
            MutationMode::Extend,
            Directive::StyleSrc,
            new UriValue('*.ausstello.de'),
        ),
    ),
]);
