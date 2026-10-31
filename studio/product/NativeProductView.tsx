import React from 'react';
import {Img,staticFile} from 'remotion';

/** Preserve a real product viewport at native size. Add film annotations outside
 * this component; never restyle or redraw the product's controls for a guide. */
export const NativeProductView:React.FC<{project:string;shot:string;file:string;left:number;top:number;width:number;height:number}>=({project,shot,file,left,top,width,height})=>{
  if(![left,top,width,height].every(Number.isInteger))throw new Error('Native UI placement must use integer pixels');
  return <div data-native-product-shot={shot} style={{position:'absolute',left,top,width,height}}>
    <Img src={staticFile(`${project}/native-ui/${file}`)} style={{display:'block',width,height}}/>
  </div>;
};
