import { Mesh,Vector3 } from "three"
import { ClothPhysicsObject } from "./PBD-simulation/physics-object"
import { ConstraintFactory } from "./PBD-simulation/constraint";

/**
 * Cloth that hangs (like from a clothesline)
 * Uses position based dynamics constraints
 *
 * It is the user's responsibility to register constraints within the app.
 */
export default class Cloth extends ClothPhysicsObject {
  mesh: Mesh
  attachIdList: [number, number][] | null
  vertexFix: boolean
  
  constructor(mesh: Mesh, thickness: number, vertexFix: boolean) {
    super(mesh, thickness)
    this.mesh = mesh
    this.fixVertex(vertexFix)
    this.attachIdList = null
    this.vertexFix = vertexFix
  }

  private fixVertex(vertexFix :boolean) {
    // Set top of cloth to have a mass of 0 to hold still
    // in order to get hanging from clothesline visual
    {
      // Variables to store top row
      let minX = Number.MAX_VALUE
      let maxX = -Number.MAX_VALUE
      let maxY = -Number.MAX_VALUE

      for (let i = 0; i < this.numParticles; i++) {
        minX = Math.min(minX, this.positions[3 * i])
        maxX = Math.max(maxX, this.positions[3 * i])
        maxY = Math.max(maxY, this.positions[3 * i + 1])
      }

      // Thickness of the edge to zero out(?)
      const eps = 0.000001

      if(vertexFix === false) return

      for (let i = 0; i < this.numParticles; i++) {
        const x = this.positions[3 * i]
        const y = this.positions[3 * i + 1]
        if (y > maxY - eps && (x < minX + eps || x > maxX - eps))
          // if (y > maxY - eps)
          this.invMass[i] = 0.0
      }
    }
  }

  public updateMesh(mesh: Mesh, attachIdList: [number,number][] | null = null, collisionMesh: Mesh|null){
    this.updateTransformMatrix(mesh)

    this.numParticles = mesh.geometry.attributes.position.count;
    this.positions = new Float32Array(mesh.geometry.attributes.position.array);
    this.normals = new Float32Array(mesh.geometry.attributes.normal.array);
    this.prevPositions = new Float32Array(mesh.geometry.attributes.position.array);
    this.vels = new Float32Array(3 * this.numParticles);
    this.invMass = new Float32Array(this.numParticles);
    this.indices = new Uint16Array(mesh.geometry.index?.array ?? new Array(0));
    this.constraints = [];
    this.collisions = [];
    this.attachIdList = attachIdList

    this.updatePhysics();

    this.constraintFactory = new ConstraintFactory(
      this.positions,
      this.invMass,
      this.indices,
      this.neighbors,
      attachIdList,
      collisionMesh
    );
    
    this.mesh = mesh
    this.fixVertex(this.vertexFix)
  }

  public updateTransformMatrix(mesh: Mesh){
    const matrix = mesh.matrixWorld;
    const positionAttribute = mesh.geometry.attributes.position;
    
    for (let i = 0; i < positionAttribute.count; i++) {
        const vertex = new Vector3().fromBufferAttribute(positionAttribute, i);
        vertex.applyMatrix4(matrix);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    mesh.matrix.identity().decompose(mesh.position, mesh.quaternion, mesh.scale)
  }
}
