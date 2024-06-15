import * as THREE from 'three'

export function removeVertex(mesh: THREE.Mesh, indexArray: number[]){
  const meshAttribute = mesh.geometry.attributes

  for(let i=0; i<indexArray.length; i++){ 
    const posArr = meshAttribute.position.array
    const normArr = meshAttribute.normal.array
    const uvArr = meshAttribute.uv.array

    const newPosArray = new Float32Array(posArr.length - 3)
    const newNormArray = new Float32Array(normArr.length - 3)
    const newUvArray = new Float32Array(uvArr.length - 2)

    // subarray front of vertex x's index
    newPosArray.set(posArr.subarray(0, indexArray[i]))
    // subarray back of vertex z's index
    newPosArray.set(posArr.subarray((indexArray[i] + 2) + 1), indexArray[i])
    
    newNormArray.set(normArr.subarray(0, indexArray[i]))
    newNormArray.set(normArr.subarray((indexArray[i] + 2) + 1), indexArray[i])

    newUvArray.set(uvArr.subarray(0, indexArray[i]))
    newUvArray.set(uvArr.subarray((indexArray[i] + 1) + 1), indexArray[i])
    
    mesh.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPosArray), 3))
    mesh.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(newNormArray), 3))
    mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(newUvArray), 2))
  }
}