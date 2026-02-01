/* ===========================================
   REDOYAN REPLICA - SLIDE ENGINE
   =========================================== */
console.log("🚀 VERSION 6 - SLIDE ENGINE LOADED");

// 1. NAVIGATION & SLIDE LOGIC
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.menu a');

// Initialize: Show Hero
document.querySelector('#home').classList.add('active');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        switchSection(targetId);
    });
});

function switchSection(id) {
    // 1. Update Navigation State
    navLinks.forEach(l => l.classList.remove('active-link'));
    const activeLink = document.querySelector(`.menu a[href="#${id}"]`);
    if (activeLink) activeLink.classList.add('active-link');

    // 2. Hide All Sections
    sections.forEach(sec => sec.classList.remove('active'));

    // 3. Show Target Section
    const targetSection = document.getElementById(id);
    if (targetSection) targetSection.classList.add('active');

    // 4. Update 3D Avatar Position based on section
    updateAvatarPosition(id);
}

// -----------------------------------------------------
// 3D SCENE & ENGINE
// -----------------------------------------------------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#webgl'),
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Mismatched check: ensure we are targeting the right lines. Re-reading file structure logic.
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Maximum brightness
scene.add(ambientLight);

// Neon Blue Light (Cyan)
const cyanLight = new THREE.DirectionalLight(0x00ffff, 8);
cyanLight.position.set(5, 5, 5);
scene.add(cyanLight);

// Neon Pink Light (Magenta)
const pinkLight = new THREE.DirectionalLight(0xff00ff, 8);
pinkLight.position.set(-5, -5, 5);
scene.add(pinkLight);

// PARTICLE SYSTEM
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) posArray[i] = (Math.random() - 0.5) * 20;
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff, transparent: true, opacity: 0.8 });
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// MAIN MODEL - FLOATING PHOTO GALLERY
let galleryGroup = new THREE.Group();
scene.add(galleryGroup);

function createPhotoGallery() {
    const textureLoader = new THREE.TextureLoader();
    const photos = ['assets/images/photo1.jpg', 'assets/images/photo2.jpg', 'assets/images/photo3.jpg'];

    // Positions for the 3 photos
    const positions = [
        { x: 2.5, y: 0, z: 0, rotZ: -0.1 },    // Main center
        { x: 0.5, y: 1.5, z: -1, rotZ: 0.1 },  // Top Left background
        { x: 4.5, y: -1.0, z: 0.5, rotZ: 0.05 } // Bottom Right foreground
    ];

    positions.forEach((pos, index) => {
        // 1. Create Placeholder Card IMMEDIATELY
        // Default size (Portrait-ish)
        const width = 2.5;
        const height = 3.5;

        const geometry = new THREE.PlaneGeometry(width, height);
        // Default material: Dark Grey with Pink border logic
        const material = new THREE.MeshBasicMaterial({
            color: 0x222222,
            side: THREE.DoubleSide
        });

        // Frame
        const frameGeo = new THREE.PlaneGeometry(width + 0.1, height + 0.1);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0xff00ff }); // Neon Pink Frame
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.z = -0.02; // Behind

        const photoCard = new THREE.Group();
        photoCard.add(frame);
        const mesh = new THREE.Mesh(geometry, material);
        photoCard.add(mesh);

        // Transform
        photoCard.position.set(pos.x, pos.y, pos.z);
        photoCard.rotation.z = pos.rotZ;
        photoCard.rotation.y = -0.2;

        // Animation Data
        photoCard.userData = {
            floatSpeed: 0.001 + Math.random() * 0.002,
            floatOffset: Math.random() * Math.PI * 2,
            initialY: pos.y
        };

        galleryGroup.add(photoCard);

        // 2. Load Texture Asynchronously
        if (photos[index]) {
            textureLoader.load(
                photos[index],
                (texture) => {
                    console.log(`Loaded texture: ${photos[index]}`);
                    // Update material to show photo
                    mesh.material.color.setHex(0xffffff); // Reset color to white so texture shows
                    mesh.material.map = texture;
                    mesh.material.needsUpdate = true;

                    // Adjust aspect ratio if needed? 
                    // To avoid stretching, we can scale the mesh
                    const imgAspect = texture.image.width / texture.image.height;
                    const geoAspect = width / height;
                    // For now, let's just stick to the frame size to keep layout consistent
                    // Or simple scale correction:
                    // mesh.scale.x = imgAspect / geoAspect; 
                },
                undefined,
                (err) => {
                    console.error(`Error loading texture ${photos[index]}:`, err);
                    // Fallback visual: change color to indicate broken link
                    mesh.material.color.setHex(0x330000); // Dark Red
                }
            );
        }
    });
}

createPhotoGallery();

// AVATAR STATE MANAGER (Updated for Gallery)
function updateAvatarPosition(sectionId) {
    // We can move the whole gallery group based on section
    if (!galleryGroup) return;

    const baseScale = 1.0;

    switch (sectionId) {
        case 'home':
            gsap.to(galleryGroup.position, { x: 0, y: 0, z: 0, duration: 1 });
            gsap.to(galleryGroup.scale, { x: baseScale, y: baseScale, z: baseScale, duration: 1 });
            break;
        case 'about':
            gsap.to(galleryGroup.position, { x: 1, y: 0.5, z: -1, duration: 1 }); // Move slightly back
            break;
        case 'experience':
            gsap.to(galleryGroup.position, { x: 2, y: -0.5, z: 0, duration: 1 });
            break;
        case 'work':
            gsap.to(galleryGroup.position, { x: 0, y: 0, z: 0, duration: 1 });
            break;
        case 'contact':
            gsap.to(galleryGroup.position, { x: 3, y: 0, z: 0, duration: 1 });
            break;
    }
}

// -----------------------------------------------------
// MOUSE & CURSOR TRACKING
// -----------------------------------------------------
const cursor = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let clientX = -100;
let clientY = -100;
// Normalized coordinates for 3D Raycasting (-1 to +1)
let mouse3D = new THREE.Vector2();

let trailCount = 0;
document.addEventListener('mousemove', (e) => {
    clientX = e.clientX;
    clientY = e.clientY;

    // Normalize for Raycaster
    mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Trail Logic (Neon Dust)
    if (trailCount++ % 2 === 0) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
        dot.style.backgroundColor = Math.random() > 0.5 ? 'var(--accent-blue)' : 'var(--accent-purple)';
        document.body.appendChild(dot);
        setTimeout(() => dot.remove(), 500);
    }
});

// Lerp helper for smooth movement
const lerp = (a, b, n) => (1 - n) * a + n * b;

// -----------------------------------------------------
// INTERACTIVE TEXT EFFECT (HACKER SCRAMBLE)
// -----------------------------------------------------
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function enableHackerText(selector) {
    document.querySelectorAll(selector).forEach(element => {
        // Store original text
        element.dataset.value = element.innerText;

        element.addEventListener('mouseover', event => {
            let iteration = 0;
            clearInterval(element.interval);

            element.classList.add('hacker-active');

            element.interval = setInterval(() => {
                event.target.innerText = event.target.innerText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return event.target.dataset.value[index];
                        }
                        return letters[Math.floor(Math.random() * 26)];
                    })
                    .join("");

                if (iteration >= event.target.dataset.value.length) {
                    clearInterval(element.interval);
                    element.classList.remove('hacker-active');
                    // Ensure it ends perfectly clean
                    event.target.innerText = event.target.dataset.value;
                }

                iteration += 1 / 3;
            }, 30);
        });
    });
}

// Apply to headings and nav
enableHackerText("h1");
enableHackerText("h2");
enableHackerText("h4");
enableHackerText(".menu a");

// -----------------------------------------------------
// ANIMATION LOOP
// -----------------------------------------------------
// BACKGROUND SHAPES (Wireframes)
let shapeGroup = new THREE.Group();
scene.add(shapeGroup);

function createBackgroundShapes() {
    const geometries = [
        new THREE.IcosahedronGeometry(1.5, 0),
        new THREE.OctahedronGeometry(1.2, 0),
        new THREE.TorusGeometry(1.0, 0.2, 8, 16)
    ];
    for (let i = 0; i < 15; i++) {
        const geom = geometries[Math.floor(Math.random() * geometries.length)];
        const mat = new THREE.MeshBasicMaterial({
            color: 0x222222,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            -5 - Math.random() * 10
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        shapeGroup.add(mesh);
    }
}
createBackgroundShapes();

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();

function animate() {
    const time = clock.getElapsedTime();

    // Background Shapes Animation
    if (shapeGroup) shapeGroup.rotation.y = time * 0.05;

    // 1. Starfield Particles Animation
    if (particlesMesh) {
        particlesMesh.rotation.y = time * 0.05;
        // Parallax: Move slightly opposite to mouse
        particlesMesh.position.x = lerp(particlesMesh.position.x, -mouse3D.x * 0.5, 0.05);
        particlesMesh.position.y = lerp(particlesMesh.position.y, -mouse3D.y * 0.5, 0.05);
    }

    // 2. Animate Custom Cursor (Smooth Follow)
    if (cursor && cursorRing) {
        const currX = cursor.style.left ? parseFloat(cursor.style.left) : clientX;
        const currY = cursor.style.top ? parseFloat(cursor.style.top) : clientY;
        const nextX = lerp(currX, clientX, 0.15);
        const nextY = lerp(currY, clientY, 0.15);

        cursor.style.left = `${nextX}px`;
        cursor.style.top = `${nextY}px`;
        cursorRing.style.left = `${nextX}px`;
        cursorRing.style.top = `${nextY}px`;
    }

    // 3. Animate Photo Gallery
    if (galleryGroup) {
        // Parallax Tilt
        const targetRotY = mouse3D.x * 0.15;
        const targetRotX = -mouse3D.y * 0.15;
        galleryGroup.rotation.y = lerp(galleryGroup.rotation.y, targetRotY, 0.1);
        galleryGroup.rotation.x = lerp(galleryGroup.rotation.x, targetRotX, 0.1);

        // Hover Raycasting
        raycaster.setFromCamera(mouse3D, camera);
        const intersects = raycaster.intersectObjects(galleryGroup.children, true);

        galleryGroup.children.forEach(card => {
            card.scale.setScalar(lerp(card.scale.x, 1.0, 0.1));
            if (card.userData) {
                card.position.y = lerp(card.position.y, card.userData.initialY + Math.sin(Date.now() * card.userData.floatSpeed + card.userData.floatOffset) * 0.1, 0.1);
            }
            if (card.children[0] && card.children[0].material) {
                card.children[0].material.color.setHex(0xff00ff);
            }
        });

        if (intersects.length > 0) {
            let object = intersects[0].object;
            while (object.parent && object.parent !== galleryGroup) object = object.parent;

            if (object && object.parent === galleryGroup) {
                object.scale.setScalar(lerp(object.scale.x, 1.15, 0.1));
                if (object.children[0] && object.children[0].material) {
                    object.children[0].material.color.setHex(0xffffff);
                }
            }
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Click Ripple Effect
document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
