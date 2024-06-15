import * as THREE from 'three'

export function removeVertex(mesh: THREE.Mesh, index: number){
  const meshAttribute = mesh.geometry.attributes
  const meshIndex = mesh.geometry.index

  const newPositions = []
  const newIndices = []
  const vertexMap = new Map<number, number>()
  let newIndex = 0

  const posArr = meshAttribute.position.array
  const normArr = meshAttribute.normal.array
  const uvArr = meshAttribute.uv.array
  const idxArr = meshIndex?.array

  if (!idxArr) {
    throw new Error('Geometry must have an index.')
  }

  // Copy positions to the new array, skipping the vertex to be removed
  for (let i = 0; i < meshAttribute.position.count; i++) {
    if (i === index) {
      continue
    }
    vertexMap.set(i, newIndex++)
    newPositions.push(meshAttribute.position.getX(i), meshAttribute.position.getY(i), meshAttribute.position.getZ(i))
  }
  // Copy indices to the new array, mapping old indices to new ones
  for (let i = 0; i < idxArr.length; i++) {
    if (idxArr[i] !== index) { // || idxArr[i] !== index+1 || idxArr[i] !== index+2) {
      newIndices.push(vertexMap.get(idxArr[i]))
    }
  }

  console.log(newPositions)
  console.log(newIndices)
  // Create new BufferGeometry
  const newGeometry = new THREE.BufferGeometry()
  newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3))
  newGeometry.setIndex(newIndices)

  mesh.geometry = newGeometry

  /*
  // subarray front of vertex x's index
  newPosArray.set(posArr.subarray(0, index))
  // subarray back of vertex z's index
  newPosArray.set(posArr.subarray((index + 2) + 1), index)
  
  newNormArray.set(normArr.subarray(0, index))
  newNormArray.set(normArr.subarray((index + 2) + 1), index)
  
  newUvArray.set(uvArr.subarray(0, index))
  newUvArray.set(uvArr.subarray((index + 1) + 1), index)
  
  mesh.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPosArray), 3))
  mesh.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(newNormArray), 3))
  mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(newUvArray), 2))
  
  */
}