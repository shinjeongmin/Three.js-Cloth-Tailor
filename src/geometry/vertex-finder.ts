import * as THREE from 'three'

/**
 * Finds the closest vertex to a given point on a mesh.
 * 
 * @param intersectPoint - The point on the mesh where the ray intersects.
 * @param mesh - The mesh to find the closest vertex from.
 * @returns The closest vertex to the intersect point.
 */
export function findClosestVertex(intersectPoint: THREE.Vector3, mesh: THREE.Mesh): THREE.Vector3{
  let closestVertex: THREE.Vector3 | null = null
  let closestDistance = Infinity

  const positionAttribute = mesh.geometry.attributes.position
  const vertex = new THREE.Vector3()
  const worldVertex = new THREE.Vector3()
  const worldMatrix = mesh.matrixWorld
  
  for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i)

      // Transform vertex position to world space
      worldVertex.copy(vertex).applyMatrix4(worldMatrix)

      const distance = intersectPoint.distanceToSquared(worldVertex)
      if (distance < closestDistance) {
        closestDistance = distance
        closestVertex = worldVertex.clone()
      }
  }

  return closestVertex!
}

export function findClosestVertexIndex(intersectPoint: THREE.Vector3, mesh: THREE.Mesh): number[]{
  let closestVertexIndex: number
  let closestVertexIndexArray: number[] = []
  let closestDistance = Infinity

  const positionAttribute = mesh.geometry.attributes.position
  const vertex = new THREE.Vector3()
  const worldVertex = new THREE.Vector3()
  const worldMatrix = mesh.matrixWorld
  
  for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i)

      worldVertex.copy(vertex).applyMatrix4(worldMatrix)

      const distance = intersectPoint.distanceToSquared(worldVertex)
      if(distance === closestDistance){
        closestVertexIndexArray.push(i)
      }
      else if (distance < closestDistance) {
        closestDistance = distance
        closestVertexIndex = i
        closestVertexIndexArray = [i]
      }
  }

  return closestVertexIndexArray!
}