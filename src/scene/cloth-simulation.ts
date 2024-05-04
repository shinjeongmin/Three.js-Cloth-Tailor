import { AmbientLight, BoxGeometry, Mesh, MeshLambertMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight } from "three";
import { initScene } from "../canvas-window/render-setting";
import * as controls from '../controls'
import { resizeRendererToDisplaySize } from "../canvas-window/responsiveness";
import * as loader from '../loader'
import '../style-sheets/style.css'

const CANVAS_ID = 'scene'
let ambientLight: AmbientLight

const { scene, canvas, renderer } = initScene(CANVAS_ID);
const camera = new PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
camera.position.set(2, 2, 5)
const { cameraControls } = controls.setCameraControl(camera, canvas)

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

  // scene.add(cube)
  scene.add(plane)

  // model load
  const objPath = 'cloth.obj'
  const clothObject = await loader.loadOBJ(objPath)
  clothObject.position.set(0, 1, 0)
  clothObject.traverse((ele) => {
    if (ele instanceof Mesh) {
      ele.material = new MeshStandardMaterial({ color: 'red', side: 1 })
    }
  })
  scene.add(clothObject)
}

function animate() {
  requestAnimationFrame(animate)

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
}
