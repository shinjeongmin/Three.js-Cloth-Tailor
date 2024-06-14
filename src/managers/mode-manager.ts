export type Mode = "NONE" | "RAYCAST"
export const Modes: Mode[] = ["NONE", "RAYCAST"]

export let stateStop:boolean = false
export let curMode: Mode = "RAYCAST"
let changeModeEventNONE: Function
let changeModeEventRAYCAST: Function

export function init(noneFunc: Function, raycastFunc: Function){
  changeModeEventNONE = noneFunc
  changeModeEventRAYCAST = raycastFunc
  
  changeMode(curMode)
}
export function stopState(){ stateStop = !stateStop }
export function changeMode(mode: Mode){ 
  curMode = mode
  if(curMode === "NONE"){
    changeModeEventNONE()
  }
  else if(curMode === "RAYCAST"){
    changeModeEventRAYCAST()
  }
}