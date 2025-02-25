<?php


/*
 * This file is part of TYPO3 CMS-based extension "ausstello" by werkraum.
 *
 * It is free software; you can redistribute it and/or modify it under
 *  the terms of the GNU General Public License, either version 2
 *  of the License, or any later version.
 */

namespace Werkraum\Ausstello\ViewHelper\Remote\Uri;

use Psr\Http\Message\RequestInterface;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Imaging\ImageManipulation\CropVariantCollection;
use TYPO3\CMS\Core\Resource\Exception\ResourceDoesNotExistException;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Service\ImageService;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContext;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractTagBasedViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\Exception;
use Werkraum\Ausstello\ViewHelper\Remote\DownloadFailedException;

class ImageViewHelper extends AbstractViewHelper
{

    protected ImageService $imageService;

    public function __construct()
    {
        $this->imageService = GeneralUtility::makeInstance(ImageService::class);
    }

    public function initializeArguments(): void
    {
        $this->registerArgument('src', 'string', 'a path to a file, a combined FAL identifier or an uid (int). If $treatIdAsReference is set, the integer is considered the uid of the sys_file_reference record. If you already got a FAL object, consider using the $image parameter instead', false, '');
        $this->registerArgument('crop', 'string|bool|array', 'overrule cropping of image (setting to FALSE disables the cropping set in FileReference)');
        $this->registerArgument('cropVariant', 'string', 'select a cropping variant, in case multiple croppings have been specified or stored in FileReference', false, 'default');
        $this->registerArgument('fileExtension', 'string', 'Custom file extension to use');

        $this->registerArgument('width', 'string', 'width of the image. This can be a numeric value representing the fixed width of the image in pixels. But you can also perform simple calculations by adding "m" or "c" to the value. See imgResource.width for possible options.');
        $this->registerArgument('height', 'string', 'height of the image. This can be a numeric value representing the fixed height of the image in pixels. But you can also perform simple calculations by adding "m" or "c" to the value. See imgResource.width for possible options.');
        $this->registerArgument('minWidth', 'int', 'minimum width of the image');
        $this->registerArgument('minHeight', 'int', 'minimum height of the image');
        $this->registerArgument('maxWidth', 'int', 'maximum width of the image');
        $this->registerArgument('maxHeight', 'int', 'maximum height of the image');
        $this->registerArgument('absolute', 'bool', 'Force absolute URL', false, false);
    }

    /**
     * Resizes a given image (if required) and renders the respective img tag.
     *
     * @see https://docs.typo3.org/typo3cms/TyposcriptReference/ContentObjects/Image/
     * @throws Exception
     */
    public function render(): string
    {
        $src = (string)$this->arguments['src'];
        if ($src === '' ) {
            throw new Exception($this->getExceptionMessage('You must specify a string src.'), 1729231103584);
        }

        if ((string)$this->arguments['fileExtension'] && !GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'], (string)$this->arguments['fileExtension'])) {
            throw new Exception(
                $this->getExceptionMessage(
                    'The extension ' . $this->arguments['fileExtension'] . ' is not specified in $GLOBALS[\'TYPO3_CONF_VARS\'][\'GFX\'][\'imagefile_ext\']'
                    . ' as a valid image file extension and can not be processed.',
                ),
                1618989190
            );
        }

        try {
            // download the remote file first
            $src = $this->download($src);

            $image = $this->imageService->getImage($src, null, false);
            $cropString = $this->arguments['crop'];
            if ($cropString === null && $image->hasProperty('crop') && $image->getProperty('crop')) {
                $cropString = $image->getProperty('crop');
            }

            // CropVariantCollection needs a string, but this VH could also receive an array
            if (is_array($cropString)) {
                $cropString = json_encode($cropString);
            }

            $cropVariantCollection = CropVariantCollection::create((string)$cropString);
            $cropVariant = $this->arguments['cropVariant'] ?: 'default';
            $cropArea = $cropVariantCollection->getCropArea($cropVariant);
            $processingInstructions = [
                'width' => $this->arguments['width'],
                'height' => $this->arguments['height'],
                'minWidth' => $this->arguments['minWidth'],
                'minHeight' => $this->arguments['minHeight'],
                'maxWidth' => $this->arguments['maxWidth'],
                'maxHeight' => $this->arguments['maxHeight'],
                'crop' => $cropArea->isEmpty() ? null : $cropArea->makeAbsoluteBasedOnFile($image),
            ];
            if (!empty($this->arguments['fileExtension'] ?? '')) {
                $processingInstructions['fileExtension'] = $this->arguments['fileExtension'];
            }
            $processedImage = $this->imageService->applyProcessingInstructions($image, $processingInstructions);
            $imageUri = $this->imageService->getImageUri($processedImage, $this->arguments['absolute']);

            return $imageUri;
        } catch (ResourceDoesNotExistException $e) {
            // thrown if file does not exist
            throw new Exception($this->getExceptionMessage($e->getMessage()), 1509741911, $e);
        } catch (\UnexpectedValueException $e) {
            // thrown if a file has been replaced with a folder
            throw new Exception($this->getExceptionMessage($e->getMessage()), 1509741912, $e);
        } catch (\InvalidArgumentException $e) {
            // thrown if file storage does not exist
            throw new Exception($this->getExceptionMessage($e->getMessage()), 1509741914, $e);
        } catch (DownloadFailedException $exception) {
            return "";
        }

        return $src;
    }

    protected function getExceptionMessage(string $detailedMessage): string
    {
        /** @var RenderingContext $renderingContext */
        $renderingContext = $this->renderingContext;
        $request = $renderingContext->getRequest();
        if ($request instanceof RequestInterface) {
            $currentContentObject = $request->getAttribute('currentContentObject');
            if ($currentContentObject instanceof ContentObjectRenderer) {
                return sprintf('Unable to render image tag in "%s": %s', $currentContentObject->currentRecord, $detailedMessage);
            }
        }
        return "Unable to render image tag: $detailedMessage";
    }

    protected function download(string $src): string
    {
        $fileName = basename($src);
        $extension = substr(strrchr($fileName, "."), 1);
        $hashName = sha1($src) . '.' . $extension;

        $temporaryFileName = $this->getTempFolderPath() . $hashName;
        if (!file_exists($temporaryFileName)) {
            $previewImage = GeneralUtility::getUrl($src);
            if ($previewImage === false) {
                throw new DownloadFailedException('Could not read url', 1738915099578);
            }
            $success = file_put_contents($temporaryFileName, $previewImage);
            if ($success === false) {
                throw new DownloadFailedException('Could not save image', 1738915129835);
            }
            GeneralUtility::fixPermissions($temporaryFileName);
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
