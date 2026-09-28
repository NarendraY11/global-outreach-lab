import {COUNTRY_BY_ISO2,COUNTRY_REGISTRY} from "./countries";
import type {ContactRecord} from "./types";

export const normalizeText=(value?:unknown)=>typeof value==="string"?value.replace(/\s+/g," ").trim()||undefined:undefined;
export const normalizeEmail=(value?:unknown)=>{const email=normalizeText(value)?.toLowerCase();if(!email||email.length>254||/\s/.test(email)||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return undefined;return email};
export const normalizeUrl=(value?:unknown)=>{const raw=normalizeText(value);if(!raw)return undefined;try{const url=new URL(/^https?:\/\//i.test(raw)?raw:"https://"+raw);return url.protocol==="http:"||url.protocol==="https:"?url.toString():undefined}catch{return undefined}};
const normKey=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

export function resolveCountryIso2(value?:unknown){
  const raw=normalizeText(value);if(!raw)return undefined;
  const upper=raw.toUpperCase();
  if(COUNTRY_BY_ISO2.has(upper))return upper;
  return COUNTRY_REGISTRY.find(c=>c.iso3===upper||c.numeric===raw||normKey(c.name)===normKey(raw))?.iso2;
}

export function normalizeContact(input:Record<string,unknown>):ContactRecord{
  const get=(...keys:string[])=>keys.map(k=>input[k]).find(v=>v!==undefined&&v!==null&&String(v).trim()!=="");
  return {
    fullName:normalizeText(get("fullName","full_name","name","contact_name")),
    roleTitle:normalizeText(get("roleTitle","role_title","title","position")),
    email:normalizeEmail(get("email","email_address","contact_email")),
    organization:normalizeText(get("organization","company","company_name","organization_name")),
    websiteUrl:normalizeUrl(get("websiteUrl","website","website_url","domain")),
    countryIso2:resolveCountryIso2(get("countryIso2","country_iso2","country_code","iso2","iso3","country","country_name")),
    contactType:normalizeText(get("contactType","contact_type","type")) as ContactRecord["contactType"],
    sourceUrl:normalizeUrl(get("sourceUrl","source_url","source")),
    sourceType:normalizeText(get("sourceType","source_type")),
    discoveredAt:normalizeText(get("discoveredAt","discovered_at"))
  };
}

export function dedupeContacts(records:ContactRecord[]){
  const seen=new Set<string>(),result:ContactRecord[]=[];
  for(const record of records){
    const key=record.email
      ?"email:"+record.email
      :"fallback:"+((record.fullName??"").toLowerCase())+"|"+((record.organization??"").toLowerCase())+"|"+(record.countryIso2??"");
    if(seen.has(key))continue;
    seen.add(key);result.push(record);
  }
  return result;
}
