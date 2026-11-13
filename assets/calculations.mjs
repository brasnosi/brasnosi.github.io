export function calculateSupply({stock,daily,lead,reserve,target}) {
  if (![stock,daily,lead,reserve,target].every(v=>Number.isFinite(v)&&v>=0&&v<=1e9)||daily<=0||target<=0) throw new RangeError('Invalid supply inputs');
  const coverage=stock/daily;
  const reorderPoint=daily*(lead+reserve);
  const orderIn=Math.max(0,(stock-reorderPoint)/daily);
  const expectedStock=Math.max(0,stock-daily*lead);
  const quantity=Math.max(0,Math.ceil(daily*target-expectedStock));
  return {coverage,reorderPoint,orderIn,quantity,shortage:coverage<lead};
}
