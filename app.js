const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 🌍 TEXTURA REAL DA TERRA
const loader = new THREE.TextureLoader();
const texture = loader.load(
  "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
);

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(5, 64, 64),
  new THREE.MeshStandardMaterial({ map: texture })
);

scene.add(globe);

// 💡 LUZ
const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(10, 10, 10);
scene.add(light);

// 📷 CÂMERA
camera.position.z = 12;

// 📡 RÁDIOS
let radios = [];
let radioPoints = [];

// 🔄 CONVERTER LAT/LONG
function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// 📡 BUSCAR RÁDIOS DA INTERNET
async function carregarRadios() {
  const res = await fetch(
    "https://de1.api.radio-browser.info/json/stations/topclick/100"
  );

  radios = await res.json();

  radios.forEach((radio, idx) => {

    if (!radio.latitude || !radio.longitude) return;

    const pos = latLongToVector3(
      parseFloat(radio.latitude),
      parseFloat(radio.longitude),
      5.2
    );

    const point = new THREE.Mesh(
     new THREE.SphereGeometry(0.25, 16, 16),
      new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  emissive: 0x00ff00,
  emissiveIntensity: 1
})

    point.position.copy(pos);
    point.userData = { idx };

    scene.add(point);
    radioPoints.push(point);
  });

  document.getElementById('info').innerHTML =
    "🌍 Rádios carregadas! Clique em um ponto";
}

carregarRadios();

// 🎯 CLIQUE
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(radioPoints);

  if (intersects.length > 0) {

    const idx = intersects[0].object.userData.idx;
    const radio = radios[idx];

    document.getElementById('info').innerHTML =
      `<b>${radio.name}</b><br>${radio.country}`;

    radioPoints.forEach((p,i) =>
      p.material.color.set(i === idx ? 0xffff00 : 0x00ff00)
    );

    const player = document.getElementById('player');

    player.pause();
    player.src = radio.url_resolved;
    player.load();

    player.play().catch(() => {
      document.getElementById('info').innerHTML +=
        "<br><small>Essa rádio bloqueou o player</small>";
    });
  }
});

// 🔄 ANIMAÇÃO
function animate() {
  requestAnimationFrame(animate);

  globe.rotation.y += 0.0015;

  renderer.render(scene, camera);
}

animate();

// 📱 RESPONSIVO
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
