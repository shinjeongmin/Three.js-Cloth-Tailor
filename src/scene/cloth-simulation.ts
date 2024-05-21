import { AmbientLight, BoxGeometry, BufferAttribute, BufferGeometry, Euler, Group, Material, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, RingGeometry, Scene, SphereGeometry, Vector3 } from "three"
import { initScene } from "../canvas-window/render-setting"
import * as controls from '../controls'
import { resizeRendererToDisplaySize } from "../canvas-window/responsiveness"
import * as loader from '../loader'
import '../style-sheets/style.css'
import Cloth from "../cloth"

const CANVAS_ID = 'scene'
let ambientLight: AmbientLight

// global variable
const { scene, canvas, renderer } = initScene(CANVAS_ID)
const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(-0.5, 1, 0.2)
const { cameraControls } = controls.setCameraControl(camera, canvas)

let clothMesh: Group
let cloth:Cloth
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
  const objPath = 'cloth.obj'
  clothMesh = await loader.loadOBJ(objPath)
  clothMesh.position.set(0, 1, 0)
  clothMesh.scale.set(0.5,0.5,0.5)
  clothMesh.traverse((ele) => {
    if (ele instanceof Mesh) {
      ele.material = new MeshStandardMaterial({ color: 'red', wireframe: true})
    }
  })
  scene.add(clothMesh)
  
  const childMesh = clothMesh.children[0]
  const idx = 0
  if(childMesh instanceof Mesh){
    childMesh.geometry.getAttribute('position').setY(idx, childMesh.geometry.getAttribute('position').getY(idx) - 0.1)
    console.log(childMesh.geometry.getAttribute('position').getX(idx))
  }
  viewPoint(childMesh as Mesh, idx, scene)

  // if(clothMesh.children[0] instanceof Mesh){
  //   if(clothMesh.children[0].geometry instanceof BufferGeometry){
  //     clothMesh.children[0].geometry.getAttribute('position').needsUpdate = true
  //     clothMesh.children[0].geometry.getAttribute('normal').needsUpdate = true
  //     clothMesh.children[0].geometry.getAttribute('uv').needsUpdate = true
  //   }
  // }

  // physics object
  // if(clothMesh.children[0] instanceof Mesh)
    // cloth = new Cloth(clothMesh.children[0], thickness)
  
  // cloth.registerDistanceConstraint(0.0)
  // cloth.registerPerformantBendingConstraint(1.0)
  // cloth.registerSelfCollision()
  // cloth.registerIsometricBendingConstraint(10.0)
}

async function physicsSimulation(){
  gravity[2] = Math.cos(Date.now() / 2000) * 15.5
  cloth.preIntegration(sdt)
  for (let i = 0; i < steps; i++) {
    cloth.preSolve(sdt, gravity)
    cloth.solve(sdt)
    cloth.postSolve(sdt)
  }

  cloth.updateVertexNormals()

  // if(clothMesh.children[0] instanceof Mesh)
  //   if(clothMesh.children[0].geometry instanceof BufferGeometry)
  //     clothMesh.children[0].geometry.setAttribute(
  //   'position', 
  //   new BufferAttribute(new Float32Array(cloth.positions), cloth.positions.length)
  // )
}

async function animate() {
  await requestAnimationFrame(animate)

  //#region simulation
  // await physicsSimulation()
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
      console.log(camera.rotation)
    }
  },false)
}

function viewPoint(mesh: Mesh, index: number, scene: Scene){
  const pos = mesh.localToWorld(new Vector3(
      mesh.geometry.getAttribute('position').getX(index),
      mesh.geometry.getAttribute('position').getY(index),
      mesh.geometry.getAttribute('position').getZ(index)
  ))
  const point = new Mesh(new SphereGeometry(0.001), new MeshBasicMaterial({color: 'green', transparent: false}))
  point.position.set(pos.x,pos.y,pos.z)
  scene.add(point)
}