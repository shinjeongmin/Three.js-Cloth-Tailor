import { BufferAttribute, BufferGeometry, Group, Mesh, Object3DEventMap, TorusGeometry } from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

export async function loadOBJ(url: string): Promise<Group<Object3DEventMap>>{
  const objLoader: OBJLoader = new OBJLoader()
  let group: Group

  group = await objLoader.loadAsync(
    url,
    function(xhr){ // progress
      console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    }
  )
  
  return group
}

type ObjFile = string;
type FilePath = string;

type CacheVertice = number;
type CacheFace = string;
type CacheNormal = number;
type CacheUv = number;
type CacheArray<T> = T[][];

type toBeFloat32 = number;
type toBeUInt16 = number;

export default class CustomOBJLoader {
  mesh = new Mesh()
  constructor() {}
  async load(filePath: FilePath): Promise<ObjFile> {
    let resp = await fetch(filePath);
    if (!resp.ok) {
      throw new Error(
        `CustomOBJLoader could not fine file at ${filePath}. Please check your path.`
      );
    }
    let file = await resp.text();

    if (file.length === 0) {
      throw new Error(`${filePath} File is empty.`);
    }

    return file;
  }

  /**
   * Parse a given obj file into a Mesh
   */
  parse(file: ObjFile): Mesh {
    const lines = file?.split("\n");

    // Store what's in the object file here
    const cachedVertices: CacheArray<CacheVertice> = [];
    const cachedFaces: CacheArray<CacheFace> = [];
    const cachedNormals: CacheArray<CacheNormal> = [];
    const cachedUvs: CacheArray<CacheUv> = [];

    // Read out data from file and store into appropriate source buckets
    {
      for (const untrimmedLine of lines) {
        const line = untrimmedLine.trim(); // remove whitespace
        const [startingChar, ...data] = line.split(" ");
        switch (startingChar) {
          case "v":
            cachedVertices.push(data.map(parseFloat));
            break;
          case "vt":
            cachedUvs.push(data.map(Number));
            break;
          case "vn":
            cachedNormals.push(data.map(parseFloat));
            break;
          case "f":
            cachedFaces.push(data);
            break;
        }
      }
    }

    // Use these intermediate arrays to leverage Array API (.push)
    const finalPosition: toBeFloat32[] = [];
    const finalNormals: toBeFloat32[] = [];
    const finalUvs: toBeFloat32[] = [];
    const finalIndices: toBeUInt16[] = [];

    // Loop through faces, and return the buffers that will be sent to GPU for rendering
    {
      const cache: Record<string, number> = {};
      let i = 0;
      for (const faces of cachedFaces) {
        // calculate triangle count in faces
        const triangleCount = faces.length - 2;
        for(var j = 0; j < triangleCount; j++) {
          const triangleFace : string[] = [faces[0]];
          triangleFace.push(faces[1 + j]);
          triangleFace.push(faces[2 + j]);

          for (const faceString of triangleFace) {
            // If we already saw this, add to indices list.
            if (cache[faceString] !== undefined) {
              finalIndices.push(cache[faceString]);
              continue;
            }
  
            cache[faceString] = i;
            finalIndices.push(i);
  
            // Need to convert strings to integers, and subtract by 1 to get to zero index.
            const [vI, uvI, nI] = faceString
              .split("/")
              .map((s: string) => Number(s) - 1);
  
            vI > -1 && finalPosition.push(...cachedVertices[vI]);
            uvI > -1 && finalUvs.push(...cachedUvs[uvI]);
            nI > -1 && finalNormals.push(...cachedNormals[nI]);
  
            i += 1;
          }
        }
      }
    }

    const newGeometry = new BufferGeometry()
    newGeometry.setAttribute('position', new BufferAttribute(new Float32Array(finalPosition), 3))
    newGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(finalUvs), 2))
    newGeometry.setAttribute('normal', new BufferAttribute(new Float32Array(finalNormals), 3))
    newGeometry.index = new BufferAttribute(new Uint16Array(finalIndices), 1)
    this.mesh.geometry = newGeometry
    return this.mesh.clone()

    // return {
    //   positions: new Float32Array(finalPosition),
    //   uvs: new Float32Array(finalUvs),
    //   normals: new Float32Array(finalNormals),
    //   indices: new Uint16Array(finalIndices),
    // }
  }
}
