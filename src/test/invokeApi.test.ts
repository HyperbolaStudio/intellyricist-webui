import { responseHandle } from '@/api/generate';
import {invokeApi} from '../api/invokeApi';

(async ()=>{
    console.log(await invokeApi('测试/测试 = 1111；2222；'))
    console.log(responseHandle(await invokeApi('测试/测试 = 1111；2222；'), 2, true))
    console.log(await invokeApi('测试/测试 = 1111；2222；33'))
    console.log(responseHandle(await invokeApi('测试/测试 = 1111；2222；33'),2,true))
})()