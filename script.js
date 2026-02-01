/* ===========================================
   TRUE 3D ENGINE (FINAL VERSION)
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

// 2. Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#webgl'),
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const blueLight = new THREE.DirectionalLight(0x2563eb, 3);
blueLight.position.set(5, 5, 5);
scene.add(blueLight);

const purpleLight = new THREE.DirectionalLight(0x7c3aed, 3);
purpleLight.position.set(-5, -5, 5);
scene.add(purpleLight);


// 3. Load 3D Model (Stable GitHub Raw URL)
// Source: Generic Character Model from GitHub
const MODEL_URL = 'https://raw.githubusercontent.com/ramjigeddam/3d/master/Character_Type_1.glb';

let avatar;
const loader = new THREE.GLTFLoader();

loader.load(
    MODEL_URL,
    (gltf) => {
        avatar = gltf.scene;

        // Setup initial position
        avatar.position.set(2, -2, 0); // Right side, slightly down
        avatar.scale.set(2, 2, 2); // Make it big
        avatar.rotation.y = -0.5;

        // Add a cool wireframe overlay or material effect if you want "Tech" look
        // For now, we keep the original material but ensure it's visible
        avatar.traverse((node) => {
            if (node.isMesh) {
                // Optional: Make it look more "Cyber"
                node.material.roughness = 0.2;
                node.material.metalness = 0.8;
            }
        });

        scene.add(avatar);
        console.log("Model loaded successfully");
    },
    undefined, // Progress (we removed the preloader so we don't need this)
    (error) => {
        console.error("Model failed, loading fallback sphere", error);
        createFallback();
    }
);

function createFallback() {
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        wireframe: true,
        emissive: 0x111111
    });
    avatar = new THREE.Mesh(geometry, material);
    avatar.position.set(2, 0, 0);
    scene.add(avatar);
}

// Camera Setup
camera.position.z = 5;

// 4. Animation Loop
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

function animate() {
    const time = clock.getElapsedTime();
    const targetX = mouseX * 0.0005;
    const targetY = mouseY * 0.0005;

    if (avatar) {
        // Smooth Look-At effect
        avatar.rotation.y += 0.05 * (targetX - avatar.rotation.y - 0.5); // -0.5 offset to keep it facing leftish
        avatar.rotation.x += 0.05 * (targetY - avatar.rotation.x);

        // Breathing animation
        avatar.position.y += Math.sin(time) * 0.002;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// 5. GSAP Horizontal Scroll
gsap.registerPlugin(ScrollTrigger);

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
            end: "+=3000", // Increased scroll distance for smoother feel
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
        }
    });
}

// 6. Text Typing Effect
const typeText = document.querySelector('.typing-text');
const phrases = ["FOUNDING ENGINEER", "CREATIVE DEV", "AI RESEARCHER"];
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
