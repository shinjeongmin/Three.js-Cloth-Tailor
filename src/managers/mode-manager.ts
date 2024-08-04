export type Mode = "NONE" | "RAYCAST" | "REMOVE_VERTEX" | "REMOVE_EDGE" | "TRANSFORM" | "ATTACH_VERTEX"
export const Modes: Mode[] = ["NONE", "RAYCAST", "REMOVE_VERTEX","REMOVE_EDGE", "TRANSFORM", "ATTACH_VERTEX"]

export let stateSimulation:boolean = false
export let curMode: Mode = "NONE"
let changeModeEvent: Function
let changeModeEventNONE: Function
let changeModeEventRAYCAST: Function
let changeModeEventREMOVE_VERTEX: Function
let changeModeEventREMOVE_EDGE: Function
let changeModeEventTRANSFORM: Function
let changeModeEventATTACH_VERTEX: Function

export function init(func: Function, noneFunc: Function, raycastFunc: Function,
  removeVertexFunc: Function, removeEdgeFunc: Function, transformFunc: Function, 
  attachVertexFunc: Function, mode: Mode = curMode) {
  changeModeEvent = func
  changeModeEventNONE = noneFunc
  changeModeEventRAYCAST = raycastFunc
  changeModeEventREMOVE_VERTEX = removeVertexFunc
  changeModeEventREMOVE_EDGE = removeEdgeFunc
  changeModeEventTRANSFORM = transformFunc
  changeModeEventATTACH_VERTEX = attachVertexFunc

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
    changeModeEventREMOVE_VERTEX()
  }
  else if(curMode === "REMOVE_EDGE"){
    changeModeEventREMOVE_EDGE()
  }
  else if(curMode === "TRANSFORM"){
    changeModeEventTRANSFORM()
  }
  else if(curMode === "ATTACH_VERTEX"){
    changeModeEventATTACH_VERTEX()
  }
}