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
}

export interface apiRequest {
    flag: string,
    prompt: string,
    seed?: number,
}

export function responseHandle(res: string, prefixLength: number, enableKeywords: boolean){
    return (enableKeywords? res.slice(res.indexOf('=')+1) : res).trim().split('；').slice(prefixLength);
}

export async function generate(args: GenerateArgs, promptLines: string[], advancedArgs: AdvancedArgs){
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