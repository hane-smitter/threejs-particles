import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

let camera, scene, renderer, stats, parameters;
let mouse = { X: 0, Y: 0 };

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const materials = [];

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 1000;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0008);

  const particleSystems = createParticleSystems();

  // Add particleSystems to scene
  for (let i = 0; i < particleSystems.length; i++) {
    scene.add(particleSystems[i]);
  }

  // rendering output to the browser
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio = window.devicePixelRatio;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Showing stats
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // Modify with 3D Object with GUI
  const gui = new GUI();
  const params = {
    texture: true,
  };

  gui.add(params, "texture").onChange(function (value) {
    for (let i = 0; i < materials.length; i++) {
      materials[i].map = value === true ? parameters[i][1] : null;
      materials[i].needsUpdate = true;
    }
  });
  gui.open();
  document.body.style.touchAction = "none";
  document.body.addEventListener("pointermove", onPointerMove);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
  if (event.isPrimary === false) return;

  mouse.X = event.clientX - windowHalfX;
  mouse.Y = event.clientY - windowHalfY;
}

function createParticleSystems() {
  // Load the texture that will be used to display our snow
  const textureLoader = new THREE.TextureLoader();

  const sprite1 = textureLoader.load(
    "./assets/textures/sprites/snowflake1.png"
  );
  const sprite2 = textureLoader.load(
    "./assets/textures/sprites/snowflake2.png"
  );
  const sprite3 = textureLoader.load(
    "./assets/textures/sprites/snowflake3.png"
  );
  const sprite4 = textureLoader.load(
    "./assets/textures/sprites/snowflake4.png"
  );
  const sprite5 = textureLoader.load(
    "./assets/textures/sprites/snowflake5.png"
  );

  // Create the geometry that will hold all our vertices
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const particleSystems = [];

  // create the vertices and add store them in our vertices array
  for (let i = 0; i < 10000; i++) {
    const x = Math.random() * 2000 - 1000; // generate random number between -1000 to 1000
    const y = Math.random() * 2000 - 1000;
    const z = Math.random() * 2000 - 1000;

    vertices.push(x, y, z);
  }

  // Add the vertices stored in our array to set
  // the position attribute of our geometry.
  // Position attribute will be read by threejs
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  parameters = [
    [[1.0, 0.2, 0.5], sprite2, 20],
    [[0.95, 0.2, 0.5], sprite3, 15],
    [[0.9, 0.2, 0.5], sprite1, 10],
    [[0.85, 0.2, 0.5], sprite5, 8],
    [[0.8, 0.2, 0.5], sprite4, 5],
  ];

  for (let i = 0; i < parameters.length; i++) {
    const color = parameters[i][0];
    const sprite = parameters[i][1];
    const size = parameters[i][2];

    // Create the material that will be used to render each vertex of our geometry
    materials[i] = new THREE.PointsMaterial({
      size,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });
    materials[i].color.setHSL(color[0], color[1], color[2]);

    // Create the particle system
    const particleSystem = new THREE.Points(geometry, materials[i]);

    /* Offset the particle system x, y, z to different random points to break
    uniformity in the direction of movement during animation */
    particleSystem.rotation.x = Math.random() * 6;
    particleSystem.rotation.y = Math.random() * 6;
    particleSystem.rotation.z = Math.random() * 6;

    particleSystems.push(particleSystem);
  }
  return particleSystems;
}

function animate() {
  // This will create a loop rendering at each frame
  requestAnimationFrame(animate);
  render();
  stats.update();
}
function render() {
  const time = Date.now() * 0.00005;

  camera.position.x += (mouse.X - camera.position.x) * 0.05;
  camera.position.y += (mouse.Y - camera.position.y) * 0.05;

  camera.lookAt(scene.position);

  for (let i = 0; i < scene.children.length; i++) {
    const object = scene.children[i];

    if (object instanceof THREE.Points) {
      object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
    }
  }

  for (let i = 0; i < materials.length; i++) {
    const color = parameters[i][0];
    const h = (360 * ((color[0] + time) % 360)) / 360;
    materials[i].color.setHSL(h, color[1], color[2]);
  }

  renderer.render(scene, camera);
}
