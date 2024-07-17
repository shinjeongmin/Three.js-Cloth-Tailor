import { BufferGeometry, Camera, InstancedInterleavedBuffer, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Ray, Raycaster, Scene, SphereGeometry, Vector2, Vector3 } from "three"
import * as mode from './managers/mode-manager'
import { findClosestVertex, findClosestVertexIndex } from "./geometry/vertex-finder"
import * as gui from "./gui/gui"
import { removeFace } from "./geometry/vertex-remover"
import { edgeCut } from "./geometry/mesh-edge-cutter"
import {separateMesh} from "./geometry/mesh-separator"

let raycaster = new Raycaster()
const mouse = new Vector2()
let gizmoLine: Line = new Line()
let isMouseDown: boolean = false;

let clickMesh: Mesh | null = null
let cuttingVertexIndexList: number[] = []

export function init(scene: Scene, camera: Camera): Raycaster{
  // set mouse status
  window.addEventListener('mousedown', ()=>{isMouseDown = true}, false)
  window.addEventListener('mouseup', ()=>{isMouseDown = false}, false)
  
  window.addEventListener('mousemove', (event)=>{
    onMouseMove(event)
    switch(mode.curMode){
      case "NONE": break;
      case "RAYCAST":
        viewIntersectPoint(scene, camera)
        break;
      case "REMOVE_VERTEX":
        if(isMouseDown){
          viewIntersectPoint(scene, camera)

          // remove clicked vertex
          const intersectObject = getIntersectObject(scene, camera)!
          if(intersectObject !== null &&
            intersectObject !== undefined) {
            clickMesh = intersectObject!
            const vertexIndex = getIntersectVertex(scene, camera)[0]
            removeFace(clickMesh, vertexIndex)
          }
        }
        break;
      case "REMOVE_EDGE": 
        if(isMouseDown){
          console.log('removing edge')
          stackClickVertexIndex(scene, camera)
        }
        break;
      default: break;
    }
  }, false)

  window.addEventListener('mousedown', (event)=>{
    switch(mode.curMode){
      case "NONE": break;
      case "RAYCAST": break;
      case "REMOVE_VERTEX":
        viewIntersectPoint(scene, camera)
          
        // remove clicked vertex
        clickMesh = getIntersectObject(scene, camera)!
        if(clickMesh !== null) {
          const vertexIndex = getIntersectVertex(scene, camera)[0]
          removeFace(clickMesh, vertexIndex)
        }
        break;
      case "REMOVE_EDGE": 
        cuttingVertexIndexList = [] // initialize vertex index list
        break;
      default: break;
    }
  }, false)

  window.addEventListener('mouseup', (event)=>{
    switch(mode.curMode){
      case "NONE": break;
      case "RAYCAST":
        scene.remove(gizmoLine)
        break;
      case "REMOVE_VERTEX":
        scene.remove(gizmoLine)

        console.log(`current mesh : `, clickMesh)
        if(clickMesh) {
          separateMesh(clickMesh)
          console.log(`separate after`, scene.children)
        }
        break;
      case "REMOVE_EDGE":
        clickMesh = getIntersectObject(scene, camera)!
        // if not null cut along the edge
        if(clickMesh !== undefined && clickMesh !== null){
          edgeCut(clickMesh, cuttingVertexIndexList)
        }
        scene.remove(gizmoLine)

        // separateMesh(clickMesh)
        break;
      default:
        break;
    }
  }, false)

  return raycaster
}

function onMouseMove(event: MouseEvent) {
  // Normalize mouse coordinates to -1 to 1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1
}

export function modeChangeEvent(scene: Scene, camera: Camera){
  if(mode.curMode !== "RAYCAST" && mode.curMode !== "REMOVE_EDGE") {
    scene.remove(gizmoLine)
  }
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
  clickMesh = getIntersectObject(scene, camera)!

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

  gizmoLine.geometry = geometry
  gizmoLine.material = material
  scene.add(gizmoLine)
}