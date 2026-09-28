export type DiscoverySourceType="user_import"|"official_registry"|"public_web"|"public_dataset";
export type DiscoverySource={name:string;sourceType:DiscoverySourceType;baseUrl?:string;publicProfessionalOnly:boolean;provenanceRequired:boolean};

export const DEFAULT_SOURCES:readonly DiscoverySource[]=[
  {name:"User CSV/XLSX/JSON import",sourceType:"user_import",publicProfessionalOnly:true,provenanceRequired:true},
  {name:"Official registry",sourceType:"official_registry",publicProfessionalOnly:true,provenanceRequired:true},
  {name:"Public organization website",sourceType:"public_web",publicProfessionalOnly:true,provenanceRequired:true},
  {name:"Public dataset",sourceType:"public_dataset",publicProfessionalOnly:true,provenanceRequired:true}
];

export function assertDiscoverySource(source:DiscoverySource){if(!source.publicProfessionalOnly)throw new Error("Discovery sources must be restricted to public/professional channels.");if(!source.provenanceRequired)throw new Error("Discovery sources must retain provenance.");return source;}