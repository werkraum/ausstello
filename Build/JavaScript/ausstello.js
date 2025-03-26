import AirDatepicker from "air-datepicker";
import localeDe from "air-datepicker/locale/de";
import TomSelect from 'tom-select';

import "../Scss/ausstello.scss";

const globalCounter = () => {
  const counterElement = document.querySelector('.ausstello-form-global-counter');
  const searchParams = new URLSearchParams(window.location.search);
  let count = 0;
  searchParams.forEach((item, name) => {
    console.log({item, name})
    if (item !== '') {
      count++;
    }
  });
  if (counterElement) {
    counterElement.innerHTML = count > 0 ? count : null;
  }
}

const setupDatePicker = () => {
  const dateInput = document.querySelector('input[name="tx_ausstello_event[search][startDate]"]');
  if (!dateInput) {
    return;
  }

  const currentDate = dateInput.value != "" ? dateInput.value : dateInput.dataset.min ? dateInput.dataset.min : Date.now();

  if (dateInput.value != "") {
    dateInput.closest('.ausstello-form-date').classList.add('active');
  }

  dateInput.parentElement.style.position = 'relative';

  const formDateElement = document.querySelector('.ausstello-form-date');
  let isVisible;
  const air = new AirDatepicker('#ausstello-form-date', {
    // inline: true,
    container: dateInput.parentElement,
    locale: localeDe,
    dateFormat: 'dd.MM.yyyy',
    minDate: dateInput.dataset.min ?? null,
    maxDate: dateInput.dataset.max ?? null,
    startDate: currentDate,
    selectedDates: [currentDate],
    autoClose: false,
    onSelect: function ({date, datepicker}) {
      dateInput.closest('.ausstello-form-date').classList.add('active');
      dateInput.value = datepicker.formatDate(date, 'yyyy-MM-dd');
      dateInput.form.requestSubmit();
    },
    onShow: function (isFinished) {
      if (isFinished) {
        isVisible = true;
      }
    },
    onHide: function (isFinished) {
      if (isFinished) {
        isVisible = false;
      }
    },
  });

  formDateElement.addEventListener('click', (event) => {
    if (!event.target.closest('.air-datepicker')) {
      if (isVisible) {
        air.hide();
      }
    }
  })

}

const setupTomSelect = () => {
  const location = document.querySelector('select[name="tx_ausstello_event[search][locations][]"]');
  const primaryCategory = document.querySelector('select[name="tx_ausstello_event[search][primaryCategories][]"]');
  const secondaryCategory = document.querySelector('select[name="tx_ausstello_event[search][secondaryCategories][]"]');

  [location, primaryCategory, secondaryCategory].forEach((element) => {
    if (element) {
      const counterElement = element.parentElement.querySelector('.counter');

      const updateCounter = () => {
        const count = element?.tomselect.items.length;
        counterElement.innerHTML = count > 0 ? count : null;
      }

      new TomSelect(element, {
        plugins: {
          'checkbox_options': {
            'checkedClassNames': ['ts-checked'],
            'uncheckedClassNames': ['ts-unchecked'],
          }
        },
        create: false,
        onChange: function () {
          updateCounter();
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
      });
      updateCounter();
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

const setupModal = () => {

  const modal = document.querySelector('.ausstello-form-modal');
  modal.setAttribute('style', 'display: none;')
  const modalTrigger = document.querySelector('.ausstello-form-modal-button');
  const form = document.getElementById('filter-form');
  const ausstello = document.querySelector('.ausstello');
  const body = document.querySelector('body');
  const modalClose = document.getElementById('close-modal');
  modalTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    if (modal.classList.contains('active')) {
      modal.classList.remove('active');
      modal.setAttribute('style', 'display: none;')
      ausstello.prepend(form);
      body.removeAttribute('style')
      form.removeAttribute('style')
      form.querySelector('.ausstello-list-row').setAttribute('style', 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));')
    } else {
      modal.classList.add('active');
      modal.setAttribute('style', 'display: flex;')
      modal.setAttribute('style', 'flex-direction: column;')
      form.setAttribute('style', 'flex-direction: column;')
      form.setAttribute('style', 'display: unset;')
      form.querySelector('.ausstello-list-row').setAttribute('style', 'grid-template-columns: 1fr;')
      modal.appendChild(form);
      body.setAttribute('style', 'overflow: hidden;')
    }
  });
  modalClose.addEventListener('click', (event) => {
    modal.classList.remove('active');
    modal.setAttribute('style', 'display: none;')
    ausstello.prepend(form);
    body.removeAttribute('style')
    form.removeAttribute('style')
    form.querySelector('.ausstello-list-row').setAttribute('style', 'grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));')
  })

}

(() => {
  setupTomSelect();
  setupDatePicker();
  setupTags();
  setupModal();

  const form = document.querySelector('#filter-form');
  form.addEventListener('submit', (event) => {
    if (event instanceof SubmitEvent && window.innerWidth < 992) {
      if (event.submitter === null) {
        // if the submitter is null -> submitted via JS, but we want to submit via button on mobile!
        event.preventDefault();
      }
    }
  });

  globalCounter();
})();
