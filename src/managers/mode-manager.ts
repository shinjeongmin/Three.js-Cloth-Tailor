export enum Mode{
  NONE, RAYCAST
}

export let stateStop:boolean = false
export let curMode: Mode = Mode.NONE

export function stopState(){ stateStop = !stateStop }
export function changeMode(mode: Mode){ curMode = mode }