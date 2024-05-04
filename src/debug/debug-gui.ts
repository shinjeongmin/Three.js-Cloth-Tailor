import GUI from 'lil-gui'
import { AmbientLight, AxesHelper, GridHelper, Mesh, PointLight, PointLightHelper, Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper

export function setHelper(scene: Scene, pointLight: PointLight) {
  axesHelper = new AxesHelper(4)
  axesHelper.visible = false
  scene.add(axesHelper)

  pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
  pointLightHelper.visible = false
  scene.add(pointLightHelper)

  const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
  gridHelper.position.y = -0.01
  scene.add(gridHelper)
}

/**
 * @desc must call after setHelper
 * @desc-kr 반드시 setHelper 호출 후에 호출될 것
 */
export function setDebug
  (target: Mesh, pointLight: PointLight, ambientLight: AmbientLight, cameraControls: OrbitControls) {
  const gui = new GUI({ title: '🐞 Debug GUI', width: 300 })
  const targetOneFolder = gui.addFolder('target one')

  targetOneFolder.add(target.position, 'x').min(-5).max(5).step(0.5).name('pos x')
  targetOneFolder.add(target.position, 'y').min(-5).max(5).step(0.5).name('pos y')
  targetOneFolder.add(target.position, 'z').min(-5).max(5).step(0.5).name('pos z')

  targetOneFolder.add(target.material, 'wireframe')
  targetOneFolder.addColor(target.material, 'color')
  targetOneFolder.add(target.material, 'metalness', 0, 1, 0.1)
  targetOneFolder.add(target.material, 'roughness', 0, 1, 0.1)

  targetOneFolder
    .add(target.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate x')
  targetOneFolder
    .add(target.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate y')
  targetOneFolder
    .add(target.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate z')

  const lightsFolder = gui.addFolder('Lights')
  lightsFolder.add(pointLight, 'visible').name('point light')
  lightsFolder.add(ambientLight, 'visible').name('ambient light')

  //chek helper is initialized
  if (!axesHelper || !pointLightHelper) {
    throw Error("helper is not initialized");
  }
  else {
    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

  }

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(cameraControls, 'autoRotate')

  // persist GUI state in local storage on changes
  gui.onFinishChange(() => {
    const guiState = gui.save()
    localStorage.setItem('guiState', JSON.stringify(guiState))
  })

  // load GUI state if available in local storage
  const guiState = localStorage.getItem('guiState')
  if (guiState) gui.load(JSON.parse(guiState))

  // reset GUI state button
  const resetGui = () => {
    localStorage.removeItem('guiState')
    gui.reset()
  }
  gui.add({ resetGui }, 'resetGui').name('RESET')

  gui.close()
}