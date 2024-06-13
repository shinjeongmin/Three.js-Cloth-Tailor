import { BufferGeometry, Camera, Line, LineBasicMaterial, Raycaster, Scene, Vector2, Vector3 } from "three"

let raycaster = new Raycaster()
const mouse = new Vector2()

export function init(scene: Scene, camera: Camera): Raycaster{
  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('click', ()=>clickPoint(scene, camera), false)

  return raycaster
}

function onMouseMove(event: MouseEvent) {
  // Normalize mouse coordinates to -1 to 1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
}

export function clickPoint(scene: Scene, camera: Camera){
  raycaster.setFromCamera(mouse, camera)
  // console.log(camera.position)
  // console.log(camera.rotation)

  const intersects = raycaster.intersectObjects(scene.children)
  // console.log(intersects.length)

  drawLine(scene)
  if (intersects.length > 0) {
      const intersect = intersects[0]
      const intersectedObject = intersect.object
      const intersectPoint = intersect.point
      // console.log('Intersected object:', intersectedObject)
      // console.log('Intersection point:', intersectPoint)
  }
}

function drawLine(scene: Scene){
  let material = new LineBasicMaterial({
    color: 0xff0000,
    linewidth: 10
  })
  let startVec = new Vector3(
    raycaster.ray.origin.x,
    raycaster.ray.origin.y,
    raycaster.ray.origin.z)

  let endVec = new Vector3(
    raycaster.ray.direction.x,
    raycaster.ray.direction.y,
    raycaster.ray.direction.z)
  
  // could be any number
  endVec.multiplyScalar(5000)
  
  // get the point in the middle
  let midVec = new Vector3()
  midVec.lerpVectors(startVec, endVec, 0.5)

  let geometry = new BufferGeometry().setFromPoints([startVec, endVec])

  console.log('vec start', startVec)
  console.log('vec mid', midVec)
  console.log('vec end', endVec)

  let line = new Line(geometry, material)
  scene.add(line)
}