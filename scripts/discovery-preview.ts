import {discoverWebsiteContacts} from "./website";

const url=process.argv[2];
if(!url){console.error("Usage: npm run discovery:preview -- https://example.org");process.exit(1)}
const result=await discoverWebsiteContacts({websiteUrl:url});
console.log(JSON.stringify(result,null,2));