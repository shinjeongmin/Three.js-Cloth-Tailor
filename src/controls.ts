import { Camera } from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { toggleFullScreen } from "./helpers/fullscreen"

export function setCameraControl
  (camera: Camera, canvas: HTMLElement): {
    cameraControls: OrbitControls,
  } {
  const cameraControls = new OrbitControls(camera, canvas)
  cameraControls.enableDamping = true
  cameraControls.autoRotate = false
  console.log(cameraControls.mouseButtons)
  cameraControls.mouseButtons.RIGHT = 1;
  cameraControls.mouseButtons.MIDDLE = 2;
  cameraControls.update()

  return { cameraControls }
}

export function setFullScreenEvent(canvas: HTMLElement){
  window.addEventListener('dblclick', (event) => {
    if (event.target === canvas) {
      toggleFullScreen(canvas)
    }
  })
}