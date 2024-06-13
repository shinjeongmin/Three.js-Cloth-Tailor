import { BufferGeometry, Camera, Line, LineBasicMaterial, Ray, Raycaster, Scene, Vector2, Vector3 } from "three"

let raycaster = new Raycaster()
const mouse = new Vector2()
let gizmoLine: Line = new Line()

export function init(scene: Scene, camera: Camera): Raycaster{
  window.addEventListener('mousemove', onMouseMove, false)

  const viewInterFunc = ()=>viewIntersectPoint(scene, camera)

  window.addEventListener('mousedown', ()=>{
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
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      const intersectedObject = intersect.object
      const intersectPoint = intersect.point

      drawLine(scene, camera.position, intersectPoint)
      break
    }
  }
}

function drawLine(scene: Scene, vecOrigin: Vector3, vecDest: Vector3){
  let material = new LineBasicMaterial({
    color: '#09ff00',
    linewidth: 10
  })
  let startVec = new Vector3().copy(vecDest)
  startVec.y += 0.1
  let endVec = new Vector3().copy(vecDest)
  // endVec.multiplyScalar(1)
  
  let midVec = new Vector3()
  midVec.lerpVectors(startVec, endVec, 0.5)

  let geometry = new BufferGeometry().setFromPoints([startVec, endVec])

  gizmoLine.geometry = geometry
  gizmoLine.material = material
  scene.add(gizmoLine)
}