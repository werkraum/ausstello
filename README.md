
# Installation

``composer req werkraum/ausstello``

## Connect TYPO3 with your ausstello Backend
### API Key
Generate your Token inside the ausstello Backend. Go to your personal settings and create a new Api Token.
### TYPO3 Extension settings
Go to your Admin Tools and select **Configure extensions**. Open _ausstello_ and provide the `auth.backendUrl` and `auth.apiToken`.

## TYPO3 Template

Include the TypoScript Template in your root page. ``ausstello - Default Template``

## TYPO3 Template - SEO

Include the TypoScript Template in your root page. ``ausstello - Seo``

## TYPO3 Plugin

Insert a new Content Record of type **General Plugin**. Select the _Selected Plugin_ **ausstello.de - All in one**.
Update the given Plugin Options to your need.

### Routing

#### Site Configuration

Include the basic routing enhancer:
```yaml
imports:
  -
    resource: 'EXT:ausstello/Configuration/Routing/Ausstello.yaml'
```
or copy and adapt:
````yaml
routeEnhancers:
  Ausstello:
    type: Extbase
    extension: Ausstello
    plugin: Event
    routes:
      -
        routePath: '/suche/'
        _controller: 'Event::list'
      -
        routePath: '/{event_name}'
        _controller: 'Event::detail'
        _arguments:
          event_name: event
    defaultController: 'Event:list'
    aspects:
      event_name:
        type: StaticEventMapper
````
