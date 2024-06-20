import { BufferGeometry, Camera, InstancedInterleavedBuffer, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Ray, Raycaster, Scene, SphereGeometry, Vector2, Vector3 } from "three"
import * as mode from './managers/mode-manager'
import { findClosestVertex, findClosestVertexIndex } from "./geometry/vertex-finder"
import * as gui from "./gui/gui"
import { removeFace } from "./geometry/vertex-remover"

let raycaster = new Raycaster()
const mouse = new Vector2()
let gizmoLine: Line = new Line()

let cuttingVertexIndexList: number[] = []

export function init(scene: Scene, camera: Camera): Raycaster{
  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('mousemove', ()=>{
    if(mode.curMode !== "RAYCAST" && mode.curMode !== "REMOVE_EDGE") {
      scene.remove(gizmoLine)
      console.log(`remove gizmo`)
    }
    
    if(mode.curMode === "REMOVE_VERTEX"){
      window.addEventListener('mousemove', viewInterFunc, false)
    }
  }, false)

  const viewInterFunc: ()=>void = ()=>viewIntersectPoint(scene, camera) // call when in raycast
  const removeVertexFunc: ()=>void = ()=>{ // call when in remove
    const clickMesh: Mesh = getIntersectObject(scene, camera)!
    if(clickMesh !== null) {
      const vertexIndex = getIntersectVertex(scene, camera)[0]
      const removedGeometry = removeFace(clickMesh, vertexIndex)
    }
  } 
  const stackClickVertexIndexFunc: ()=>void = ()=>{
    stackClickVertexIndex(scene, camera)
  }

  window.addEventListener('mousedown', ()=>{
    if(mode.curMode === "RAYCAST"){
      viewInterFunc()
      window.addEventListener('mousemove', viewInterFunc, false)
      const vertexIndex = getIntersectVertex(scene, camera)[0]
      console.log(vertexIndex)
    } 
    else if(mode.curMode === "REMOVE_VERTEX"){
      // remove clicked vertex
      removeVertexFunc() // function execute when even clicked
      window.addEventListener('mousemove', removeVertexFunc, false) // keep remove when mouse down
      }
    else if(mode.curMode === "REMOVE_EDGE"){
      cuttingVertexIndexList = [] // initialize vertex index list
      stackClickVertexIndexFunc() // function execute when even clicked
      window.addEventListener('mousemove', stackClickVertexIndexFunc, false)
    }
  }, false)

  window.addEventListener('mouseup', ()=>{ 
    if(mode.curMode === "RAYCAST"){
      window.removeEventListener('mousemove', viewInterFunc, false)
      scene.remove(gizmoLine)
    }
    else if(mode.curMode === "REMOVE_VERTEX"){
      window.removeEventListener('mousemove', removeVertexFunc, false)
    }
    else if(mode.curMode === "REMOVE_EDGE"){
      window.removeEventListener('mousemove', stackClickVertexIndexFunc, false)
      scene.remove(gizmoLine)
      // TODO: add cut along the edge this line
    }
  }, false)

  return raycaster
}

function onMouseMove(event: MouseEvent) {
  // Normalize mouse coordinates to -1 to 1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
}

function getIntersectObject(scene: Scene, camera: Camera): Mesh | null{
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      return intersect.object as Mesh
    }
  }
  
  return null
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
    linewidth: 10,
    depthTest: false,
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

function getIntersectVertex(scene: Scene, camera: Camera): number[]{
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  let closestVertexIndices

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      closestVertexIndices = findClosestVertexIndex(intersect.point, intersect.object as Mesh)

      break
    }
  }
  return closestVertexIndices!
}

function stackClickVertexIndex(scene: Scene, camera: Camera){
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  const clickMesh: Mesh = getIntersectObject(scene, camera)!

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      const vertexIndex: number = findClosestVertexIndex(intersect.point, intersect.object as Mesh)[0]
      if(cuttingVertexIndexList.includes(vertexIndex) === false){
        cuttingVertexIndexList.push(vertexIndex)

        let vertexPosList: Vector3[] = []
        for(let i=0; i<cuttingVertexIndexList.length; i++){
          vertexPosList.push(new Vector3(
            clickMesh.geometry.attributes.position.getX(cuttingVertexIndexList[i]),
            clickMesh.geometry.attributes.position.getY(cuttingVertexIndexList[i]),
            clickMesh.geometry.attributes.position.getZ(cuttingVertexIndexList[i])
          ).applyMatrix4(clickMesh.matrixWorld)
          )

        }
        drawLineVertexIndexList(scene, vertexPosList)
      }
      break
    }
  }
}

function drawLineVertexIndexList(scene: Scene, vecList: Vector3[]){
  let material = new LineBasicMaterial({
    color: '#5ea9ff',
    linewidth: 10,
    depthTest: false,
  })

  let geometry = new BufferGeometry().setFromPoints(vecList)
  console.log(vecList)

  gizmoLine.geometry = geometry
  gizmoLine.material = material
  scene.add(gizmoLine)
}