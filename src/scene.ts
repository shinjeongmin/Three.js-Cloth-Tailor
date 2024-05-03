import {
  AmbientLight,
  BoxGeometry,
  Clock,
  Material,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as animations from './helpers/animations'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import './style.css'
import {initScene} from './render-setting'
import * as controls from './controls'
import * as debug from './debug-gui'
import * as loader from './loader'

const CANVAS_ID = 'scene'
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let clock: Clock
let stats: Stats

const {scene, canvas, renderer} = initScene(CANVAS_ID);
const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(2, 2, 5)
const {cameraControls} = controls.setCameraControl(camera, canvas)

await init()
animate()

async function init() {
  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 0.4)
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(-2, 2, 2)
    pointLight.castShadow = true
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    scene.add(pointLight)
  }

  // ===== 📦 OBJECTS =====
  {
    const sideLength = 1
    const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const cubeMaterial = new MeshStandardMaterial({
      color: '#f69f1f',
      metalness: 0.5,
      roughness: 0.7,
    })
    cube = new Mesh(cubeGeometry, cubeMaterial)
    cube.castShadow = true
    cube.position.y = 0.5

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

    // scene.add(cube)
    scene.add(plane)
  }

  // model load
  const objPath = 'Stanford_Bunny.obj'
  // const objPath = 'cloth.obj'
  const bunnyObj = await loader.loadOBJ(objPath)
  bunnyObj.scale.set(0.01,0.01,0.01)
  bunnyObj.position.set(0,.5,0)
  bunnyObj.traverse((ele)=>{
    if(ele instanceof Mesh){
      ele.material = new MeshStandardMaterial({color: 'red', side: 2})
    }
  })
  // bunnyObj.children[0].side = FrontSide
  scene.add(bunnyObj)

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  debug.setHelper(scene, pointLight)
  debug.setDebug(cube, pointLight, ambientLight, cameraControls)
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  animations.rotate(cube, clock, Math.PI / 3)
  animations.bounce(cube, clock, 1, 0.5, 0.5)

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
}
