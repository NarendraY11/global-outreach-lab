import {normalizeContact,dedupeContacts} from "./normalize";
import type {ContactRecord} from "./types";

function parseCsvLine(line:string){
  const out:string[]=[];let cell="",quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted&&line[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
    }else if(ch===","&&!quoted){out.push(cell);cell="";}else cell+=ch;
  }
  out.push(cell);return out;
}

export function parseCsv(text:string):ContactRecord[]{
  const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);
  if(lines.length<2)return [];
  const headers=parseCsvLine(lines[0]).map(h=>h.trim());
  return dedupeContacts(lines.slice(1).map(line=>{
    const values=parseCsvLine(line);
    return Object.fromEntries(headers.map((h,i)=>[h,values[i]??""])) as Record<string,unknown>;
  }).map(normalizeContact));
}

export async function parseCsvFile(file:File){return parseCsv(await file.text())}
