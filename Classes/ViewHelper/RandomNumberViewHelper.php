<?php

namespace Werkraum\Ausstello\ViewHelper;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

class RandomNumberViewHelper extends AbstractViewHelper
{

    public function initializeArguments(): void
    {
        $this->registerArgument('min', 'int', 'Minimum amount', true);
        $this->registerArgument('max', 'int', 'Maximum amount', true);
    }

    public function render(): int
    {
        if ($this->arguments['min'] > $this->arguments['max']) {
            return $this->arguments['min'];
        }
        return random_int($this->arguments['min'], $this->arguments['max']);
    }
}
