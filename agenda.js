(function(){'use strict';
const S={
am:{nav:'አጀንዳ',title:'አጀንዳ',dashTitle:'የዕለቱ አጀንዳ',dashDesc:'ማንኛውንም የኢትዮጵያ ቀን ይምረጡ፤ ብሔራዊ በዓላት፣ ስንክሳር፣ ግጻዌ እና የወቅት መረጃ በአንድ ላይ ያሳያል።',year:'ዓመት',month:'ወር',day:'ቀን',show:'አሳይ',holidays:'በዓላት',synax:'ስንክሳር',gitsaweSection:'ግጻዌ',commemoration:'የዕለቱ መታሰቢያ',mesbak:'ምስባክ',gospel:'ወንጌል',seasonSection:'ወቅት',noHolidays:'በዚህ ቀን ምንም ብሔራዊ ወይም ሃይማኖታዊ በዓል የለም።',noSynax:'ለዚህ ቀን የስንክሳር መረጃ አልተገኘም።',noGitsawe:'ለዚህ ቀን የግጻዌ መረጃ አልተገኘም።',climatic:'የአየር ወቅት',fasting:'የጾም ወቅት',liturgical:'የቤ/ክ ዘመን',lentWeek:'የዐቢይ ጾም ሳምንት',taskListTitle:'የተግባር ዝርዝር',taskListDesc:'ከሁሉም የተቀመጡ ዕቅዶች የተውጣጣ በቀናት ቅደም ተከተል የተሰናዳ ዝርዝር።',showDone:'የተጠናቀቁና የተዘለሉትን አሳይ',overdue:'ያለፈ ጊዜው',todayGroup:'ዛሬ',upcoming:'መጪ',noPlans:'የተቀመጠ ዕቅድ የለም። በ«ዕቅድ» ትር ውስጥ ዕቅድ አዘጋጅተው ያስቀምጡ።',noTasks:'የሚታይ ተግባር የለም።',planned:'ታቅዷል',progress:'በሂደት',done:'ተጠናቋል',skipped:'ተዘለለ',refresh:'አድስ',loadErr:'መረጃውን መጫን አልተቻለም።'},
en:{nav:'Agenda',title:'Agenda',dashTitle:"Day's Agenda",dashDesc:'Pick any Ethiopian date to see national/religious holidays, Synaxarium, Gitsawe, and season info together.',year:'Year',month:'Month',day:'Day',show:'Show',holidays:'Holidays',synax:'Synaxarium',gitsaweSection:'Gitsawe',commemoration:"Day's commemoration",mesbak:'Mesbak',gospel:'Gospel',seasonSection:'Season',noHolidays:'No national or religious holiday on this date.',noSynax:'No Synaxarium entry found for this date.',noGitsawe:'No Gitsawe reading found for this date.',climatic:'Climatic season',fasting:'Fasting season',liturgical:'Liturgical season',lentWeek:'Great Lent week',taskListTitle:'Task List',taskListDesc:'A chronological list drawn from all of your saved plans.',showDone:'Show done and skipped',overdue:'Overdue',todayGroup:'Today',upcoming:'Upcoming',noPlans:'No saved plans yet. Create and save a plan in the "Planning" tab.',noTasks:'Nothing to show.',planned:'Planned',progress:'In progress',done:'Done',skipped:'Skipped',refresh:'Refresh',loadErr:'Could not load this information.'},
om:{nav:'Ajandaa',title:'Ajandaa',dashTitle:'Ajandaa Guyyaa',dashDesc:"Guyyaa Itoophiyaa kamiyyuu filadhu; ayyaanota biyyaalessaa/amantii, Sinkisaar, Gitsawe fi odeeffannoo waqtii walitti qabee ni argisiisa.",year:'Waggaa',month:"Ji'a",day:'Guyyaa',show:'Agarsiisi',holidays:'Ayyaanota',synax:'Sinkisaar',gitsaweSection:'Gitsawe',commemoration:'Yaadannoo guyyaa',mesbak:'Mesbaak',gospel:'Wangeela',seasonSection:'Waqtii',noHolidays:'Guyyaa kana ayyaanni biyyaalessaa ykn amantii hin jiru.',noSynax:'Guyyaa kanaaf odeeffannoon Sinkisaar hin argamne.',noGitsawe:'Guyyaa kanaaf dubbisni Gitsawe hin argamne.',climatic:'Waqtii qilleensaa',fasting:'Waqtii soomaa',liturgical:'Waqtii mana kiristaanaa',lentWeek:'Torban Sooma Guddaa',taskListTitle:'Tarreeffama Hojii',taskListDesc:"Tarree yeroo ittiin ergame kan karoorota kee kaa'aman hunda irraa fudhatame.",showDone:'Kan xumurame fi darbitame agarsiisi',overdue:"Yeroon isaa darbe",todayGroup:"Har'a",upcoming:'Dhufaa jiru',noPlans:"Karoorri kaa'ame hin jiru. Gabatee «Karoora» keessatti karoora uumii kaa'i.",noTasks:'Wanti agarsiisamu hin jiru.',planned:'Karoorfame',progress:'Adeemsa irra',done:'Xumurame',skipped:'Darbitame',refresh:'Haaromsi',loadErr:"Odeeffannoo kana fe'uun hin danda'amne."},
ti:{nav:'ኣጀንዳ',title:'ኣጀንዳ',dashTitle:'ናይ መዓልቲ ኣጀንዳ',dashDesc:'ዝኾነት ናይ ኢትዮጵያ ዕለት ምረጽ፤ ሃገራውን ሃይማኖታውን በዓላት፣ ስንክሳር፣ ግጻዌን ናይ ወቕቲ ሓበሬታን ብሓባር ዘርኢ።',year:'ዓመት',month:'ወርሒ',day:'መዓልቲ',show:'ኣርኢ',holidays:'በዓላት',synax:'ስንክሳር',gitsaweSection:'ግጻዌ',commemoration:'ናይ መዓልቲ መዘከርታ',mesbak:'ምስባክ',gospel:'ወንጌል',seasonSection:'ወቕቲ',noHolidays:'ኣብዚ መዓልቲ ሃገራዊ ወይ ሃይማኖታዊ በዓል የለን።',noSynax:'ንዚ መዓልቲ ሓበሬታ ስንክሳር ኣይተረኸበን።',noGitsawe:'ንዚ መዓልቲ ሓበሬታ ግጻዌ ኣይተረኸበን።',climatic:'ወቕቲ ኣየር',fasting:'ወቕቲ ጾም',liturgical:'ዘመነ ቤተክርስቲያን',lentWeek:'ሰሙን ዓቢይ ጾም',taskListTitle:'ዝርዝር ዕዮታት',taskListDesc:'ካብ ኩሎም እተዓቀቡ መደባት እተወስደ ብቕደም ሰዓት እተሰርዐ ዝርዝር።',showDone:'እተዛዘመን እተሓለፈን ኣርኢ',overdue:'ግዜኡ ዝሓለፈ',todayGroup:'ሎሚ',upcoming:'ዚመጽእ',noPlans:'እተዓቀበ መደብ የለን። ኣብ «መደብ» ትር መደብ ኣዳሉ ዓቅብ።',noTasks:'ዝርአ ዕዮ የለን።',planned:'ተመዲቡ',progress:'ኣብ ሂደት',done:'ተዛዚሙ',skipped:'ተሓሊፉ',refresh:'ኣሐድስ',loadErr:'እዚ ሓበሬታ ምጽዓን ኣይተኻእለን።'},
so:{nav:'Ajandada',title:'Ajandada',dashTitle:'Ajandada Maalinta',dashDesc:'Dooro taariikh Itoobiya ah oo kasta; wuxuu isku soo bandhigayaa ciidaha qaranka/diinta, Synaxarium, Gitsawe, iyo xogta xilliga.',year:'Sannad',month:'Bil',day:'Maalin',show:'Muuji',holidays:'Ciidaha',synax:'Synaxarium',gitsaweSection:'Gitsawe',commemoration:'Xusuusta maalinta',mesbak:'Mesbak',gospel:'Injiil',seasonSection:'Xilli',noHolidays:'Maalintan ciid qaran ama diineed ma jiro.',noSynax:'Maalintan xog Synaxarium ah lama helin.',noGitsawe:'Maalintan akhris Gitsawe ah lama helin.',climatic:'Xilliga cimilada',fasting:'Xilliga soonka',liturgical:'Xilliga kaniisadda',lentWeek:'Toddobaadka Soonka Weyn',taskListTitle:'Liiska Hawlaha',taskListDesc:'Liis taariikh ahaan u kala horreeya oo laga soo saaray dhammaan qorshayaashaada la kaydiyay.',showDone:'Muuji kuwa la dhammeeyay iyo la boodayba',overdue:'Wakhtigu dhaafay',todayGroup:'Maanta',upcoming:'Soo socda',noPlans:'Wali qorshe lama kaydin. Ku samee oo ku kaydi qorshe gabalka "Qorshe".',noTasks:'Wax la muujiyo ma jiro.',planned:'La qorsheeyay',progress:'Socda',done:'La dhammeeyay',skipped:'La booday',refresh:'Cusboonaysii',loadErr:'Xogtan lama soo rari karin.'}
};
const $=id=>document.getElementById(id),t=k=>((S[localStorage.getItem('lang')||document.documentElement.lang]||S.am)[k]||S.en[k]||k);
// Local copy of the Amharic month names, matching app.js's SYNAX_MONTH_NAMES_AM
// exactly — kept self-contained rather than referencing that array directly,
// since it's declared with `const` in app.js and this module has no reliable
// way to depend on another script's top-level const/let bindings.
const MONTH_NAMES_AM=["","መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];

function today(){const d=new Date();return window.jdnToEthiopian(window.gregorianToJdn(d.getFullYear(),d.getMonth()+1,d.getDate()));}
function formatDateDisplay(date){
  const monthName=(window.getMonths?window.getMonths():[])[date.em]||'',dayNum=window.fNum?window.fNum(date.ed):date.ed;
  let weekday='';
  try{weekday=window.getWeekdays()[window.ethToGregorian(date.ey,date.em,date.ed).getDay()]||'';}catch(e){}
  return weekday?`${weekday}፣ ${monthName} ${dayNum}`:`${monthName} ${dayNum}`;
}

async function showDashboard(){
  const out=$('agenda-dash-output');
  const ey=+$('agenda-year').value,em=+$('agenda-month').value,ed=+$('agenda-day').value;
  if(!ey||!em||em<1||em>13||!ed||ed<1||ed>30){out.innerHTML='<p class="load-error">⚠️ '+t('loadErr')+'</p>';return;}
  const mList=window.getMonths?window.getMonths():[],dayStr=window.fNum?window.fNum(ed):ed;
  let html='<h3>'+(mList[em]||'')+' '+dayStr+'</h3>';

  html+='<h4>'+t('holidays')+'</h4>';
  try{
    const targetJdn=window.ethiopianToJdn(ey,em,ed);
    const list=(window.getFdreHolidays?window.getFdreHolidays(ey):[]).filter(h=>window.gregorianToJdn(h.g.getFullYear(),h.g.getMonth()+1,h.g.getDate())===targetJdn);
    html+=list.length?('<ul>'+list.map(h=>'<li>'+h.n+'</li>').join('')+'</ul>'):('<p class="agenda-empty">'+t('noHolidays')+'</p>');
  }catch(e){html+='<p class="load-error">⚠️ '+t('loadErr')+'</p>';}

  html+='<h4>'+t('synax')+'</h4>';
  try{
    const data=await window.loadSynaxarium();
    const monthNameAm=MONTH_NAMES_AM[em];
    const entries=(data[monthNameAm]&&data[monthNameAm][ed])||[];
    html+=entries.length?('<ul>'+entries.map(e=>'<li>'+e+'</li>').join('')+'</ul>'):('<p class="agenda-empty">'+t('noSynax')+'</p>');
  }catch(e){html+='<p class="load-error">⚠️ '+t('loadErr')+'</p>';}

  html+='<h4>'+t('gitsaweSection')+'</h4>';
  try{
    if(window.EthioGitsawe){
      await window.EthioGitsawe.loadGitsawe();
      const reading=window.EthioGitsawe.getDayReading(em,ed);
      if(reading){
        let g='';
        if(reading.commemoration)g+='<p><strong>'+t('commemoration')+':</strong> '+window.escapeHtml(reading.commemoration)+'</p>';
        const morning=reading.services&&reading.services['ዘነግህ'];
        if(morning&&morning.ምስባክ)g+='<p>'+t('mesbak')+'፦ '+window.escapeHtml((morning.ምስባክ.book||'')+' '+(morning.ምስባክ.chapter_verse||''))+'</p>';
        if(morning&&morning.ወንጌል)g+='<p>'+t('gospel')+'፦ '+window.escapeHtml((morning.ወንጌል.book||'')+' '+(morning.ወንጌል.chapter_verse||''))+'</p>';
        html+=g||('<p class="agenda-empty">'+t('noGitsawe')+'</p>');
      }else html+='<p class="agenda-empty">'+t('noGitsawe')+'</p>';
    }else html+='<p class="agenda-empty">'+t('noGitsawe')+'</p>';
  }catch(e){html+='<p class="load-error">⚠️ '+t('loadErr')+'</p>';}

  html+='<h4>'+t('seasonSection')+'</h4>';
  try{
    if(window.EthioPlanner){
      const info=window.EthioPlanner.seasonInfoForDate({ey,em,ed});
      html+='<ul><li>'+t('climatic')+'፦ '+window.escapeHtml(info.climatic||'')+'</li><li>'+t('fasting')+'፦ '+window.escapeHtml(info.fasting||'')+'</li><li>'+t('liturgical')+'፦ '+window.escapeHtml(info.liturgical||'')+'</li>'+(info.greatLentWeek?('<li>'+t('lentWeek')+'፦ '+window.escapeHtml(info.greatLentWeek)+'</li>'):'')+'</ul>';
    }
  }catch(e){html+='<p class="load-error">⚠️ '+t('loadErr')+'</p>';}

  out.innerHTML=html;
}

function computeTaskBuckets(){
  const plans=(window.EthioPlanner&&window.EthioPlanner.loadPlans())||[];
  const todayE=today(),todayJdn=window.ethiopianToJdn(todayE.ey,todayE.em,todayE.ed);
  const showDone=$('agenda-show-done').checked;
  const items=[];
  plans.forEach(p=>{
    (p.rows||[]).forEach(r=>{
      if(!showDone&&(r.status==='done'||r.status==='skipped'))return;
      const jdn=window.ethiopianToJdn(r.date.ey,r.date.em,r.date.ed);
      items.push({planId:p.id,planName:p.name||'Ethiopian Plan',row:r,jdn});
    });
  });
  items.sort((a,b)=>a.jdn-b.jdn||a.planName.localeCompare(b.planName));
  return{
    plans,
    overdue:items.filter(i=>i.jdn<todayJdn),
    todayItems:items.filter(i=>i.jdn===todayJdn),
    upcoming:items.filter(i=>i.jdn>todayJdn)
  };
}

function renderTaskList(){
  const out=$('agenda-tasks-output');
  if(!out)return;
  const{plans,overdue,todayItems,upcoming}=computeTaskBuckets();
  if(!plans.length){out.innerHTML='<p class="agenda-empty">'+t('noPlans')+'</p>';return;}
  const statusOpts=(current)=>[['planned','planned'],['in-progress','progress'],['done','done'],['skipped','skipped']].map(([v,k])=>'<option value="'+v+'"'+(current===v?' selected':'')+'>'+t(k)+'</option>').join('');
  const group=(label,list)=>{
    let h='<h4>'+label+' ('+(window.fNum?window.fNum(list.length):list.length)+')</h4>';
    if(!list.length)return h+'<p class="agenda-empty">'+t('noTasks')+'</p>';
    h+='<ul class="agenda-task-list">'+list.map(it=>{
      const date=formatDateDisplay(it.row.date);
      return '<li class="agenda-task-item"><div class="agenda-task-meta"><span class="agenda-task-date">'+date+'</span> <span class="agenda-task-plan">'+window.escapeHtml(it.planName)+'</span></div>'+
        '<div class="agenda-task-body"><strong>'+window.escapeHtml(it.row.title||'')+'</strong>'+(it.row.details?(' — '+window.escapeHtml(it.row.details)):'')+'</div>'+
        '<select class="agenda-status-select" data-plan="'+window.escapeHtml(String(it.planId))+'" data-row="'+window.escapeHtml(String(it.row.id))+'" aria-label="'+window.escapeHtml(it.row.title||date)+'">'+statusOpts(it.row.status)+'</select></li>';
    }).join('')+'</ul>';
    return h;
  };
  out.innerHTML=group(t('overdue'),overdue)+group(t('todayGroup'),todayItems)+group(t('upcoming'),upcoming);
  out.querySelectorAll('.agenda-status-select').forEach(sel=>{
    sel.addEventListener('change',()=>{
      const plans=window.EthioPlanner.loadPlans();
      const plan=plans.find(p=>String(p.id)===sel.dataset.plan);
      if(!plan)return;
      const row=(plan.rows||[]).find(r=>String(r.id)===sel.dataset.row);
      if(!row)return;
      row.status=sel.value;
      window.EthioPlanner.savePlan(plan);
      renderTaskList();
    });
  });
}

function setDefaultDate(){const e=today();$('agenda-year').value=e.ey;$('agenda-month').value=e.em;$('agenda-day').value=e.ed;}

function bind(){
  $('agenda-dash-form').addEventListener('submit',e=>{e.preventDefault();showDashboard();});
  $('agenda-show-done').addEventListener('change',renderTaskList);
  $('agenda-refresh').addEventListener('click',renderTaskList);
  $('navbtn-agenda').onclick=activate;
}
function activate(){
  document.querySelectorAll('.tab-content').forEach(x=>{x.hidden=true;x.classList.remove('active');});
  document.querySelectorAll('.nav-btn').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});
  $('tab-agenda').hidden=false;$('tab-agenda').classList.add('active');
  $('navbtn-agenda').classList.add('active');$('navbtn-agenda').setAttribute('aria-selected','true');
  const main=$('main-content');if(main)main.focus();
  renderTaskList();
}

function relabel(){
  const tab=$('tab-agenda');
  if(!tab)return;
  const navBtn=$('navbtn-agenda');if(navBtn)navBtn.textContent=t('nav');
  const title=tab.querySelector('.agenda-title');if(title)title.textContent=t('title');
  const dashTitle=$('agenda-dash-title');if(dashTitle)dashTitle.textContent=t('dashTitle');
  const dashDesc=$('agenda-dash-desc');if(dashDesc)dashDesc.textContent=t('dashDesc');
  const lbl=(forId,key)=>{const l=tab.querySelector('label[for="'+forId+'"]');if(l)l.textContent=t(key);};
  lbl('agenda-year','year');lbl('agenda-month','month');lbl('agenda-day','day');
  const showBtn=$('agenda-show-btn');if(showBtn)showBtn.textContent=t('show');
  const taskTitle=$('agenda-tasks-title');if(taskTitle)taskTitle.textContent=t('taskListTitle');
  const taskDesc=$('agenda-tasks-desc');if(taskDesc)taskDesc.textContent=t('taskListDesc');
  const showDoneLbl=$('agenda-show-done-label');if(showDoneLbl)showDoneLbl.textContent=t('showDone');
  const refreshBtn=$('agenda-refresh');if(refreshBtn)refreshBtn.textContent=t('refresh');
  renderTaskList();
}

function init(){
  if(!window.EthioPlanner||$('navbtn-agenda'))return;
  const nav=document.querySelector('nav[role="tablist"]'),main=$('main-content');
  if(!nav||!main)return;
  const b=document.createElement('button');
  Object.assign(b,{type:'button',id:'navbtn-agenda',className:'nav-btn'});
  b.setAttribute('role','tab');b.setAttribute('aria-selected','false');b.setAttribute('aria-controls','tab-agenda');
  b.dataset.target='tab-agenda';b.textContent=t('nav');
  nav.appendChild(b);
  const sec=document.createElement('section');
  sec.id='tab-agenda';sec.className='tab-content';sec.hidden=true;
  sec.setAttribute('role','tabpanel');sec.setAttribute('aria-labelledby','navbtn-agenda');
  sec.innerHTML='<div class="card agenda-card"><h2 class="agenda-title">'+t('title')+'</h2>'+
    '<section class="agenda-section"><h3 id="agenda-dash-title">'+t('dashTitle')+'</h3><p id="agenda-dash-desc">'+t('dashDesc')+'</p>'+
    '<form id="agenda-dash-form"><div class="form-row">'+
    '<div class="form-group"><label for="agenda-year">'+t('year')+'</label><input id="agenda-year" type="number" min="1" required></div>'+
    '<div class="form-group"><label for="agenda-month">'+t('month')+'</label><input id="agenda-month" type="number" min="1" max="13" required></div>'+
    '<div class="form-group"><label for="agenda-day">'+t('day')+'</label><input id="agenda-day" type="number" min="1" max="30" required></div>'+
    '</div><button id="agenda-show-btn" class="btn-primary" type="submit">'+t('show')+'</button></form>'+
    '<div id="agenda-dash-output" class="agenda-dash-output" role="status" aria-live="polite"></div></section>'+
    '<section class="agenda-section"><h3 id="agenda-tasks-title">'+t('taskListTitle')+'</h3><p id="agenda-tasks-desc">'+t('taskListDesc')+'</p>'+
    '<div class="form-row planning-columns-row"><label><input type="checkbox" id="agenda-show-done"> <span id="agenda-show-done-label">'+t('showDone')+'</span></label>'+
    '<button id="agenda-refresh" class="btn-secondary" type="button">'+t('refresh')+'</button></div>'+
    '<div id="agenda-tasks-output" class="agenda-tasks-output"></div></section></div>';
  main.appendChild(sec);
  setDefaultDate();
  bind();
  renderTaskList();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.addEventListener('storage',function(e){if(e.key==='lang')relabel();});
(function(){let _last=localStorage.getItem('lang');setInterval(function(){const cur=localStorage.getItem('lang');if(cur!==_last){_last=cur;relabel();}},250);})();
})();
