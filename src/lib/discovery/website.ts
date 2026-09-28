export type WebsiteContactType="general"|"press"|"media"|"investor_relations"|"partnerships"|"business"|"foundation";
export type WebsiteContact={email:string;sourceUrl:string;contactType:WebsiteContactType;localPart:string};

const PATHS=["/","/contact","/contact-us","/about","/team","/press","/media","/investors","/investor-relations","/partnerships"];
const ROLE_MAP:Record<string,WebsiteContactType>={
  info:"general",contact:"general",hello:"general",office:"general",admin:"general",
  press:"press",media:"media",communications:"media",
  investor:"investor_relations",investors:"investor_relations",ir:"investor_relations",
  partnerships:"partnerships",business:"business",
  foundation:"foundation",giving:"foundation",philanthropy:"foundation"
};
const EMAIL_RE=/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function originOf(url:string){return new URL(url).origin}
function pathOf(url:string){return new URL(url).pathname||"/"}
function cleanEmail(value:string){return value.trim().toLowerCase().replace(/^mailto:/i,"").split("?")[0]}
function typeForLocalPart(localPart:string){return ROLE_MAP[localPart.toLowerCase()]}

async function robotsAllows(origin:string,url:string,userAgent:string){
  const robotsUrl=new URL("/robots.txt",origin).toString();
  let response:Response;
  try{response=await fetch(robotsUrl,{headers:{"user-agent":userAgent},redirect:"error"})}catch{return false}
  if(response.status===404)return true;
  if(!response.ok)return false;
  const text=await response.text(),lines=text.split(/\r?\n/);
  let applies=false, rules:string[]=[];
  for(const line of lines){
    const value=line.split("#")[0].trim();
    if(!value)continue;
    const [name,raw]=value.split(":",2).map(x=>x.trim());
    if(name?.toLowerCase()==="user-agent"){applies=raw==="*"||raw.toLowerCase()===userAgent.toLowerCase();if(applies)rules=[];continue}
    if(applies&&name?.toLowerCase()==="disallow"&&raw)rules.push(raw);
  }
  const path=pathOf(url);
  return !rules.some(rule=>path.startsWith(rule));
}

function sameOrigin(base:string,candidate:string){
  try{return originOf(base)===originOf(candidate)}catch{return false}
}

function extractLinks(html:string,pageUrl:string){
  const links:string[]=[];
  const re=/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;let match;
  while((match=re.exec(html))){try{const u=new URL(match[1],pageUrl);if((u.protocol==="http:"||u.protocol==="https:")&&sameOrigin(pageUrl,u.toString()))links.push(u.toString())}catch{}}
  return [...new Set(links)];
}

export async function discoverWebsiteContacts(input:{websiteUrl:string;userAgent?:string;maxPages?:number;maxBytesPerPage?:number}){
  const base=input.websiteUrl.endsWith("/")?input.websiteUrl.slice(0,-1):input.websiteUrl;
  const baseOrigin=originOf(base),userAgent=input.userAgent??"GlobalOutreachLab/0.1",maxPages=input.maxPages??8,maxBytes=input.maxBytesPerPage??500_000;
  const queue=[...new Set(PATHS.map(path=>new URL(path,baseOrigin).toString()))],visited=new Set<string>(),contacts=new Map<string,WebsiteContact>(),errors:string[]=[];
  while(queue.length&&visited.size<maxPages){
    const page=queue.shift()!;if(visited.has(page))continue;visited.add(page);
    if(!await robotsAllows(baseOrigin,page,userAgent)){errors.push("Blocked by robots.txt or robots fetch failed: "+page);continue}
    let response:Response;try{response=await fetch(page,{headers:{"user-agent":userAgent,"accept":"text/html,application/xhtml+xml"},redirect:"follow"})}catch(err){errors.push("Fetch failed: "+page);continue}
    if(!response.ok||!sameOrigin(baseOrigin,response.url)){errors.push("Skipped non-success or cross-origin response: "+page);continue}
    const contentType=response.headers.get("content-type")??"";if(!contentType.includes("text/html"))continue;
    const body=await response.text();if(body.length>maxBytes){errors.push("Page exceeded size limit: "+page);continue}
    for(const raw of body.match(EMAIL_RE)??[]){
      const email=cleanEmail(raw),at=email.lastIndexOf("@");if(at<1)continue;
      const domain=email.slice(at+1),localPart=email.slice(0,at);
      if(domain!==new URL(baseOrigin).hostname)continue;
      const contactType=typeForLocalPart(localPart);if(!contactType)continue;
      contacts.set(email,{email,sourceUrl:response.url,contactType,localPart});
    }
    for(const link of extractLinks(body,response.url)){if(queue.length<maxPages*3&&!visited.has(link)&&/\/(contact|about|team|press|media|investor|partnership|foundation|company)/i.test(new URL(link).pathname))queue.push(link)}
  }
  return {websiteUrl:baseOrigin,contacts:[...contacts.values()],visitedPages:[...visited],errors};
}