import * as THREE from "three";

/**
 * @param mesh 
 * @param vertexIdxList: edge vertex index
 * @returns 
 */
export function edgeCut(mesh: THREE.Mesh, vertexIdxList: number[]){
  let edgeFaces:[number,number,number][] = []
  const faces = mesh.geometry.index?.array!

  // edge를 포함한 face들 모두 찾기
  // find all face include edge
  for (let i = 0; i < faces?.length; i+=3) {
    const curFace: [number, number, number] = [faces[i], faces[i + 1], faces[i + 2]];

    // Check if curFace includes any vertex from vertexIdxList
    if (vertexIdxList.some(vertex => curFace.includes(vertex))) {
      edgeFaces.push(curFace)
    }
  }

  // edgeFaces에 포함된 모든 정점의 인덱스를 추출
  // Extract the indices of all vertices contained in edgeFaces
  const edgeVertices = new Set<number>()
  edgeFaces.forEach(face => {
    face.forEach(vertex => edgeVertices.add(vertex))
  })
  const edgeVertexList = Array.from(edgeVertices)

  // find first add group vertex index 
  let twoVertexIsEdgeVertices: number[] | null = [];
  for (const face of edgeFaces) {
    const idxInList = face.filter(v => vertexIdxList.includes(v)).length;
    if (idxInList === 2) {
      twoVertexIsEdgeVertices.push(face.find(v => !vertexIdxList.includes(v))!)
    }
  }

  if (twoVertexIsEdgeVertices.length === 0) {
    console.log("No suitable vertex found for firstCheckVertex.");
    return;
  }

  let AGroupVertices = new Set<number>();
  let BGroupVertices = new Set<number>();

  // A group vertices 설정
  let stack = [twoVertexIsEdgeVertices[0]];
  while (stack.length > 0) {
    const vertex = stack.pop()!;
    if (!AGroupVertices.has(vertex)) {
      AGroupVertices.add(vertex);
      for (const face of edgeFaces) {
        if (face.includes(vertex)) {
          for (const v of face) {
            if (twoVertexIsEdgeVertices.includes(v) && !AGroupVertices.has(v)) {
              stack.push(v);
            }
          }
        }
      }
    }
  }

  // 남은 twoVertexIsEdgeVertices에서 B group vertices 설정
  twoVertexIsEdgeVertices = twoVertexIsEdgeVertices.filter(v => !AGroupVertices.has(v));
  if (twoVertexIsEdgeVertices.length > 0) {
    stack = [twoVertexIsEdgeVertices[0]];
    while (stack.length > 0) {
      const vertex = stack.pop()!;
      if (!BGroupVertices.has(vertex)) {
        BGroupVertices.add(vertex);
        for (const face of edgeFaces) {
          if (face.includes(vertex)) {
            for (const v of face) {
              if (twoVertexIsEdgeVertices.includes(v) && !BGroupVertices.has(v)) {
                stack.push(v);
              }
            }
          }
        }
      }
    }
  }

  let newAGroupVertices = new Set(AGroupVertices);
  let newBGroupVertices = new Set(BGroupVertices);
  // edgeVertices 정점 인덱스 중에서 각 group에 추가할 vertex 설정
  for (const face of edgeFaces) {
    const otherVertices = face.filter(v => !vertexIdxList.includes(v));
    const AGroupFaceVertices = face.filter(v => AGroupVertices.has(v));
    const BGroupFaceVertices = face.filter(v => BGroupVertices.has(v));
    if (AGroupFaceVertices.length > 0) {
      for (const v of otherVertices) {
        if (!AGroupVertices.has(v)) {
          newAGroupVertices.add(v);
        }
      }
    }
    if (BGroupFaceVertices.length > 0) {
      for (const v of otherVertices) {
        if (!BGroupVertices.has(v)) {
          newBGroupVertices.add(v);
        }
      }
    }
  }
  // 추가된 vertex 반영
  newAGroupVertices.forEach(vertex => AGroupVertices.add(vertex));
  newBGroupVertices.forEach(vertex => BGroupVertices.add(vertex));

  // A group faces와 B group faces 설정
  let AGroupFaces: [number, number, number][] = [];
  let BGroupFaces: [number, number, number][] = [];
  for (const face of edgeFaces) {
    if (face.some(v => AGroupVertices.has(v))) {
      AGroupFaces.push(face);
      continue;
    }
    if (face.some(v => BGroupVertices.has(v))) {
      BGroupFaces.push(face);
      continue;
    }
  }

  // vertexIdxList에 해당하는 vertex들 만큼 mesh index의 새로운 index로 추가하고 geometry attribute 업데이트
  const newVertices: number[] = [];
  const positionAttribute = mesh.geometry.attributes.position;
  const originalVertexCount = positionAttribute.count;

  for (const idx of vertexIdxList) {
    const x = positionAttribute.getX(idx);
    const y = positionAttribute.getY(idx);
    const z = positionAttribute.getZ(idx);
    newVertices.push(x, y, z);
  }

  const newVertexCount = newVertices.length / 3;
  const newIndicesMap = new Map<number, number>();
  for (let i = 0; i < newVertexCount; i++) {
    newIndicesMap.set(vertexIdxList[i], originalVertexCount + i);
  }

  const newPositionArray = new Float32Array(positionAttribute.array.length + newVertices.length);
  newPositionArray.set(positionAttribute.array);
  newPositionArray.set(newVertices, positionAttribute.array.length);
  mesh.geometry.setAttribute('position', new THREE.BufferAttribute(newPositionArray, 3));

  // B 그룹 face의 원래 상태를 저장
  const beforeBGroupFaces = BGroupFaces.map(face => [...face] as [number, number, number]);

  // B group face에서 기존에 vertexIdxList의 vertex에 해당되는 부분을 새로 추가한 index로 대체해서 반영
  for (let i = 0; i < BGroupFaces.length; i++) {
    const face = BGroupFaces[i];
    for (let j = 0; j < 3; j++) {
      if (vertexIdxList.includes(face[j])) {
        face[j] = newIndicesMap.get(face[j])!;
      }
    }
  }

  // 원래 faces 배열을 업데이트하여 B group face들의 위치에 대체된 index를 반영
  for (let i = 0; i < faces.length; i += 3) {
    const curFace: [number, number, number] = [faces[i], faces[i + 1], faces[i + 2]];
    const bFaceIndex = beforeBGroupFaces.findIndex(bFace => 
      (bFace[0] === curFace[0] && bFace[1] === curFace[1] && bFace[2] === curFace[2]) ||
      (bFace[0] === curFace[0] && bFace[1] === curFace[2] && bFace[2] === curFace[1]) ||
      (bFace[0] === curFace[1] && bFace[1] === curFace[0] && bFace[2] === curFace[2]) ||
      (bFace[0] === curFace[1] && bFace[1] === curFace[2] && bFace[2] === curFace[0]) ||
      (bFace[0] === curFace[2] && bFace[1] === curFace[0] && bFace[2] === curFace[1]) ||
      (bFace[0] === curFace[2] && bFace[1] === curFace[1] && bFace[2] === curFace[0])
    );

    if (bFaceIndex !== -1) {
      const updatedFace = BGroupFaces[bFaceIndex];
      faces[i] = updatedFace[0];
      faces[i + 1] = updatedFace[1];
      faces[i + 2] = updatedFace[2];
    }
  }

  mesh.geometry.setIndex(new THREE.BufferAttribute(faces, 1));
}