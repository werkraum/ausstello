
import Swiper from "swiper";
import {Pagination} from "swiper/modules";

import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipeDynamicCaption from 'photoswipe-dynamic-caption-plugin';

import "../Scss/ausstello.scss";

const setupSwiper = () => {
  const photo_swipe_options = {
    gallery: '#lightbox-gallery',
    pswpModule: () => import("photoswipe"),
    children: 'a',
    initialZoomLevel: 'fit',
  };
  const lightbox = new PhotoSwipeLightbox(photo_swipe_options);
  new PhotoSwipeDynamicCaption(lightbox, {
    // Plugins options, for example:
    type: 'below',
  });
  lightbox.init();

  const swiperContainer = document.querySelector('.swiper');
  if (swiperContainer) {
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

    lightbox.on('change', () => {
      const { pswp } = lightbox;
      swiper.slideTo(pswp.currIndex, 0, false);
    });

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
