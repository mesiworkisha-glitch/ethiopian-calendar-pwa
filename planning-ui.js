/* Main-app integration for Ethiopian Calendar Planning. */
(function () {
    'use strict';

    const STRINGS = {
        am: {
            nav: 'ዕቅድ', title: 'የዕቅድ አዘጋጅ', desc: 'የመጀመሪያ ቀን፣ የዕቅዱን ጊዜ እና የመሙያ ክፍተት ይምረጡ።', name: 'የዕቅድ ስም', year: 'ዓመት', month: 'ወር', day: 'ቀን', period: 'የዕቅድ ጊዜ', interval: 'በየ', generate: 'ዕቅድ አስላ', save: 'አስቀምጥ', clear: 'አጽዳ', schedule: 'የዕቅድ ቀናት', item: 'የዕቅድ ነገር', details: 'ዝርዝር', status: 'ሁኔታ', planned: 'ታቅዷል', progress: 'በሂደት', done: 'ተጠናቋል', skipped: 'ተዘለለ', export: 'አውርድ', noPlan: 'እባክዎ መጀመሪያ ዕቅድ ያስሉ።', saved: 'ዕቅዱ ተቀምጧል።', generated: 'የዕቅድ ቀናት ተሰልተዋል።', dayUnit: 'ቀን', weekUnit: 'ሳምንት', monthUnit: 'ወር', yearUnit: 'ዓመት'
        },
        en: {
            nav: 'Planning', title: 'Planning', desc: 'Choose a start date, planning period, and filling interval.', name: 'Plan name', year: 'Year', month: 'Month', day: 'Day', period: 'Planning period', interval: 'Every', generate: 'Generate schedule', save: 'Save plan', clear: 'Clear', schedule: 'Planning dates', item: 'Planning item', details: 'Details', status: 'Status', planned: 'Planned', progress: 'In progress', done: 'Done', skipped: 'Skipped', export: 'Export', noPlan: 'Generate a plan first.', saved: 'Plan saved.', generated: 'Schedule generated.', dayUnit: 'day(s)', weekUnit: 'week(s)', monthUnit: 'month(s)', yearUnit: 'year(s)'
        },
        om: { nav:'Karoora', title:'Karoora', desc:'Guyyaa jalqabaa, yeroo karooraa fi addaan fageenya guutuu filadhu.', name:'Maqaa karooraa', year:'Waggaa', month:'Ji’a', day:'Guyyaa', period:'Yeroo karooraa', interval:'Hunda', generate:'Sagantaa uumi', save:'Karoora olkaa’i', clear:'Haqi', schedule:'Guyyoota karooraa', item:'Wanta karooraa', details:'Bal’ina', status:'Haala', planned:'Karoorfame', progress:'Adeemsa irra', done:'Xumurame', skipped:'Darbi', export:'Buusi', noPlan:'Jalqaba karoora uumi.', saved:'Karooraan olkaa’ame.', generated:'Guyyoonni karooraa shallagaman.', dayUnit:'guyyaa', weekUnit:'torban', monthUnit:'ji’a', yearUnit:'waggaa' },
        ti: { nav:'መደብ', title:'መደብ ኣዳላዊ', desc:'መጀመርታ ዕለት፣ ግዜ መደብን ናይ ምምላእ ክፍተትን ምረጽ።', name:'ስም መደብ', year:'ዓመት', month:'ወርሒ', day:'ዕለት', period:'ግዜ መደብ', interval:'ኩሉ', generate:'መደብ ፍጠር', save:'መደብ ኣቐምጥ', clear:'ኣጽርይ', schedule:'ዕለታት መደብ', item:'ነገር መደብ', details:'ዝርዝር', status:'ኩነታት', planned:'ተመዲቡ', progress:'ኣብ ሂደት', done:'ተወዲኡ', skipped:'ተሓሊፉ', export:'ኣውርድ', noPlan:'ቅድሚኡ መደብ ፍጠር።', saved:'መደብ ተቐሚጡ።', generated:'ዕለታት መደብ ተሰሊኦም።', dayUnit:'ዕለት', weekUnit:'ሰሙን', monthUnit:'ወርሒ', yearUnit:'ዓመት' },
        so: { nav:'Qorsheyn', title:'Qorsheyn', desc:'Dooro taariikhda bilowga, muddada qorshaha iyo inta u dhexeysa.', name:'Magaca qorshaha', year:'Sannad', month:'Bil', day:'Maalin', period:'Muddada qorshaha', interval:'Laba jeer', generate:'Samee jadwal', save:'Kaydi qorshaha', clear:'Nadiifi', schedule:'Maalmaha qorshaha', item:'Hawsha qorshaha', details:'Faahfaahin', status:'Xaalad', planned:'La qorsheeyay', progress:'Socda', done:'Dhammaatay', skipped:'La dhaafay', export:'Soo dejiso', noPlan:'Marka hore samee qorshe.', saved:'Qorshaha waa la kaydiyay.', generated:'Maalmaha qorshaha waa la xisaabiyay.', dayUnit:'maalmo', weekUnit:'toddobaadyo', monthUnit:'bilo', yearUnit:'sano' }
    };

    const lang = () => {
        try { return localStorage.getItem('lang') || document.documentElement.lang || 'am'; } catch (_) { return 'am'; }
    };
    const t = key => (STRINGS[lang()] || STRINGS.am)[key] || STRINGS.en[key] || key;
    const $ = id => document.getElementById(id);

    function inject() {
        const nav = document.querySelector('nav[role="tablist"]');
        const main = document.querySelector('main#main-content');
        if (!nav || !main || !window.EthioPlanner || $('navbtn-planning')) return;

        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'nav-btn'; btn.role = 'tab'; btn.id = 'navbtn-planning'; btn.dataset.target = 'tab-planning'; btn.setAttribute('aria-controls', 'tab-planning'); btn.setAttribute('aria-selected', 'false'); btn.textContent = t('nav');
        nav.appendChild(btn);

        const section = document.createElement('section');
        section.id = 'tab-planning'; section.className = 'tab-content'; section.role = 'tabpanel'; section.setAttribute('aria-labelledby', 'navbtn-planning'); section.hidden = true;
        section.innerHTML = `
          <div class="card planning-card">
            <h2>${t('title')}</h2><p>${t('desc')}</p>
            <form id="planning-form-integrated">
              <div class="form-group"><label for="planning-name">${t('name')}</label><input id="planning-name" maxlength="120" value="My Ethiopian Plan" required></div>
              <div class="form-row">
                <div class="form-group"><label for="planning-year">${t('year')}</label><input id="planning-year" type="number" min="1" required></div>
                <div class="form-group"><label for="planning-month">${t('month')}</label><input id="planning-month" type="number" min="1" max="13" required></div>
                <div class="form-group"><label for="planning-day">${t('day')}</label><input id="planning-day" type="number" min="1" max="30" required></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label for="planning-period-value">${t('period')}</label><input id="planning-period-value" type="number" min="1" value="1" required></div>
                <div class="form-group"><label for="planning-period-unit">&nbsp;</label><select id="planning-period-unit"><option value="day">${t('dayUnit')}</option><option value="week">${t('weekUnit')}</option><option value="month" selected>${t('monthUnit')}</option><option value="year">${t('yearUnit')}</option></select></div>
                <div class="form-group"><label for="planning-interval-value">${t('interval')}</label><input id="planning-interval-value" type="number" min="1" value="1" required></div>
                <div class="form-group"><label for="planning-interval-unit">&nbsp;</label><select id="planning-interval-unit"><option value="day" selected>${t('dayUnit')}</option><option value="week">${t('weekUnit')}</option><option value="month">${t('monthUnit')}</option><option value="year">${t('yearUnit')}</option></select></div>
              </div>
              <div class="planning-actions"><button type="submit" class="btn-primary">${t('generate')}</button><button type="button" id="planning-clear" class="btn-secondary">${t('clear')}</button></div>
            </form>
            <div id="planning-status-integrated" class="planning-status" role="status" aria-live="polite"></div>
            <h3>${t('schedule')}</h3><div id="planning-schedule-integrated" class="planning-table-wrap"></div>
            <div class="planning-actions planning-export-actions">
              <button type="button" data-planning-export="csv">CSV</button><button type="button" data-planning-export="tsv">TSV</button><button type="button" data-planning-export="json">JSON</button><button type="button" data-planning-export="md">Markdown</button><button type="button" data-planning-export="html">HTML</button><button type="button" id="planning-save" class="btn-primary">${t('save')}</button>
            </div>
          </div>`;
        main.appendChild(section);
        setToday(); bind();
    }

    function setToday() {
        const d = new Date(); const e = window.jdnToEthiopian(window.gregorianToJdn(d.getFullYear(), d.getMonth()+1, d.getDate()));
        $('planning-year').value=e.ey; $('planning-month').value=e.em; $('planning-day').value=e.ed;
    }

    let plan = null;
    function bind() {
        $('planning-form-integrated').addEventListener('submit', ev => { ev.preventDefault(); generate(); });
        $('planning-clear').addEventListener('click', () => { plan=null; setToday(); $('planning-schedule-integrated').replaceChildren(); $('planning-status-integrated').textContent=''; });
        $('planning-save').addEventListener('click', save);
        document.querySelectorAll('[data-planning-export]').forEach(b => b.addEventListener('click', () => { if (!plan) { $('planning-status-integrated').textContent=t('noPlan'); return; } save(); window.EthioPlanner.downloadPlan(plan,b.dataset.planningExport); }));
        $('navbtn-planning').addEventListener('click', () => activatePlanning());
    }
    function activatePlanning() {
        document.querySelectorAll('.tab-content').forEach(s => { s.hidden=true; s.classList.remove('active'); });
        document.querySelectorAll('.nav-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        $('tab-planning').hidden=false; $('tab-planning').classList.add('active'); $('navbtn-planning').classList.add('active'); $('navbtn-planning').setAttribute('aria-selected','true');
        $('main').focus?.();
    }
    function generate() {
        try {
            plan=window.EthioPlanner.generateSchedule({start:{ey:+$('planning-year').value,em:+$('planning-month').value,ed:+$('planning-day').value},periodValue:+$('planning-period-value').value,periodUnit:$('planning-period-unit').value,intervalValue:+$('planning-interval-value').value,intervalUnit:$('planning-interval-unit').value});
            plan.name=$('planning-name').value.trim() || 'Ethiopian Plan'; render(); $('planning-status-integrated').textContent=`${t('generated')} ${plan.rows.length}`;
        } catch (e) { $('planning-status-integrated').textContent=e.message; }
    }
    function render() {
        const wrap=$('planning-schedule-integrated'); if (!plan) return;
        const table=document.createElement('table'); table.className='planning-table';
        table.innerHTML=`<caption class="visually-hidden">${t('schedule')}</caption><thead><tr><th scope="col">${t('day')}</th><th scope="col">${t('item')}</th><th scope="col">${t('details')}</th><th scope="col">${t('status')}</th></tr></thead><tbody></tbody>`;
        const body=table.querySelector('tbody');
        plan.rows.forEach((r,i)=>{ const date=window.EthioPlanner.dateLabel(r.date); const tr=document.createElement('tr');
            const th=document.createElement('th'); th.scope='row'; th.textContent=date;
            const td1=document.createElement('td'); const inp=document.createElement('input'); inp.setAttribute('aria-label',`${t('item')} ${date}`); inp.value=r.title||''; inp.addEventListener('input',()=>r.title=inp.value); td1.appendChild(inp);
            const td2=document.createElement('td'); const ta=document.createElement('textarea'); ta.rows=2; ta.setAttribute('aria-label',`${t('details')} ${date}`); ta.value=r.details||''; ta.addEventListener('input',()=>r.details=ta.value); td2.appendChild(ta);
            const td3=document.createElement('td'); const sel=document.createElement('select'); sel.setAttribute('aria-label',`${t('status')} ${date}`); [['planned',t('planned')],['in-progress',t('progress')],['done',t('done')],['skipped',t('skipped')]].forEach(([v,l])=>{const o=document.createElement('option');o.value=v;o.textContent=l;sel.appendChild(o);});sel.value=r.status||'planned';sel.addEventListener('change',()=>r.status=sel.value);td3.appendChild(sel);
            tr.append(th,td1,td2,td3); body.appendChild(tr);
        }); wrap.replaceChildren(table);
    }
    function save() { if (!plan) { $('planning-status-integrated').textContent=t('noPlan'); return; } plan.name=$('planning-name').value.trim()||'Ethiopian Plan'; plan.id=plan.id||`${Date.now()}-${Math.random().toString(36).slice(2)}`; window.EthioPlanner.savePlan(plan); $('planning-status-integrated').textContent=t('saved'); }

    window.addEventListener('load', () => { if (window.EthioPlanner) inject(); });
    window.addEventListener('languageChanged', () => { /* preserve plan data; labels are refreshed on next page load */ });
})();
