import axios from 'axios';
import type { apiRequest } from './generate';

export async function invokeApi(data: apiRequest, apiLocation: string = '/api/generate'){
    let res = await axios.post(apiLocation, data);
    return res.data as string;
}