/* ===========================================
   TRUE 3D HOLOGRAPHIC ENGINE
   =========================================== */

// --- 1. SETUP LOADING MANAGER (FIX STUCK 0%) ---
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const percent = Math.round((itemsLoaded / itemsTotal) * 100);
    const counter = document.querySelector('.loader-counter');
    if (counter) counter.innerText = `${percent}%`;
};

loadingManager.onLoad = () => {
    // Force wait a moment for smoothness
    setTimeout(() => {
        gsap.to('.preloader', {
            opacity: 0, duration: 1, onComplete: () => {
                document.querySelector('.preloader').style.display = 'none';
                document.body.classList.remove('loading');
            }
        });
    }, 500);
};

// Fallback safety (in case manager hangs)
setTimeout(() => {
    if (document.querySelector('.preloader').style.display !== 'none') {
        gsap.to('.preloader', {
            opacity: 0, duration: 1, onComplete: () => {
                document.querySelector('.preloader').style.display = 'none';
                document.body.classList.remove('loading');
            }
        });
    }
}, 5000); // 5 seconds max wait

// --- 2. SETUP LENIS (SMOOTH SCROLL) ---
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

// --- 3. SETUP THREE.JS SCENE ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#webgl'),
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 4. HOLOGRAPHIC PLANE ---
const textureLoader = new THREE.TextureLoader(loadingManager); // Pass Manager Here
const avatarTexture = textureLoader.load('assets/images/avatar_texture.png');

// Geometry
const geometry = new THREE.PlaneBufferGeometry(7, 10, 20, 20); // Width, Height, Segments

// Material (Standard for now, Shader later if needed)
const material = new THREE.MeshBasicMaterial({
    map: avatarTexture,
    transparent: true,
    side: THREE.DoubleSide
});

const plane = new THREE.Mesh(geometry, material);
plane.position.set(2.5, -0.5, 0); // Positioned to the right
scene.add(plane);

// Add "Tech Particles" around it
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15; // Spread
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x2563eb,
    transparent: true,
    opacity: 0.8
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Camera Position
camera.position.z = 6;

// --- 4. ANIMATION LOOP ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Smooth Plane Tilt
    plane.rotation.y += 0.05 * (targetX - plane.rotation.y);
    plane.rotation.x += 0.05 * (targetY - plane.rotation.x);

    // Gentle Float
    plane.position.y = -0.5 + Math.sin(elapsedTime * 0.5) * 0.1;

    // Particles Movement
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = mouseY * 0.0001;

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

// Hide Preloader
window.addEventListener('load', () => {
    gsap.to('.preloader', {
        opacity: 0, duration: 1, onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
            document.body.classList.remove('loading');
        }
    });
});


// --- 5. GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

// Horizontal Scroll for Work
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
            end: "+=2000",
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
        }
    });
}

// Typing Text
const typingElement = document.querySelector('.typing-text');
const phrase = "FOUNDING ENGINEER";
let charIndex = 0;

function typeText() {
    if (charIndex < phrase.length) {
        typingElement.textContent += phrase.charAt(charIndex);
        charIndex++;
        setTimeout(typeText, 100);
    }
}
setTimeout(typeText, 1500);
