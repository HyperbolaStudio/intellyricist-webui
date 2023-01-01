export function invokeApi(data: string){
    return new Promise<string>(resolve=>{
        setTimeout(() => {
            let [flag, prompt] = data.split('\n');
            resolve(prompt + `【这是测试】flag为"${flag}"，输入为"${prompt.replace(/；/g, '; ')}"；这也是测试`);
        }, 1000);
    });
}