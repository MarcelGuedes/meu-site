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

// ===== LUZ =====
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10,10,10);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

// ===== GLOBO =====
const texture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
);

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(5, 64, 64),
  new THREE.MeshStandardMaterial({ map: texture })
);

scene.add(globe);

// ===== DADOS =====
let radios = [];
let points = [];

// ===== FUNÇÃO LAT/LON =====
function latLongToVector3(lat, lon, radius){
  const phi = (90 - lat) * (Math.PI/180);
  const theta = (lon + 180) * (Math.PI/180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ===== CARREGAR RÁDIOS =====
async function carregarRadios(){

  const res = await fetch(
    "https://de1.api.radio-browser.info/json/stations/search?has_geo_info=true&limit=200"
  );

  radios = await res.json();

  radios.forEach((radio, i)=>{

    const lat = parseFloat(radio.latitude);
    const lon = parseFloat(radio.longitude);

    if(isNaN(lat) || isNaN(lon)) return;

    const pos = latLongToVector3(lat, lon, 5.3);

    // PONTO
    const point = new THREE.Mesh(
      new THREE.SphereGeometry(0.25,16,16),
      new THREE.MeshStandardMaterial({
        color:0x00ff00,
        emissive:0x00ff00,
        emissiveIntensity:1.5
      })
    );

    point.position.copy(pos);
    point.userData = { index:i };

    scene.add(point);
    points.push(point);
  });

  document.getElementById("info").innerHTML =
    `🌍 ${points.length} rádios carregadas`;
}

carregarRadios();

// ===== CLICK =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click",(event)=>{

  mouse.x = (event.clientX/window.innerWidth)*2 -1;
  mouse.y = -(event.clientY/window.innerHeight)*2 +1;

  raycaster.setFromCamera(mouse,camera);

  const hits = raycaster.intersectObjects(points);

  if(hits.length > 0){

    const index = hits[0].object.userData.index;
    const radio = radios[index];

    document.getElementById("info").innerHTML =
      `<b>${radio.name}</b><br>${radio.country}`;

    // destaque
    points.forEach((p,i)=>{
      p.material.color.set(i===index ? 0xffff00 : 0x00ff00);
    });

    const player = document.getElementById("player");

    player.pause();
    player.src = radio.url_resolved;
    player.load();

    player.play().catch(()=>{
      document.getElementById("info").innerHTML +=
        "<br><small>Rádio bloqueada</small>";
    });
  }
});

// ===== ANIMAÇÃO =====
function animate(){
  requestAnimationFrame(animate);

  globe.rotation.y += 0.0015;

  renderer.render(scene,camera);
}

animate();

// ===== RESPONSIVO =====
window.addEventListener("resize",()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});
