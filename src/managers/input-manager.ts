import {stateStop, stopState} from './mode-manager'

export function initInputEvents(){
  eventSpaceBar()
  eventL()
}

function eventSpaceBar(){
  document.addEventListener("keydown", function(event){
    if(event.key == ' ') stopState()
  },false)
}

function eventL(){
  document.addEventListener("keydown", function(event){
    // if(event.key == 'l')
  },false)
}