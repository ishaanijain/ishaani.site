/* ===========================================
   REDOYAN REPLICA - ADVANCED 3D ENGINE
   =========================================== */

// 1. Initialize Lenis (Smooth Scroll)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Custom Cursor Logic
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

window.addEventListener('mousemove', (e) => {
    // Dot follows instantly
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;

    // Ring follows with slight delay/easing handled by CSS transitions or GSAP
    gsap.to(cursorRing, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out"
    });
});

// Hover effects for cursor
const hoverElements = document.querySelectorAll('a, .project-card, .timeline-item');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
});


// 3. Three.js Scene Setup
const scene = new THREE.Scene();
// Fog to hide distant particles
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

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const blueLight = new THREE.DirectionalLight(0x2563eb, 5);
blueLight.position.set(5, 5, 5);
scene.add(blueLight);

const purpleLight = new THREE.DirectionalLight(0x7c3aed, 5);
purpleLight.position.set(-5, -5, 5);
scene.add(purpleLight);

// -----------------------------------------------------
// PARTICLE SYSTEM (STARFIELD)
// -----------------------------------------------------
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    // Spread particles wide
    posArray[i] = (Math.random() - 0.5) * 20;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create a glowy material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// -----------------------------------------------------
// FLOATING GEOMETRY (GEOMETRIC SHAPES)
// -----------------------------------------------------
const floatingShapes = [];
const geometries = [
    new THREE.TorusGeometry(0.3, 0.1, 16, 32),
    new THREE.OctahedronGeometry(0.5),
    new THREE.ConeGeometry(0.3, 0.8, 32)
];

const shapeMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    wireframe: true,
    emissive: 0x2563eb,
    emissiveIntensity: 0.2
});

for (let i = 0; i < 15; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geometry, shapeMaterial.clone());

    // Random Position
    mesh.position.x = (Math.random() - 0.5) * 15;
    mesh.position.y = (Math.random() - 0.5) * 15;
    mesh.position.z = (Math.random() - 0.5) * 10;

    // Random Scale
    const scale = Math.random() * 0.5 + 0.5;
    mesh.scale.set(scale, scale, scale);

    // Random Rotation Speed stored in userData
    mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        originalPos: mesh.position.clone()
    };

    scene.add(mesh);
    floatingShapes.push(mesh);
}


// -----------------------------------------------------
// MAIN 3D MODEL
// -----------------------------------------------------
let avatar;
const loader = new THREE.GLTFLoader();
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';

loader.load(
    MODEL_URL,
    (gltf) => {
        avatar = gltf.scene;
        avatar.position.set(2.5, 0, 0);
        avatar.scale.set(2, 2, 2);
        avatar.rotation.y = -0.5;
        scene.add(avatar);

        // Setup Scroll Animation for Avatar
        setupScrollAnimations();
    },
    undefined,
    (error) => {
        console.error("Model failed, creating fallback", error);
        createFallback();
    }
);

function createFallback() {
    const geometry = new THREE.IcosahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
        color: 0x000000,
        wireframe: true,
        emissive: 0x7c3aed,
        emissiveIntensity: 1
    });
    avatar = new THREE.Mesh(geometry, material);
    avatar.position.set(2.5, 0, 0);
    scene.add(avatar);
    setupScrollAnimations();
}

// -----------------------------------------------------
// GSAP SCROLL ANIMATIONS (3D)
// -----------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

function setupScrollAnimations() {
    if (!avatar) return;

    // 1. Hero to About: Move avatar left and rotate
    gsap.to(avatar.position, {
        x: -3,
        scrollTrigger: {
            trigger: "#about",
            start: "top bottom",
            end: "top top",
            scrub: 1
        }
    });

    gsap.to(avatar.rotation, {
        y: Math.PI, // Rotate 180
        scrollTrigger: {
            trigger: "#about",
            start: "top bottom",
            end: "top top",
            scrub: 1
        }
    });

    // 2. To Work Section: Float Up/Away
    gsap.to(avatar.position, {
        y: 5,
        z: -5,
        scrollTrigger: {
            trigger: "#work",
            start: "top bottom",
            end: "top center",
            scrub: 1
        }
    });
}


// -----------------------------------------------------
// MOUSE INTERACTION
// -----------------------------------------------------
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    // Normalized coordinates -1 to 1
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
});


// -----------------------------------------------------
// ANIMATION LOOP
// -----------------------------------------------------
const clock = new THREE.Clock();

function animate() {
    const time = clock.getElapsedTime();

    // Animate Particles
    particlesMesh.rotation.y = time * 0.05; // Slow spin of entire universe
    particlesMesh.rotation.x = time * 0.02;

    // Animate Floating Shapes
    floatingShapes.forEach((mesh, i) => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;

        // Gentle bobbing
        mesh.position.y = mesh.userData.originalPos.y + Math.sin(time + i) * 0.5;

        // Mouse Repulsion (Simple)
        const dist = 3; // distance of effect
        // NOTE: Real 3D mouse repulsion requires raycasting, but simple offset works for background feel
        // mesh.position.x += (mouseX * 0.01); 
        // mesh.position.y += (-mouseY * 0.01);
    });

    // Animate Main Avatar (Idle + Mouse Look)
    if (avatar) {
        // Subtle floating
        // avatar.position.y += Math.sin(time) * 0.001; 

        // Mouse Look (Parallax)
        // We add to existing rotation (which might be controlled by scroll)
        // Using small offsets
        avatar.rotation.x += (mouseY * 0.1 - avatar.rotation.x) * 0.05;
        // avatar.rotation.y += (mouseX * 0.1 - avatar.rotation.y) * 0.05; // Conflict with scroll rotation
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// -----------------------------------------------------
// DOM ANIMATIONS (TEXT, GALLERIES)
// -----------------------------------------------------

// Hero Reveal
const revealLines = document.querySelectorAll('.reveal-text');
revealLines.forEach((line, i) => {
    gsap.from(line, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        delay: 0.2 * i,
        ease: "power4.out"
    });
});

// Horizontal Scroll
const workSection = document.querySelector('.work-section');
const workGallery = document.querySelector('.work-gallery');

if (workSection && workGallery) {
    const scrollWidth = workGallery.scrollWidth;
    gsap.to(workGallery, {
        x: () => -(scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: ".work-section",
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
        }
    });
}

// Fade Up
const fadeElements = document.querySelectorAll('.timeline-item, .about-text');
fadeElements.forEach(el => {
    gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    });
});

// Typing Effect
const typeText = document.querySelector('.typing-text');
const phrases = ["CREATIVE ENGINEER", "AI RESEARCHER", "FULL STACK DEV"];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!typeText) return;
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        typeText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typeText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
}
setTimeout(type, 1000);
