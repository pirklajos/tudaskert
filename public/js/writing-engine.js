export const TRACE_CONFIG = {size:300,tolerance:24,sampleStep:8,minCoverage:0.62,minPrecision:0.58,minPoints:12,acceptancePercent:70};
export function samplePaths(paths,step=TRACE_CONFIG.sampleStep){
  const result=[];
  for(const path of paths)for(let index=1;index<path.length;index++){
    const [x1,y1]=path[index-1],[x2,y2]=path[index];const count=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/step));
    for(let n=0;n<=count;n++)result.push([x1+(x2-x1)*n/count,y1+(y2-y1)*n/count]);
  }return result;
}
function nearby(point,points,tolerance){return points.some(other=>Math.hypot(point[0]-other[0],point[1]-other[1])<=tolerance);}
export function evaluateTrace(strokes,guide,config=TRACE_CONFIG){
  const drawn=samplePaths(strokes),expected=samplePaths(guide);
  if(drawn.length<config.minPoints||!expected.length)return {correct:false,coverage:0,precision:0,percent:0};
  const coverage=expected.filter(point=>nearby(point,drawn,config.tolerance)).length/expected.length;
  const precision=drawn.filter(point=>nearby(point,expected,config.tolerance)).length/drawn.length;
  const percent=Math.min(Math.round(precision*100),Math.round(coverage*100));
  return {correct:Math.round(precision*100)>=(config.acceptancePercent??70)&&Math.round(coverage*100)>=(config.coveragePercent??config.acceptancePercent??70),coverage,precision,percent};
}
