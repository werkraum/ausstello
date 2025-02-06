<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

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
