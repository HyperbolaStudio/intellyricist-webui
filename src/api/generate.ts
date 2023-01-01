import {invokeApi} from './invokeApi'

export interface GenerateArgs {
    enableKeywords: boolean,
    keywords: string[],
    enableKeywordsRestriction: boolean,
    doPromptSelected: boolean,
    prefixBlanksNumber: number|null,
    linePrompt: string|null,
}

export function responseHandle(res: string, prefixLength: number, enableKeywords: boolean){
    return (enableKeywords? res.slice(res.indexOf('=')+1) : res).trim().split('；').slice(prefixLength);
}

export async function generate(args: GenerateArgs, promptLines: string[]){
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
    if(args.linePrompt){
        lyricPrompt += args.linePrompt
    }
    return responseHandle(await invokeApi({flag, prompt: keywordsText + lyricPrompt}), prefixLength, args.enableKeywords);
    
}