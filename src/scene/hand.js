import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';

// Original procedural hand sculpture. Smooth unions join the palm, forearm,
// thumb and four curled fingers into one continuous surface. No stock mesh,
// photograph or generated image is used.
const smoothMin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * .25;
};

function ellipsoid(x, y, z, cx, cy, cz, rx, ry, rz) {
  x -= cx; y -= cy; z -= cz;
  const k0 = Math.sqrt(x*x/(rx*rx) + y*y/(ry*ry) + z*z/(rz*rz));
  const k1 = Math.sqrt(x*x/(rx**4) + y*y/(ry**4) + z*z/(rz**4));
  return k0 * (k0 - 1) / Math.max(k1, .00001);
}

function capsule(x, y, z, a, b, radius) {
  const px=x-a[0], py=y-a[1], pz=z-a[2];
  const bx=b[0]-a[0], by=b[1]-a[1], bz=b[2]-a[2];
  const h=Math.max(0, Math.min(1, (px*bx+py*by+pz*bz)/(bx*bx+by*by+bz*bz)));
  return Math.hypot(px-bx*h, py-by*h, pz-bz*h)-radius;
}

function createSkin() {
  const skin = new THREE.MeshPhysicalMaterial({
    color: '#b38c74', roughness: .55, metalness: 0,
    clearcoat: .13, clearcoatRoughness: .7,
  });
  skin.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSkinPosition;');
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvSkinPosition = position;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vSkinPosition;
      float skinNoise(vec3 p) {
        vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        float n=dot(i,vec3(1.0,57.0,113.0));
        return mix(mix(mix(fract(sin(n)*43758.5453),fract(sin(n+1.0)*43758.5453),f.x),mix(fract(sin(n+57.0)*43758.5453),fract(sin(n+58.0)*43758.5453),f.x),f.y),mix(mix(fract(sin(n+113.0)*43758.5453),fract(sin(n+114.0)*43758.5453),f.x),mix(fract(sin(n+170.0)*43758.5453),fract(sin(n+171.0)*43758.5453),f.x),f.y),f.z);
      }`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float grain=skinNoise(vSkinPosition*420.0);
      float mottling=skinNoise(vSkinPosition*20.0);
      diffuseColor.rgb *= mix(vec3(0.92,0.86,0.84),vec3(1.04,1.01,0.98),mottling);
      diffuseColor.rgb *= 0.97+grain*0.06;
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      float poreA=skinNoise(vSkinPosition*480.0)-0.5;
      float poreB=skinNoise(vSkinPosition*480.0+31.7)-0.5;
      normal=normalize(normal+vec3(poreA*0.055,poreB*0.055,0.0));
    `);
  };
  return skin;
}

export function createHand() {
  const group = new THREE.Group();
  const skin = createSkin();
  const resolution = 104;
  const surface = new MarchingCubes(resolution, skin, false, false, 160000);
  surface.isolation = 0;
  const bones = [
    // Fingers curl behind the handset and return over its left edge.
    [[ .65,-.5,-.53],[-1.10,.72,-.42],.235],
    [[-1.10,.72,-.42],[-1.40,.72,.04],.235],
    [[-1.40,.72,.04],[-1.35,.49,.30],.235],
    [[ .52,-1.05,-.58],[-1.15,-.03,-.40],.25],
    [[-1.15,-.03,-.40],[-1.46,-.03,.05],.25],
    [[-1.46,-.03,.05],[-1.39,-.25,.32],.245],
    [[ .48,-1.65,-.57],[-1.14,-.77,-.37],.235],
    [[-1.14,-.77,-.37],[-1.45,-.77,.08],.235],
    [[-1.45,-.77,.08],[-1.35,-.97,.30],.23],
    [[ .50,-2.10,-.50],[-1.00,-1.48,-.34],.21],
    [[-1.00,-1.48,-.34],[-1.37,-1.48,.10],.21],
    [[-1.37,-1.48,.10],[-1.23,-1.69,.28],.205],
    // The thumb follows the right edge rather than crossing the app button.
    [[1.13,-2.00,-.50],[1.55,-1.12,-.08],.28],
    [[1.55,-1.12,-.08],[1.55,-.35,.36],.29],
    [[1.55,-.35,.36],[1.34,.02,.52],.25],
  ];
  const scale = 5.6, offsetY = -1.6;
  for (let z=1;z<resolution-1;z++) for(let y=1;y<resolution-1;y++) for(let x=1;x<resolution-1;x++) {
    const wx=(x/resolution*2-1)*scale;
    const wy=(y/resolution*2-1)*scale+offsetY;
    const wz=(z/resolution*2-1)*scale;
    let d=ellipsoid(wx,wy,wz,.42,-1.95,-.54,1.02,1.12,.43);
    d=smoothMin(d,ellipsoid(wx,wy,wz,.76,-2.95,-.42,.67,1.1,.41),.36);
    d=smoothMin(d,ellipsoid(wx,wy,wz,.93,-5.1,-.48,.70,2.3,.43),.3);
    d=smoothMin(d,ellipsoid(wx,wy,wz,1.00,-1.8,-.45,.44,.78,.32),.23);
    for (const [a,b,r] of bones) d=smoothMin(d,capsule(wx,wy,wz,a,b,r),.12);
    surface.field[x+y*resolution+z*resolution*resolution]=-d;
  }
  surface.update();
  surface.scale.setScalar(scale);
  surface.position.y=offsetY;
  group.add(surface);

  const nailMaterial=new THREE.MeshPhysicalMaterial({color:'#c6a99a',roughness:.32,metalness:0,clearcoat:.5,clearcoatRoughness:.28});
  const cuticleMaterial=new THREE.MeshStandardMaterial({color:'#a67c67',roughness:.7});
  function nail(x,y,z,sx,sy,rotation=0) {
    const cuticle=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),cuticleMaterial);
    cuticle.scale.set(sx*1.09,sy*1.07,.046);cuticle.position.set(x,y,z-.014);cuticle.rotation.z=rotation;group.add(cuticle);
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),nailMaterial);
    mesh.scale.set(sx,sy,.04);mesh.position.set(x,y,z+.012);mesh.rotation.z=rotation;group.add(mesh);
  }
  nail(1.39,-.08,.759,.164,.239,-.43);
  // Only a slim strip of each curled nail is visible around the handset.
  nail(-1.43,.55,.50,.11,.16,-.18);
  nail(-1.47,-.18,.53,.12,.16,-.15);
  nail(-1.44,-.90,.50,.11,.15,-.12);
  nail(-1.32,-1.60,.46,.09,.13,-.25);

  const creaseMaterial=new THREE.MeshBasicMaterial({color:'#754d3c',transparent:true,opacity:.2});
  function crease(points,r=.006) {
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve,18,r,4,false),creaseMaterial));
  }
  crease([[1.35,-.66,.49],[1.48,-.70,.58],[1.64,-.69,.52]]);
  crease([[1.35,-.72,.49],[1.48,-.75,.58],[1.64,-.74,.52]],.004);
  crease([[.53,-3.10,-.01],[.78,-3.16,.01],[1.12,-3.12,-.02]],.006);
  crease([[.56,-3.17,-.01],[.81,-3.22,.01],[1.12,-3.18,-.02]],.004);
  return group;
}
