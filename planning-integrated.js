(function(){'use strict';
const S={
am:{nav:'ዕቅድ',title:'የዕቅድ አዘጋጅ',desc:'የመጀመሪያ ቀን፣ የዕቅዱን ጊዜ፣ የመሙያ ክፍተት እና የወቅት ምርጫ ያዘጋጁ።',name:'የዕቅድ ስም',year:'ዓመት',month:'ወር',day:'ቀን',period:'የዕቅዱ ጊዜ',every:'በየ',generate:'ዕቅድ አስላ',save:'አስቀምጥ',clear:'አጽዳ',schedule:'የዕቅድ ቀናት',item:'የዕቅድ ነገር',details:'ዝርዝር',status:'ሁኔታ',planned:'ታቅዷል',progress:'በሂደት',done:'ተጠናቋል',skipped:'ተዘለለ',none:'ቅድሚያ ዕቅድ ያስሉ።',seasonFamily:'የወቅት ቤተሰብ',season:'ወቅት',all:'ሁሉም ቀናት',climatic:'የአየር ወቅት',fasting:'የጾም ወቅት',liturgical:'የቤተክርስቲያን ዘመን',lent:'የዐቢይ ጾም ሳምንት',seasonInfo:'የተመረጠው ወቅት በዚህ PWA ውስጥ ከሚጠቀሙት የቀን ስሌቶች ጋር በመመሳሰል ይሰላል።',climSeason:'የአየር ወቅት',fastSeason:'የጾም ወቅት',litSeason:'የቤ/ክ ዘመን',lentWeek:'የዐቢይ ጾም ሳምንት',dayUnit:'ቀን',weekUnit:'ሳምንት',monthUnit:'ወር',yearUnit:'ዓመት'},
en:{nav:'Planning',title:'Planning',desc:'Choose a start date, planning period, filling interval and optional season filter.',name:'Plan name',year:'Year',month:'Month',day:'Day',period:'Planning period',every:'Every',generate:'Generate schedule',save:'Save plan',clear:'Clear',schedule:'Planning dates',item:'Planning item',details:'Details',status:'Status',planned:'Planned',progress:'In progress',done:'Done',skipped:'Skipped',none:'Generate a plan first.',seasonFamily:'Season family',season:'Season',all:'All dates',climatic:'Climatic season',fasting:'Fasting season',liturgical:'Liturgical season',lent:'Great Lent named week',seasonInfo:'The selected season is calculated with the same season rules used by this PWA.',climSeason:'Climatic',fastSeason:'Fasting',litSeason:'Liturgical',lentWeek:'Great Lent',dayUnit:'day(s)',weekUnit:'week(s)',monthUnit:'month(s)',yearUnit:'year(s)'},
om:{nav:'Karoora',title:'Karoora',desc:'Guyyaa jalqabaa, yeroo karooraa, yeroo guutuu fi filannoo waqtii.',name:'Maqaa karooraa',year:'Waggaa',month:"Ji'a",day:'Guyyaa',period:'Yeroo karooraa',every:'Hunda',generate:'Karoora uumi',save:"Karoora kaa'i",clear:'Haqi',schedule:'Guyyoota karooraa',item:'Waan karooraa',details:"Bal'ina",status:'Haala',planned:'Karoorfame',progress:'Adeemsa irra',done:'Xumurame',skipped:'Darbitame',none:'Jalqaba karoora uumi.',seasonFamily:'Gosa waqtii',season:'Waqtii',all:'Guyyoota hunda',climatic:'Waqtii qilleensaa',fasting:'Waqtii soomaa',liturgical:'Waqtii mana kiristaanaa',lent:'Torban sooma guddaa',seasonInfo:"Waqtiin filatame seera herregaa PWA kanaatiin shallagama.",climSeason:'Qilleensa',fastSeason:'Sooma',litSeason:'Kiristaanaa',lentWeek:'Sooma Guddaa',dayUnit:'Guyyaa',weekUnit:'Torban',monthUnit:"Ji'a",yearUnit:'Waggaa'},
ti:{nav:'መደብ',title:'መደብ ኣውጽእ',desc:'መጀመርታ ዕለት፣ ግዜ መደብ፣ ክፍተትን ወቕትን ምረጽ።',name:'ስም መደብ',year:'ዓመት',month:'ወርሒ',day:'መዓልቲ',period:'ግዜ መደብ',every:'ኩሉ',generate:'መደብ ኣውጽእ',save:'መደብ ዓቅብ',clear:'ኣጽርይ',schedule:'ዕለታት መደብ',item:'ነገር መደብ',details:'ዝርዝር',status:'ኩነታት',planned:'ተመዲቡ',progress:'ኣብ ሂደት',done:'ተዛዚሙ',skipped:'ተሓሊፉ',none:'ቅድሚያ መደብ ኣውጽእ።',seasonFamily:'ዓይነት ወቕቲ',season:'ወቕቲ',all:'ኩሎም ዕለታት',climatic:'ወቕቲ ኣየር',fasting:'ወቕቲ ጾም',liturgical:'ዘመነ ቤተክርስቲያን',lent:'ሰሙን ዓቢይ ጾም',seasonInfo:'ዝተመርጸ ወቕቲ ብተመሳሳሊ ሕጊ ናይዚ PWA ይሕሰብ።',climSeason:'ኣየር',fastSeason:'ጾም',litSeason:'ቤ/ክ ዘመን',lentWeek:'ዓቢይ ጾም',dayUnit:'መዓልቲ',weekUnit:'ሰሙን',monthUnit:'ወርሒ',yearUnit:'ዓመት'},
so:{nav:'Qorshe',title:'Qorshayn',desc:'Dooro taariikhda bilowga, muddada, kala-duwanaanta iyo xilli ikhtiyaari ah.',name:'Magaca qorshaha',year:'Sannad',month:'Bil',day:'Maalin',period:'Muddada qorshaha',every:'Mar kasta',generate:'Samee jadwal',save:'Kaydi qorshaha',clear:'Nadiifi',schedule:'Maalmaha qorshaha',item:'Shayga qorshaha',details:'Faahfaahin',status:'Xaalad',planned:'La qorsheeyay',progress:'Socda',done:'La dhammeeyay',skipped:'La booday',none:'Marka hore samee qorshe.',seasonFamily:'Qoyska xilliga',season:'Xilli',all:'Dhammaan maalmaha',climatic:'Xilliga cimilada',fasting:'Xilliga soonka',liturgical:'Xilliga kaniisadda',lent:'Toddobaadka Soonka Weyn',seasonInfo:'Xilliga la doortay waxaa lagu xisaabinayaa xeerarka jadwalka ee PWA-kan.',climSeason:'Cimilada',fastSeason:'Soonka',litSeason:'Kaniisadda',lentWeek:'Soonka Weyn',dayUnit:'Maalin',weekUnit:'Toddobaad',monthUnit:'Bil',yearUnit:'Sannad'}
};
const U={day:'day(s)',week:'week(s)',month:'month(s)',year:'year(s)'},$=id=>document.getElementById(id),t=k=>((S[localStorage.getItem('lang')||document.documentElement.lang]||S.am)[k]||S.en[k]||k);let plan=null;
window.__planningTranslate=t;
function today(){const d=new Date(),e=window.jdnToEthiopian(window.gregorianToJdn(d.getFullYear(),d.getMonth()+1,d.getDate()));return e;}
function setToday(){const e=today();$('planning-year').value=e.ey;$('planning-month').value=e.em;$('planning-day').value=e.ed;}
function fillSeasons(){
  const cat=$('planning-season-family').value,sel=$('planning-season'),grp=$('planning-season-choice-group');
  sel.replaceChildren();
  if(cat==='all'){
    if(grp)grp.hidden=true;
    sel.disabled=false;
    let o=new Option(t('all'),'all');
    sel.add(o);
    $('planning-season-info').textContent=t('seasonInfo');
    return;
  }
  if(grp)grp.hidden=false;
  sel.disabled=false;
  (window.EthioPlanner.getSeasonCatalog()[cat]||[]).forEach(x=>sel.add(new Option(x.label,x.id)));
  $('planning-season-info').textContent=t('seasonInfo');
}
function init(){if(!window.EthioPlanner||$('navbtn-planning'))return;const nav=document.querySelector('nav[role="tablist"]'),main=$('main-content');if(!nav||!main)return;const b=document.createElement('button');Object.assign(b,{type:'button',id:'navbtn-planning',className:'nav-btn'});b.setAttribute('role','tab');b.setAttribute('aria-selected','false');b.setAttribute('aria-controls','tab-planning');b.dataset.target='tab-planning';b.textContent=t('nav');nav.appendChild(b);const sec=document.createElement('section');sec.id='tab-planning';sec.className='tab-content';sec.hidden=true;sec.setAttribute('role','tabpanel');sec.setAttribute('aria-labelledby','navbtn-planning');sec.innerHTML='<div class="card planning-card"><h2>'+t('title')+'</h2><p>'+t('desc')+'</p><form id="planning-form-integrated"><div class="form-group"><label for="planning-name">'+t('name')+'</label><input id="planning-name" required maxlength="120" value="My Ethiopian Plan"></div><div class="form-row"><div class="form-group"><label for="planning-year">'+t('year')+'</label><input id="planning-year" type="number" min="1" required></div><div class="form-group"><label for="planning-month">'+t('month')+'</label><input id="planning-month" type="number" min="1" max="13" required></div><div class="form-group"><label for="planning-day">'+t('day')+'</label><input id="planning-day" type="number" min="1" max="30" required></div></div><div class="form-row"><div class="form-group"><label for="planning-period-value">'+t('period')+'</label><input id="planning-period-value" type="number" min="1" value="1" required></div><div class="form-group"><label for="planning-period-unit" class="visually-hidden">'+t('period')+'</label><select id="planning-period-unit"><option value="day">'+t('dayUnit')+'</option><option value="week">'+t('weekUnit')+'</option><option value="month" selected>'+t('monthUnit')+'</option><option value="year">'+t('yearUnit')+'</option></select></div><div class="form-group"><label for="planning-interval-value">'+t('every')+'</label><input id="planning-interval-value" type="number" min="1" value="1" required></div><div class="form-group"><label for="planning-interval-unit" class="visually-hidden">'+t('every')+'</label><select id="planning-interval-unit"><option value="day">'+t('dayUnit')+'</option><option value="week">'+t('weekUnit')+'</option><option value="month">'+t('monthUnit')+'</option><option value="year">'+t('yearUnit')+'</option></select></div></div><fieldset class="planning-season-fieldset"><legend id="planning-season-family-legend">'+t('seasonFamily')+'</legend><div class="form-row"><div class="form-group"><label for="planning-season-family">'+t('seasonFamily')+'</label><select id="planning-season-family"><option value="all">'+t('all')+'</option><option value="climatic">'+t('climatic')+'</option><option value="fasting">'+t('fasting')+'</option><option value="liturgical">'+t('liturgical')+'</option><option value="lent-week">'+t('lent')+'</option></select></div><div class="form-group" id="planning-season-choice-group" hidden><label for="planning-season">'+t('season')+'</label><select id="planning-season" aria-label="'+t('season')+'"><option value="all">'+t('all')+'</option></select></div></div><div id="planning-season-info" class="planning-info" role="status" aria-live="polite"></div></fieldset><div class="planning-actions"><button class="btn-primary" type="submit" id="planning-generate-btn">'+t('generate')+'</button><button class="btn-secondary" id="planning-clear" type="button">'+t('clear')+'</button></div></form><div id="planning-status-integrated" role="status" aria-live="polite"></div><h3 id="planning-schedule-heading">'+t('schedule')+'</h3><div id="planning-schedule-integrated" class="planning-table-wrap"></div><div class="planning-actions"><button id="planning-save" class="btn-primary" type="button">'+t('save')+'</button><button type="button" data-px="csv">CSV</button><button type="button" data-px="tsv">TSV</button><button type="button" data-px="json">JSON</button><button type="button" data-px="md">Markdown</button><button type="button" data-px="html">HTML</button></div></div>';main.appendChild(sec);setToday();fillSeasons();bind();}
function bind(){$('planning-season-family').addEventListener('change',fillSeasons);$('planning-form-integrated').addEventListener('submit',e=>{e.preventDefault();try{plan=EthioPlanner.generateSchedule({start:{ey:+$('planning-year').value,em:+$('planning-month').value,ed:+$('planning-day').value},periodValue:+$('planning-period-value').value,periodUnit:$('planning-period-unit').value,intervalValue:+$('planning-interval-value').value,intervalUnit:$('planning-interval-unit').value,seasonCategory:$('planning-season-family').value,seasonId:$('planning-season').value});plan.name=$('planning-name').value.trim()||'Ethiopian Plan';render();$('planning-status-integrated').textContent=t('schedule')+': '+plan.rows.length;}catch(x){$('planning-status-integrated').textContent=x.message;}});$('planning-save').onclick=save;$('planning-clear').onclick=()=>{plan=null;setToday();$('planning-season-family').value='all';fillSeasons();$('planning-schedule-integrated').replaceChildren();$('planning-status-integrated').textContent='';};document.querySelectorAll('[data-px]').forEach(x=>x.onclick=()=>{if(!plan){$('planning-status-integrated').textContent=t('none');return;}save();EthioPlanner.downloadPlan(plan,x.dataset.px);});$('navbtn-planning').onclick=activate;}
function activate(){document.querySelectorAll('.tab-content').forEach(x=>{x.hidden=true;x.classList.remove('active');});document.querySelectorAll('.nav-btn').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});$('tab-planning').hidden=false;$('tab-planning').classList.add('active');$('navbtn-planning').classList.add('active');$('navbtn-planning').setAttribute('aria-selected','true');$('main-content').focus();}
function render(){const w=$('planning-schedule-integrated'),table=document.createElement('table');table.className='planning-table';table.innerHTML='<caption class="visually-hidden">'+t('schedule')+'</caption><thead><tr><th scope="col">'+t('day')+'</th><th scope="col">'+t('climSeason')+'</th><th scope="col">'+t('fastSeason')+'</th><th scope="col">'+t('litSeason')+'</th><th scope="col">'+t('lentWeek')+'</th><th scope="col">'+t('item')+'</th><th scope="col">'+t('details')+'</th><th scope="col">'+t('status')+'</th></tr></thead><tbody></tbody>';const body=table.querySelector('tbody');plan.rows.forEach((r,i)=>{const date=EthioPlanner.dateLabel(r.date),tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=date;const mk=(tag,label,val)=>{const x=document.createElement(tag);x.value=val||'';x.setAttribute('aria-label',label+' '+date);return x;};const a=mk('input',t('item'),r.title),c=mk('textarea',t('details'),r.details);c.rows=2;const s=mk('select',t('status'),r.status);[['planned','planned'],['in-progress','progress'],['done','done'],['skipped','skipped']].forEach(([v,k])=>{const o=document.createElement('option');o.value=v;o.textContent=t(k);s.appendChild(o);});s.value=r.status||'planned';a.oninput=()=>r.title=a.value;c.oninput=()=>r.details=c.value;s.onchange=()=>r.status=s.value;const td=(x)=>{const z=document.createElement('td');z.appendChild(x);return z};const text=(v)=>{const z=document.createElement('td');z.textContent=v||'';return z};tr.append(th,text(r.season?.climatic),text(r.season?.fasting),text(r.season?.liturgical),text(r.season?.greatLentWeek),td(a),td(c),td(s));body.appendChild(tr);});w.replaceChildren(table);}
function save(){if(!plan)return;plan.name=$('planning-name').value.trim()||'Ethiopian Plan';plan.id=plan.id||Date.now().toString(36);EthioPlanner.savePlan(plan);$('planning-status-integrated').textContent=t('save');}

/* ── Multilingual label refresh ─────────────────────────────────────────── */
/* Called whenever the user changes the app language so that ALL static text  */
/* labels injected by init() are updated without re-injecting the whole tab.  */
function relabel(){
    const btn=$('navbtn-planning');if(btn)btn.textContent=t('nav');
    const tab=$('tab-planning');if(!tab)return;
    // Card heading & description
    const h2=tab.querySelector('.planning-card>h2');if(h2)h2.textContent=t('title');
    const desc=tab.querySelector('.planning-card>p');if(desc)desc.textContent=t('desc');
    // Form labels (matched by their `for` attribute)
    const lbl=(forId,key)=>{const el=tab.querySelector('label[for="'+forId+'"]');if(el)el.textContent=t(key);};
    lbl('planning-name','name');
    lbl('planning-year','year');
    lbl('planning-month','month');
    lbl('planning-day','day');
    lbl('planning-period-value','period');
    lbl('planning-interval-value','every');
    lbl('planning-season-family','seasonFamily');
    lbl('planning-season','season');
    // Fieldset legend for season section
    const leg=tab.querySelector('.planning-season-fieldset legend');if(leg)leg.textContent=t('seasonFamily');
    // Buttons
    const gen=$('planning-generate-btn');if(gen)gen.textContent=t('generate');
    const clr=$('planning-clear');if(clr)clr.textContent=t('clear');
    const sv=$('planning-save');if(sv)sv.textContent=t('save');
    // Schedule heading (h3)
    const h3=$('planning-schedule-heading');if(h3)h3.textContent=t('schedule');
    // Season dropdown options
    const famSel=$('planning-season-family');
    if(famSel){
        const optMap={'all':'all','climatic':'climatic','fasting':'fasting','liturgical':'liturgical','lent-week':'lent'};
        [...famSel.options].forEach(o=>{const key=optMap[o.value];if(key)o.textContent=t(key);});
    }
    // Repopulate the sub-season dropdown and info text
    fillSeasons();
    // Re-render table headers if a plan is visible (preserves user data)
    if(plan&&$('planning-schedule-integrated').querySelector('table')){render();}
}

/* Listen for language changes: the app writes `lang` to localStorage on change. */
window.addEventListener('storage',function(e){if(e.key==='lang')relabel();});
/* Also handle same-tab changes via a polling fallback (same-tab storage events  */
/* are not fired in the tab that made the change in some browsers).              */
(function(){let _last=localStorage.getItem('lang');setInterval(function(){const cur=localStorage.getItem('lang');if(cur!==_last){_last=cur;relabel();}},250);})();

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();