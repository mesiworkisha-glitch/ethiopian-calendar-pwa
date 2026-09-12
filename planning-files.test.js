'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {loadApp}=require('./helpers');
const app=loadApp();
app.window=app;
vm.createContext(app);
vm.runInContext(fs.readFileSync(path.join(__dirname,'planning.js'),'utf8'),app,{filename:'planning.js'});
const p=app.EthioPlanner;
const d=(ey,em,ed)=>({ey,em,ed});
// Objects created inside the vm sandbox belong to a different realm than
// this test file, so plain-object literals from each side never share a
// prototype identity even when their contents match. assert.deepEqual
// (strict) checks that identity, so round-trip through JSON to compare by
// value only — same pattern already used in planning-file-io.test.js.
const norm=v=>JSON.parse(JSON.stringify(v));

test('CSV planning form round-trips metadata and editable rows',()=>{
 const plan=p.generateSchedule({start:d(2018,1,1),periodValue:1,periodUnit:'week',intervalValue:1,intervalUnit:'day'});
 plan.name='Weekly plan'; plan.rows[0].title='First task'; plan.rows[1].details='Second detail'; plan.rows[2].status='done';
 const csv=p.exportText(plan,'csv');
 const imported=p.importPlanText(csv,'csv');
 assert.equal(imported.periodMode,'duration'); assert.equal(imported.periodValue,1); assert.equal(imported.periodUnit,'week');
 assert.equal(imported.intervalValue,1); assert.equal(imported.intervalUnit,'day'); assert.equal(imported.rows.length,7);
 assert.deepEqual(norm(imported.rows[0].date),norm(d(2018,1,1))); assert.equal(imported.rows[0].title,'First task');
 assert.equal(imported.rows[1].details,'Second detail'); assert.equal(imported.rows[2].status,'done');
});

test('TSV planning form round-trips quoted-free fields',()=>{
 const plan=p.generateSchedule({start:d(2018,1,1),periodValue:3,periodUnit:'day',intervalValue:1,intervalUnit:'day'});
 plan.rows[0].title='Task one';
 const imported=p.importPlanText(p.exportText(plan,'tsv'),'tsv');
 assert.equal(imported.rows.length,3); assert.equal(imported.rows[0].title,'Task one');
});

test('JSON planning export imports exact custom end date',()=>{
 const plan=p.generateScheduleToDate({start:d(2018,1,1),end:d(2018,1,5),intervalValue:2,intervalUnit:'day'});
 plan.name='Custom range'; plan.rows[1].title='Middle';
 const imported=p.importPlanText(p.exportText(plan,'json'),'json');
 assert.equal(imported.periodMode,'date-range'); assert.equal(imported.periodUnit,'custom');
 assert.deepEqual(norm(imported.start),norm(d(2018,1,1))); assert.deepEqual(norm(imported.endDate),norm(d(2018,1,5)));
 assert.equal(imported.rows.length,3); assert.equal(imported.rows[1].title,'Middle');
});

test('blank-form export clears user fields but preserves generated dates and season metadata',()=>{
 const plan=p.generateSchedule({start:d(2018,1,1),periodValue:5,periodUnit:'day',intervalValue:1,intervalUnit:'day'});
 plan.rows[0].title='Existing'; plan.rows[0].details='Existing detail'; plan.rows[0].status='done';
 const blank=JSON.parse(JSON.stringify(plan)); blank.rows=blank.rows.map(r=>({...r,title:'',details:'',status:'planned'}));
 const imported=p.importPlanText(p.exportText(blank,'csv'),'csv');
 assert.equal(imported.rows.length,5); assert.equal(imported.rows[0].title,''); assert.equal(imported.rows[0].details,''); assert.equal(imported.rows[0].status,'planned');
 assert.deepEqual(norm(imported.rows[4].date),norm(d(2018,1,5))); assert.equal(imported.rows[4].season.climatic,plan.rows[4].season.climatic);
});

test('invalid planning CSV is rejected',()=>assert.throws(()=>p.importPlanText('bad,data\n1,2\n','csv')));
test('invalid planning JSON is rejected',()=>assert.throws(()=>p.importPlanText('{"rows":[]}','json')));
