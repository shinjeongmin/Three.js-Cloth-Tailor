import GUI from 'lil-gui'
import { AmbientLight, AxesHelper, BufferGeometry, GridHelper, Mesh, MeshBasicMaterial, PointLight, PointLightHelper, Scene, SphereGeometry, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as mode from '../managers/mode-manager'

export let gui: GUI
let target = {
  index: 0,
  max: 2000,
  position :{
    x: 0,
    y: 0,
    z: 0,
  },
  pickVertexIndex: "",
}

export function init(){
  gui = new GUI({ title: '🐞 Debug GUI', width: 300 })
  gui.add({1:'start/stop cloth simulation'}, '1').name('spacebar').disable(true)
  gui.add({1:'local/global transformation'}, '1').name('Q').disable(true)
  gui.add({1:'translation'}, '1').name('W').disable(true)
  gui.add({1:'rotation'}, '1').name('E').disable(true)
  gui.add({1:'scale'}, '1').name('R').disable(true)
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
  point.name = 'gizmoSphere'
  point.userData.isGizmo = true;

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

  // vertex viewer
  gui.add(target.position, 'x').name('position x').disable(true)
  gui.add(target.position, 'y').name('position y').disable(true)
  gui.add(target.position, 'z').name('position z').disable(true)
  gui.add(target, 'pickVertexIndex').name('picked vertex index').disable(true)

  scene.add(point)
}

export function updatePositionGuiWithMesh(mesh: Mesh){
  // + to type change number
  target.position.x = +mesh.geometry.getAttribute('position').getX(target.index).toFixed(4)
  target.position.y = +mesh.geometry.getAttribute('position').getY(target.index).toFixed(4)
  target.position.z = +mesh.geometry.getAttribute('position').getZ(target.index).toFixed(4)

  gui.controllers.forEach(ctrl => {
    ctrl.updateDisplay()
  });
}

export function updatePositionGuiWithVector3(pos: Vector3){
  // + for type change string to number
  target.position.x = +pos.x.toFixed(4)
  target.position.y = +pos.y.toFixed(4)
  target.position.z = +pos.z.toFixed(4)

  gui.controllers.forEach(ctrl => {
    ctrl.updateDisplay()
  });
}

export function updateIndexGui(numbers: number[]){
  // + for type change string to number
  target.pickVertexIndex = ""
  numbers.forEach((number, index)=>{
    target.pickVertexIndex += number

    //if(index !== numbers.length - 1)
      target.pickVertexIndex += ", "
  })

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