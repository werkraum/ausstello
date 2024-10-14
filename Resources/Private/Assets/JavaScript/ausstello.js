import 'air-datepicker/air-datepicker.css';
import "tom-select/dist/css/tom-select.bootstrap5.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import "../Scss/ausstello.scss"

const setupSwiper = async () => {
  const {default: Swiper} = await import('swiper');
  const {Pagination} = await import('swiper/modules');

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
}

const setupDatePicker = async () => {
  const {default: AirDatepicker} = await import('air-datepicker');
  const {default: localeDe} = await import('air-datepicker/locale/de');

  const dateInput = document.querySelector('input[name="tx_ausstello_event[search][startDate]"]');
  if (!dateInput) {
    return;
  }

  const currentDate = dateInput?.value != "" ? dateInput.value : Date.now();

  dateInput.parentElement.style.position = 'relative';

  new AirDatepicker('#ausstello-form-date', {
    container: dateInput.parentElement,
    locale: localeDe,
    dateFormat: 'dd.MM.yyyy',
    minDate: dateInput.dataset.min ?? null,
    maxDate: dateInput.dataset.max ?? null,
    startDate: currentDate,
    selectedDates: [currentDate],
    onSelect: function ({ date, datepicker}) {
      dateInput.value = datepicker.formatDate(date, 'yyyy-MM-dd');
      dateInput.form.requestSubmit();
    }
  });
}

const setupTomSelect = async () => {
  const {default: TomSelect} = await import('tom-select');
  const location = document.querySelector('select[name="tx_ausstello_event[search][locations][]"]');
  const primaryCategory = document.querySelector('select[name="tx_ausstello_event[search][primaryCategories][]"]');
  const secondaryCategory = document.querySelector('select[name="tx_ausstello_event[search][secondaryCategories][]"]');

  [location, primaryCategory, secondaryCategory].forEach((element) => {
    if (element) {
      new TomSelect(element, {
        plugins: {
          'checkbox_options': {
            'checkedClassNames': ['ts-checked'],
            'uncheckedClassNames': ['ts-unchecked'],
          }
        },
        create: false,
        onChange: function () {
          element.form.requestSubmit()
        },
        render: {
          option: function (data, escape) {
            console.log(data)
            if (data.$option.dataset.areaId) {
              return '<div class="option-indent">' + escape(data.text) + '</div>';
            }
            return '<div style="font-weight: bold">' + escape(data.text) + '</div>';
          }
        }
      })
    }
  });

}

const setupTags = async () => {
  const tagElement = document.querySelector('select[name="tx_ausstello_event[search][tags][]"]');
  const tags = document.querySelectorAll('.ausstello-form-tags-item-name');
  tags.forEach(tag => {
    tag.addEventListener('click', (event) => {
      event.preventDefault();
      const option = tagElement.querySelector(`option[value="${tag.dataset.id}"]`);
      if (tag.dataset.selected == "1") {
        option?.removeAttribute('selected');
        tag.removeAttribute('data-selected');
      } else {
        option?.setAttribute('selected', 'selected');
        tag.setAttribute('data-selected', '1');
      }
      tagElement.form.requestSubmit()
    });
  });
}

(async () => {
  await setupDatePicker();
  await setupTomSelect();
  await setupTags();
  await setupSwiper();

  document.querySelectorAll('.ausstello-detail-location-opener')?.forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      btn.closest('.ausstello-detail-location-infos').classList.toggle('show');
    })
  })
})();
