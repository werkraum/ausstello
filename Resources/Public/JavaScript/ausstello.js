/**
 * SSR Window 4.0.2
 * Better handling for window object in SSR environment
 * https://github.com/nolimits4web/ssr-window
 *
 * Copyright 2021, Vladimir Kharlampidi
 *
 * Licensed under MIT
 *
 * Released on: December 13, 2021
 */
/* eslint-disable no-param-reassign */
function isObject$1(obj) {
  return obj !== null && typeof obj === 'object' && 'constructor' in obj && obj.constructor === Object;
}
function extend$1(target, src) {
  if (target === void 0) {
    target = {};
  }
  if (src === void 0) {
    src = {};
  }
  Object.keys(src).forEach(key => {
    if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject$1(src[key]) && isObject$1(target[key]) && Object.keys(src[key]).length > 0) {
      extend$1(target[key], src[key]);
    }
  });
}
const ssrDocument = {
  body: {},
  addEventListener() {},
  removeEventListener() {},
  activeElement: {
    blur() {},
    nodeName: ''
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  getElementById() {
    return null;
  },
  createEvent() {
    return {
      initEvent() {}
    };
  },
  createElement() {
    return {
      children: [],
      childNodes: [],
      style: {},
      setAttribute() {},
      getElementsByTagName() {
        return [];
      }
    };
  },
  createElementNS() {
    return {};
  },
  importNode() {
    return null;
  },
  location: {
    hash: '',
    host: '',
    hostname: '',
    href: '',
    origin: '',
    pathname: '',
    protocol: '',
    search: ''
  }
};
function getDocument() {
  const doc = typeof document !== 'undefined' ? document : {};
  extend$1(doc, ssrDocument);
  return doc;
}
const ssrWindow = {
  document: ssrDocument,
  navigator: {
    userAgent: ''
  },
  location: {
    hash: '',
    host: '',
    hostname: '',
    href: '',
    origin: '',
    pathname: '',
    protocol: '',
    search: ''
  },
  history: {
    replaceState() {},
    pushState() {},
    go() {},
    back() {}
  },
  CustomEvent: function CustomEvent() {
    return this;
  },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle() {
    return {
      getPropertyValue() {
        return '';
      }
    };
  },
  Image() {},
  Date() {},
  screen: {},
  setTimeout() {},
  clearTimeout() {},
  matchMedia() {
    return {};
  },
  requestAnimationFrame(callback) {
    if (typeof setTimeout === 'undefined') {
      callback();
      return null;
    }
    return setTimeout(callback, 0);
  },
  cancelAnimationFrame(id) {
    if (typeof setTimeout === 'undefined') {
      return;
    }
    clearTimeout(id);
  }
};
function getWindow() {
  const win = typeof window !== 'undefined' ? window : {};
  extend$1(win, ssrWindow);
  return win;
}function classesToTokens(classes) {
  if (classes === void 0) {
    classes = '';
  }
  return classes.trim().split(' ').filter(c => !!c.trim());
}
function deleteProps(obj) {
  const object = obj;
  Object.keys(object).forEach(key => {
    try {
      object[key] = null;
    } catch (e) {
      // no getter for object
    }
    try {
      delete object[key];
    } catch (e) {
      // something got wrong
    }
  });
}
function nextTick(callback, delay) {
  if (delay === void 0) {
    delay = 0;
  }
  return setTimeout(callback, delay);
}
function now() {
  return Date.now();
}
function getComputedStyle$1(el) {
  const window = getWindow();
  let style;
  if (window.getComputedStyle) {
    style = window.getComputedStyle(el, null);
  }
  if (!style && el.currentStyle) {
    style = el.currentStyle;
  }
  if (!style) {
    style = el.style;
  }
  return style;
}
function getTranslate(el, axis) {
  if (axis === void 0) {
    axis = 'x';
  }
  const window = getWindow();
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = getComputedStyle$1(el);
  if (window.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;
    if (curTransform.split(',').length > 6) {
      curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
    }
    // Some old versions of Webkit choke when 'none' is passed; pass
    // empty string instead in this case
    transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
    matrix = transformMatrix.toString().split(',');
  }
  if (axis === 'x') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
    // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
    // Normal Browsers
    else curTransform = parseFloat(matrix[4]);
  }
  if (axis === 'y') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
    // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
    // Normal Browsers
    else curTransform = parseFloat(matrix[5]);
  }
  return curTransform || 0;
}
function isObject(o) {
  return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
}
function isNode(node) {
  // eslint-disable-next-line
  if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
    return node instanceof HTMLElement;
  }
  return node && (node.nodeType === 1 || node.nodeType === 11);
}
function extend() {
  const to = Object(arguments.length <= 0 ? undefined : arguments[0]);
  const noExtend = ['__proto__', 'constructor', 'prototype'];
  for (let i = 1; i < arguments.length; i += 1) {
    const nextSource = i < 0 || arguments.length <= i ? undefined : arguments[i];
    if (nextSource !== undefined && nextSource !== null && !isNode(nextSource)) {
      const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);
      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
        const nextKey = keysArray[nextIndex];
        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        if (desc !== undefined && desc.enumerable) {
          if (isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else if (!isObject(to[nextKey]) && isObject(nextSource[nextKey])) {
            to[nextKey] = {};
            if (nextSource[nextKey].__swiper__) {
              to[nextKey] = nextSource[nextKey];
            } else {
              extend(to[nextKey], nextSource[nextKey]);
            }
          } else {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
  }
  return to;
}
function setCSSProperty(el, varName, varValue) {
  el.style.setProperty(varName, varValue);
}
function animateCSSModeScroll(_ref) {
  let {
    swiper,
    targetPosition,
    side
  } = _ref;
  const window = getWindow();
  const startPosition = -swiper.translate;
  let startTime = null;
  let time;
  const duration = swiper.params.speed;
  swiper.wrapperEl.style.scrollSnapType = 'none';
  window.cancelAnimationFrame(swiper.cssModeFrameID);
  const dir = targetPosition > startPosition ? 'next' : 'prev';
  const isOutOfBound = (current, target) => {
    return dir === 'next' && current >= target || dir === 'prev' && current <= target;
  };
  const animate = () => {
    time = new Date().getTime();
    if (startTime === null) {
      startTime = time;
    }
    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
    if (isOutOfBound(currentPosition, targetPosition)) {
      currentPosition = targetPosition;
    }
    swiper.wrapperEl.scrollTo({
      [side]: currentPosition
    });
    if (isOutOfBound(currentPosition, targetPosition)) {
      swiper.wrapperEl.style.overflow = 'hidden';
      swiper.wrapperEl.style.scrollSnapType = '';
      setTimeout(() => {
        swiper.wrapperEl.style.overflow = '';
        swiper.wrapperEl.scrollTo({
          [side]: currentPosition
        });
      });
      window.cancelAnimationFrame(swiper.cssModeFrameID);
      return;
    }
    swiper.cssModeFrameID = window.requestAnimationFrame(animate);
  };
  animate();
}
function elementChildren(element, selector) {
  if (selector === void 0) {
    selector = '';
  }
  const children = [...element.children];
  if (element instanceof HTMLSlotElement) {
    children.push(...element.assignedElements());
  }
  if (!selector) {
    return children;
  }
  return children.filter(el => el.matches(selector));
}
function elementIsChildOf(el, parent) {
  const isChild = parent.contains(el);
  if (!isChild && parent instanceof HTMLSlotElement) {
    const children = [...parent.assignedElements()];
    return children.includes(el);
  }
  return isChild;
}
function showWarning(text) {
  try {
    console.warn(text);
    return;
  } catch (err) {
    // err
  }
}
function createElement(tag, classes) {
  if (classes === void 0) {
    classes = [];
  }
  const el = document.createElement(tag);
  el.classList.add(...(Array.isArray(classes) ? classes : classesToTokens(classes)));
  return el;
}
function elementPrevAll(el, selector) {
  const prevEls = [];
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling; // eslint-disable-line
    if (selector) {
      if (prev.matches(selector)) prevEls.push(prev);
    } else prevEls.push(prev);
    el = prev;
  }
  return prevEls;
}
function elementNextAll(el, selector) {
  const nextEls = [];
  while (el.nextElementSibling) {
    const next = el.nextElementSibling; // eslint-disable-line
    if (selector) {
      if (next.matches(selector)) nextEls.push(next);
    } else nextEls.push(next);
    el = next;
  }
  return nextEls;
}
function elementStyle(el, prop) {
  const window = getWindow();
  return window.getComputedStyle(el, null).getPropertyValue(prop);
}
function elementIndex(el) {
  let child = el;
  let i;
  if (child) {
    i = 0;
    // eslint-disable-next-line
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }
    return i;
  }
  return undefined;
}
function elementParents(el, selector) {
  const parents = []; // eslint-disable-line
  let parent = el.parentElement; // eslint-disable-line
  while (parent) {
    if (selector) {
      if (parent.matches(selector)) parents.push(parent);
    } else {
      parents.push(parent);
    }
    parent = parent.parentElement;
  }
  return parents;
}
function elementOuterSize(el, size, includeMargins) {
  const window = getWindow();
  {
    return el[size === 'width' ? 'offsetWidth' : 'offsetHeight'] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === 'width' ? 'margin-right' : 'margin-top')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === 'width' ? 'margin-left' : 'margin-bottom'));
  }
}
function makeElementsArray(el) {
  return (Array.isArray(el) ? el : [el]).filter(e => !!e);
}let support;
function calcSupport() {
  const window = getWindow();
  const document = getDocument();
  return {
    smoothScroll: document.documentElement && document.documentElement.style && 'scrollBehavior' in document.documentElement.style,
    touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch)
  };
}
function getSupport() {
  if (!support) {
    support = calcSupport();
  }
  return support;
}
let deviceCached;
function calcDevice(_temp) {
  let {
    userAgent
  } = _temp === void 0 ? {} : _temp;
  const support = getSupport();
  const window = getWindow();
  const platform = window.navigator.platform;
  const ua = userAgent || window.navigator.userAgent;
  const device = {
    ios: false,
    android: false
  };
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const windows = platform === 'Win32';
  let macos = platform === 'MacIntel';

  // iPadOs 13 fix
  const iPadScreens = ['1024x1366', '1366x1024', '834x1194', '1194x834', '834x1112', '1112x834', '768x1024', '1024x768', '820x1180', '1180x820', '810x1080', '1080x810'];
  if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    if (!ipad) ipad = [0, 1, '13_0_0'];
    macos = false;
  }

  // Android
  if (android && !windows) {
    device.os = 'android';
    device.android = true;
  }
  if (ipad || iphone || ipod) {
    device.os = 'ios';
    device.ios = true;
  }

  // Export object
  return device;
}
function getDevice(overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  if (!deviceCached) {
    deviceCached = calcDevice(overrides);
  }
  return deviceCached;
}
let browser;
function calcBrowser() {
  const window = getWindow();
  const device = getDevice();
  let needPerspectiveFix = false;
  function isSafari() {
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
  }
  if (isSafari()) {
    const ua = String(window.navigator.userAgent);
    if (ua.includes('Version/')) {
      const [major, minor] = ua.split('Version/')[1].split(' ')[0].split('.').map(num => Number(num));
      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
    }
  }
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
  const isSafariBrowser = isSafari();
  const need3dFix = isSafariBrowser || isWebView && device.ios;
  return {
    isSafari: needPerspectiveFix || isSafariBrowser,
    needPerspectiveFix,
    need3dFix,
    isWebView
  };
}
function getBrowser() {
  if (!browser) {
    browser = calcBrowser();
  }
  return browser;
}
function Resize(_ref) {
  let {
    swiper,
    on,
    emit
  } = _ref;
  const window = getWindow();
  let observer = null;
  let animationFrame = null;
  const resizeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit('beforeResize');
    emit('resize');
  };
  const createObserver = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    observer = new ResizeObserver(entries => {
      animationFrame = window.requestAnimationFrame(() => {
        const {
          width,
          height
        } = swiper;
        let newWidth = width;
        let newHeight = height;
        entries.forEach(_ref2 => {
          let {
            contentBoxSize,
            contentRect,
            target
          } = _ref2;
          if (target && target !== swiper.el) return;
          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
        });
        if (newWidth !== width || newHeight !== height) {
          resizeHandler();
        }
      });
    });
    observer.observe(swiper.el);
  };
  const removeObserver = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
    }
    if (observer && observer.unobserve && swiper.el) {
      observer.unobserve(swiper.el);
      observer = null;
    }
  };
  const orientationChangeHandler = () => {
    if (!swiper || swiper.destroyed || !swiper.initialized) return;
    emit('orientationchange');
  };
  on('init', () => {
    if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
      createObserver();
      return;
    }
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', orientationChangeHandler);
  });
  on('destroy', () => {
    removeObserver();
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('orientationchange', orientationChangeHandler);
  });
}
function Observer(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const observers = [];
  const window = getWindow();
  const attach = function (target, options) {
    if (options === void 0) {
      options = {};
    }
    const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
    const observer = new ObserverFunc(mutations => {
      // The observerUpdate event should only be triggered
      // once despite the number of mutations.  Additional
      // triggers are redundant and are very costly
      if (swiper.__preventObserver__) return;
      if (mutations.length === 1) {
        emit('observerUpdate', mutations[0]);
        return;
      }
      const observerUpdate = function observerUpdate() {
        emit('observerUpdate', mutations[0]);
      };
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(observerUpdate);
      } else {
        window.setTimeout(observerUpdate, 0);
      }
    });
    observer.observe(target, {
      attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
      childList: swiper.isElement || (typeof options.childList === 'undefined' ? true : options).childList,
      characterData: typeof options.characterData === 'undefined' ? true : options.characterData
    });
    observers.push(observer);
  };
  const init = () => {
    if (!swiper.params.observer) return;
    if (swiper.params.observeParents) {
      const containerParents = elementParents(swiper.hostEl);
      for (let i = 0; i < containerParents.length; i += 1) {
        attach(containerParents[i]);
      }
    }
    // Observe container
    attach(swiper.hostEl, {
      childList: swiper.params.observeSlideChildren
    });

    // Observe wrapper
    attach(swiper.wrapperEl, {
      attributes: false
    });
  };
  const destroy = () => {
    observers.forEach(observer => {
      observer.disconnect();
    });
    observers.splice(0, observers.length);
  };
  extendParams({
    observer: false,
    observeParents: false,
    observeSlideChildren: false
  });
  on('init', init);
  on('destroy', destroy);
}

/* eslint-disable no-underscore-dangle */

var eventsEmitter = {
  on(events, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== 'function') return self;
    const method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(event => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  },
  once(events, handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== 'function') return self;
    function onceHandler() {
      self.off(events, onceHandler);
      if (onceHandler.__emitterProxy) {
        delete onceHandler.__emitterProxy;
      }
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      handler.apply(self, args);
    }
    onceHandler.__emitterProxy = handler;
    return self.on(events, onceHandler, priority);
  },
  onAny(handler, priority) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (typeof handler !== 'function') return self;
    const method = priority ? 'unshift' : 'push';
    if (self.eventsAnyListeners.indexOf(handler) < 0) {
      self.eventsAnyListeners[method](handler);
    }
    return self;
  },
  offAny(handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsAnyListeners) return self;
    const index = self.eventsAnyListeners.indexOf(handler);
    if (index >= 0) {
      self.eventsAnyListeners.splice(index, 1);
    }
    return self;
  },
  off(events, handler) {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    events.split(' ').forEach(event => {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  },
  emit() {
    const self = this;
    if (!self.eventsListeners || self.destroyed) return self;
    if (!self.eventsListeners) return self;
    let events;
    let data;
    let context;
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      events = args[0];
      data = args.slice(1, args.length);
      context = self;
    } else {
      events = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
    }
    data.unshift(context);
    const eventsArray = Array.isArray(events) ? events : events.split(' ');
    eventsArray.forEach(event => {
      if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
        self.eventsAnyListeners.forEach(eventHandler => {
          eventHandler.apply(context, [event, ...data]);
        });
      }
      if (self.eventsListeners && self.eventsListeners[event]) {
        self.eventsListeners[event].forEach(eventHandler => {
          eventHandler.apply(context, data);
        });
      }
    });
    return self;
  }
};
function updateSize() {
  const swiper = this;
  let width;
  let height;
  const el = swiper.el;
  if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
    width = swiper.params.width;
  } else {
    width = el.clientWidth;
  }
  if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
    height = swiper.params.height;
  } else {
    height = el.clientHeight;
  }
  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
    return;
  }

  // Subtract paddings
  width = width - parseInt(elementStyle(el, 'padding-left') || 0, 10) - parseInt(elementStyle(el, 'padding-right') || 0, 10);
  height = height - parseInt(elementStyle(el, 'padding-top') || 0, 10) - parseInt(elementStyle(el, 'padding-bottom') || 0, 10);
  if (Number.isNaN(width)) width = 0;
  if (Number.isNaN(height)) height = 0;
  Object.assign(swiper, {
    width,
    height,
    size: swiper.isHorizontal() ? width : height
  });
}
function updateSlides() {
  const swiper = this;
  function getDirectionPropertyValue(node, label) {
    return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
  }
  const params = swiper.params;
  const {
    wrapperEl,
    slidesEl,
    size: swiperSize,
    rtlTranslate: rtl,
    wrongRTL
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
  const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
  let snapGrid = [];
  const slidesGrid = [];
  const slidesSizesGrid = [];
  let offsetBefore = params.slidesOffsetBefore;
  if (typeof offsetBefore === 'function') {
    offsetBefore = params.slidesOffsetBefore.call(swiper);
  }
  let offsetAfter = params.slidesOffsetAfter;
  if (typeof offsetAfter === 'function') {
    offsetAfter = params.slidesOffsetAfter.call(swiper);
  }
  const previousSnapGridLength = swiper.snapGrid.length;
  const previousSlidesGridLength = swiper.slidesGrid.length;
  let spaceBetween = params.spaceBetween;
  let slidePosition = -offsetBefore;
  let prevSlideSize = 0;
  let index = 0;
  if (typeof swiperSize === 'undefined') {
    return;
  }
  if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
  } else if (typeof spaceBetween === 'string') {
    spaceBetween = parseFloat(spaceBetween);
  }
  swiper.virtualSize = -spaceBetween;

  // reset margins
  slides.forEach(slideEl => {
    if (rtl) {
      slideEl.style.marginLeft = '';
    } else {
      slideEl.style.marginRight = '';
    }
    slideEl.style.marginBottom = '';
    slideEl.style.marginTop = '';
  });

  // reset cssMode offsets
  if (params.centeredSlides && params.cssMode) {
    setCSSProperty(wrapperEl, '--swiper-centered-offset-before', '');
    setCSSProperty(wrapperEl, '--swiper-centered-offset-after', '');
  }
  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
  if (gridEnabled) {
    swiper.grid.initSlides(slides);
  } else if (swiper.grid) {
    swiper.grid.unsetSlides();
  }

  // Calc slides
  let slideSize;
  const shouldResetSlideSize = params.slidesPerView === 'auto' && params.breakpoints && Object.keys(params.breakpoints).filter(key => {
    return typeof params.breakpoints[key].slidesPerView !== 'undefined';
  }).length > 0;
  for (let i = 0; i < slidesLength; i += 1) {
    slideSize = 0;
    let slide;
    if (slides[i]) slide = slides[i];
    if (gridEnabled) {
      swiper.grid.updateSlide(i, slide, slides);
    }
    if (slides[i] && elementStyle(slide, 'display') === 'none') continue; // eslint-disable-line

    if (params.slidesPerView === 'auto') {
      if (shouldResetSlideSize) {
        slides[i].style[swiper.getDirectionLabel('width')] = ``;
      }
      const slideStyles = getComputedStyle(slide);
      const currentTransform = slide.style.transform;
      const currentWebKitTransform = slide.style.webkitTransform;
      if (currentTransform) {
        slide.style.transform = 'none';
      }
      if (currentWebKitTransform) {
        slide.style.webkitTransform = 'none';
      }
      if (params.roundLengths) {
        slideSize = swiper.isHorizontal() ? elementOuterSize(slide, 'width') : elementOuterSize(slide, 'height');
      } else {
        // eslint-disable-next-line
        const width = getDirectionPropertyValue(slideStyles, 'width');
        const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
        const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
        const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
        const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
        const boxSizing = slideStyles.getPropertyValue('box-sizing');
        if (boxSizing && boxSizing === 'border-box') {
          slideSize = width + marginLeft + marginRight;
        } else {
          const {
            clientWidth,
            offsetWidth
          } = slide;
          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
        }
      }
      if (currentTransform) {
        slide.style.transform = currentTransform;
      }
      if (currentWebKitTransform) {
        slide.style.webkitTransform = currentWebKitTransform;
      }
      if (params.roundLengths) slideSize = Math.floor(slideSize);
    } else {
      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
      if (params.roundLengths) slideSize = Math.floor(slideSize);
      if (slides[i]) {
        slides[i].style[swiper.getDirectionLabel('width')] = `${slideSize}px`;
      }
    }
    if (slides[i]) {
      slides[i].swiperSlideSize = slideSize;
    }
    slidesSizesGrid.push(slideSize);
    if (params.centeredSlides) {
      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
      if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
    } else {
      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
      slidesGrid.push(slidePosition);
      slidePosition = slidePosition + slideSize + spaceBetween;
    }
    swiper.virtualSize += slideSize + spaceBetween;
    prevSlideSize = slideSize;
    index += 1;
  }
  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
  if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
    wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (params.setWrapperSize) {
    wrapperEl.style[swiper.getDirectionLabel('width')] = `${swiper.virtualSize + spaceBetween}px`;
  }
  if (gridEnabled) {
    swiper.grid.updateWrapperSize(slideSize, snapGrid);
  }

  // Remove last grid elements depending on width
  if (!params.centeredSlides) {
    const newSlidesGrid = [];
    for (let i = 0; i < snapGrid.length; i += 1) {
      let slidesGridItem = snapGrid[i];
      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
      if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
        newSlidesGrid.push(slidesGridItem);
      }
    }
    snapGrid = newSlidesGrid;
    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
      snapGrid.push(swiper.virtualSize - swiperSize);
    }
  }
  if (isVirtual && params.loop) {
    const size = slidesSizesGrid[0] + spaceBetween;
    if (params.slidesPerGroup > 1) {
      const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
      const groupSize = size * params.slidesPerGroup;
      for (let i = 0; i < groups; i += 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
      }
    }
    for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
      if (params.slidesPerGroup === 1) {
        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
      }
      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
      swiper.virtualSize += size;
    }
  }
  if (snapGrid.length === 0) snapGrid = [0];
  if (spaceBetween !== 0) {
    const key = swiper.isHorizontal() && rtl ? 'marginLeft' : swiper.getDirectionLabel('marginRight');
    slides.filter((_, slideIndex) => {
      if (!params.cssMode || params.loop) return true;
      if (slideIndex === slides.length - 1) {
        return false;
      }
      return true;
    }).forEach(slideEl => {
      slideEl.style[key] = `${spaceBetween}px`;
    });
  }
  if (params.centeredSlides && params.centeredSlidesBounds) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach(slideSizeValue => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const maxSnap = allSlidesSize > swiperSize ? allSlidesSize - swiperSize : 0;
    snapGrid = snapGrid.map(snap => {
      if (snap <= 0) return -offsetBefore;
      if (snap > maxSnap) return maxSnap + offsetAfter;
      return snap;
    });
  }
  if (params.centerInsufficientSlides) {
    let allSlidesSize = 0;
    slidesSizesGrid.forEach(slideSizeValue => {
      allSlidesSize += slideSizeValue + (spaceBetween || 0);
    });
    allSlidesSize -= spaceBetween;
    const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
    if (allSlidesSize + offsetSize < swiperSize) {
      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
      snapGrid.forEach((snap, snapIndex) => {
        snapGrid[snapIndex] = snap - allSlidesOffset;
      });
      slidesGrid.forEach((snap, snapIndex) => {
        slidesGrid[snapIndex] = snap + allSlidesOffset;
      });
    }
  }
  Object.assign(swiper, {
    slides,
    snapGrid,
    slidesGrid,
    slidesSizesGrid
  });
  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
    setCSSProperty(wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
    setCSSProperty(wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
    const addToSnapGrid = -swiper.snapGrid[0];
    const addToSlidesGrid = -swiper.slidesGrid[0];
    swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
    swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
  }
  if (slidesLength !== previousSlidesLength) {
    swiper.emit('slidesLengthChange');
  }
  if (snapGrid.length !== previousSnapGridLength) {
    if (swiper.params.watchOverflow) swiper.checkOverflow();
    swiper.emit('snapGridLengthChange');
  }
  if (slidesGrid.length !== previousSlidesGridLength) {
    swiper.emit('slidesGridLengthChange');
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  swiper.emit('slidesUpdated');
  if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
    const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
    if (slidesLength <= params.maxBackfaceHiddenSlides) {
      if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
    } else if (hasClassBackfaceClassAdded) {
      swiper.el.classList.remove(backFaceHiddenClass);
    }
  }
}
function updateAutoHeight(speed) {
  const swiper = this;
  const activeSlides = [];
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  let newHeight = 0;
  let i;
  if (typeof speed === 'number') {
    swiper.setTransition(speed);
  } else if (speed === true) {
    swiper.setTransition(swiper.params.speed);
  }
  const getSlideByIndex = index => {
    if (isVirtual) {
      return swiper.slides[swiper.getSlideIndexByData(index)];
    }
    return swiper.slides[index];
  };
  // Find slides currently in view
  if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
    if (swiper.params.centeredSlides) {
      (swiper.visibleSlides || []).forEach(slide => {
        activeSlides.push(slide);
      });
    } else {
      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
        const index = swiper.activeIndex + i;
        if (index > swiper.slides.length && !isVirtual) break;
        activeSlides.push(getSlideByIndex(index));
      }
    }
  } else {
    activeSlides.push(getSlideByIndex(swiper.activeIndex));
  }

  // Find new height from highest slide in view
  for (i = 0; i < activeSlides.length; i += 1) {
    if (typeof activeSlides[i] !== 'undefined') {
      const height = activeSlides[i].offsetHeight;
      newHeight = height > newHeight ? height : newHeight;
    }
  }

  // Update Height
  if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
}
function updateSlidesOffset() {
  const swiper = this;
  const slides = swiper.slides;
  // eslint-disable-next-line
  const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
  for (let i = 0; i < slides.length; i += 1) {
    slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
  }
}
const toggleSlideClasses$1 = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesProgress(translate) {
  if (translate === void 0) {
    translate = this && this.translate || 0;
  }
  const swiper = this;
  const params = swiper.params;
  const {
    slides,
    rtlTranslate: rtl,
    snapGrid
  } = swiper;
  if (slides.length === 0) return;
  if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();
  let offsetCenter = -translate;
  if (rtl) offsetCenter = translate;
  swiper.visibleSlidesIndexes = [];
  swiper.visibleSlides = [];
  let spaceBetween = params.spaceBetween;
  if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
    spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiper.size;
  } else if (typeof spaceBetween === 'string') {
    spaceBetween = parseFloat(spaceBetween);
  }
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    let slideOffset = slide.swiperSlideOffset;
    if (params.cssMode && params.centeredSlides) {
      slideOffset -= slides[0].swiperSlideOffset;
    }
    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
    const slideBefore = -(offsetCenter - slideOffset);
    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
    if (isVisible) {
      swiper.visibleSlides.push(slide);
      swiper.visibleSlidesIndexes.push(i);
    }
    toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
    toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
    slide.progress = rtl ? -slideProgress : slideProgress;
    slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
  }
}
function updateProgress(translate) {
  const swiper = this;
  if (typeof translate === 'undefined') {
    const multiplier = swiper.rtlTranslate ? -1 : 1;
    // eslint-disable-next-line
    translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
  }
  const params = swiper.params;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  let {
    progress,
    isBeginning,
    isEnd,
    progressLoop
  } = swiper;
  const wasBeginning = isBeginning;
  const wasEnd = isEnd;
  if (translatesDiff === 0) {
    progress = 0;
    isBeginning = true;
    isEnd = true;
  } else {
    progress = (translate - swiper.minTranslate()) / translatesDiff;
    const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
    const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
    isBeginning = isBeginningRounded || progress <= 0;
    isEnd = isEndRounded || progress >= 1;
    if (isBeginningRounded) progress = 0;
    if (isEndRounded) progress = 1;
  }
  if (params.loop) {
    const firstSlideIndex = swiper.getSlideIndexByData(0);
    const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
    const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
    const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
    const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
    const translateAbs = Math.abs(translate);
    if (translateAbs >= firstSlideTranslate) {
      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
    } else {
      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
    }
    if (progressLoop > 1) progressLoop -= 1;
  }
  Object.assign(swiper, {
    progress,
    progressLoop,
    isBeginning,
    isEnd
  });
  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
  if (isBeginning && !wasBeginning) {
    swiper.emit('reachBeginning toEdge');
  }
  if (isEnd && !wasEnd) {
    swiper.emit('reachEnd toEdge');
  }
  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
    swiper.emit('fromEdge');
  }
  swiper.emit('progress', progress);
}
const toggleSlideClasses = (slideEl, condition, className) => {
  if (condition && !slideEl.classList.contains(className)) {
    slideEl.classList.add(className);
  } else if (!condition && slideEl.classList.contains(className)) {
    slideEl.classList.remove(className);
  }
};
function updateSlidesClasses() {
  const swiper = this;
  const {
    slides,
    params,
    slidesEl,
    activeIndex
  } = swiper;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const getFilteredSlide = selector => {
    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
  };
  let activeSlide;
  let prevSlide;
  let nextSlide;
  if (isVirtual) {
    if (params.loop) {
      let slideIndex = activeIndex - swiper.virtual.slidesBefore;
      if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
      if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
    } else {
      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
    }
  } else {
    if (gridEnabled) {
      activeSlide = slides.filter(slideEl => slideEl.column === activeIndex)[0];
      nextSlide = slides.filter(slideEl => slideEl.column === activeIndex + 1)[0];
      prevSlide = slides.filter(slideEl => slideEl.column === activeIndex - 1)[0];
    } else {
      activeSlide = slides[activeIndex];
    }
  }
  if (activeSlide) {
    if (!gridEnabled) {
      // Next Slide
      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !nextSlide) {
        nextSlide = slides[0];
      }

      // Prev Slide
      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
      if (params.loop && !prevSlide === 0) {
        prevSlide = slides[slides.length - 1];
      }
    }
  }
  slides.forEach(slideEl => {
    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
  });
  swiper.emitSlidesClasses();
}
const processLazyPreloader = (swiper, imageEl) => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
  const slideEl = imageEl.closest(slideSelector());
  if (slideEl) {
    let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
    if (!lazyEl && swiper.isElement) {
      if (slideEl.shadowRoot) {
        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
      } else {
        // init later
        requestAnimationFrame(() => {
          if (slideEl.shadowRoot) {
            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (lazyEl) lazyEl.remove();
          }
        });
      }
    }
    if (lazyEl) lazyEl.remove();
  }
};
const unlazy = (swiper, index) => {
  if (!swiper.slides[index]) return;
  const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
  if (imageEl) imageEl.removeAttribute('loading');
};
const preload = swiper => {
  if (!swiper || swiper.destroyed || !swiper.params) return;
  let amount = swiper.params.lazyPreloadPrevNext;
  const len = swiper.slides.length;
  if (!len || !amount || amount < 0) return;
  amount = Math.min(amount, len);
  const slidesPerView = swiper.params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
  const activeIndex = swiper.activeIndex;
  if (swiper.params.grid && swiper.params.grid.rows > 1) {
    const activeColumn = activeIndex;
    const preloadColumns = [activeColumn - amount];
    preloadColumns.push(...Array.from({
      length: amount
    }).map((_, i) => {
      return activeColumn + slidesPerView + i;
    }));
    swiper.slides.forEach((slideEl, i) => {
      if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
    });
    return;
  }
  const slideIndexLastInView = activeIndex + slidesPerView - 1;
  if (swiper.params.rewind || swiper.params.loop) {
    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
      const realIndex = (i % len + len) % len;
      if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
    }
  } else {
    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
        unlazy(swiper, i);
      }
    }
  }
};
function getActiveIndexByTranslate(swiper) {
  const {
    slidesGrid,
    params
  } = swiper;
  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  let activeIndex;
  for (let i = 0; i < slidesGrid.length; i += 1) {
    if (typeof slidesGrid[i + 1] !== 'undefined') {
      if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
        activeIndex = i;
      } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
        activeIndex = i + 1;
      }
    } else if (translate >= slidesGrid[i]) {
      activeIndex = i;
    }
  }
  // Normalize slideIndex
  if (params.normalizeSlideIndex) {
    if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
  }
  return activeIndex;
}
function updateActiveIndex(newActiveIndex) {
  const swiper = this;
  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  const {
    snapGrid,
    params,
    activeIndex: previousIndex,
    realIndex: previousRealIndex,
    snapIndex: previousSnapIndex
  } = swiper;
  let activeIndex = newActiveIndex;
  let snapIndex;
  const getVirtualRealIndex = aIndex => {
    let realIndex = aIndex - swiper.virtual.slidesBefore;
    if (realIndex < 0) {
      realIndex = swiper.virtual.slides.length + realIndex;
    }
    if (realIndex >= swiper.virtual.slides.length) {
      realIndex -= swiper.virtual.slides.length;
    }
    return realIndex;
  };
  if (typeof activeIndex === 'undefined') {
    activeIndex = getActiveIndexByTranslate(swiper);
  }
  if (snapGrid.indexOf(translate) >= 0) {
    snapIndex = snapGrid.indexOf(translate);
  } else {
    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
  }
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  if (activeIndex === previousIndex && !swiper.params.loop) {
    if (snapIndex !== previousSnapIndex) {
      swiper.snapIndex = snapIndex;
      swiper.emit('snapIndexChange');
    }
    return;
  }
  if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
    swiper.realIndex = getVirtualRealIndex(activeIndex);
    return;
  }
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;

  // Get real index
  let realIndex;
  if (swiper.virtual && params.virtual.enabled && params.loop) {
    realIndex = getVirtualRealIndex(activeIndex);
  } else if (gridEnabled) {
    const firstSlideInColumn = swiper.slides.filter(slideEl => slideEl.column === activeIndex)[0];
    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute('data-swiper-slide-index'), 10);
    if (Number.isNaN(activeSlideIndex)) {
      activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
    }
    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
  } else if (swiper.slides[activeIndex]) {
    const slideIndex = swiper.slides[activeIndex].getAttribute('data-swiper-slide-index');
    if (slideIndex) {
      realIndex = parseInt(slideIndex, 10);
    } else {
      realIndex = activeIndex;
    }
  } else {
    realIndex = activeIndex;
  }
  Object.assign(swiper, {
    previousSnapIndex,
    snapIndex,
    previousRealIndex,
    realIndex,
    previousIndex,
    activeIndex
  });
  if (swiper.initialized) {
    preload(swiper);
  }
  swiper.emit('activeIndexChange');
  swiper.emit('snapIndexChange');
  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
    if (previousRealIndex !== realIndex) {
      swiper.emit('realIndexChange');
    }
    swiper.emit('slideChange');
  }
}
function updateClickedSlide(el, path) {
  const swiper = this;
  const params = swiper.params;
  let slide = el.closest(`.${params.slideClass}, swiper-slide`);
  if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) {
    [...path.slice(path.indexOf(el) + 1, path.length)].forEach(pathEl => {
      if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
        slide = pathEl;
      }
    });
  }
  let slideFound = false;
  let slideIndex;
  if (slide) {
    for (let i = 0; i < swiper.slides.length; i += 1) {
      if (swiper.slides[i] === slide) {
        slideFound = true;
        slideIndex = i;
        break;
      }
    }
  }
  if (slide && slideFound) {
    swiper.clickedSlide = slide;
    if (swiper.virtual && swiper.params.virtual.enabled) {
      swiper.clickedIndex = parseInt(slide.getAttribute('data-swiper-slide-index'), 10);
    } else {
      swiper.clickedIndex = slideIndex;
    }
  } else {
    swiper.clickedSlide = undefined;
    swiper.clickedIndex = undefined;
    return;
  }
  if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
    swiper.slideToClickedSlide();
  }
}
var update = {
  updateSize,
  updateSlides,
  updateAutoHeight,
  updateSlidesOffset,
  updateSlidesProgress,
  updateProgress,
  updateSlidesClasses,
  updateActiveIndex,
  updateClickedSlide
};
function getSwiperTranslate(axis) {
  if (axis === void 0) {
    axis = this.isHorizontal() ? 'x' : 'y';
  }
  const swiper = this;
  const {
    params,
    rtlTranslate: rtl,
    translate,
    wrapperEl
  } = swiper;
  if (params.virtualTranslate) {
    return rtl ? -translate : translate;
  }
  if (params.cssMode) {
    return translate;
  }
  let currentTranslate = getTranslate(wrapperEl, axis);
  currentTranslate += swiper.cssOverflowAdjustment();
  if (rtl) currentTranslate = -currentTranslate;
  return currentTranslate || 0;
}
function setTranslate(translate, byController) {
  const swiper = this;
  const {
    rtlTranslate: rtl,
    params,
    wrapperEl,
    progress
  } = swiper;
  let x = 0;
  let y = 0;
  const z = 0;
  if (swiper.isHorizontal()) {
    x = rtl ? -translate : translate;
  } else {
    y = translate;
  }
  if (params.roundLengths) {
    x = Math.floor(x);
    y = Math.floor(y);
  }
  swiper.previousTranslate = swiper.translate;
  swiper.translate = swiper.isHorizontal() ? x : y;
  if (params.cssMode) {
    wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
  } else if (!params.virtualTranslate) {
    if (swiper.isHorizontal()) {
      x -= swiper.cssOverflowAdjustment();
    } else {
      y -= swiper.cssOverflowAdjustment();
    }
    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
  }

  // Check if we need to update progress
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (translate - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== progress) {
    swiper.updateProgress(translate);
  }
  swiper.emit('setTranslate', swiper.translate, byController);
}
function minTranslate() {
  return -this.snapGrid[0];
}
function maxTranslate() {
  return -this.snapGrid[this.snapGrid.length - 1];
}
function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
  if (translate === void 0) {
    translate = 0;
  }
  if (speed === void 0) {
    speed = this.params.speed;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (translateBounds === void 0) {
    translateBounds = true;
  }
  const swiper = this;
  const {
    params,
    wrapperEl
  } = swiper;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  const minTranslate = swiper.minTranslate();
  const maxTranslate = swiper.maxTranslate();
  let newTranslate;
  if (translateBounds && translate > minTranslate) newTranslate = minTranslate;else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;else newTranslate = translate;

  // Update progress
  swiper.updateProgress(newTranslate);
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    if (speed === 0) {
      wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: -newTranslate,
          side: isH ? 'left' : 'top'
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? 'left' : 'top']: -newTranslate,
        behavior: 'smooth'
      });
    }
    return true;
  }
  if (speed === 0) {
    swiper.setTransition(0);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.emit('transitionEnd');
    }
  } else {
    swiper.setTransition(speed);
    swiper.setTranslate(newTranslate);
    if (runCallbacks) {
      swiper.emit('beforeTransitionStart', speed, internal);
      swiper.emit('transitionStart');
    }
    if (!swiper.animating) {
      swiper.animating = true;
      if (!swiper.onTranslateToWrapperTransitionEnd) {
        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
          if (!swiper || swiper.destroyed) return;
          if (e.target !== this) return;
          swiper.wrapperEl.removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
          swiper.onTranslateToWrapperTransitionEnd = null;
          delete swiper.onTranslateToWrapperTransitionEnd;
          swiper.animating = false;
          if (runCallbacks) {
            swiper.emit('transitionEnd');
          }
        };
      }
      swiper.wrapperEl.addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
    }
  }
  return true;
}
var translate = {
  getTranslate: getSwiperTranslate,
  setTranslate,
  minTranslate,
  maxTranslate,
  translateTo
};
function setTransition(duration, byController) {
  const swiper = this;
  if (!swiper.params.cssMode) {
    swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
    swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : '';
  }
  swiper.emit('setTransition', duration, byController);
}
function transitionEmit(_ref) {
  let {
    swiper,
    runCallbacks,
    direction,
    step
  } = _ref;
  const {
    activeIndex,
    previousIndex
  } = swiper;
  let dir = direction;
  if (!dir) {
    if (activeIndex > previousIndex) dir = 'next';else if (activeIndex < previousIndex) dir = 'prev';else dir = 'reset';
  }
  swiper.emit(`transition${step}`);
  if (runCallbacks && activeIndex !== previousIndex) {
    if (dir === 'reset') {
      swiper.emit(`slideResetTransition${step}`);
      return;
    }
    swiper.emit(`slideChangeTransition${step}`);
    if (dir === 'next') {
      swiper.emit(`slideNextTransition${step}`);
    } else {
      swiper.emit(`slidePrevTransition${step}`);
    }
  }
}
function transitionStart(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  if (params.cssMode) return;
  if (params.autoHeight) {
    swiper.updateAutoHeight();
  }
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: 'Start'
  });
}
function transitionEnd(runCallbacks, direction) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.animating = false;
  if (params.cssMode) return;
  swiper.setTransition(0);
  transitionEmit({
    swiper,
    runCallbacks,
    direction,
    step: 'End'
  });
}
var transition = {
  setTransition,
  transitionStart,
  transitionEnd
};
function slideTo(index, speed, runCallbacks, internal, initial) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === 'string') {
    index = parseInt(index, 10);
  }
  const swiper = this;
  let slideIndex = index;
  if (slideIndex < 0) slideIndex = 0;
  const {
    params,
    snapGrid,
    slidesGrid,
    previousIndex,
    activeIndex,
    rtlTranslate: rtl,
    wrapperEl,
    enabled
  } = swiper;
  if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
    return false;
  }
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
  const translate = -snapGrid[snapIndex];
  // Normalize slideIndex
  if (params.normalizeSlideIndex) {
    for (let i = 0; i < slidesGrid.length; i += 1) {
      const normalizedTranslate = -Math.floor(translate * 100);
      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
      if (typeof slidesGrid[i + 1] !== 'undefined') {
        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
          slideIndex = i;
        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
          slideIndex = i + 1;
        }
      } else if (normalizedTranslate >= normalizedGrid) {
        slideIndex = i;
      }
    }
  }
  // Directions locks
  if (swiper.initialized && slideIndex !== activeIndex) {
    if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) {
      return false;
    }
    if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
      if ((activeIndex || 0) !== slideIndex) {
        return false;
      }
    }
  }
  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
    swiper.emit('beforeSlideChangeStart');
  }

  // Update progress
  swiper.updateProgress(translate);
  let direction;
  if (slideIndex > activeIndex) direction = 'next';else if (slideIndex < activeIndex) direction = 'prev';else direction = 'reset';

  // initial virtual
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
  const isInitialVirtual = isVirtual && initial;
  // Update Index
  if (!isInitialVirtual && (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate)) {
    swiper.updateActiveIndex(slideIndex);
    // Update Height
    if (params.autoHeight) {
      swiper.updateAutoHeight();
    }
    swiper.updateSlidesClasses();
    if (params.effect !== 'slide') {
      swiper.setTranslate(translate);
    }
    if (direction !== 'reset') {
      swiper.transitionStart(runCallbacks, direction);
      swiper.transitionEnd(runCallbacks, direction);
    }
    return false;
  }
  if (params.cssMode) {
    const isH = swiper.isHorizontal();
    const t = rtl ? translate : -translate;
    if (speed === 0) {
      if (isVirtual) {
        swiper.wrapperEl.style.scrollSnapType = 'none';
        swiper._immediateVirtual = true;
      }
      if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
        swiper._cssModeVirtualInitialSet = true;
        requestAnimationFrame(() => {
          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
        });
      } else {
        wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
      }
      if (isVirtual) {
        requestAnimationFrame(() => {
          swiper.wrapperEl.style.scrollSnapType = '';
          swiper._immediateVirtual = false;
        });
      }
    } else {
      if (!swiper.support.smoothScroll) {
        animateCSSModeScroll({
          swiper,
          targetPosition: t,
          side: isH ? 'left' : 'top'
        });
        return true;
      }
      wrapperEl.scrollTo({
        [isH ? 'left' : 'top']: t,
        behavior: 'smooth'
      });
    }
    return true;
  }
  swiper.setTransition(speed);
  swiper.setTranslate(translate);
  swiper.updateActiveIndex(slideIndex);
  swiper.updateSlidesClasses();
  swiper.emit('beforeTransitionStart', speed, internal);
  swiper.transitionStart(runCallbacks, direction);
  if (speed === 0) {
    swiper.transitionEnd(runCallbacks, direction);
  } else if (!swiper.animating) {
    swiper.animating = true;
    if (!swiper.onSlideToWrapperTransitionEnd) {
      swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
        if (!swiper || swiper.destroyed) return;
        if (e.target !== this) return;
        swiper.wrapperEl.removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
        swiper.onSlideToWrapperTransitionEnd = null;
        delete swiper.onSlideToWrapperTransitionEnd;
        swiper.transitionEnd(runCallbacks, direction);
      };
    }
    swiper.wrapperEl.addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
  }
  return true;
}
function slideToLoop(index, speed, runCallbacks, internal) {
  if (index === void 0) {
    index = 0;
  }
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (typeof index === 'string') {
    const indexAsNumber = parseInt(index, 10);
    index = indexAsNumber;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
  let newIndex = index;
  if (swiper.params.loop) {
    if (swiper.virtual && swiper.params.virtual.enabled) {
      // eslint-disable-next-line
      newIndex = newIndex + swiper.virtual.slidesBefore;
    } else {
      let targetSlideIndex;
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        targetSlideIndex = swiper.slides.filter(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === slideIndex)[0].column;
      } else {
        targetSlideIndex = swiper.getSlideIndexByData(newIndex);
      }
      const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
      const {
        centeredSlides
      } = swiper.params;
      let slidesPerView = swiper.params.slidesPerView;
      if (slidesPerView === 'auto') {
        slidesPerView = swiper.slidesPerViewDynamic();
      } else {
        slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
        if (centeredSlides && slidesPerView % 2 === 0) {
          slidesPerView = slidesPerView + 1;
        }
      }
      let needLoopFix = cols - targetSlideIndex < slidesPerView;
      if (centeredSlides) {
        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
      }
      if (internal && centeredSlides && swiper.params.slidesPerView !== 'auto' && !gridEnabled) {
        needLoopFix = false;
      }
      if (needLoopFix) {
        const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? 'prev' : 'next' : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? 'next' : 'prev';
        swiper.loopFix({
          direction,
          slideTo: true,
          activeSlideIndex: direction === 'next' ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
          slideRealIndex: direction === 'next' ? swiper.realIndex : undefined
        });
      }
      if (gridEnabled) {
        const slideIndex = newIndex * swiper.params.grid.rows;
        newIndex = swiper.slides.filter(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === slideIndex)[0].column;
      } else {
        newIndex = swiper.getSlideIndexByData(newIndex);
      }
    }
  }
  requestAnimationFrame(() => {
    swiper.slideTo(newIndex, speed, runCallbacks, internal);
  });
  return swiper;
}

/* eslint no-unused-vars: "off" */
function slideNext(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    enabled,
    params,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  let perGroup = params.slidesPerGroup;
  if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
    perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
  }
  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: 'next'
    });
    // eslint-disable-next-line
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
      requestAnimationFrame(() => {
        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
      });
      return true;
    }
  }
  if (params.rewind && swiper.isEnd) {
    return swiper.slideTo(0, speed, runCallbacks, internal);
  }
  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
}

/* eslint no-unused-vars: "off" */
function slidePrev(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  const {
    params,
    snapGrid,
    slidesGrid,
    rtlTranslate,
    enabled,
    animating
  } = swiper;
  if (!enabled || swiper.destroyed) return swiper;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  const isVirtual = swiper.virtual && params.virtual.enabled;
  if (params.loop) {
    if (animating && !isVirtual && params.loopPreventsSliding) return false;
    swiper.loopFix({
      direction: 'prev'
    });
    // eslint-disable-next-line
    swiper._clientLeft = swiper.wrapperEl.clientLeft;
  }
  const translate = rtlTranslate ? swiper.translate : -swiper.translate;
  function normalize(val) {
    if (val < 0) return -Math.floor(Math.abs(val));
    return Math.floor(val);
  }
  const normalizedTranslate = normalize(translate);
  const normalizedSnapGrid = snapGrid.map(val => normalize(val));
  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
  if (typeof prevSnap === 'undefined' && params.cssMode) {
    let prevSnapIndex;
    snapGrid.forEach((snap, snapIndex) => {
      if (normalizedTranslate >= snap) {
        // prevSnap = snap;
        prevSnapIndex = snapIndex;
      }
    });
    if (typeof prevSnapIndex !== 'undefined') {
      prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
    }
  }
  let prevIndex = 0;
  if (typeof prevSnap !== 'undefined') {
    prevIndex = slidesGrid.indexOf(prevSnap);
    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
    if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
      prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
      prevIndex = Math.max(prevIndex, 0);
    }
  }
  if (params.rewind && swiper.isBeginning) {
    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
    requestAnimationFrame(() => {
      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    });
    return true;
  }
  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
}

/* eslint no-unused-vars: "off" */
function slideReset(speed, runCallbacks, internal) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
}

/* eslint no-unused-vars: "off" */
function slideToClosest(speed, runCallbacks, internal, threshold) {
  if (runCallbacks === void 0) {
    runCallbacks = true;
  }
  if (threshold === void 0) {
    threshold = 0.5;
  }
  const swiper = this;
  if (swiper.destroyed) return;
  if (typeof speed === 'undefined') {
    speed = swiper.params.speed;
  }
  let index = swiper.activeIndex;
  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
  if (translate >= swiper.snapGrid[snapIndex]) {
    // The current translate is on or after the current snap index, so the choice
    // is between the current index and the one after it.
    const currentSnap = swiper.snapGrid[snapIndex];
    const nextSnap = swiper.snapGrid[snapIndex + 1];
    if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
      index += swiper.params.slidesPerGroup;
    }
  } else {
    // The current translate is before the current snap index, so the choice
    // is between the current index and the one before it.
    const prevSnap = swiper.snapGrid[snapIndex - 1];
    const currentSnap = swiper.snapGrid[snapIndex];
    if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
      index -= swiper.params.slidesPerGroup;
    }
  }
  index = Math.max(index, 0);
  index = Math.min(index, swiper.slidesGrid.length - 1);
  return swiper.slideTo(index, speed, runCallbacks, internal);
}
function slideToClickedSlide() {
  const swiper = this;
  if (swiper.destroyed) return;
  const {
    params,
    slidesEl
  } = swiper;
  const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
  let slideToIndex = swiper.clickedIndex;
  let realIndex;
  const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
  if (params.loop) {
    if (swiper.animating) return;
    realIndex = parseInt(swiper.clickedSlide.getAttribute('data-swiper-slide-index'), 10);
    if (params.centeredSlides) {
      if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
        swiper.loopFix();
        slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
        nextTick(() => {
          swiper.slideTo(slideToIndex);
        });
      } else {
        swiper.slideTo(slideToIndex);
      }
    } else if (slideToIndex > swiper.slides.length - slidesPerView) {
      swiper.loopFix();
      slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
      nextTick(() => {
        swiper.slideTo(slideToIndex);
      });
    } else {
      swiper.slideTo(slideToIndex);
    }
  } else {
    swiper.slideTo(slideToIndex);
  }
}
var slide = {
  slideTo,
  slideToLoop,
  slideNext,
  slidePrev,
  slideReset,
  slideToClosest,
  slideToClickedSlide
};
function loopCreate(slideRealIndex) {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
  const initSlides = () => {
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    slides.forEach((el, index) => {
      el.setAttribute('data-swiper-slide-index', index);
    });
  };
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
  const addBlankSlides = amountOfSlides => {
    for (let i = 0; i < amountOfSlides; i += 1) {
      const slideEl = swiper.isElement ? createElement('swiper-slide', [params.slideBlankClass]) : createElement('div', [params.slideClass, params.slideBlankClass]);
      swiper.slidesEl.append(slideEl);
    }
  };
  if (shouldFillGroup) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning('Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
    }
    initSlides();
  } else if (shouldFillGrid) {
    if (params.loopAddBlankSlides) {
      const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
      addBlankSlides(slidesToAdd);
      swiper.recalcSlides();
      swiper.updateSlides();
    } else {
      showWarning('Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
    }
    initSlides();
  } else {
    initSlides();
  }
  swiper.loopFix({
    slideRealIndex,
    direction: params.centeredSlides ? undefined : 'next'
  });
}
function loopFix(_temp) {
  let {
    slideRealIndex,
    slideTo = true,
    direction,
    setTranslate,
    activeSlideIndex,
    byController,
    byMousewheel
  } = _temp === void 0 ? {} : _temp;
  const swiper = this;
  if (!swiper.params.loop) return;
  swiper.emit('beforeLoopFix');
  const {
    slides,
    allowSlidePrev,
    allowSlideNext,
    slidesEl,
    params
  } = swiper;
  const {
    centeredSlides
  } = params;
  swiper.allowSlidePrev = true;
  swiper.allowSlideNext = true;
  if (swiper.virtual && params.virtual.enabled) {
    if (slideTo) {
      if (!params.centeredSlides && swiper.snapIndex === 0) {
        swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
      } else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) {
        swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
      } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
        swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
      }
    }
    swiper.allowSlidePrev = allowSlidePrev;
    swiper.allowSlideNext = allowSlideNext;
    swiper.emit('loopFix');
    return;
  }
  let slidesPerView = params.slidesPerView;
  if (slidesPerView === 'auto') {
    slidesPerView = swiper.slidesPerViewDynamic();
  } else {
    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
    if (centeredSlides && slidesPerView % 2 === 0) {
      slidesPerView = slidesPerView + 1;
    }
  }
  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
  let loopedSlides = slidesPerGroup;
  if (loopedSlides % slidesPerGroup !== 0) {
    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
  }
  loopedSlides += params.loopAdditionalSlides;
  swiper.loopedSlides = loopedSlides;
  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
  if (slides.length < slidesPerView + loopedSlides) {
    showWarning('Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters');
  } else if (gridEnabled && params.grid.fill === 'row') {
    showWarning('Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`');
  }
  const prependSlidesIndexes = [];
  const appendSlidesIndexes = [];
  let activeIndex = swiper.activeIndex;
  if (typeof activeSlideIndex === 'undefined') {
    activeSlideIndex = swiper.getSlideIndex(slides.filter(el => el.classList.contains(params.slideActiveClass))[0]);
  } else {
    activeIndex = activeSlideIndex;
  }
  const isNext = direction === 'next' || !direction;
  const isPrev = direction === 'prev' || !direction;
  let slidesPrepended = 0;
  let slidesAppended = 0;
  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
  const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === 'undefined' ? -slidesPerView / 2 + 0.5 : 0);
  // prepend last slides before start
  if (activeColIndexWithShift < loopedSlides) {
    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        const colIndexToPrepend = cols - index - 1;
        for (let i = slides.length - 1; i >= 0; i -= 1) {
          if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
        }
        // slides.forEach((slide, slideIndex) => {
        //   if (slide.column === colIndexToPrepend) prependSlidesIndexes.push(slideIndex);
        // });
      } else {
        prependSlidesIndexes.push(cols - index - 1);
      }
    }
  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
    for (let i = 0; i < slidesAppended; i += 1) {
      const index = i - Math.floor(i / cols) * cols;
      if (gridEnabled) {
        slides.forEach((slide, slideIndex) => {
          if (slide.column === index) appendSlidesIndexes.push(slideIndex);
        });
      } else {
        appendSlidesIndexes.push(index);
      }
    }
  }
  swiper.__preventObserver__ = true;
  requestAnimationFrame(() => {
    swiper.__preventObserver__ = false;
  });
  if (isPrev) {
    prependSlidesIndexes.forEach(index => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.prepend(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  if (isNext) {
    appendSlidesIndexes.forEach(index => {
      slides[index].swiperLoopMoveDOM = true;
      slidesEl.append(slides[index]);
      slides[index].swiperLoopMoveDOM = false;
    });
  }
  swiper.recalcSlides();
  if (params.slidesPerView === 'auto') {
    swiper.updateSlides();
  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
    swiper.slides.forEach((slide, slideIndex) => {
      swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
    });
  }
  if (params.watchSlidesProgress) {
    swiper.updateSlidesOffset();
  }
  if (slideTo) {
    if (prependSlidesIndexes.length > 0 && isPrev) {
      if (typeof slideRealIndex === 'undefined') {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
          if (setTranslate) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        if (setTranslate) {
          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
          swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
          swiper.touchEventsData.currentTranslate = swiper.translate;
        }
      }
    } else if (appendSlidesIndexes.length > 0 && isNext) {
      if (typeof slideRealIndex === 'undefined') {
        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
        const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
        const diff = newSlideTranslate - currentSlideTranslate;
        if (byMousewheel) {
          swiper.setTranslate(swiper.translate - diff);
        } else {
          swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
          if (setTranslate) {
            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
          }
        }
      } else {
        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
        swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
      }
    }
  }
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.controller && swiper.controller.control && !byController) {
    const loopParams = {
      slideRealIndex,
      direction,
      setTranslate,
      activeSlideIndex,
      byController: true
    };
    if (Array.isArray(swiper.controller.control)) {
      swiper.controller.control.forEach(c => {
        if (!c.destroyed && c.params.loop) c.loopFix({
          ...loopParams,
          slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
        });
      });
    } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
      swiper.controller.control.loopFix({
        ...loopParams,
        slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
      });
    }
  }
  swiper.emit('loopFix');
}
function loopDestroy() {
  const swiper = this;
  const {
    params,
    slidesEl
  } = swiper;
  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
  swiper.recalcSlides();
  const newSlidesOrder = [];
  swiper.slides.forEach(slideEl => {
    const index = typeof slideEl.swiperSlideIndex === 'undefined' ? slideEl.getAttribute('data-swiper-slide-index') * 1 : slideEl.swiperSlideIndex;
    newSlidesOrder[index] = slideEl;
  });
  swiper.slides.forEach(slideEl => {
    slideEl.removeAttribute('data-swiper-slide-index');
  });
  newSlidesOrder.forEach(slideEl => {
    slidesEl.append(slideEl);
  });
  swiper.recalcSlides();
  swiper.slideTo(swiper.realIndex, 0);
}
var loop = {
  loopCreate,
  loopFix,
  loopDestroy
};
function setGrabCursor(moving) {
  const swiper = this;
  if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
  const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  el.style.cursor = 'move';
  el.style.cursor = moving ? 'grabbing' : 'grab';
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
function unsetGrabCursor() {
  const swiper = this;
  if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
    return;
  }
  if (swiper.isElement) {
    swiper.__preventObserver__ = true;
  }
  swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
  if (swiper.isElement) {
    requestAnimationFrame(() => {
      swiper.__preventObserver__ = false;
    });
  }
}
var grabCursor = {
  setGrabCursor,
  unsetGrabCursor
};

// Modified from https://stackoverflow.com/questions/54520554/custom-element-getrootnode-closest-function-crossing-multiple-parent-shadowd
function closestElement(selector, base) {
  if (base === void 0) {
    base = this;
  }
  function __closestFrom(el) {
    if (!el || el === getDocument() || el === getWindow()) return null;
    if (el.assignedSlot) el = el.assignedSlot;
    const found = el.closest(selector);
    if (!found && !el.getRootNode) {
      return null;
    }
    return found || __closestFrom(el.getRootNode().host);
  }
  return __closestFrom(base);
}
function preventEdgeSwipe(swiper, event, startX) {
  const window = getWindow();
  const {
    params
  } = swiper;
  const edgeSwipeDetection = params.edgeSwipeDetection;
  const edgeSwipeThreshold = params.edgeSwipeThreshold;
  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
    if (edgeSwipeDetection === 'prevent') {
      event.preventDefault();
      return true;
    }
    return false;
  }
  return true;
}
function onTouchStart(event) {
  const swiper = this;
  const document = getDocument();
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  const data = swiper.touchEventsData;
  if (e.type === 'pointerdown') {
    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
      return;
    }
    data.pointerId = e.pointerId;
  } else if (e.type === 'touchstart' && e.targetTouches.length === 1) {
    data.touchId = e.targetTouches[0].identifier;
  }
  if (e.type === 'touchstart') {
    // don't proceed touch event
    preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
    return;
  }
  const {
    params,
    touches,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === 'mouse') return;
  if (swiper.animating && params.preventInteractionOnTransition) {
    return;
  }
  if (!swiper.animating && params.cssMode && params.loop) {
    swiper.loopFix();
  }
  let targetEl = e.target;
  if (params.touchEventsTarget === 'wrapper') {
    if (!elementIsChildOf(targetEl, swiper.wrapperEl)) return;
  }
  if ('which' in e && e.which === 3) return;
  if ('button' in e && e.button > 0) return;
  if (data.isTouched && data.isMoved) return;

  // change target el for shadow root component
  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';
  // eslint-disable-next-line
  const eventPath = e.composedPath ? e.composedPath() : e.path;
  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
    targetEl = eventPath[0];
  }
  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
  const isTargetShadow = !!(e.target && e.target.shadowRoot);

  // use closestElement for shadow root element to get the actual closest for nested shadow root element
  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
    swiper.allowClick = true;
    return;
  }
  if (params.swipeHandler) {
    if (!targetEl.closest(params.swipeHandler)) return;
  }
  touches.currentX = e.pageX;
  touches.currentY = e.pageY;
  const startX = touches.currentX;
  const startY = touches.currentY;

  // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore

  if (!preventEdgeSwipe(swiper, e, startX)) {
    return;
  }
  Object.assign(data, {
    isTouched: true,
    isMoved: false,
    allowTouchCallbacks: true,
    isScrolling: undefined,
    startMoving: undefined
  });
  touches.startX = startX;
  touches.startY = startY;
  data.touchStartTime = now();
  swiper.allowClick = true;
  swiper.updateSize();
  swiper.swipeDirection = undefined;
  if (params.threshold > 0) data.allowThresholdMove = false;
  let preventDefault = true;
  if (targetEl.matches(data.focusableElements)) {
    preventDefault = false;
    if (targetEl.nodeName === 'SELECT') {
      data.isTouched = false;
    }
  }
  if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl && (e.pointerType === 'mouse' || e.pointerType !== 'mouse' && !targetEl.matches(data.focusableElements))) {
    document.activeElement.blur();
  }
  const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
    e.preventDefault();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
    swiper.freeMode.onTouchStart();
  }
  swiper.emit('touchStart', e);
}
function onTouchMove(event) {
  const document = getDocument();
  const swiper = this;
  const data = swiper.touchEventsData;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && event.pointerType === 'mouse') return;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  if (e.type === 'pointermove') {
    if (data.touchId !== null) return; // return from pointer if we use touch
    const id = e.pointerId;
    if (id !== data.pointerId) return;
  }
  let targetTouch;
  if (e.type === 'touchmove') {
    targetTouch = [...e.changedTouches].filter(t => t.identifier === data.touchId)[0];
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  } else {
    targetTouch = e;
  }
  if (!data.isTouched) {
    if (data.startMoving && data.isScrolling) {
      swiper.emit('touchMoveOpposite', e);
    }
    return;
  }
  const pageX = targetTouch.pageX;
  const pageY = targetTouch.pageY;
  if (e.preventedByNestedSwiper) {
    touches.startX = pageX;
    touches.startY = pageY;
    return;
  }
  if (!swiper.allowTouchMove) {
    if (!e.target.matches(data.focusableElements)) {
      swiper.allowClick = false;
    }
    if (data.isTouched) {
      Object.assign(touches, {
        startX: pageX,
        startY: pageY,
        currentX: pageX,
        currentY: pageY
      });
      data.touchStartTime = now();
    }
    return;
  }
  if (params.touchReleaseOnEdges && !params.loop) {
    if (swiper.isVertical()) {
      // Vertical
      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
        data.isTouched = false;
        data.isMoved = false;
        return;
      }
    } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) {
      return;
    }
  }
  if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== e.target && e.pointerType !== 'mouse') {
    document.activeElement.blur();
  }
  if (document.activeElement) {
    if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
      data.isMoved = true;
      swiper.allowClick = false;
      return;
    }
  }
  if (data.allowTouchCallbacks) {
    swiper.emit('touchMove', e);
  }
  touches.previousX = touches.currentX;
  touches.previousY = touches.currentY;
  touches.currentX = pageX;
  touches.currentY = pageY;
  const diffX = touches.currentX - touches.startX;
  const diffY = touches.currentY - touches.startY;
  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
  if (typeof data.isScrolling === 'undefined') {
    let touchAngle;
    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
      data.isScrolling = false;
    } else {
      // eslint-disable-next-line
      if (diffX * diffX + diffY * diffY >= 25) {
        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
      }
    }
  }
  if (data.isScrolling) {
    swiper.emit('touchMoveOpposite', e);
  }
  if (typeof data.startMoving === 'undefined') {
    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
      data.startMoving = true;
    }
  }
  if (data.isScrolling || e.type === 'touchmove' && data.preventTouchMoveFromPointerMove) {
    data.isTouched = false;
    return;
  }
  if (!data.startMoving) {
    return;
  }
  swiper.allowClick = false;
  if (!params.cssMode && e.cancelable) {
    e.preventDefault();
  }
  if (params.touchMoveStopPropagation && !params.nested) {
    e.stopPropagation();
  }
  let diff = swiper.isHorizontal() ? diffX : diffY;
  let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
  if (params.oneWayMovement) {
    diff = Math.abs(diff) * (rtl ? 1 : -1);
    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
  }
  touches.diff = diff;
  diff *= params.touchRatio;
  if (rtl) {
    diff = -diff;
    touchesDiff = -touchesDiff;
  }
  const prevTouchesDirection = swiper.touchesDirection;
  swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
  swiper.touchesDirection = touchesDiff > 0 ? 'prev' : 'next';
  const isLoop = swiper.params.loop && !params.cssMode;
  const allowLoopFix = swiper.touchesDirection === 'next' && swiper.allowSlideNext || swiper.touchesDirection === 'prev' && swiper.allowSlidePrev;
  if (!data.isMoved) {
    if (isLoop && allowLoopFix) {
      swiper.loopFix({
        direction: swiper.swipeDirection
      });
    }
    data.startTranslate = swiper.getTranslate();
    swiper.setTransition(0);
    if (swiper.animating) {
      const evt = new window.CustomEvent('transitionend', {
        bubbles: true,
        cancelable: true,
        detail: {
          bySwiperTouchMove: true
        }
      });
      swiper.wrapperEl.dispatchEvent(evt);
    }
    data.allowMomentumBounce = false;
    // Grab Cursor
    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
      swiper.setGrabCursor(true);
    }
    swiper.emit('sliderFirstMove', e);
  }
  let loopFixed;
  new Date().getTime();
  if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
    Object.assign(touches, {
      startX: pageX,
      startY: pageY,
      currentX: pageX,
      currentY: pageY,
      startTranslate: data.currentTranslate
    });
    data.loopSwapReset = true;
    data.startTranslate = data.currentTranslate;
    return;
  }
  swiper.emit('sliderMove', e);
  data.isMoved = true;
  data.currentTranslate = diff + data.startTranslate;
  let disableParentSwiper = true;
  let resistanceRatio = params.resistanceRatio;
  if (params.touchReleaseOnEdges) {
    resistanceRatio = 0;
  }
  if (diff > 0) {
    if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] - (params.slidesPerView !== 'auto' && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.activeIndex + 1] + swiper.params.spaceBetween : 0) - swiper.params.spaceBetween : swiper.minTranslate())) {
      swiper.loopFix({
        direction: 'prev',
        setTranslate: true,
        activeSlideIndex: 0
      });
    }
    if (data.currentTranslate > swiper.minTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
      }
    }
  } else if (diff < 0) {
    if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween + (params.slidesPerView !== 'auto' && swiper.slides.length - params.slidesPerView >= 2 ? swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] + swiper.params.spaceBetween : 0) : swiper.maxTranslate())) {
      swiper.loopFix({
        direction: 'next',
        setTranslate: true,
        activeSlideIndex: swiper.slides.length - (params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
      });
    }
    if (data.currentTranslate < swiper.maxTranslate()) {
      disableParentSwiper = false;
      if (params.resistance) {
        data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
      }
    }
  }
  if (disableParentSwiper) {
    e.preventedByNestedSwiper = true;
  }

  // Directions locks
  if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
    data.currentTranslate = data.startTranslate;
  }
  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
    data.currentTranslate = data.startTranslate;
  }

  // Threshold
  if (params.threshold > 0) {
    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
      if (!data.allowThresholdMove) {
        data.allowThresholdMove = true;
        touches.startX = touches.currentX;
        touches.startY = touches.currentY;
        data.currentTranslate = data.startTranslate;
        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
        return;
      }
    } else {
      data.currentTranslate = data.startTranslate;
      return;
    }
  }
  if (!params.followFinger || params.cssMode) return;

  // Update active index in free mode
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
    swiper.freeMode.onTouchMove();
  }
  // Update progress
  swiper.updateProgress(data.currentTranslate);
  // Update translate
  swiper.setTranslate(data.currentTranslate);
}
function onTouchEnd(event) {
  const swiper = this;
  const data = swiper.touchEventsData;
  let e = event;
  if (e.originalEvent) e = e.originalEvent;
  let targetTouch;
  const isTouchEvent = e.type === 'touchend' || e.type === 'touchcancel';
  if (!isTouchEvent) {
    if (data.touchId !== null) return; // return from pointer if we use touch
    if (e.pointerId !== data.pointerId) return;
    targetTouch = e;
  } else {
    targetTouch = [...e.changedTouches].filter(t => t.identifier === data.touchId)[0];
    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
  }
  if (['pointercancel', 'pointerout', 'pointerleave', 'contextmenu'].includes(e.type)) {
    const proceed = ['pointercancel', 'contextmenu'].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
    if (!proceed) {
      return;
    }
  }
  data.pointerId = null;
  data.touchId = null;
  const {
    params,
    touches,
    rtlTranslate: rtl,
    slidesGrid,
    enabled
  } = swiper;
  if (!enabled) return;
  if (!params.simulateTouch && e.pointerType === 'mouse') return;
  if (data.allowTouchCallbacks) {
    swiper.emit('touchEnd', e);
  }
  data.allowTouchCallbacks = false;
  if (!data.isTouched) {
    if (data.isMoved && params.grabCursor) {
      swiper.setGrabCursor(false);
    }
    data.isMoved = false;
    data.startMoving = false;
    return;
  }

  // Return Grab Cursor
  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
    swiper.setGrabCursor(false);
  }

  // Time diff
  const touchEndTime = now();
  const timeDiff = touchEndTime - data.touchStartTime;

  // Tap, doubleTap, Click
  if (swiper.allowClick) {
    const pathTree = e.path || e.composedPath && e.composedPath();
    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
    swiper.emit('tap click', e);
    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
      swiper.emit('doubleTap doubleClick', e);
    }
  }
  data.lastClickTime = now();
  nextTick(() => {
    if (!swiper.destroyed) swiper.allowClick = true;
  });
  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
    data.isTouched = false;
    data.isMoved = false;
    data.startMoving = false;
    return;
  }
  data.isTouched = false;
  data.isMoved = false;
  data.startMoving = false;
  let currentPos;
  if (params.followFinger) {
    currentPos = rtl ? swiper.translate : -swiper.translate;
  } else {
    currentPos = -data.currentTranslate;
  }
  if (params.cssMode) {
    return;
  }
  if (params.freeMode && params.freeMode.enabled) {
    swiper.freeMode.onTouchEnd({
      currentPos
    });
    return;
  }

  // Find current slide
  const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
  let stopIndex = 0;
  let groupSize = swiper.slidesSizesGrid[0];
  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
    const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
    if (typeof slidesGrid[i + increment] !== 'undefined') {
      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
        stopIndex = i;
        groupSize = slidesGrid[i + increment] - slidesGrid[i];
      }
    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
      stopIndex = i;
      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
    }
  }
  let rewindFirstIndex = null;
  let rewindLastIndex = null;
  if (params.rewind) {
    if (swiper.isBeginning) {
      rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
    } else if (swiper.isEnd) {
      rewindFirstIndex = 0;
    }
  }
  // Find current slide size
  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
  if (timeDiff > params.longSwipesMs) {
    // Long touches
    if (!params.longSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    if (swiper.swipeDirection === 'next') {
      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);else swiper.slideTo(stopIndex);
    }
    if (swiper.swipeDirection === 'prev') {
      if (ratio > 1 - params.longSwipesRatio) {
        swiper.slideTo(stopIndex + increment);
      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
        swiper.slideTo(rewindLastIndex);
      } else {
        swiper.slideTo(stopIndex);
      }
    }
  } else {
    // Short swipes
    if (!params.shortSwipes) {
      swiper.slideTo(swiper.activeIndex);
      return;
    }
    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
    if (!isNavButtonTarget) {
      if (swiper.swipeDirection === 'next') {
        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
      }
      if (swiper.swipeDirection === 'prev') {
        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
      }
    } else if (e.target === swiper.navigation.nextEl) {
      swiper.slideTo(stopIndex + increment);
    } else {
      swiper.slideTo(stopIndex);
    }
  }
}
function onResize() {
  const swiper = this;
  const {
    params,
    el
  } = swiper;
  if (el && el.offsetWidth === 0) return;

  // Breakpoints
  if (params.breakpoints) {
    swiper.setBreakpoint();
  }

  // Save locks
  const {
    allowSlideNext,
    allowSlidePrev,
    snapGrid
  } = swiper;
  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

  // Disable locks on resize
  swiper.allowSlideNext = true;
  swiper.allowSlidePrev = true;
  swiper.updateSize();
  swiper.updateSlides();
  swiper.updateSlidesClasses();
  const isVirtualLoop = isVirtual && params.loop;
  if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
  } else {
    if (swiper.params.loop && !isVirtual) {
      swiper.slideToLoop(swiper.realIndex, 0, false, true);
    } else {
      swiper.slideTo(swiper.activeIndex, 0, false, true);
    }
  }
  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
    clearTimeout(swiper.autoplay.resizeTimeout);
    swiper.autoplay.resizeTimeout = setTimeout(() => {
      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
        swiper.autoplay.resume();
      }
    }, 500);
  }
  // Return locks after resize
  swiper.allowSlidePrev = allowSlidePrev;
  swiper.allowSlideNext = allowSlideNext;
  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
    swiper.checkOverflow();
  }
}
function onClick(e) {
  const swiper = this;
  if (!swiper.enabled) return;
  if (!swiper.allowClick) {
    if (swiper.params.preventClicks) e.preventDefault();
    if (swiper.params.preventClicksPropagation && swiper.animating) {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}
function onScroll() {
  const swiper = this;
  const {
    wrapperEl,
    rtlTranslate,
    enabled
  } = swiper;
  if (!enabled) return;
  swiper.previousTranslate = swiper.translate;
  if (swiper.isHorizontal()) {
    swiper.translate = -wrapperEl.scrollLeft;
  } else {
    swiper.translate = -wrapperEl.scrollTop;
  }
  // eslint-disable-next-line
  if (swiper.translate === 0) swiper.translate = 0;
  swiper.updateActiveIndex();
  swiper.updateSlidesClasses();
  let newProgress;
  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
  if (translatesDiff === 0) {
    newProgress = 0;
  } else {
    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
  }
  if (newProgress !== swiper.progress) {
    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
  }
  swiper.emit('setTranslate', swiper.translate, false);
}
function onLoad(e) {
  const swiper = this;
  processLazyPreloader(swiper, e.target);
  if (swiper.params.cssMode || swiper.params.slidesPerView !== 'auto' && !swiper.params.autoHeight) {
    return;
  }
  swiper.update();
}
function onDocumentTouchStart() {
  const swiper = this;
  if (swiper.documentTouchHandlerProceeded) return;
  swiper.documentTouchHandlerProceeded = true;
  if (swiper.params.touchReleaseOnEdges) {
    swiper.el.style.touchAction = 'auto';
  }
}
const events = (swiper, method) => {
  const document = getDocument();
  const {
    params,
    el,
    wrapperEl,
    device
  } = swiper;
  const capture = !!params.nested;
  const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
  const swiperMethod = method;
  if (!el || typeof el === 'string') return;

  // Touch Events
  document[domMethod]('touchstart', swiper.onDocumentTouchStart, {
    passive: false,
    capture
  });
  el[domMethod]('touchstart', swiper.onTouchStart, {
    passive: false
  });
  el[domMethod]('pointerdown', swiper.onTouchStart, {
    passive: false
  });
  document[domMethod]('touchmove', swiper.onTouchMove, {
    passive: false,
    capture
  });
  document[domMethod]('pointermove', swiper.onTouchMove, {
    passive: false,
    capture
  });
  document[domMethod]('touchend', swiper.onTouchEnd, {
    passive: true
  });
  document[domMethod]('pointerup', swiper.onTouchEnd, {
    passive: true
  });
  document[domMethod]('pointercancel', swiper.onTouchEnd, {
    passive: true
  });
  document[domMethod]('touchcancel', swiper.onTouchEnd, {
    passive: true
  });
  document[domMethod]('pointerout', swiper.onTouchEnd, {
    passive: true
  });
  document[domMethod]('pointerleave', swiper.onTouchEnd, {
    passive: true
  });
  document[domMethod]('contextmenu', swiper.onTouchEnd, {
    passive: true
  });

  // Prevent Links Clicks
  if (params.preventClicks || params.preventClicksPropagation) {
    el[domMethod]('click', swiper.onClick, true);
  }
  if (params.cssMode) {
    wrapperEl[domMethod]('scroll', swiper.onScroll);
  }

  // Resize handler
  if (params.updateOnWindowResize) {
    swiper[swiperMethod](device.ios || device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate', onResize, true);
  } else {
    swiper[swiperMethod]('observerUpdate', onResize, true);
  }

  // Images loader
  el[domMethod]('load', swiper.onLoad, {
    capture: true
  });
};
function attachEvents() {
  const swiper = this;
  const {
    params
  } = swiper;
  swiper.onTouchStart = onTouchStart.bind(swiper);
  swiper.onTouchMove = onTouchMove.bind(swiper);
  swiper.onTouchEnd = onTouchEnd.bind(swiper);
  swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
  if (params.cssMode) {
    swiper.onScroll = onScroll.bind(swiper);
  }
  swiper.onClick = onClick.bind(swiper);
  swiper.onLoad = onLoad.bind(swiper);
  events(swiper, 'on');
}
function detachEvents() {
  const swiper = this;
  events(swiper, 'off');
}
var events$1 = {
  attachEvents,
  detachEvents
};
const isGridEnabled = (swiper, params) => {
  return swiper.grid && params.grid && params.grid.rows > 1;
};
function setBreakpoint() {
  const swiper = this;
  const {
    realIndex,
    initialized,
    params,
    el
  } = swiper;
  const breakpoints = params.breakpoints;
  if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;

  // Get breakpoint for window width and update parameters
  const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
  const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
  const wasMultiRow = isGridEnabled(swiper, params);
  const isMultiRow = isGridEnabled(swiper, breakpointParams);
  const wasGrabCursor = swiper.params.grabCursor;
  const isGrabCursor = breakpointParams.grabCursor;
  const wasEnabled = params.enabled;
  if (wasMultiRow && !isMultiRow) {
    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
    swiper.emitContainerClasses();
  } else if (!wasMultiRow && isMultiRow) {
    el.classList.add(`${params.containerModifierClass}grid`);
    if (breakpointParams.grid.fill && breakpointParams.grid.fill === 'column' || !breakpointParams.grid.fill && params.grid.fill === 'column') {
      el.classList.add(`${params.containerModifierClass}grid-column`);
    }
    swiper.emitContainerClasses();
  }
  if (wasGrabCursor && !isGrabCursor) {
    swiper.unsetGrabCursor();
  } else if (!wasGrabCursor && isGrabCursor) {
    swiper.setGrabCursor();
  }

  // Toggle navigation, pagination, scrollbar
  ['navigation', 'pagination', 'scrollbar'].forEach(prop => {
    if (typeof breakpointParams[prop] === 'undefined') return;
    const wasModuleEnabled = params[prop] && params[prop].enabled;
    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
    if (wasModuleEnabled && !isModuleEnabled) {
      swiper[prop].disable();
    }
    if (!wasModuleEnabled && isModuleEnabled) {
      swiper[prop].enable();
    }
  });
  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
  const wasLoop = params.loop;
  if (directionChanged && initialized) {
    swiper.changeDirection();
  }
  extend(swiper.params, breakpointParams);
  const isEnabled = swiper.params.enabled;
  const hasLoop = swiper.params.loop;
  Object.assign(swiper, {
    allowTouchMove: swiper.params.allowTouchMove,
    allowSlideNext: swiper.params.allowSlideNext,
    allowSlidePrev: swiper.params.allowSlidePrev
  });
  if (wasEnabled && !isEnabled) {
    swiper.disable();
  } else if (!wasEnabled && isEnabled) {
    swiper.enable();
  }
  swiper.currentBreakpoint = breakpoint;
  swiper.emit('_beforeBreakpoint', breakpointParams);
  if (initialized) {
    if (needsReLoop) {
      swiper.loopDestroy();
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (!wasLoop && hasLoop) {
      swiper.loopCreate(realIndex);
      swiper.updateSlides();
    } else if (wasLoop && !hasLoop) {
      swiper.loopDestroy();
    }
  }
  swiper.emit('breakpoint', breakpointParams);
}
function getBreakpoint(breakpoints, base, containerEl) {
  if (base === void 0) {
    base = 'window';
  }
  if (!breakpoints || base === 'container' && !containerEl) return undefined;
  let breakpoint = false;
  const window = getWindow();
  const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
  const points = Object.keys(breakpoints).map(point => {
    if (typeof point === 'string' && point.indexOf('@') === 0) {
      const minRatio = parseFloat(point.substr(1));
      const value = currentHeight * minRatio;
      return {
        value,
        point
      };
    }
    return {
      value: point,
      point
    };
  });
  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
  for (let i = 0; i < points.length; i += 1) {
    const {
      point,
      value
    } = points[i];
    if (base === 'window') {
      if (window.matchMedia(`(min-width: ${value}px)`).matches) {
        breakpoint = point;
      }
    } else if (value <= containerEl.clientWidth) {
      breakpoint = point;
    }
  }
  return breakpoint || 'max';
}
var breakpoints = {
  setBreakpoint,
  getBreakpoint
};
function prepareClasses(entries, prefix) {
  const resultClasses = [];
  entries.forEach(item => {
    if (typeof item === 'object') {
      Object.keys(item).forEach(classNames => {
        if (item[classNames]) {
          resultClasses.push(prefix + classNames);
        }
      });
    } else if (typeof item === 'string') {
      resultClasses.push(prefix + item);
    }
  });
  return resultClasses;
}
function addClasses$3() {
  const swiper = this;
  const {
    classNames,
    params,
    rtl,
    el,
    device
  } = swiper;
  // prettier-ignore
  const suffixes = prepareClasses(['initialized', params.direction, {
    'free-mode': swiper.params.freeMode && params.freeMode.enabled
  }, {
    'autoheight': params.autoHeight
  }, {
    'rtl': rtl
  }, {
    'grid': params.grid && params.grid.rows > 1
  }, {
    'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column'
  }, {
    'android': device.android
  }, {
    'ios': device.ios
  }, {
    'css-mode': params.cssMode
  }, {
    'centered': params.cssMode && params.centeredSlides
  }, {
    'watch-progress': params.watchSlidesProgress
  }], params.containerModifierClass);
  classNames.push(...suffixes);
  el.classList.add(...classNames);
  swiper.emitContainerClasses();
}
function removeClasses$2() {
  const swiper = this;
  const {
    el,
    classNames
  } = swiper;
  if (!el || typeof el === 'string') return;
  el.classList.remove(...classNames);
  swiper.emitContainerClasses();
}
var classes = {
  addClasses: addClasses$3,
  removeClasses: removeClasses$2
};
function checkOverflow() {
  const swiper = this;
  const {
    isLocked: wasLocked,
    params
  } = swiper;
  const {
    slidesOffsetBefore
  } = params;
  if (slidesOffsetBefore) {
    const lastSlideIndex = swiper.slides.length - 1;
    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
    swiper.isLocked = swiper.size > lastSlideRightEdge;
  } else {
    swiper.isLocked = swiper.snapGrid.length === 1;
  }
  if (params.allowSlideNext === true) {
    swiper.allowSlideNext = !swiper.isLocked;
  }
  if (params.allowSlidePrev === true) {
    swiper.allowSlidePrev = !swiper.isLocked;
  }
  if (wasLocked && wasLocked !== swiper.isLocked) {
    swiper.isEnd = false;
  }
  if (wasLocked !== swiper.isLocked) {
    swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
  }
}
var checkOverflow$1 = {
  checkOverflow
};
var defaults$1 = {
  init: true,
  direction: 'horizontal',
  oneWayMovement: false,
  swiperElementNodeName: 'SWIPER-CONTAINER',
  touchEventsTarget: 'wrapper',
  initialSlide: 0,
  speed: 300,
  cssMode: false,
  updateOnWindowResize: true,
  resizeObserver: true,
  nested: false,
  createElements: false,
  eventsPrefix: 'swiper',
  enabled: true,
  focusableElements: 'input, select, option, textarea, button, video, label',
  // Overrides
  width: null,
  height: null,
  //
  preventInteractionOnTransition: false,
  // ssr
  userAgent: null,
  url: null,
  // To support iOS's swipe-to-go-back gesture (when being used in-app).
  edgeSwipeDetection: false,
  edgeSwipeThreshold: 20,
  // Autoheight
  autoHeight: false,
  // Set wrapper width
  setWrapperSize: false,
  // Virtual Translate
  virtualTranslate: false,
  // Effects
  effect: 'slide',
  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

  // Breakpoints
  breakpoints: undefined,
  breakpointsBase: 'window',
  // Slides grid
  spaceBetween: 0,
  slidesPerView: 1,
  slidesPerGroup: 1,
  slidesPerGroupSkip: 0,
  slidesPerGroupAuto: false,
  centeredSlides: false,
  centeredSlidesBounds: false,
  slidesOffsetBefore: 0,
  // in px
  slidesOffsetAfter: 0,
  // in px
  normalizeSlideIndex: true,
  centerInsufficientSlides: false,
  // Disable swiper and hide navigation when container not overflow
  watchOverflow: true,
  // Round length
  roundLengths: false,
  // Touches
  touchRatio: 1,
  touchAngle: 45,
  simulateTouch: true,
  shortSwipes: true,
  longSwipes: true,
  longSwipesRatio: 0.5,
  longSwipesMs: 300,
  followFinger: true,
  allowTouchMove: true,
  threshold: 5,
  touchMoveStopPropagation: false,
  touchStartPreventDefault: true,
  touchStartForcePreventDefault: false,
  touchReleaseOnEdges: false,
  // Unique Navigation Elements
  uniqueNavElements: true,
  // Resistance
  resistance: true,
  resistanceRatio: 0.85,
  // Progress
  watchSlidesProgress: false,
  // Cursor
  grabCursor: false,
  // Clicks
  preventClicks: true,
  preventClicksPropagation: true,
  slideToClickedSlide: false,
  // loop
  loop: false,
  loopAddBlankSlides: true,
  loopAdditionalSlides: 0,
  loopPreventsSliding: true,
  // rewind
  rewind: false,
  // Swiping/no swiping
  allowSlidePrev: true,
  allowSlideNext: true,
  swipeHandler: null,
  // '.swipe-handler',
  noSwiping: true,
  noSwipingClass: 'swiper-no-swiping',
  noSwipingSelector: null,
  // Passive Listeners
  passiveListeners: true,
  maxBackfaceHiddenSlides: 10,
  // NS
  containerModifierClass: 'swiper-',
  // NEW
  slideClass: 'swiper-slide',
  slideBlankClass: 'swiper-slide-blank',
  slideActiveClass: 'swiper-slide-active',
  slideVisibleClass: 'swiper-slide-visible',
  slideFullyVisibleClass: 'swiper-slide-fully-visible',
  slideNextClass: 'swiper-slide-next',
  slidePrevClass: 'swiper-slide-prev',
  wrapperClass: 'swiper-wrapper',
  lazyPreloaderClass: 'swiper-lazy-preloader',
  lazyPreloadPrevNext: 0,
  // Callbacks
  runCallbacksOnInit: true,
  // Internals
  _emitClasses: false
};
function moduleExtendParams(params, allModulesParams) {
  return function extendParams(obj) {
    if (obj === void 0) {
      obj = {};
    }
    const moduleParamName = Object.keys(obj)[0];
    const moduleParams = obj[moduleParamName];
    if (typeof moduleParams !== 'object' || moduleParams === null) {
      extend(allModulesParams, obj);
      return;
    }
    if (params[moduleParamName] === true) {
      params[moduleParamName] = {
        enabled: true
      };
    }
    if (moduleParamName === 'navigation' && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
      params[moduleParamName].auto = true;
    }
    if (['pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
      params[moduleParamName].auto = true;
    }
    if (!(moduleParamName in params && 'enabled' in moduleParams)) {
      extend(allModulesParams, obj);
      return;
    }
    if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
      params[moduleParamName].enabled = true;
    }
    if (!params[moduleParamName]) params[moduleParamName] = {
      enabled: false
    };
    extend(allModulesParams, obj);
  };
}

/* eslint no-param-reassign: "off" */
const prototypes = {
  eventsEmitter,
  update,
  translate,
  transition,
  slide,
  loop,
  grabCursor,
  events: events$1,
  breakpoints,
  checkOverflow: checkOverflow$1,
  classes
};
const extendedDefaults = {};
class Swiper {
  constructor() {
    let el;
    let params;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
      params = args[0];
    } else {
      [el, params] = args;
    }
    if (!params) params = {};
    params = extend({}, params);
    if (el && !params.el) params.el = el;
    const document = getDocument();
    if (params.el && typeof params.el === 'string' && document.querySelectorAll(params.el).length > 1) {
      const swipers = [];
      document.querySelectorAll(params.el).forEach(containerEl => {
        const newParams = extend({}, params, {
          el: containerEl
        });
        swipers.push(new Swiper(newParams));
      });
      // eslint-disable-next-line no-constructor-return
      return swipers;
    }

    // Swiper Instance
    const swiper = this;
    swiper.__swiper__ = true;
    swiper.support = getSupport();
    swiper.device = getDevice({
      userAgent: params.userAgent
    });
    swiper.browser = getBrowser();
    swiper.eventsListeners = {};
    swiper.eventsAnyListeners = [];
    swiper.modules = [...swiper.__modules__];
    if (params.modules && Array.isArray(params.modules)) {
      swiper.modules.push(...params.modules);
    }
    const allModulesParams = {};
    swiper.modules.forEach(mod => {
      mod({
        params,
        swiper,
        extendParams: moduleExtendParams(params, allModulesParams),
        on: swiper.on.bind(swiper),
        once: swiper.once.bind(swiper),
        off: swiper.off.bind(swiper),
        emit: swiper.emit.bind(swiper)
      });
    });

    // Extend defaults with modules params
    const swiperParams = extend({}, defaults$1, allModulesParams);

    // Extend defaults with passed params
    swiper.params = extend({}, swiperParams, extendedDefaults, params);
    swiper.originalParams = extend({}, swiper.params);
    swiper.passedParams = extend({}, params);

    // add event listeners
    if (swiper.params && swiper.params.on) {
      Object.keys(swiper.params.on).forEach(eventName => {
        swiper.on(eventName, swiper.params.on[eventName]);
      });
    }
    if (swiper.params && swiper.params.onAny) {
      swiper.onAny(swiper.params.onAny);
    }

    // Extend Swiper
    Object.assign(swiper, {
      enabled: swiper.params.enabled,
      el,
      // Classes
      classNames: [],
      // Slides
      slides: [],
      slidesGrid: [],
      snapGrid: [],
      slidesSizesGrid: [],
      // isDirection
      isHorizontal() {
        return swiper.params.direction === 'horizontal';
      },
      isVertical() {
        return swiper.params.direction === 'vertical';
      },
      // Indexes
      activeIndex: 0,
      realIndex: 0,
      //
      isBeginning: true,
      isEnd: false,
      // Props
      translate: 0,
      previousTranslate: 0,
      progress: 0,
      velocity: 0,
      animating: false,
      cssOverflowAdjustment() {
        // Returns 0 unless `translate` is > 2**23
        // Should be subtracted from css values to prevent overflow
        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
      },
      // Locks
      allowSlideNext: swiper.params.allowSlideNext,
      allowSlidePrev: swiper.params.allowSlidePrev,
      // Touch Events
      touchEventsData: {
        isTouched: undefined,
        isMoved: undefined,
        allowTouchCallbacks: undefined,
        touchStartTime: undefined,
        isScrolling: undefined,
        currentTranslate: undefined,
        startTranslate: undefined,
        allowThresholdMove: undefined,
        // Form elements to match
        focusableElements: swiper.params.focusableElements,
        // Last click time
        lastClickTime: 0,
        clickTimeout: undefined,
        // Velocities
        velocities: [],
        allowMomentumBounce: undefined,
        startMoving: undefined,
        pointerId: null,
        touchId: null
      },
      // Clicks
      allowClick: true,
      // Touches
      allowTouchMove: swiper.params.allowTouchMove,
      touches: {
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        diff: 0
      },
      // Images
      imagesToLoad: [],
      imagesLoaded: 0
    });
    swiper.emit('_swiper');

    // Init
    if (swiper.params.init) {
      swiper.init();
    }

    // Return app instance
    // eslint-disable-next-line no-constructor-return
    return swiper;
  }
  getDirectionLabel(property) {
    if (this.isHorizontal()) {
      return property;
    }
    // prettier-ignore
    return {
      'width': 'height',
      'margin-top': 'margin-left',
      'margin-bottom ': 'margin-right',
      'margin-left': 'margin-top',
      'margin-right': 'margin-bottom',
      'padding-left': 'padding-top',
      'padding-right': 'padding-bottom',
      'marginRight': 'marginBottom'
    }[property];
  }
  getSlideIndex(slideEl) {
    const {
      slidesEl,
      params
    } = this;
    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
    const firstSlideIndex = elementIndex(slides[0]);
    return elementIndex(slideEl) - firstSlideIndex;
  }
  getSlideIndexByData(index) {
    return this.getSlideIndex(this.slides.filter(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === index)[0]);
  }
  recalcSlides() {
    const swiper = this;
    const {
      slidesEl,
      params
    } = swiper;
    swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
  }
  enable() {
    const swiper = this;
    if (swiper.enabled) return;
    swiper.enabled = true;
    if (swiper.params.grabCursor) {
      swiper.setGrabCursor();
    }
    swiper.emit('enable');
  }
  disable() {
    const swiper = this;
    if (!swiper.enabled) return;
    swiper.enabled = false;
    if (swiper.params.grabCursor) {
      swiper.unsetGrabCursor();
    }
    swiper.emit('disable');
  }
  setProgress(progress, speed) {
    const swiper = this;
    progress = Math.min(Math.max(progress, 0), 1);
    const min = swiper.minTranslate();
    const max = swiper.maxTranslate();
    const current = (max - min) * progress + min;
    swiper.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
    swiper.updateActiveIndex();
    swiper.updateSlidesClasses();
  }
  emitContainerClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const cls = swiper.el.className.split(' ').filter(className => {
      return className.indexOf('swiper') === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
    });
    swiper.emit('_containerClasses', cls.join(' '));
  }
  getSlideClasses(slideEl) {
    const swiper = this;
    if (swiper.destroyed) return '';
    return slideEl.className.split(' ').filter(className => {
      return className.indexOf('swiper-slide') === 0 || className.indexOf(swiper.params.slideClass) === 0;
    }).join(' ');
  }
  emitSlidesClasses() {
    const swiper = this;
    if (!swiper.params._emitClasses || !swiper.el) return;
    const updates = [];
    swiper.slides.forEach(slideEl => {
      const classNames = swiper.getSlideClasses(slideEl);
      updates.push({
        slideEl,
        classNames
      });
      swiper.emit('_slideClass', slideEl, classNames);
    });
    swiper.emit('_slideClasses', updates);
  }
  slidesPerViewDynamic(view, exact) {
    if (view === void 0) {
      view = 'current';
    }
    if (exact === void 0) {
      exact = false;
    }
    const swiper = this;
    const {
      params,
      slides,
      slidesGrid,
      slidesSizesGrid,
      size: swiperSize,
      activeIndex
    } = swiper;
    let spv = 1;
    if (typeof params.slidesPerView === 'number') return params.slidesPerView;
    if (params.centeredSlides) {
      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
      let breakLoop;
      for (let i = activeIndex + 1; i < slides.length; i += 1) {
        if (slides[i] && !breakLoop) {
          slideSize += Math.ceil(slides[i].swiperSlideSize);
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
      for (let i = activeIndex - 1; i >= 0; i -= 1) {
        if (slides[i] && !breakLoop) {
          slideSize += slides[i].swiperSlideSize;
          spv += 1;
          if (slideSize > swiperSize) breakLoop = true;
        }
      }
    } else {
      // eslint-disable-next-line
      if (view === 'current') {
        for (let i = activeIndex + 1; i < slides.length; i += 1) {
          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      } else {
        // previous
        for (let i = activeIndex - 1; i >= 0; i -= 1) {
          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
          if (slideInView) {
            spv += 1;
          }
        }
      }
    }
    return spv;
  }
  update() {
    const swiper = this;
    if (!swiper || swiper.destroyed) return;
    const {
      snapGrid,
      params
    } = swiper;
    // Breakpoints
    if (params.breakpoints) {
      swiper.setBreakpoint();
    }
    [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach(imageEl => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      }
    });
    swiper.updateSize();
    swiper.updateSlides();
    swiper.updateProgress();
    swiper.updateSlidesClasses();
    function setTranslate() {
      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
      swiper.setTranslate(newTranslate);
      swiper.updateActiveIndex();
      swiper.updateSlidesClasses();
    }
    let translated;
    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
      setTranslate();
      if (params.autoHeight) {
        swiper.updateAutoHeight();
      }
    } else {
      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
        const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
        translated = swiper.slideTo(slides.length - 1, 0, false, true);
      } else {
        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
      }
      if (!translated) {
        setTranslate();
      }
    }
    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
      swiper.checkOverflow();
    }
    swiper.emit('update');
  }
  changeDirection(newDirection, needUpdate) {
    if (needUpdate === void 0) {
      needUpdate = true;
    }
    const swiper = this;
    const currentDirection = swiper.params.direction;
    if (!newDirection) {
      // eslint-disable-next-line
      newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
    }
    if (newDirection === currentDirection || newDirection !== 'horizontal' && newDirection !== 'vertical') {
      return swiper;
    }
    swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
    swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
    swiper.emitContainerClasses();
    swiper.params.direction = newDirection;
    swiper.slides.forEach(slideEl => {
      if (newDirection === 'vertical') {
        slideEl.style.width = '';
      } else {
        slideEl.style.height = '';
      }
    });
    swiper.emit('changeDirection');
    if (needUpdate) swiper.update();
    return swiper;
  }
  changeLanguageDirection(direction) {
    const swiper = this;
    if (swiper.rtl && direction === 'rtl' || !swiper.rtl && direction === 'ltr') return;
    swiper.rtl = direction === 'rtl';
    swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;
    if (swiper.rtl) {
      swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = 'rtl';
    } else {
      swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
      swiper.el.dir = 'ltr';
    }
    swiper.update();
  }
  mount(element) {
    const swiper = this;
    if (swiper.mounted) return true;

    // Find el
    let el = element || swiper.params.el;
    if (typeof el === 'string') {
      el = document.querySelector(el);
    }
    if (!el) {
      return false;
    }
    el.swiper = swiper;
    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
      swiper.isElement = true;
    }
    const getWrapperSelector = () => {
      return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
    };
    const getWrapper = () => {
      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
        const res = el.shadowRoot.querySelector(getWrapperSelector());
        // Children needs to return slot items
        return res;
      }
      return elementChildren(el, getWrapperSelector())[0];
    };
    // Find Wrapper
    let wrapperEl = getWrapper();
    if (!wrapperEl && swiper.params.createElements) {
      wrapperEl = createElement('div', swiper.params.wrapperClass);
      el.append(wrapperEl);
      elementChildren(el, `.${swiper.params.slideClass}`).forEach(slideEl => {
        wrapperEl.append(slideEl);
      });
    }
    Object.assign(swiper, {
      el,
      wrapperEl,
      slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
      hostEl: swiper.isElement ? el.parentNode.host : el,
      mounted: true,
      // RTL
      rtl: el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl',
      rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl'),
      wrongRTL: elementStyle(wrapperEl, 'display') === '-webkit-box'
    });
    return true;
  }
  init(el) {
    const swiper = this;
    if (swiper.initialized) return swiper;
    const mounted = swiper.mount(el);
    if (mounted === false) return swiper;
    swiper.emit('beforeInit');

    // Set breakpoint
    if (swiper.params.breakpoints) {
      swiper.setBreakpoint();
    }

    // Add Classes
    swiper.addClasses();

    // Update size
    swiper.updateSize();

    // Update slides
    swiper.updateSlides();
    if (swiper.params.watchOverflow) {
      swiper.checkOverflow();
    }

    // Set Grab Cursor
    if (swiper.params.grabCursor && swiper.enabled) {
      swiper.setGrabCursor();
    }

    // Slide To Initial Slide
    if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
      swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
    } else {
      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
    }

    // Create loop
    if (swiper.params.loop) {
      swiper.loopCreate();
    }

    // Attach events
    swiper.attachEvents();
    const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
    if (swiper.isElement) {
      lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
    }
    lazyElements.forEach(imageEl => {
      if (imageEl.complete) {
        processLazyPreloader(swiper, imageEl);
      } else {
        imageEl.addEventListener('load', e => {
          processLazyPreloader(swiper, e.target);
        });
      }
    });
    preload(swiper);

    // Init Flag
    swiper.initialized = true;
    preload(swiper);

    // Emit
    swiper.emit('init');
    swiper.emit('afterInit');
    return swiper;
  }
  destroy(deleteInstance, cleanStyles) {
    if (deleteInstance === void 0) {
      deleteInstance = true;
    }
    if (cleanStyles === void 0) {
      cleanStyles = true;
    }
    const swiper = this;
    const {
      params,
      el,
      wrapperEl,
      slides
    } = swiper;
    if (typeof swiper.params === 'undefined' || swiper.destroyed) {
      return null;
    }
    swiper.emit('beforeDestroy');

    // Init Flag
    swiper.initialized = false;

    // Detach events
    swiper.detachEvents();

    // Destroy loop
    if (params.loop) {
      swiper.loopDestroy();
    }

    // Cleanup styles
    if (cleanStyles) {
      swiper.removeClasses();
      if (el && typeof el !== 'string') {
        el.removeAttribute('style');
      }
      if (wrapperEl) {
        wrapperEl.removeAttribute('style');
      }
      if (slides && slides.length) {
        slides.forEach(slideEl => {
          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
          slideEl.removeAttribute('style');
          slideEl.removeAttribute('data-swiper-slide-index');
        });
      }
    }
    swiper.emit('destroy');

    // Detach emitter events
    Object.keys(swiper.eventsListeners).forEach(eventName => {
      swiper.off(eventName);
    });
    if (deleteInstance !== false) {
      if (swiper.el && typeof swiper.el !== 'string') {
        swiper.el.swiper = null;
      }
      deleteProps(swiper);
    }
    swiper.destroyed = true;
    return null;
  }
  static extendDefaults(newDefaults) {
    extend(extendedDefaults, newDefaults);
  }
  static get extendedDefaults() {
    return extendedDefaults;
  }
  static get defaults() {
    return defaults$1;
  }
  static installModule(mod) {
    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
    const modules = Swiper.prototype.__modules__;
    if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
      modules.push(mod);
    }
  }
  static use(module) {
    if (Array.isArray(module)) {
      module.forEach(m => Swiper.installModule(m));
      return Swiper;
    }
    Swiper.installModule(module);
    return Swiper;
  }
}
Object.keys(prototypes).forEach(prototypeGroup => {
  Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
  });
});
Swiper.use([Resize, Observer]);function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
  if (swiper.params.createElements) {
    Object.keys(checkProps).forEach(key => {
      if (!params[key] && params.auto === true) {
        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
        if (!element) {
          element = createElement('div', checkProps[key]);
          element.className = checkProps[key];
          swiper.el.append(element);
        }
        params[key] = element;
        originalParams[key] = element;
      }
    });
  }
  return params;
}function classesToSelector(classes) {
  if (classes === void 0) {
    classes = '';
  }
  return `.${classes.trim().replace(/([\.:!+\/])/g, '\\$1') // eslint-disable-line
  .replace(/ /g, '.')}`;
}function Pagination(_ref) {
  let {
    swiper,
    extendParams,
    on,
    emit
  } = _ref;
  const pfx = 'swiper-pagination';
  extendParams({
    pagination: {
      el: null,
      bulletElement: 'span',
      clickable: false,
      hideOnClick: false,
      renderBullet: null,
      renderProgressbar: null,
      renderFraction: null,
      renderCustom: null,
      progressbarOpposite: false,
      type: 'bullets',
      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
      dynamicBullets: false,
      dynamicMainBullets: 1,
      formatFractionCurrent: number => number,
      formatFractionTotal: number => number,
      bulletClass: `${pfx}-bullet`,
      bulletActiveClass: `${pfx}-bullet-active`,
      modifierClass: `${pfx}-`,
      currentClass: `${pfx}-current`,
      totalClass: `${pfx}-total`,
      hiddenClass: `${pfx}-hidden`,
      progressbarFillClass: `${pfx}-progressbar-fill`,
      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
      clickableClass: `${pfx}-clickable`,
      lockClass: `${pfx}-lock`,
      horizontalClass: `${pfx}-horizontal`,
      verticalClass: `${pfx}-vertical`,
      paginationDisabledClass: `${pfx}-disabled`
    }
  });
  swiper.pagination = {
    el: null,
    bullets: []
  };
  let bulletSize;
  let dynamicBulletIndex = 0;
  function isPaginationDisabled() {
    return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
  }
  function setSideBullets(bulletEl, position) {
    const {
      bulletActiveClass
    } = swiper.params.pagination;
    if (!bulletEl) return;
    bulletEl = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
    if (bulletEl) {
      bulletEl.classList.add(`${bulletActiveClass}-${position}`);
      bulletEl = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
      if (bulletEl) {
        bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
      }
    }
  }
  function getMoveDirection(prevIndex, nextIndex, length) {
    prevIndex = prevIndex % length;
    nextIndex = nextIndex % length;
    if (nextIndex === prevIndex + 1) {
      return 'next';
    } else if (nextIndex === prevIndex - 1) {
      return 'previous';
    }
    return;
  }
  function onBulletClick(e) {
    const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
    if (!bulletEl) {
      return;
    }
    e.preventDefault();
    const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
    if (swiper.params.loop) {
      if (swiper.realIndex === index) return;
      const moveDirection = getMoveDirection(swiper.realIndex, index, swiper.slides.length);
      if (moveDirection === 'next') {
        swiper.slideNext();
      } else if (moveDirection === 'previous') {
        swiper.slidePrev();
      } else {
        swiper.slideToLoop(index);
      }
    } else {
      swiper.slideTo(index);
    }
  }
  function update() {
    // Render || Update Pagination bullets/items
    const rtl = swiper.rtl;
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    // Current/Total
    let current;
    let previousIndex;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
    const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
    if (swiper.params.loop) {
      previousIndex = swiper.previousRealIndex || 0;
      current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
    } else if (typeof swiper.snapIndex !== 'undefined') {
      current = swiper.snapIndex;
      previousIndex = swiper.previousSnapIndex;
    } else {
      previousIndex = swiper.previousIndex || 0;
      current = swiper.activeIndex || 0;
    }
    // Types
    if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
      const bullets = swiper.pagination.bullets;
      let firstIndex;
      let lastIndex;
      let midIndex;
      if (params.dynamicBullets) {
        bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? 'width' : 'height');
        el.forEach(subEl => {
          subEl.style[swiper.isHorizontal() ? 'width' : 'height'] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
        });
        if (params.dynamicMainBullets > 1 && previousIndex !== undefined) {
          dynamicBulletIndex += current - (previousIndex || 0);
          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
            dynamicBulletIndex = params.dynamicMainBullets - 1;
          } else if (dynamicBulletIndex < 0) {
            dynamicBulletIndex = 0;
          }
        }
        firstIndex = Math.max(current - dynamicBulletIndex, 0);
        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
        midIndex = (lastIndex + firstIndex) / 2;
      }
      bullets.forEach(bulletEl => {
        const classesToRemove = [...['', '-next', '-next-next', '-prev', '-prev-prev', '-main'].map(suffix => `${params.bulletActiveClass}${suffix}`)].map(s => typeof s === 'string' && s.includes(' ') ? s.split(' ') : s).flat();
        bulletEl.classList.remove(...classesToRemove);
      });
      if (el.length > 1) {
        bullets.forEach(bullet => {
          const bulletIndex = elementIndex(bullet);
          if (bulletIndex === current) {
            bullet.classList.add(...params.bulletActiveClass.split(' '));
          } else if (swiper.isElement) {
            bullet.setAttribute('part', 'bullet');
          }
          if (params.dynamicBullets) {
            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
              bullet.classList.add(...`${params.bulletActiveClass}-main`.split(' '));
            }
            if (bulletIndex === firstIndex) {
              setSideBullets(bullet, 'prev');
            }
            if (bulletIndex === lastIndex) {
              setSideBullets(bullet, 'next');
            }
          }
        });
      } else {
        const bullet = bullets[current];
        if (bullet) {
          bullet.classList.add(...params.bulletActiveClass.split(' '));
        }
        if (swiper.isElement) {
          bullets.forEach((bulletEl, bulletIndex) => {
            bulletEl.setAttribute('part', bulletIndex === current ? 'bullet-active' : 'bullet');
          });
        }
        if (params.dynamicBullets) {
          const firstDisplayedBullet = bullets[firstIndex];
          const lastDisplayedBullet = bullets[lastIndex];
          for (let i = firstIndex; i <= lastIndex; i += 1) {
            if (bullets[i]) {
              bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(' '));
            }
          }
          setSideBullets(firstDisplayedBullet, 'prev');
          setSideBullets(lastDisplayedBullet, 'next');
        }
      }
      if (params.dynamicBullets) {
        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
        const offsetProp = rtl ? 'right' : 'left';
        bullets.forEach(bullet => {
          bullet.style[swiper.isHorizontal() ? offsetProp : 'top'] = `${bulletsOffset}px`;
        });
      }
    }
    el.forEach((subEl, subElIndex) => {
      if (params.type === 'fraction') {
        subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach(fractionEl => {
          fractionEl.textContent = params.formatFractionCurrent(current + 1);
        });
        subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach(totalEl => {
          totalEl.textContent = params.formatFractionTotal(total);
        });
      }
      if (params.type === 'progressbar') {
        let progressbarDirection;
        if (params.progressbarOpposite) {
          progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
        } else {
          progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
        }
        const scale = (current + 1) / total;
        let scaleX = 1;
        let scaleY = 1;
        if (progressbarDirection === 'horizontal') {
          scaleX = scale;
        } else {
          scaleY = scale;
        }
        subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach(progressEl => {
          progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
          progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
        });
      }
      if (params.type === 'custom' && params.renderCustom) {
        subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
        if (subElIndex === 0) emit('paginationRender', subEl);
      } else {
        if (subElIndex === 0) emit('paginationRender', subEl);
        emit('paginationUpdate', subEl);
      }
      if (swiper.params.watchOverflow && swiper.enabled) {
        subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
      }
    });
  }
  function render() {
    // Render Container
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
    let el = swiper.pagination.el;
    el = makeElementsArray(el);
    let paginationHTML = '';
    if (params.type === 'bullets') {
      let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
      if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
        numberOfBullets = slidesLength;
      }
      for (let i = 0; i < numberOfBullets; i += 1) {
        if (params.renderBullet) {
          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
        } else {
          // prettier-ignore
          paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ''} class="${params.bulletClass}"></${params.bulletElement}>`;
        }
      }
    }
    if (params.type === 'fraction') {
      if (params.renderFraction) {
        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
      } else {
        paginationHTML = `<span class="${params.currentClass}"></span>` + ' / ' + `<span class="${params.totalClass}"></span>`;
      }
    }
    if (params.type === 'progressbar') {
      if (params.renderProgressbar) {
        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
      } else {
        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
      }
    }
    swiper.pagination.bullets = [];
    el.forEach(subEl => {
      if (params.type !== 'custom') {
        subEl.innerHTML = paginationHTML || '';
      }
      if (params.type === 'bullets') {
        swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
      }
    });
    if (params.type !== 'custom') {
      emit('paginationRender', el[0]);
    }
  }
  function init() {
    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
      el: 'swiper-pagination'
    });
    const params = swiper.params.pagination;
    if (!params.el) return;
    let el;
    if (typeof params.el === 'string' && swiper.isElement) {
      el = swiper.el.querySelector(params.el);
    }
    if (!el && typeof params.el === 'string') {
      el = [...document.querySelectorAll(params.el)];
    }
    if (!el) {
      el = params.el;
    }
    if (!el || el.length === 0) return;
    if (swiper.params.uniqueNavElements && typeof params.el === 'string' && Array.isArray(el) && el.length > 1) {
      el = [...swiper.el.querySelectorAll(params.el)];
      // check if it belongs to another nested Swiper
      if (el.length > 1) {
        el = el.filter(subEl => {
          if (elementParents(subEl, '.swiper')[0] !== swiper.el) return false;
          return true;
        })[0];
      }
    }
    if (Array.isArray(el) && el.length === 1) el = el[0];
    Object.assign(swiper.pagination, {
      el
    });
    el = makeElementsArray(el);
    el.forEach(subEl => {
      if (params.type === 'bullets' && params.clickable) {
        subEl.classList.add(...(params.clickableClass || '').split(' '));
      }
      subEl.classList.add(params.modifierClass + params.type);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
      if (params.type === 'bullets' && params.dynamicBullets) {
        subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
        dynamicBulletIndex = 0;
        if (params.dynamicMainBullets < 1) {
          params.dynamicMainBullets = 1;
        }
      }
      if (params.type === 'progressbar' && params.progressbarOpposite) {
        subEl.classList.add(params.progressbarOppositeClass);
      }
      if (params.clickable) {
        subEl.addEventListener('click', onBulletClick);
      }
      if (!swiper.enabled) {
        subEl.classList.add(params.lockClass);
      }
    });
  }
  function destroy() {
    const params = swiper.params.pagination;
    if (isPaginationDisabled()) return;
    let el = swiper.pagination.el;
    if (el) {
      el = makeElementsArray(el);
      el.forEach(subEl => {
        subEl.classList.remove(params.hiddenClass);
        subEl.classList.remove(params.modifierClass + params.type);
        subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
        if (params.clickable) {
          subEl.classList.remove(...(params.clickableClass || '').split(' '));
          subEl.removeEventListener('click', onBulletClick);
        }
      });
    }
    if (swiper.pagination.bullets) swiper.pagination.bullets.forEach(subEl => subEl.classList.remove(...params.bulletActiveClass.split(' ')));
  }
  on('changeDirection', () => {
    if (!swiper.pagination || !swiper.pagination.el) return;
    const params = swiper.params.pagination;
    let {
      el
    } = swiper.pagination;
    el = makeElementsArray(el);
    el.forEach(subEl => {
      subEl.classList.remove(params.horizontalClass, params.verticalClass);
      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
    });
  });
  on('init', () => {
    if (swiper.params.pagination.enabled === false) {
      // eslint-disable-next-line
      disable();
    } else {
      init();
      render();
      update();
    }
  });
  on('activeIndexChange', () => {
    if (typeof swiper.snapIndex === 'undefined') {
      update();
    }
  });
  on('snapIndexChange', () => {
    update();
  });
  on('snapGridLengthChange', () => {
    render();
    update();
  });
  on('destroy', () => {
    destroy();
  });
  on('enable disable', () => {
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach(subEl => subEl.classList[swiper.enabled ? 'remove' : 'add'](swiper.params.pagination.lockClass));
    }
  });
  on('lock unlock', () => {
    update();
  });
  on('click', (_s, e) => {
    const targetEl = e.target;
    const el = makeElementsArray(swiper.pagination.el);
    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
      const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
      if (isHidden === true) {
        emit('paginationShow');
      } else {
        emit('paginationHide');
      }
      el.forEach(subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
    }
  });
  const enable = () => {
    swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach(subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
    }
    init();
    render();
    update();
  };
  const disable = () => {
    swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
    let {
      el
    } = swiper.pagination;
    if (el) {
      el = makeElementsArray(el);
      el.forEach(subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
    }
    destroy();
  };
  Object.assign(swiper.pagination, {
    enable,
    disable,
    render,
    update,
    init,
    destroy
  });
}function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}var airDatepicker$1 = {exports: {}};var airDatepicker = airDatepicker$1.exports;
var hasRequiredAirDatepicker;
function requireAirDatepicker() {
  if (hasRequiredAirDatepicker) return airDatepicker$1.exports;
  hasRequiredAirDatepicker = 1;
  (function (module, exports) {
    !function (e, t) {
      module.exports = t() ;
    }(airDatepicker, function () {
      return function () {

        var e = {
            d: function (t, i) {
              for (var s in i) e.o(i, s) && !e.o(t, s) && Object.defineProperty(t, s, {
                enumerable: !0,
                get: i[s]
              });
            },
            o: function (e, t) {
              return Object.prototype.hasOwnProperty.call(e, t);
            }
          },
          t = {};
        e.d(t, {
          default: function () {
            return R;
          }
        });
        var i = {
            days: "days",
            months: "months",
            years: "years",
            day: "day",
            month: "month",
            year: "year",
            eventChangeViewDate: "changeViewDate",
            eventChangeCurrentView: "changeCurrentView",
            eventChangeFocusDate: "changeFocusDate",
            eventChangeSelectedDate: "changeSelectedDate",
            eventChangeTime: "changeTime",
            eventChangeLastSelectedDate: "changeLastSelectedDate",
            actionSelectDate: "selectDate",
            actionUnselectDate: "unselectDate",
            cssClassWeekend: "-weekend-"
          },
          s = {
            classes: "",
            inline: !1,
            locale: {
              days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
              daysShort: ["Вос", "Пон", "Вто", "Сре", "Чет", "Пят", "Суб"],
              daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
              months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
              monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
              today: "Сегодня",
              clear: "Очистить",
              dateFormat: "dd.MM.yyyy",
              timeFormat: "HH:mm",
              firstDay: 1
            },
            startDate: new Date(),
            firstDay: "",
            weekends: [6, 0],
            dateFormat: "",
            altField: "",
            altFieldDateFormat: "T",
            toggleSelected: !0,
            keyboardNav: !0,
            selectedDates: !1,
            container: "",
            isMobile: !1,
            visible: !1,
            position: "bottom left",
            offset: 12,
            view: i.days,
            minView: i.days,
            showOtherMonths: !0,
            selectOtherMonths: !0,
            moveToOtherMonthsOnSelect: !0,
            showOtherYears: !0,
            selectOtherYears: !0,
            moveToOtherYearsOnSelect: !0,
            minDate: "",
            maxDate: "",
            disableNavWhenOutOfRange: !0,
            multipleDates: !1,
            multipleDatesSeparator: ", ",
            range: !1,
            dynamicRange: !0,
            buttons: !1,
            monthsField: "monthsShort",
            showEvent: "focus",
            autoClose: !1,
            fixedHeight: !1,
            prevHtml: '<svg><path d="M 17,12 l -5,5 l 5,5"></path></svg>',
            nextHtml: '<svg><path d="M 14,12 l 5,5 l -5,5"></path></svg>',
            navTitles: {
              days: "MMMM, <i>yyyy</i>",
              months: "yyyy",
              years: "yyyy1 - yyyy2"
            },
            timepicker: !1,
            onlyTimepicker: !1,
            dateTimeSeparator: " ",
            timeFormat: "",
            minHours: 0,
            maxHours: 24,
            minMinutes: 0,
            maxMinutes: 59,
            hoursStep: 1,
            minutesStep: 1,
            onSelect: !1,
            onChangeViewDate: !1,
            onChangeView: !1,
            onRenderCell: !1,
            onShow: !1,
            onHide: !1,
            onClickDayName: !1
          };
        function a(e) {
          let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : document;
          return "string" == typeof e ? t.querySelector(e) : e;
        }
        function n() {
          let {
              tagName: e = "div",
              className: t = "",
              innerHtml: i = "",
              id: s = "",
              attrs: a = {}
            } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            n = document.createElement(e);
          return t && n.classList.add(...t.split(" ")), s && (n.id = s), i && (n.innerHTML = i), a && r(n, a), n;
        }
        function r(e, t) {
          for (let [i, s] of Object.entries(t)) void 0 !== s && e.setAttribute(i, s);
          return e;
        }
        function o(e) {
          return new Date(e.getFullYear(), e.getMonth() + 1, 0).getDate();
        }
        function h(e) {
          let t = e.getHours(),
            {
              hours: i,
              dayPeriod: s
            } = l(t);
          return {
            year: e.getFullYear(),
            month: e.getMonth(),
            fullMonth: e.getMonth() + 1 < 10 ? "0" + (e.getMonth() + 1) : e.getMonth() + 1,
            date: e.getDate(),
            fullDate: e.getDate() < 10 ? "0" + e.getDate() : e.getDate(),
            day: e.getDay(),
            hours: t,
            fullHours: d(t),
            hours12: i,
            dayPeriod: s,
            fullHours12: d(i),
            minutes: e.getMinutes(),
            fullMinutes: e.getMinutes() < 10 ? "0" + e.getMinutes() : e.getMinutes()
          };
        }
        function l(e) {
          return {
            dayPeriod: e > 11 ? "pm" : "am",
            hours: e % 12 == 0 ? 12 : e % 12
          };
        }
        function d(e) {
          return e < 10 ? "0" + e : e;
        }
        function c(e) {
          let t = 10 * Math.floor(e.getFullYear() / 10);
          return [t, t + 9];
        }
        function u() {
          let e = [];
          for (var t = arguments.length, i = new Array(t), s = 0; s < t; s++) i[s] = arguments[s];
          return i.forEach(t => {
            if ("object" == typeof t) for (let i in t) t[i] && e.push(i);else t && e.push(t);
          }), e.join(" ");
        }
        function p(e, t) {
          let s = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : i.days;
          if (!e || !t) return !1;
          let a = h(e),
            n = h(t);
          return {
            [i.days]: a.date === n.date && a.month === n.month && a.year === n.year,
            [i.months]: a.month === n.month && a.year === n.year,
            [i.years]: a.year === n.year
          }[s];
        }
        function m(e, t, i) {
          let s = g(e, !1).getTime(),
            a = g(t, !1).getTime();
          return i ? s >= a : s > a;
        }
        function v(e, t) {
          return !m(e, t, !0);
        }
        function g(e) {
          let t = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
            i = new Date(e.getTime());
          return "boolean" != typeof t || t || function (e) {
            e.setHours(0, 0, 0, 0);
          }(i), i;
        }
        function D(e, t, i) {
          e.length ? e.forEach(e => {
            e.addEventListener(t, i);
          }) : e.addEventListener(t, i);
        }
        function y(e, t) {
          return !(!e || e === document || e instanceof DocumentFragment) && (e.matches(t) ? e : y(e.parentNode, t));
        }
        function f(e, t, i) {
          return e > i ? i : e < t ? t : e;
        }
        function w(e) {
          for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) i[s - 1] = arguments[s];
          return i.filter(e => e).forEach(t => {
            for (let [i, s] of Object.entries(t)) if (void 0 !== s && "[object Object]" === s.toString()) {
              let t = void 0 !== e[i] ? e[i].toString() : void 0,
                a = s.toString(),
                n = Array.isArray(s) ? [] : {};
              e[i] = e[i] ? t !== a ? n : e[i] : n, w(e[i], s);
            } else e[i] = s;
          }), e;
        }
        function b(e) {
          let t = e;
          return e instanceof Date || ("string" == typeof e && /^\d{4}-\d{2}-\d{2}$/.test(e) && (e += "T00:00:00"), t = new Date(e)), isNaN(t.getTime()) && (console.log(`Unable to convert value "${e}" to Date object`), t = !1), t;
        }
        function k(e) {
          let t = "\\s|\\.|-|/|\\\\|,|\\$|\\!|\\?|:|;";
          return new RegExp("(^|>|" + t + ")(" + e + ")($|<|" + t + ")", "g");
        }
        function $(e, t, i) {
          return (t = function (e) {
            var t = function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var i = e[Symbol.toPrimitive];
              if (void 0 !== i) {
                var s = i.call(e, "string");
                if ("object" != typeof s) return s;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return String(e);
            }(e);
            return "symbol" == typeof t ? t : String(t);
          }(t)) in e ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = i, e;
        }
        class C {
          constructor() {
            let {
              type: e,
              date: t,
              dp: i,
              opts: s,
              body: a
            } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            $(this, "focus", () => {
              this.$cell.classList.add("-focus-"), this.focused = !0;
            }), $(this, "removeFocus", () => {
              this.$cell.classList.remove("-focus-"), this.focused = !1;
            }), $(this, "select", () => {
              this.$cell.classList.add("-selected-"), this.selected = !0;
            }), $(this, "removeSelect", () => {
              this.$cell.classList.remove("-selected-", "-range-from-", "-range-to-"), this.selected = !1;
            }), $(this, "onChangeSelectedDate", () => {
              this.isDisabled || (this._handleSelectedStatus(), this.opts.range && this._handleRangeStatus());
            }), $(this, "onChangeFocusDate", e => {
              if (!e) return void (this.focused && this.removeFocus());
              let t = p(e, this.date, this.type);
              t ? this.focus() : !t && this.focused && this.removeFocus(), this.opts.range && this._handleRangeStatus();
            }), $(this, "render", () => (this.$cell.innerHTML = this._getHtml(), this._handleClasses(), this.$cell)), this.type = e, this.singleType = this.type.slice(0, -1), this.date = t, this.dp = i, this.opts = s, this.body = a, this.customData = !1, this.init();
          }
          init() {
            var e;
            let {
              onRenderCell: t
            } = this.opts;
            t && (this.customData = t({
              date: this.date,
              cellType: this.singleType,
              datepicker: this.dp
            })), this._createElement(), this._bindDatepickerEvents(), null !== (e = this.customData) && void 0 !== e && e.disabled && this.dp.disableDate(this.date);
          }
          _bindDatepickerEvents() {
            this.dp.on(i.eventChangeSelectedDate, this.onChangeSelectedDate), this.dp.on(i.eventChangeFocusDate, this.onChangeFocusDate);
          }
          unbindDatepickerEvents() {
            this.dp.off(i.eventChangeSelectedDate, this.onChangeSelectedDate), this.dp.off(i.eventChangeFocusDate, this.onChangeFocusDate);
          }
          _createElement() {
            var e;
            let {
                year: t,
                month: i,
                date: s
              } = h(this.date),
              a = (null === (e = this.customData) || void 0 === e ? void 0 : e.attrs) || {};
            this.$cell = n({
              attrs: {
                "data-year": t,
                "data-month": i,
                "data-date": s,
                ...a
              }
            }), this.$cell.adpCell = this;
          }
          _getClassName() {
            var e;
            let t = new Date(),
              {
                selectOtherMonths: s,
                selectOtherYears: a
              } = this.opts,
              {
                minDate: n,
                maxDate: r,
                isDateDisabled: o
              } = this.dp,
              {
                day: l
              } = h(this.date),
              d = this._isOutOfMinMaxRange(),
              c = o(this.date),
              m = u("air-datepicker-cell", `-${this.singleType}-`, {
                "-current-": p(t, this.date, this.type),
                "-min-date-": n && p(n, this.date, this.type),
                "-max-date-": r && p(r, this.date, this.type)
              }),
              v = "";
            switch (this.type) {
              case i.days:
                v = u({
                  "-weekend-": this.dp.isWeekend(l),
                  "-other-month-": this.isOtherMonth,
                  "-disabled-": this.isOtherMonth && !s || d || c
                });
                break;
              case i.months:
                v = u({
                  "-disabled-": d
                });
                break;
              case i.years:
                v = u({
                  "-other-decade-": this.isOtherDecade,
                  "-disabled-": d || this.isOtherDecade && !a
                });
            }
            return u(m, v, null === (e = this.customData) || void 0 === e ? void 0 : e.classes).split(" ");
          }
          _getHtml() {
            var e;
            let {
                year: t,
                month: s,
                date: a
              } = h(this.date),
              {
                showOtherMonths: n,
                showOtherYears: r
              } = this.opts;
            if (null !== (e = this.customData) && void 0 !== e && e.html) return this.customData.html;
            switch (this.type) {
              case i.days:
                return !n && this.isOtherMonth ? "" : a;
              case i.months:
                return this.dp.locale[this.opts.monthsField][s];
              case i.years:
                return !r && this.isOtherDecade ? "" : t;
            }
          }
          _isOutOfMinMaxRange() {
            let {
                minDate: e,
                maxDate: t
              } = this.dp,
              {
                type: s,
                date: a
              } = this,
              {
                month: n,
                year: r,
                date: o
              } = h(a),
              l = s === i.days,
              d = s === i.years,
              c = !!e && new Date(r, d ? e.getMonth() : n, l ? o : e.getDate()),
              u = !!t && new Date(r, d ? t.getMonth() : n, l ? o : t.getDate());
            return e && t ? v(c, e) || m(u, t) : e ? v(c, e) : t ? m(u, t) : void 0;
          }
          destroy() {
            this.unbindDatepickerEvents();
          }
          _handleRangeStatus() {
            const {
                selectedDates: e,
                focusDate: t,
                rangeDateTo: i,
                rangeDateFrom: s
              } = this.dp,
              a = e.length;
            if (!a) return;
            let n = s,
              r = i;
            if (1 === a && t) {
              const i = m(t, e[0]);
              n = i ? e[0] : t, r = i ? t : e[0];
            }
            let o = u({
              "-in-range-": n && r && (h = this.date, l = n, d = r, m(h, l) && v(h, d)),
              "-range-from-": n && p(this.date, n, this.type),
              "-range-to-": r && p(this.date, r, this.type)
            });
            var h, l, d;
            this.$cell.classList.remove("-range-from-", "-range-to-", "-in-range-"), o && this.$cell.classList.add(...o.split(" "));
          }
          _handleSelectedStatus() {
            let e = this.dp._checkIfDateIsSelected(this.date, this.type);
            e ? this.select() : !e && this.selected && this.removeSelect();
          }
          _handleInitialFocusStatus() {
            p(this.dp.focusDate, this.date, this.type) && this.focus();
          }
          _handleClasses() {
            this.$cell.setAttribute("class", ""), this._handleInitialFocusStatus(), this.dp.hasSelectedDates && (this._handleSelectedStatus(), this.dp.opts.range && this._handleRangeStatus()), this.$cell.classList.add(...this._getClassName());
          }
          get isDisabled() {
            return this.$cell.matches(".-disabled-");
          }
          get isOtherMonth() {
            return this.dp.isOtherMonth(this.date);
          }
          get isOtherDecade() {
            return this.dp.isOtherDecade(this.date);
          }
        }
        function _(e, t, i) {
          return (t = function (e) {
            var t = function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var i = e[Symbol.toPrimitive];
              if (void 0 !== i) {
                var s = i.call(e, "string");
                if ("object" != typeof s) return s;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return String(e);
            }(e);
            return "symbol" == typeof t ? t : String(t);
          }(t)) in e ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = i, e;
        }
        let M = {
          [i.days]: `<div class="air-datepicker-body--day-names"></div><div class="air-datepicker-body--cells -${i.days}-"></div>`,
          [i.months]: `<div class="air-datepicker-body--cells -${i.months}-"></div>`,
          [i.years]: `<div class="air-datepicker-body--cells -${i.years}-"></div>`
        };
        const S = ".air-datepicker-cell";
        class T {
          constructor(e) {
            let {
              dp: t,
              type: s,
              opts: a
            } = e;
            _(this, "handleClick", e => {
              let t = e.target.closest(S).adpCell;
              if (t.isDisabled) return;
              if (!this.dp.isMinViewReached) return void this.dp.down();
              let i = this.dp._checkIfDateIsSelected(t.date, t.type);
              i ? this.dp._handleAlreadySelectedDates(i, t.date) : this.dp.selectDate(t.date);
            }), _(this, "handleDayNameClick", e => {
              let t = e.target.getAttribute("data-day-index");
              this.opts.onClickDayName({
                dayIndex: Number(t),
                datepicker: this.dp
              });
            }), _(this, "onChangeCurrentView", e => {
              e !== this.type ? this.hide() : (this.show(), this.render());
            }), _(this, "onMouseOverCell", e => {
              let t = y(e.target, S);
              this.dp.setFocusDate(!!t && t.adpCell.date);
            }), _(this, "onMouseOutCell", () => {
              this.dp.setFocusDate(!1);
            }), _(this, "onClickBody", e => {
              let {
                  onClickDayName: t
                } = this.opts,
                i = e.target;
              i.closest(S) && this.handleClick(e), t && i.closest(".air-datepicker-body--day-name") && this.handleDayNameClick(e);
            }), _(this, "onMouseDown", e => {
              this.pressed = !0;
              let t = y(e.target, S),
                i = t && t.adpCell;
              p(i.date, this.dp.rangeDateFrom) && (this.rangeFromFocused = !0), p(i.date, this.dp.rangeDateTo) && (this.rangeToFocused = !0);
            }), _(this, "onMouseMove", e => {
              if (!this.pressed || !this.dp.isMinViewReached) return;
              e.preventDefault();
              let t = y(e.target, S),
                i = t && t.adpCell,
                {
                  selectedDates: s,
                  rangeDateTo: a,
                  rangeDateFrom: n
                } = this.dp;
              if (!i || i.isDisabled) return;
              let {
                date: r
              } = i;
              if (2 === s.length) {
                if (this.rangeFromFocused && !m(r, a)) {
                  let {
                    hours: e,
                    minutes: t
                  } = h(n);
                  r.setHours(e), r.setMinutes(t), this.dp.rangeDateFrom = r, this.dp.replaceDate(n, r);
                }
                if (this.rangeToFocused && !v(r, n)) {
                  let {
                    hours: e,
                    minutes: t
                  } = h(a);
                  r.setHours(e), r.setMinutes(t), this.dp.rangeDateTo = r, this.dp.replaceDate(a, r);
                }
              }
            }), _(this, "onMouseUp", () => {
              this.pressed = !1, this.rangeFromFocused = !1, this.rangeToFocused = !1;
            }), _(this, "onChangeViewDate", (e, t) => {
              if (!this.isVisible) return;
              let s = c(e),
                a = c(t);
              switch (this.dp.currentView) {
                case i.days:
                  if (p(e, t, i.months)) return;
                  break;
                case i.months:
                  if (p(e, t, i.years)) return;
                  break;
                case i.years:
                  if (s[0] === a[0] && s[1] === a[1]) return;
              }
              this.render();
            }), _(this, "render", () => {
              this.destroyCells(), this._generateCells(), this.cells.forEach(e => {
                this.$cells.appendChild(e.render());
              });
            }), this.dp = t, this.type = s, this.opts = a, this.cells = [], this.$el = "", this.pressed = !1, this.isVisible = !0, this.init();
          }
          init() {
            this._buildBaseHtml(), this.type === i.days && this.renderDayNames(), this.render(), this._bindEvents(), this._bindDatepickerEvents();
          }
          _bindEvents() {
            let {
              range: e,
              dynamicRange: t
            } = this.opts;
            D(this.$el, "mouseover", this.onMouseOverCell), D(this.$el, "mouseout", this.onMouseOutCell), D(this.$el, "click", this.onClickBody), e && t && (D(this.$el, "mousedown", this.onMouseDown), D(this.$el, "mousemove", this.onMouseMove), D(window.document, "mouseup", this.onMouseUp));
          }
          _bindDatepickerEvents() {
            this.dp.on(i.eventChangeViewDate, this.onChangeViewDate), this.dp.on(i.eventChangeCurrentView, this.onChangeCurrentView);
          }
          _buildBaseHtml() {
            this.$el = n({
              className: `air-datepicker-body -${this.type}-`,
              innerHtml: M[this.type]
            }), this.$names = a(".air-datepicker-body--day-names", this.$el), this.$cells = a(".air-datepicker-body--cells", this.$el);
          }
          _getDayNamesHtml() {
            let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.dp.locale.firstDay,
              t = "",
              s = this.dp.isWeekend,
              {
                onClickDayName: a
              } = this.opts,
              n = e,
              r = 0;
            for (; r < 7;) {
              let e = n % 7;
              t += `<div class="${u("air-datepicker-body--day-name", {
                [i.cssClassWeekend]: s(e),
                "-clickable-": !!a
              })}" data-day-index='${e}'>${this.dp.locale.daysMin[e]}</div>`, r++, n++;
            }
            return t;
          }
          renderDayNames() {
            this.$names.innerHTML = this._getDayNamesHtml();
          }
          _generateCell(e) {
            let {
              type: t,
              dp: i,
              opts: s
            } = this;
            return new C({
              type: t,
              dp: i,
              opts: s,
              date: e,
              body: this
            });
          }
          _generateCells() {
            T.getDatesFunction(this.type)(this.dp, e => {
              this.cells.push(this._generateCell(e));
            });
          }
          show() {
            this.isVisible = !0, this.$el.classList.remove("-hidden-");
          }
          hide() {
            this.isVisible = !1, this.$el.classList.add("-hidden-");
          }
          destroyCells() {
            this.cells.forEach(e => e.destroy()), this.cells = [], this.$cells.innerHTML = "";
          }
          destroy() {
            this.destroyCells(), this.dp.off(i.eventChangeViewDate, this.onChangeViewDate), this.dp.off(i.eventChangeCurrentView, this.onChangeCurrentView);
          }
          static getDaysDates(e, t) {
            let {
                viewDate: i,
                opts: {
                  fixedHeight: s
                },
                locale: {
                  firstDay: a
                }
              } = e,
              n = o(i),
              {
                year: r,
                month: l
              } = h(i),
              d = new Date(r, l, 1),
              c = new Date(r, l, n),
              u = d.getDay() - a,
              p = 6 - c.getDay() + a;
            u = u < 0 ? u + 7 : u, p = p > 6 ? p - 7 : p;
            let m = function (e, t) {
                let {
                  year: i,
                  month: s,
                  date: a
                } = h(e);
                return new Date(i, s, a - t);
              }(d, u),
              v = n + u + p,
              g = m.getDate(),
              {
                year: D,
                month: y
              } = h(m),
              f = 0;
            s && (v = 42);
            const w = [];
            for (; f < v;) {
              let e = new Date(D, y, g + f);
              t && t(e), w.push(e), f++;
            }
            return w;
          }
          static getMonthsDates(e, t) {
            let {
                year: i
              } = e.parsedViewDate,
              s = 0,
              a = [];
            for (; s < 12;) {
              const e = new Date(i, s);
              a.push(e), t && t(e), s++;
            }
            return a;
          }
          static getYearsDates(e, t) {
            let i = c(e.viewDate),
              s = i[0] - 1,
              a = i[1] + 1,
              n = s,
              r = [];
            for (; n <= a;) {
              const e = new Date(n, 0);
              r.push(e), t && t(e), n++;
            }
            return r;
          }
          static getDatesFunction() {
            let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : i.days;
            return {
              [i.days]: T.getDaysDates,
              [i.months]: T.getMonthsDates,
              [i.years]: T.getYearsDates
            }[e];
          }
        }
        function F(e, t, i) {
          return (t = function (e) {
            var t = function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var i = e[Symbol.toPrimitive];
              if (void 0 !== i) {
                var s = i.call(e, "string");
                if ("object" != typeof s) return s;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return String(e);
            }(e);
            return "symbol" == typeof t ? t : String(t);
          }(t)) in e ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = i, e;
        }
        class V {
          constructor(e) {
            let {
              dp: t,
              opts: i
            } = e;
            F(this, "onClickNav", e => {
              let t = y(e.target, ".air-datepicker-nav--action");
              if (!t) return;
              let i = t.dataset.action;
              this.dp[i]();
            }), F(this, "onChangeViewDate", () => {
              this.render(), this._resetNavStatus(), this.handleNavStatus();
            }), F(this, "onChangeCurrentView", () => {
              this.render(), this._resetNavStatus(), this.handleNavStatus();
            }), F(this, "onClickNavTitle", () => {
              this.dp.isFinalView || this.dp.up();
            }), F(this, "update", () => {
              let {
                prevHtml: e,
                nextHtml: t
              } = this.opts;
              this.$prev.innerHTML = e, this.$next.innerHTML = t, this._resetNavStatus(), this.render(), this.handleNavStatus();
            }), F(this, "renderDelay", () => {
              setTimeout(this.render);
            }), F(this, "render", () => {
              this.$title.innerHTML = this._getTitle(), function (e, t) {
                for (let i in t) t[i] ? e.classList.add(i) : e.classList.remove(i);
              }(this.$title, {
                "-disabled-": this.dp.isFinalView
              });
            }), this.dp = t, this.opts = i, this.init();
          }
          init() {
            this._createElement(), this._buildBaseHtml(), this._defineDOM(), this.render(), this.handleNavStatus(), this._bindEvents(), this._bindDatepickerEvents();
          }
          _defineDOM() {
            this.$title = a(".air-datepicker-nav--title", this.$el), this.$prev = a('[data-action="prev"]', this.$el), this.$next = a('[data-action="next"]', this.$el);
          }
          _bindEvents() {
            this.$el.addEventListener("click", this.onClickNav), this.$title.addEventListener("click", this.onClickNavTitle);
          }
          _bindDatepickerEvents() {
            this.dp.on(i.eventChangeViewDate, this.onChangeViewDate), this.dp.on(i.eventChangeCurrentView, this.onChangeCurrentView), this.isNavIsFunction && (this.dp.on(i.eventChangeSelectedDate, this.renderDelay), this.dp.opts.timepicker && this.dp.on(i.eventChangeTime, this.render));
          }
          destroy() {
            this.dp.off(i.eventChangeViewDate, this.onChangeViewDate), this.dp.off(i.eventChangeCurrentView, this.onChangeCurrentView), this.isNavIsFunction && (this.dp.off(i.eventChangeSelectedDate, this.renderDelay), this.dp.opts.timepicker && this.dp.off(i.eventChangeTime, this.render));
          }
          _createElement() {
            this.$el = n({
              tagName: "nav",
              className: "air-datepicker-nav"
            });
          }
          _getTitle() {
            let {
                dp: e,
                opts: t
              } = this,
              i = t.navTitles[e.currentView];
            return "function" == typeof i ? i(e) : e.formatDate(e.viewDate, i);
          }
          handleNavStatus() {
            let {
                disableNavWhenOutOfRange: e
              } = this.opts,
              {
                minDate: t,
                maxDate: s
              } = this.dp;
            if (!t && !s || !e) return;
            let {
                year: a,
                month: n
              } = this.dp.parsedViewDate,
              r = !!t && h(t),
              o = !!s && h(s);
            switch (this.dp.currentView) {
              case i.days:
                t && r.month >= n && r.year >= a && this._disableNav("prev"), s && o.month <= n && o.year <= a && this._disableNav("next");
                break;
              case i.months:
                t && r.year >= a && this._disableNav("prev"), s && o.year <= a && this._disableNav("next");
                break;
              case i.years:
                {
                  let e = c(this.dp.viewDate);
                  t && r.year >= e[0] && this._disableNav("prev"), s && o.year <= e[1] && this._disableNav("next");
                  break;
                }
            }
          }
          _disableNav(e) {
            a('[data-action="' + e + '"]', this.$el).classList.add("-disabled-");
          }
          _resetNavStatus() {
            !function (e) {
              for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) i[s - 1] = arguments[s];
              e.length ? e.forEach(e => {
                e.classList.remove(...i);
              }) : e.classList.remove(...i);
            }(this.$el.querySelectorAll(".air-datepicker-nav--action"), "-disabled-");
          }
          _buildBaseHtml() {
            let {
              prevHtml: e,
              nextHtml: t
            } = this.opts;
            this.$el.innerHTML = `<div class="air-datepicker-nav--action" data-action="prev">${e}</div><div class="air-datepicker-nav--title"></div><div class="air-datepicker-nav--action" data-action="next">${t}</div>`;
          }
          get isNavIsFunction() {
            let {
              navTitles: e
            } = this.opts;
            return Object.keys(e).find(t => "function" == typeof e[t]);
          }
        }
        var x = {
          today: {
            content: e => e.locale.today,
            onClick: e => e.setViewDate(new Date())
          },
          clear: {
            content: e => e.locale.clear,
            onClick: e => e.clear()
          }
        };
        class H {
          constructor(e) {
            let {
              dp: t,
              opts: i
            } = e;
            this.dp = t, this.opts = i, this.init();
          }
          init() {
            this.createElement(), this.render();
          }
          createElement() {
            this.$el = n({
              className: "air-datepicker-buttons"
            });
          }
          destroy() {
            this.$el.parentNode.removeChild(this.$el);
          }
          clearHtml() {
            return this.$el.innerHTML = "", this;
          }
          generateButtons() {
            let {
              buttons: e
            } = this.opts;
            Array.isArray(e) || (e = [e]), e.forEach(e => {
              let t = e;
              "string" == typeof e && x[e] && (t = x[e]);
              let i = this.createButton(t);
              t.onClick && this.attachEventToButton(i, t.onClick), this.$el.appendChild(i);
            });
          }
          attachEventToButton(e, t) {
            e.addEventListener("click", () => {
              t(this.dp);
            });
          }
          createButton(e) {
            let {
              content: t,
              className: i,
              tagName: s = "button",
              attrs: a = {}
            } = e;
            return n({
              tagName: s,
              innerHtml: `<span tabindex='-1'>${"function" == typeof t ? t(this.dp) : t}</span>`,
              className: u("air-datepicker-button", i),
              attrs: a
            });
          }
          render() {
            this.generateButtons();
          }
        }
        function E(e, t, i) {
          return (t = function (e) {
            var t = function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var i = e[Symbol.toPrimitive];
              if (void 0 !== i) {
                var s = i.call(e, "string");
                if ("object" != typeof s) return s;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return String(e);
            }(e);
            return "symbol" == typeof t ? t : String(t);
          }(t)) in e ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = i, e;
        }
        class L {
          constructor() {
            let {
              opts: e,
              dp: t
            } = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            E(this, "toggleTimepickerIsActive", e => {
              this.dp.timepickerIsActive = e;
            }), E(this, "onChangeSelectedDate", e => {
              let {
                date: t,
                updateTime: i = !1
              } = e;
              t && (this.setMinMaxTime(t), this.setCurrentTime(!!i && t), this.addTimeToDate(t));
            }), E(this, "onChangeLastSelectedDate", e => {
              e && (this.setTime(e), this.render());
            }), E(this, "onChangeInputRange", e => {
              let t = e.target;
              this[t.getAttribute("name")] = t.value, this.updateText(), this.dp.trigger(i.eventChangeTime, {
                hours: this.hours,
                minutes: this.minutes
              });
            }), E(this, "onMouseEnterLeave", e => {
              let t = e.target.getAttribute("name"),
                i = this.$minutesText;
              "hours" === t && (i = this.$hoursText), i.classList.toggle("-focus-");
            }), E(this, "onFocus", () => {
              this.toggleTimepickerIsActive(!0);
            }), E(this, "onBlur", () => {
              this.toggleTimepickerIsActive(!1);
            }), this.opts = e, this.dp = t;
            let {
              timeFormat: s
            } = this.dp.locale;
            s && (s.match(k("h")) || s.match(k("hh"))) && (this.ampm = !0), this.init();
          }
          init() {
            this.setTime(this.dp.lastSelectedDate || this.dp.viewDate), this.createElement(), this.buildHtml(), this.defineDOM(), this.render(), this.bindDatepickerEvents(), this.bindDOMEvents();
          }
          bindDatepickerEvents() {
            this.dp.on(i.eventChangeSelectedDate, this.onChangeSelectedDate), this.dp.on(i.eventChangeLastSelectedDate, this.onChangeLastSelectedDate);
          }
          bindDOMEvents() {
            let e = "input";
            navigator.userAgent.match(/trident/gi) && (e = "change"), D(this.$ranges, e, this.onChangeInputRange), D(this.$ranges, "mouseenter", this.onMouseEnterLeave), D(this.$ranges, "mouseleave", this.onMouseEnterLeave), D(this.$ranges, "focus", this.onFocus), D(this.$ranges, "mousedown", this.onFocus), D(this.$ranges, "blur", this.onBlur);
          }
          createElement() {
            this.$el = n({
              className: u("air-datepicker-time", {
                "-am-pm-": this.dp.ampm
              })
            });
          }
          destroy() {
            this.dp.off(i.eventChangeSelectedDate, this.onChangeSelectedDate), this.dp.off(i.eventChangeLastSelectedDate, this.onChangeLastSelectedDate), this.$el.parentNode.removeChild(this.$el);
          }
          buildHtml() {
            let {
              ampm: e,
              hours: t,
              displayHours: i,
              minutes: s,
              minHours: a,
              minMinutes: n,
              maxHours: r,
              maxMinutes: o,
              dayPeriod: h,
              opts: {
                hoursStep: l,
                minutesStep: c
              }
            } = this;
            this.$el.innerHTML = `<div class="air-datepicker-time--current">   <span class="air-datepicker-time--current-hours">${d(i)}</span>   <span class="air-datepicker-time--current-colon">:</span>   <span class="air-datepicker-time--current-minutes">${d(s)}</span>   ` + (e ? `<span class='air-datepicker-time--current-ampm'>${h}</span>` : "") + '</div><div class="air-datepicker-time--sliders">   <div class="air-datepicker-time--row">' + `      <input type="range" name="hours" value="${t}" min="${a}" max="${r}" step="${l}"/>   </div>   <div class="air-datepicker-time--row">` + `      <input type="range" name="minutes" value="${s}" min="${n}" max="${o}" step="${c}"/>   </div></div>`;
          }
          defineDOM() {
            let e = e => a(e, this.$el);
            this.$ranges = this.$el.querySelectorAll('[type="range"]'), this.$hours = e('[name="hours"]'), this.$minutes = e('[name="minutes"]'), this.$hoursText = e(".air-datepicker-time--current-hours"), this.$minutesText = e(".air-datepicker-time--current-minutes"), this.$ampm = e(".air-datepicker-time--current-ampm");
          }
          setTime(e) {
            this.setMinMaxTime(e), this.setCurrentTime(e);
          }
          addTimeToDate(e) {
            e && (e.setHours(this.hours), e.setMinutes(this.minutes));
          }
          setMinMaxTime(e) {
            if (this.setMinMaxTimeFromOptions(), e) {
              let {
                minDate: t,
                maxDate: i
              } = this.dp;
              t && p(e, t) && this.setMinTimeFromMinDate(t), i && p(e, i) && this.setMaxTimeFromMaxDate(i);
            }
          }
          setCurrentTime(e) {
            let {
              hours: t,
              minutes: i
            } = e ? h(e) : this;
            this.hours = f(t, this.minHours, this.maxHours), this.minutes = f(i, this.minMinutes, this.maxMinutes);
          }
          setMinMaxTimeFromOptions() {
            let {
              minHours: e,
              minMinutes: t,
              maxHours: i,
              maxMinutes: s
            } = this.opts;
            this.minHours = f(e, 0, 23), this.minMinutes = f(t, 0, 59), this.maxHours = f(i, 0, 23), this.maxMinutes = f(s, 0, 59);
          }
          setMinTimeFromMinDate(e) {
            let {
              lastSelectedDate: t
            } = this.dp;
            this.minHours = e.getHours(), t && t.getHours() > e.getHours() ? this.minMinutes = this.opts.minMinutes : this.minMinutes = e.getMinutes();
          }
          setMaxTimeFromMaxDate(e) {
            let {
              lastSelectedDate: t
            } = this.dp;
            this.maxHours = e.getHours(), t && t.getHours() < e.getHours() ? this.maxMinutes = this.opts.maxMinutes : this.maxMinutes = e.getMinutes();
          }
          updateSliders() {
            r(this.$hours, {
              min: this.minHours,
              max: this.maxHours
            }).value = this.hours, r(this.$minutes, {
              min: this.minMinutes,
              max: this.maxMinutes
            }).value = this.minutes;
          }
          updateText() {
            this.$hoursText.innerHTML = d(this.displayHours), this.$minutesText.innerHTML = d(this.minutes), this.ampm && (this.$ampm.innerHTML = this.dayPeriod);
          }
          set hours(e) {
            this._hours = e;
            let {
              hours: t,
              dayPeriod: i
            } = l(e);
            this.displayHours = this.ampm ? t : e, this.dayPeriod = i;
          }
          get hours() {
            return this._hours;
          }
          render() {
            this.updateSliders(), this.updateText();
          }
        }
        function O(e, t, i) {
          return (t = function (e) {
            var t = function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var i = e[Symbol.toPrimitive];
              if (void 0 !== i) {
                var s = i.call(e, "string");
                if ("object" != typeof s) return s;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return String(e);
            }(e);
            return "symbol" == typeof t ? t : String(t);
          }(t)) in e ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = i, e;
        }
        class A {
          constructor(e) {
            let {
              dp: t,
              opts: i
            } = e;
            O(this, "pressedKeys", new Set()), O(this, "hotKeys", new Map([[[["Control", "ArrowRight"], ["Control", "ArrowUp"]], e => e.month++], [[["Control", "ArrowLeft"], ["Control", "ArrowDown"]], e => e.month--], [[["Shift", "ArrowRight"], ["Shift", "ArrowUp"]], e => e.year++], [[["Shift", "ArrowLeft"], ["Shift", "ArrowDown"]], e => e.year--], [[["Alt", "ArrowRight"], ["Alt", "ArrowUp"]], e => e.year += 10], [[["Alt", "ArrowLeft"], ["Alt", "ArrowDown"]], e => e.year -= 10], [["Control", "Shift", "ArrowUp"], (e, t) => t.up()]])), O(this, "handleHotKey", e => {
              let t = this.hotKeys.get(e),
                i = h(this.getInitialFocusDate());
              t(i, this.dp);
              let {
                  year: s,
                  month: a,
                  date: n
                } = i,
                r = o(new Date(s, a));
              r < n && (n = r);
              let l = this.dp.getClampedDate(new Date(s, a, n));
              this.dp.setFocusDate(l, {
                viewDateTransition: !0
              });
            }), O(this, "isHotKeyPressed", () => {
              let e = !1,
                t = this.pressedKeys.size,
                i = e => this.pressedKeys.has(e);
              for (let [s] of this.hotKeys) {
                if (e) break;
                if (Array.isArray(s[0])) s.forEach(a => {
                  e || t !== a.length || (e = a.every(i) && s);
                });else {
                  if (t !== s.length) continue;
                  e = s.every(i) && s;
                }
              }
              return e;
            }), O(this, "isArrow", e => e >= 37 && e <= 40), O(this, "onKeyDown", e => {
              let {
                  key: t,
                  which: i
                } = e,
                {
                  dp: s,
                  dp: {
                    focusDate: a
                  },
                  opts: n
                } = this;
              this.registerKey(t);
              let r = this.isHotKeyPressed();
              if (r) return e.preventDefault(), void this.handleHotKey(r);
              if (this.isArrow(i)) return e.preventDefault(), void this.focusNextCell(t);
              if ("Enter" === t) {
                if (s.currentView !== n.minView) return void s.down();
                if (a) {
                  let e = s._checkIfDateIsSelected(a);
                  return void (e ? s._handleAlreadySelectedDates(e, a) : s.selectDate(a));
                }
              }
              "Escape" === t && this.dp.hide();
            }), O(this, "onKeyUp", e => {
              this.removeKey(e.key);
            }), this.dp = t, this.opts = i, this.init();
          }
          init() {
            this.bindKeyboardEvents();
          }
          bindKeyboardEvents() {
            let {
              $el: e
            } = this.dp;
            e.addEventListener("keydown", this.onKeyDown), e.addEventListener("keyup", this.onKeyUp);
          }
          destroy() {
            let {
              $el: e
            } = this.dp;
            e.removeEventListener("keydown", this.onKeyDown), e.removeEventListener("keyup", this.onKeyUp), this.hotKeys = null, this.pressedKeys = null;
          }
          getInitialFocusDate() {
            let {
                focusDate: e,
                currentView: t,
                selectedDates: s,
                parsedViewDate: {
                  year: a,
                  month: n
                }
              } = this.dp,
              r = e || s[s.length - 1];
            if (!r) switch (t) {
              case i.days:
                r = new Date(a, n, new Date().getDate());
                break;
              case i.months:
                r = new Date(a, n, 1);
                break;
              case i.years:
                r = new Date(a, 0, 1);
            }
            return r;
          }
          focusNextCell(e) {
            let t = this.getInitialFocusDate(),
              {
                currentView: s
              } = this.dp,
              {
                days: a,
                months: n,
                years: r
              } = i,
              o = h(t),
              l = o.year,
              d = o.month,
              c = o.date;
            switch (e) {
              case "ArrowLeft":
                s === a && (c -= 1), s === n && (d -= 1), s === r && (l -= 1);
                break;
              case "ArrowUp":
                s === a && (c -= 7), s === n && (d -= 3), s === r && (l -= 4);
                break;
              case "ArrowRight":
                s === a && (c += 1), s === n && (d += 1), s === r && (l += 1);
                break;
              case "ArrowDown":
                s === a && (c += 7), s === n && (d += 3), s === r && (l += 4);
            }
            let u = this.dp.getClampedDate(new Date(l, d, c));
            this.dp.setFocusDate(u, {
              viewDateTransition: !0
            });
          }
          registerKey(e) {
            this.pressedKeys.add(e);
          }
          removeKey(e) {
            this.pressedKeys.delete(e);
          }
        }
        let N = {
          on(e, t) {
            this.__events || (this.__events = {}), this.__events[e] ? this.__events[e].push(t) : this.__events[e] = [t];
          },
          off(e, t) {
            this.__events && this.__events[e] && (this.__events[e] = this.__events[e].filter(e => e !== t));
          },
          removeAllEvents() {
            this.__events = {};
          },
          trigger(e) {
            for (var t = arguments.length, i = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) i[s - 1] = arguments[s];
            this.__events && this.__events[e] && this.__events[e].forEach(e => {
              e(...i);
            });
          }
        };
        function I(e, t, i) {
          return (t = function (e) {
            var t = function (e, t) {
              if ("object" != typeof e || null === e) return e;
              var i = e[Symbol.toPrimitive];
              if (void 0 !== i) {
                var s = i.call(e, "string");
                if ("object" != typeof s) return s;
                throw new TypeError("@@toPrimitive must return a primitive value.");
              }
              return String(e);
            }(e);
            return "symbol" == typeof t ? t : String(t);
          }(t)) in e ? Object.defineProperty(e, t, {
            value: i,
            enumerable: !0,
            configurable: !0,
            writable: !0
          }) : e[t] = i, e;
        }
        let P = "",
          j = "",
          B = !1;
        class R {
          static buildGlobalContainer(e) {
            B = !0, P = n({
              className: e,
              id: e
            }), a("body").appendChild(P);
          }
          constructor(e, t) {
            var r = this;
            if (I(this, "viewIndexes", [i.days, i.months, i.years]), I(this, "next", () => {
              let {
                year: e,
                month: t
              } = this.parsedViewDate;
              switch (this.currentView) {
                case i.days:
                  this.setViewDate(new Date(e, t + 1, 1));
                  break;
                case i.months:
                  this.setViewDate(new Date(e + 1, t, 1));
                  break;
                case i.years:
                  this.setViewDate(new Date(e + 10, 0, 1));
              }
            }), I(this, "prev", () => {
              let {
                year: e,
                month: t
              } = this.parsedViewDate;
              switch (this.currentView) {
                case i.days:
                  this.setViewDate(new Date(e, t - 1, 1));
                  break;
                case i.months:
                  this.setViewDate(new Date(e - 1, t, 1));
                  break;
                case i.years:
                  this.setViewDate(new Date(e - 10, 0, 1));
              }
            }), I(this, "_finishHide", () => {
              this.hideAnimation = !1, this._destroyComponents(), this.$container.removeChild(this.$datepicker);
            }), I(this, "setPosition", function (e) {
              let t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
              if ("function" == typeof (e = e || r.opts.position)) return void (r.customHide = e({
                $datepicker: r.$datepicker,
                $target: r.$el,
                $pointer: r.$pointer,
                isViewChange: t,
                done: r._finishHide
              }));
              let i,
                s,
                {
                  isMobile: a
                } = r.opts,
                n = r.$el.getBoundingClientRect(),
                o = r.$el.getBoundingClientRect(),
                h = r.$datepicker.offsetParent,
                l = r.$el.offsetParent,
                d = r.$datepicker.getBoundingClientRect(),
                c = e.split(" "),
                u = window.scrollY,
                p = window.scrollX,
                m = r.opts.offset,
                v = c[0],
                g = c[1];
              if (a) r.$datepicker.style.cssText = "left: 50%; top: 50%";else {
                if (h === l && h !== document.body && (o = {
                  top: r.$el.offsetTop,
                  left: r.$el.offsetLeft,
                  width: n.width,
                  height: r.$el.offsetHeight
                }, u = 0, p = 0), h !== l && h !== document.body) {
                  let e = h.getBoundingClientRect();
                  o = {
                    top: n.top - e.top,
                    left: n.left - e.left,
                    width: n.width,
                    height: n.height
                  }, u = 0, p = 0;
                }
                switch (v) {
                  case "top":
                    i = o.top - d.height - m;
                    break;
                  case "right":
                    s = o.left + o.width + m;
                    break;
                  case "bottom":
                    i = o.top + o.height + m;
                    break;
                  case "left":
                    s = o.left - d.width - m;
                }
                switch (g) {
                  case "top":
                    i = o.top;
                    break;
                  case "right":
                    s = o.left + o.width - d.width;
                    break;
                  case "bottom":
                    i = o.top + o.height - d.height;
                    break;
                  case "left":
                    s = o.left;
                    break;
                  case "center":
                    /left|right/.test(v) ? i = o.top + o.height / 2 - d.height / 2 : s = o.left + o.width / 2 - d.width / 2;
                }
                r.$datepicker.style.cssText = `left: ${s + p}px; top: ${i + u}px`;
              }
            }), I(this, "_setInputValue", () => {
              let {
                  opts: e,
                  $altField: t,
                  locale: {
                    dateFormat: i
                  }
                } = this,
                {
                  altFieldDateFormat: s,
                  altField: a
                } = e;
              a && t && (t.value = this._getInputValue(s)), this.$el.value = this._getInputValue(i);
            }), I(this, "_getInputValue", e => {
              let {
                  selectedDates: t,
                  opts: i
                } = this,
                {
                  multipleDates: s,
                  multipleDatesSeparator: a
                } = i;
              if (!t.length) return "";
              let n = "function" == typeof e,
                r = n ? e(s ? t : t[0]) : t.map(t => this.formatDate(t, e));
              return r = n ? r : r.join(a), r;
            }), I(this, "_checkIfDateIsSelected", function (e) {
              let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : i.days,
                s = !1;
              return r.selectedDates.some(i => {
                let a = p(e, i, t);
                return s = a && i, a;
              }), s;
            }), I(this, "_scheduleCallAfterTransition", e => {
              this._cancelScheduledCall(), e && e(!1), this._onTransitionEnd = () => {
                e && e(!0);
              }, this.$datepicker.addEventListener("transitionend", this._onTransitionEnd, {
                once: !0
              });
            }), I(this, "_cancelScheduledCall", () => {
              this.$datepicker.removeEventListener("transitionend", this._onTransitionEnd);
            }), I(this, "setViewDate", e => {
              if (!((e = b(e)) instanceof Date)) return;
              if (p(e, this.viewDate)) return;
              let t = this.viewDate;
              this.viewDate = e;
              let {
                onChangeViewDate: s
              } = this.opts;
              if (s) {
                let {
                  month: e,
                  year: t
                } = this.parsedViewDate;
                s({
                  month: e,
                  year: t,
                  decade: this.curDecade
                });
              }
              this.trigger(i.eventChangeViewDate, e, t);
            }), I(this, "setFocusDate", function (e) {
              let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
              (!e || (e = b(e)) instanceof Date) && (r.focusDate = e, r.trigger(i.eventChangeFocusDate, e, t));
            }), I(this, "setCurrentView", function (e) {
              let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
              if (r.viewIndexes.includes(e)) {
                if (r.currentView = e, r.elIsInput && r.visible && r.setPosition(void 0, !0), r.trigger(i.eventChangeCurrentView, e), !r.views[e]) {
                  let t = r.views[e] = new T({
                    dp: r,
                    opts: r.opts,
                    type: e
                  });
                  r.shouldUpdateDOM && r.$content.appendChild(t.$el);
                }
                r.opts.onChangeView && !t.silent && r.opts.onChangeView(e);
              }
            }), I(this, "_updateLastSelectedDate", e => {
              this.lastSelectedDate = e, this.trigger(i.eventChangeLastSelectedDate, e);
            }), I(this, "destroy", () => {
              if (this.isDestroyed) return;
              let {
                  showEvent: e,
                  isMobile: t
                } = this.opts,
                i = this.$datepicker.parentNode;
              i && i.removeChild(this.$datepicker), this.$el.removeEventListener(e, this._onFocus), this.$el.removeEventListener("blur", this._onBlur), window.removeEventListener("resize", this._onResize), t && this._removeMobileAttributes(), this.keyboardNav && this.keyboardNav.destroy(), this.views = null, this.nav = null, this.$datepicker = null, this.opts = {}, this.$customContainer = null, this.viewDate = null, this.focusDate = null, this.selectedDates = [], this.rangeDateFrom = null, this.rangeDateTo = null, this.isDestroyed = !0;
            }), I(this, "update", function () {
              let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                s = w({}, r.opts),
                {
                  silent: a
                } = t;
              w(r.opts, e);
              let {
                  timepicker: n,
                  buttons: o,
                  range: h,
                  selectedDates: l,
                  isMobile: d
                } = r.opts,
                c = r.visible || r.treatAsInline;
              r._createMinMaxDates(), r._limitViewDateByMaxMinDates(), r._handleLocale(), l && (r.selectedDates = [], r.selectDate(l, {
                silent: a
              })), e.view && r.setCurrentView(e.view, {
                silent: a
              }), r._setInputValue(), s.range && !h ? (r.rangeDateTo = !1, r.rangeDateFrom = !1) : !s.range && h && r.selectedDates.length && (r.rangeDateFrom = r.selectedDates[0], r.rangeDateTo = r.selectedDates[1]), s.timepicker && !n ? (c && r.timepicker.destroy(), r.timepicker = !1, r.$timepicker.parentNode.removeChild(r.$timepicker)) : !s.timepicker && n && r._addTimepicker(), !s.buttons && o ? r._addButtons() : s.buttons && !o ? (r.buttons.destroy(), r.$buttons.parentNode.removeChild(r.$buttons)) : c && s.buttons && o && r.buttons.clearHtml().render(), !s.isMobile && d ? (r.treatAsInline || j || r._createMobileOverlay(), r._addMobileAttributes(), r.visible && r._showMobileOverlay()) : s.isMobile && !d && (r._removeMobileAttributes(), r.visible && (j.classList.remove("-active-"), "function" != typeof r.opts.position && r.setPosition())), c && (r.nav.update(), r.views[r.currentView].render(), r.currentView === i.days && r.views[r.currentView].renderDayNames());
            }), I(this, "disableDate", (e, t) => {
              (Array.isArray(e) ? e : [e]).forEach(e => {
                let i = b(e);
                if (!i) return;
                let s = t ? "delete" : "add";
                this.disabledDates[s](this.formatDate(i, "yyyy-MM-dd"));
                let a = this.getCell(i, this.currentViewSingular);
                a && a.adpCell.render();
              }, []);
            }), I(this, "enableDate", e => {
              this.disableDate(e, !0);
            }), I(this, "isDateDisabled", e => {
              let t = b(e);
              return this.disabledDates.has(this.formatDate(t, "yyyy-MM-dd"));
            }), I(this, "isOtherMonth", e => {
              let {
                month: t
              } = h(e);
              return t !== this.parsedViewDate.month;
            }), I(this, "isOtherYear", e => {
              let {
                year: t
              } = h(e);
              return t !== this.parsedViewDate.year;
            }), I(this, "isOtherDecade", e => {
              let {
                  year: t
                } = h(e),
                [i, s] = c(this.viewDate);
              return t < i || t > s;
            }), I(this, "_onChangeSelectedDate", e => {
              let {
                silent: t
              } = e;
              setTimeout(() => {
                this._setInputValue(), this.opts.onSelect && !t && this._triggerOnSelect();
              });
            }), I(this, "_onChangeFocusedDate", function (e) {
              let {
                viewDateTransition: t
              } = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
              if (!e) return;
              let i = !1;
              t && (i = r.isOtherMonth(e) || r.isOtherYear(e) || r.isOtherDecade(e)), i && r.setViewDate(e), r.opts.onFocus && r.opts.onFocus({
                datepicker: r,
                date: e
              });
            }), I(this, "_onChangeTime", e => {
              let {
                  hours: t,
                  minutes: i
                } = e,
                s = new Date(),
                {
                  lastSelectedDate: a,
                  opts: {
                    onSelect: n
                  }
                } = this,
                r = a;
              a || (r = s);
              let o = this.getCell(r, this.currentViewSingular),
                h = o && o.adpCell;
              h && h.isDisabled || (r.setHours(t), r.setMinutes(i), a ? (this._setInputValue(), n && this._triggerOnSelect()) : this.selectDate(r));
            }), I(this, "_onFocus", e => {
              this.visible || this.show();
            }), I(this, "_onBlur", e => {
              this.inFocus || !this.visible || this.opts.isMobile || this.hide();
            }), I(this, "_onMouseDown", e => {
              this.inFocus = !0;
            }), I(this, "_onMouseUp", e => {
              this.inFocus = !1, this.$el.focus();
            }), I(this, "_onResize", () => {
              this.visible && "function" != typeof this.opts.position && this.setPosition();
            }), I(this, "_onClickOverlay", () => {
              this.visible && this.hide();
            }), I(this, "getViewDates", function () {
              let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : i.days;
              return T.getDatesFunction(e)(r);
            }), I(this, "isWeekend", e => this.opts.weekends.includes(e)), I(this, "getClampedDate", e => {
              let {
                  minDate: t,
                  maxDate: i
                } = this,
                s = e;
              return i && m(e, i) ? s = i : t && v(e, t) && (s = t), s;
            }), this.$el = a(e), !this.$el) return;
            this.$datepicker = n({
              className: "air-datepicker"
            }), this.opts = w({}, s, t), this.$customContainer = !!this.opts.container && a(this.opts.container), this.$altField = a(this.opts.altField || !1);
            let {
              view: o,
              startDate: l
            } = this.opts;
            l || (this.opts.startDate = new Date()), "INPUT" === this.$el.nodeName && (this.elIsInput = !0), this.inited = !1, this.visible = !1, this.viewDate = b(this.opts.startDate), this.focusDate = !1, this.initialReadonly = this.$el.getAttribute("readonly"), this.customHide = !1, this.currentView = o, this.selectedDates = [], this.disabledDates = new Set(), this.isDestroyed = !1, this.views = {}, this.keys = [], this.rangeDateFrom = "", this.rangeDateTo = "", this.timepickerIsActive = !1, this.treatAsInline = this.opts.inline || !this.elIsInput, this.init();
          }
          init() {
            let {
                opts: e,
                treatAsInline: t,
                opts: {
                  inline: i,
                  isMobile: s,
                  selectedDates: n,
                  keyboardNav: r,
                  onlyTimepicker: o
                }
              } = this,
              h = a("body");
            (!B || B && P && !h.contains(P)) && !i && this.elIsInput && !this.$customContainer && R.buildGlobalContainer(R.defaultGlobalContainerId), !s || j || t || this._createMobileOverlay(), this._handleLocale(), this._bindSubEvents(), this._createMinMaxDates(), this._limitViewDateByMaxMinDates(), this.elIsInput && (i || this._bindEvents(), r && !o && (this.keyboardNav = new A({
              dp: this,
              opts: e
            }))), n && this.selectDate(n, {
              silent: !0
            }), this.opts.visible && !t && this.show(), s && !t && this.$el.setAttribute("readonly", !0), t && this._createComponents();
          }
          _createMobileOverlay() {
            j = n({
              className: "air-datepicker-overlay"
            }), P.appendChild(j);
          }
          _createComponents() {
            let {
              opts: e,
              treatAsInline: t,
              opts: {
                inline: i,
                buttons: s,
                timepicker: a,
                position: n,
                classes: r,
                onlyTimepicker: o,
                isMobile: h
              }
            } = this;
            this._buildBaseHtml(), this.elIsInput && (i || this._setPositionClasses(n)), !i && this.elIsInput || this.$datepicker.classList.add("-inline-"), r && this.$datepicker.classList.add(...r.split(" ")), o && this.$datepicker.classList.add("-only-timepicker-"), h && !t && this._addMobileAttributes(), this.views[this.currentView] = new T({
              dp: this,
              type: this.currentView,
              opts: e
            }), this.nav = new V({
              dp: this,
              opts: e
            }), a && this._addTimepicker(), s && this._addButtons(), this.$content.appendChild(this.views[this.currentView].$el), this.$nav.appendChild(this.nav.$el);
          }
          _destroyComponents() {
            for (let e in this.views) this.views[e].destroy();
            this.views = {}, this.nav.destroy(), this.timepicker && this.timepicker.destroy();
          }
          _addMobileAttributes() {
            j.addEventListener("click", this._onClickOverlay), this.$datepicker.classList.add("-is-mobile-"), this.$el.setAttribute("readonly", !0);
          }
          _removeMobileAttributes() {
            j.removeEventListener("click", this._onClickOverlay), this.$datepicker.classList.remove("-is-mobile-"), this.initialReadonly || "" === this.initialReadonly || this.$el.removeAttribute("readonly");
          }
          _createMinMaxDates() {
            let {
              minDate: e,
              maxDate: t
            } = this.opts;
            this.minDate = !!e && b(e), this.maxDate = !!t && b(t);
          }
          _addTimepicker() {
            this.$timepicker = n({
              className: "air-datepicker--time"
            }), this.$datepicker.appendChild(this.$timepicker), this.timepicker = new L({
              dp: this,
              opts: this.opts
            }), this.$timepicker.appendChild(this.timepicker.$el);
          }
          _addButtons() {
            this.$buttons = n({
              className: "air-datepicker--buttons"
            }), this.$datepicker.appendChild(this.$buttons), this.buttons = new H({
              dp: this,
              opts: this.opts
            }), this.$buttons.appendChild(this.buttons.$el);
          }
          _bindSubEvents() {
            this.on(i.eventChangeSelectedDate, this._onChangeSelectedDate), this.on(i.eventChangeFocusDate, this._onChangeFocusedDate), this.on(i.eventChangeTime, this._onChangeTime);
          }
          _buildBaseHtml() {
            let {
              inline: e
            } = this.opts;
            var t, i;
            this.elIsInput ? e ? (t = this.$datepicker, (i = this.$el).parentNode.insertBefore(t, i.nextSibling)) : this.$container.appendChild(this.$datepicker) : this.$el.appendChild(this.$datepicker), this.$datepicker.innerHTML = '<i class="air-datepicker--pointer"></i><div class="air-datepicker--navigation"></div><div class="air-datepicker--content"></div>', this.$content = a(".air-datepicker--content", this.$datepicker), this.$pointer = a(".air-datepicker--pointer", this.$datepicker), this.$nav = a(".air-datepicker--navigation", this.$datepicker);
          }
          _handleLocale() {
            let {
              locale: e,
              dateFormat: t,
              firstDay: i,
              timepicker: s,
              onlyTimepicker: a,
              timeFormat: n,
              dateTimeSeparator: r
            } = this.opts;
            var o;
            this.locale = (o = e, JSON.parse(JSON.stringify(o))), t && (this.locale.dateFormat = t), void 0 !== n && "" !== n && (this.locale.timeFormat = n);
            let {
              timeFormat: h
            } = this.locale;
            if ("" !== i && (this.locale.firstDay = i), s && "function" != typeof t) {
              let e = h ? r : "";
              this.locale.dateFormat = [this.locale.dateFormat, h || ""].join(e);
            }
            a && "function" != typeof t && (this.locale.dateFormat = this.locale.timeFormat);
          }
          _setPositionClasses(e) {
            if ("function" == typeof e) return void this.$datepicker.classList.add("-custom-position-");
            let t = (e = e.split(" "))[0],
              i = `air-datepicker -${t}-${e[1]}- -from-${t}-`;
            this.$datepicker.classList.add(...i.split(" "));
          }
          _bindEvents() {
            this.$el.addEventListener(this.opts.showEvent, this._onFocus), this.$el.addEventListener("blur", this._onBlur), this.$datepicker.addEventListener("mousedown", this._onMouseDown), this.$datepicker.addEventListener("mouseup", this._onMouseUp), window.addEventListener("resize", this._onResize);
          }
          _limitViewDateByMaxMinDates() {
            let {
              viewDate: e,
              minDate: t,
              maxDate: i
            } = this;
            i && m(e, i) && this.setViewDate(i), t && v(e, t) && this.setViewDate(t);
          }
          formatDate() {
            let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.viewDate,
              t = arguments.length > 1 ? arguments[1] : void 0;
            if (e = b(e), !(e instanceof Date)) return;
            let i = t,
              s = this.locale,
              a = h(e),
              n = a.dayPeriod,
              r = c(e),
              o = R.replacer,
              l = {
                T: e.getTime(),
                m: a.minutes,
                mm: a.fullMinutes,
                h: a.hours12,
                hh: a.fullHours12,
                H: a.hours,
                HH: a.fullHours,
                aa: n,
                AA: n.toUpperCase(),
                E: s.daysShort[a.day],
                EEEE: s.days[a.day],
                d: a.date,
                dd: a.fullDate,
                M: a.month + 1,
                MM: a.fullMonth,
                MMM: s.monthsShort[a.month],
                MMMM: s.months[a.month],
                yy: a.year.toString().slice(-2),
                yyyy: a.year,
                yyyy1: r[0],
                yyyy2: r[1]
              };
            for (let [e, t] of Object.entries(l)) i = o(i, k(e), t);
            return i;
          }
          down(e) {
            this._handleUpDownActions(e, "down");
          }
          up(e) {
            this._handleUpDownActions(e, "up");
          }
          selectDate(e) {
            let t,
              s = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
              {
                currentView: a,
                parsedViewDate: n,
                selectedDates: r
              } = this,
              {
                updateTime: o
              } = s,
              {
                moveToOtherMonthsOnSelect: h,
                moveToOtherYearsOnSelect: l,
                multipleDates: d,
                range: c,
                autoClose: u,
                onBeforeSelect: p
              } = this.opts,
              v = r.length;
            if (Array.isArray(e)) return e.forEach(e => {
              this.selectDate(e, s);
            }), new Promise(e => {
              setTimeout(e);
            });
            if ((e = b(e)) instanceof Date) {
              if (p && !p({
                date: e,
                datepicker: this
              })) return Promise.resolve();
              if (a === i.days && e.getMonth() !== n.month && h && (t = new Date(e.getFullYear(), e.getMonth(), 1)), a === i.years && e.getFullYear() !== n.year && l && (t = new Date(e.getFullYear(), 0, 1)), t && this.setViewDate(t), d && !c) {
                if (v === d) return;
                this._checkIfDateIsSelected(e) || r.push(e);
              } else if (c) switch (v) {
                case 1:
                  r.push(e), this.rangeDateTo || (this.rangeDateTo = e), m(this.rangeDateFrom, this.rangeDateTo) && (this.rangeDateTo = this.rangeDateFrom, this.rangeDateFrom = e), this.selectedDates = [this.rangeDateFrom, this.rangeDateTo];
                  break;
                case 2:
                  this.selectedDates = [e], this.rangeDateFrom = e, this.rangeDateTo = "";
                  break;
                default:
                  this.selectedDates = [e], this.rangeDateFrom = e;
              } else this.selectedDates = [e];
              return this.trigger(i.eventChangeSelectedDate, {
                action: i.actionSelectDate,
                silent: null == s ? void 0 : s.silent,
                date: e,
                updateTime: o
              }), this._updateLastSelectedDate(e), u && !this.timepickerIsActive && this.visible && (d || c ? c && 1 === v && this.hide() : this.hide()), new Promise(e => {
                setTimeout(e);
              });
            }
          }
          unselectDate(e) {
            let t = this.selectedDates,
              s = this;
            if ((e = b(e)) instanceof Date) return t.some((a, n) => {
              if (p(a, e)) return t.splice(n, 1), s.selectedDates.length ? (s.rangeDateTo = "", s.rangeDateFrom = t[0], s._updateLastSelectedDate(s.selectedDates[s.selectedDates.length - 1])) : (s.rangeDateFrom = "", s.rangeDateTo = "", s._updateLastSelectedDate(!1)), this.trigger(i.eventChangeSelectedDate, {
                action: i.actionUnselectDate,
                date: e
              }), !0;
            });
          }
          replaceDate(e, t) {
            let s = this.selectedDates.find(t => p(t, e, this.currentView)),
              a = this.selectedDates.indexOf(s);
            a < 0 || p(this.selectedDates[a], t, this.currentView) || (this.selectedDates[a] = t, this.trigger(i.eventChangeSelectedDate, {
              action: i.actionSelectDate,
              date: t,
              updateTime: !0
            }), this._updateLastSelectedDate(t));
          }
          clear() {
            let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
            return this.selectedDates = [], this.rangeDateFrom = !1, this.rangeDateTo = !1, this.lastSelectedDate = !1, this.trigger(i.eventChangeSelectedDate, {
              action: i.actionUnselectDate,
              silent: e.silent
            }), new Promise(e => {
              setTimeout(e);
            });
          }
          show() {
            let {
              onShow: e,
              isMobile: t
            } = this.opts;
            this._cancelScheduledCall(), this.visible || this.hideAnimation || this._createComponents(), this.setPosition(this.opts.position), this.$datepicker.classList.add("-active-"), this.visible = !0, e && this._scheduleCallAfterTransition(e), t && this._showMobileOverlay();
          }
          hide() {
            let {
                onHide: e,
                isMobile: t
              } = this.opts,
              i = this._hasTransition();
            this.visible = !1, this.hideAnimation = !0, this.$datepicker.classList.remove("-active-"), this.customHide && this.customHide(), this.elIsInput && this.$el.blur(), this._scheduleCallAfterTransition(t => {
              !this.customHide && (t && i || !t && !i) && this._finishHide(), e && e(t);
            }), t && j.classList.remove("-active-");
          }
          _triggerOnSelect() {
            let e = [],
              t = [],
              {
                selectedDates: i,
                locale: s,
                opts: {
                  onSelect: a,
                  multipleDates: n,
                  range: r
                }
              } = this,
              o = n || r,
              h = "function" == typeof s.dateFormat;
            i.length && (e = i.map(g), t = h ? n ? s.dateFormat(e) : e.map(e => s.dateFormat(e)) : e.map(e => this.formatDate(e, s.dateFormat))), a({
              date: o ? e : e[0],
              formattedDate: o ? t : t[0],
              datepicker: this
            });
          }
          _handleAlreadySelectedDates(e, t) {
            let {
                selectedDates: i,
                rangeDateFrom: s,
                rangeDateTo: a
              } = this,
              {
                range: n,
                toggleSelected: r
              } = this.opts,
              o = i.length,
              h = "function" == typeof r ? r({
                datepicker: this,
                date: t
              }) : r,
              l = Boolean(n && 1 === o && e),
              d = l ? g(t) : t;
            n && !h && (2 !== o && this.selectDate(d), 2 === o && p(s, a)) || (h ? this.unselectDate(d) : this._updateLastSelectedDate(l ? d : e));
          }
          _handleUpDownActions(e, t) {
            if (!((e = b(e || this.focusDate || this.viewDate)) instanceof Date)) return;
            let i = "up" === t ? this.viewIndex + 1 : this.viewIndex - 1;
            i > 2 && (i = 2), i < 0 && (i = 0), this.setViewDate(new Date(e.getFullYear(), e.getMonth(), 1)), this.setCurrentView(this.viewIndexes[i]);
          }
          getCell(e) {
            let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : i.day;
            if (!((e = b(e)) instanceof Date)) return;
            let {
                year: s,
                month: a,
                date: n
              } = h(e),
              r = `[data-year="${s}"]`,
              o = `[data-month="${a}"]`,
              l = {
                [i.day]: `${r}${o}[data-date="${n}"]`,
                [i.month]: `${r}${o}`,
                [i.year]: `${r}`
              };
            return this.views[this.currentView] ? this.views[this.currentView].$el.querySelector(l[t]) : void 0;
          }
          _showMobileOverlay() {
            j.classList.add("-active-");
          }
          _hasTransition() {
            return window.getComputedStyle(this.$datepicker).getPropertyValue("transition-duration").split(", ").reduce((e, t) => parseFloat(t) + e, 0) > 0;
          }
          get shouldUpdateDOM() {
            return this.visible || this.treatAsInline;
          }
          get parsedViewDate() {
            return h(this.viewDate);
          }
          get currentViewSingular() {
            return this.currentView.slice(0, -1);
          }
          get curDecade() {
            return c(this.viewDate);
          }
          get viewIndex() {
            return this.viewIndexes.indexOf(this.currentView);
          }
          get isFinalView() {
            return this.currentView === i.years;
          }
          get hasSelectedDates() {
            return this.selectedDates.length > 0;
          }
          get isMinViewReached() {
            return this.currentView === this.opts.minView || this.currentView === i.days;
          }
          get $container() {
            return this.$customContainer || P;
          }
          static replacer(e, t, i) {
            return e.replace(t, function (e, t, s, a) {
              return t + i + a;
            });
          }
        }
        var K;
        return I(R, "defaults", s), I(R, "version", "3.5.3"), I(R, "defaultGlobalContainerId", "air-datepicker-global-container"), K = R.prototype, Object.assign(K, N), t.default;
      }();
    });
  })(airDatepicker$1);
  return airDatepicker$1.exports;
}var airDatepickerExports = requireAirDatepicker();
var AirDatepicker = /*@__PURE__*/getDefaultExportFromCjs(airDatepickerExports);var de = {};var hasRequiredDe;
function requireDe() {
  if (hasRequiredDe) return de;
  hasRequiredDe = 1;
  Object.defineProperty(de, "__esModule", {
    value: true
  });
  de.default = void 0;
  var _default = {
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    daysShort: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
    daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    today: 'Heute',
    clear: 'Löschen',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    firstDay: 1
  };
  de.default = _default;
  return de;
}var deExports = requireDe();
var localeDe = /*@__PURE__*/getDefaultExportFromCjs(deExports);/**
 * MicroEvent - to make any js object an event emitter
 *
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * @author Jerome Etienne (https://github.com/jeromeetienne)
 */
/**
 * Execute callback for each event in space separated list of event names
 *
 */
function forEvents(events, callback) {
  events.split(/\s+/).forEach(event => {
    callback(event);
  });
}
class MicroEvent {
  constructor() {
    this._events = {};
  }
  on(events, fct) {
    forEvents(events, event => {
      const event_array = this._events[event] || [];
      event_array.push(fct);
      this._events[event] = event_array;
    });
  }
  off(events, fct) {
    var n = arguments.length;
    if (n === 0) {
      this._events = {};
      return;
    }
    forEvents(events, event => {
      if (n === 1) {
        delete this._events[event];
        return;
      }
      const event_array = this._events[event];
      if (event_array === undefined) return;
      event_array.splice(event_array.indexOf(fct), 1);
      this._events[event] = event_array;
    });
  }
  trigger(events, ...args) {
    var self = this;
    forEvents(events, event => {
      const event_array = self._events[event];
      if (event_array === undefined) return;
      event_array.forEach(fct => {
        fct.apply(self, args);
      });
    });
  }
}/**
 * microplugin.js
 * Copyright (c) 2013 Brian Reavis & contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */
function MicroPlugin(Interface) {
  Interface.plugins = {};
  return class extends Interface {
    constructor() {
      super(...arguments);
      this.plugins = {
        names: [],
        settings: {},
        requested: {},
        loaded: {}
      };
    }
    /**
     * Registers a plugin.
     *
     * @param {function} fn
     */
    static define(name, fn) {
      Interface.plugins[name] = {
        'name': name,
        'fn': fn
      };
    }
    /**
     * Initializes the listed plugins (with options).
     * Acceptable formats:
     *
     * List (without options):
     *   ['a', 'b', 'c']
     *
     * List (with options):
     *   [{'name': 'a', options: {}}, {'name': 'b', options: {}}]
     *
     * Hash (with options):
     *   {'a': { ... }, 'b': { ... }, 'c': { ... }}
     *
     * @param {array|object} plugins
     */
    initializePlugins(plugins) {
      var key, name;
      const self = this;
      const queue = [];
      if (Array.isArray(plugins)) {
        plugins.forEach(plugin => {
          if (typeof plugin === 'string') {
            queue.push(plugin);
          } else {
            self.plugins.settings[plugin.name] = plugin.options;
            queue.push(plugin.name);
          }
        });
      } else if (plugins) {
        for (key in plugins) {
          if (plugins.hasOwnProperty(key)) {
            self.plugins.settings[key] = plugins[key];
            queue.push(key);
          }
        }
      }
      while (name = queue.shift()) {
        self.require(name);
      }
    }
    loadPlugin(name) {
      var self = this;
      var plugins = self.plugins;
      var plugin = Interface.plugins[name];
      if (!Interface.plugins.hasOwnProperty(name)) {
        throw new Error('Unable to find "' + name + '" plugin');
      }
      plugins.requested[name] = true;
      plugins.loaded[name] = plugin.fn.apply(self, [self.plugins.settings[name] || {}]);
      plugins.names.push(name);
    }
    /**
     * Initializes a plugin.
     *
     */
    require(name) {
      var self = this;
      var plugins = self.plugins;
      if (!self.plugins.loaded.hasOwnProperty(name)) {
        if (plugins.requested[name]) {
          throw new Error('Plugin has circular dependency ("' + name + '")');
        }
        self.loadPlugin(name);
      }
      return plugins.loaded[name];
    }
  };
}/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 */
const arrayToPattern = chars => {
  chars = chars.filter(Boolean);
  if (chars.length < 2) {
    return chars[0] || '';
  }
  return maxValueLength(chars) == 1 ? '[' + chars.join('') + ']' : '(?:' + chars.join('|') + ')';
};
const sequencePattern = array => {
  if (!hasDuplicates(array)) {
    return array.join('');
  }
  let pattern = '';
  let prev_char_count = 0;
  const prev_pattern = () => {
    if (prev_char_count > 1) {
      pattern += '{' + prev_char_count + '}';
    }
  };
  array.forEach((char, i) => {
    if (char === array[i - 1]) {
      prev_char_count++;
      return;
    }
    prev_pattern();
    pattern += char;
    prev_char_count = 1;
  });
  prev_pattern();
  return pattern;
};
/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 */
const setToPattern = chars => {
  let array = Array.from(chars);
  return arrayToPattern(array);
};
/**
 * https://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values
 */
const hasDuplicates = array => {
  return new Set(array).size !== array.length;
};
/**
 * https://stackoverflow.com/questions/63006601/why-does-u-throw-an-invalid-escape-error
 */
const escape_regex = str => {
  return (str + '').replace(/([\$\(\)\*\+\.\?\[\]\^\{\|\}\\])/gu, '\\$1');
};
/**
 * Return the max length of array values
 */
const maxValueLength = array => {
  return array.reduce((longest, value) => Math.max(longest, unicodeLength(value)), 0);
};
const unicodeLength = str => {
  return Array.from(str).length;
};/**
 * Get all possible combinations of substrings that add up to the given string
 * https://stackoverflow.com/questions/30169587/find-all-the-combination-of-substrings-that-add-up-to-the-given-string
 */
const allSubstrings = input => {
  if (input.length === 1) return [[input]];
  let result = [];
  const start = input.substring(1);
  const suba = allSubstrings(start);
  suba.forEach(function (subresult) {
    let tmp = subresult.slice(0);
    tmp[0] = input.charAt(0) + tmp[0];
    result.push(tmp);
    tmp = subresult.slice(0);
    tmp.unshift(input.charAt(0));
    result.push(tmp);
  });
  return result;
};const code_points = [[0, 65535]];
const accent_pat = '[\u0300-\u036F\u{b7}\u{2be}\u{2bc}]';
let unicode_map;
let multi_char_reg;
const max_char_length = 3;
const latin_convert = {};
const latin_condensed = {
  '/': '⁄∕',
  '0': '߀',
  "a": "ⱥɐɑ",
  "aa": "ꜳ",
  "ae": "æǽǣ",
  "ao": "ꜵ",
  "au": "ꜷ",
  "av": "ꜹꜻ",
  "ay": "ꜽ",
  "b": "ƀɓƃ",
  "c": "ꜿƈȼↄ",
  "d": "đɗɖᴅƌꮷԁɦ",
  "e": "ɛǝᴇɇ",
  "f": "ꝼƒ",
  "g": "ǥɠꞡᵹꝿɢ",
  "h": "ħⱨⱶɥ",
  "i": "ɨı",
  "j": "ɉȷ",
  "k": "ƙⱪꝁꝃꝅꞣ",
  "l": "łƚɫⱡꝉꝇꞁɭ",
  "m": "ɱɯϻ",
  "n": "ꞥƞɲꞑᴎлԉ",
  "o": "øǿɔɵꝋꝍᴑ",
  "oe": "œ",
  "oi": "ƣ",
  "oo": "ꝏ",
  "ou": "ȣ",
  "p": "ƥᵽꝑꝓꝕρ",
  "q": "ꝗꝙɋ",
  "r": "ɍɽꝛꞧꞃ",
  "s": "ßȿꞩꞅʂ",
  "t": "ŧƭʈⱦꞇ",
  "th": "þ",
  "tz": "ꜩ",
  "u": "ʉ",
  "v": "ʋꝟʌ",
  "vy": "ꝡ",
  "w": "ⱳ",
  "y": "ƴɏỿ",
  "z": "ƶȥɀⱬꝣ",
  "hv": "ƕ"
};
for (let latin in latin_condensed) {
  let unicode = latin_condensed[latin] || '';
  for (let i = 0; i < unicode.length; i++) {
    let char = unicode.substring(i, i + 1);
    latin_convert[char] = latin;
  }
}
const convert_pat = new RegExp(Object.keys(latin_convert).join('|') + '|' + accent_pat, 'gu');
/**
 * Initialize the unicode_map from the give code point ranges
 */
const initialize = _code_points => {
  if (unicode_map !== undefined) return;
  unicode_map = generateMap(code_points);
};
/**
 * Helper method for normalize a string
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
 */
const normalize = (str, form = 'NFKD') => str.normalize(form);
/**
 * Remove accents without reordering string
 * calling str.normalize('NFKD') on \u{594}\u{595}\u{596} becomes \u{596}\u{594}\u{595}
 * via https://github.com/krisk/Fuse/issues/133#issuecomment-318692703
 */
const asciifold = str => {
  return Array.from(str).reduce(
  /**
   * @param {string} result
   * @param {string} char
   */
  (result, char) => {
    return result + _asciifold(char);
  }, '');
};
const _asciifold = str => {
  str = normalize(str).toLowerCase().replace(convert_pat, (/** @type {string} */char) => {
    return latin_convert[char] || '';
  });
  //return str;
  return normalize(str, 'NFC');
};
/**
 * Generate a list of unicode variants from the list of code points
 */
function* generator(code_points) {
  for (const [code_point_min, code_point_max] of code_points) {
    for (let i = code_point_min; i <= code_point_max; i++) {
      let composed = String.fromCharCode(i);
      let folded = asciifold(composed);
      if (folded == composed.toLowerCase()) {
        continue;
      }
      // skip when folded is a string longer than 3 characters long
      // bc the resulting regex patterns will be long
      // eg:
      // folded صلى الله عليه وسلم length 18 code point 65018
      // folded جل جلاله length 8 code point 65019
      if (folded.length > max_char_length) {
        continue;
      }
      if (folded.length == 0) {
        continue;
      }
      yield {
        folded: folded,
        composed: composed,
        code_point: i
      };
    }
  }
}
/**
 * Generate a unicode map from the list of code points
 */
const generateSets = code_points => {
  const unicode_sets = {};
  const addMatching = (folded, to_add) => {
    /** @type {Set<string>} */
    const folded_set = unicode_sets[folded] || new Set();
    const patt = new RegExp('^' + setToPattern(folded_set) + '$', 'iu');
    if (to_add.match(patt)) {
      return;
    }
    folded_set.add(escape_regex(to_add));
    unicode_sets[folded] = folded_set;
  };
  for (let value of generator(code_points)) {
    addMatching(value.folded, value.folded);
    addMatching(value.folded, value.composed);
  }
  return unicode_sets;
};
/**
 * Generate a unicode map from the list of code points
 * ae => (?:(?:ae|Æ|Ǽ|Ǣ)|(?:A|Ⓐ|Ａ...)(?:E|ɛ|Ⓔ...))
 */
const generateMap = code_points => {
  const unicode_sets = generateSets(code_points);
  const unicode_map = {};
  let multi_char = [];
  for (let folded in unicode_sets) {
    let set = unicode_sets[folded];
    if (set) {
      unicode_map[folded] = setToPattern(set);
    }
    if (folded.length > 1) {
      multi_char.push(escape_regex(folded));
    }
  }
  multi_char.sort((a, b) => b.length - a.length);
  const multi_char_patt = arrayToPattern(multi_char);
  multi_char_reg = new RegExp('^' + multi_char_patt, 'u');
  return unicode_map;
};
/**
 * Map each element of an array from its folded value to all possible unicode matches
 */
const mapSequence = (strings, min_replacement = 1) => {
  let chars_replaced = 0;
  strings = strings.map(str => {
    if (unicode_map[str]) {
      chars_replaced += str.length;
    }
    return unicode_map[str] || str;
  });
  if (chars_replaced >= min_replacement) {
    return sequencePattern(strings);
  }
  return '';
};
/**
 * Convert a short string and split it into all possible patterns
 * Keep a pattern only if min_replacement is met
 *
 * 'abc'
 * 		=> [['abc'],['ab','c'],['a','bc'],['a','b','c']]
 *		=> ['abc-pattern','ab-c-pattern'...]
 */
const substringsToPattern = (str, min_replacement = 1) => {
  min_replacement = Math.max(min_replacement, str.length - 1);
  return arrayToPattern(allSubstrings(str).map(sub_pat => {
    return mapSequence(sub_pat, min_replacement);
  }));
};
/**
 * Convert an array of sequences into a pattern
 * [{start:0,end:3,length:3,substr:'iii'}...] => (?:iii...)
 */
const sequencesToPattern = (sequences, all = true) => {
  let min_replacement = sequences.length > 1 ? 1 : 0;
  return arrayToPattern(sequences.map(sequence => {
    let seq = [];
    const len = all ? sequence.length() : sequence.length() - 1;
    for (let j = 0; j < len; j++) {
      seq.push(substringsToPattern(sequence.substrs[j] || '', min_replacement));
    }
    return sequencePattern(seq);
  }));
};
/**
 * Return true if the sequence is already in the sequences
 */
const inSequences = (needle_seq, sequences) => {
  for (const seq of sequences) {
    if (seq.start != needle_seq.start || seq.end != needle_seq.end) {
      continue;
    }
    if (seq.substrs.join('') !== needle_seq.substrs.join('')) {
      continue;
    }
    let needle_parts = needle_seq.parts;
    const filter = part => {
      for (const needle_part of needle_parts) {
        if (needle_part.start === part.start && needle_part.substr === part.substr) {
          return false;
        }
        if (part.length == 1 || needle_part.length == 1) {
          continue;
        }
        // check for overlapping parts
        // a = ['::=','==']
        // b = ['::','===']
        // a = ['r','sm']
        // b = ['rs','m']
        if (part.start < needle_part.start && part.end > needle_part.start) {
          return true;
        }
        if (needle_part.start < part.start && needle_part.end > part.start) {
          return true;
        }
      }
      return false;
    };
    let filtered = seq.parts.filter(filter);
    if (filtered.length > 0) {
      continue;
    }
    return true;
  }
  return false;
};
class Sequence {
  parts;
  substrs;
  start;
  end;
  constructor() {
    this.parts = [];
    this.substrs = [];
    this.start = 0;
    this.end = 0;
  }
  add(part) {
    if (part) {
      this.parts.push(part);
      this.substrs.push(part.substr);
      this.start = Math.min(part.start, this.start);
      this.end = Math.max(part.end, this.end);
    }
  }
  last() {
    return this.parts[this.parts.length - 1];
  }
  length() {
    return this.parts.length;
  }
  clone(position, last_piece) {
    let clone = new Sequence();
    let parts = JSON.parse(JSON.stringify(this.parts));
    let last_part = parts.pop();
    for (const part of parts) {
      clone.add(part);
    }
    let last_substr = last_piece.substr.substring(0, position - last_part.start);
    let clone_last_len = last_substr.length;
    clone.add({
      start: last_part.start,
      end: last_part.start + clone_last_len,
      length: clone_last_len,
      substr: last_substr
    });
    return clone;
  }
}
/**
 * Expand a regular expression pattern to include unicode variants
 * 	eg /a/ becomes /aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐɑAⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ/
 *
 * Issue:
 *  ﺊﺋ [ 'ﺊ = \\u{fe8a}', 'ﺋ = \\u{fe8b}' ]
 *	becomes:	ئئ [ 'ي = \\u{64a}', 'ٔ = \\u{654}', 'ي = \\u{64a}', 'ٔ = \\u{654}' ]
 *
 *	İĲ = IIJ = ⅡJ
 *
 * 	1/2/4
 */
const getPattern = str => {
  initialize();
  str = asciifold(str);
  let pattern = '';
  let sequences = [new Sequence()];
  for (let i = 0; i < str.length; i++) {
    let substr = str.substring(i);
    let match = substr.match(multi_char_reg);
    const char = str.substring(i, i + 1);
    const match_str = match ? match[0] : null;
    // loop through sequences
    // add either the char or multi_match
    let overlapping = [];
    let added_types = new Set();
    for (const sequence of sequences) {
      const last_piece = sequence.last();
      if (!last_piece || last_piece.length == 1 || last_piece.end <= i) {
        // if we have a multi match
        if (match_str) {
          const len = match_str.length;
          sequence.add({
            start: i,
            end: i + len,
            length: len,
            substr: match_str
          });
          added_types.add('1');
        } else {
          sequence.add({
            start: i,
            end: i + 1,
            length: 1,
            substr: char
          });
          added_types.add('2');
        }
      } else if (match_str) {
        let clone = sequence.clone(i, last_piece);
        const len = match_str.length;
        clone.add({
          start: i,
          end: i + len,
          length: len,
          substr: match_str
        });
        overlapping.push(clone);
      } else {
        // don't add char
        // adding would create invalid patterns: 234 => [2,34,4]
        added_types.add('3');
      }
    }
    // if we have overlapping
    if (overlapping.length > 0) {
      // ['ii','iii'] before ['i','i','iii']
      overlapping = overlapping.sort((a, b) => {
        return a.length() - b.length();
      });
      for (let clone of overlapping) {
        // don't add if we already have an equivalent sequence
        if (inSequences(clone, sequences)) {
          continue;
        }
        sequences.push(clone);
      }
      continue;
    }
    // if we haven't done anything unique
    // clean up the patterns
    // helps keep patterns smaller
    // if str = 'r₨㎧aarss', pattern will be 446 instead of 655
    if (i > 0 && added_types.size == 1 && !added_types.has('3')) {
      pattern += sequencesToPattern(sequences, false);
      let new_seq = new Sequence();
      const old_seq = sequences[0];
      if (old_seq) {
        new_seq.add(old_seq.last());
      }
      sequences = [new_seq];
    }
  }
  pattern += sequencesToPattern(sequences, true);
  return pattern;
};/**
 * A property getter resolving dot-notation
 * @param  {Object}  obj     The root object to fetch property on
 * @param  {String}  name    The optionally dotted property name to fetch
 * @return {Object}          The resolved property value
 */
const getAttr = (obj, name) => {
  if (!obj) return;
  return obj[name];
};
/**
 * A property getter resolving dot-notation
 * @param  {Object}  obj     The root object to fetch property on
 * @param  {String}  name    The optionally dotted property name to fetch
 * @return {Object}          The resolved property value
 */
const getAttrNesting = (obj, name) => {
  if (!obj) return;
  var part,
    names = name.split(".");
  while ((part = names.shift()) && (obj = obj[part]));
  return obj;
};
/**
 * Calculates how close of a match the
 * given value is against a search token.
 *
 */
const scoreValue = (value, token, weight) => {
  var score, pos;
  if (!value) return 0;
  value = value + '';
  if (token.regex == null) return 0;
  pos = value.search(token.regex);
  if (pos === -1) return 0;
  score = token.string.length / value.length;
  if (pos === 0) score += 0.5;
  return score * weight;
};
/**
 * Cast object property to an array if it exists and has a value
 *
 */
const propToArray = (obj, key) => {
  var value = obj[key];
  if (typeof value == 'function') return value;
  if (value && !Array.isArray(value)) {
    obj[key] = [value];
  }
};
/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
const iterate$5 = (object, callback) => {
  if (Array.isArray(object)) {
    object.forEach(callback);
  } else {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  }
};
const cmp = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a > b ? 1 : a < b ? -1 : 0;
  }
  a = asciifold(a + '').toLowerCase();
  b = asciifold(b + '').toLowerCase();
  if (a > b) return 1;
  if (b > a) return -1;
  return 0;
};/**
 * sifter.js
 * Copyright (c) 2013–2020 Brian Reavis & contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */
class Sifter {
  items; // []|{};
  settings;
  /**
   * Textually searches arrays and hashes of objects
   * by property (or multiple properties). Designed
   * specifically for autocomplete.
   *
   */
  constructor(items, settings) {
    this.items = items;
    this.settings = settings || {
      diacritics: true
    };
  }
  /**
   * Splits a search string into an array of individual
   * regexps to be used to match results.
   *
   */
  tokenize(query, respect_word_boundaries, weights) {
    if (!query || !query.length) return [];
    const tokens = [];
    const words = query.split(/\s+/);
    var field_regex;
    if (weights) {
      field_regex = new RegExp('^(' + Object.keys(weights).map(escape_regex).join('|') + ')\:(.*)$');
    }
    words.forEach(word => {
      let field_match;
      let field = null;
      let regex = null;
      // look for "field:query" tokens
      if (field_regex && (field_match = word.match(field_regex))) {
        field = field_match[1];
        word = field_match[2];
      }
      if (word.length > 0) {
        if (this.settings.diacritics) {
          regex = getPattern(word) || null;
        } else {
          regex = escape_regex(word);
        }
        if (regex && respect_word_boundaries) regex = "\\b" + regex;
      }
      tokens.push({
        string: word,
        regex: regex ? new RegExp(regex, 'iu') : null,
        field: field
      });
    });
    return tokens;
  }
  /**
   * Returns a function to be used to score individual results.
   *
   * Good matches will have a higher score than poor matches.
   * If an item is not a match, 0 will be returned by the function.
   *
   * @returns {T.ScoreFn}
   */
  getScoreFunction(query, options) {
    var search = this.prepareSearch(query, options);
    return this._getScoreFunction(search);
  }
  /**
   * @returns {T.ScoreFn}
   *
   */
  _getScoreFunction(search) {
    const tokens = search.tokens,
      token_count = tokens.length;
    if (!token_count) {
      return function () {
        return 0;
      };
    }
    const fields = search.options.fields,
      weights = search.weights,
      field_count = fields.length,
      getAttrFn = search.getAttrFn;
    if (!field_count) {
      return function () {
        return 1;
      };
    }
    /**
     * Calculates the score of an object
     * against the search query.
     *
     */
    const scoreObject = function () {
      if (field_count === 1) {
        return function (token, data) {
          const field = fields[0].field;
          return scoreValue(getAttrFn(data, field), token, weights[field] || 1);
        };
      }
      return function (token, data) {
        var sum = 0;
        // is the token specific to a field?
        if (token.field) {
          const value = getAttrFn(data, token.field);
          if (!token.regex && value) {
            sum += 1 / field_count;
          } else {
            sum += scoreValue(value, token, 1);
          }
        } else {
          iterate$5(weights, (weight, field) => {
            sum += scoreValue(getAttrFn(data, field), token, weight);
          });
        }
        return sum / field_count;
      };
    }();
    if (token_count === 1) {
      return function (data) {
        return scoreObject(tokens[0], data);
      };
    }
    if (search.options.conjunction === 'and') {
      return function (data) {
        var score,
          sum = 0;
        for (let token of tokens) {
          score = scoreObject(token, data);
          if (score <= 0) return 0;
          sum += score;
        }
        return sum / token_count;
      };
    } else {
      return function (data) {
        var sum = 0;
        iterate$5(tokens, token => {
          sum += scoreObject(token, data);
        });
        return sum / token_count;
      };
    }
  }
  /**
   * Returns a function that can be used to compare two
   * results, for sorting purposes. If no sorting should
   * be performed, `null` will be returned.
   *
   * @return function(a,b)
   */
  getSortFunction(query, options) {
    var search = this.prepareSearch(query, options);
    return this._getSortFunction(search);
  }
  _getSortFunction(search) {
    var implicit_score,
      sort_flds = [];
    const self = this,
      options = search.options,
      sort = !search.query && options.sort_empty ? options.sort_empty : options.sort;
    if (typeof sort == 'function') {
      return sort.bind(this);
    }
    /**
     * Fetches the specified sort field value
     * from a search result item.
     *
     */
    const get_field = function (name, result) {
      if (name === '$score') return result.score;
      return search.getAttrFn(self.items[result.id], name);
    };
    // parse options
    if (sort) {
      for (let s of sort) {
        if (search.query || s.field !== '$score') {
          sort_flds.push(s);
        }
      }
    }
    // the "$score" field is implied to be the primary
    // sort field, unless it's manually specified
    if (search.query) {
      implicit_score = true;
      for (let fld of sort_flds) {
        if (fld.field === '$score') {
          implicit_score = false;
          break;
        }
      }
      if (implicit_score) {
        sort_flds.unshift({
          field: '$score',
          direction: 'desc'
        });
      }
      // without a search.query, all items will have the same score
    } else {
      sort_flds = sort_flds.filter(fld => fld.field !== '$score');
    }
    // build function
    const sort_flds_count = sort_flds.length;
    if (!sort_flds_count) {
      return null;
    }
    return function (a, b) {
      var result, field;
      for (let sort_fld of sort_flds) {
        field = sort_fld.field;
        let multiplier = sort_fld.direction === 'desc' ? -1 : 1;
        result = multiplier * cmp(get_field(field, a), get_field(field, b));
        if (result) return result;
      }
      return 0;
    };
  }
  /**
   * Parses a search query and returns an object
   * with tokens and fields ready to be populated
   * with results.
   *
   */
  prepareSearch(query, optsUser) {
    const weights = {};
    var options = Object.assign({}, optsUser);
    propToArray(options, 'sort');
    propToArray(options, 'sort_empty');
    // convert fields to new format
    if (options.fields) {
      propToArray(options, 'fields');
      const fields = [];
      options.fields.forEach(field => {
        if (typeof field == 'string') {
          field = {
            field: field,
            weight: 1
          };
        }
        fields.push(field);
        weights[field.field] = 'weight' in field ? field.weight : 1;
      });
      options.fields = fields;
    }
    return {
      options: options,
      query: query.toLowerCase().trim(),
      tokens: this.tokenize(query, options.respect_word_boundaries, weights),
      total: 0,
      items: [],
      weights: weights,
      getAttrFn: options.nesting ? getAttrNesting : getAttr
    };
  }
  /**
   * Searches through all items and returns a sorted array of matches.
   *
   */
  search(query, options) {
    var self = this,
      score,
      search;
    search = this.prepareSearch(query, options);
    options = search.options;
    query = search.query;
    // generate result scoring function
    const fn_score = options.score || self._getScoreFunction(search);
    // perform search and sort
    if (query.length) {
      iterate$5(self.items, (item, id) => {
        score = fn_score(item);
        if (options.filter === false || score > 0) {
          search.items.push({
            'score': score,
            'id': id
          });
        }
      });
    } else {
      iterate$5(self.items, (_, id) => {
        search.items.push({
          'score': 1,
          'id': id
        });
      });
    }
    const fn_sort = self._getSortFunction(search);
    if (fn_sort) search.items.sort(fn_sort);
    // apply limits
    search.total = search.items.length;
    if (typeof options.limit === 'number') {
      search.items = search.items.slice(0, options.limit);
    }
    return search;
  }
}/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */
const hash_key$1 = value => {
  if (typeof value === 'undefined' || value === null) return null;
  return get_hash$1(value);
};
const get_hash$1 = value => {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return value + '';
};
/**
 * Escapes a string for use within HTML.
 *
 */
const escape_html$1 = str => {
  return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};
/**
 * use setTimeout if timeout > 0
 */
const timeout = (fn, timeout) => {
  if (timeout > 0) {
    return window.setTimeout(fn, timeout);
  }
  fn.call(null);
  return null;
};
/**
 * Debounce the user provided load function
 *
 */
const loadDebounce = (fn, delay) => {
  var timeout;
  return function (value, callback) {
    var self = this;
    if (timeout) {
      self.loading = Math.max(self.loading - 1, 0);
      clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
      timeout = null;
      self.loadedSearches[value] = true;
      fn.call(self, value, callback);
    }, delay);
  };
};
/**
 * Debounce all fired events types listed in `types`
 * while executing the provided `fn`.
 *
 */
const debounce_events = (self, types, fn) => {
  var type;
  var trigger = self.trigger;
  var event_args = {};
  // override trigger method
  self.trigger = function () {
    var type = arguments[0];
    if (types.indexOf(type) !== -1) {
      event_args[type] = arguments;
    } else {
      return trigger.apply(self, arguments);
    }
  };
  // invoke provided function
  fn.apply(self, []);
  self.trigger = trigger;
  // trigger queued events
  for (type of types) {
    if (type in event_args) {
      trigger.apply(self, event_args[type]);
    }
  }
};
/**
 * Determines the current selection within a text input control.
 * Returns an object containing:
 *   - start
 *   - length
 *
 * Note: "selectionStart, selectionEnd ... apply only to inputs of types text, search, URL, tel and password"
 * 	- https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
 */
const getSelection = input => {
  return {
    start: input.selectionStart || 0,
    length: (input.selectionEnd || 0) - (input.selectionStart || 0)
  };
};
/**
 * Prevent default
 *
 */
const preventDefault$5 = (evt, stop = false) => {
  if (evt) {
    evt.preventDefault();
    if (stop) {
      evt.stopPropagation();
    }
  }
};
/**
 * Add event helper
 *
 */
const addEvent$5 = (target, type, callback, options) => {
  target.addEventListener(type, callback, options);
};
/**
 * Return true if the requested key is down
 * Will return false if more than one control character is pressed ( when [ctrl+shift+a] != [ctrl+a] )
 * The current evt may not always set ( eg calling advanceSelection() )
 *
 */
const isKeyDown = (key_name, evt) => {
  if (!evt) {
    return false;
  }
  if (!evt[key_name]) {
    return false;
  }
  var count = (evt.altKey ? 1 : 0) + (evt.ctrlKey ? 1 : 0) + (evt.shiftKey ? 1 : 0) + (evt.metaKey ? 1 : 0);
  if (count === 1) {
    return true;
  }
  return false;
};
/**
 * Get the id of an element
 * If the id attribute is not set, set the attribute with the given id
 *
 */
const getId = (el, id) => {
  const existing_id = el.getAttribute('id');
  if (existing_id) {
    return existing_id;
  }
  el.setAttribute('id', id);
  return id;
};
/**
 * Returns a string with backslashes added before characters that need to be escaped.
 */
const addSlashes = str => {
  return str.replace(/[\\"']/g, '\\$&');
};
/**
 *
 */
const append = (parent, node) => {
  if (node) parent.append(node);
};
/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
const iterate$4 = (object, callback) => {
  if (Array.isArray(object)) {
    object.forEach(callback);
  } else {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  }
};/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom$6 = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString$6(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString$6 = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};
const escapeQuery = query => {
  return query.replace(/['"\\]/g, '\\$&');
};
/**
 * Dispatch an event
 *
 */
const triggerEvent = (dom_el, event_name) => {
  var event = document.createEvent('HTMLEvents');
  event.initEvent(event_name, true, false);
  dom_el.dispatchEvent(event);
};
/**
 * Apply CSS rules to a dom element
 *
 */
const applyCSS = (dom_el, css) => {
  Object.assign(dom_el.style, css);
};
/**
 * Add css classes
 *
 */
const addClasses$2 = (elmts, ...classes) => {
  var norm_classes = classesArray$3(classes);
  elmts = castAsArray$3(elmts);
  elmts.map(el => {
    norm_classes.map(cls => {
      el.classList.add(cls);
    });
  });
};
/**
 * Remove css classes
 *
 */
const removeClasses$1 = (elmts, ...classes) => {
  var norm_classes = classesArray$3(classes);
  elmts = castAsArray$3(elmts);
  elmts.map(el => {
    norm_classes.map(cls => {
      el.classList.remove(cls);
    });
  });
};
/**
 * Return arguments
 *
 */
const classesArray$3 = args => {
  var classes = [];
  iterate$4(args, _classes => {
    if (typeof _classes === 'string') {
      _classes = _classes.trim().split(/[\t\n\f\r\s]/);
    }
    if (Array.isArray(_classes)) {
      classes = classes.concat(_classes);
    }
  });
  return classes.filter(Boolean);
};
/**
 * Create an array from arg if it's not already an array
 *
 */
const castAsArray$3 = arg => {
  if (!Array.isArray(arg)) {
    arg = [arg];
  }
  return arg;
};
/**
 * Get the closest node to the evt.target matching the selector
 * Stops at wrapper
 *
 */
const parentMatch$1 = (target, selector, wrapper) => {
  if (wrapper && !wrapper.contains(target)) {
    return;
  }
  while (target && target.matches) {
    if (target.matches(selector)) {
      return target;
    }
    target = target.parentNode;
  }
};
/**
 * Get the first or last item from an array
 *
 * > 0 - right (last)
 * <= 0 - left (first)
 *
 */
const getTail = (list, direction = 0) => {
  if (direction > 0) {
    return list[list.length - 1];
  }
  return list[0];
};
/**
 * Return true if an object is empty
 *
 */
const isEmptyObject = obj => {
  return Object.keys(obj).length === 0;
};
/**
 * Get the index of an element amongst sibling nodes of the same type
 *
 */
const nodeIndex$2 = (el, amongst) => {
  if (!el) return -1;
  amongst = amongst || el.nodeName;
  var i = 0;
  while (el = el.previousElementSibling) {
    if (el.matches(amongst)) {
      i++;
    }
  }
  return i;
};
/**
 * Set attributes of an element
 *
 */
const setAttr$1 = (el, attrs) => {
  iterate$4(attrs, (val, attr) => {
    if (val == null) {
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, '' + val);
    }
  });
};
/**
 * Replace a node
 */
const replaceNode = (existing, replacement) => {
  if (existing.parentNode) existing.parentNode.replaceChild(replacement, existing);
};/**
 * highlight v3 | MIT license | Johann Burkard <jb@eaio.com>
 * Highlights arbitrary terms in a node.
 *
 * - Modified by Marshal <beatgates@gmail.com> 2011-6-24 (added regex)
 * - Modified by Brian Reavis <brian@thirdroute.com> 2012-8-27 (cleanup)
 */
const highlight = (element, regex) => {
  if (regex === null) return;
  // convet string to regex
  if (typeof regex === 'string') {
    if (!regex.length) return;
    regex = new RegExp(regex, 'i');
  }
  // Wrap matching part of text node with highlighting <span>, e.g.
  // Soccer  ->  <span class="highlight">Soc</span>cer  for regex = /soc/i
  const highlightText = node => {
    var match = node.data.match(regex);
    if (match && node.data.length > 0) {
      var spannode = document.createElement('span');
      spannode.className = 'highlight';
      var middlebit = node.splitText(match.index);
      middlebit.splitText(match[0].length);
      var middleclone = middlebit.cloneNode(true);
      spannode.appendChild(middleclone);
      replaceNode(middlebit, spannode);
      return 1;
    }
    return 0;
  };
  // Recurse element node, looking for child text nodes to highlight, unless element
  // is childless, <script>, <style>, or already highlighted: <span class="hightlight">
  const highlightChildren = node => {
    if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName) && (node.className !== 'highlight' || node.tagName !== 'SPAN')) {
      Array.from(node.childNodes).forEach(element => {
        highlightRecursive(element);
      });
    }
  };
  const highlightRecursive = node => {
    if (node.nodeType === 3) {
      return highlightText(node);
    }
    highlightChildren(node);
    return 0;
  };
  highlightRecursive(element);
};
/**
 * removeHighlight fn copied from highlight v5 and
 * edited to remove with(), pass js strict mode, and use without jquery
 */
const removeHighlight = el => {
  var elements = el.querySelectorAll("span.highlight");
  Array.prototype.forEach.call(elements, function (el) {
    var parent = el.parentNode;
    parent.replaceChild(el.firstChild, el);
    parent.normalize();
  });
};const KEY_A = 65;
const KEY_RETURN = 13;
const KEY_ESC$1 = 27;
const KEY_LEFT$1 = 37;
const KEY_UP = 38;
const KEY_RIGHT$1 = 39;
const KEY_DOWN = 40;
const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;
const KEY_TAB$1 = 9;
const IS_MAC = typeof navigator === 'undefined' ? false : /Mac/.test(navigator.userAgent);
const KEY_SHORTCUT = IS_MAC ? 'metaKey' : 'ctrlKey'; // ctrl key or apple key for ma
var defaults = {
  options: [],
  optgroups: [],
  plugins: [],
  delimiter: ',',
  splitOn: null,
  // regexp or string for splitting up values from a paste command
  persist: true,
  diacritics: true,
  create: null,
  createOnBlur: false,
  createFilter: null,
  highlight: true,
  openOnFocus: true,
  shouldOpen: null,
  maxOptions: 50,
  maxItems: null,
  hideSelected: null,
  duplicates: false,
  addPrecedence: false,
  selectOnTab: false,
  preload: null,
  allowEmptyOption: false,
  //closeAfterSelect: false,
  refreshThrottle: 300,
  loadThrottle: 300,
  loadingClass: 'loading',
  dataAttr: null,
  //'data-data',
  optgroupField: 'optgroup',
  valueField: 'value',
  labelField: 'text',
  disabledField: 'disabled',
  optgroupLabelField: 'label',
  optgroupValueField: 'value',
  lockOptgroupOrder: false,
  sortField: '$order',
  searchField: ['text'],
  searchConjunction: 'and',
  mode: null,
  wrapperClass: 'ts-wrapper',
  controlClass: 'ts-control',
  dropdownClass: 'ts-dropdown',
  dropdownContentClass: 'ts-dropdown-content',
  itemClass: 'item',
  optionClass: 'option',
  dropdownParent: null,
  controlInput: '<input type="text" autocomplete="off" size="1" />',
  copyClassesToDropdown: false,
  placeholder: null,
  hidePlaceholder: null,
  shouldLoad: function (query) {
    return query.length > 0;
  },
  /*
  load                 : null, // function(query, callback) { ... }
  score                : null, // function(search) { ... }
  onInitialize         : null, // function() { ... }
  onChange             : null, // function(value) { ... }
  onItemAdd            : null, // function(value, $item) { ... }
  onItemRemove         : null, // function(value) { ... }
  onClear              : null, // function() { ... }
  onOptionAdd          : null, // function(value, data) { ... }
  onOptionRemove       : null, // function(value) { ... }
  onOptionClear        : null, // function() { ... }
  onOptionGroupAdd     : null, // function(id, data) { ... }
  onOptionGroupRemove  : null, // function(id) { ... }
  onOptionGroupClear   : null, // function() { ... }
  onDropdownOpen       : null, // function(dropdown) { ... }
  onDropdownClose      : null, // function(dropdown) { ... }
  onType               : null, // function(str) { ... }
  onDelete             : null, // function(values) { ... }
  */
  render: {
    /*
    item: null,
    optgroup: null,
    optgroup_header: null,
    option: null,
    option_create: null
    */
  }
};function getSettings(input, settings_user) {
  var settings = Object.assign({}, defaults, settings_user);
  var attr_data = settings.dataAttr;
  var field_label = settings.labelField;
  var field_value = settings.valueField;
  var field_disabled = settings.disabledField;
  var field_optgroup = settings.optgroupField;
  var field_optgroup_label = settings.optgroupLabelField;
  var field_optgroup_value = settings.optgroupValueField;
  var tag_name = input.tagName.toLowerCase();
  var placeholder = input.getAttribute('placeholder') || input.getAttribute('data-placeholder');
  if (!placeholder && !settings.allowEmptyOption) {
    let option = input.querySelector('option[value=""]');
    if (option) {
      placeholder = option.textContent;
    }
  }
  var settings_element = {
    placeholder: placeholder,
    options: [],
    optgroups: [],
    items: [],
    maxItems: null
  };
  /**
   * Initialize from a <select> element.
   *
   */
  var init_select = () => {
    var tagName;
    var options = settings_element.options;
    var optionsMap = {};
    var group_count = 1;
    let $order = 0;
    var readData = el => {
      var data = Object.assign({}, el.dataset); // get plain object from DOMStringMap
      var json = attr_data && data[attr_data];
      if (typeof json === 'string' && json.length) {
        data = Object.assign(data, JSON.parse(json));
      }
      return data;
    };
    var addOption = (option, group) => {
      var value = hash_key$1(option.value);
      if (value == null) return;
      if (!value && !settings.allowEmptyOption) return;
      // if the option already exists, it's probably been
      // duplicated in another optgroup. in this case, push
      // the current group to the "optgroup" property on the
      // existing option so that it's rendered in both places.
      if (optionsMap.hasOwnProperty(value)) {
        if (group) {
          var arr = optionsMap[value][field_optgroup];
          if (!arr) {
            optionsMap[value][field_optgroup] = group;
          } else if (!Array.isArray(arr)) {
            optionsMap[value][field_optgroup] = [arr, group];
          } else {
            arr.push(group);
          }
        }
      } else {
        var option_data = readData(option);
        option_data[field_label] = option_data[field_label] || option.textContent;
        option_data[field_value] = option_data[field_value] || value;
        option_data[field_disabled] = option_data[field_disabled] || option.disabled;
        option_data[field_optgroup] = option_data[field_optgroup] || group;
        option_data.$option = option;
        option_data.$order = option_data.$order || ++$order;
        optionsMap[value] = option_data;
        options.push(option_data);
      }
      if (option.selected) {
        settings_element.items.push(value);
      }
    };
    var addGroup = optgroup => {
      var id, optgroup_data;
      optgroup_data = readData(optgroup);
      optgroup_data[field_optgroup_label] = optgroup_data[field_optgroup_label] || optgroup.getAttribute('label') || '';
      optgroup_data[field_optgroup_value] = optgroup_data[field_optgroup_value] || group_count++;
      optgroup_data[field_disabled] = optgroup_data[field_disabled] || optgroup.disabled;
      optgroup_data.$order = optgroup_data.$order || ++$order;
      settings_element.optgroups.push(optgroup_data);
      id = optgroup_data[field_optgroup_value];
      iterate$4(optgroup.children, option => {
        addOption(option, id);
      });
    };
    settings_element.maxItems = input.hasAttribute('multiple') ? null : 1;
    iterate$4(input.children, child => {
      tagName = child.tagName.toLowerCase();
      if (tagName === 'optgroup') {
        addGroup(child);
      } else if (tagName === 'option') {
        addOption(child);
      }
    });
  };
  /**
   * Initialize from a <input type="text"> element.
   *
   */
  var init_textbox = () => {
    const data_raw = input.getAttribute(attr_data);
    if (!data_raw) {
      var value = input.value.trim() || '';
      if (!settings.allowEmptyOption && !value.length) return;
      const values = value.split(settings.delimiter);
      iterate$4(values, value => {
        const option = {};
        option[field_label] = value;
        option[field_value] = value;
        settings_element.options.push(option);
      });
      settings_element.items = values;
    } else {
      settings_element.options = JSON.parse(data_raw);
      iterate$4(settings_element.options, opt => {
        settings_element.items.push(opt[field_value]);
      });
    }
  };
  if (tag_name === 'select') {
    init_select();
  } else {
    init_textbox();
  }
  return Object.assign({}, defaults, settings_element, settings_user);
}var instance_i = 0;
class TomSelect extends MicroPlugin(MicroEvent) {
  constructor(input_arg, user_settings) {
    super();
    this.order = 0;
    this.isOpen = false;
    this.isDisabled = false;
    this.isReadOnly = false;
    this.isInvalid = false; // @deprecated 1.8
    this.isValid = true;
    this.isLocked = false;
    this.isFocused = false;
    this.isInputHidden = false;
    this.isSetup = false;
    this.ignoreFocus = false;
    this.ignoreHover = false;
    this.hasOptions = false;
    this.lastValue = '';
    this.caretPos = 0;
    this.loading = 0;
    this.loadedSearches = {};
    this.activeOption = null;
    this.activeItems = [];
    this.optgroups = {};
    this.options = {};
    this.userOptions = {};
    this.items = [];
    this.refreshTimeout = null;
    instance_i++;
    var dir;
    var input = getDom$6(input_arg);
    if (input.tomselect) {
      throw new Error('Tom Select already initialized on this element');
    }
    input.tomselect = this;
    // detect rtl environment
    var computedStyle = window.getComputedStyle && window.getComputedStyle(input, null);
    dir = computedStyle.getPropertyValue('direction');
    // setup default state
    const settings = getSettings(input, user_settings);
    this.settings = settings;
    this.input = input;
    this.tabIndex = input.tabIndex || 0;
    this.is_select_tag = input.tagName.toLowerCase() === 'select';
    this.rtl = /rtl/i.test(dir);
    this.inputId = getId(input, 'tomselect-' + instance_i);
    this.isRequired = input.required;
    // search system
    this.sifter = new Sifter(this.options, {
      diacritics: settings.diacritics
    });
    // option-dependent defaults
    settings.mode = settings.mode || (settings.maxItems === 1 ? 'single' : 'multi');
    if (typeof settings.hideSelected !== 'boolean') {
      settings.hideSelected = settings.mode === 'multi';
    }
    if (typeof settings.hidePlaceholder !== 'boolean') {
      settings.hidePlaceholder = settings.mode !== 'multi';
    }
    // set up createFilter callback
    var filter = settings.createFilter;
    if (typeof filter !== 'function') {
      if (typeof filter === 'string') {
        filter = new RegExp(filter);
      }
      if (filter instanceof RegExp) {
        settings.createFilter = input => filter.test(input);
      } else {
        settings.createFilter = value => {
          return this.settings.duplicates || !this.options[value];
        };
      }
    }
    this.initializePlugins(settings.plugins);
    this.setupCallbacks();
    this.setupTemplates();
    // Create all elements
    const wrapper = getDom$6('<div>');
    const control = getDom$6('<div>');
    const dropdown = this._render('dropdown');
    const dropdown_content = getDom$6(`<div role="listbox" tabindex="-1">`);
    const classes = this.input.getAttribute('class') || '';
    const inputMode = settings.mode;
    var control_input;
    addClasses$2(wrapper, settings.wrapperClass, classes, inputMode);
    addClasses$2(control, settings.controlClass);
    append(wrapper, control);
    addClasses$2(dropdown, settings.dropdownClass, inputMode);
    if (settings.copyClassesToDropdown) {
      addClasses$2(dropdown, classes);
    }
    addClasses$2(dropdown_content, settings.dropdownContentClass);
    append(dropdown, dropdown_content);
    getDom$6(settings.dropdownParent || wrapper).appendChild(dropdown);
    // default controlInput
    if (isHtmlString$6(settings.controlInput)) {
      control_input = getDom$6(settings.controlInput);
      // set attributes
      var attrs = ['autocorrect', 'autocapitalize', 'autocomplete', 'spellcheck'];
      iterate$4(attrs, attr => {
        if (input.getAttribute(attr)) {
          setAttr$1(control_input, {
            [attr]: input.getAttribute(attr)
          });
        }
      });
      control_input.tabIndex = -1;
      control.appendChild(control_input);
      this.focus_node = control_input;
      // dom element
    } else if (settings.controlInput) {
      control_input = getDom$6(settings.controlInput);
      this.focus_node = control_input;
    } else {
      control_input = getDom$6('<input/>');
      this.focus_node = control;
    }
    this.wrapper = wrapper;
    this.dropdown = dropdown;
    this.dropdown_content = dropdown_content;
    this.control = control;
    this.control_input = control_input;
    this.setup();
  }
  /**
   * set up event bindings.
   *
   */
  setup() {
    const self = this;
    const settings = self.settings;
    const control_input = self.control_input;
    const dropdown = self.dropdown;
    const dropdown_content = self.dropdown_content;
    const wrapper = self.wrapper;
    const control = self.control;
    const input = self.input;
    const focus_node = self.focus_node;
    const passive_event = {
      passive: true
    };
    const listboxId = self.inputId + '-ts-dropdown';
    setAttr$1(dropdown_content, {
      id: listboxId
    });
    setAttr$1(focus_node, {
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false',
      'aria-controls': listboxId
    });
    const control_id = getId(focus_node, self.inputId + '-ts-control');
    const query = "label[for='" + escapeQuery(self.inputId) + "']";
    const label = document.querySelector(query);
    const label_click = self.focus.bind(self);
    if (label) {
      addEvent$5(label, 'click', label_click);
      setAttr$1(label, {
        for: control_id
      });
      const label_id = getId(label, self.inputId + '-ts-label');
      setAttr$1(focus_node, {
        'aria-labelledby': label_id
      });
      setAttr$1(dropdown_content, {
        'aria-labelledby': label_id
      });
    }
    wrapper.style.width = input.style.width;
    if (self.plugins.names.length) {
      const classes_plugins = 'plugin-' + self.plugins.names.join(' plugin-');
      addClasses$2([wrapper, dropdown], classes_plugins);
    }
    if ((settings.maxItems === null || settings.maxItems > 1) && self.is_select_tag) {
      setAttr$1(input, {
        multiple: 'multiple'
      });
    }
    if (settings.placeholder) {
      setAttr$1(control_input, {
        placeholder: settings.placeholder
      });
    }
    // if splitOn was not passed in, construct it from the delimiter to allow pasting universally
    if (!settings.splitOn && settings.delimiter) {
      settings.splitOn = new RegExp('\\s*' + escape_regex(settings.delimiter) + '+\\s*');
    }
    // debounce user defined load() if loadThrottle > 0
    // after initializePlugins() so plugins can create/modify user defined loaders
    if (settings.load && settings.loadThrottle) {
      settings.load = loadDebounce(settings.load, settings.loadThrottle);
    }
    addEvent$5(dropdown, 'mousemove', () => {
      self.ignoreHover = false;
    });
    addEvent$5(dropdown, 'mouseenter', e => {
      var target_match = parentMatch$1(e.target, '[data-selectable]', dropdown);
      if (target_match) self.onOptionHover(e, target_match);
    }, {
      capture: true
    });
    // clicking on an option should select it
    addEvent$5(dropdown, 'click', evt => {
      const option = parentMatch$1(evt.target, '[data-selectable]');
      if (option) {
        self.onOptionSelect(evt, option);
        preventDefault$5(evt, true);
      }
    });
    addEvent$5(control, 'click', evt => {
      var target_match = parentMatch$1(evt.target, '[data-ts-item]', control);
      if (target_match && self.onItemSelect(evt, target_match)) {
        preventDefault$5(evt, true);
        return;
      }
      // retain focus (see control_input mousedown)
      if (control_input.value != '') {
        return;
      }
      self.onClick();
      preventDefault$5(evt, true);
    });
    // keydown on focus_node for arrow_down/arrow_up
    addEvent$5(focus_node, 'keydown', e => self.onKeyDown(e));
    // keypress and input/keyup
    addEvent$5(control_input, 'keypress', e => self.onKeyPress(e));
    addEvent$5(control_input, 'input', e => self.onInput(e));
    addEvent$5(focus_node, 'blur', e => self.onBlur(e));
    addEvent$5(focus_node, 'focus', e => self.onFocus(e));
    addEvent$5(control_input, 'paste', e => self.onPaste(e));
    const doc_mousedown = evt => {
      // blur if target is outside of this instance
      // dropdown is not always inside wrapper
      const target = evt.composedPath()[0];
      if (!wrapper.contains(target) && !dropdown.contains(target)) {
        if (self.isFocused) {
          self.blur();
        }
        self.inputState();
        return;
      }
      // retain focus by preventing native handling. if the
      // event target is the input it should not be modified.
      // otherwise, text selection within the input won't work.
      // Fixes bug #212 which is no covered by tests
      if (target == control_input && self.isOpen) {
        evt.stopPropagation();
        // clicking anywhere in the control should not blur the control_input (which would close the dropdown)
      } else {
        preventDefault$5(evt, true);
      }
    };
    const win_scroll = () => {
      if (self.isOpen) {
        self.positionDropdown();
      }
    };
    addEvent$5(document, 'mousedown', doc_mousedown);
    addEvent$5(window, 'scroll', win_scroll, passive_event);
    addEvent$5(window, 'resize', win_scroll, passive_event);
    this._destroy = () => {
      document.removeEventListener('mousedown', doc_mousedown);
      window.removeEventListener('scroll', win_scroll);
      window.removeEventListener('resize', win_scroll);
      if (label) label.removeEventListener('click', label_click);
    };
    // store original html and tab index so that they can be
    // restored when the destroy() method is called.
    this.revertSettings = {
      innerHTML: input.innerHTML,
      tabIndex: input.tabIndex
    };
    input.tabIndex = -1;
    input.insertAdjacentElement('afterend', self.wrapper);
    self.sync(false);
    settings.items = [];
    delete settings.optgroups;
    delete settings.options;
    addEvent$5(input, 'invalid', () => {
      if (self.isValid) {
        self.isValid = false;
        self.isInvalid = true;
        self.refreshState();
      }
    });
    self.updateOriginalInput();
    self.refreshItems();
    self.close(false);
    self.inputState();
    self.isSetup = true;
    if (input.disabled) {
      self.disable();
    } else if (input.readOnly) {
      self.setReadOnly(true);
    } else {
      self.enable(); //sets tabIndex
    }
    self.on('change', this.onChange);
    addClasses$2(input, 'tomselected', 'ts-hidden-accessible');
    self.trigger('initialize');
    // preload options
    if (settings.preload === true) {
      self.preload();
    }
  }
  /**
   * Register options and optgroups
   *
   */
  setupOptions(options = [], optgroups = []) {
    // build options table
    this.addOptions(options);
    // build optgroup table
    iterate$4(optgroups, optgroup => {
      this.registerOptionGroup(optgroup);
    });
  }
  /**
   * Sets up default rendering functions.
   */
  setupTemplates() {
    var self = this;
    var field_label = self.settings.labelField;
    var field_optgroup = self.settings.optgroupLabelField;
    var templates = {
      'optgroup': data => {
        let optgroup = document.createElement('div');
        optgroup.className = 'optgroup';
        optgroup.appendChild(data.options);
        return optgroup;
      },
      'optgroup_header': (data, escape) => {
        return '<div class="optgroup-header">' + escape(data[field_optgroup]) + '</div>';
      },
      'option': (data, escape) => {
        return '<div>' + escape(data[field_label]) + '</div>';
      },
      'item': (data, escape) => {
        return '<div>' + escape(data[field_label]) + '</div>';
      },
      'option_create': (data, escape) => {
        return '<div class="create">Add <strong>' + escape(data.input) + '</strong>&hellip;</div>';
      },
      'no_results': () => {
        return '<div class="no-results">No results found</div>';
      },
      'loading': () => {
        return '<div class="spinner"></div>';
      },
      'not_loading': () => {},
      'dropdown': () => {
        return '<div></div>';
      }
    };
    self.settings.render = Object.assign({}, templates, self.settings.render);
  }
  /**
   * Maps fired events to callbacks provided
   * in the settings used when creating the control.
   */
  setupCallbacks() {
    var key, fn;
    var callbacks = {
      'initialize': 'onInitialize',
      'change': 'onChange',
      'item_add': 'onItemAdd',
      'item_remove': 'onItemRemove',
      'item_select': 'onItemSelect',
      'clear': 'onClear',
      'option_add': 'onOptionAdd',
      'option_remove': 'onOptionRemove',
      'option_clear': 'onOptionClear',
      'optgroup_add': 'onOptionGroupAdd',
      'optgroup_remove': 'onOptionGroupRemove',
      'optgroup_clear': 'onOptionGroupClear',
      'dropdown_open': 'onDropdownOpen',
      'dropdown_close': 'onDropdownClose',
      'type': 'onType',
      'load': 'onLoad',
      'focus': 'onFocus',
      'blur': 'onBlur'
    };
    for (key in callbacks) {
      fn = this.settings[callbacks[key]];
      if (fn) this.on(key, fn);
    }
  }
  /**
   * Sync the Tom Select instance with the original input or select
   *
   */
  sync(get_settings = true) {
    const self = this;
    const settings = get_settings ? getSettings(self.input, {
      delimiter: self.settings.delimiter
    }) : self.settings;
    self.setupOptions(settings.options, settings.optgroups);
    self.setValue(settings.items || [], true); // silent prevents recursion
    self.lastQuery = null; // so updated options will be displayed in dropdown
  }
  /**
   * Triggered when the main control element
   * has a click event.
   *
   */
  onClick() {
    var self = this;
    if (self.activeItems.length > 0) {
      self.clearActiveItems();
      self.focus();
      return;
    }
    if (self.isFocused && self.isOpen) {
      self.blur();
    } else {
      self.focus();
    }
  }
  /**
   * @deprecated v1.7
   *
   */
  onMouseDown() {}
  /**
   * Triggered when the value of the control has been changed.
   * This should propagate the event to the original DOM
   * input / select element.
   */
  onChange() {
    triggerEvent(this.input, 'input');
    triggerEvent(this.input, 'change');
  }
  /**
   * Triggered on <input> paste.
   *
   */
  onPaste(e) {
    var self = this;
    if (self.isInputHidden || self.isLocked) {
      preventDefault$5(e);
      return;
    }
    // If a regex or string is included, this will split the pasted
    // input and create Items for each separate value
    if (!self.settings.splitOn) {
      return;
    }
    // Wait for pasted text to be recognized in value
    setTimeout(() => {
      var pastedText = self.inputValue();
      if (!pastedText.match(self.settings.splitOn)) {
        return;
      }
      var splitInput = pastedText.trim().split(self.settings.splitOn);
      iterate$4(splitInput, piece => {
        const hash = hash_key$1(piece);
        if (hash) {
          if (this.options[piece]) {
            self.addItem(piece);
          } else {
            self.createItem(piece);
          }
        }
      });
    }, 0);
  }
  /**
   * Triggered on <input> keypress.
   *
   */
  onKeyPress(e) {
    var self = this;
    if (self.isLocked) {
      preventDefault$5(e);
      return;
    }
    var character = String.fromCharCode(e.keyCode || e.which);
    if (self.settings.create && self.settings.mode === 'multi' && character === self.settings.delimiter) {
      self.createItem();
      preventDefault$5(e);
      return;
    }
  }
  /**
   * Triggered on <input> keydown.
   *
   */
  onKeyDown(e) {
    var self = this;
    self.ignoreHover = true;
    if (self.isLocked) {
      if (e.keyCode !== KEY_TAB$1) {
        preventDefault$5(e);
      }
      return;
    }
    switch (e.keyCode) {
      // ctrl+A: select all
      case KEY_A:
        if (isKeyDown(KEY_SHORTCUT, e)) {
          if (self.control_input.value == '') {
            preventDefault$5(e);
            self.selectAll();
            return;
          }
        }
        break;
      // esc: close dropdown
      case KEY_ESC$1:
        if (self.isOpen) {
          preventDefault$5(e, true);
          self.close();
        }
        self.clearActiveItems();
        return;
      // down: open dropdown or move selection down
      case KEY_DOWN:
        if (!self.isOpen && self.hasOptions) {
          self.open();
        } else if (self.activeOption) {
          let next = self.getAdjacent(self.activeOption, 1);
          if (next) self.setActiveOption(next);
        }
        preventDefault$5(e);
        return;
      // up: move selection up
      case KEY_UP:
        if (self.activeOption) {
          let prev = self.getAdjacent(self.activeOption, -1);
          if (prev) self.setActiveOption(prev);
        }
        preventDefault$5(e);
        return;
      // return: select active option
      case KEY_RETURN:
        if (self.canSelect(self.activeOption)) {
          self.onOptionSelect(e, self.activeOption);
          preventDefault$5(e);
          // if the option_create=null, the dropdown might be closed
        } else if (self.settings.create && self.createItem()) {
          preventDefault$5(e);
          // don't submit form when searching for a value
        } else if (document.activeElement == self.control_input && self.isOpen) {
          preventDefault$5(e);
        }
        return;
      // left: modifiy item selection to the left
      case KEY_LEFT$1:
        self.advanceSelection(-1, e);
        return;
      // right: modifiy item selection to the right
      case KEY_RIGHT$1:
        self.advanceSelection(1, e);
        return;
      // tab: select active option and/or create item
      case KEY_TAB$1:
        if (self.settings.selectOnTab) {
          if (self.canSelect(self.activeOption)) {
            self.onOptionSelect(e, self.activeOption);
            // prevent default [tab] behaviour of jump to the next field
            // if select isFull, then the dropdown won't be open and [tab] will work normally
            preventDefault$5(e);
          }
          if (self.settings.create && self.createItem()) {
            preventDefault$5(e);
          }
        }
        return;
      // delete|backspace: delete items
      case KEY_BACKSPACE:
      case KEY_DELETE:
        self.deleteSelection(e);
        return;
    }
    // don't enter text in the control_input when active items are selected
    if (self.isInputHidden && !isKeyDown(KEY_SHORTCUT, e)) {
      preventDefault$5(e);
    }
  }
  /**
   * Triggered on <input> keyup.
   *
   */
  onInput(e) {
    if (this.isLocked) {
      return;
    }
    const value = this.inputValue();
    if (this.lastValue === value) return;
    this.lastValue = value;
    if (value == '') {
      this._onInput();
      return;
    }
    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = timeout(() => {
      this.refreshTimeout = null;
      this._onInput();
    }, this.settings.refreshThrottle);
  }
  _onInput() {
    const value = this.lastValue;
    if (this.settings.shouldLoad.call(this, value)) {
      this.load(value);
    }
    this.refreshOptions();
    this.trigger('type', value);
  }
  /**
   * Triggered when the user rolls over
   * an option in the autocomplete dropdown menu.
   *
   */
  onOptionHover(evt, option) {
    if (this.ignoreHover) return;
    this.setActiveOption(option, false);
  }
  /**
   * Triggered on <input> focus.
   *
   */
  onFocus(e) {
    var self = this;
    var wasFocused = self.isFocused;
    if (self.isDisabled || self.isReadOnly) {
      self.blur();
      preventDefault$5(e);
      return;
    }
    if (self.ignoreFocus) return;
    self.isFocused = true;
    if (self.settings.preload === 'focus') self.preload();
    if (!wasFocused) self.trigger('focus');
    if (!self.activeItems.length) {
      self.inputState();
      self.refreshOptions(!!self.settings.openOnFocus);
    }
    self.refreshState();
  }
  /**
   * Triggered on <input> blur.
   *
   */
  onBlur(e) {
    if (document.hasFocus() === false) return;
    var self = this;
    if (!self.isFocused) return;
    self.isFocused = false;
    self.ignoreFocus = false;
    var deactivate = () => {
      self.close();
      self.setActiveItem();
      self.setCaret(self.items.length);
      self.trigger('blur');
    };
    if (self.settings.create && self.settings.createOnBlur) {
      self.createItem(null, deactivate);
    } else {
      deactivate();
    }
  }
  /**
   * Triggered when the user clicks on an option
   * in the autocomplete dropdown menu.
   *
   */
  onOptionSelect(evt, option) {
    var value,
      self = this;
    // should not be possible to trigger a option under a disabled optgroup
    if (option.parentElement && option.parentElement.matches('[data-disabled]')) {
      return;
    }
    if (option.classList.contains('create')) {
      self.createItem(null, () => {
        if (self.settings.closeAfterSelect) {
          self.close();
        }
      });
    } else {
      value = option.dataset.value;
      if (typeof value !== 'undefined') {
        self.lastQuery = null;
        self.addItem(value);
        if (self.settings.closeAfterSelect) {
          self.close();
        }
        if (!self.settings.hideSelected && evt.type && /click/.test(evt.type)) {
          self.setActiveOption(option);
        }
      }
    }
  }
  /**
   * Return true if the given option can be selected
   *
   */
  canSelect(option) {
    if (this.isOpen && option && this.dropdown_content.contains(option)) {
      return true;
    }
    return false;
  }
  /**
   * Triggered when the user clicks on an item
   * that has been selected.
   *
   */
  onItemSelect(evt, item) {
    var self = this;
    if (!self.isLocked && self.settings.mode === 'multi') {
      preventDefault$5(evt);
      self.setActiveItem(item, evt);
      return true;
    }
    return false;
  }
  /**
   * Determines whether or not to invoke
   * the user-provided option provider / loader
   *
   * Note, there is a subtle difference between
   * this.canLoad() and this.settings.shouldLoad();
   *
   *	- settings.shouldLoad() is a user-input validator.
   *	When false is returned, the not_loading template
   *	will be added to the dropdown
   *
   *	- canLoad() is lower level validator that checks
   * 	the Tom Select instance. There is no inherent user
   *	feedback when canLoad returns false
   *
   */
  canLoad(value) {
    if (!this.settings.load) return false;
    if (this.loadedSearches.hasOwnProperty(value)) return false;
    return true;
  }
  /**
   * Invokes the user-provided option provider / loader.
   *
   */
  load(value) {
    const self = this;
    if (!self.canLoad(value)) return;
    addClasses$2(self.wrapper, self.settings.loadingClass);
    self.loading++;
    const callback = self.loadCallback.bind(self);
    self.settings.load.call(self, value, callback);
  }
  /**
   * Invoked by the user-provided option provider
   *
   */
  loadCallback(options, optgroups) {
    const self = this;
    self.loading = Math.max(self.loading - 1, 0);
    self.lastQuery = null;
    self.clearActiveOption(); // when new results load, focus should be on first option
    self.setupOptions(options, optgroups);
    self.refreshOptions(self.isFocused && !self.isInputHidden);
    if (!self.loading) {
      removeClasses$1(self.wrapper, self.settings.loadingClass);
    }
    self.trigger('load', options, optgroups);
  }
  preload() {
    var classList = this.wrapper.classList;
    if (classList.contains('preloaded')) return;
    classList.add('preloaded');
    this.load('');
  }
  /**
   * Sets the input field of the control to the specified value.
   *
   */
  setTextboxValue(value = '') {
    var input = this.control_input;
    var changed = input.value !== value;
    if (changed) {
      input.value = value;
      triggerEvent(input, 'update');
      this.lastValue = value;
    }
  }
  /**
   * Returns the value of the control. If multiple items
   * can be selected (e.g. <select multiple>), this returns
   * an array. If only one item can be selected, this
   * returns a string.
   *
   */
  getValue() {
    if (this.is_select_tag && this.input.hasAttribute('multiple')) {
      return this.items;
    }
    return this.items.join(this.settings.delimiter);
  }
  /**
   * Resets the selected items to the given value.
   *
   */
  setValue(value, silent) {
    var events = silent ? [] : ['change'];
    debounce_events(this, events, () => {
      this.clear(silent);
      this.addItems(value, silent);
    });
  }
  /**
   * Resets the number of max items to the given value
   *
   */
  setMaxItems(value) {
    if (value === 0) value = null; //reset to unlimited items.
    this.settings.maxItems = value;
    this.refreshState();
  }
  /**
   * Sets the selected item.
   *
   */
  setActiveItem(item, e) {
    var self = this;
    var eventName;
    var i, begin, end, swap;
    var last;
    if (self.settings.mode === 'single') return;
    // clear the active selection
    if (!item) {
      self.clearActiveItems();
      if (self.isFocused) {
        self.inputState();
      }
      return;
    }
    // modify selection
    eventName = e && e.type.toLowerCase();
    if (eventName === 'click' && isKeyDown('shiftKey', e) && self.activeItems.length) {
      last = self.getLastActive();
      begin = Array.prototype.indexOf.call(self.control.children, last);
      end = Array.prototype.indexOf.call(self.control.children, item);
      if (begin > end) {
        swap = begin;
        begin = end;
        end = swap;
      }
      for (i = begin; i <= end; i++) {
        item = self.control.children[i];
        if (self.activeItems.indexOf(item) === -1) {
          self.setActiveItemClass(item);
        }
      }
      preventDefault$5(e);
    } else if (eventName === 'click' && isKeyDown(KEY_SHORTCUT, e) || eventName === 'keydown' && isKeyDown('shiftKey', e)) {
      if (item.classList.contains('active')) {
        self.removeActiveItem(item);
      } else {
        self.setActiveItemClass(item);
      }
    } else {
      self.clearActiveItems();
      self.setActiveItemClass(item);
    }
    // ensure control has focus
    self.inputState();
    if (!self.isFocused) {
      self.focus();
    }
  }
  /**
   * Set the active and last-active classes
   *
   */
  setActiveItemClass(item) {
    const self = this;
    const last_active = self.control.querySelector('.last-active');
    if (last_active) removeClasses$1(last_active, 'last-active');
    addClasses$2(item, 'active last-active');
    self.trigger('item_select', item);
    if (self.activeItems.indexOf(item) == -1) {
      self.activeItems.push(item);
    }
  }
  /**
   * Remove active item
   *
   */
  removeActiveItem(item) {
    var idx = this.activeItems.indexOf(item);
    this.activeItems.splice(idx, 1);
    removeClasses$1(item, 'active');
  }
  /**
   * Clears all the active items
   *
   */
  clearActiveItems() {
    removeClasses$1(this.activeItems, 'active');
    this.activeItems = [];
  }
  /**
   * Sets the selected item in the dropdown menu
   * of available options.
   *
   */
  setActiveOption(option, scroll = true) {
    if (option === this.activeOption) {
      return;
    }
    this.clearActiveOption();
    if (!option) return;
    this.activeOption = option;
    setAttr$1(this.focus_node, {
      'aria-activedescendant': option.getAttribute('id')
    });
    setAttr$1(option, {
      'aria-selected': 'true'
    });
    addClasses$2(option, 'active');
    if (scroll) this.scrollToOption(option);
  }
  /**
   * Sets the dropdown_content scrollTop to display the option
   *
   */
  scrollToOption(option, behavior) {
    if (!option) return;
    const content = this.dropdown_content;
    const height_menu = content.clientHeight;
    const scrollTop = content.scrollTop || 0;
    const height_item = option.offsetHeight;
    const y = option.getBoundingClientRect().top - content.getBoundingClientRect().top + scrollTop;
    if (y + height_item > height_menu + scrollTop) {
      this.scroll(y - height_menu + height_item, behavior);
    } else if (y < scrollTop) {
      this.scroll(y, behavior);
    }
  }
  /**
   * Scroll the dropdown to the given position
   *
   */
  scroll(scrollTop, behavior) {
    const content = this.dropdown_content;
    if (behavior) {
      content.style.scrollBehavior = behavior;
    }
    content.scrollTop = scrollTop;
    content.style.scrollBehavior = '';
  }
  /**
   * Clears the active option
   *
   */
  clearActiveOption() {
    if (this.activeOption) {
      removeClasses$1(this.activeOption, 'active');
      setAttr$1(this.activeOption, {
        'aria-selected': null
      });
    }
    this.activeOption = null;
    setAttr$1(this.focus_node, {
      'aria-activedescendant': null
    });
  }
  /**
   * Selects all items (CTRL + A).
   */
  selectAll() {
    const self = this;
    if (self.settings.mode === 'single') return;
    const activeItems = self.controlChildren();
    if (!activeItems.length) return;
    self.inputState();
    self.close();
    self.activeItems = activeItems;
    iterate$4(activeItems, item => {
      self.setActiveItemClass(item);
    });
  }
  /**
   * Determines if the control_input should be in a hidden or visible state
   *
   */
  inputState() {
    var self = this;
    if (!self.control.contains(self.control_input)) return;
    setAttr$1(self.control_input, {
      placeholder: self.settings.placeholder
    });
    if (self.activeItems.length > 0 || !self.isFocused && self.settings.hidePlaceholder && self.items.length > 0) {
      self.setTextboxValue();
      self.isInputHidden = true;
    } else {
      if (self.settings.hidePlaceholder && self.items.length > 0) {
        setAttr$1(self.control_input, {
          placeholder: ''
        });
      }
      self.isInputHidden = false;
    }
    self.wrapper.classList.toggle('input-hidden', self.isInputHidden);
  }
  /**
   * Get the input value
   */
  inputValue() {
    return this.control_input.value.trim();
  }
  /**
   * Gives the control focus.
   */
  focus() {
    var self = this;
    if (self.isDisabled || self.isReadOnly) return;
    self.ignoreFocus = true;
    if (self.control_input.offsetWidth) {
      self.control_input.focus();
    } else {
      self.focus_node.focus();
    }
    setTimeout(() => {
      self.ignoreFocus = false;
      self.onFocus();
    }, 0);
  }
  /**
   * Forces the control out of focus.
   *
   */
  blur() {
    this.focus_node.blur();
    this.onBlur();
  }
  /**
   * Returns a function that scores an object
   * to show how good of a match it is to the
   * provided query.
   *
   * @return {function}
   */
  getScoreFunction(query) {
    return this.sifter.getScoreFunction(query, this.getSearchOptions());
  }
  /**
   * Returns search options for sifter (the system
   * for scoring and sorting results).
   *
   * @see https://github.com/orchidjs/sifter.js
   * @return {object}
   */
  getSearchOptions() {
    var settings = this.settings;
    var sort = settings.sortField;
    if (typeof settings.sortField === 'string') {
      sort = [{
        field: settings.sortField
      }];
    }
    return {
      fields: settings.searchField,
      conjunction: settings.searchConjunction,
      sort: sort,
      nesting: settings.nesting
    };
  }
  /**
   * Searches through available options and returns
   * a sorted array of matches.
   *
   */
  search(query) {
    var result, calculateScore;
    var self = this;
    var options = this.getSearchOptions();
    // validate user-provided result scoring function
    if (self.settings.score) {
      calculateScore = self.settings.score.call(self, query);
      if (typeof calculateScore !== 'function') {
        throw new Error('Tom Select "score" setting must be a function that returns a function');
      }
    }
    // perform search
    if (query !== self.lastQuery) {
      self.lastQuery = query;
      result = self.sifter.search(query, Object.assign(options, {
        score: calculateScore
      }));
      self.currentResults = result;
    } else {
      result = Object.assign({}, self.currentResults);
    }
    // filter out selected items
    if (self.settings.hideSelected) {
      result.items = result.items.filter(item => {
        let hashed = hash_key$1(item.id);
        return !(hashed && self.items.indexOf(hashed) !== -1);
      });
    }
    return result;
  }
  /**
   * Refreshes the list of available options shown
   * in the autocomplete dropdown menu.
   *
   */
  refreshOptions(triggerDropdown = true) {
    var i, j, k, n, optgroup, optgroups, html, has_create_option, active_group;
    var create;
    const groups = {};
    const groups_order = [];
    var self = this;
    var query = self.inputValue();
    const same_query = query === self.lastQuery || query == '' && self.lastQuery == null;
    var results = self.search(query);
    var active_option = null;
    var show_dropdown = self.settings.shouldOpen || false;
    var dropdown_content = self.dropdown_content;
    if (same_query) {
      active_option = self.activeOption;
      if (active_option) {
        active_group = active_option.closest('[data-group]');
      }
    }
    // build markup
    n = results.items.length;
    if (typeof self.settings.maxOptions === 'number') {
      n = Math.min(n, self.settings.maxOptions);
    }
    if (n > 0) {
      show_dropdown = true;
    }
    // get fragment for group and the position of the group in group_order
    const getGroupFragment = (optgroup, order) => {
      let group_order_i = groups[optgroup];
      if (group_order_i !== undefined) {
        let order_group = groups_order[group_order_i];
        if (order_group !== undefined) {
          return [group_order_i, order_group.fragment];
        }
      }
      let group_fragment = document.createDocumentFragment();
      group_order_i = groups_order.length;
      groups_order.push({
        fragment: group_fragment,
        order,
        optgroup
      });
      return [group_order_i, group_fragment];
    };
    // render and group available options individually
    for (i = 0; i < n; i++) {
      // get option dom element
      let item = results.items[i];
      if (!item) continue;
      let opt_value = item.id;
      let option = self.options[opt_value];
      if (option === undefined) continue;
      let opt_hash = get_hash$1(opt_value);
      let option_el = self.getOption(opt_hash, true);
      // toggle 'selected' class
      if (!self.settings.hideSelected) {
        option_el.classList.toggle('selected', self.items.includes(opt_hash));
      }
      optgroup = option[self.settings.optgroupField] || '';
      optgroups = Array.isArray(optgroup) ? optgroup : [optgroup];
      for (j = 0, k = optgroups && optgroups.length; j < k; j++) {
        optgroup = optgroups[j];
        let order = option.$order;
        let self_optgroup = self.optgroups[optgroup];
        if (self_optgroup === undefined) {
          optgroup = '';
        } else {
          order = self_optgroup.$order;
        }
        const [group_order_i, group_fragment] = getGroupFragment(optgroup, order);
        // nodes can only have one parent, so if the option is in mutple groups, we need a clone
        if (j > 0) {
          option_el = option_el.cloneNode(true);
          setAttr$1(option_el, {
            id: option.$id + '-clone-' + j,
            'aria-selected': null
          });
          option_el.classList.add('ts-cloned');
          removeClasses$1(option_el, 'active');
          // make sure we keep the activeOption in the same group
          if (self.activeOption && self.activeOption.dataset.value == opt_value) {
            if (active_group && active_group.dataset.group === optgroup.toString()) {
              active_option = option_el;
            }
          }
        }
        group_fragment.appendChild(option_el);
        if (optgroup != '') {
          groups[optgroup] = group_order_i;
        }
      }
    }
    // sort optgroups
    if (self.settings.lockOptgroupOrder) {
      groups_order.sort((a, b) => {
        return a.order - b.order;
      });
    }
    // render optgroup headers & join groups
    html = document.createDocumentFragment();
    iterate$4(groups_order, group_order => {
      let group_fragment = group_order.fragment;
      let optgroup = group_order.optgroup;
      if (!group_fragment || !group_fragment.children.length) return;
      let group_heading = self.optgroups[optgroup];
      if (group_heading !== undefined) {
        let group_options = document.createDocumentFragment();
        let header = self.render('optgroup_header', group_heading);
        append(group_options, header);
        append(group_options, group_fragment);
        let group_html = self.render('optgroup', {
          group: group_heading,
          options: group_options
        });
        append(html, group_html);
      } else {
        append(html, group_fragment);
      }
    });
    dropdown_content.innerHTML = '';
    append(dropdown_content, html);
    // highlight matching terms inline
    if (self.settings.highlight) {
      removeHighlight(dropdown_content);
      if (results.query.length && results.tokens.length) {
        iterate$4(results.tokens, tok => {
          highlight(dropdown_content, tok.regex);
        });
      }
    }
    // helper method for adding templates to dropdown
    var add_template = template => {
      let content = self.render(template, {
        input: query
      });
      if (content) {
        show_dropdown = true;
        dropdown_content.insertBefore(content, dropdown_content.firstChild);
      }
      return content;
    };
    // add loading message
    if (self.loading) {
      add_template('loading');
      // invalid query
    } else if (!self.settings.shouldLoad.call(self, query)) {
      add_template('not_loading');
      // add no_results message
    } else if (results.items.length === 0) {
      add_template('no_results');
    }
    // add create option
    has_create_option = self.canCreate(query);
    if (has_create_option) {
      create = add_template('option_create');
    }
    // activate
    self.hasOptions = results.items.length > 0 || has_create_option;
    if (show_dropdown) {
      if (results.items.length > 0) {
        if (!active_option && self.settings.mode === 'single' && self.items[0] != undefined) {
          active_option = self.getOption(self.items[0]);
        }
        if (!dropdown_content.contains(active_option)) {
          let active_index = 0;
          if (create && !self.settings.addPrecedence) {
            active_index = 1;
          }
          active_option = self.selectable()[active_index];
        }
      } else if (create) {
        active_option = create;
      }
      if (triggerDropdown && !self.isOpen) {
        self.open();
        self.scrollToOption(active_option, 'auto');
      }
      self.setActiveOption(active_option);
    } else {
      self.clearActiveOption();
      if (triggerDropdown && self.isOpen) {
        self.close(false); // if create_option=null, we want the dropdown to close but not reset the textbox value
      }
    }
  }
  /**
   * Return list of selectable options
   *
   */
  selectable() {
    return this.dropdown_content.querySelectorAll('[data-selectable]');
  }
  /**
   * Adds an available option. If it already exists,
   * nothing will happen. Note: this does not refresh
   * the options list dropdown (use `refreshOptions`
   * for that).
   *
   * Usage:
   *
   *   this.addOption(data)
   *
   */
  addOption(data, user_created = false) {
    const self = this;
    // @deprecated 1.7.7
    // use addOptions( array, user_created ) for adding multiple options
    if (Array.isArray(data)) {
      self.addOptions(data, user_created);
      return false;
    }
    const key = hash_key$1(data[self.settings.valueField]);
    if (key === null || self.options.hasOwnProperty(key)) {
      return false;
    }
    data.$order = data.$order || ++self.order;
    data.$id = self.inputId + '-opt-' + data.$order;
    self.options[key] = data;
    self.lastQuery = null;
    if (user_created) {
      self.userOptions[key] = user_created;
      self.trigger('option_add', key, data);
    }
    return key;
  }
  /**
   * Add multiple options
   *
   */
  addOptions(data, user_created = false) {
    iterate$4(data, dat => {
      this.addOption(dat, user_created);
    });
  }
  /**
   * @deprecated 1.7.7
   */
  registerOption(data) {
    return this.addOption(data);
  }
  /**
   * Registers an option group to the pool of option groups.
   *
   * @return {boolean|string}
   */
  registerOptionGroup(data) {
    var key = hash_key$1(data[this.settings.optgroupValueField]);
    if (key === null) return false;
    data.$order = data.$order || ++this.order;
    this.optgroups[key] = data;
    return key;
  }
  /**
   * Registers a new optgroup for options
   * to be bucketed into.
   *
   */
  addOptionGroup(id, data) {
    var hashed_id;
    data[this.settings.optgroupValueField] = id;
    if (hashed_id = this.registerOptionGroup(data)) {
      this.trigger('optgroup_add', hashed_id, data);
    }
  }
  /**
   * Removes an existing option group.
   *
   */
  removeOptionGroup(id) {
    if (this.optgroups.hasOwnProperty(id)) {
      delete this.optgroups[id];
      this.clearCache();
      this.trigger('optgroup_remove', id);
    }
  }
  /**
   * Clears all existing option groups.
   */
  clearOptionGroups() {
    this.optgroups = {};
    this.clearCache();
    this.trigger('optgroup_clear');
  }
  /**
   * Updates an option available for selection. If
   * it is visible in the selected items or options
   * dropdown, it will be re-rendered automatically.
   *
   */
  updateOption(value, data) {
    const self = this;
    var item_new;
    var index_item;
    const value_old = hash_key$1(value);
    const value_new = hash_key$1(data[self.settings.valueField]);
    // sanity checks
    if (value_old === null) return;
    const data_old = self.options[value_old];
    if (data_old == undefined) return;
    if (typeof value_new !== 'string') throw new Error('Value must be set in option data');
    const option = self.getOption(value_old);
    const item = self.getItem(value_old);
    data.$order = data.$order || data_old.$order;
    delete self.options[value_old];
    // invalidate render cache
    // don't remove existing node yet, we'll remove it after replacing it
    self.uncacheValue(value_new);
    self.options[value_new] = data;
    // update the option if it's in the dropdown
    if (option) {
      if (self.dropdown_content.contains(option)) {
        const option_new = self._render('option', data);
        replaceNode(option, option_new);
        if (self.activeOption === option) {
          self.setActiveOption(option_new);
        }
      }
      option.remove();
    }
    // update the item if we have one
    if (item) {
      index_item = self.items.indexOf(value_old);
      if (index_item !== -1) {
        self.items.splice(index_item, 1, value_new);
      }
      item_new = self._render('item', data);
      if (item.classList.contains('active')) addClasses$2(item_new, 'active');
      replaceNode(item, item_new);
    }
    // invalidate last query because we might have updated the sortField
    self.lastQuery = null;
  }
  /**
   * Removes a single option.
   *
   */
  removeOption(value, silent) {
    const self = this;
    value = get_hash$1(value);
    self.uncacheValue(value);
    delete self.userOptions[value];
    delete self.options[value];
    self.lastQuery = null;
    self.trigger('option_remove', value);
    self.removeItem(value, silent);
  }
  /**
   * Clears all options.
   */
  clearOptions(filter) {
    const boundFilter = (filter || this.clearFilter).bind(this);
    this.loadedSearches = {};
    this.userOptions = {};
    this.clearCache();
    const selected = {};
    iterate$4(this.options, (option, key) => {
      if (boundFilter(option, key)) {
        selected[key] = option;
      }
    });
    this.options = this.sifter.items = selected;
    this.lastQuery = null;
    this.trigger('option_clear');
  }
  /**
   * Used by clearOptions() to decide whether or not an option should be removed
   * Return true to keep an option, false to remove
   *
   */
  clearFilter(option, value) {
    if (this.items.indexOf(value) >= 0) {
      return true;
    }
    return false;
  }
  /**
   * Returns the dom element of the option
   * matching the given value.
   *
   */
  getOption(value, create = false) {
    const hashed = hash_key$1(value);
    if (hashed === null) return null;
    const option = this.options[hashed];
    if (option != undefined) {
      if (option.$div) {
        return option.$div;
      }
      if (create) {
        return this._render('option', option);
      }
    }
    return null;
  }
  /**
   * Returns the dom element of the next or previous dom element of the same type
   * Note: adjacent options may not be adjacent DOM elements (optgroups)
   *
   */
  getAdjacent(option, direction, type = 'option') {
    var self = this,
      all;
    if (!option) {
      return null;
    }
    if (type == 'item') {
      all = self.controlChildren();
    } else {
      all = self.dropdown_content.querySelectorAll('[data-selectable]');
    }
    for (let i = 0; i < all.length; i++) {
      if (all[i] != option) {
        continue;
      }
      if (direction > 0) {
        return all[i + 1];
      }
      return all[i - 1];
    }
    return null;
  }
  /**
   * Returns the dom element of the item
   * matching the given value.
   *
   */
  getItem(item) {
    if (typeof item == 'object') {
      return item;
    }
    var value = hash_key$1(item);
    return value !== null ? this.control.querySelector(`[data-value="${addSlashes(value)}"]`) : null;
  }
  /**
   * "Selects" multiple items at once. Adds them to the list
   * at the current caret position.
   *
   */
  addItems(values, silent) {
    var self = this;
    var items = Array.isArray(values) ? values : [values];
    items = items.filter(x => self.items.indexOf(x) === -1);
    const last_item = items[items.length - 1];
    items.forEach(item => {
      self.isPending = item !== last_item;
      self.addItem(item, silent);
    });
  }
  /**
   * "Selects" an item. Adds it to the list
   * at the current caret position.
   *
   */
  addItem(value, silent) {
    var events = silent ? [] : ['change', 'dropdown_close'];
    debounce_events(this, events, () => {
      var item, wasFull;
      const self = this;
      const inputMode = self.settings.mode;
      const hashed = hash_key$1(value);
      if (hashed && self.items.indexOf(hashed) !== -1) {
        if (inputMode === 'single') {
          self.close();
        }
        if (inputMode === 'single' || !self.settings.duplicates) {
          return;
        }
      }
      if (hashed === null || !self.options.hasOwnProperty(hashed)) return;
      if (inputMode === 'single') self.clear(silent);
      if (inputMode === 'multi' && self.isFull()) return;
      item = self._render('item', self.options[hashed]);
      if (self.control.contains(item)) {
        // duplicates
        item = item.cloneNode(true);
      }
      wasFull = self.isFull();
      self.items.splice(self.caretPos, 0, hashed);
      self.insertAtCaret(item);
      if (self.isSetup) {
        // update menu / remove the option (if this is not one item being added as part of series)
        if (!self.isPending && self.settings.hideSelected) {
          let option = self.getOption(hashed);
          let next = self.getAdjacent(option, 1);
          if (next) {
            self.setActiveOption(next);
          }
        }
        // refreshOptions after setActiveOption(),
        // otherwise setActiveOption() will be called by refreshOptions() with the wrong value
        if (!self.isPending && !self.settings.closeAfterSelect) {
          self.refreshOptions(self.isFocused && inputMode !== 'single');
        }
        // hide the menu if the maximum number of items have been selected or no options are left
        if (self.settings.closeAfterSelect != false && self.isFull()) {
          self.close();
        } else if (!self.isPending) {
          self.positionDropdown();
        }
        self.trigger('item_add', hashed, item);
        if (!self.isPending) {
          self.updateOriginalInput({
            silent: silent
          });
        }
      }
      if (!self.isPending || !wasFull && self.isFull()) {
        self.inputState();
        self.refreshState();
      }
    });
  }
  /**
   * Removes the selected item matching
   * the provided value.
   *
   */
  removeItem(item = null, silent) {
    const self = this;
    item = self.getItem(item);
    if (!item) return;
    var i, idx;
    const value = item.dataset.value;
    i = nodeIndex$2(item);
    item.remove();
    if (item.classList.contains('active')) {
      idx = self.activeItems.indexOf(item);
      self.activeItems.splice(idx, 1);
      removeClasses$1(item, 'active');
    }
    self.items.splice(i, 1);
    self.lastQuery = null;
    if (!self.settings.persist && self.userOptions.hasOwnProperty(value)) {
      self.removeOption(value, silent);
    }
    if (i < self.caretPos) {
      self.setCaret(self.caretPos - 1);
    }
    self.updateOriginalInput({
      silent: silent
    });
    self.refreshState();
    self.positionDropdown();
    self.trigger('item_remove', value, item);
  }
  /**
   * Invokes the `create` method provided in the
   * TomSelect options that should provide the data
   * for the new item, given the user input.
   *
   * Once this completes, it will be added
   * to the item list.
   *
   */
  createItem(input = null, callback = () => {}) {
    // triggerDropdown parameter @deprecated 2.1.1
    if (arguments.length === 3) {
      callback = arguments[2];
    }
    if (typeof callback != 'function') {
      callback = () => {};
    }
    var self = this;
    var caret = self.caretPos;
    var output;
    input = input || self.inputValue();
    if (!self.canCreate(input)) {
      callback();
      return false;
    }
    self.lock();
    var created = false;
    var create = data => {
      self.unlock();
      if (!data || typeof data !== 'object') return callback();
      var value = hash_key$1(data[self.settings.valueField]);
      if (typeof value !== 'string') {
        return callback();
      }
      self.setTextboxValue();
      self.addOption(data, true);
      self.setCaret(caret);
      self.addItem(value);
      callback(data);
      created = true;
    };
    if (typeof self.settings.create === 'function') {
      output = self.settings.create.call(this, input, create);
    } else {
      output = {
        [self.settings.labelField]: input,
        [self.settings.valueField]: input
      };
    }
    if (!created) {
      create(output);
    }
    return true;
  }
  /**
   * Re-renders the selected item lists.
   */
  refreshItems() {
    var self = this;
    self.lastQuery = null;
    if (self.isSetup) {
      self.addItems(self.items);
    }
    self.updateOriginalInput();
    self.refreshState();
  }
  /**
   * Updates all state-dependent attributes
   * and CSS classes.
   */
  refreshState() {
    const self = this;
    self.refreshValidityState();
    const isFull = self.isFull();
    const isLocked = self.isLocked;
    self.wrapper.classList.toggle('rtl', self.rtl);
    const wrap_classList = self.wrapper.classList;
    wrap_classList.toggle('focus', self.isFocused);
    wrap_classList.toggle('disabled', self.isDisabled);
    wrap_classList.toggle('readonly', self.isReadOnly);
    wrap_classList.toggle('required', self.isRequired);
    wrap_classList.toggle('invalid', !self.isValid);
    wrap_classList.toggle('locked', isLocked);
    wrap_classList.toggle('full', isFull);
    wrap_classList.toggle('input-active', self.isFocused && !self.isInputHidden);
    wrap_classList.toggle('dropdown-active', self.isOpen);
    wrap_classList.toggle('has-options', isEmptyObject(self.options));
    wrap_classList.toggle('has-items', self.items.length > 0);
  }
  /**
   * Update the `required` attribute of both input and control input.
   *
   * The `required` property needs to be activated on the control input
   * for the error to be displayed at the right place. `required` also
   * needs to be temporarily deactivated on the input since the input is
   * hidden and can't show errors.
   */
  refreshValidityState() {
    var self = this;
    if (!self.input.validity) {
      return;
    }
    self.isValid = self.input.validity.valid;
    self.isInvalid = !self.isValid;
  }
  /**
   * Determines whether or not more items can be added
   * to the control without exceeding the user-defined maximum.
   *
   * @returns {boolean}
   */
  isFull() {
    return this.settings.maxItems !== null && this.items.length >= this.settings.maxItems;
  }
  /**
   * Refreshes the original <select> or <input>
   * element to reflect the current state.
   *
   */
  updateOriginalInput(opts = {}) {
    const self = this;
    var option, label;
    const empty_option = self.input.querySelector('option[value=""]');
    if (self.is_select_tag) {
      const selected = [];
      const has_selected = self.input.querySelectorAll('option:checked').length;
      function AddSelected(option_el, value, label) {
        if (!option_el) {
          option_el = getDom$6('<option value="' + escape_html$1(value) + '">' + escape_html$1(label) + '</option>');
        }
        // don't move empty option from top of list
        // fixes bug in firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1725293
        if (option_el != empty_option) {
          self.input.append(option_el);
        }
        selected.push(option_el);
        // marking empty option as selected can break validation
        // fixes https://github.com/orchidjs/tom-select/issues/303
        if (option_el != empty_option || has_selected > 0) {
          option_el.selected = true;
        }
        return option_el;
      }
      // unselect all selected options
      self.input.querySelectorAll('option:checked').forEach(option_el => {
        option_el.selected = false;
      });
      // nothing selected?
      if (self.items.length == 0 && self.settings.mode == 'single') {
        AddSelected(empty_option, "", "");
        // order selected <option> tags for values in self.items
      } else {
        self.items.forEach(value => {
          option = self.options[value];
          label = option[self.settings.labelField] || '';
          if (selected.includes(option.$option)) {
            const reuse_opt = self.input.querySelector(`option[value="${addSlashes(value)}"]:not(:checked)`);
            AddSelected(reuse_opt, value, label);
          } else {
            option.$option = AddSelected(option.$option, value, label);
          }
        });
      }
    } else {
      self.input.value = self.getValue();
    }
    if (self.isSetup) {
      if (!opts.silent) {
        self.trigger('change', self.getValue());
      }
    }
  }
  /**
   * Shows the autocomplete dropdown containing
   * the available options.
   */
  open() {
    var self = this;
    if (self.isLocked || self.isOpen || self.settings.mode === 'multi' && self.isFull()) return;
    self.isOpen = true;
    setAttr$1(self.focus_node, {
      'aria-expanded': 'true'
    });
    self.refreshState();
    applyCSS(self.dropdown, {
      visibility: 'hidden',
      display: 'block'
    });
    self.positionDropdown();
    applyCSS(self.dropdown, {
      visibility: 'visible',
      display: 'block'
    });
    self.focus();
    self.trigger('dropdown_open', self.dropdown);
  }
  /**
   * Closes the autocomplete dropdown menu.
   */
  close(setTextboxValue = true) {
    var self = this;
    var trigger = self.isOpen;
    if (setTextboxValue) {
      // before blur() to prevent form onchange event
      self.setTextboxValue();
      if (self.settings.mode === 'single' && self.items.length) {
        self.inputState();
      }
    }
    self.isOpen = false;
    setAttr$1(self.focus_node, {
      'aria-expanded': 'false'
    });
    applyCSS(self.dropdown, {
      display: 'none'
    });
    if (self.settings.hideSelected) {
      self.clearActiveOption();
    }
    self.refreshState();
    if (trigger) self.trigger('dropdown_close', self.dropdown);
  }
  /**
   * Calculates and applies the appropriate
   * position of the dropdown if dropdownParent = 'body'.
   * Otherwise, position is determined by css
   */
  positionDropdown() {
    if (this.settings.dropdownParent !== 'body') {
      return;
    }
    var context = this.control;
    var rect = context.getBoundingClientRect();
    var top = context.offsetHeight + rect.top + window.scrollY;
    var left = rect.left + window.scrollX;
    applyCSS(this.dropdown, {
      width: rect.width + 'px',
      top: top + 'px',
      left: left + 'px'
    });
  }
  /**
   * Resets / clears all selected items
   * from the control.
   *
   */
  clear(silent) {
    var self = this;
    if (!self.items.length) return;
    var items = self.controlChildren();
    iterate$4(items, item => {
      self.removeItem(item, true);
    });
    self.inputState();
    if (!silent) self.updateOriginalInput();
    self.trigger('clear');
  }
  /**
   * A helper method for inserting an element
   * at the current caret position.
   *
   */
  insertAtCaret(el) {
    const self = this;
    const caret = self.caretPos;
    const target = self.control;
    target.insertBefore(el, target.children[caret] || null);
    self.setCaret(caret + 1);
  }
  /**
   * Removes the current selected item(s).
   *
   */
  deleteSelection(e) {
    var direction, selection, caret, tail;
    var self = this;
    direction = e && e.keyCode === KEY_BACKSPACE ? -1 : 1;
    selection = getSelection(self.control_input);
    // determine items that will be removed
    const rm_items = [];
    if (self.activeItems.length) {
      tail = getTail(self.activeItems, direction);
      caret = nodeIndex$2(tail);
      if (direction > 0) {
        caret++;
      }
      iterate$4(self.activeItems, item => rm_items.push(item));
    } else if ((self.isFocused || self.settings.mode === 'single') && self.items.length) {
      const items = self.controlChildren();
      let rm_item;
      if (direction < 0 && selection.start === 0 && selection.length === 0) {
        rm_item = items[self.caretPos - 1];
      } else if (direction > 0 && selection.start === self.inputValue().length) {
        rm_item = items[self.caretPos];
      }
      if (rm_item !== undefined) {
        rm_items.push(rm_item);
      }
    }
    if (!self.shouldDelete(rm_items, e)) {
      return false;
    }
    preventDefault$5(e, true);
    // perform removal
    if (typeof caret !== 'undefined') {
      self.setCaret(caret);
    }
    while (rm_items.length) {
      self.removeItem(rm_items.pop());
    }
    self.inputState();
    self.positionDropdown();
    self.refreshOptions(false);
    return true;
  }
  /**
   * Return true if the items should be deleted
   */
  shouldDelete(items, evt) {
    const values = items.map(item => item.dataset.value);
    // allow the callback to abort
    if (!values.length || typeof this.settings.onDelete === 'function' && this.settings.onDelete(values, evt) === false) {
      return false;
    }
    return true;
  }
  /**
   * Selects the previous / next item (depending on the `direction` argument).
   *
   * > 0 - right
   * < 0 - left
   *
   */
  advanceSelection(direction, e) {
    var last_active,
      adjacent,
      self = this;
    if (self.rtl) direction *= -1;
    if (self.inputValue().length) return;
    // add or remove to active items
    if (isKeyDown(KEY_SHORTCUT, e) || isKeyDown('shiftKey', e)) {
      last_active = self.getLastActive(direction);
      if (last_active) {
        if (!last_active.classList.contains('active')) {
          adjacent = last_active;
        } else {
          adjacent = self.getAdjacent(last_active, direction, 'item');
        }
        // if no active item, get items adjacent to the control input
      } else if (direction > 0) {
        adjacent = self.control_input.nextElementSibling;
      } else {
        adjacent = self.control_input.previousElementSibling;
      }
      if (adjacent) {
        if (adjacent.classList.contains('active')) {
          self.removeActiveItem(last_active);
        }
        self.setActiveItemClass(adjacent); // mark as last_active !! after removeActiveItem() on last_active
      }
      // move caret to the left or right
    } else {
      self.moveCaret(direction);
    }
  }
  moveCaret(direction) {}
  /**
   * Get the last active item
   *
   */
  getLastActive(direction) {
    let last_active = this.control.querySelector('.last-active');
    if (last_active) {
      return last_active;
    }
    var result = this.control.querySelectorAll('.active');
    if (result) {
      return getTail(result, direction);
    }
  }
  /**
   * Moves the caret to the specified index.
   *
   * The input must be moved by leaving it in place and moving the
   * siblings, due to the fact that focus cannot be restored once lost
   * on mobile webkit devices
   *
   */
  setCaret(new_pos) {
    this.caretPos = this.items.length;
  }
  /**
   * Return list of item dom elements
   *
   */
  controlChildren() {
    return Array.from(this.control.querySelectorAll('[data-ts-item]'));
  }
  /**
   * Disables user input on the control. Used while
   * items are being asynchronously created.
   */
  lock() {
    this.setLocked(true);
  }
  /**
   * Re-enables user input on the control.
   */
  unlock() {
    this.setLocked(false);
  }
  /**
   * Disable or enable user input on the control
   */
  setLocked(lock = this.isReadOnly || this.isDisabled) {
    this.isLocked = lock;
    this.refreshState();
  }
  /**
   * Disables user input on the control completely.
   * While disabled, it cannot receive focus.
   */
  disable() {
    this.setDisabled(true);
    this.close();
  }
  /**
   * Enables the control so that it can respond
   * to focus and user input.
   */
  enable() {
    this.setDisabled(false);
  }
  setDisabled(disabled) {
    this.focus_node.tabIndex = disabled ? -1 : this.tabIndex;
    this.isDisabled = disabled;
    this.input.disabled = disabled;
    this.control_input.disabled = disabled;
    this.setLocked();
  }
  setReadOnly(isReadOnly) {
    this.isReadOnly = isReadOnly;
    this.input.readOnly = isReadOnly;
    this.control_input.readOnly = isReadOnly;
    this.setLocked();
  }
  /**
   * Completely destroys the control and
   * unbinds all event listeners so that it can
   * be garbage collected.
   */
  destroy() {
    var self = this;
    var revertSettings = self.revertSettings;
    self.trigger('destroy');
    self.off();
    self.wrapper.remove();
    self.dropdown.remove();
    self.input.innerHTML = revertSettings.innerHTML;
    self.input.tabIndex = revertSettings.tabIndex;
    removeClasses$1(self.input, 'tomselected', 'ts-hidden-accessible');
    self._destroy();
    delete self.input.tomselect;
  }
  /**
   * A helper method for rendering "item" and
   * "option" templates, given the data.
   *
   */
  render(templateName, data) {
    var id, html;
    const self = this;
    if (typeof this.settings.render[templateName] !== 'function') {
      return null;
    }
    // render markup
    html = self.settings.render[templateName].call(this, data, escape_html$1);
    if (!html) {
      return null;
    }
    html = getDom$6(html);
    // add mandatory attributes
    if (templateName === 'option' || templateName === 'option_create') {
      if (data[self.settings.disabledField]) {
        setAttr$1(html, {
          'aria-disabled': 'true'
        });
      } else {
        setAttr$1(html, {
          'data-selectable': ''
        });
      }
    } else if (templateName === 'optgroup') {
      id = data.group[self.settings.optgroupValueField];
      setAttr$1(html, {
        'data-group': id
      });
      if (data.group[self.settings.disabledField]) {
        setAttr$1(html, {
          'data-disabled': ''
        });
      }
    }
    if (templateName === 'option' || templateName === 'item') {
      const value = get_hash$1(data[self.settings.valueField]);
      setAttr$1(html, {
        'data-value': value
      });
      // make sure we have some classes if a template is overwritten
      if (templateName === 'item') {
        addClasses$2(html, self.settings.itemClass);
        setAttr$1(html, {
          'data-ts-item': ''
        });
      } else {
        addClasses$2(html, self.settings.optionClass);
        setAttr$1(html, {
          role: 'option',
          id: data.$id
        });
        // update cache
        data.$div = html;
        self.options[value] = data;
      }
    }
    return html;
  }
  /**
   * Type guarded rendering
   *
   */
  _render(templateName, data) {
    const html = this.render(templateName, data);
    if (html == null) {
      throw 'HTMLElement expected';
    }
    return html;
  }
  /**
   * Clears the render cache for a template. If
   * no template is given, clears all render
   * caches.
   *
   */
  clearCache() {
    iterate$4(this.options, option => {
      if (option.$div) {
        option.$div.remove();
        delete option.$div;
      }
    });
  }
  /**
   * Removes a value from item and option caches
   *
   */
  uncacheValue(value) {
    const option_el = this.getOption(value);
    if (option_el) option_el.remove();
  }
  /**
   * Determines whether or not to display the
   * create item prompt, given a user input.
   *
   */
  canCreate(input) {
    return this.settings.create && input.length > 0 && this.settings.createFilter.call(this, input);
  }
  /**
   * Wraps this.`method` so that `new_fn` can be invoked 'before', 'after', or 'instead' of the original method
   *
   * this.hook('instead','onKeyDown',function( arg1, arg2 ...){
   *
   * });
   */
  hook(when, method, new_fn) {
    var self = this;
    var orig_method = self[method];
    self[method] = function () {
      var result, result_new;
      if (when === 'after') {
        result = orig_method.apply(self, arguments);
      }
      result_new = new_fn.apply(self, arguments);
      if (when === 'instead') {
        return result_new;
      }
      if (when === 'before') {
        result = orig_method.apply(self, arguments);
      }
      return result;
    };
  }
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Add event helper
 *
 */
const addEvent$4 = (target, type, callback, options) => {
  target.addEventListener(type, callback, options);
};

/**
 * Plugin: "change_listener" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$d() {
  addEvent$4(this.input, 'change', () => {
    this.sync();
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */
const hash_key = value => {
  if (typeof value === 'undefined' || value === null) return null;
  return get_hash(value);
};
const get_hash = value => {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return value + '';
};

/**
 * Prevent default
 *
 */
const preventDefault$4 = (evt, stop = false) => {
  if (evt) {
    evt.preventDefault();
    if (stop) {
      evt.stopPropagation();
    }
  }
};

/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom$5 = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString$5(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString$5 = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};

/**
 * Plugin: "checkbox_options" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$c(userOptions) {
  var self = this;
  var orig_onOptionSelect = self.onOptionSelect;
  self.settings.hideSelected = false;
  const cbOptions = Object.assign({
    // so that the user may add different ones as well
    className: "tomselect-checkbox",
    // the following default to the historic plugin's values
    checkedClassNames: undefined,
    uncheckedClassNames: undefined
  }, userOptions);
  var UpdateChecked = function UpdateChecked(checkbox, toCheck) {
    if (toCheck) {
      checkbox.checked = true;
      if (cbOptions.uncheckedClassNames) {
        checkbox.classList.remove(...cbOptions.uncheckedClassNames);
      }
      if (cbOptions.checkedClassNames) {
        checkbox.classList.add(...cbOptions.checkedClassNames);
      }
    } else {
      checkbox.checked = false;
      if (cbOptions.checkedClassNames) {
        checkbox.classList.remove(...cbOptions.checkedClassNames);
      }
      if (cbOptions.uncheckedClassNames) {
        checkbox.classList.add(...cbOptions.uncheckedClassNames);
      }
    }
  };

  // update the checkbox for an option
  var UpdateCheckbox = function UpdateCheckbox(option) {
    setTimeout(() => {
      var checkbox = option.querySelector('input.' + cbOptions.className);
      if (checkbox instanceof HTMLInputElement) {
        UpdateChecked(checkbox, option.classList.contains('selected'));
      }
    }, 1);
  };

  // add checkbox to option template
  self.hook('after', 'setupTemplates', () => {
    var orig_render_option = self.settings.render.option;
    self.settings.render.option = (data, escape_html) => {
      var rendered = getDom$5(orig_render_option.call(self, data, escape_html));
      var checkbox = document.createElement('input');
      if (cbOptions.className) {
        checkbox.classList.add(cbOptions.className);
      }
      checkbox.addEventListener('click', function (evt) {
        preventDefault$4(evt);
      });
      checkbox.type = 'checkbox';
      const hashed = hash_key(data[self.settings.valueField]);
      UpdateChecked(checkbox, !!(hashed && self.items.indexOf(hashed) > -1));
      rendered.prepend(checkbox);
      return rendered;
    };
  });

  // uncheck when item removed
  self.on('item_remove', value => {
    var option = self.getOption(value);
    if (option) {
      // if dropdown hasn't been opened yet, the option won't exist
      option.classList.remove('selected'); // selected class won't be removed yet
      UpdateCheckbox(option);
    }
  });

  // check when item added
  self.on('item_add', value => {
    var option = self.getOption(value);
    if (option) {
      // if dropdown hasn't been opened yet, the option won't exist
      UpdateCheckbox(option);
    }
  });

  // remove items when selected option is clicked
  self.hook('instead', 'onOptionSelect', (evt, option) => {
    if (option.classList.contains('selected')) {
      option.classList.remove('selected');
      self.removeItem(option.dataset.value);
      self.refreshOptions();
      preventDefault$4(evt, true);
      return;
    }
    orig_onOptionSelect.call(self, evt, option);
    UpdateCheckbox(option);
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom$4 = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString$4(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString$4 = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};

/**
 * Plugin: "dropdown_header" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$b(userOptions) {
  const self = this;
  const options = Object.assign({
    className: 'clear-button',
    title: 'Clear All',
    html: data => {
      return `<div class="${data.className}" title="${data.title}">&#10799;</div>`;
    }
  }, userOptions);
  self.on('initialize', () => {
    var button = getDom$4(options.html(options));
    button.addEventListener('click', evt => {
      if (self.isLocked) return;
      self.clear();
      if (self.settings.mode === 'single' && self.settings.allowEmptyOption) {
        self.addItem('');
      }
      evt.preventDefault();
      evt.stopPropagation();
    });
    self.control.appendChild(button);
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Prevent default
 *
 */
const preventDefault$3 = (evt, stop = false) => {
  if (evt) {
    evt.preventDefault();
    if (stop) {
      evt.stopPropagation();
    }
  }
};

/**
 * Add event helper
 *
 */
const addEvent$3 = (target, type, callback, options) => {
  target.addEventListener(type, callback, options);
};

/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
const iterate$3 = (object, callback) => {
  if (Array.isArray(object)) {
    object.forEach(callback);
  } else {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  }
};

/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom$3 = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString$3(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString$3 = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};

/**
 * Set attributes of an element
 *
 */
const setAttr = (el, attrs) => {
  iterate$3(attrs, (val, attr) => {
    if (val == null) {
      el.removeAttribute(attr);
    } else {
      el.setAttribute(attr, '' + val);
    }
  });
};

/**
 * Plugin: "drag_drop" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

const insertAfter = (referenceNode, newNode) => {
  var _referenceNode$parent;
  (_referenceNode$parent = referenceNode.parentNode) == null || _referenceNode$parent.insertBefore(newNode, referenceNode.nextSibling);
};
const insertBefore = (referenceNode, newNode) => {
  var _referenceNode$parent2;
  (_referenceNode$parent2 = referenceNode.parentNode) == null || _referenceNode$parent2.insertBefore(newNode, referenceNode);
};
const isBefore = (referenceNode, newNode) => {
  do {
    var _newNode;
    newNode = (_newNode = newNode) == null ? void 0 : _newNode.previousElementSibling;
    if (referenceNode == newNode) {
      return true;
    }
  } while (newNode && newNode.previousElementSibling);
  return false;
};
function plugin$a() {
  var self = this;
  if (self.settings.mode !== 'multi') return;
  var orig_lock = self.lock;
  var orig_unlock = self.unlock;
  let sortable = true;
  let drag_item;

  /**
   * Add draggable attribute to item
   */
  self.hook('after', 'setupTemplates', () => {
    var orig_render_item = self.settings.render.item;
    self.settings.render.item = (data, escape) => {
      const item = getDom$3(orig_render_item.call(self, data, escape));
      setAttr(item, {
        'draggable': 'true'
      });

      // prevent doc_mousedown (see tom-select.ts)
      const mousedown = evt => {
        if (!sortable) preventDefault$3(evt);
        evt.stopPropagation();
      };
      const dragStart = evt => {
        drag_item = item;
        setTimeout(() => {
          item.classList.add('ts-dragging');
        }, 0);
      };
      const dragOver = evt => {
        evt.preventDefault();
        item.classList.add('ts-drag-over');
        moveitem(item, drag_item);
      };
      const dragLeave = () => {
        item.classList.remove('ts-drag-over');
      };
      const moveitem = (targetitem, dragitem) => {
        if (dragitem === undefined) return;
        if (isBefore(dragitem, item)) {
          insertAfter(targetitem, dragitem);
        } else {
          insertBefore(targetitem, dragitem);
        }
      };
      const dragend = () => {
        var _drag_item;
        document.querySelectorAll('.ts-drag-over').forEach(el => el.classList.remove('ts-drag-over'));
        (_drag_item = drag_item) == null || _drag_item.classList.remove('ts-dragging');
        drag_item = undefined;
        var values = [];
        self.control.querySelectorAll(`[data-value]`).forEach(el => {
          if (el.dataset.value) {
            let value = el.dataset.value;
            if (value) {
              values.push(value);
            }
          }
        });
        self.setValue(values);
      };
      addEvent$3(item, 'mousedown', mousedown);
      addEvent$3(item, 'dragstart', dragStart);
      addEvent$3(item, 'dragenter', dragOver);
      addEvent$3(item, 'dragover', dragOver);
      addEvent$3(item, 'dragleave', dragLeave);
      addEvent$3(item, 'dragend', dragend);
      return item;
    };
  });
  self.hook('instead', 'lock', () => {
    sortable = false;
    return orig_lock.call(self);
  });
  self.hook('instead', 'unlock', () => {
    sortable = true;
    return orig_unlock.call(self);
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Prevent default
 *
 */
const preventDefault$2 = (evt, stop = false) => {
  if (evt) {
    evt.preventDefault();
    if (stop) {
      evt.stopPropagation();
    }
  }
};

/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom$2 = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString$2(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString$2 = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};

/**
 * Plugin: "dropdown_header" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$9(userOptions) {
  const self = this;
  const options = Object.assign({
    title: 'Untitled',
    headerClass: 'dropdown-header',
    titleRowClass: 'dropdown-header-title',
    labelClass: 'dropdown-header-label',
    closeClass: 'dropdown-header-close',
    html: data => {
      return '<div class="' + data.headerClass + '">' + '<div class="' + data.titleRowClass + '">' + '<span class="' + data.labelClass + '">' + data.title + '</span>' + '<a class="' + data.closeClass + '">&times;</a>' + '</div>' + '</div>';
    }
  }, userOptions);
  self.on('initialize', () => {
    var header = getDom$2(options.html(options));
    var close_link = header.querySelector('.' + options.closeClass);
    if (close_link) {
      close_link.addEventListener('click', evt => {
        preventDefault$2(evt, true);
        self.close();
      });
    }
    self.dropdown.insertBefore(header, self.dropdown.firstChild);
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
const iterate$2 = (object, callback) => {
  if (Array.isArray(object)) {
    object.forEach(callback);
  } else {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  }
};

/**
 * Remove css classes
 *
 */
const removeClasses = (elmts, ...classes) => {
  var norm_classes = classesArray$2(classes);
  elmts = castAsArray$2(elmts);
  elmts.map(el => {
    norm_classes.map(cls => {
      el.classList.remove(cls);
    });
  });
};

/**
 * Return arguments
 *
 */
const classesArray$2 = args => {
  var classes = [];
  iterate$2(args, _classes => {
    if (typeof _classes === 'string') {
      _classes = _classes.trim().split(/[\t\n\f\r\s]/);
    }
    if (Array.isArray(_classes)) {
      classes = classes.concat(_classes);
    }
  });
  return classes.filter(Boolean);
};

/**
 * Create an array from arg if it's not already an array
 *
 */
const castAsArray$2 = arg => {
  if (!Array.isArray(arg)) {
    arg = [arg];
  }
  return arg;
};

/**
 * Get the index of an element amongst sibling nodes of the same type
 *
 */
const nodeIndex$1 = (el, amongst) => {
  if (!el) return -1;
  amongst = amongst || el.nodeName;
  var i = 0;
  while (el = el.previousElementSibling) {
    if (el.matches(amongst)) {
      i++;
    }
  }
  return i;
};

/**
 * Plugin: "dropdown_input" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$8() {
  var self = this;

  /**
   * Moves the caret to the specified index.
   *
   * The input must be moved by leaving it in place and moving the
   * siblings, due to the fact that focus cannot be restored once lost
   * on mobile webkit devices
   *
   */
  self.hook('instead', 'setCaret', new_pos => {
    if (self.settings.mode === 'single' || !self.control.contains(self.control_input)) {
      new_pos = self.items.length;
    } else {
      new_pos = Math.max(0, Math.min(self.items.length, new_pos));
      if (new_pos != self.caretPos && !self.isPending) {
        self.controlChildren().forEach((child, j) => {
          if (j < new_pos) {
            self.control_input.insertAdjacentElement('beforebegin', child);
          } else {
            self.control.appendChild(child);
          }
        });
      }
    }
    self.caretPos = new_pos;
  });
  self.hook('instead', 'moveCaret', direction => {
    if (!self.isFocused) return;

    // move caret before or after selected items
    const last_active = self.getLastActive(direction);
    if (last_active) {
      const idx = nodeIndex$1(last_active);
      self.setCaret(direction > 0 ? idx + 1 : idx);
      self.setActiveItem();
      removeClasses(last_active, 'last-active');

      // move caret left or right of current position
    } else {
      self.setCaret(self.caretPos + direction);
    }
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

const KEY_ESC = 27;
const KEY_TAB = 9;
// ctrl key or apple key for ma

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Prevent default
 *
 */
const preventDefault$1 = (evt, stop = false) => {
  if (evt) {
    evt.preventDefault();
    if (stop) {
      evt.stopPropagation();
    }
  }
};

/**
 * Add event helper
 *
 */
const addEvent$2 = (target, type, callback, options) => {
  target.addEventListener(type, callback, options);
};

/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
const iterate$1 = (object, callback) => {
  if (Array.isArray(object)) {
    object.forEach(callback);
  } else {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  }
};

/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom$1 = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString$1(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString$1 = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};

/**
 * Add css classes
 *
 */
const addClasses$1 = (elmts, ...classes) => {
  var norm_classes = classesArray$1(classes);
  elmts = castAsArray$1(elmts);
  elmts.map(el => {
    norm_classes.map(cls => {
      el.classList.add(cls);
    });
  });
};

/**
 * Return arguments
 *
 */
const classesArray$1 = args => {
  var classes = [];
  iterate$1(args, _classes => {
    if (typeof _classes === 'string') {
      _classes = _classes.trim().split(/[\t\n\f\r\s]/);
    }
    if (Array.isArray(_classes)) {
      classes = classes.concat(_classes);
    }
  });
  return classes.filter(Boolean);
};

/**
 * Create an array from arg if it's not already an array
 *
 */
const castAsArray$1 = arg => {
  if (!Array.isArray(arg)) {
    arg = [arg];
  }
  return arg;
};

/**
 * Plugin: "dropdown_input" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$7() {
  const self = this;
  self.settings.shouldOpen = true; // make sure the input is shown even if there are no options to display in the dropdown

  self.hook('before', 'setup', () => {
    self.focus_node = self.control;
    addClasses$1(self.control_input, 'dropdown-input');
    const div = getDom$1('<div class="dropdown-input-wrap">');
    div.append(self.control_input);
    self.dropdown.insertBefore(div, self.dropdown.firstChild);

    // set a placeholder in the select control
    const placeholder = getDom$1('<input class="items-placeholder" tabindex="-1" />');
    placeholder.placeholder = self.settings.placeholder || '';
    self.control.append(placeholder);
  });
  self.on('initialize', () => {
    // set tabIndex on control to -1, otherwise [shift+tab] will put focus right back on control_input
    self.control_input.addEventListener('keydown', evt => {
      //addEvent(self.control_input,'keydown' as const,(evt:KeyboardEvent) =>{
      switch (evt.keyCode) {
        case KEY_ESC:
          if (self.isOpen) {
            preventDefault$1(evt, true);
            self.close();
          }
          self.clearActiveItems();
          return;
        case KEY_TAB:
          self.focus_node.tabIndex = -1;
          break;
      }
      return self.onKeyDown.call(self, evt);
    });
    self.on('blur', () => {
      self.focus_node.tabIndex = self.isDisabled ? -1 : self.tabIndex;
    });

    // give the control_input focus when the dropdown is open
    self.on('dropdown_open', () => {
      self.control_input.focus();
    });

    // prevent onBlur from closing when focus is on the control_input
    const orig_onBlur = self.onBlur;
    self.hook('instead', 'onBlur', evt => {
      if (evt && evt.relatedTarget == self.control_input) return;
      return orig_onBlur.call(self);
    });
    addEvent$2(self.control_input, 'blur', () => self.onBlur());

    // return focus to control to allow further keyboard input
    self.hook('before', 'close', () => {
      if (!self.isOpen) return;
      self.focus_node.focus({
        preventScroll: true
      });
    });
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Add event helper
 *
 */
const addEvent$1 = (target, type, callback, options) => {
  target.addEventListener(type, callback, options);
};

/**
 * Plugin: "input_autogrow" (Tom Select)
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$6() {
  var self = this;
  self.on('initialize', () => {
    var test_input = document.createElement('span');
    var control = self.control_input;
    test_input.style.cssText = 'position:absolute; top:-99999px; left:-99999px; width:auto; padding:0; white-space:pre; ';
    self.wrapper.appendChild(test_input);
    var transfer_styles = ['letterSpacing', 'fontSize', 'fontFamily', 'fontWeight', 'textTransform'];
    for (const style_name of transfer_styles) {
      // @ts-ignore TS7015 https://stackoverflow.com/a/50506154/697576
      test_input.style[style_name] = control.style[style_name];
    }

    /**
     * Set the control width
     *
     */
    var resize = () => {
      test_input.textContent = control.value;
      control.style.width = test_input.clientWidth + 'px';
    };
    resize();
    self.on('update item_add item_remove', resize);
    addEvent$1(control, 'input', resize);
    addEvent$1(control, 'keyup', resize);
    addEvent$1(control, 'blur', resize);
    addEvent$1(control, 'update', resize);
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Plugin: "input_autogrow" (Tom Select)
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$5() {
  var self = this;
  var orig_deleteSelection = self.deleteSelection;
  this.hook('instead', 'deleteSelection', evt => {
    if (self.activeItems.length) {
      return orig_deleteSelection.call(self, evt);
    }
    return false;
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Plugin: "no_active_items" (Tom Select)
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$4() {
  this.hook('instead', 'setActiveItem', () => {});
  this.hook('instead', 'selectAll', () => {});
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
// ctrl key or apple key for ma

/**
 * Get the closest node to the evt.target matching the selector
 * Stops at wrapper
 *
 */
const parentMatch = (target, selector, wrapper) => {
  while (target && target.matches) {
    if (target.matches(selector)) {
      return target;
    }
    target = target.parentNode;
  }
};

/**
 * Get the index of an element amongst sibling nodes of the same type
 *
 */
const nodeIndex = (el, amongst) => {
  if (!el) return -1;
  amongst = amongst || el.nodeName;
  var i = 0;
  while (el = el.previousElementSibling) {
    if (el.matches(amongst)) {
      i++;
    }
  }
  return i;
};

/**
 * Plugin: "optgroup_columns" (Tom Select.js)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$3() {
  var self = this;
  var orig_keydown = self.onKeyDown;
  self.hook('instead', 'onKeyDown', evt => {
    var index, option, options, optgroup;
    if (!self.isOpen || !(evt.keyCode === KEY_LEFT || evt.keyCode === KEY_RIGHT)) {
      return orig_keydown.call(self, evt);
    }
    self.ignoreHover = true;
    optgroup = parentMatch(self.activeOption, '[data-group]');
    index = nodeIndex(self.activeOption, '[data-selectable]');
    if (!optgroup) {
      return;
    }
    if (evt.keyCode === KEY_LEFT) {
      optgroup = optgroup.previousSibling;
    } else {
      optgroup = optgroup.nextSibling;
    }
    if (!optgroup) {
      return;
    }
    options = optgroup.querySelectorAll('[data-selectable]');
    option = options[Math.min(options.length - 1, index)];
    if (option) {
      self.setActiveOption(option);
    }
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Escapes a string for use within HTML.
 *
 */
const escape_html = str => {
  return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

/**
 * Prevent default
 *
 */
const preventDefault = (evt, stop = false) => {
  if (evt) {
    evt.preventDefault();
    if (stop) {
      evt.stopPropagation();
    }
  }
};

/**
 * Add event helper
 *
 */
const addEvent = (target, type, callback, options) => {
  target.addEventListener(type, callback, options);
};

/**
 * Return a dom element from either a dom query string, jQuery object, a dom element or html string
 * https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
 *
 * param query should be {}
 */
const getDom = query => {
  if (query.jquery) {
    return query[0];
  }
  if (query instanceof HTMLElement) {
    return query;
  }
  if (isHtmlString(query)) {
    var tpl = document.createElement('template');
    tpl.innerHTML = query.trim(); // Never return a text node of whitespace as the result
    return tpl.content.firstChild;
  }
  return document.querySelector(query);
};
const isHtmlString = arg => {
  if (typeof arg === 'string' && arg.indexOf('<') > -1) {
    return true;
  }
  return false;
};

/**
 * Plugin: "remove_button" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$2(userOptions) {
  const options = Object.assign({
    label: '&times;',
    title: 'Remove',
    className: 'remove',
    append: true
  }, userOptions);

  //options.className = 'remove-single';
  var self = this;

  // override the render method to add remove button to each item
  if (!options.append) {
    return;
  }
  var html = '<a href="javascript:void(0)" class="' + options.className + '" tabindex="-1" title="' + escape_html(options.title) + '">' + options.label + '</a>';
  self.hook('after', 'setupTemplates', () => {
    var orig_render_item = self.settings.render.item;
    self.settings.render.item = (data, escape) => {
      var item = getDom(orig_render_item.call(self, data, escape));
      var close_button = getDom(html);
      item.appendChild(close_button);
      addEvent(close_button, 'mousedown', evt => {
        preventDefault(evt, true);
      });
      addEvent(close_button, 'click', evt => {
        if (self.isLocked) return;

        // propagating will trigger the dropdown to show for single mode
        preventDefault(evt, true);
        if (self.isLocked) return;
        if (!self.shouldDelete([item], evt)) return;
        self.removeItem(item);
        self.refreshOptions(false);
        self.inputState();
      });
      return item;
    };
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Plugin: "restore_on_backspace" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin$1(userOptions) {
  const self = this;
  const options = Object.assign({
    text: option => {
      return option[self.settings.labelField];
    }
  }, userOptions);
  self.on('item_remove', function (value) {
    if (!self.isFocused) {
      return;
    }
    if (self.control_input.value.trim() === '') {
      var option = self.options[value];
      if (option) {
        self.setTextboxValue(options.text.call(self, option));
      }
    }
  });
}/**
* Tom Select v2.4.0
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * Converts a scalar to its best string representation
 * for hash keys and HTML attribute values.
 *
 * Transformations:
 *   'str'     -> 'str'
 *   null      -> ''
 *   undefined -> ''
 *   true      -> '1'
 *   false     -> '0'
 *   0         -> '0'
 *   1         -> '1'
 *
 */

/**
 * Iterates over arrays and hashes.
 *
 * ```
 * iterate(this.items, function(item, id) {
 *    // invoked for each item
 * });
 * ```
 *
 */
const iterate = (object, callback) => {
  if (Array.isArray(object)) {
    object.forEach(callback);
  } else {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        callback(object[key], key);
      }
    }
  }
};

/**
 * Add css classes
 *
 */
const addClasses = (elmts, ...classes) => {
  var norm_classes = classesArray(classes);
  elmts = castAsArray(elmts);
  elmts.map(el => {
    norm_classes.map(cls => {
      el.classList.add(cls);
    });
  });
};

/**
 * Return arguments
 *
 */
const classesArray = args => {
  var classes = [];
  iterate(args, _classes => {
    if (typeof _classes === 'string') {
      _classes = _classes.trim().split(/[\t\n\f\r\s]/);
    }
    if (Array.isArray(_classes)) {
      classes = classes.concat(_classes);
    }
  });
  return classes.filter(Boolean);
};

/**
 * Create an array from arg if it's not already an array
 *
 */
const castAsArray = arg => {
  if (!Array.isArray(arg)) {
    arg = [arg];
  }
  return arg;
};

/**
 * Plugin: "restore_on_backspace" (Tom Select)
 * Copyright (c) contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

function plugin() {
  const self = this;
  const orig_canLoad = self.canLoad;
  const orig_clearActiveOption = self.clearActiveOption;
  const orig_loadCallback = self.loadCallback;
  var pagination = {};
  var dropdown_content;
  var loading_more = false;
  var load_more_opt;
  var default_values = [];
  if (!self.settings.shouldLoadMore) {
    // return true if additional results should be loaded
    self.settings.shouldLoadMore = () => {
      const scroll_percent = dropdown_content.clientHeight / (dropdown_content.scrollHeight - dropdown_content.scrollTop);
      if (scroll_percent > 0.9) {
        return true;
      }
      if (self.activeOption) {
        var selectable = self.selectable();
        var index = Array.from(selectable).indexOf(self.activeOption);
        if (index >= selectable.length - 2) {
          return true;
        }
      }
      return false;
    };
  }
  if (!self.settings.firstUrl) {
    throw 'virtual_scroll plugin requires a firstUrl() method';
  }

  // in order for virtual scrolling to work,
  // options need to be ordered the same way they're returned from the remote data source
  self.settings.sortField = [{
    field: '$order'
  }, {
    field: '$score'
  }];

  // can we load more results for given query?
  const canLoadMore = query => {
    if (typeof self.settings.maxOptions === 'number' && dropdown_content.children.length >= self.settings.maxOptions) {
      return false;
    }
    if (query in pagination && pagination[query]) {
      return true;
    }
    return false;
  };
  const clearFilter = (option, value) => {
    if (self.items.indexOf(value) >= 0 || default_values.indexOf(value) >= 0) {
      return true;
    }
    return false;
  };

  // set the next url that will be
  self.setNextUrl = (value, next_url) => {
    pagination[value] = next_url;
  };

  // getUrl() to be used in settings.load()
  self.getUrl = query => {
    if (query in pagination) {
      const next_url = pagination[query];
      pagination[query] = false;
      return next_url;
    }

    // if the user goes back to a previous query
    // we need to load the first page again
    self.clearPagination();
    return self.settings.firstUrl.call(self, query);
  };

  // clear pagination
  self.clearPagination = () => {
    pagination = {};
  };

  // don't clear the active option (and cause unwanted dropdown scroll)
  // while loading more results
  self.hook('instead', 'clearActiveOption', () => {
    if (loading_more) {
      return;
    }
    return orig_clearActiveOption.call(self);
  });

  // override the canLoad method
  self.hook('instead', 'canLoad', query => {
    // first time the query has been seen
    if (!(query in pagination)) {
      return orig_canLoad.call(self, query);
    }
    return canLoadMore(query);
  });

  // wrap the load
  self.hook('instead', 'loadCallback', (options, optgroups) => {
    if (!loading_more) {
      self.clearOptions(clearFilter);
    } else if (load_more_opt) {
      const first_option = options[0];
      if (first_option !== undefined) {
        load_more_opt.dataset.value = first_option[self.settings.valueField];
      }
    }
    orig_loadCallback.call(self, options, optgroups);
    loading_more = false;
  });

  // add templates to dropdown
  //	loading_more if we have another url in the queue
  //	no_more_results if we don't have another url in the queue
  self.hook('after', 'refreshOptions', () => {
    const query = self.lastValue;
    var option;
    if (canLoadMore(query)) {
      option = self.render('loading_more', {
        query: query
      });
      if (option) {
        option.setAttribute('data-selectable', ''); // so that navigating dropdown with [down] keypresses can navigate to this node
        load_more_opt = option;
      }
    } else if (query in pagination && !dropdown_content.querySelector('.no-results')) {
      option = self.render('no_more_results', {
        query: query
      });
    }
    if (option) {
      addClasses(option, self.settings.optionClass);
      dropdown_content.append(option);
    }
  });

  // add scroll listener and default templates
  self.on('initialize', () => {
    default_values = Object.keys(self.options);
    dropdown_content = self.dropdown_content;

    // default templates
    self.settings.render = Object.assign({}, {
      loading_more: () => {
        return `<div class="loading-more-results">Loading more results ... </div>`;
      },
      no_more_results: () => {
        return `<div class="no-more-results">No more results</div>`;
      }
    }, self.settings.render);

    // watch dropdown content scroll position
    dropdown_content.addEventListener('scroll', () => {
      if (!self.settings.shouldLoadMore.call(self)) {
        return;
      }

      // !important: this will get checked again in load() but we still need to check here otherwise loading_more will be set to true
      if (!canLoadMore(self.lastValue)) {
        return;
      }

      // don't call load() too much
      if (loading_more) return;
      loading_more = true;
      self.load.call(self, self.lastValue);
    });
  });
}TomSelect.define('change_listener', plugin$d);
TomSelect.define('checkbox_options', plugin$c);
TomSelect.define('clear_button', plugin$b);
TomSelect.define('drag_drop', plugin$a);
TomSelect.define('dropdown_header', plugin$9);
TomSelect.define('caret_position', plugin$8);
TomSelect.define('dropdown_input', plugin$7);
TomSelect.define('input_autogrow', plugin$6);
TomSelect.define('no_backspace_delete', plugin$5);
TomSelect.define('no_active_items', plugin$4);
TomSelect.define('optgroup_columns', plugin$3);
TomSelect.define('remove_button', plugin$2);
TomSelect.define('restore_on_backspace', plugin$1);
TomSelect.define('virtual_scroll', plugin);const setupSwiper = () => {
  const swiper = new Swiper('.swiper', {
    modules: [Pagination],
    loop: true,
    pagination: {
      el: '.swiper-pagination'
    }
  });
  swiper.on('slideChange', () => {
    const activeIndex = swiper.realIndex;
    const paginationBullets = document.querySelectorAll('.swiper-pagination-bullet');
    paginationBullets.forEach((bullet, index) => {
      if (index === activeIndex) {
        bullet.classList.add('swiper-pagination-bullet-active');
      } else {
        bullet.classList.remove('swiper-pagination-bullet-active');
      }
    });
  });
};
const setupDatePicker = () => {
  const dateInput = document.querySelector('input[name="tx_ausstello_event[search][startDate]"]');
  if (!dateInput) {
    return;
  }
  const currentDate = dateInput?.value != "" ? dateInput.value : dateInput.dataset.min ? dateInput.dataset.min : Date.now();
  dateInput.parentElement.style.position = 'relative';
  new AirDatepicker('#ausstello-form-date', {
    container: dateInput.parentElement,
    locale: localeDe,
    dateFormat: 'dd.MM.yyyy',
    minDate: dateInput.dataset.min ?? null,
    maxDate: dateInput.dataset.max ?? null,
    startDate: currentDate,
    selectedDates: [currentDate],
    onSelect: function (_ref) {
      let {
        date,
        datepicker
      } = _ref;
      dateInput.value = datepicker.formatDate(date, 'yyyy-MM-dd');
      dateInput.form.requestSubmit();
    }
  });
};
const setupTomSelect = () => {
  const location = document.querySelector('select[name="tx_ausstello_event[search][locations][]"]');
  const primaryCategory = document.querySelector('select[name="tx_ausstello_event[search][primaryCategories][]"]');
  const secondaryCategory = document.querySelector('select[name="tx_ausstello_event[search][secondaryCategories][]"]');
  [location, primaryCategory, secondaryCategory].forEach(element => {
    if (element) {
      new TomSelect(element, {
        plugins: {
          'checkbox_options': {
            'checkedClassNames': ['ts-checked'],
            'uncheckedClassNames': ['ts-unchecked']
          }
        },
        create: false,
        onChange: function () {
          element.form.requestSubmit();
        },
        render: {
          option: function (data, escape) {
            console.log(data);
            if (data.$option.dataset.areaId) {
              return '<div class="option-indent">' + escape(data.text) + '</div>';
            }
            return '<div style="font-weight: bold">' + escape(data.text) + '</div>';
          }
        }
      });
    }
  });
};
const setupTags = () => {
  const tagElement = document.querySelector('select[name="tx_ausstello_event[search][tags][]"]');
  const tags = document.querySelectorAll('.ausstello-form-tags-item-name');
  tags.forEach(tag => {
    tag.addEventListener('click', event => {
      event.preventDefault();
      const option = tagElement.querySelector(`option[value="${tag.dataset.id}"]`);
      if (tag.dataset.selected == "1") {
        option?.removeAttribute('selected');
        tag.removeAttribute('data-selected');
      } else {
        option?.setAttribute('selected', 'selected');
        tag.setAttribute('data-selected', '1');
      }
      tagElement.form.requestSubmit();
    });
  });
};
(() => {
  setupTomSelect();
  setupDatePicker();
  setupTags();
  setupSwiper();
  document.querySelectorAll('.ausstello-detail-location-opener')?.forEach(btn => {
    btn.addEventListener('click', event => {
      event.preventDefault();
      btn.closest('.ausstello-detail-location-infos').classList.toggle('show');
    });
  });
})();//# sourceMappingURL=ausstello.js.map
