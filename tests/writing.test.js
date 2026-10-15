import test from 'node:test';
import assert from 'node:assert/strict';
import {TRACES} from '../public/js/writing-content.js';
import {evaluateTrace,TRACE_CONFIG} from '../public/js/writing-engine.js';
test('the displayed percentage controls acceptance at the configured boundary',()=>{
  const guide=[[[0,50],[100,50]]],drawn=[...guide,[[0,150],[100,150]]];
  for(const [threshold,correct] of [[49,true],[50,true],[51,false]]){
    const result=evaluateTrace(drawn,guide,{...TRACE_CONFIG,tolerance:10,acceptancePercent:threshold});
    assert.equal(result.percent,50);assert.equal(result.correct,correct);
  }
  assert.equal(evaluateTrace([],guide,{...TRACE_CONFIG,acceptancePercent:1}).correct,false);
});
test('all uppercase and lowercase guides accept imperfect traces',()=>{
  for(const trace of TRACES){assert.equal(evaluateTrace(trace.strokes,trace.strokes).correct,true);
    const shifted=trace.strokes.map(path=>path.map(([x,y])=>[x+12,y+8]));assert.equal(evaluateTrace(shifted,trace.strokes).correct,true);
  }
});
test('the A crossbar alone is precise but does not complete the letter',()=>{
  const guide=TRACES[0].strokes;
  const partial=evaluateTrace([guide[1]],guide);
  assert.equal(partial.precision,1);
  assert.ok(partial.coverage<0.5);
  assert.equal(partial.percent,Math.round(partial.coverage*100));
  assert.equal(partial.correct,false);
  assert.equal(evaluateTrace([guide[1]],guide,{...TRACE_CONFIG,acceptancePercent:90,coveragePercent:Math.round(partial.coverage*100)}).correct,true);
  assert.equal(evaluateTrace([guide[1]],guide,{...TRACE_CONFIG,acceptancePercent:90,coveragePercent:Math.round(partial.coverage*100)+1}).correct,false);
  assert.equal(evaluateTrace(guide,guide).percent,100);
  assert.equal(evaluateTrace(guide,guide).correct,true);
});
test('empty marks and unrelated scribbles are gently rejected',()=>{
  assert.equal(evaluateTrace([],TRACES[0].strokes).correct,false);
  assert.equal(evaluateTrace([[[10,10],[20,20]]],TRACES[0].strokes).correct,false);
  assert.equal(evaluateTrace([[[10,10],[290,10],[290,290],[10,290],[10,10]]],TRACES[0].strokes).correct,false);
});
