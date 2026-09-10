import type {Compilation} from '../types';
const API=import.meta.env.VITE_API_URL||'http://localhost:8000/api';
async function post<T>(path:string,body:unknown):Promise<T>{const r=await fetch(`${API}${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const d=await r.json(); if(!r.ok) throw new Error(typeof d.detail==='string'?d.detail:JSON.stringify(d.detail)); return d}
export const compileRegex=(regex:string)=>post<Compilation>('/compile',{regex});
export const simulateRegex=(regex:string,text:string)=>post<any>('/simulate',{regex,text});
export const batchSimulate=(regex:string,strings:string[])=>post<any>('/batch-simulate',{regex,strings});
export const assistant=(prompt:string)=>post<any>('/assistant',{prompt});
