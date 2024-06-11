import {stateStop, stopState} from './state-manager'

export function initInputEvents(){
  eventSpaceBar()
}

function eventSpaceBar(){
  document.addEventListener("keydown", function(event){
    if(event.key == ' ') stopState()
  },false)
}