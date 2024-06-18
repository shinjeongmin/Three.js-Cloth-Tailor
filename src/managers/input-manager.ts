import {changeSimulateState, stateSimulation} from './mode-manager'

export function initInputEvents(_eventSpaceBar: Function){
  eventSpaceBar(_eventSpaceBar)
  eventL()
}

function eventSpaceBar(_eventSpaceBar: Function){
  document.addEventListener("keydown", function(event){
    if(event.key == ' ') {
      changeSimulateState()
      if(stateSimulation) _eventSpaceBar()
    }
  },false)
}

function eventL(){
  document.addEventListener("keydown", function(event){
    // if(event.key == 'l')
  },false)
}