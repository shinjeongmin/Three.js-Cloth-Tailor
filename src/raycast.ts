import * as THREE from "three"
import * as mode from './managers/mode-manager'
import { findClosestVertex, findClosestVertexIndex } from "./geometry/vertex-finder"
import * as gui from "./gui/gui"
import { removeFace } from "./geometry/vertex-remover"
import { edgeCut } from "./geometry/mesh-edge-cutter"
import {separateMesh} from "./geometry/mesh-separator"
import { TransformControls } from "three/examples/jsm/controls/TransformControls"
import { attachVertexConstraint, attachVertexExpand, initVertexIndices, setVertexIndex1, setVertexIndex2 } from './geometry/mesh-attacher'

let raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let gizmoLine: THREE.Line = new THREE.Line()
gizmoLine.userData.isGizmo = true;
let isMouseDown: boolean = false;

//#region attach vertex
let gizmoAttachPoint1: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({color: '#ff5100', transparent: false}))
let gizmoAttachPoint2: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({color: '#008cff', transparent: false}))
gizmoAttachPoint1.name = 'vertex point 1'
gizmoAttachPoint2.name = 'vertex point 2'
gizmoAttachPoint1.userData.isGizmo = true;
gizmoAttachPoint2.userData.isGizmo = true;
let attachVertexStatus: "SELECT"|"ATTACH" = "SELECT"
//#endregion

let clickMesh: THREE.Mesh | null = null
let cuttingVertexIndexList: number[] = []

export function init(scene: THREE.Scene, camera: THREE.Camera, inputSimulClothList: Function): THREE.Raycaster{
  // set mouse status
  window.addEventListener('mousedown', ()=>{isMouseDown = true}, false)
  window.addEventListener('mouseup', ()=>{isMouseDown = false}, false)
  
  window.addEventListener('mousemove', (event)=>{
    onMouseMove(event)
    switch(mode.curMode){
      case "NONE": break;
      case "RAYCAST":
        viewIntersectPoint(scene, camera, "line")
        break;
      case "REMOVE_VERTEX":
        if(isMouseDown){
          viewIntersectPoint(scene, camera, "line")

          // remove clicked vertex
          const intersectObject = getIntersectObject(scene, camera)!
          if(intersectObject !== null &&
            intersectObject !== undefined && intersectObject.name !== 'obstacle') {
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
      case "TRANSFORM": break;
      case "EXPAND_VERTEX":
      case "ATTACH_VERTEX":
        if(attachVertexStatus === "SELECT"){
          viewIntersectPoint(scene, camera, "point1")
        }
        else if (attachVertexStatus === "ATTACH") 
          viewIntersectPoint(scene, camera, "point2")
        break;
      default: break;
    }
  }, false)

  window.addEventListener('mousedown', (event)=>{
    switch(mode.curMode){
      case "NONE": break;
      case "RAYCAST": break;
      case "REMOVE_VERTEX":
        viewIntersectPoint(scene, camera, "line")
          
        // remove clicked vertex
        clickMesh = getIntersectObject(scene, camera)!
        if(clickMesh !== null && clickMesh.name !== 'obstacle') {
          const vertexIndex = getIntersectVertex(scene, camera)[0]
          removeFace(clickMesh, vertexIndex)
        }
        break;
      case "REMOVE_EDGE": 
        cuttingVertexIndexList = [] // initialize vertex index list
        break;
      case "TRANSFORM": break;
      case "EXPAND_VERTEX":
      case "ATTACH_VERTEX":
        clickMesh = getIntersectObject(scene, camera)!
        if(clickMesh !== null) {
          const vertexIndex = getIntersectVertex(scene, camera)[0]

          if(attachVertexStatus === "SELECT") {
            changeAttachPointColor(gizmoAttachPoint1, "point1")
            setVertexIndex1(vertexIndex, clickMesh)
          }
          else if (attachVertexStatus === "ATTACH") {
            changeAttachPointColor(gizmoAttachPoint2, "point2")
            setVertexIndex2(vertexIndex, clickMesh)
          }
        }
        break;
      default: 
        attachVertexStatus = "SELECT"
        break;
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

        if(clickMesh && gui.removeSeparate.separate) {
          inputSimulClothList(separateMesh(scene, clickMesh))
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
      case "TRANSFORM": break;
      case "EXPAND_VERTEX":
        clickMesh = getIntersectObject(scene, camera)!
        if(clickMesh !== null) {
          if(attachVertexStatus === "SELECT"){
            attachVertexStatus = "ATTACH"
          }
          else if(attachVertexStatus === "ATTACH"){
            initAttachPointColor(gizmoAttachPoint1, gizmoAttachPoint2)
            attachVertexStatus = "SELECT"
            scene.remove(gizmoAttachPoint1)
            scene.remove(gizmoAttachPoint2)
            const attachResult: boolean = attachVertexExpand(scene)
            initVertexIndices()
            console.log(`attach result: ${attachResult}`)
          }
        }
        break;
      case "ATTACH_VERTEX":
        clickMesh = getIntersectObject(scene, camera)!
        if(clickMesh !== null) {
          if(attachVertexStatus === "SELECT"){
            attachVertexStatus = "ATTACH"
          }
          else if(attachVertexStatus === "ATTACH"){
            initAttachPointColor(gizmoAttachPoint1, gizmoAttachPoint2)
            attachVertexStatus = "SELECT"
            scene.remove(gizmoAttachPoint1)
            scene.remove(gizmoAttachPoint2)
            attachVertexConstraint(scene)
            //TODO: black connection gizmo line between vertex index 1 and vertex index 2
            initVertexIndices()
          }
        }
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

export function modeChangeEvent(scene: THREE.Scene, camera: THREE.Camera){
  if(mode.curMode !== "RAYCAST" && mode.curMode !== "REMOVE_EDGE") {
    scene.remove(gizmoLine)
  }
}

function getIntersectObject(scene: THREE.Scene, camera: THREE.Camera): THREE.Mesh | null{
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      // search parent recursively is transform controls
      let isTransformControls = false
      let parent = intersect.object?.parent
      while(parent){
        if(parent.name == "TransformControls") isTransformControls = true
        parent = parent.parent
      }
      if(isTransformControls) continue
      // check is gizmo
      if(intersect.object.userData.isGizmo) continue

      return intersect.object as THREE.Mesh
    }
  }
  
  return null
}

export function viewIntersectPoint(scene: THREE.Scene, camera: THREE.Camera, gizmoType: "line" | "point1" | "point2"){
  if(mode.curMode === "NONE") {
    scene.remove(gizmoLine)
    return
  }

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine || intersect.object === gizmoAttachPoint1
        || intersect.object === gizmoAttachPoint2) continue

      // search parent recursively is transform controls
      let isTransformControls = false
      let parent = intersect.object?.parent
      while(parent){
        if(parent.name == "TransformControls") isTransformControls = true
        parent = parent.parent
      }
      if(isTransformControls) continue
      // check is gizmo
      if(intersect.object.userData.isGizmo) continue

      const closestPoint = findClosestVertex(intersect.point, intersect.object as THREE.Mesh)

      switch(gizmoType){
        case "line":
          drawLine(scene, closestPoint)
          gui.updatePositionGuiWithVector3(closestPoint)
          const vertexIndexList: number[] = findClosestVertexIndex(intersect.point, intersect.object as THREE.Mesh)
          gui.updateIndexGui(vertexIndexList)
          break;
        case "point1":
          drawPoint(scene, closestPoint, gizmoAttachPoint1)
          break;
        case "point2":
          drawPoint(scene, closestPoint, gizmoAttachPoint2)
          break;
      }

      break
    }
  }
}

function drawLine(scene: THREE.Scene, vec: THREE.Vector3){
  let material = new THREE.LineBasicMaterial({
    color: '#09ff00',
    linewidth: 10,
    depthTest: false,
  })
  let startVec = new THREE.Vector3().copy(vec)
  startVec.y += 0.1
  let endVec = new THREE.Vector3().copy(vec)
  // endVec.multiplyScalar(1)
  
  let midVec = new THREE.Vector3()
  midVec.lerpVectors(startVec, endVec, 0.5)

  let geometry = new THREE.BufferGeometry().setFromPoints([startVec, endVec])

  gizmoLine.geometry = geometry
  gizmoLine.material = material
  scene.add(gizmoLine)
}

function getIntersectVertex(scene: THREE.Scene, camera: THREE.Camera): number[]{
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  let closestVertexIndices

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      // search parent recursively is transform controls
      let isTransformControls = false
      let parent = intersect.object?.parent
      while(parent){
        if(parent.name == "TransformControls") isTransformControls = true
        parent = parent.parent
      }
      if(isTransformControls) continue
      // check is gizmo
      if(intersect.object.userData.isGizmo) continue
      
      closestVertexIndices = findClosestVertexIndex(intersect.point, intersect.object as THREE.Mesh)

      break
    }
  }
  return closestVertexIndices!
}

function stackClickVertexIndex(scene: THREE.Scene, camera: THREE.Camera){
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(scene.children)
  clickMesh = getIntersectObject(scene, camera)!

  if (intersects.length > 0) {
    for(let i = 0; i < intersects.length; i++){
      const intersect = intersects[i]
      if(intersect.object === gizmoLine) continue

      // -- search parent recursively is transform controls
      let isTransformControls = false
      let parent = intersect.object?.parent
      while(parent){
        if(parent.name == "TransformControls") isTransformControls = true
        parent = parent.parent
      }
      if(isTransformControls) continue
      // check is gizmo
      if(intersect.object.userData.isGizmo) continue
      // --

      const vertexIndex: number = findClosestVertexIndex(intersect.point, intersect.object as THREE.Mesh)[0]
      if(cuttingVertexIndexList.includes(vertexIndex) === false){
        cuttingVertexIndexList.push(vertexIndex)

        let vertexPosList: THREE.Vector3[] = []
        for(let i=0; i<cuttingVertexIndexList.length; i++){
          vertexPosList.push(new THREE.Vector3(
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

function drawLineVertexIndexList(scene: THREE.Scene, vecList: THREE.Vector3[]){
  let material = new THREE.LineBasicMaterial({
    color: '#5ea9ff',
    linewidth: 10,
    depthTest: false,
  })

  let geometry = new THREE.BufferGeometry().setFromPoints(vecList)

  gizmoLine.geometry = geometry
  gizmoLine.material = material
  scene.add(gizmoLine)
}

export function initTransformControls(transformControls: TransformControls, scene: THREE.Scene, camera: THREE.Camera){
  window.addEventListener('mousedown', ()=>{
    switch(mode.curMode){
      case "TRANSFORM":
        const object = getIntersectObject(scene, camera)

        if (object) {
          transformControls.attach(object);
        }
        else if(transformControls.dragging){
          // nothing
        }
        else{ 
          transformControls.detach();
        }
        break;
    }
  }, false)

  window.addEventListener('keydown', (event)=>{
    switch ( event.key ) {
      case 'q':
        transformControls.setSpace( transformControls.space === 'local' ? 'world' : 'local' );
        break;
      case 'w':
        transformControls.setMode( 'translate' );
        break;
      case 'e':
        transformControls.setMode( 'rotate' );
        break;
      case 'r':
        transformControls.setMode( 'scale' );
        break;
    }
  }, false)
}

function drawPoint(scene: THREE.Scene, pos: THREE.Vector3, pointMesh: THREE.Mesh){
  pointMesh.position.set(pos.x, pos.y, pos.z)

  scene.add(pointMesh)
}

function changeAttachPointColor(pointMesh: THREE.Mesh, gizmoType: "point1" | "point2"){
  if(gizmoType === "point1"){
    (pointMesh.material as THREE.MeshBasicMaterial).color.set('#8b0101')
  }
  else if(gizmoType === "point2")
    (pointMesh.material as THREE.MeshBasicMaterial).color.set('blue')
}
function initAttachPointColor(point1: THREE.Mesh, point2: THREE.Mesh){
  (point1.material as THREE.MeshBasicMaterial).color.set('#ff5100');
  (point2.material as THREE.MeshBasicMaterial).color.set('#008cff');
}
export function initAttachVetexStatus(scene: THREE.Scene){
  scene.remove(gizmoAttachPoint1, gizmoAttachPoint2)
  initAttachPointColor(gizmoAttachPoint1, gizmoAttachPoint2)
  attachVertexStatus = "SELECT"
}