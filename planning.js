/* Ethiopian Calendar Planning feature
 * Uses the calendar conversion and season functions already provided by app.js.
 * Exposes a pure API for schedule generation, season filtering, persistence and export.
 */
(function (global) {
    'use strict';
    const STORAGE_KEY = 'ethio-calendar-plans-v1';
    function assertPositiveInteger(value, name) { const n = Number(value); if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a positive integer.`); return n; }
    function toJdn(date) { if (!date || !Number.isInteger(date.ey) || !Number.isInteger(date.em) || !Number.isInteger(date.ed)) throw new Error('Invalid Ethiopian date.'); return global.ethiopianToJdn(date.ey, date.em, date.ed); }
    function fromJdn(jdn) { const e = global.jdnToEthiopian(jdn); return { ey: e.ey, em: e.em, ed: e.ed }; }
    function addEthiopianMonths(date, months) { let total=(date.ey*13)+(date.em-1)+months; const ey=Math.floor(total/13); const em=((total%13)+13)%13+1; const max=global.getMonthLength(ey,em); return {ey,em,ed:Math.min(date.ed,max)}; }
    function addEthiopianYears(date, years) { const ey=date.ey+years; const max=global.getMonthLength(ey,date.em); return {ey,em:date.em,ed:Math.min(date.ed,max)}; }
    function addUnit(date,value,unit) { value=assertPositiveInteger(value,'Interval'); switch(unit){case 'day':return fromJdn(toJdn(date)+value);case 'week':return fromJdn(toJdn(date)+value*7);case 'month':return addEthiopianMonths(date,value);case 'year':return addEthiopianYears(date,value);default:throw new Error(`Unsupported interval unit: ${unit}`);} }
    function compare(a,b){return toJdn(a)-toJdn(b);}
    function calculateEndDate(start,periodValue,periodUnit){return addUnit(start,assertPositiveInteger(periodValue,'Period'),periodUnit);}

    const SEASON_CATALOG={
        climatic:[
            {id:'autumn',labelKey:'season_autumn',label:'Autumn / Kharif'},
            {id:'summer',labelKey:'season_summer',label:'Summer / Kiremt'},
            {id:'spring',labelKey:'season_spring',label:'Spring'},
            {id:'winter',labelKey:'season_winter',label:'Winter'}
        ],
        fasting:[
            {id:'none',labelKey:'fast_none',label:'No named fasting season'},
            {id:'abiy',labelKey:'fast_abiy',label:'Abiy Tsom / Great Lent'},
            {id:'nebiyat',labelKey:'fast_nebiyat',label:'Fast of the Prophets'},
            {id:'filseta',labelKey:'fast_filseta',label:'Filseta Fast'},
            {id:'hawaryat',labelKey:'fast_hawaryat',label:'Hawaryat Fast'},
            {id:'nenewe',labelKey:'fast_nenewe',label:'Nineveh Fast'},
            {id:'gehad',labelKey:'fast_gehad',label:'Gehad Fast'},
            {id:'hamsa',labelKey:'fast_hamsa',label:'Hamsa Elet / Fast season'},
            {id:'dihnet',labelKey:'fast_dihnet',label:'Dihnet Fast'}
        ],
        liturgical:[
            'ዘመነ ዮሐንስ','ዘካርያስ','ዘመነ ፍሬ','ዘመነ መስቀል','ዘመነ ጽጌ','ዘመነ አስተምሕሮ','ዘመነ ስብከት','ዘመነ ብርሃን','ዘመነ ኖላዊ','ዘመነ መርዓዊ','አማኑኤል','ዘመነ ልደት','ናዝሬት','ገሐድ','ዘመነ ጥምቀት','ዘመነ ነነዌ','ዘመነ ጾም','ዘመነ ትንሣኤ','ዘመነ ዕርገት','ዘመነ ጰራቅሊጦስ','ደመና፣ ዘርዕ፣ ዝናም','መብረቅ፣ ባሕር','ዐይነ ኵሉ፣ ዕጕለ ቋዓት','ጎሕ፣ ነግሕ'
        ].map(label=>({id:`lit-${label}`,labelKey:label,label}))
    };
    const LENT_WEEK_KEYS=['lent_week_1','lent_week_2','lent_week_3','lent_week_4','lent_week_5','lent_week_6','lent_week_7','lent_week_8'];

    function seasonInfoForDate(date){
        const bh=global.calculateBahreHasab(date.ey), seasons=global.getSeasons(date.ey,date.em,date.ed,bh);
        const greatLentWeek=typeof global.getGreatLentWeek==='function'?global.getGreatLentWeek(global.ethiopianDayOfYear(date.em,date.ed),bh):null;
        return {climatic:seasons.climatic,fasting:seasons.fasting,fastingProgress:seasons.progress||'',liturgical:seasons.liturgical,greatLentWeek:greatLentWeek?global.t(greatLentWeek):''};
    }
    function matchesSeason(info,category,seasonId){
        if(!category||!seasonId||seasonId==='all')return true;
        if(category==='climatic'){const item=SEASON_CATALOG.climatic.find(x=>x.id===seasonId);return !!item&&info.climatic===global.t(item.labelKey);}
        if(category==='fasting'){const item=SEASON_CATALOG.fasting.find(x=>x.id===seasonId);if(!item)return false;const label=global.t(item.labelKey);return item.id==='none'?info.fasting===label:info.fasting.includes(label);}
        if(category==='liturgical'){const item=SEASON_CATALOG.liturgical.find(x=>x.id===seasonId||x.label===seasonId);return !!item&&info.liturgical===item.label;}
        if(category==='lent-week'){const item=LENT_WEEK_KEYS.find(k=>k===seasonId);return !!item&&info.greatLentWeek===global.t(item);}
        return false;
    }
    function getSeasonCatalog(){return {climatic:SEASON_CATALOG.climatic.map(x=>({...x,label:global.t(x.labelKey)})),fasting:SEASON_CATALOG.fasting.map(x=>({...x,label:global.t(x.labelKey)})),liturgical:SEASON_CATALOG.liturgical.map(x=>({...x})), 'lent-week':LENT_WEEK_KEYS.map(k=>({id:k,labelKey:k,label:global.t(k)}))};}

    function generateSchedule(options){
        const start={ey:Number(options.start.ey),em:Number(options.start.em),ed:Number(options.start.ed)},periodValue=assertPositiveInteger(options.periodValue,'Period'),intervalValue=assertPositiveInteger(options.intervalValue,'Interval'),periodUnit=options.periodUnit||'month',intervalUnit=options.intervalUnit||'day',endExclusive=calculateEndDate(start,periodValue,periodUnit),endJdn=toJdn(endExclusive),seasonCategory=options.seasonCategory||'all',seasonId=options.seasonId||'all',rows=[];
        let current=start,guard=0;
        while(toJdn(current)<endJdn&&guard++<100000){const season=seasonInfoForDate(current);if(matchesSeason(season,seasonCategory,seasonId))rows.push({id:`${current.ey}-${current.em}-${current.ed}`,date:{...current},season,title:'',details:'',status:'planned'});const next=addUnit(current,intervalValue,intervalUnit);if(compare(next,current)<=0)throw new Error('The interval did not advance the schedule.');current=next;}
        return {start,endExclusive,periodValue,periodUnit,intervalValue,intervalUnit,seasonCategory,seasonId,rows};
    }
    function loadPlans(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');}catch(_){return[];}}
    function savePlan(plan){const plans=loadPlans(),index=plans.findIndex(p=>p.id===plan.id);if(index>=0)plans[index]=plan;else plans.push(plan);localStorage.setItem(STORAGE_KEY,JSON.stringify(plans));return plan;}
    function deletePlan(id){localStorage.setItem(STORAGE_KEY,JSON.stringify(loadPlans().filter(p=>p.id!==id)));}
    function csvEscape(value){const s=String(value??'');return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
    function dateLabel(date){return `${date.ey}-${String(date.em).padStart(2,'0')}-${String(date.ed).padStart(2,'0')}`;}
    function exportText(plan,format){
        const rows=plan.rows||[],seasonHeader=plan.seasonCategory&&plan.seasonCategory!=='all'?`Season Filter: ${plan.seasonId}`:'Season Filter: All';
        if(format==='json')return JSON.stringify(plan,null,2);
        if(format==='csv')return ['Ethiopian Date,Climatic Season,Fasting Season,Liturgical Season,Great Lent Week,Title,Details,Status',...rows.map(r=>[dateLabel(r.date),r.season?.climatic,r.season?.fasting,r.season?.liturgical,r.season?.greatLentWeek,r.title,r.details,r.status].map(csvEscape).join(','))].join('\n');
        if(format==='tsv')return ['Ethiopian Date\tClimatic Season\tFasting Season\tLiturgical Season\tGreat Lent Week\tTitle\tDetails\tStatus',...rows.map(r=>[dateLabel(r.date),r.season?.climatic,r.season?.fasting,r.season?.liturgical,r.season?.greatLentWeek,r.title,r.details,r.status].map(v=>String(v??'').replace(/[\t\r\n]/g,' ')).join('\t'))].join('\n');
        if(format==='md')return [`# ${plan.name||'Ethiopian Plan'}`,seasonHeader,'','| Ethiopian Date | Climatic Season | Fasting Season | Liturgical Season | Great Lent Week | Title | Details | Status |','|---|---|---|---|---|---|---|---|',...rows.map(r=>`| ${dateLabel(r.date)} | ${(r.season?.climatic||'').replace(/\|/g,'\\|')} | ${(r.season?.fasting||'').replace(/\|/g,'\\|')} | ${(r.season?.liturgical||'').replace(/\|/g,'\\|')} | ${(r.season?.greatLentWeek||'').replace(/\|/g,'\\|')} | ${(r.title||'').replace(/\|/g,'\\|')} | ${(r.details||'').replace(/\|/g,'\\|')} | ${r.status} |`)].join('\n');
        if(format==='html'){const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(plan.name||'Ethiopian Plan')}</title><style>body{font-family:system-ui,sans-serif}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:.5rem;text-align:left;vertical-align:top}</style></head><body><h1>${esc(plan.name||'Ethiopian Plan')}</h1><p>${esc(seasonHeader)}</p><table><thead><tr><th>Ethiopian Date</th><th>Climatic Season</th><th>Fasting Season</th><th>Liturgical Season</th><th>Great Lent Week</th><th>Title</th><th>Details</th><th>Status</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(dateLabel(r.date))}</td><td>${esc(r.season?.climatic)}</td><td>${esc(r.season?.fasting)}</td><td>${esc(r.season?.liturgical)}</td><td>${esc(r.season?.greatLentWeek)}</td><td>${esc(r.title)}</td><td>${esc(r.details)}</td><td>${esc(r.status)}</td></tr>`).join('')}</tbody></table></body></html>`;}
        throw new Error(`Unsupported export format: ${format}`);
    }
    function downloadPlan(plan,format){const extensions={json:'json',csv:'csv',tsv:'tsv',md:'md',html:'html'},mime={json:'application/json',csv:'text/csv',tsv:'text/tab-separated-values',md:'text/markdown',html:'text/html'},blob=new Blob([exportText(plan,format)],{type:mime[format]||'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${(plan.name||'ethiopian-plan').replace(/[^\p{L}\p{N}_-]+/gu,'_')}.${extensions[format]||'txt'}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),0);}
    global.EthioPlanner={addUnit,calculateEndDate,generateSchedule,seasonInfoForDate,matchesSeason,getSeasonCatalog,loadPlans,savePlan,deletePlan,exportText,downloadPlan,dateLabel};
})(window);