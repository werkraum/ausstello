<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\ViewHelper\Remote;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;

class IconViewHelper extends AbstractViewHelper
{

    protected $escapeOutput = false;

    public function initializeArguments(): void
    {
        $this->registerArgument('icon', 'array', 'the icon data', true);
        $this->registerArgument('class', 'string', 'CSS class(es) for this element');
        $this->registerArgument('width', 'string', 'width attribute');
        $this->registerArgument('height', 'string', 'height attribute');
        $this->registerArgument('style', 'string', 'style attribute');
    }

    public function render(): string
    {
        $icon = $this->arguments['icon'];
        if (is_array($icon) && (isset($icon['image']) || array_key_exists('image', $icon))) {
            $src = $icon['image'];
            $file = $this->download($src);
            if (!str_ends_with($file, '.svg')) {
                // we only support svg
                return '';
            }
            $xml = simplexml_load_string(file_get_contents($file));

            $xmlAttributes = $xml->attributes();
            foreach (['class', 'width', 'height', 'style'] as $argument) {
                if (array_key_exists($argument, $this->arguments)) {
                    if (isset($xmlAttributes->$argument)) {
                        $xmlAttributes->$argument = $this->arguments[$argument];
                    } else {
                        $xmlAttributes->addAttribute($argument, $this->arguments[$argument]);
                    }
                }
            }

            return $xml->asXML();
        }
        return '';
    }

    protected function download(string $src): string
    {
        $fileName = basename($src);
        $extension = substr(strrchr($fileName, "."), 1);
        $hashName = sha1($src) . '.' . $extension;

        $temporaryFileName = $this->getTempFolderPath() . $hashName;
        if (!file_exists($temporaryFileName)) {
            $previewImage = GeneralUtility::getUrl($src);
            if ($previewImage !== false) {
                file_put_contents($temporaryFileName, $previewImage);
                GeneralUtility::fixPermissions($temporaryFileName);
            }
        }
        return $temporaryFileName;
    }

    protected function getTempFolderPath(): string
    {
        $path = Environment::getPublicPath() . '/typo3temp/assets/ausstello/';
        if (!is_dir($path)) {
            GeneralUtility::mkdir_deep($path);
        }
        return $path;
    }
}
