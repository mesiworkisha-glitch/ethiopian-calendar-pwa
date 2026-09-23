(function(){'use strict';
const S={
am:{nav:'አጀንዳ',title:'አጀንዳ',dashTitle:'የዕለቱ አጀንዳ',dashDesc:'ማንኛውንም የኢትዮጵያ ቀን ይምረጡ፤ ብሔራዊ በዓላት፣ ስንክሳር፣ ግጻዌ እና የወቅት መረጃ በአንድ ላይ ያሳያል።',year:'ዓመት',month:'ወር',day:'ቀን',show:'አሳይ',holidays:'በዓላት',synax:'ስንክሳር',gitsaweSection:'ግጻዌ',commemoration:'የዕለቱ መታሰቢያ',mesbak:'ምስባክ',gospel:'ወንጌል',seasonSection:'ወቅት',noHolidays:'በዚህ ቀን ምንም ብሔራዊ ወይም ሃይማኖታዊ በዓል የለም።',noSynax:'ለዚህ ቀን የስንክሳር መረጃ አልተገኘም።',noGitsawe:'ለዚህ ቀን የግጻዌ መረጃ አልተገኘም።',climatic:'የአየር ወቅት',fasting:'የጾም ወቅት',liturgical:'የቤ/ክ ዘመን',lentWeek:'የዐቢይ ጾም ሳምንት',taskListTitle:'የተግባር ዝርዝር',taskListDesc:'ከሁሉም የተቀመጡ ዕቅዶች የተውጣጣ በቀናት ቅደም ተከተል የተሰናዳ ዝርዝር።',showDone:'የተጠናቀቁና የተዘለሉትን አሳይ',overdue:'ያለፈ ጊዜው',todayGroup:'ዛሬ',upcoming:'መጪ',noPlans:'የተቀመጠ ዕቅድ የለም። በ«ዕቅድ» ትር ውስጥ ዕቅድ አዘጋጅተው ያስቀምጡ።',noTasks:'የሚታይ ተግባር የለም።',planned:'ታቅዷል',progress:'በሂደት',done:'ተጠናቋል',skipped:'ተዘለለ',refresh:'አድስ',loadErr:'መረጃውን መጫን አልተቻለም።',eventsTitle:'የግል ክንውኖች',eventsDesc:'የራስዎን ክንውን ወይም አስታዋሽ ይጨምሩ፤ በተመረጠው ቀን ስር እና በተግባር ዝርዝር ውስጥ ይታያል።',addEvent:'ክንውን ጨምር',deleteEvent:'አጥፋ',noEvents:'ምንም የግል ክንውን የለም።',eventBadge:'ክንውን',eventTitleLabel:'የክንውኑ ስም',icalBtn:'iCal ወርድ',icalExported:'iCal ዝርዝሩን ማውረድ ተጀምሯል።'},
en:{nav:'Agenda',title:'Agenda',dashTitle:"Day's Agenda",dashDesc:'Pick any Ethiopian date to see national/religious holidays, Synaxarium, Gitsawe, and season info together.',year:'Year',month:'Month',day:'Day',show:'Show',holidays:'Holidays',synax:'Synaxarium',gitsaweSection:'Gitsawe',commemoration:"Day's commemoration",mesbak:'Mesbak',gospel:'Gospel',seasonSection:'Season',noHolidays:'No national or religious holiday on this date.',noSynax:'No Synaxarium entry found for this date.',noGitsawe:'No Gitsawe reading found for this date.',climatic:'Climatic season',fasting:'Fasting season',liturgical:'Liturgical season',lentWeek:'Great Lent week',taskListTitle:'Task List',taskListDesc:'A chronological list drawn from all of your saved plans.',showDone:'Show done and skipped',overdue:'Overdue',todayGroup:'Today',upcoming:'Upcoming',noPlans:'No saved plans yet. Create and save a plan in the "Planning" tab.',noTasks:'Nothing to show.',planned:'Planned',progress:'In progress',done:'Done',skipped:'Skipped',refresh:'Refresh',loadErr:'Could not load this information.',eventsTitle:'Personal Events',eventsDesc:"Add your own events or reminders; they'll show under the date you pick and in the task list.",addEvent:'Add Event',deleteEvent:'Delete',noEvents:'No personal events yet.',eventBadge:'Event',eventTitleLabel:'Event title',icalBtn:'Download iCal',icalExported:'Downloading agenda as iCal…'},
om:{nav:'Ajandaa',title:'Ajandaa',dashTitle:'Ajandaa Guyyaa',dashDesc:"Guyyaa Itoophiyaa kamiyyuu filadhu; ayyaanota biyyaalessaa/amantii, Sinkisaar, Gitsawe fi odeeffannoo waqtii walitti qabee ni argisiisa.",year:'Waggaa',month:"Ji'a",day:'Guyyaa',show:'Agarsiisi',holidays:'Ayyaanota',synax:'Sinkisaar',gitsaweSection:'Gitsawe',commemoration:'Yaadannoo guyyaa',mesbak:'Mesbaak',gospel:'Wangeela',seasonSection:'Waqtii',noHolidays:'Guyyaa kana ayyaanni biyyaalessaa ykn amantii hin jiru.',noSynax:'Guyyaa kanaaf odeeffannoon Sinkisaar hin argamne.',noGitsawe:'Guyyaa kanaaf dubbisni Gitsawe hin argamne.',climatic:'Waqtii qilleensaa',fasting:'Waqtii soomaa',liturgical:'Waqtii mana kiristaanaa',lentWeek:'Torban Sooma Guddaa',taskListTitle:'Tarreeffama Hojii',taskListDesc:"Tarree yeroo ittiin ergame kan karoorota kee kaa'aman hunda irraa fudhatame.",showDone:'Kan xumurame fi darbitame agarsiisi',overdue:"Yeroon isaa darbe",todayGroup:"Har'a",upcoming:'Dhufaa jiru',noPlans:"Karoorri kaa'ame hin jiru. Gabatee «Karoora» keessatti karoora uumii kaa'i.",noTasks:'Wanti agarsiisamu hin jiru.',planned:'Karoorfame',progress:'Adeemsa irra',done:'Xumurame',skipped:'Darbitame',refresh:'Haaromsi',loadErr:"Odeeffannoo kana fe'uun hin danda'amne.",eventsTitle:'Taateewwan Dhuunfaa',eventsDesc:"Taateewwan yookaan yaadannoo kee mata keetii dabali; guyyaa filattee jalatti fi tarreeffama hojii keessatti ni mul'ata.",addEvent:'Taatee Dabali',deleteEvent:'Haqi',noEvents:'Taatee dhuunfaa hin jiru.',eventBadge:'Taatee',eventTitleLabel:'Mataduree taatee',icalBtn:'iCal buusi',icalExported:'Ajandaan iCal dhaaf buufamaa jira…'},
ti:{nav:'ኣጀንዳ',title:'ኣጀንዳ',dashTitle:'ናይ መዓልቲ ኣጀንዳ',dashDesc:'ዝኾነት ናይ ኢትዮጵያ ዕለት ምረጽ፤ ሃገራውን ሃይማኖታውን በዓላት፣ ስንክሳር፣ ግጻዌን ናይ ወቕቲ ሓበሬታን ብሓባር ዘርኢ።',year:'ዓመት',month:'ወርሒ',day:'መዓልቲ',show:'ኣርኢ',holidays:'በዓላት',synax:'ስንክሳር',gitsaweSection:'ግጻዌ',commemoration:'ናይ መዓልቲ መዘከርታ',mesbak:'ምስባክ',gospel:'ወንጌል',seasonSection:'ወቕቲ',noHolidays:'ኣብዚ መዓልቲ ሃገራዊ ወይ ሃይማኖታዊ በዓል የለን።',noSynax:'ንዚ መዓልቲ ሓበሬታ ስንክሳር ኣይተረኸበን።',noGitsawe:'ንዚ መዓልቲ ሓበሬታ ግጻዌ ኣይተረኸበን።',climatic:'ወቕቲ ኣየር',fasting:'ወቕቲ ጾም',liturgical:'ዘመነ ቤተክርስቲያን',lentWeek:'ሰሙን ዓቢይ ጾም',taskListTitle:'ዝርዝር ዕዮታት',taskListDesc:'ካብ ኩሎም እተዓቀቡ መደባት እተወስደ ብቕደም ሰዓት እተሰርዐ ዝርዝር።',showDone:'እተዛዘመን እተሓለፈን ኣርኢ',overdue:'ግዜኡ ዝሓለፈ',todayGroup:'ሎሚ',upcoming:'ዚመጽእ',noPlans:'እተዓቀበ መደብ የለን። ኣብ «መደብ» ትር መደብ ኣዳሉ ዓቅብ።',noTasks:'ዝርአ ዕዮ የለን።',planned:'ተመዲቡ',progress:'ኣብ ሂደት',done:'ተዛዚሙ',skipped:'ተሓሊፉ',refresh:'ኣሐድስ',loadErr:'እዚ ሓበሬታ ምጽዓን ኣይተኻእለን።',eventsTitle:'ናይ ውልቀ ኩነታት',eventsDesc:'ናትካ ኩነት ወይ መዘኻኸሪ ወስኽ፤ ኣብ ትሕቲ እትመርጾ ዕለትን ኣብ ዝርዝር ዕዮን ክርአ እዩ።',addEvent:'ኩነት ወስኽ',deleteEvent:'ደምስስ',noEvents:'ዝኾነ ናይ ውልቀ ኩነት የለን።',eventBadge:'ኩነት',eventTitleLabel:'ስም ኩነት',icalBtn:'iCal ኣውርድ',icalExported:'ኣጀንዳ ከም iCal ይወርድ ኣሎ…'},
so:{nav:'Ajandada',title:'Ajandada',dashTitle:'Ajandada Maalinta',dashDesc:'Dooro taariikh Itoobiya ah oo kasta; wuxuu isku soo bandhigayaa ciidaha qaranka/diinta, Synaxarium, Gitsawe, iyo xogta xilliga.',year:'Sannad',month:'Bil',day:'Maalin',show:'Muuji',holidays:'Ciidaha',synax:'Synaxarium',gitsaweSection:'Gitsawe',commemoration:'Xusuusta maalinta',mesbak:'Mesbak',gospel:'Injiil',seasonSection:'Xilli',noHolidays:'Maalintan ciid qaran ama diineed ma jiro.',noSynax:'Maalintan xog Synaxarium ah lama helin.',noGitsawe:'Maalintan akhris Gitsawe ah lama helin.',climatic:'Xilliga cimilada',fasting:'Xilliga soonka',liturgical:'Xilliga kaniisadda',lentWeek:'Toddobaadka Soonka Weyn',taskListTitle:'Liiska Hawlaha',taskListDesc:'Liis taariikh ahaan u kala horreeya oo laga soo saaray dhammaan qorshayaashaada la kaydiyay.',showDone:'Muuji kuwa la dhammeeyay iyo la boodayba',overdue:'Wakhtigu dhaafay',todayGroup:'Maanta',upcoming:'Soo socda',noPlans:'Wali qorshe lama kaydin. Ku samee oo ku kaydi qorshe gabalka "Qorshe".',noTasks:'Wax la muujiyo ma jiro.',planned:'La qorsheeyay',progress:'Socda',done:'La dhammeeyay',skipped:'La booday',refresh:'Cusboonaysii',loadErr:'Xogtan lama soo rari karin.',eventsTitle:'Dhacdooyinka Shakhsiga',eventsDesc:'Ku dar dhacdooyinkaaga ama xasuusinta; waxay ka muuqan doonaan taariikhda aad dooratay iyo liiska hawlaha.',addEvent:'Ku Dar Dhacdo',deleteEvent:'Tirtir',noEvents:'Wali dhacdo shakhsi ah ma jiraan.',eventBadge:'Dhacdo',eventTitleLabel:'Cinwaanka dhacdada',icalBtn:'Soo deji iCal',icalExported:'Ajandada waxaa lagu soo dejinayaa iCal…'}
};
const $=id=>document.getElementById(id),t=k=>((S[localStorage.getItem('lang')||document.documentElement.lang]||S.am)[k]||S.en[k]||k);
const MONTH_NAMES_AM=["","መስከረም","ጥቅምት","ኅዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];

function today(){const d=new Date();return window.jdnToEthiopian(window.gregorianToJdn(d.getFullYear(),d.getMonth()+1,d.getDate()));}
function formatDateDisplay(date){
  const monthName=(window.getMonths?window.getMonths():[])[date.em]||'',dayNum=window.fNum?window.fNum(date.ed):date.ed;
  let weekday='';
  try{weekday=window.getWeekdays()[window.ethToGregorian(date.ey,date.em,date.ed).getDay()]||'';}catch(e){}
  return weekday?`${weekday}፣ ${monthName} ${dayNum}`:`${monthName} ${dayNum}`;
}

const EVENTS_KEY='ethio_agenda_events';
function loadEvents(){try{const v=JSON.parse(localStorage.getItem(EVENTS_KEY)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}}
function saveEvents(list){try{localStorage.setItem(EVENTS_KEY,JSON.stringify(list));}catch(e){}}
function addEvent(date,title,details){const list=loadEvents();list.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),date,title,details});saveEvents(list);return list;}
function deleteEvent(id){saveEvents(loadEvents().filter(e=>String(e.id)!==String(id)));}
function eventsOnDate(ey,em,ed){return loadEvents().filter(e=>e.date&&e.date.ey===ey&&e.date.em===em&&e.date.ed===ed);}

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

  html+='<h4>'+t('eventsTitle')+'</h4>';
  const dayEvents=eventsOnDate(ey,em,ed);
  html+=dayEvents.length?('<ul>'+dayEvents.map(ev=>'<li><strong>'+window.escapeHtml(ev.title||'')+'</strong>'+(ev.details?(' — '+window.escapeHtml(ev.details)):'')+'</li>').join('')+'</ul>'):('<p class="agenda-empty">'+t('noEvents')+'</p>');

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
      items.push({isEvent:false,planId:p.id,planName:p.name||'Ethiopian Plan',title:r.title,details:r.details,status:r.status,rowId:r.id,date:r.date,jdn});
    });
  });
  loadEvents().forEach(ev=>{
    if(!ev.date)return;
    const jdn=window.ethiopianToJdn(ev.date.ey,ev.date.em,ev.date.ed);
    items.push({isEvent:true,eventId:ev.id,title:ev.title,details:ev.details,date:ev.date,jdn});
  });
  items.sort((a,b)=>a.jdn-b.jdn||(a.planName||'').localeCompare(b.planName||''));
  return{
    plans,
    overdue:items.filter(i=>i.jdn<todayJdn),
    todayItems:items.filter(i=>i.jdn===todayJdn),
    upcoming:items.filter(i=>i.jdn>todayJdn)
  };
}

function downloadAgendaIcal(){
  if(!window.EthioIcal)return false;
  const {overdue, todayItems, upcoming} = computeTaskBuckets();
  const items = [...overdue, ...todayItems, ...upcoming];
  if(!items.length) return false;
  const vevents = [];
  items.forEach(it => {
    let startG;
    try {
      startG = window.ethToGregorian(it.date.ey, it.date.em, it.date.ed);
    } catch(e) { return; }
    const endG = window.EthioIcal.addDays(startG, 1);
    let descParts = [];
    if(it.details) descParts.push(it.details);
    if(it.planName) descParts.push(t('taskListTitle') + ': ' + it.planName);
    if(it.status) descParts.push(t('status') + ': ' + t(it.status === 'in-progress' ? 'progress' : it.status));
    try{
      if(window.EthioPlanner){
        const season=window.EthioPlanner.seasonInfoForDate(it.date)||{};
        if(season.climatic)descParts.push(t('climatic')+': '+season.climatic);
        if(season.fasting)descParts.push(t('fasting')+': '+season.fasting);
        if(season.liturgical)descParts.push(t('liturgical')+': '+season.liturgical);
        if(season.greatLentWeek)descParts.push(t('lentWeek')+': '+season.greatLentWeek);
      }
    }catch(e){}
    descParts.push(formatDateDisplay(it.date));

    const uid = `agenda-${it.isEvent ? 'ev' : 'task'}-${it.eventId || it.rowId || it.jdn}@ethio-calendar`;
    vevents.push(window.EthioIcal.buildVevent({
      uid,
      summary: it.title || (it.isEvent ? t('eventBadge') : t('taskListTitle')),
      description: descParts.join('\n'),
      startG,
      endG
    }));
  });
  if(!vevents.length) return false;
  const calText = window.EthioIcal.buildCalendar(vevents, t('taskListTitle'));
  window.EthioIcal.downloadIcs(calText, 'agenda.ics');
  return true;
}


function getAgendaExportItems(){
  const items=[];
  const plans=(window.EthioPlanner&&window.EthioPlanner.loadPlans())||[];
  plans.forEach(plan=>{
    (plan.rows||[]).forEach(row=>{
      if(!row.date)return;
      let season=row.season||{};
      if(window.EthioPlanner&&typeof window.EthioPlanner.seasonInfoForDate==='function'){
        try{season={...season,...(window.EthioPlanner.seasonInfoForDate(row.date)||{})};}catch(e){}
      }
      items.push({
        date:row.date,
        type:'task',
        planName:plan.name||'',
        climatic:season.climatic||'',
        fasting:season.fasting||'',
        liturgical:season.liturgical||'',
        greatLentWeek:season.greatLentWeek||'',
        title:row.title||'',
        details:row.details||'',
        status:row.status||''
      });
    });
  });
  loadEvents().forEach(ev=>{
    if(!ev.date)return;
    let season={};
    if(window.EthioPlanner&&typeof window.EthioPlanner.seasonInfoForDate==='function'){
      try{season=window.EthioPlanner.seasonInfoForDate(ev.date)||{};}catch(e){}
    }
    items.push({
      id:ev.id,
      date:ev.date,
      type:'event',
      planName:'',
      climatic:season.climatic||'',
      fasting:season.fasting||'',
      liturgical:season.liturgical||'',
      greatLentWeek:season.greatLentWeek||'',
      title:ev.title||'',
      details:ev.details||'',
      status:''
    });
  });
  items.sort((a,b)=>{
    const ad=window.ethiopianToJdn(a.date.ey,a.date.em,a.date.ed);
    const bd=window.ethiopianToJdn(b.date.ey,b.date.em,b.date.ed);
    return ad-bd||(a.planName||'').localeCompare(b.planName||'')||(a.title||'').localeCompare(b.title||'');
  });
  return items;
}

function downloadAgendaExport(format){
  const items=getAgendaExportItems();
  if(!items.length)return false;
  const kind=String(format||'csv').toLowerCase();
  const headers=['Date','Ethiopian Date','Type','Plan','Climatic Season','Fasting Season','Liturgical Season','Great Lent Week','Title','Details','Status'];
  const rows=items.map(it=>[
    `${it.date.ey}-${String(it.date.em).padStart(2,'0')}-${String(it.date.ed).padStart(2,'0')}`,
    `${it.date.ey}-${it.date.em}-${it.date.ed}`,
    it.type,
    it.planName,
    it.climatic,
    it.fasting,
    it.liturgical,
    it.greatLentWeek,
    it.title,
    it.details,
    it.status
  ]);
  const csvEscape=value=>{
    const text=value==null?'':String(value);
    return /[",\n\r\t]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
  };
  let text, filename, mime;
  if(kind==='csv'||kind==='tsv'){
    const delimiter=kind==='tsv'?'\t':',';
    text=[headers,...rows].map(row=>row.map(csvEscape).join(delimiter)).join('\n');
    filename=`agenda.${kind}`;
    mime=kind==='tsv'?'text/tab-separated-values;charset=utf-8':'text/csv;charset=utf-8';
  }else if(kind==='json'){
    text=JSON.stringify(items.map(it=>({
      date:`${it.date.ey}-${it.date.em}-${it.date.ed}`,
      ethiopianDate:{ey:it.date.ey,em:it.date.em,ed:it.date.ed},
      type:it.type,
      plan:it.planName,
      season:{
        climatic:it.climatic,
        fasting:it.fasting,
        liturgical:it.liturgical,
        greatLentWeek:it.greatLentWeek
      },
      title:it.title,
      details:it.details,
      status:it.status
    })),null,2);
    filename='agenda.json';
    mime='application/json;charset=utf-8';
  }else if(kind==='md'){
    const esc=v=>String(v==null?'':v).replace(/\|/g,'\\|').replace(/\n/g,'<br>');
    text='# Agenda\n\n| Date | Ethiopian Date | Type | Plan | Climatic Season | Fasting Season | Liturgical Season | Great Lent Week | Title | Details | Status |\n|---|---|---|---|---|---|---|---|---|---|---|\n'+
      rows.map(r=>`| ${r.map(esc).join(' | ')} |`).join('\n');
    filename='agenda.md';
    mime='text/markdown;charset=utf-8';
  }else if(kind==='html'){
    const esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    text='<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Agenda</title></head><body><table><thead><tr>'+
      headers.map(h=>`<th>${esc(h)}</th>`).join('')+'</tr></thead><tbody>'+
      rows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')+
      '</tbody></table></body></html>';
    filename='agenda.html';
    mime='text/html;charset=utf-8';
  }else{
    throw new Error(`Unsupported agenda export format: ${format}`);
  }
  if(window.EthioPlanningFileIO&&typeof window.EthioPlanningFileIO.download==='function'){
    window.EthioPlanningFileIO.download(text,filename,mime);
  }else{
    const blob=new Blob([text],{type:mime});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  return true;
}

function renderTaskList(){
  const out=$('agenda-tasks-output');
  if(!out)return;
  const{plans,overdue,todayItems,upcoming}=computeTaskBuckets();
  if(!plans.length&&!loadEvents().length){out.innerHTML='<p class="agenda-empty">'+t('noPlans')+'</p>';return;}
  const statusOpts=(current)=>[['planned','planned'],['in-progress','progress'],['done','done'],['skipped','skipped']].map(([v,k])=>'<option value="'+v+'"'+(current===v?' selected':'')+'>'+t(k)+'</option>').join('');
  const group=(label,list)=>{
    let h='<h4>'+label+' ('+(window.fNum?window.fNum(list.length):list.length)+')</h4>';
    if(!list.length)return h+'<p class="agenda-empty">'+t('noTasks')+'</p>';
    h+='<ul class="agenda-task-list">'+list.map(it=>{
      const date=formatDateDisplay(it.date);
      const tagHtml=it.isEvent?('<span class="agenda-task-badge">'+t('eventBadge')+'</span>'):('<span class="agenda-task-plan">'+window.escapeHtml(it.planName)+'</span>');
      const controlHtml=it.isEvent
        ?('<button type="button" class="agenda-event-delete btn-secondary" data-event="'+window.escapeHtml(String(it.eventId))+'">'+t('deleteEvent')+'</button>')
        :('<select class="agenda-status-select" data-plan="'+window.escapeHtml(String(it.planId))+'" data-row="'+window.escapeHtml(String(it.rowId))+'" aria-label="'+window.escapeHtml(it.title||date)+'">'+statusOpts(it.status)+'</select>');
      return '<li class="agenda-task-item"><div class="agenda-task-meta"><span class="agenda-task-date">'+date+'</span> '+tagHtml+'</div>'+
        '<div class="agenda-task-body"><strong>'+window.escapeHtml(it.title||'')+'</strong>'+(it.details?(' — '+window.escapeHtml(it.details)):'')+'</div>'+
        controlHtml+'</li>';
    }).join('')+'</ul>';
    return h;
  };
  out.innerHTML=group(t('overdue'),overdue)+group(t('todayGroup'),todayItems)+group(t('upcoming'),upcoming);
  out.querySelectorAll('.agenda-event-delete').forEach(btn=>{
    btn.addEventListener('click',()=>{deleteEvent(btn.dataset.event);renderTaskList();renderEventsList();});
  });
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

function renderEventsList(){
  const out=$('agenda-events-output');
  if(!out)return;
  const list=loadEvents().slice().sort((a,b)=>window.ethiopianToJdn(a.date.ey,a.date.em,a.date.ed)-window.ethiopianToJdn(b.date.ey,b.date.em,b.date.ed));
  if(!list.length){out.innerHTML='<p class="agenda-empty">'+t('noEvents')+'</p>';return;}
  out.innerHTML='<ul class="agenda-task-list">'+list.map(ev=>
    '<li class="agenda-task-item"><div class="agenda-task-meta"><span class="agenda-task-date">'+formatDateDisplay(ev.date)+'</span></div>'+
    '<div class="agenda-task-body"><strong>'+window.escapeHtml(ev.title||'')+'</strong>'+(ev.details?(' — '+window.escapeHtml(ev.details)):'')+'</div>'+
    '<button type="button" class="agenda-event-delete btn-secondary" data-event="'+window.escapeHtml(String(ev.id))+'">'+t('deleteEvent')+'</button></li>'
  ).join('')+'</ul>';
  out.querySelectorAll('.agenda-event-delete').forEach(btn=>{
    btn.addEventListener('click',()=>{deleteEvent(btn.dataset.event);renderEventsList();renderTaskList();});
  });
}

function setDefaultDate(){const e=today();$('agenda-year').value=e.ey;$('agenda-month').value=e.em;$('agenda-day').value=e.ed;$('agenda-event-year').value=e.ey;$('agenda-event-month').value=e.em;$('agenda-event-day').value=e.ed;}

function bind(){
  $('agenda-dash-form').addEventListener('submit',e=>{e.preventDefault();showDashboard();});
  $('agenda-show-done').addEventListener('change',renderTaskList);$('agenda-refresh').addEventListener('click',renderTaskList);
  const icalBtn=$('agenda-ical-btn');
  if(icalBtn){
    icalBtn.addEventListener('click',()=>{
      const exported = downloadAgendaIcal();
      const oldTxt = icalBtn.textContent;
      icalBtn.textContent = exported ? t('icalExported') : t('noTasks');
      setTimeout(() => icalBtn.textContent = oldTxt, 2500);
    });
  }
  document.querySelectorAll('[data-ae]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      try{downloadAgendaExport(btn.dataset.ae);}catch(err){console.error(err);}
    });
  });
  $('agenda-event-form').addEventListener('submit',e=>{
    e.preventDefault();
    const ey=+$('agenda-event-year').value,em=+$('agenda-event-month').value,ed=+$('agenda-event-day').value;
    const title=$('agenda-event-title').value.trim();
    if(!ey||!em||em<1||em>13||!ed||ed<1||ed>30||!title)return;
    addEvent({ey,em,ed},title,$('agenda-event-details').value.trim());
    $('agenda-event-title').value='';$('agenda-event-details').value='';
    renderEventsList();renderTaskList();
    const currentEy=+$('agenda-year').value,currentEm=+$('agenda-month').value,currentEd=+$('agenda-day').value;
    if(currentEy===ey&&currentEm===em&&currentEd===ed)showDashboard();
  });
  $('navbtn-agenda').onclick=activate;
}
function activate(){
  document.querySelectorAll('.tab-content').forEach(x=>{x.hidden=true;x.classList.remove('active');});
  document.querySelectorAll('.nav-btn').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});
  const grp=$('navbtn-agenda').closest('.nav-group');if(grp&&grp.tagName==='DETAILS')grp.open=true;
  $('tab-agenda').hidden=false;$('tab-agenda').classList.add('active');
  $('navbtn-agenda').classList.add('active');$('navbtn-agenda').setAttribute('aria-selected','true');
  if(window.__refreshTabRoving)window.__refreshTabRoving();
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
  lbl('agenda-event-year','year');lbl('agenda-event-month','month');lbl('agenda-event-day','day');
  lbl('agenda-event-title','eventTitleLabel');lbl('agenda-event-details','details');
  const showBtn=$('agenda-show-btn');if(showBtn)showBtn.textContent=t('show');
  const eventsTitle=$('agenda-events-title');if(eventsTitle)eventsTitle.textContent=t('eventsTitle');
  const eventsDesc=$('agenda-events-desc');if(eventsDesc)eventsDesc.textContent=t('eventsDesc');
  const addEventBtn=$('agenda-event-add-btn');if(addEventBtn)addEventBtn.textContent=t('addEvent');
  const taskTitle=$('agenda-tasks-title');if(taskTitle)taskTitle.textContent=t('taskListTitle');
  const taskDesc=$('agenda-tasks-desc');if(taskDesc)taskDesc.textContent=t('taskListDesc');
  const showDoneLbl=$('agenda-show-done-label');if(showDoneLbl)showDoneLbl.textContent=t('showDone');
  const refreshBtn=$('agenda-refresh');if(refreshBtn)refreshBtn.textContent=t('refresh');
  const icalBtn=$('agenda-ical-btn');if(icalBtn)icalBtn.textContent=t('icalBtn');
  renderTaskList();
  renderEventsList();
}

function init(){
  if(!window.EthioPlanner||$('navbtn-agenda'))return;
  const nav=document.getElementById('navlist-planning')||document.querySelector('nav[role="tablist"]'),main=$('main-content');
  if(!nav||!main)return;
  const b=document.createElement('button');
  Object.assign(b,{type:'button',id:'navbtn-agenda',className:'nav-btn'});
  b.setAttribute('role','tab');b.setAttribute('aria-selected','false');b.setAttribute('aria-controls','tab-agenda');
  b.dataset.target='tab-agenda';b.textContent=t('nav');
  nav.appendChild(b);
  if(window.__refreshTabRoving)window.__refreshTabRoving();
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
    '<section class="agenda-section"><h3 id="agenda-events-title">'+t('eventsTitle')+'</h3><p id="agenda-events-desc">'+t('eventsDesc')+'</p>'+
    '<form id="agenda-event-form"><div class="form-row">'+
    '<div class="form-group"><label for="agenda-event-year">'+t('year')+'</label><input id="agenda-event-year" type="number" min="1" required></div>'+
    '<div class="form-group"><label for="agenda-event-month">'+t('month')+'</label><input id="agenda-event-month" type="number" min="1" max="13" required></div>'+
    '<div class="form-group"><label for="agenda-event-day">'+t('day')+'</label><input id="agenda-event-day" type="number" min="1" max="30" required></div>'+
    '</div><div class="form-row">'+
    '<div class="form-group"><label for="agenda-event-title">'+t('eventTitleLabel')+'</label><input id="agenda-event-title" type="text" required></div>'+
    '<div class="form-group"><label for="agenda-event-details">'+t('details')+'</label><input id="agenda-event-details" type="text"></div>'+
    '</div><button id="agenda-event-add-btn" class="btn-primary" type="submit">'+t('addEvent')+'</button></form>'+
    '<div id="agenda-events-output" class="agenda-tasks-output"></div></section>'+
    '<section class="agenda-section"><h3 id="agenda-tasks-title">'+t('taskListTitle')+'</h3><p id="agenda-tasks-desc">'+t('taskListDesc')+'</p>'+
    '<div class="form-row planning-columns-row"><label><input type="checkbox" id="agenda-show-done"> <span id="agenda-show-done-label">'+t('showDone')+'</span></label>'+
    '<div><button id="agenda-refresh" class="btn-secondary" type="button">'+t('refresh')+'</button> <button type="button" data-ae="csv">CSV</button> <button type="button" data-ae="tsv">TSV</button> <button type="button" data-ae="json">JSON</button> <button type="button" data-ae="md">Markdown</button> <button type="button" data-ae="html">HTML</button> <button id="agenda-ical-btn" class="btn-primary" type="button">'+t('icalBtn')+'</button></div></div>'+
    '<div id="agenda-tasks-output" class="agenda-tasks-output"></div></section></div>';
  main.appendChild(sec);
  setDefaultDate();
  bind();
  renderTaskList();
  renderEventsList();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.addEventListener('storage',function(e){if(e.key==='lang')relabel();});
(function(){let _last=localStorage.getItem('lang');setInterval(function(){const cur=localStorage.getItem('lang');if(cur!==_last){_last=cur;relabel();}},250);})();
})();