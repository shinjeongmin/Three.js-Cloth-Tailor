import * as THREE from 'three';
import * as dat from 'lil-gui';

const exceptionList = ['TransformControls']

class HierarchyUI {
    private gui: dat.GUI;

    constructor() {
        this.gui = new dat.GUI({ title: 'Hierarchy' });
        this.setPosition()
    }

    public buildHierarchy(object: THREE.Object3D): void {
        this.gui.destroy();  // 기존 GUI를 제거
        this.gui = new dat.GUI({ title: 'Hierarchy' });  // 새로운 GUI 생성
        this.setPosition()
        this.addFolder(object, this.gui);
    }

    private setPosition(): void {
        const guiDomElement = this.gui.domElement;
        guiDomElement.style.position = 'absolute';
        guiDomElement.style.top = '0';
        guiDomElement.style.left = '0';
        guiDomElement.style.zIndex = '100';  // GUI가 다른 요소 위에 표시되도록 z-index 설정
    }

    private addFolder(object: THREE.Object3D, parentGui: dat.GUI): void {
        const folder = parentGui.addFolder(object.name || object.type);

        object.children.forEach(child => {
            if(exceptionList.includes(child.name) === false)
            this.addFolder(child, folder);
        });

        if(object.children.length !== 0)
            folder.open(); // folder open when has children 
        else 
            folder.close()
    }
}

export default HierarchyUI;