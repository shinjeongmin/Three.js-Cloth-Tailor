export type Mode = "NONE" | "RAYCAST" | "REMOVE"
export const Modes: Mode[] = ["NONE", "RAYCAST", "REMOVE"]

export let stateSimulation:boolean = false
export let curMode: Mode = "REMOVE"
let changeModeEvent: Function
let changeModeEventNONE: Function
let changeModeEventRAYCAST: Function
let changeModeEventREMOVE: Function

export function init(func: Function, noneFunc: Function, raycastFunc: Function, removeFunc: Function){
  changeModeEvent = func
  changeModeEventNONE = noneFunc
  changeModeEventRAYCAST = raycastFunc
  changeModeEventREMOVE = removeFunc
  
  changeMode(curMode)
}
export function changeSimulateState(){ stateSimulation = !stateSimulation }
export function changeMode(mode: Mode){ 
  curMode = mode
  changeModeEvent()
  if(curMode === "NONE"){
    changeModeEventNONE()
  }
  else if(curMode === "RAYCAST"){
    changeModeEventRAYCAST()
  }
  else if(curMode === "REMOVE"){
    changeModeEventREMOVE()
  }
}