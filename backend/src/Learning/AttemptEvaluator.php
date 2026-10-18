<?php

namespace App\Learning;

use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class AttemptEvaluator
{
    public function __construct(private Catalog $catalog, private TraceEvaluator $traces) {}
    public function evaluate(array $exercise, array $responses, int $elapsed): array
    {
        if (!$responses || !array_is_list($responses) || count($responses)>100 || $elapsed<0 || $elapsed>86400000) $this->invalid();
        $rows=[];$selected=[];$completed=false;$previousTime=0;$totalPoints=0;
        foreach($responses as $response){
            if($completed||!is_array($response))$this->invalid();$time=$response['responseTimeMs']??null;if(!is_int($time)||$time<$previousTime||$time>$elapsed)$this->invalid();
            if($exercise['module']==='clouds'){$id=$response['id']??null;$choice=null;foreach($exercise['choices'] as $candidate)if($candidate['id']===$id)$choice=$candidate;if(!$choice||isset($selected[$id]))$this->invalid();$given=['value'=>$choice['value'],'id'=>$id];$correct=$choice['value']===$exercise['target'];if($correct)$selected[$id]=true;$needed=$exercise['mode']==='pop'?count(array_filter($exercise['choices'],fn($item)=>$item['value']===$exercise['target'])):1;$completed=count($selected)===$needed;$expected=['value'=>$exercise['target']];}
            elseif(in_array($exercise['module'],['words','reading','math'],true)){$value=$response['value']??null;if(!is_string($value)||mb_strlen($value)>80)$this->invalid();if(($exercise['module']==='reading'||($exercise['module']==='words'&&in_array($exercise['mode'],['initial','pair'],true))||$exercise['module']==='math')&&!in_array($value,$exercise['choices'],true))$this->invalid();$correct=$this->normalize($value)===$this->normalize($exercise['expected']);$completed=$correct;$expected=['value'=>$exercise['expected']];$given=['value'=>$value];}
            else{$paths=$response['strokes']??null;if(!is_array($paths)||!array_is_list($paths)||count($paths)>30)$this->invalid();foreach($paths as $path){if(!is_array($path)||!array_is_list($path))$this->invalid();$totalPoints+=count($path);if($totalPoints>4000)$this->invalid();foreach($path as $point)if(!is_array($point)||count($point)!==2||!array_is_list($point)||!is_numeric($point[0])||!is_numeric($point[1])||$point[0]<0||$point[0]>300||$point[1]<0||$point[1]>300)$this->invalid();}$evaluation=$this->traces->evaluate($paths,$exercise['trace']['strokes'],$exercise['traceConfig']??$this->catalog->traceConfig());$correct=$evaluation['correct'];$completed=$correct;$expected=['value'=>$exercise['trace']['letter']];$given=['coverage'=>$evaluation['coverage'],'precision'=>$evaluation['precision'],'percent'=>$evaluation['percent']];}
            $rows[]=compact('expected','given','correct','time')+['durationMs'=>$time-$previousTime];$previousTime=$time;
        }
        if(!$completed)$this->invalid();return $rows;
    }
    private function normalize(string $value):string{return mb_strtolower(\Normalizer::normalize($value,\Normalizer::FORM_C));} private function invalid():never{throw new UnprocessableEntityHttpException('Érvénytelen válaszadat.');}
}
