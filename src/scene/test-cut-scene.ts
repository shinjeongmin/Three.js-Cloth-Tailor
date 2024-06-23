import { AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, DirectionalLight, Euler, Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, RingGeometry, Scene, SphereGeometry, Vector3 } from "three"
import { initScene } from "../canvas-window/render-setting"
import * as controls from '../controls'
import { resizeRendererToDisplaySize } from "../canvas-window/responsiveness"
import CustomOBJLoader, { loadOBJ } from '../loader'
import '../style-sheets/style.css'
import Cloth from "../cloth"
import {initInputEvents} from '../managers/input-manager'
import * as mode from '../managers/mode-manager'
import * as gui from "../gui/gui"
import * as raycast from '../raycast'

const CANVAS_ID = 'scene'
let ambientLight: AmbientLight
let directionalLight: DirectionalLight
let pointLight: PointLight

// global variable
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(-2, 2.5, 1.5)
const { cameraControls } = controls.setCameraControl(camera, canvas)

let cloth40x40Mesh: Mesh
let clothOnepieceMesh: Mesh
let cubeMesh: Mesh
let planeMesh: Mesh
let currentMesh: Mesh
let cloth:Cloth
const customOBJLoader = new CustomOBJLoader()
const thickness: number = 0.05
const dt = 1.0 / 60.0
const steps = 10
const sdt = dt / steps
const gravity = new Float32Array([-1.1, -9.8, 2.5])

const floorHeight = -1.5

await init()
update()

async function init() {
  // ===== Managers =====
  initInputEvents(simulationStart)
  mode.init(
    ()=>{ // common
      raycast.init(scene, camera)
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
    "REMOVE_EDGE"
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
    wireframe: true,
  })
  const plane = new Mesh(planeGeometry, planeMaterial)
  plane.rotateX(Math.PI / 2)
  plane.receiveShadow = true
  plane.position.setY(floorHeight)
  plane.name = 'floor'
  scene.add(plane)

  // model load
  //#region cloth 40x40 object
  let objPath = 'cloth40x40.obj'
  let file = await customOBJLoader.load(objPath)
  cloth40x40Mesh = customOBJLoader.parse(file)
  cloth40x40Mesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  //#endregion

  //#region cloth onepiece object
  objPath = 'onepiece.obj'
  file = await customOBJLoader.load(objPath)
  clothOnepieceMesh = customOBJLoader.parse(file)
  clothOnepieceMesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  //#endregion

  //#region cube object
  objPath = 'cube.obj'
  file = await customOBJLoader.load(objPath)
  cubeMesh = customOBJLoader.parse(file)
  cubeMesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  cubeMesh.position.set(0,1,0)
  cubeMesh.scale.set(0.5,0.5,0.5)
  //#endregion

  //#region plane object
  objPath = 'plane.obj'
  file = await customOBJLoader.load(objPath)
  planeMesh = customOBJLoader.parse(file)
  planeMesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  planeMesh.position.setY(0)
  planeMesh.name = 'plane'
  //#endregion

  // modify this code to change object model
  currentMesh = cloth40x40Mesh
  // currentMesh = clothOnepieceMesh
  // currentMesh = cubeMesh
  // currentMesh = planeMesh
  scene.add(currentMesh)
  currentMesh.translateY(.5)

  // debugger
  gui.init()
  gui.vertexViewer(currentMesh, scene)
  gui.changeMode()
}

async function update() {
  await requestAnimationFrame(update)

  //#region simulation
  if(mode.stateSimulation) {
    physicsSimulation()
  }
  //#endregion

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  if(mode.curMode === "NONE") gui.updatePositionGuiWithMesh(currentMesh)

  currentMesh.geometry.computeBoundingSphere()

  renderer.render(scene, camera)
}

function physicsSimulation(){
  gravity[2] = Math.cos(Date.now() / 2000) * 15.5
  cloth.preIntegration(sdt)
  for (let i = 0; i < steps; i++) {
    cloth.preSolve(sdt, gravity)
    cloth.solve(sdt)
    cloth.postSolve(sdt)
  }

  cloth.updateVertexNormals()

  // apply vertex position
  currentMesh.geometry.setAttribute('position', new BufferAttribute(new Float32Array(cloth.positions), 3))
  currentMesh.geometry.setAttribute('normal', new BufferAttribute(new Float32Array(cloth.normals), 3))

}

function simulationStart(){
  console.log('simul')
  cloth = new Cloth(currentMesh, thickness, true)

  cloth.registerDistanceConstraint(0.0)
  cloth.registerPerformantBendingConstraint(1.0)
  cloth.registerSelfCollision()
  // cloth.registerIsometricBendingConstraint(10.0)

  // set floor height
  cloth.setFloorHeight(floorHeight)
}