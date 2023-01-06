import {invokeApi} from './invokeApi'

export interface GenerateArgs {
    enableKeywords: boolean,
    keywords: string[],
    enableKeywordsRestriction: boolean,
    doPromptSelected: boolean,
    prefixBlanksNumber: number|null,
    linePrompt: string,
}

export interface AdvancedArgs {
    setManualSeed: number|null,
    apiLocation: string,
    doPseudoGenerate: boolean,
}

export interface apiRequest {
    flag: string,
    prompt: string,
    seed?: number,
}

export function responseHandle(res: string, prefixLength: number, enableKeywords: boolean){
    return (enableKeywords? res.slice(res.indexOf('=')+1) : res).trim().split('；').slice(prefixLength);
}

export function generatePseudoResult(){
    let s = '书营自多计引活视青有头世人引饭像再土信运如雨学己作新给相一性体子然企目了度写岸直问流数于考北了是就连何着走中友朋当发出种品我美爱车事'.split('');
    s.sort(()=>Math.random()-0.5);
    return [0, 9, 18, 27].map(v=>s.slice(v,v+9).join(''));
}

export async function generate(args: GenerateArgs, promptLines: string[], advancedArgs: AdvancedArgs){
    if(advancedArgs.doPseudoGenerate){
        await (()=>new Promise(resolve=>setTimeout(resolve, 1000)))();
        return generatePseudoResult();
    }
    let flag = args.enableKeywords ? 'k' : 'p';
    let keywordsText = '';
    if(args.enableKeywords){
        keywordsText = args.keywords.join('/');
        if(args.enableKeywordsRestriction){
            keywordsText += ' = ';
        }
    }
    let lyricPrompt = ''
    let prefixLength = 0;
    if(args.prefixBlanksNumber){
        prefixLength += args.prefixBlanksNumber;
        for(let i = 0; i < args.prefixBlanksNumber; i++){
            lyricPrompt += '；';
        }
    }
    if(args.doPromptSelected){
        prefixLength += promptLines.length;
        lyricPrompt += promptLines.concat('').join('；');
    }
    lyricPrompt += args.linePrompt
    let request:apiRequest = {flag, prompt: keywordsText + lyricPrompt};
    if(advancedArgs.setManualSeed !== null) request.seed = advancedArgs.setManualSeed;
    return responseHandle(await invokeApi(request, advancedArgs.apiLocation||undefined), prefixLength, args.enableKeywords);
    
}