import * as THREE from "three"
import * as utils from 'three/examples/jsm/utils/BufferGeometryUtils'

let vertexIndex1: number|null = null;
let vertexIndex2: number|null = null;
let mesh1: THREE.Mesh|null = null;
let mesh2: THREE.Mesh|null = null;
export let attachIdList: [number, number][] = [];

export function setVertexIndex1(number: number, mesh: THREE.Mesh){
  vertexIndex1 = number
  mesh1 = mesh
}
export function setVertexIndex2(number: number, mesh: THREE.Mesh){
  vertexIndex2 = number
  mesh2 = mesh
}
export function initVertexIndices(){
  vertexIndex1 = null
  vertexIndex2 = null
  mesh1 = null
  mesh2 = null
}

// this function is handle case only vertex index 1 by 1.
export function attachVertexExpand(scene: THREE.Scene): boolean{
  if (mesh1 === null || mesh2 === null) {
    console.error("Meshes must be set before calling attachVertex.");
    return false;
  }
  if (vertexIndex1 === null || vertexIndex2 === null) {
    console.error("Vertex indices must be set before calling attachVertex.");
    return false;
  }

  const geom1: THREE.BufferGeometry = mesh1.geometry as THREE.BufferGeometry;
  const geom2: THREE.BufferGeometry = mesh2.geometry as THREE.BufferGeometry;

  if(!geom1.index || !geom2.index)
  {
    console.error("geometry index is none.");
    return false;
  }

  // case 1: both mesh is same
  if(mesh1 === mesh2){
    // 같은 경우 merge 하지 않고 사용
    const newIndex = geom1.index.array.map(index=>{
      if(index === vertexIndex2)
        return vertexIndex1!
      else
        return index 
    })
    geom1.setIndex(Array.from(newIndex))

    // vertex index 2가 모두 대체되었는지 확인
    const result = !geom1.index.array.includes(vertexIndex2)
    geom1.computeVertexNormals()
    geom1.attributes.position.needsUpdate = true;
    return result
  }
  // case 2: difference mesh -> merge geometry
  else{

    //#region first method 
    
    const mergedGeom = utils.mergeGeometries([geom1, geom2], false);

    // get index2 after merge
    const geom1IndexCnt: number = Math.max(...Array.from(geom1.index.array)) + 1
    const mergedVertexIndex2 = vertexIndex2 + geom1IndexCnt;

    // flush previous geometries
    geom1.dispose()
    geom2.dispose()

    // index face list에서 merged vertex index 2에 해당하는 인덱스를 vertex index 1으로 대체 
    if(!mergedGeom.index)
    {
      console.error("merged geometry index is none.");
      return false;
    }
    const newIndex = mergedGeom.index.array.map(index=>{
      if(index === mergedVertexIndex2)
        return vertexIndex1!
      else
        return index 
    })
    mergedGeom.setIndex(Array.from(newIndex))

    // mergedGeom에 merged vertex index 2가 모두 대체되었는지 확인
    const result = !mergedGeom.index.array.includes(mergedVertexIndex2)
    mergedGeom.computeVertexNormals()
    mergedGeom.attributes.position.needsUpdate = true;

    // 병합 geometry를 반영하고 남은 mesh 제거
    mesh1.geometry = mergedGeom
    scene.remove(mesh2)

    return result 
    
    //#endregion

    //#region second method
    /*
    const mergedPosition = utils.mergeAttributes([geom1.getAttribute("position") as THREE.BufferAttribute, geom2.getAttribute("position") as THREE.BufferAttribute]);
    const mergedNormal = utils.mergeAttributes([geom1.getAttribute("normal") as THREE.BufferAttribute, geom2.getAttribute("normal") as THREE.BufferAttribute]);
    const mergedUv = utils.mergeAttributes([geom1.getAttribute("uv") as THREE.BufferAttribute, geom2.getAttribute("uv") as THREE.BufferAttribute]);

    // get index2 after merge
    const geom1IndexCnt: number = Math.max(...Array.from(geom1.index.array)) + 1
    const mergedIndex = [ 
      ...geom1.index.array,
      ...geom2.index.array.map(index=>{
        return index + geom1IndexCnt;
      })
    ];
    geom1.setIndex(new THREE.BufferAttribute(new Uint32Array(mergedIndex), 1))

    // index face list에서 merged vertex index 2에 해당하는 인덱스를 vertex index 1으로 대체 
    const mergedVertexIndex2 = vertexIndex2 + geom1IndexCnt;
    if(!geom1.index)
    {
      console.error("merged geometry index is none.");
      return false;
    }
    const newIndex = geom1.index.array.map(index=>{
      if(index === mergedVertexIndex2)
        return vertexIndex1!
      else
        return index 
    })
    geom1.setIndex(Array.from(newIndex))

    // geom1에 attributes 반영
    geom1.setAttribute('position', mergedPosition);
    geom1.setAttribute('normal', mergedNormal);
    geom1.setAttribute('uv', mergedUv);

    // merged vertex index 2가 모두 대체되었는지 확인
    const result = !geom1.index.array.includes(mergedVertexIndex2)
    geom1.computeVertexNormals()
    geom1.attributes.position.needsUpdate = true;

    // 남은 mesh 제거
    scene.remove(mesh2)

    return result
    */
    //#endregion
  }
}

export function attachVertexConstraint(scene: THREE.Scene){
  if (mesh1 === null || mesh2 === null) {
    console.error("Meshes must be set before calling attachVertex.");
    return;
  }
  if (vertexIndex1 === null || vertexIndex2 === null) {
    console.error("Vertex indices must be set before calling attachVertex.");
    return;
  }

  const geom1: THREE.BufferGeometry = mesh1.geometry as THREE.BufferGeometry;
  const geom2: THREE.BufferGeometry = mesh2.geometry as THREE.BufferGeometry;

  if(!geom1.index || !geom2.index)
  {
    console.error("geometry index is none.");
    return;
  }

  // case 1: both mesh is same
  if(mesh1 === mesh2){
    attachIdList.push([vertexIndex1, vertexIndex2]);
  }
  // case 2: difference mesh -> merge geometry
  else{
    //#region first method 

    const mergedGeom = utils.mergeGeometries([geom1, geom2], false);

    // get index2 after merge
    const geom1IndexCnt: number = Math.max(...Array.from(geom1.index.array)) + 1
    const mergedVertexIndex2 = vertexIndex2 + geom1IndexCnt;

    // flush previous geometries
    geom1.dispose()
    geom2.dispose()

    attachIdList.push([vertexIndex1, mergedVertexIndex2]);

    // 병합 geometry를 반영하고 남은 mesh 제거
    mesh1.geometry = mergedGeom
    scene.remove(mesh2)

    return; 
  }
}