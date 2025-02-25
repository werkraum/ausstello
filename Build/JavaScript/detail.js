import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Swiper from "swiper";
import {Pagination} from "swiper/modules";

import PhotoSwipeLightbox from 'photoswipe/lightbox';

import 'photoswipe/style.css';
import 'photoswipe/photoswipe.css';

import "../Scss/ausstello.scss";

const setupSwiper = () => {

  const swiper = new Swiper('.swiper', {
    modules: [Pagination],
    loop: true,
    pagination: {
      el: '.swiper-pagination'
    },
    keyboard: {
      enabled: true,
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

  const photo_swipe_options = {
    gallery: '#lightbox-gallery',
    pswpModule: () => import("photoswipe"),
    // set background opacity
    // bgOpacity: 1,
    // showHideOpacity: true,
    children: 'a',
    initialZoomLevel: 'fit',
    // loop: true,
    // showHideAnimationType: 'zoom', /* options: fade, zoom, none */

    /* Click on image moves to the next slide */
    // imageClickAction: 'next',
    // tapAction: 'next',

    /* ## Hiding a specific UI element ## */
    // zoom: false,
    // close: true,
    // counter: true,
    // arrowKeys: true,
    /* ## Options ## */
    // wheelToZoom: true, /* deafult: undefined */
  };

  const lightbox = new PhotoSwipeLightbox(photo_swipe_options);

  lightbox.init();

  lightbox.on('change', () => {
    const { pswp } = lightbox;
    swiper.slideTo(pswp.currIndex, 0, false);
  });

  /* ### PhotoSwipe events ### */

  lightbox.on('afterInit', () => {
    if(swiper.params?.autoplay?.enabled){
      swiper.autoplay.stop();
    }
  });

  lightbox.on('closingAnimationStart', () => {
    const { pswp } = lightbox;
    swiper.slideTo(pswp.currIndex, 0, false);
    /* if autoplay enabled == true -> autoplay.start() when close lightbox */
    if(swiper.params?.autoplay?.enabled){
      swiper.autoplay.start();
    }
  });
}

(() => {
  setupSwiper();
  document.querySelectorAll('.ausstello-detail-location-name-wrapper')?.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      btn.closest('.ausstello-detail-location-infos').classList.toggle('show');
    })
  })
})();
