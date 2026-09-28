import {COUNTRY_BY_ISO2} from "./countries";
import {dedupeContacts} from "./normalize";
import type {ContactRecord} from "./types";

export type ImportReport={accepted:ContactRecord[];rejected:ContactRecord[];duplicates:number;errors:string[]};

export function validateImportedContacts(records:ContactRecord[]):ImportReport{
  const normalized=dedupeContacts(records);
  const duplicates=records.length-normalized.length;
  const accepted:ContactRecord[]=[];
  const rejected:ContactRecord[]=[];
  const errors:string[]=[];
  for(const record of normalized){
    const country=record.countryIso2?COUNTRY_BY_ISO2.get(record.countryIso2):undefined;
    if(record.countryIso2&&!country){rejected.push(record);errors.push("Unknown country code: "+record.countryIso2);continue}
    if(!record.email&&!record.websiteUrl){rejected.push(record);errors.push("Contact needs an email or website URL");continue}
    accepted.push({...record,sourceType:record.sourceType??"user_import",discoveredAt:record.discoveredAt??new Date().toISOString()});
  }
  return {accepted,rejected,duplicates,errors};
}