import AirDatepicker from "air-datepicker";
import localeDe from "air-datepicker/locale/de";
import TomSelect from 'tom-select';

import 'air-datepicker/air-datepicker.css';
import "tom-select/dist/css/tom-select.bootstrap5.css";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import "../Scss/ausstello.scss";

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
    onSelect: function ({date, datepicker}) {
      dateInput.value = datepicker.formatDate(date, 'yyyy-MM-dd');
      dateInput.form.requestSubmit();
    }
  });
}

const setupTomSelect = () => {
  const location = document.querySelector('select[name="tx_ausstello_event[search][locations][]"]');
  const primaryCategory = document.querySelector('select[name="tx_ausstello_event[search][primaryCategories][]"]');
  const secondaryCategory = document.querySelector('select[name="tx_ausstello_event[search][secondaryCategories][]"]');
  const counterElementPrimary = document.querySelector('.ausstello-form-primary-category-label-counter');
  const counterElementLocation = document.querySelector('.ausstello-form-location-label-counter');
  updateCounter(location, primaryCategory, secondaryCategory, counterElementPrimary, counterElementLocation);

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

          updateCounter(location, primaryCategory, secondaryCategory, counterElementPrimary, counterElementLocation);

          element.form.requestSubmit();
        },
        render: {
          option: function (data, escape) {
            // console.log(data)
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

const setupTags = () => {
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

const updateCounter = (location, primaryCategory, secondaryCategory, counterElementPrimary, counterElementLocation) => {
  counterElementPrimary.innerText = primaryCategory.selectedOptions.length > 0 ? primaryCategory.selectedOptions.length : "";
  counterElementLocation.innerText = location.selectedOptions.length > 0 ? location.selectedOptions.length : "";
};

(() => {
  setupTomSelect();
  setupDatePicker();
  setupTags();
})();
