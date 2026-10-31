/** Monotone cubic Hermite interpolation for measured, non-uniform pose keys.
 * Keeps each key and each hold, with continuous velocity at the joins.
 * This is a motion-fit tool; it does not establish reference parity.
 */
export const measuredCurve = (frame: number, keys: readonly number[], values: readonly number[]): number => {
  if (frame <= keys[0]) return values[0];
  if (frame >= keys[keys.length-1]) return values[values.length-1];
  const widths = keys.slice(1).map((key,i)=>key-keys[i]);
  const slopes = widths.map((width,i)=>(values[i+1]-values[i])/width);
  const tangent = (i:number) => {
    if (i===0) return slopes[0];
    if (i===values.length-1) return slopes[slopes.length-1];
    if (slopes[i-1]*slopes[i]<=0) return 0;
    const a=2*widths[i]+widths[i-1],b=widths[i]+2*widths[i-1];
    return (a+b)/(a/slopes[i-1]+b/slopes[i]);
  };
  const i=keys.findIndex(key=>key>frame)-1;
  const t=(frame-keys[i])/widths[i];
  return (2*t**3-3*t*t+1)*values[i]+(t**3-2*t*t+t)*widths[i]*tangent(i)
    +(-2*t**3+3*t*t)*values[i+1]+(t**3-t*t)*widths[i]*tangent(i+1);
};
