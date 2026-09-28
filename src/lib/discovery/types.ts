export type ContactType="organization"|"person"|"public_figure"|"press"|"investor_relations"|"general";
export type VerificationStatus="unverified"|"syntax_valid"|"domain_valid"|"verified"|"invalid"|"needs_review";
export type ContactRecord={fullName?:string;roleTitle?:string;email?:string;organization?:string;websiteUrl?:string;countryIso2?:string;contactType?:ContactType;sourceUrl?:string;sourceType?:string;discoveredAt?:string;verificationStatus?:VerificationStatus};
export type DiscoveryQuota={countryIso2:string;target:number;reason:"minimum"|"remainder"};
export type DiscoveryPlan={target:number;countryCount:number;minimumPerCountry:number;totalAllocated:number;quotas:DiscoveryQuota[]};