import { BufferGeometry, Camera, InstancedInterleavedBuffer, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Ray, Raycaster, Scene, SphereGeometry, Vector2, Vector3 } from "three"
import * as mode from './managers/mode-manager'
import { findClosestVertex } from "./debug/vertex-finder"
import * as gui from "./debug/debug-gui"

let raycaster = new Raycaster()
const mouse = new Vector2()
let gizmoLine: Line = new Line()

export function init(scene: Scene, camera: Camera): Raycaster{
  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('mousemove', ()=>{
    if(mode.curMode === "NONE") {scene.remove(gizmoLine)}
  }, false)

  const viewInterFunc = ()=>viewIntersectPoint(scene, camera)

  window.addEventListener('mousedown', ()=>{
    viewInterFunc(),
    window.addEventListener('mousemove', viewInterFunc, false)
  }, false)
  window.addEventListener('mouseup', ()=>{
    window.removeEventListener('mousemove', viewInterFunc, false)
    gizmoLine.clear()
  }, false)

  return raycaster
}

function onMouseMove(event: MouseEvent) {
  // Normalize mouse coordinates to -1 to 1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1

}

export function viewIntersectPoint(scene: Scene, camera: Camera){
  if(mode.curMode === "NONE") {
    scene.remove(gizmoLine)
    return
  }

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      const intersectedObject = intersect.object
      const intersectPoint = intersect.point

      const closestPoint = findClosestVertex(intersect.point, intersect.object as Mesh)

      drawLine(scene, closestPoint)
      gui.updatePositionGuiWithVector3(closestPoint)
      break
    }
  }
}

function drawLine(scene: Scene, vec: Vector3){
  let material = new LineBasicMaterial({
    color: '#09ff00',
    linewidth: 10
  })
  let startVec = new Vector3().copy(vec)
  startVec.y += 0.1
  let endVec = new Vector3().copy(vec)
  // endVec.multiplyScalar(1)
  
  let midVec = new Vector3()
  midVec.lerpVectors(startVec, endVec, 0.5)

  let geometry = new BufferGeometry().setFromPoints([startVec, endVec])

  gizmoLine.geometry = geometry
  gizmoLine.material = material
  scene.add(gizmoLine)
}