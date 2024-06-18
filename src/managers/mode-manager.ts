export type Mode = "NONE" | "RAYCAST" | "REMOVE_VERTEX"
export const Modes: Mode[] = ["NONE", "RAYCAST", "REMOVE_VERTEX"]

export let stateSimulation:boolean = false
export let curMode: Mode = "NONE"
let changeModeEvent: Function
let changeModeEventNONE: Function
let changeModeEventRAYCAST: Function
let changeModeEventREMOVE: Function

export function init(func: Function, noneFunc: Function, raycastFunc: Function, removeFunc: Function, mode: Mode = curMode){
  changeModeEvent = func
  changeModeEventNONE = noneFunc
  changeModeEventRAYCAST = raycastFunc
  changeModeEventREMOVE = removeFunc
  
  changeMode(mode)
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
  else if(curMode === "REMOVE_VERTEX"){
    changeModeEventREMOVE()
  }
}