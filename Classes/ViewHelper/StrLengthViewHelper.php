<?php

namespace Werkraum\Ausstello\ViewHelper;

use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

class StrLengthViewHelper extends AbstractViewHelper
{

    /**
     * @var bool
     */
    protected $escapeChildren = false;

    /**
     * @var bool
     */
    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        parent::initializeArguments();
        $this->registerArgument('subject', 'mixed', '');
    }

    public function render(): int
    {
        $subject = $this->arguments['subject'] ?? $this->renderChildren();
        return strlen($subject ?? '');
    }

    /**
     * Explicitly set argument name to be used as content.
     */
    public function getContentArgumentName(): string
    {
        return 'subject';
    }
}
