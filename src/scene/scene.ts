import { AmbientLight, BufferAttribute, CubeTextureLoader, DirectionalLight, Mesh, MeshLambertMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, Vector3 } from "three"
import { initScene } from "../canvas-window/render-setting"
import * as controls from '../controls'
import { resizeRendererToDisplaySize } from "../canvas-window/responsiveness"
import CustomOBJLoader from '../loader'
import '../style-sheets/style.css'
import Cloth from "../cloth"
import {initInputEvents} from '../managers/input-manager'
import * as mode from '../managers/mode-manager'
import * as gui from "../gui/gui"
import * as raycast from '../raycast'
import HierarchyUI from '../gui/hierarchy'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { attachIdList } from "../geometry/mesh-attacher"
import { initSkyBox } from "./skybox"

const CANVAS_ID = 'scene'
let ambientLight: AmbientLight
let directionalLight: DirectionalLight
let pointLight: PointLight
let transformControls: TransformControls

// global variable
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(-2, 2.5, 1.5)
const { cameraControls } = controls.setCameraControl(camera, canvas)
const hierarchy =  new HierarchyUI()

let cloth: Cloth
let clothOnepiece: Cloth
let selectedCloth: Cloth
let simulClothList: Cloth[] = []
const customOBJLoader = new CustomOBJLoader()
const thickness: number = 0.05
const dt = 1.0 / 60.0
const steps = 10
const sdt = dt / steps
const gravity = new Float32Array([0, -9.8, 0])
// const gravity = new Float32Array([-1.1, -9.8, 2.5])

const floorHeight = -1.5

// collision physics
let collisionMesh: Mesh;

await init()
update()

async function init() {
  // ===== Managers =====
  initSkyBox(scene)
  initInputEvents(simulationStart)
  raycast.init(scene, camera, inputSimulClothList)
  mode.init(
    ()=>{ // common
      raycast.modeChangeEvent(scene, camera)
    },
    ()=>{ // NONE
      cameraControls.enabled = true
    },
    ()=>{ // RAYCAST
      cameraControls.enabled = false
    },
    ()=>{ // REMOVE_VERTEX
      cameraControls.enabled = false
    },
    ()=>{ // REMOVE_EDGE
      cameraControls.enabled = false
    },
    ()=>{ // TRANSFORM
      cameraControls.enabled = true
    },
    ()=>{ // EXPAND_VERTEX
      raycast.initAttachVetexStatus(scene)
      cameraControls.enabled = false
    },
    ()=>{ // ATTACH_VERTEX
      raycast.initAttachVetexStatus(scene)
      cameraControls.enabled = false
    },
    "NONE"
  )

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4)
    scene.add(ambientLight)
    directionalLight = new DirectionalLight('white', 0.5)
    scene.add(directionalLight)
    pointLight = new PointLight('white', 0.1)
    scene.add(pointLight)
  }
  // const planeGeometry = new PlaneGeometry(3, 3)
  const planeGeometry = new PlaneGeometry(3, 3)
  const planeMaterial = new MeshLambertMaterial({
    color: 'gray',
    emissive: 'teal',
    emissiveIntensity: 0.2,
    side: 2,
    transparent: true,
    opacity: 0.4,
    wireframe: false,
  })
  const plane = new Mesh(planeGeometry, planeMaterial)
  plane.rotateX(Math.PI / 2)
  plane.receiveShadow = true
  plane.position.setY(floorHeight)
  plane.name = 'floor'
  scene.add(plane)

  // model load
  //#region cloth object
  let objPath = 'cloth40x40.obj'
  let file = await customOBJLoader.load(objPath)
  cloth = new Cloth(customOBJLoader.parse(file), thickness, false)
  cloth.mesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  cloth.mesh.name = 'cloth'
  cloth.mesh.rotateOnAxis(new Vector3(1,0,0), -1.5)
  cloth.mesh.translateZ(1)
  //#endregion

  //#region cloth onepiece object
  objPath = 'onepiece.obj'
  file = await customOBJLoader.load(objPath)
  clothOnepiece = new Cloth(customOBJLoader.parse(file), thickness, false)
  clothOnepiece.mesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  //#endregion

  // modify this code to change object model
  scene.add(cloth.mesh)
  simulClothList.push(cloth)

  // Transform Controls
  transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.addEventListener('dragging-changed', event => {
    cameraControls.enabled = !event.value
  })
  transformControls.name = 'TransformControls'
  scene.add(transformControls)
  raycast.initTransformControls(transformControls, scene, camera)

  // collision mesh
  objPath = 'mannequin.obj'
  file = await customOBJLoader.load(objPath)
  collisionMesh = customOBJLoader.parse(file)
  collisionMesh.material = new MeshStandardMaterial({ color: '#008dc5', wireframe: false, side:2})
  collisionMesh.name = 'obstacle'
  scene.add(collisionMesh)
  //

  // debugger
  gui.init()
  gui.changeEnvironment(scene)
  gui.vertexViewer(cloth.mesh, scene)
  gui.changeMode()

  hierarchy.buildHierarchy(scene)
}

async function update() {
  await requestAnimationFrame(update)

  //#region simulation
  if(mode.stateSimulation) {
    physicsSimulation(simulClothList)
  }
  //#endregion

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  // selected cloth 
  selectedCloth = cloth // temporary input cloth
  if(mode.curMode === "NONE") gui.updatePositionGuiWithMesh(selectedCloth.mesh)
  // selectedCloth.mesh.geometry.computeBoundingSphere()

  //TODO: modify to update when event callback
  hierarchy.buildHierarchy(scene)

  renderer.render(scene, camera)
}

function physicsSimulation(clothes: Cloth[]){
  // gravity[2] = Math.cos(Date.now() / 2000) * 15.5

  clothes.forEach(cloth => {
    cloth.preIntegration(sdt)
    for (let i = 0; i < steps; i++) {
      cloth.preSolve(sdt, gravity)
      cloth.solve(sdt)
      cloth.postSolve(sdt)
    }
  
    cloth.updateVertexNormals()
  
    // apply vertex position
    cloth.mesh.geometry.setAttribute('position', new BufferAttribute(new Float32Array(cloth.positions), 3))
    cloth.mesh.geometry.setAttribute('normal', new BufferAttribute(new Float32Array(cloth.normals), 3))
  })
}

function simulationStart(){
  simulClothList.forEach(cloth => {
    cloth.updateMesh(cloth.mesh, attachIdList, collisionMesh)
    cloth.registerDistanceConstraint(0.0)
    cloth.registerPerformantBendingConstraint(1.0)
    cloth.registerSelfCollision()
    // cloth.registerExternalCollision(collisionMesh)
    cloth.registerIsometricBendingConstraint(10.0)
  
    // set floor height
    cloth.setFloorHeight(floorHeight)
  })
}

function inputSimulClothList(meshList: Mesh[]){
  if(!meshList) throw Error('inputSimulClothList: input parameter none')

  meshList.forEach(mesh => {  
    simulClothList.push(new Cloth(mesh, thickness, false))
  });
}