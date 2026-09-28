import {COUNTRY_REGISTRY} from "./countries";
import type {DiscoveryPlan} from "./types";
export function buildDiscoveryPlan(target:number,minimumPerCountry:number,iso2s?:string[]):DiscoveryPlan{
  if(!Number.isInteger(target)||target<0)throw new Error("Target must be a non-negative integer");
  if(!Number.isInteger(minimumPerCountry)||minimumPerCountry<0)throw new Error("Minimum per country must be a non-negative integer");
  const selected=(iso2s?.length?[...new Set(iso2s.map(x=>x.toUpperCase()).filter(x=>COUNTRY_REGISTRY.some(c=>c.iso2===x&&c.outreachEligible)))]:COUNTRY_REGISTRY.filter(c=>c.outreachEligible).map(c=>c.iso2));
  if(selected.length===0)return {target,countryCount:0,minimumPerCountry,totalAllocated:0,quotas:[]};
  const minimumTotal=selected.length*minimumPerCountry;
  if(target<minimumTotal)throw new Error("Target "+target+" is below the minimum "+minimumTotal+" required for "+selected.length+" countries.");
  const remainder=target-minimumTotal,evenExtra=Math.floor(remainder/selected.length),remainderExtra=remainder%selected.length;
  const quotas=selected.map((iso2,index)=>{const extra=evenExtra+(index<remainderExtra?1:0);return {countryIso2:iso2,target:minimumPerCountry+extra,reason:extra>0?"remainder":"minimum"} as const});
  return {target,countryCount:selected.length,minimumPerCountry,totalAllocated:quotas.reduce((n,q)=>n+q.target,0),quotas};
}