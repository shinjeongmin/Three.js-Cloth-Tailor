import { vecDistSquared } from "./math";

export function 
checkPosition(x: number, y: number, z: number): number{
  let resultY = y
  const adjustValue = 0.06

  if(y < 0.25 
    && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.1){
      resultY = 0.25;
  }
  else if(y < 0 
    && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.25){
      resultY = 0;
  }
  else if(y < -0.15
    && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.3){
      resultY = 0;
  }
  else if(y < -0.36
    && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.73
    && -0.5 < x && x < 0.5){
    resultY = -0.36;
  }
  else if(y < -0.375 + adjustValue
    && -0.1 < x && x < 0.1
    && -0.95 < z && z < 0.95){
    resultY = -0.375 + adjustValue
  }
  else if(y < -0.39 + adjustValue
    && -0.1 < x && x < 0.1
    && -1.17 < z && z < 1.17){
    resultY = -0.39 + adjustValue
  }
  else if(y < -0.4 + adjustValue
    && -0.35 < x && x < 0.35 
    && -0.72 < z && z < 0.72){
    resultY = -0.4 + adjustValue
  }
  else if(y < -0.4313 + adjustValue
    && -0.1 < x && x < 0.1
    && -1.3074 < z && z < 1.3074){
    resultY = -0.4313 + adjustValue
  }
  else if(y < -0.4381 + adjustValue
    && -0.3109 < x && x < 0.3109
    && -1.1672 < z && z < 1.1672){
    resultY = -0.4381 + adjustValue
  }
  else if(y < -0.4798 + adjustValue
    && -0.2798 < x && x < 0.2798
    && -1.3049 < z && z < 1.3049){
    resultY = -0.4798 + adjustValue
  }
  else if(y < -0.4844 + adjustValue
    && -0.1 < x && x < 0.1
    && -1.4027 < z && z < 1.4027){
    resultY = -0.4844 + adjustValue
  }
  else if(y < -0.5312 + adjustValue
    && -0.2518 < x && x < 0.2518
    && -1.4001 < z && z < 1.4001){
    resultY = -0.5312 + adjustValue
  }
  else if(y < -0.5443 + adjustValue
    && -0.1 < x && x < 0.1
    && -1.5033 < z && z < 1.5033){
    resultY = -0.5443 + adjustValue
  }
  else if(y < -0.5464 + adjustValue
    && -0.6848 < x && x < 0.6848
    && -0.6369 < z && z < 0.6369){
    resultY = -0.5464 + adjustValue
  }
  else if(y < -0.5779 + adjustValue
    && -0.6191 < x && x < 0.6191
    && -0.9347 < z && z < 0.9347){
    resultY = -0.5779 + adjustValue
  }
  else if(y < -0.5833 + adjustValue
    && -0.782 < x && x < 0.782
    && -0.3195 < z && z < 0.3195){
    resultY = -0.5833 + adjustValue
  }
  else if(y < -0.5862 + adjustValue
    && -0.7971 < x && x < 0.7971
    && -0.1 < z && z < 0.1){
    resultY = -0.5862 + adjustValue
  }
  else if(y < -0.5863 + adjustValue
    && -0.2251 < x && x < 0.2251
    && -1.5004 < z && z < 1.5004){
    resultY = -0.5863 + adjustValue
  }
  else if(y < -0.5974 + adjustValue
    && -0.5486 < x && x < 0.5486
    && -1.1598 < z && z < 1.1598){
    resultY = -0.5974 + adjustValue
  }
  else if(y < -0.6376 + adjustValue
    && -0.4892 < x && x < 0.4892
    && -1.2966 < z && z < 1.2966){
    resultY = -0.6376 + adjustValue
  }
  else if(y < -0.6694 + adjustValue
    && -0.1 < x && x < 0.1
    && -1.5816 < z && z < 1.5816){
    resultY = -0.6694 + adjustValue
  }
  else if(y < -0.6837 + adjustValue
    && -0.4386 < x && x < 0.4386
    && -1.3919 < z && z < 1.3919){
    resultY = -0.6837 + adjustValue
  }
  else if(y < -0.6995 + adjustValue
    && -0.2041 < x && x < 0.2041
    && -1.5765 < z && z < 1.5765){
    resultY = -0.6995 + adjustValue
  }
  else if(y < -0.7218 + adjustValue
    && -0.3882 < x && x < 0.3882
    && -1.491 < z && z < 1.491){
    resultY = -0.7218 + adjustValue
  }
  else if(y < -0.7684 + adjustValue
    && -0.3335 < x && x < 0.3335
    && -1.5557 < z && z < 1.5557){
    resultY = -0.7684 + adjustValue
  }
  else if(y < -0.8468 + adjustValue
    && -0.852 < x && x < 0.852
    && -0.6356 < z && z < 0.6356){
    resultY = -0.8468 + adjustValue
  }
  else if(y < -0.8479 + adjustValue
    && -0.7669 < x && x < 0.7669
    && -0.9225 < z && z < 0.9225){
    resultY = -0.8479 + adjustValue
  }
  else if(y < -0.8528 + adjustValue
    && -0.8829 < x && x < 0.8829
    && -0.3227 < z && z < 0.3227){
    resultY = -0.8528 + adjustValue
  }
  else if(y < -0.855 + adjustValue
    && -0.8827 < x && x < 0.8827
    && -0.1 < z && z < 0.1){
    resultY = -0.855 + adjustValue
  }
  else if(y < -0.8627 + adjustValue
    && -0.6631 < x && x < 0.6631
    && -1.1461 < z && z < 1.1461){
    resultY = -0.8627 + adjustValue
  }
  else if(y < -0.9006 + adjustValue
    && -0.5787 < x && x < 0.5787
    && -1.2819 < z && z < 1.2819){
    resultY = -0.9006 + adjustValue
  }
  else{
    return resultY;
  }
  
  return resultY
}