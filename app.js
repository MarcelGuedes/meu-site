// ===== CENA =====
const scene = new THREE.Scene();

// ===== CAMERA =====
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

camera.position.z = 12;

// ===== RENDER =====
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== GLOBO SIMPLES (SEM TEXTURA) =====
const globe = new THREE.Mesh(
  new THREE.SphereGeometry(5, 64, 64),
  new THREE.MeshBasicMaterial({
    color: 0x0077ff,
    wireframe: true
  })
);

scene.add(globe);

// ===== ANIMAÇÃO =====
function animate(){
  requestAnimationFrame(animate);

  globe.rotation.y += 0.005;

  renderer.render(scene, camera);
}

animate();

// ===== RESPONSIVO =====
window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
