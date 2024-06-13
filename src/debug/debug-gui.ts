import GUI from 'lil-gui'
import { AmbientLight, AxesHelper, GridHelper, Mesh, MeshBasicMaterial, PointLight, PointLightHelper, Scene, SphereGeometry, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as mode from '../managers/mode-manager'

export let gui: GUI
let target = {
  index: 0,
  max: 300,
  position :{
    x: 0,
    y: 0,
    z: 0,
  }
}

export function init(){
  gui = new GUI({ title: '🐞 Debug GUI', width: 300 })
}

/**
 * @desc must call after setHelper
 * @desc-kr 반드시 setHelper 호출 후에 호출될 것
 */
export function setTestDebug
  (target: Mesh, pointLight: PointLight, ambientLight: AmbientLight, cameraControls: OrbitControls) {
  init()
  const starterDebugFolder = gui.addFolder('target one')

  starterDebugFolder.add(target.position, 'x').min(-5).max(5).step(0.5).name('pos x')
  starterDebugFolder.add(target.position, 'y').min(-5).max(5).step(0.5).name('pos y')
  starterDebugFolder.add(target.position, 'z').min(-5).max(5).step(0.5).name('pos z')

  starterDebugFolder.add(target.material, 'wireframe')
  starterDebugFolder.addColor(target.material, 'color')
  starterDebugFolder.add(target.material, 'metalness', 0, 1, 0.1)
  starterDebugFolder.add(target.material, 'roughness', 0, 1, 0.1)

  starterDebugFolder
    .add(target.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate x')
  starterDebugFolder
    .add(target.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate y')
  starterDebugFolder
    .add(target.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
    .name('rotate z')

  const lightsFolder = gui.addFolder('Lights')
  lightsFolder.add(pointLight, 'visible').name('point light')
  lightsFolder.add(ambientLight, 'visible').name('ambient light')

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

export function vertexViewer(mesh: Mesh, scene: Scene){
  const point = new Mesh(new SphereGeometry(0.01), new MeshBasicMaterial({color: 'green', transparent: false}))

  const updateVertexView = ()=>{
    const pos = mesh.localToWorld(new Vector3(
      mesh.geometry.getAttribute('position').getX(target.index),
      mesh.geometry.getAttribute('position').getY(target.index),
      mesh.geometry.getAttribute('position').getZ(target.index)
    ))
    point.position.set(pos.x,pos.y,pos.z)
  }

  const vertexDebugFolder = gui.addFolder('vertex debugger')
  const vertexIndexController = vertexDebugFolder.add(target, 'index').min(0).max(target.max).step(1).name('vertex index')
  .onChange(updateVertexView)

  const increase = () => { 
    if(target.index < target.max) target.index++ 
    updateVertexView()
    vertexIndexController.updateDisplay()
  }
  const decrease = () => { 
    if(target.index > 0) target.index-- 
    updateVertexView()
    vertexIndexController.updateDisplay()
  }
  const obj = { increase, decrease }
  vertexDebugFolder.add(obj, 'increase').name('increase')
  vertexDebugFolder.add(obj, 'decrease').name('decrease')

  // 
  gui.add(target.position, 'x').name('position x').disable(true)
  gui.add(target.position, 'y').name('position y').disable(true)
  gui.add(target.position, 'z').name('position z').disable(true)

  scene.add(point)
}

export function updatePositionGui(mesh: Mesh){
  // + to type change number
  target.position.x = +mesh.geometry.getAttribute('position').getX(target.index).toFixed(4)
  target.position.y = +mesh.geometry.getAttribute('position').getY(target.index).toFixed(4)
  target.position.z = +mesh.geometry.getAttribute('position').getZ(target.index).toFixed(4)

  gui.controllers.forEach(ctrl => {
    ctrl.updateDisplay()
  });
}

export function changeMode(){
  const modeChangeFolder = gui.addFolder('change mode')
  const modeEnumTypes = mode.Modes
  modeChangeFolder.add({mode: mode.curMode}, 'mode', modeEnumTypes).onChange((val: mode.Mode)=>{
    mode.changeMode(val)
  })
}