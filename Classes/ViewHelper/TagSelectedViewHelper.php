<?php

namespace Werkraum\Ausstello\ViewHelper;

use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractConditionViewHelper;

class TagSelectedViewHelper extends AbstractConditionViewHelper
{

    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('tags', 'array', true);
        $this->registerArgument('tag', 'int', 'The tag name', true);
    }

    public static function verdict(array $arguments, RenderingContextInterface $renderingContext)
    {
        return array_key_exists($arguments['tag'], array_flip($arguments['tags']));
    }
}
