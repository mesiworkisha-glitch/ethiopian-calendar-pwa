(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  if (!window.EthioPlanner || window.__planningCustomPeriod) return;
  window.__planningCustomPeriod = true;

  const translate = key => {
    if (typeof window.__planningTranslate === 'function') {
      return window.__planningTranslate(key);
    }
    return key;
  };

  const labels = {
    custom: {
      am: 'የተወሰነ የቀን ክልል',
      en: 'Custom date range',
      om: 'Daangaa guyyaa addaa',
      ti: 'ፍሉይ ክልል ዕለት',
      so: 'Kala duwanaansho taariikheed'
    },
    endDate: {
      am: 'የመጨረሻ ቀን',
      en: 'Planning end date',
      om: 'Guyyaa xumura karooraa',
      ti: 'ዕለት መወዳእታ መደብ',
      so: 'Taariikhda dhammaadka qorshaha'
    },
    endYear: {
      am: 'የመጨረሻ ዓመት',
      en: 'End year',
      om: 'Waggaa xumuraa',
      ti: 'ዓመት መወዳእታ',
      so: 'Sannadka dhammaadka'
    },
    endMonth: {
      am: 'የመጨረሻ ወር',
      en: 'End month',
      om: 'Ji’a xumuraa',
      ti: 'ወርሒ መወዳእታ',
      so: 'Bisha dhammaadka'
    },
    endDay: {
      am: 'የመጨረሻ ቀን',
      en: 'End day',
      om: 'Guyyaa xumuraa',
      ti: 'መዓልቲ መወዳእታ',
      so: 'Maalinta dhammaadka'
    },
    included: {
      am: 'የመጨረሻው ቀን በዕቅዱ ውስጥ ይካተታል።',
      en: 'The end date is included in the planning schedule.',
      om: 'Guyyaan xumuraa karoora keessatti ni dabalama.',
      ti: 'እቲ መወዳእታ ዕለት ኣብ መደብ ይካተት።',
      so: 'Taariikhda dhammaadka waxaa lagu daraa jadwalka qorshaha.'
    },
    units: {
      am: { day: 'ቀን', week: 'ሳምንት', month: 'ወር', year: 'ዓመት' },
      en: { day: 'day(s)', week: 'week(s)', month: 'month(s)', year: 'year(s)' },
      om: { day: 'guyyaa', week: 'torban', month: 'ji’a', year: 'waggaa' },
      ti: { day: 'ዕለት', week: 'ሰሙን', month: 'ወርሒ', year: 'ዓመት' },
      so: { day: 'maalin', week: 'toddobaad', month: 'bil', year: 'sannad' }
    }
  };

  function language(){
    const lang = localStorage.getItem('lang') || document.documentElement.lang || 'am';
    return labels.custom[lang] ? lang : 'am';
  }

  function label(key){
    const lang = language();
    return labels[key]?.[lang] || labels[key]?.en || key;
  }

  function unitLabel(unit){
    const lang = language();
    return labels.units[lang]?.[unit] || labels.units.en[unit] || unit;
  }

  function updateUnitLabels(){
    const units = $('planning-period-unit');
    const intervals = $('planning-interval-unit');
    [units, intervals].forEach(select => {
      if (!select) return;
      ['day', 'week', 'month', 'year'].forEach(value => {
        const option = select.querySelector(`option[value="${value}"]`);
        if (option) option.textContent = unitLabel(value);
      });
      const custom = select.querySelector('option[value="custom"]');
      if (custom) custom.textContent = label('custom');
    });
  }

  function updateCustomLabels(){
    const box = $('planning-custom-end-date');
    if (!box) return;
    const legend = box.querySelector('legend');
    const year = box.querySelector('label[for="planning-end-year"]');
    const month = box.querySelector('label[for="planning-end-month"]');
    const day = box.querySelector('label[for="planning-end-day"]');
    const info = $('planning-end-date-info');
    if (legend) legend.textContent = label('endDate');
    if (year) year.textContent = label('endYear');
    if (month) month.textContent = label('endMonth');
    if (day) day.textContent = label('endDay');
    if (info) info.textContent = label('included');
  }

  function refreshLocalizedControls(){
    updateUnitLabels();
    updateCustomLabels();
  }

  function validDate(y, m, d){
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (y < 1 || m < 1 || m > 13 || d < 1) return false;
    return d <= window.getMonthLength(y, m);
  }

  function endDate(){
    return {
      ey: +$('planning-end-year').value,
      em: +$('planning-end-month').value,
      ed: +$('planning-end-day').value
    };
  }

  function wrapGenerator(){
    const planner = window.EthioPlanner;
    const original = planner.generateSchedule;
    const rangeGenerator = planner.generateScheduleToDate;
    if (typeof original !== 'function' || typeof rangeGenerator !== 'function') return false;

    planner.generateSchedule = function(options){
      if (options.periodUnit !== 'custom') return original(options);

      const start = {
        ey: Number(options.start.ey),
        em: Number(options.start.em),
        ed: Number(options.start.ed)
      };
      const end = endDate();

      if (!validDate(start.ey, start.em, start.ed)) {
        throw new Error('Invalid Ethiopian start date.');
      }
      if (!validDate(end.ey, end.em, end.ed)) {
        throw new Error('Invalid Ethiopian end date.');
      }

      return rangeGenerator(Object.assign({}, options, { start, end }));
    };

    return true;
  }

  function addCustomOption(){
    const unit = $('planning-period-unit');
    if (!unit) return false;

    if (!unit.querySelector('option[value="custom"]')) {
      unit.add(new Option(label('custom'), 'custom'));
    }

    const periodGroup = unit.closest('.form-group');
    if (!periodGroup || $('planning-custom-end-date')) {
      refreshLocalizedControls();
      return !!$('planning-custom-end-date');
    }

    const wrap = document.createElement('div');
    wrap.className = 'form-group';
    wrap.id = 'planning-custom-end-date';
    wrap.hidden = true;
    wrap.innerHTML = `
      <fieldset>
        <legend>${label('endDate')}</legend>
        <div class="form-row">
          <div class="form-group">
            <label for="planning-end-year">${label('endYear')}</label>
            <input id="planning-end-year" type="number" min="1" aria-describedby="planning-end-date-info">
          </div>
          <div class="form-group">
            <label for="planning-end-month">${label('endMonth')}</label>
            <input id="planning-end-month" type="number" min="1" max="13" aria-describedby="planning-end-date-info">
          </div>
          <div class="form-group">
            <label for="planning-end-day">${label('endDay')}</label>
            <input id="planning-end-day" type="number" min="1" max="30" aria-describedby="planning-end-date-info">
          </div>
        </div>
        <div class="planning-info" id="planning-end-date-info" role="status" aria-live="polite">${label('included')}</div>
      </fieldset>`;

    periodGroup.parentElement.appendChild(wrap);
    unit.addEventListener('change', toggle);
    $('planning-year').addEventListener('input', syncDefaultEnd);
    $('planning-month').addEventListener('input', syncDefaultEnd);
    $('planning-day').addEventListener('input', syncDefaultEnd);
    syncDefaultEnd();
    toggle();
    refreshLocalizedControls();
    return true;
  }

  function syncDefaultEnd(){
    if (!$('planning-end-year')) return;
    if (!$('planning-end-year').value) {
      $('planning-end-year').value = $('planning-year').value;
      $('planning-end-month').value = $('planning-month').value;
      $('planning-end-day').value = $('planning-day').value;
    }
  }

  function resetCustomEndToStart(){
    if (!$('planning-end-year')) return;
    $('planning-end-year').value = $('planning-year').value;
    $('planning-end-month').value = $('planning-month').value;
    $('planning-end-day').value = $('planning-day').value;
  }

  function toggle(){
    const custom = $('planning-period-unit')?.value === 'custom';
    const box = $('planning-custom-end-date');
    const value = $('planning-period-value');

    if (box) box.hidden = !custom;
    if (value) {
      value.disabled = custom;
      if (custom) {
        value.setAttribute('aria-describedby', 'planning-end-date-info');
      } else {
        value.removeAttribute('aria-describedby');
      }
    }
  }

  function restoreSavedEnd(){
    const button = $('planning-load-saved');
    if (!button || button.dataset.customPeriodBound) return;
    button.dataset.customPeriodBound = '1';

    button.addEventListener('click', function(){
      const id = $('planning-saved-select')?.value;
      if (!id) return;
      try {
        const plans = JSON.parse(localStorage.getItem('ethio-calendar-plans-v1') || '[]');
        const plan = plans.find(item => String(item.id) === String(id));
        if (plan && plan.periodMode === 'date-range' && plan.endDate) {
          $('planning-end-year').value = plan.endDate.ey;
          $('planning-end-month').value = plan.endDate.em;
          $('planning-end-day').value = plan.endDate.ed;
          $('planning-period-unit').value = 'custom';
          toggle();
        }
      } catch (_) {
      }
    }, true);
  }

  function bindClear(){
    const clear = $('planning-clear');
    if (!clear || clear.dataset.customPeriodClearBound) return;
    clear.dataset.customPeriodClearBound = '1';
    clear.addEventListener('click', resetCustomEndToStart, true);
  }

  function watchLanguage(){
    let last = localStorage.getItem('lang');
    setInterval(() => {
      const current = localStorage.getItem('lang');
      if (current === last) return;
      last = current;
      refreshLocalizedControls();
    }, 250);
  }

  function start(){
    if (!wrapGenerator()) return;
    if (!addCustomOption()) {
      setTimeout(start, 100);
      return;
    }
    restoreSavedEnd();
    bindClear();
    watchLanguage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
