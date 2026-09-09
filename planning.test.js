'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {loadApp}=require('./helpers');
const app=loadApp();
const code=fs.readFileSync(path.join(__dirname,'planning.js'),'utf8');
const sandbox={...app,window:app};
vm.createContext(sandbox);vm.runInContext(code,sandbox,{filename:'planning.js'});
const p=sandbox.EthioPlanner;

const date=(ey,em,ed)=>({ey,em,ed});

test('generates daily entries for a one-week period',()=>{
 const plan=p.generateSchedule({start:date(2018,1,1),periodValue:1,periodUnit:'week',intervalValue:1,intervalUnit:'day'});
 assert.equal(plan.rows.length,7);
 assert.deepEqual(plan.rows[0].date,date(2018,1,1));
 assert.deepEqual(plan.rows[6].date,date(2018,1,7));
});

test('generates every 7 days',()=>{
 const plan=p.generateSchedule({start:date(2018,1,1),periodValue:30,periodUnit:'day',intervalValue:7,intervalUnit:'day'});
 assert.equal(plan.rows.length,5);
 assert.deepEqual(plan.rows[1].date,date(2018,1,8));
});

test('generates monthly intervals using Ethiopian month arithmetic',()=>{
 const plan=p.generateSchedule({start:date(2018,1,30),periodValue:4,periodUnit:'month',intervalValue:1,intervalUnit:'month'});
 assert.deepEqual(plan.rows.map(r=>r.date),[date(2018,1,30),date(2018,2,30),date(2018,3,30),date(2018,4,30)]);
});

test('clamps a 30th day correctly when interval crosses Pagume',()=>{
 const plan=p.generateSchedule({start:date(2018,12,30),periodValue:2,periodUnit:'month',intervalValue:1,intervalUnit:'month'});
 assert.deepEqual(plan.rows[1].date,date(2019,13,5));
});

test('supports arbitrary multi-month and multi-year periods',()=>{
 const plan=p.generateSchedule({start:date(2015,1,1),periodValue:2,periodUnit:'year',intervalValue:6,intervalUnit:'month'});
 assert.equal(plan.rows.length,4);
 assert.deepEqual(plan.rows[3].date,date(2016,7,1));
});

test('rejects non-positive intervals',()=>assert.throws(()=>p.generateSchedule({start:date(2018,1,1),periodValue:1,periodUnit:'month',intervalValue:0,intervalUnit:'day'})));

test('rejects unsupported units',()=>assert.throws(()=>p.generateSchedule({start:date(2018,1,1),periodValue:1,periodUnit:'quarter',intervalValue:1,intervalUnit:'day'})));

test('CSV export contains all schedule rows',()=>{
 const plan=p.generateSchedule({start:date(2018,1,1),periodValue:3,periodUnit:'day',intervalValue:1,intervalUnit:'day'});plan.name='Test';plan.rows[1].title='ሙከራ';const csv=p.exportText(plan,'csv');assert.match(csv,/Ethiopian Date,Title,Details,Status/);assert.match(csv,/2018-01-02,ሙከራ/);
});

test('JSON export round-trips plan structure',()=>{const plan=p.generateSchedule({start:date(2018,1,1),periodValue:1,periodUnit:'week',intervalValue:1,intervalUnit:'day'});const parsed=JSON.parse(p.exportText(plan,'json'));assert.equal(parsed.rows.length,7);assert.deepEqual(parsed.start,date(2018,1,1));});
