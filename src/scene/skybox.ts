import * as THREE from "three";

const skyboxPath = '../../public/skybox/'
export type SKYBOX = 'clothing-store1' | 'clothing-store2' | 'clothing-store3' | 'tailor-shop'
export const skyboxType: SKYBOX[] = [    
  'clothing-store1',
  'clothing-store2',
  'clothing-store3',
  'tailor-shop',
]
// export let skyboxType: SKYBOX = 'clothing-store1'

export function initSkyBox(scene: THREE.Scene){
  const textureLoader = new THREE.CubeTextureLoader()
  textureLoader.load(
    [
      `${skyboxPath+skyboxType[0]}/0.png`, // 앞면
      `${skyboxPath+skyboxType[0]}/1.png`, // 뒷면
      `${skyboxPath+skyboxType[0]}/2.png`, // 위
      `${skyboxPath+skyboxType[0]}/3.png`, // 아래
      `${skyboxPath+skyboxType[0]}/4.png`, // 오른쪽
      `${skyboxPath+skyboxType[0]}/5.png`, // 왼쪽
    ],
    (texture)=>{
      scene.background = texture;
    }
  )
}

export function changeSkyBox(scene: THREE.Scene, type: SKYBOX){
  const textureLoader = new THREE.CubeTextureLoader()
  textureLoader.load(
    [
      `${skyboxPath+type}/0.png`, // 앞면
      `${skyboxPath+type}/1.png`, // 뒷면
      `${skyboxPath+type}/2.png`, // 위
      `${skyboxPath+type}/3.png`, // 아래
      `${skyboxPath+type}/4.png`, // 오른쪽
      `${skyboxPath+type}/5.png`, // 왼쪽
    ],
    (texture)=>{
      scene.background = texture;
    }
  )
}