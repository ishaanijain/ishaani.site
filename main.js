/* ===========================================
   REDOYAN REPLICA - MAIN ENGINE
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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
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

// Load 3D Model
// Using a consistent reliable source. If this fails, we fallback to a geometric shape.
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';
// NOTE: I switched to standard DamagedHelmet for reliability as the previous char URL might be unstable.
// Ideally, the user provides a specific avatar GLB. 

let avatar;
const loader = new THREE.GLTFLoader();

loader.load(
    MODEL_URL,
    (gltf) => {
        avatar = gltf.scene;
        avatar.position.set(3, 0, 0); // Positioned to the right
        avatar.scale.set(1.5, 1.5, 1.5);
        
        // Add some rotation
        avatar.rotation.y = -0.5;
        
        scene.add(avatar);
    },
    undefined,
    (error) => {
        console.error("Model failed, creating fallback", error);
        createFallback();
    }
);

function createFallback() {
    const geometry = new THREE.IcosahedronGeometry(1.5, 1); // Sci-fi looking shape
    const material = new THREE.MeshStandardMaterial({
        color: 0x111111,
        wireframe: true,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.5
    });
    avatar = new THREE.Mesh(geometry, material);
    avatar.position.set(3, 0, 0);
    scene.add(avatar);
}

camera.position.z = 5;

// Mouse Parallax for 3D
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

function animate() {
    // specific 3d model animation
    if (avatar) {
        avatar.rotation.y += 0.005; // Constant slow spin
        
        // Interactive tilt
        const targetRotX = mouseY * 0.001;
        const targetRotY = mouseX * 0.001;
        
        avatar.rotation.x += 0.05 * (targetRotX - avatar.rotation.x);
        // avatar.rotation.y += 0.05 * (targetRotY - avatar.rotation.y); // conflict with spin
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


// 4. GSAP Animations

// Register
gsap.registerPlugin(ScrollTrigger);

// Hero Text Reveal
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

// Horizontal Scroll for Work Section
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
            end: "+=3000", // Length of scroll
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
        }
    });
}

// Fade Up Animations for sections
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


// 5. Typing Text Effect
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
