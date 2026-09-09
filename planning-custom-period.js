(function(){'use strict';
const $=id=>document.getElementById(id);
const original=window.EthioPlanner&&window.EthioPlanner.generateSchedule;
if(!original||window.__planningCustomPeriod)return;
window.__planningCustomPeriod=true;
function validDate(y,m,d){if(!Number.isInteger(y)||!Number.isInteger(m)||!Number.isInteger(d)||y<1||m<1||m>13||d<1)return false;return d<=window.getMonthLength(y,m);}
function endDate(){return {ey:+$('planning-end-year').value,em:+$('planning-end-month').value,ed:+$('planning-end-day').value};}
function addDays(date,n){return window.EthioPlanner.addUnit(date,n,'day');}
window.EthioPlanner.generateSchedule=function(options){
 if(options.periodUnit!=='custom')return original(options);
 const start={ey:Number(options.start.ey),em:Number(options.start.em),ed:Number(options.start.ed)};
 const end=endDate();
 if(!validDate(start.ey,start.em,start.ed))throw new Error('Invalid Ethiopian start date.');
 if(!validDate(end.ey,end.em,end.ed))throw new Error('Invalid Ethiopian end date.');
 const startJdn=window.ethiopianToJdn(start.ey,start.em,start.ed),endJdn=window.ethiopianToJdn(end.ey,end.em,end.ed);
 if(endJdn<startJdn)throw new Error('The end date must be on or after the start date.');
 const exclusive=addDays(end,1),periodDays=endJdn-startJdn+1;
 const result=original(Object.assign({},options,{periodValue:periodDays,periodUnit:'day'}));
 result.periodValue=1;result.periodUnit='custom';result.endExclusive=exclusive;result.endDate=end;
 return result;
};
function addCustomOption(){const unit=$('planning-period-unit');if(!unit||unit.querySelector('option[value="custom"]'))return false;unit.add(new Option('custom','custom'));const row=unit.closest('.form-row');if(!row)return false;const wrap=document.createElement('div');wrap.className='form-group';wrap.id='planning-custom-end-date';wrap.hidden=true;wrap.innerHTML='<fieldset><legend>Planning end date</legend><div class="form-row"><div class="form-group"><label for="planning-end-year">End year</label><input id="planning-end-year" type="number" min="1"></div><div class="form-group"><label for="planning-end-month">End month</label><input id="planning-end-month" type="number" min="1" max="13"></div><div class="form-group"><label for="planning-end-day">End day</label><input id="planning-end-day" type="number" min="1" max="30"></div></div><div class="planning-info" id="planning-end-date-info">The end date is included in the planning schedule.</div></fieldset>';
 const periodValue=unit.closest('.form-group');periodValue.parentElement.appendChild(wrap);
 unit.addEventListener('change',toggle);
 $('planning-year').addEventListener('input',syncDefaultEnd);$('planning-month').addEventListener('input',syncDefaultEnd);$('planning-day').addEventListener('input',syncDefaultEnd);
 syncDefaultEnd();toggle();return true;
}
function syncDefaultEnd(){if(!$('planning-end-year'))return;if(!$('planning-end-year').value){$('planning-end-year').value=$('planning-year').value;$('planning-end-month').value=$('planning-month').value;$('planning-end-day').value=$('planning-day').value;}}
function toggle(){const custom=$('planning-period-unit')?.value==='custom';const box=$('planning-custom-end-date');if(box)box.hidden=!custom;const value=$('planning-period-value');if(value){value.disabled=custom;if(custom)value.setAttribute('aria-describedby','planning-end-date-info');else value.removeAttribute('aria-describedby');}}
function restoreSavedEnd(){const button=$('planning-load-saved');if(!button||button.dataset.customPeriodBound)return;button.dataset.customPeriodBound='1';button.addEventListener('click',function(){const id=$('planning-saved-select')?.value;if(!id)return;try{const plans=JSON.parse(localStorage.getItem('ethio-calendar-plans-v1')||'[]');const p=plans.find(x=>String(x.id)===String(id));if(p&&p.periodUnit==='custom'&&p.endDate){$('planning-end-year').value=p.endDate.ey;$('planning-end-month').value=p.endDate.em;$('planning-end-day').value=p.endDate.ed;}}catch(_){ }},true);}
function start(){if(!addCustomOption()){setTimeout(start,100);return;}restoreSavedEnd();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
