import { AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, DirectionalLight, Euler, Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, RingGeometry, Scene, SphereGeometry, Vector3 } from "three"
import { initScene } from "../canvas-window/render-setting"
import * as controls from '../controls'
import { resizeRendererToDisplaySize } from "../canvas-window/responsiveness"
import CustomOBJLoader, { loadOBJ } from '../loader'
import '../style-sheets/style.css'
import Cloth from "../cloth"

const CANVAS_ID = 'scene'
let ambientLight: AmbientLight
let directionalLight: DirectionalLight

// global variable
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(-2, 2.5, 1.5)
const { cameraControls } = controls.setCameraControl(camera, canvas)

let cloth40x40Mesh: Mesh
let clothOnepieceMesh: Mesh
let currentMesh: Mesh
let cloth:Cloth
const customOBJLoader = new CustomOBJLoader()
const thickness: number = 0.05
const dt = 1.0 / 60.0
const steps = 10
const sdt = dt / steps
const gravity = new Float32Array([-1.1, -9.8, 2.5])

await init()
animate()

async function init() {
  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4)
    scene.add(ambientLight)
    directionalLight = new DirectionalLight('white', 0.5)
    scene.add(directionalLight)
  }
  const planeGeometry = new PlaneGeometry(3, 3)
  const planeMaterial = new MeshLambertMaterial({
    color: 'gray',
    emissive: 'teal',
    emissiveIntensity: 0.2,
    side: 2,
    transparent: true,
    opacity: 0.4,
  })
  const plane = new Mesh(planeGeometry, planeMaterial)
  plane.rotateX(Math.PI / 2)
  plane.receiveShadow = true

  scene.add(plane)

  // model load
  //#region cloth 40x40 object
  let objPath = 'cloth40x40.obj'
  let file = await customOBJLoader.load(objPath)
  cloth40x40Mesh = customOBJLoader.parse(file)
  cloth40x40Mesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  cloth40x40Mesh.position.set(0,0.5,0)
  cloth40x40Mesh.scale.set(0.5,0.5,0.5)
  //#endregion

  //#region cloth onepiece object
  objPath = 'onepiece.obj'
  file = await customOBJLoader.load(objPath)
  clothOnepieceMesh = customOBJLoader.parse(file)
  clothOnepieceMesh.material = new MeshStandardMaterial({ color: 'red', wireframe: false, side:2})
  clothOnepieceMesh.position.set(0,0.5,0)
  clothOnepieceMesh.scale.set(0.5,0.5,0.5)
  //#endregion

  // modify this code to change object model
  // currentMesh = cloth40x40Mesh
  currentMesh = clothOnepieceMesh
  scene.add(currentMesh)
  
  cloth = new Cloth(currentMesh, thickness)

  cloth.registerDistanceConstraint(0.0)
  cloth.registerPerformantBendingConstraint(1.0)
  cloth.registerSelfCollision()
  // cloth.registerIsometricBendingConstraint(10.0)
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

async function animate() {
  await requestAnimationFrame(animate)

  //#region simulation
  physicsSimulation()
  //#endregion

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)

  document.addEventListener("keydown", function(event){
    if(event.key == ' '){
    }
  },false)
}

function viewPoint(mesh: Mesh, index: number, scene: Scene){
  const pos = mesh.localToWorld(new Vector3(
      mesh.geometry.getAttribute('position').getX(index),
      mesh.geometry.getAttribute('position').getY(index),
      mesh.geometry.getAttribute('position').getZ(index)
  ))
  const point = new Mesh(new SphereGeometry(0.01), new MeshBasicMaterial({color: 'green', transparent: false}))
  point.position.set(pos.x,pos.y,pos.z)
  scene.add(point)
}