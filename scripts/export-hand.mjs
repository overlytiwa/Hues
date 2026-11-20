import { writeFile } from 'node:fs/promises';
import * as THREE from 'three';
import { createHand } from '../src/scene/hand.js';
const hand=createHand();hand.updateMatrixWorld(true);
const meshes=[];
hand.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const geometry=mesh.geometry;
  const count=Math.min(geometry.drawRange.count,geometry.index?.count ?? geometry.attributes.position.count);
  const positions=[];const point=new THREE.Vector3();
  const vertexCount=geometry.index?geometry.attributes.position.count:count;
  for(let i=0;i<vertexCount;i++) {
    point.fromBufferAttribute(geometry.attributes.position,i).applyMatrix4(mesh.matrixWorld);
    positions.push(point.x,point.y,point.z);
  }
  const indices=[];
  for(let i=0;i<count;i++)indices.push(geometry.index?geometry.index.getX(i):i);
  meshes.push({positions,indices,color:mesh.material.color.getHexString(),kind:meshes.length===0?'skin':mesh.material.transparent?'crease':mesh.material.clearcoat?'nail':'cuticle'});
});
await writeFile(new URL('./hand-mesh.json',import.meta.url),JSON.stringify(meshes));
console.log('Exported original hand sculpture:',meshes.length,'parts');
