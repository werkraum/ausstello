<?php

namespace Werkraum\Ausstello\Seo;

use TYPO3\CMS\Core\PageTitle\AbstractPageTitleProvider;

class EventTitleProvider extends AbstractPageTitleProvider
{

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

}
