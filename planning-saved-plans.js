(function(){
  'use strict';

  const STORAGE_KEY = 'ethio-calendar-plans-v1';
  const $ = id => document.getElementById(id);
  const text = {
    am: { title:'የተቀመጡ ዕቅዶች', choose:'የተቀመጠ ዕቅድ ይምረጡ', load:'ዕቅዱን ጫን', remove:'ዕቅዱን ሰርዝ', empty:'የተቀመጠ ዕቅድ የለም።', loaded:'ዕቅዱ ተጭኗል።', deleted:'ዕቅዱ ተሰርዟል።', confirm:'ይህን ዕቅድ ሰርዘው?' },
    en: { title:'Saved plans', choose:'Select a saved plan', load:'Load plan', remove:'Delete plan', empty:'No saved plans.', loaded:'Plan loaded.', deleted:'Plan deleted.', confirm:'Delete this plan?' },
    om: { title:'Karoora olkaa’aman', choose:'Karoora olkaa’ame filadhu', load:'Karoora fe’i', remove:'Karoora haqi', empty:'Karoora olkaa’ame hin jiru.', loaded:'Karooraan fe’ame.', deleted:'Karooraan haqame.', confirm:'Karoora kana haqdaa?' },
    ti: { title:'ዝተቐመጡ መደባት', choose:'ዝተቐመጠ መደብ ምረጽ', load:'መደብ ኣልዕል', remove:'መደብ ሰርዝ', empty:'ዝተቐመጠ መደብ የለን።', loaded:'መደብ ተላዒሉ።', deleted:'መደብ ተሰሪዙ።', confirm:'ነዚ መደብ ሰሪዝካዮ?' },
    so: { title:'Qorshayaasha kaydsan', choose:'Dooro qorshe kaydsan', load:'Soo geli qorshaha', remove:'Tirtir qorshaha', empty:'Qorshe kaydsan ma jiro.', loaded:'Qorshaha waa la soo geliyay.', deleted:'Qorshaha waa la tirtiray.', confirm:'Ma tirtirtaa qorshahan?' }
  };

  function lang(){
    let value = 'am';
    try { value = localStorage.getItem('lang') || document.documentElement.lang || 'am'; } catch (_) {}
    return text[value] ? value : 'am';
  }

  function t(key){ return text[lang()][key] || text.en[key] || key; }

  function relabelSaved(){
    const box = $('planning-saved-plans');
    if (!box) return;
    const heading = box.querySelector('#planning-saved-title');
    const label = box.querySelector('label');
    if (heading) heading.textContent = t('title');
    if (label) label.textContent = t('choose');
    const btnLoad = $('planning-load-saved');
    const btnDel = $('planning-delete-saved');
    if (btnLoad) btnLoad.textContent = t('load');
    if (btnDel) btnDel.textContent = t('remove');
    refresh();
  }

  function getPlans(){
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function setPlans(value){ localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); }

  function dateKey(date){
    if (!date) return '';
    return String(date.ey) + '-' + String(date.em).padStart(2, '0') + '-' + String(date.ed).padStart(2, '0');
  }

  function inject(){
    const planner = $('tab-planning');
    if (!planner || $('planning-saved-plans')) return false;

    const box = document.createElement('section');
    box.id = 'planning-saved-plans';
    box.className = 'planning-saved-plans card';
    box.setAttribute('aria-labelledby', 'planning-saved-title');
    box.innerHTML = '<h3 id="planning-saved-title"></h3>' +
      '<div class="form-group"><label for="planning-saved-select"></label><select id="planning-saved-select"></select></div>' +
      '<div class="planning-actions"><button type="button" id="planning-load-saved" class="btn-primary"></button><button type="button" id="planning-delete-saved" class="btn-secondary"></button></div>' +
      '<div id="planning-saved-status" role="status" aria-live="polite"></div>';

    const heading = box.querySelector('#planning-saved-title');
    const label = box.querySelector('label');
    heading.textContent = t('title');
    label.textContent = t('choose');
    planner.appendChild(box);

    $('planning-load-saved').textContent = t('load');
    $('planning-delete-saved').textContent = t('remove');
    refresh();
    $('planning-load-saved').addEventListener('click', loadSelected);
    $('planning-delete-saved').addEventListener('click', deleteSelected);
    return true;
  }

  function refresh(){
    const select = $('planning-saved-select');
    if (!select) return;
    const current = select.value;
    select.replaceChildren();
    const list = getPlans().slice().sort((a,b) => String(a.name || '').localeCompare(String(b.name || '')));
    if (!list.length) {
      select.add(new Option(t('empty'), ''));
      return;
    }
    list.forEach(plan => {
      const name = plan.name || 'Ethiopian Plan';
      const date = plan.start ? dateKey(plan.start) : '';
      const count = Array.isArray(plan.rows) ? plan.rows.length : 0;
      const suffix = date ? ' — ' + date : '';
      const countText = count ? ' (' + count + ')' : '';
      select.add(new Option(name + suffix + countText, plan.id || ''));
    });
    if ([...select.options].some(option => option.value === current)) select.value = current;
  }

  function loadSelected(){
    const select = $('planning-saved-select');
    const status = $('planning-saved-status');
    const id = select ? select.value : '';
    if (!id) { if (status) status.textContent = t('empty'); return; }
    const plan = getPlans().find(item => String(item.id) === String(id));
    if (!plan) return;

    // The saved plan already has fully-formed rows (title/details/status/
    // season for each date), so hand it straight to the planning tab's own
    // loader rather than re-generating the schedule from the form fields —
    // that would rebuild empty rows and lose everything the user filled in.
    if (typeof window.__planningLoadPlan === 'function') {
      window.__planningLoadPlan(plan);
    }

    if (status) status.textContent = t('loaded');
  }

  function deleteSelected(){
    const select = $('planning-saved-select');
    const status = $('planning-saved-status');
    const id = select ? select.value : '';
    if (!id) { if (status) status.textContent = t('empty'); return; }
    if (!window.confirm(t('confirm'))) return;
    setPlans(getPlans().filter(plan => String(plan.id) !== String(id)));
    refresh();
    if (status) status.textContent = t('deleted');
  }

  function start(){
    if (!inject()) {
      setTimeout(start, 100);
      return;
    }
    let lastSnapshot = '';
    const sync = function(){
      let snapshot = '';
      try { snapshot = localStorage.getItem(STORAGE_KEY) || ''; } catch (_) {}
      if (snapshot !== lastSnapshot) {
        lastSnapshot = snapshot;
        refresh();
      }
    };
    try { lastSnapshot = localStorage.getItem(STORAGE_KEY) || ''; } catch (_) {}
    window.addEventListener('storage', function(event){
      if (event.key === STORAGE_KEY) refresh();
      if (event.key === 'lang') relabelSaved();
    });
    window.addEventListener('planning-saved', refresh);
    window.setInterval(sync, 250);
    let lastLang = localStorage.getItem('lang');
    window.setInterval(function(){
      const curLang = localStorage.getItem('lang') || document.documentElement.lang;
      if (curLang !== lastLang) {
        lastLang = curLang;
        relabelSaved();
      }
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
