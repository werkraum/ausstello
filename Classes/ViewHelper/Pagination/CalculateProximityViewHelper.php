<?php

namespace Werkraum\Ausstello\ViewHelper\Pagination;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

class CalculateProximityViewHelper extends AbstractViewHelper
{

    public function initializeArguments(): void
    {
        $this->registerArgument('page', 'int', 'current page', true);
        $this->registerArgument('pages', 'int', 'max pages', true);
        $this->registerArgument('proximity','int', 'proximity', true);
    }

    public function render(): void
    {
        $currentPage = $this->arguments['page'];
        $pages = $this->arguments['pages'];
        $proximity = $this->arguments['proximity'];

        $startPage = $currentPage - $proximity;
        $endPage = $currentPage + $proximity;

        if ($startPage < 1) {
            $endPage = min($endPage + (1 - $startPage), $pages);
            $startPage = 1;
        }
        if ($endPage > $pages) {
            $startPage = max($startPage - ($endPage - $pages), 1);
            $endPage = $pages;
        }

        $this->renderingContext->getVariableProvider()->add('startPage', $startPage);
        $this->renderingContext->getVariableProvider()->add('endPage', $endPage);
        $this->renderingContext->getVariableProvider()->add('range', range($startPage, $endPage));
    }
}
