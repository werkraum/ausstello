<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

/** @noinspection PhpUndefinedVariableInspection */
$EM_CONF[$_EXTKEY] = [
    'title' => 'ausstello',
    'description' => 'Events managen und kommunizieren, Marketing automatisieren. Einfach, ausstello.',
    'category' => 'plugin',
    'version' => '1.0.8',
    'author' => 'Lukas Niestroj',
    'author_email' => 'lukas.niestroj@werkraum.net',
    'author_company' => 'werkraum Digitalmanufaktur GmbH',
    'state' => 'stable',
    'constraints' => [
        'depends' => [
            'typo3' => '12.4.0-13.4.99',
        ],
    ],
    'autoload' => [
        'psr-4' => [
            'Werkraum\\Ausstello\\' => 'Classes/',
        ],
    ],
];
