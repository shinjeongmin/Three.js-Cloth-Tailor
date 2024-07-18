import * as THREE from "three";

export function separateMesh(scene: THREE.Scene, mesh: THREE.Mesh){
  // BufferGeometry의 속성 추출
  const positionAttribute = mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
  const indexAttribute = mesh.geometry.getIndex() as THREE.BufferAttribute;
  
  // vertex 좌표 추출
  const vertices: THREE.Vector3[] = [];
  for (let i = 0; i < positionAttribute.count; i++) {
      vertices.push(new THREE.Vector3(
          positionAttribute.getX(i),
          positionAttribute.getY(i),
          positionAttribute.getZ(i)
      ));
  }

  // face 인덱스 추출
  const faces: number[][] = [];
  for (let i = 0; i < indexAttribute.count; i += 3) {
      faces.push([
          indexAttribute.getX(i),
          indexAttribute.getX(i + 1),
          indexAttribute.getX(i + 2)
      ]);
  }

  // 각 vertex의 인접 face를 기록
  const adjacencyList = new Map();
  faces.forEach((face, index) => {
      face.forEach(vertexIndex => {
          if (!adjacencyList.has(vertexIndex)) {
              adjacencyList.set(vertexIndex, []);
          }
          adjacencyList.get(vertexIndex).push(index);
      });
  });

  // 방문한 face를 기록하기 위한 배열
  const visitedFaces = new Array(faces.length).fill(false);

  // 깊이 우선 탐색(DFS)을 이용하여 연결된 face 그룹 찾기
  function findConnectedFaces(faceIndex: number, group: number[]) {
      const stack = [faceIndex];
      while (stack.length > 0) {
          const currentFaceIndex: number = stack.pop()!;
          if (visitedFaces[currentFaceIndex]) continue;
          visitedFaces[currentFaceIndex] = true;
          group.push(currentFaceIndex);

          const face = faces[currentFaceIndex];
          face.forEach((vertexIndex: number) => {
            const adjacentFaces = adjacencyList.get(vertexIndex);
            if (adjacentFaces) {
                adjacentFaces.forEach((adjacentFaceIndex: number) => {
                    if (!visitedFaces[adjacentFaceIndex]) {
                        stack.push(adjacentFaceIndex);
                    }
                });
            }
        });
      }
  }

  const groups = [];
  for (let i = 0; i < faces.length; i++) {
      if (!visitedFaces[i]) {
          const group: number[] = [];
          findConnectedFaces(i, group);
          groups.push(group);
      }
  }

  console.log(`분리된 mesh 개수 : `, groups.length)

  // 각 그룹을 새로운 BufferGeometry로 분리
  const separatedGeometries = groups.map(group => {
      const newGeometry = new THREE.BufferGeometry();
      const newVertices: number[] = [];
      const newIndices: number[] = [];
      const vertexMapping = new Map();
      let newIndex = 0;

      group.forEach(faceIndex => {
          const face = faces[faceIndex];
          face.forEach(vertexIndex => {
              if (!vertexMapping.has(vertexIndex)) {
                  vertexMapping.set(vertexIndex, newIndex++);
                  const vertex = vertices[vertexIndex];
                  newVertices.push(vertex.x, vertex.y, vertex.z);
              }
              newIndices.push(vertexMapping.get(vertexIndex));
          });
      });

      newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newVertices, 3));
      newGeometry.setIndex(newIndices);
      newGeometry.computeVertexNormals();

      return newGeometry;
  });

  separatedGeometries.forEach((geometry, index) =>{
    const newMesh: THREE.Mesh = mesh.clone();
    newMesh.geometry = geometry;
    newMesh.name = mesh.name + index

    scene.add(newMesh)
  })

  scene.remove(mesh)
}