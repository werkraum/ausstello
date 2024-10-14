<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'ausstello',
    'description' => 'TODO',
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
