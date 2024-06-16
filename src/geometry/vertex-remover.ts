import * as THREE from 'three'

/**
 * @param mesh 
 * @param rmIdx 
 * 해당 함수는 vertex index를 지우기만 하고
 * geometry position에서 vertex 정보를 제거하지는 않는 함수이다 
 * 그래서 실제로는 존재하는 vertex를 mesh face에서만 제거하는 방식
 */
export function removeFace(mesh: THREE.Mesh, rmIdx: number){
  const meshAttribute = mesh.geometry.attributes
  const meshIndex = mesh.geometry.index

  const posArr = meshAttribute.position.array
  const normArr = meshAttribute.normal.array
  const uvArr = meshAttribute.uv.array
  const idxArr = meshIndex?.array
  let newIndices

  if (!idxArr) {
    throw new Error('Geometry must have an index.')
  }

  console.log(idxArr)
  const faceList = []
  for(let i=0; i<idxArr.length; i+=3){
    faceList.push([idxArr[i], idxArr[i+1], idxArr[i+2]]) // face 하나에 index 3개
  } 
  const newFaceList = []
  for(let i=0; i<faceList.length; i++){ // rmIdx가 포함된 face를 찾아 없애기
    if(faceList[i].includes(rmIdx) === false){
      newFaceList.push(faceList[i])
    }
  }
  console.log(`new : `)
  console.log(newFaceList)

  // convert number[][] to float32array
  newIndices = newFaceList.reduce((acc, val) => acc.concat(val), [])
  console.log(newIndices)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normArr), 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArr), 2))
  geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndices), 1))

  console.log(mesh.geometry)
  console.log(geometry)

  mesh.geometry = geometry
}