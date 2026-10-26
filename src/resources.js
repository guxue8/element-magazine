// Point totals stay in the saved state; the interface renders each cost as one charge.
export const RESOURCE_COSTS=Object.freeze({remove:30,swap:10});
export const RESOURCE_CAPS=Object.freeze({remove:90,swap:30});

export function normalizeResources(resources){
  const normalized={...resources};
  for(const [kind,limit] of Object.entries(RESOURCE_CAPS))normalized[kind]=Math.min(resources[kind],limit);
  return normalized;
}

export function addResource(resources,kind,amount){
  const before=resources[kind];
  resources[kind]=Math.min(before+amount,RESOURCE_CAPS[kind]??Infinity);
  return resources[kind]-before;
}
