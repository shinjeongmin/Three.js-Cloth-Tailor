import { Group, Mesh, Object3DEventMap, TorusGeometry } from 'three'
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