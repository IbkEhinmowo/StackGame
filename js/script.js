import * as THREE from "three";
import * as CANNON from "cannon-es";
let camera, scene, renderer;
const ogboxsize = 3.5;
const bottomboxes = 7; // height width
let stack = [];
let over = [];
const boxHeight = 1;
let world;
let initialhue = Math.floor(Math.random() * 360);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

function generateBox(x, y, z, width, depth, falls) {
  // box mesh
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);
  const color = new THREE.Color(
    `hsl(${(initialhue + stack.length * 6) % 360}, 100%, 50%)`,
  );
  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  //add mass physics
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2),
  );
  let mass = falls ? 5 : 0;
  const body = new CANNON.Body({ mass, shape });
  body.position.set(x, y, z);
  world.addBody(body);

  return {
    mesh,
    width,
    depth,
    body,
  };
}

function layerbox(x, z, width, depth, direction) {
  const y = boxHeight * stack.length; // Add the new box one layer higher
  const layer = generateBox(x, y, z, width, depth, true);
  layer.direction = direction;
  stack.push(layer);
}

var gamerunning = false;

function startGame() {
  if (!gamerunning) {
    gamerunning = true;
    renderer.setAnimationLoop(animation);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  } else {
    const topLayer = stack[stack.length - 1];
    const previousLayer = stack[stack.length - 2];
    const direction = topLayer.direction;

    const overhang =
      topLayer.mesh.position[direction] -
      previousLayer.mesh.position[direction];
    const overhangsize = Math.abs(overhang); // how much the box is overhanging in absolute form

    const sidesize = direction === "x" ? topLayer.width : topLayer.depth; // what side of the box is overhanging
    const overlap = sidesize - overhangsize; // how much the box is overlapping

    let newwidth, newdepth;
    if (overlap <= 0) {
      endGame();
      return;
    }

    if (overlap > 0) {
      // cutbox(topLayer, overlap, sidesize, overhang);

      //cut new layer depending on overlap size
      newwidth = direction === "x" ? overlap : topLayer.width;
      newdepth = direction === "z" ? overlap : topLayer.depth;

      //update the top layer dimensions
      topLayer.width = newwidth;
      topLayer.depth = newdepth;

      // update mesh models
      topLayer.mesh.scale[direction] = overlap / sidesize;
      topLayer.mesh.position[direction] -= overhang / 2;

      // //overhang
      const overhangShift =
        (overlap / 2 + overhangsize / 2) * Math.sign(overhang);
      const overhangX =
        direction === "x"
          ? topLayer.mesh.position.x + overhangShift
          : topLayer.mesh.position.x;
      const overhangZ =
        direction === "z"
          ? topLayer.mesh.position.z + overhangShift
          : topLayer.mesh.position.z;
      const overhangWidth = direction === "x" ? overhangsize : newwidth;
      const overhangDepth = direction === "z" ? overhangsize : newdepth;
      addoverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

      // update physics model
      const xrender = direction === "x" ? topLayer.mesh.position.x : -10;
      const zrender = direction === "z" ? topLayer.mesh.position.z : -10;
      const newdirection = direction === "x" ? "z" : "x"; // new direction of the next cuboid layer
      layerbox(xrender, zrender, newwidth, newdepth, newdirection);
    }
  }
}
function endGame() {
  // for the game over
  gamerunning = false;
  console.log("game over");
  renderer.setAnimationLoop(null);

  // Remove all bodies from the physics world
  while (world.bodies.length > 0) {
    world.removeBody(world.bodies[0]);
  }

  // Remove all meshes from the scene
  stack.forEach((layer) => {
    scene.remove(layer.mesh);
  });
  over.forEach((layer) => {
    scene.remove(layer.mesh);
  });
  stack = [];
  over = [];
  layerbox(0, 0, ogboxsize, ogboxsize);
  layerbox(-10, 0, ogboxsize, ogboxsize, "x");
}

const addoverhang = (x, z, width, depth) => {
  const y = boxHeight * (stack.length - 1);
  const overhangs = generateBox(x, y, z, width, depth, true);
  over.push(overhangs);
};
function physicsupdate() {
  world.step(1 / 60);
  over.forEach((element) => {
    //COPY THE PHYSICS MODEL TO THE VISUAL MODEL
    element.mesh.position.copy(element.body.position);
    element.mesh.quaternion.copy(element.body.quaternion);
  });
}

let time = 0;
function animation() {
  // for the camera and movement stuff
  const camspeed = 0.15;
  const boxspeed = 0.02;
  const topLayer = stack[stack.length - 1];
  time += boxspeed; // Increment time
  topLayer.mesh.position[topLayer.direction] = Math.sin(time) * 5; // Use sine function for back and forth movement
  topLayer.body.position[topLayer.direction] += boxspeed;

  //10 is refering to the height of the camera
  if (camera.position.y < boxHeight * (stack.length - 2) + 12) {
    camera.position.y += camspeed;
  }
  physicsupdate();

  renderer.render(scene, camera);
}

function nightStar() {
  const geometry = new THREE.SphereGeometry(0.02, 24, 24);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  const [x, y] = Array(2)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));
  const z = THREE.MathUtils.randFloat(-10, -50);
  star.position.set(x, y, z);
  scene.add(star);
}

const init = () => {
  // for the scene that roughly stays the same
  world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase(world);
  world.solver.iterations = 40;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00005);
  layerbox(0, 0, bottomboxes, bottomboxes);
  layerbox(0, 0, bottomboxes, bottomboxes);
  layerbox(0, 0, bottomboxes, bottomboxes);
  layerbox(0, 0, bottomboxes, bottomboxes);
  layerbox(0, 0, ogboxsize, ogboxsize);

  layerbox(-10, 0, ogboxsize, ogboxsize, "x");
  Array(2300).fill().forEach(nightStar);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(12, 20, 0);
  light.intensity = 5;
  light.castShadow = true;
  const gridHelper = new THREE.GridHelper(200, 50);
  scene.add(light);

  const width = 14; //camera placement
  const height = width * (sizes.height / sizes.width);
  camera = new THREE.OrthographicCamera(
    width / -2, //left frustum
    width / 2, // right frustum
    height / 2, //  top frustum
    height / -2, // bottom frustum
    1, //near frustum
    1000, //far frustum
  );

  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0); // look at the center of the scene
  scene.add(camera);
  // notice how u dont reintialize the renderer or the camera i.e 'const'
  //this sh** took time to troubleshoot
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".webgl"),
    antialias: true,
  });
  Math.floor(Math.random() * 360);
  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
};
window.addEventListener("resize", () => {
  // for the window resizing
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update the camera's aspect ratio
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  const width = 11;

  //update Orthographic Camera aspect
  const height = width * (sizes.height / sizes.width);
  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
});
// Add click event listener

window.addEventListener("click", startGame);
window.addEventListener("touchstart", startGame);

// Initialize the scene
init();
