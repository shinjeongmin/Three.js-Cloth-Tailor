import * as THREE from "three"
import * as utils from 'three/examples/jsm/utils/BufferGeometryUtils'

let vertexIndex1: number|null = null;
let vertexIndex2: number|null = null;
let attachLineList: THREE.Mesh[] = []

export function setVertexIndex1(number: number){
  vertexIndex1 = number
}
export function setVertexIndex2(number: number){
  vertexIndex2 = number
}

export function attachVertex(mesh1: THREE.Mesh, mesh2: THREE.Mesh){
  if (vertexIndex1 === null || vertexIndex2 === null) {
    console.error("Vertex indices must be set before calling attachVertex.");
    return;
  }

  // case 1: both mesh is same
  if(mesh1 === mesh2){

  }
  // case 2: difference mesh -> merge geometry
  else{
    const geom1: THREE.BufferGeometry = mesh1.geometry as THREE.BufferGeometry;
    const geom2: THREE.BufferGeometry = mesh2.geometry as THREE.BufferGeometry;

    let positions1 = geom1.getAttribute("position");
    let positions2 = geom2.getAttribute("position");
    let normal1 = geom1.getAttribute("normal");
    let normal2 = geom2.getAttribute("normal");
    let uv1 = geom1.getAttribute("uv");
    let uv2 = geom2.getAttribute("uv");

    const mergedGeom = utils.mergeGeometries([geom1, geom2], false);

    // get index2 after merge
    if(!geom1.index)
    {
      console.error("geometry 1 index is none.");
      return;
    }
    const geom1IndexCnt: number = geom1.index.count
    const mergedVertexIndex2 = vertexIndex2 + geom1IndexCnt;
  }
}