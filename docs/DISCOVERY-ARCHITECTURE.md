# Discovery architecture

## Coverage registry

The application treats “country coverage” as a country-or-area coverage problem, not a political-status classification. The seed registry contains 249 ISO-style country/area records and preserves alpha-2, alpha-3 and numeric identifiers.

The registry is aligned to the UN Statistics Division M49 country-or-area framework for geographic/statistical grouping:
https://unstats.un.org/unsd/methodology/m49/overview

UN M49 explicitly states that its grouping assignments are for statistical convenience and do not imply assumptions about political affiliation or status.

## Default discovery policy

The product separates:
- country_or_area: all registry records
- outreachEligible: default discovery universe
- manual_review: areas held back until an operator reviews whether discovery is appropriate

The current foundation holds five areas for manual review rather than automatically generating discovery work for them.

## Contact provenance

Every imported/discovered contact is expected to retain:
- source URL
- source type
- discovery timestamp
- organization
- country ISO2
- verification state

No contact should enter a future sending queue without provenance and suppression checks.

## Quota model

For a target T across N eligible countries and minimum M:
1. require T >= N*M;
2. allocate M to each country;
3. distribute the remaining contacts evenly;
4. distribute any indivisible remainder one per country in deterministic registry order.

For a 10,000 target and 244 default-eligible country/areas with a minimum of 10 each, the planner allocates exactly 10,000.

## Next adapters

Planned discovery adapters are intentionally source-specific:
- user CSV/JSON import
- official registries
- public datasets
- public organization websites

Adapters must preserve source provenance and should not be used to obtain private personal addresses.