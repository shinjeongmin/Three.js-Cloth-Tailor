import { AxesHelper, GridHelper, PointLight, PointLightHelper, Scene } from "three"
import { gui } from './debug-gui'

let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper

export function setHelper(scene: Scene, pointLight: PointLight) {
  axesHelper = new AxesHelper(4)
  axesHelper.visible = true
  scene.add(axesHelper)

  pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
  pointLightHelper.visible = true
  scene.add(pointLightHelper)

  const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
  gridHelper.position.y = -0.01
  scene.add(gridHelper)

  // add to gui
  if (!axesHelper || !pointLightHelper) {
    throw Error("helper is not initialized");
  }
  else {
    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')
  }
}