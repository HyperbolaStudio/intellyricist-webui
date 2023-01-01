import axios from 'axios';

export async function invokeApi(data: any){
    let res = await axios.post('/api/generate', data);
    return res.data as string;
}