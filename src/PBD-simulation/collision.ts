import { Hash } from "./hash";
import {
  vecAdd,
  vecDistSquared,
  vecLengthSquared,
  vecScale,
  vecSetDiff,
  vecSetSum,
} from "./math";
import * as THREE from 'three'

export abstract class Collision {
  protected positions: Float32Array;
  protected prevPositions: Float32Array;
  protected invMass: Float32Array;
  protected vecs: Float32Array;
  protected numParticles: number;

  constructor(
    positions: Float32Array,
    prevPositions: Float32Array,
    invMass: Float32Array
  ) {
    this.positions = positions;
    this.prevPositions = prevPositions;
    this.invMass = invMass;
    this.vecs = new Float32Array(12);
    this.numParticles = positions.length / 3;
  }

  /**
   * Updates positions during an animation step
   */
  abstract solve(dt: number): void;
}
/**
 * Collision constraints specfic to cloth
 */

export default class ClothSelfCollision extends Collision {
  private thickness: number;
  private restPositions: Float32Array;
  private hash: Hash;
  constructor(
    positions: Float32Array,
    prevPositions: Float32Array,
    invMass: Float32Array,
    thickness: number,
    hash: Hash
  ) {
    super(positions, prevPositions, invMass);
    this.thickness = thickness;
    this.restPositions = new Float32Array(positions);
    this.hash = hash;
  }
  solve(dt: number) {
    // Square to compare with dist2
    // We can do this to save a sqrt operation
    const thickness2 = this.thickness * this.thickness;

    for (let id0 = 0; id0 < this.numParticles; id0++) {
      if (this.invMass[id0] == 0.0) continue;
      const adjacentParticles = this.hash.getAdjacentParticles(id0);

      for (const id1 of adjacentParticles) {
        if (this.invMass[id1] == 0.0) continue;

        // Determine if the distance between the two particles is smaller than
        // the thickness... which would signify that the particles are overlapping
        // each other.
        vecSetDiff(this.vecs, 0, this.positions, id1, this.positions, id0);
        const dist2 = vecLengthSquared(this.vecs, 0);
        if (dist2 > thickness2 || dist2 === 0.0) continue;

        // If the particles have smaller rest distances than
        // the thickness, use that to make the position correction.
        const restDist2 = vecDistSquared(
          this.restPositions,
          id0,
          this.restPositions,
          id1
        );

        let minDist = this.thickness;
        if (dist2 > restDist2) continue;
        if (restDist2 < thickness2) minDist = Math.sqrt(restDist2);

        // Position correction
        // Now finally do the sqrt op
        const dist = Math.sqrt(dist2);
        const correctionDist = minDist - dist;
        if (correctionDist > 0.0) {
          vecScale(this.vecs, 0, correctionDist / dist);
          vecAdd(this.positions, id0, this.vecs, 0, -0.5);
          vecAdd(this.positions, id1, this.vecs, 0, 0.5);

          // Friction Handling
          const dampingCoefficient = -1;

          if (dampingCoefficient > 0) {
            // velocities
            vecSetDiff(
              this.vecs,
              0,
              this.positions,
              id0,
              this.prevPositions,
              id0
            );
            vecSetDiff(
              this.vecs,
              1,
              this.positions,
              id1,
              this.prevPositions,
              id1
            );

            // average velocity
            vecSetSum(this.vecs, 2, this.vecs, 0, this.vecs, 1, 0.5);

            // velocity corrections by modifying them.
            vecSetDiff(this.vecs, 0, this.vecs, 2, this.vecs, 0);
            vecSetDiff(this.vecs, 1, this.vecs, 2, this.vecs, 1);

            // add corrections
            vecAdd(this.positions, id0, this.vecs, 0, dampingCoefficient);
            vecAdd(this.positions, id1, this.vecs, 1, dampingCoefficient);
          }
        }
      }
    }
  }
}

export class ExternalCollision extends Collision {
  private mesh: THREE.Mesh;
  private thickness: number;
  private boundingBox: THREE.Box3;

  constructor(
    positions: Float32Array,
    prevPositions: Float32Array,
    invMass: Float32Array,
    thickness: number,
    mesh: THREE.Mesh
  ) {
    super(positions, prevPositions, invMass);
    this.thickness = thickness;
    this.mesh = mesh;
    this.boundingBox = new THREE.Box3().setFromObject(mesh);
  }

  solve(dt: number) {
    const inverseMatrix = new THREE.Matrix4().copy(this.mesh.matrixWorld).invert();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(this.mesh.matrixWorld);
    const thickness2 = this.thickness * this.thickness;

    for (let id0 = 0; id0 < this.numParticles; id0++) {
      if (this.invMass[id0] === 0.0) continue;

      // 파티클의 위치를 메쉬의 로컬 좌표계로 변환
      const particlePos = new THREE.Vector3(
        this.positions[id0 * 3],
        this.positions[id0 * 3 + 1],
        this.positions[id0 * 3 + 2]
      ).applyMatrix4(inverseMatrix);

      // 파티클이 바운딩 박스 내에 있는지 확인
      if (!this.boundingBox.containsPoint(particlePos)) continue;

      // 메쉬에서 가장 가까운 점과 해당 점의 법선을 찾음
      const closestPoint = this.getClosestPointOnMesh(particlePos);
      const normal = new THREE.Vector3().copy(closestPoint.normal).applyMatrix3(normalMatrix).normalize();

      // 파티클과 메쉬 사이의 거리 계산
      vecSetDiff(this.vecs, 0, 
        new Float32Array([closestPoint.point.x, closestPoint.point.y, closestPoint.point.z]), 
        0, 
        new Float32Array([particlePos.x, particlePos.y, particlePos.z]), 
        0);
      const dist2 = vecLengthSquared(this.vecs, 0);

      if (dist2 < thickness2 && dist2 > 0) {
        // 침투를 방지하기 위한 위치 수정
        const dist = Math.sqrt(dist2);
        const correctionDist = this.thickness - dist;

        if (correctionDist > 0.0) {
          vecScale(this.vecs, 0, correctionDist / dist);
          vecAdd(this.positions, id0, this.vecs, 0, -1.0);

          // 강체에 임펄스를 적용
          this.applyImpulseToRigidBody(normal, correctionDist, id0, dt);
        }
      }
    }
  }

  private getClosestPointOnMesh(point: THREE.Vector3): { point: THREE.Vector3, normal: THREE.Vector3 } {
    const raycaster = new THREE.Raycaster(point, new THREE.Vector3(0, 0, 0), 0, Infinity);
    const intersects = raycaster.intersectObject(this.mesh);

    if (intersects.length > 0) {
      return { point: intersects[0].point, normal: intersects[0].face!.normal };
    }

    // 교차점이 없는 경우에 대한 처리 (필요시 기본값 반환)
    return { point, normal: new THREE.Vector3(0, 0, 0) };
  }

  private applyImpulseToRigidBody(normal: THREE.Vector3, correctionDist: number, id: number, dt: number) {
    // 파티클의 속도 계산
    const velocity = new THREE.Vector3(
      (this.positions[id * 3] - this.prevPositions[id * 3]) / dt,
      (this.positions[id * 3 + 1] - this.prevPositions[id * 3 + 1]) / dt,
      (this.positions[id * 3 + 2] - this.prevPositions[id * 3 + 2]) / dt
    );

    // 강체에 적용될 임펄스 계산
    const impulseMagnitude = correctionDist / (dt * this.invMass[id]);
    const impulse = normal.multiplyScalar(impulseMagnitude);

    // 강체에 임펄스 적용 (구체적인 강체 시스템에 따라 다르게 구현)
    if (this.mesh.userData.rigidBody) {
      const rigidBody = this.mesh.userData.rigidBody;
      const contactPoint = new THREE.Vector3(
        this.positions[id * 3],
        this.positions[id * 3 + 1],
        this.positions[id * 3 + 2]
      );

      // 강체에 임펄스 적용
      rigidBody.applyImpulse(impulse, contactPoint);
    }
  }
}