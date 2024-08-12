import { Mesh, Vector2, Vector3 } from "three";
import ClothSelfCollision, { Collision, ExternalCollision } from "./collision";
import { Constraint, ConstraintFactory } from "./constraint";
import { Hash } from "./hash";
import {
  vecAdd,
  vecCopy,
  vecDistSquared,
  vecLengthSquared,
  vecScale,
  vecSetCross,
  vecSetDiff,
  vecSetZero,
} from "./math";

let height = -0.7

/**
 * Abstract class that all meshes should inherit from to use XPBD physics
 */
export default abstract class PhysicsObject {
  numParticles: number;
  positions: Float32Array;
  prevPositions: Float32Array;
  vels: Float32Array;
  invMass: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
  neighbors: Float32Array;
  constraints: Constraint[];
  constraintFactory: ConstraintFactory;
  collisions: Collision[];

  constructor(mesh: Mesh) {
    this.numParticles = mesh.geometry.attributes.position.count;
    this.positions = new Float32Array(mesh.geometry.attributes.position.array);
    this.normals = new Float32Array(mesh.geometry.attributes.normal.array);
    this.prevPositions = new Float32Array(mesh.geometry.attributes.position.array);
    this.vels = new Float32Array(3 * this.numParticles);
    this.invMass = new Float32Array(this.numParticles);
    this.indices = new Uint16Array(mesh.geometry.index?.array ?? new Array(0));
    this.constraints = [];
    this.collisions = [];

    this.invMass = this.initInvMass();
    this.neighbors = this.findTriNeighbors();

    this.constraintFactory = new ConstraintFactory(
      this.positions,
      this.invMass,
      this.indices,
      this.neighbors,
      null,
      null
    );
  }

  setFloorHeight(_height:number){
    height = _height
  }

  solve(dt: number) {    
    for (let i = 0; i < this.numParticles; i++) {
      // Floor collision ( we currently don't have a need for it)
      let y = this.positions[3 * i + 1];
      if (y < height) {
        vecCopy(this.positions, i, this.prevPositions, i);
        this.positions[3 * i + 1] = height;
      }

      this.positions[3 * i + 1] = this.checkPosition(this.positions[3 * i], this.positions[3 * i + 1], this.positions[3 * i + 2])
    }
    for (const constraint of this.constraints) {
      constraint.solve(dt);
    }

    for (const collision of this.collisions) {
      collision.solve(dt);
    }
  }

  checkPosition(x: number, y: number, z: number): number{
    let resultY = y
    const adjustValue = 0.04

    if(y < 0.25 
      && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.1){
        resultY = 0.25;
    }
    else if(y < 0 
      && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.25){
        resultY = 0;
    }
    else if(y < -0.15
      && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.3){
        resultY = 0;
    }
    else if(y < -0.36
      && vecDistSquared([0,0,0],0,[x,0,z],0) < 0.73
      && -0.5 < x && x < 0.5){
      resultY = -0.36;
    }
    else if(y < -0.375 + adjustValue
      && -0.1 < x && x < 0.1
      && -0.95 < z && z < 0.95){
      resultY = -0.375 + adjustValue
    }
    else if(y < -0.39 + adjustValue
      && -0.1 < x && x < 0.1
      && -1.17 < z && z < 1.17){
      resultY = -0.39 + adjustValue
    }
    else if(y < -0.4 + adjustValue
      && -0.35 < x && x < 0.35 
      && -0.72 < z && z < 0.72){
      resultY = -0.4 + adjustValue
    }
    else if(y < -0.4313 + adjustValue
      && -0.1 < x && x < 0.1
      && -1.3074 < z && z < 1.3074){
      resultY = -0.4313 + adjustValue
    }
    else if(y < -0.4381 + adjustValue
      && -0.3109 < x && x < 0.3109
      && -1.1672 < z && z < 1.1672){
      resultY = -0.4381 + adjustValue
    }
    else if(y < -0.4798 + adjustValue
      && -0.2798 < x && x < 0.2798
      && -1.3049 < z && z < 1.3049){
      resultY = -0.4798 + adjustValue
    }
    else if(y < -0.4844 + adjustValue
      && -0.1 < x && x < 0.1
      && -1.4027 < z && z < 1.4027){
      resultY = -0.4844 + adjustValue
    }
    else if(y < -0.5312 + adjustValue
      && -0.2518 < x && x < 0.2518
      && -1.4001 < z && z < 1.4001){
      resultY = -0.5312 + adjustValue
    }
    else if(y < -0.5443 + adjustValue
      && -0.1 < x && x < 0.1
      && -1.5033 < z && z < 1.5033){
      resultY = -0.5443 + adjustValue
    }
    else if(y < -0.5464 + adjustValue
      && -0.6848 < x && x < 0.6848
      && -0.6369 < z && z < 0.6369){
      resultY = -0.5464 + adjustValue
    }
    else if(y < -0.5779 + adjustValue
      && -0.6191 < x && x < 0.6191
      && -0.9347 < z && z < 0.9347){
      resultY = -0.5779 + adjustValue
    }
    else if(y < -0.5833 + adjustValue
      && -0.782 < x && x < 0.782
      && -0.3195 < z && z < 0.3195){
      resultY = -0.5833 + adjustValue
    }
    else if(y < -0.5862 + adjustValue
      && -0.7971 < x && x < 0.7971
      && -0.1 < z && z < 0.1){
      resultY = -0.5862 + adjustValue
    }
    else if(y < -0.5863 + adjustValue
      && -0.2251 < x && x < 0.2251
      && -1.5004 < z && z < 1.5004){
      resultY = -0.5863 + adjustValue
    }
    else if(y < -0.5974 + adjustValue
      && -0.5486 < x && x < 0.5486
      && -1.1598 < z && z < 1.1598){
      resultY = -0.5974 + adjustValue
    }
    else if(y < -0.6376 + adjustValue
      && -0.4892 < x && x < 0.4892
      && -1.2966 < z && z < 1.2966){
      resultY = -0.6376 + adjustValue
    }
    else if(y < -0.6694 + adjustValue
      && -0.1 < x && x < 0.1
      && -1.5816 < z && z < 1.5816){
      resultY = -0.6694 + adjustValue
    }
    else if(y < -0.6837 + adjustValue
      && -0.4386 < x && x < 0.4386
      && -1.3919 < z && z < 1.3919){
      resultY = -0.6837 + adjustValue
    }
    else if(y < -0.6995 + adjustValue
      && -0.2041 < x && x < 0.2041
      && -1.5765 < z && z < 1.5765){
      resultY = -0.6995 + adjustValue
    }
    else if(y < -0.7218 + adjustValue
      && -0.3882 < x && x < 0.3882
      && -1.491 < z && z < 1.491){
      resultY = -0.7218 + adjustValue
    }
    else if(y < -0.7684 + adjustValue
      && -0.3335 < x && x < 0.3335
      && -1.5557 < z && z < 1.5557){
      resultY = -0.7684 + adjustValue
    }
    else if(y < -0.8468 + adjustValue
      && -0.852 < x && x < 0.852
      && -0.6356 < z && z < 0.6356){
      resultY = -0.8468 + adjustValue
    }
    else if(y < -0.8479 + adjustValue
      && -0.7669 < x && x < 0.7669
      && -0.9225 < z && z < 0.9225){
      resultY = -0.8479 + adjustValue
    }
    else if(y < -0.8528 + adjustValue
      && -0.8829 < x && x < 0.8829
      && -0.3227 < z && z < 0.3227){
      resultY = -0.8528 + adjustValue
    }
    else if(y < -0.855 + adjustValue
      && -0.8827 < x && x < 0.8827
      && -0.1 < z && z < 0.1){
      resultY = -0.855 + adjustValue
    }
    else if(y < -0.8627 + adjustValue
      && -0.6631 < x && x < 0.6631
      && -1.1461 < z && z < 1.1461){
      resultY = -0.8627 + adjustValue
    }
    else if(y < -0.9006 + adjustValue
      && -0.5787 < x && x < 0.5787
      && -1.2819 < z && z < 1.2819){
      resultY = -0.9006 + adjustValue
    }
    else{
      return resultY;
    }
    
    return resultY
  }

  preSolve(dt: number, gravity: Float32Array) {
    for (let i = 0; i < this.numParticles; i++) {  
      if (this.invMass[i] == 0.0) continue;
      vecAdd(this.vels, i, gravity, 0, dt);
      const v = Math.sqrt(vecLengthSquared(this.vels, i));
      const maxV = 0.2 * (0.01 / dt);
      if (v > maxV) {
        vecScale(this.vels, i, maxV / v);
      }
      vecCopy(this.prevPositions, i, this.positions, i);
      vecAdd(this.positions, i, this.vels, i, dt);
    }
  }
  postSolve(dt: number) {
    for (let i = 0; i < this.numParticles; i++) {
      if (this.invMass[i] == 0.0) continue;
      vecSetDiff(
        this.vels,
        i,
        this.positions,
        i,
        this.prevPositions,
        i,
        1.0 / dt
      );
    }
  }
  updateVertexNormals() {
    for (let i = 0; i < this.numParticles; i++) {
      vecSetZero(this.normals, i);
    }
    for (let i = 0; i < this.numParticles; i++) {
      const id0 = this.indices[3 * i];
      const id1 = this.indices[3 * i + 1];
      const id2 = this.indices[3 * i + 2];

      const e0 = [0, 0, 0];
      const e1 = [0, 0, 0];
      const c = [0, 0, 0];

      // Find Area of Triangle
      // Calculate edge vectors from id0
      vecSetDiff(e0, 0, this.positions, id1, this.positions, id0);
      vecSetDiff(e1, 0, this.positions, id2, this.positions, id0);

      // Area of triangle 1/2 |AB x AC|
      vecSetCross(c, 0, e0, 0, e1, 0);

      vecAdd(this.normals, id0, c, 0, 0.333);
      vecAdd(this.normals, id1, c, 0, 0.333);
      vecAdd(this.normals, id2, c, 0, 0.333);
    }
  }
  protected updatePhysics(){
    this.invMass = this.initInvMass();
    this.neighbors = this.findTriNeighbors();
  }

  private initInvMass(): Float32Array {
    const invMass = new Float32Array(this.numParticles);
    const numTris = this.indices.length / 3;
    const e0 = [0.0, 0.0, 0.0]; // edge 0 vector
    const e1 = [0.0, 0.0, 0.0]; // edge 1 vector
    const c = [0.0, 0.0, 0.0]; // cross vector of e0 x e1

    for (let i = 0; i < numTris; i++) {
      const id0 = this.indices[3 * i];
      const id1 = this.indices[3 * i + 1];
      const id2 = this.indices[3 * i + 2];

      // Find Area of Triangle
      // Calculate edge vectors from id0
      vecSetDiff(e0, 0, this.positions, id1, this.positions, id0);
      vecSetDiff(e1, 0, this.positions, id2, this.positions, id0);

      // Area of triangle 1/2 |AB x AC|
      vecSetCross(c, 0, e0, 0, e1, 0);
      const A = 0.5 * Math.sqrt(vecLengthSquared(c, 0)); // magnitude of cross vector

      // Divide mass among 3 points in triangle
      const pInvMass = A > 0.0 ? 1.0 / A / 3.0 : 0.0;

      // Add since vertices may be shared
      invMass[id0] += pInvMass;
      invMass[id1] += pInvMass;
      invMass[id2] += pInvMass;
    }

    return invMass;
  }

  private findTriNeighbors(): Float32Array {
    const edges = [];
    const numTris = this.indices.length / 3;

    for (let i = 0; i < numTris; i++) {
      for (let j = 0; j < 3; j++) {
        const id0 = this.indices[3 * i + j];
        const id1 = this.indices[3 * i + ((j + 1) % 3)];
        edges.push({
          id0: Math.min(id0, id1), // particle 1
          id1: Math.max(id0, id1), // particle 2
          edgeNr: 3 * i + j, // global edge number
        });
      }
    }
    // sort so common edges are next to each other
    edges.sort((a, b) =>
      a.id0 < b.id0 || (a.id0 == b.id0 && a.id1 < b.id1) ? -1 : 1
    );

    // find matching edges
    const neighbors = new Float32Array(3 * numTris);
    neighbors.fill(-1); // -1 means open edge, as in no neighbors

    let i = 0;
    while (i < edges.length) {
      const e0 = edges[i];
      const e1 = edges[i + 1];

      // catch exception: if edges length is odd
      if(edges.length <= i+1) {
        i+=2
        continue
      }
      
      // If the particles share the same edge, update the neighbors list
      // with their neighbors corresponding global edge number
      if (e0.id0 === e1.id0 && e0.id1 === e1.id1) {
        neighbors[e0.edgeNr] = e1.edgeNr;
        neighbors[e1.edgeNr] = e0.edgeNr;
      }
      i += 2;
    }

    return neighbors;
  }
}

export class ClothPhysicsObject extends PhysicsObject {
  thickness: number;
  hash: Hash;
  constructor(mesh: Mesh, thickness: number) {
    super(mesh);
    this.thickness = thickness;

    // Spacing calculated by looking into the obj file and seeing the length between two particles.
    const spacing = thickness;
    this.hash = new Hash(spacing, this.numParticles);
  }

  preIntegration(dt: number) {
    this.hash.create(this.positions);
    this.hash.queryAll(this.positions, ((1 / 60) * 0.2 * this.thickness) / dt);
  }
  /**
   * Adds a DistanceConstraint to the Cloth physics object
   * @param compliance
   */
  public registerDistanceConstraint(compliance: number) {
    this.constraints.push(
      this.constraintFactory.createDistanceConstraint(compliance)
    );
  }

  /**
   * Adds a PerformantBendingConstraint to the Cloth physics object
   * @param compliance
   */
  public registerPerformantBendingConstraint(compliance: number) {
    this.constraints.push(
      this.constraintFactory.createPerformantBendingConstraint(compliance)
    );
  }

  /**
   * Adds an IsometricBendingConstraint to the Cloth physics object
   * @param compliance
   */
  public registerIsometricBendingConstraint(compliance: number) {
    this.constraints.push(
      this.constraintFactory.createIsometricBendingConstraint(compliance)
    );
  }

  /**
   * Adds a Self Collision constraint to the Cloth physics object
   */
  public registerSelfCollision() {
    this.collisions.push(
      new ClothSelfCollision(
        this.positions,
        this.prevPositions,
        this.invMass,
        this.thickness,
        this.hash
      )
    );
  }

  public registerExternalCollision(mesh: Mesh) {
    this.collisions.push(
      new ExternalCollision(
        this.positions,
        this.prevPositions,
        this.invMass,
        this.thickness,
        mesh
      )
    );
  }
}
