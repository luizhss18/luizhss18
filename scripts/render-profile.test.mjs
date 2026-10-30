import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseCalendar,metrics,coordinates} from './render-profile.mjs';

test('parse public tooltip counts, not heatmap levels or unrelated numbers',()=>{
  const start=Date.parse('2025-11-01');
  const fixture=Array.from({length:365},(_,i)=>{
    const date=new Date(start+i*86400000).toISOString().slice(0,10);
    return `<td data-date="${date}" id="day-${i}" data-level="${i===0?4:0}"></td><tool-tip for="day-${i}">${i===0?'12 contributions':'No contributions'} on November 1st.</tool-tip>`;
  }).join('');
  const days=parseCalendar(fixture);
  assert.equal(days[0].count,12);assert.equal(metrics(days).total,12);
  assert.throws(()=>parseCalendar(fixture.replace('12 contributions','changed format')),/format/);
  assert.throws(()=>parseCalendar(fixture.replace('2025-11-03','2025-11-02')),/Incomplete/);
  assert.throws(()=>parseCalendar('<html>Rate limited</html>'),/Incomplete/);
});
test('metrics include isolated contributions and sequences across week boundaries',()=>{
  const days=[0,3,1,0,2,3,1,0].map((count,i)=>({date:`2026-10-${String(i+1).padStart(2,'0')}`,count}));
  assert.deepEqual(metrics(days),{total:10,active:5,best:3,peak:3});
  const cells=coordinates(days);assert.equal(cells[0].row,4);assert.equal(cells[3].row,0);assert.equal(cells[3].col,1);
});
