<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\Seo;

use TYPO3\CMS\Core\PageTitle\AbstractPageTitleProvider;

class EventTitleProvider extends AbstractPageTitleProvider
{

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

}
