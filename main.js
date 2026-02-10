/* ===========================================
   REDOYAN REPLICA - SLIDE ENGINE
   =========================================== */
console.log("🚀 VERSION 7 - HIGH FIDELITY LOADED");

// 0. LENIS SMOOTH SCROLL (Luxury Weight)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 1. NAVIGATION & SLIDE LOGIC
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.menu a');

// Initialize: Show Hash or Home or First Section
const initHash = window.location.hash.substring(1);
if (initHash && document.getElementById(initHash)) {
    switchSection(initHash);
} else {
    const home = document.getElementById('home');
    if (home) {
        // default to home without running full switchSection (which might expect links)
        home.classList.add('active');
        const homeLink = document.querySelector(`.menu a[href="#home"]`);
        if (homeLink) homeLink.classList.add('active-link');
    } else {
        // Fallback for pages like manifesto.html
        if (sections.length > 0) sections[0].classList.add('active');
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Native anchor click is fine now that we have real scroll.
        // Lenis will smooth it automatically.

        // Just update active state manually for instant feedback
        navLinks.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');
    });
});

// Handle clicks on the magnetic wrapper (UX Fix)
document.querySelectorAll('.magnetic-wrap').forEach(wrap => {
    wrap.addEventListener('click', (e) => {
        const link = wrap.querySelector('a');
        if (link && e.target !== link) {
            link.click(); // Delegate to the link (Standard click)
        }
    });
});

function switchSection(id) {
    currentSectionId = id; // Update global state
    // Navigation updates now handled by ScrollTrigger
}


// -----------------------------------------------------
// 3D SCENE & ENGINE
// -----------------------------------------------------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x333333, 0.002);
const isMobile = window.innerWidth < 768;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = isMobile ? 8 : 5; // Zoom out on mobile

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

// -----------------------------------------------------
// STAR FIELD (ELEGANT & POSH)
// -----------------------------------------------------
const starGeometry = new THREE.BufferGeometry();
const starCount = 3000;
const starPos = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 100; // Wide field
    const y = (Math.random() - 0.5) * 100;
    const z = -Math.random() * 50; // Deep backdrop
    starPos[i * 3] = x;
    starPos[i * 3 + 1] = y;
    starPos[i * 3 + 2] = z;
    starSizes[i] = Math.random() * 0.15; // Varied sizes, small & elegant
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

// Custom Shader Material for Twinkling Stars could be cool, but PointsMaterial is safer/faster
// Let's use a simple elegant white point
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
});

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

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
            color: 0xf5f5f5,
            side: THREE.DoubleSide
        });

        // Frame
        const frameGeo = new THREE.PlaneGeometry(width + 0.1, height + 0.1);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0xE5E4E2 }); // Platinum
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
                    mesh.material.color.setHex(0x1a1a1a); // Dark Grey
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

    // Mobile Adjustment: Less offset X, maybe adjust Z
    const isMobile = window.innerWidth < 768;

    if (sectionId === 'home') {
        // MAKE VISIBLE
        galleryGroup.visible = true;

        gsap.to(galleryGroup.position, {
            x: isMobile ? -2.5 : 0, /* Aggressive shift left to center group (center is ~2.5) */
            y: 0,
            z: isMobile ? -5 : 0, /* Push back on mobile */
            duration: 1
        });
        gsap.to(galleryGroup.scale, {
            x: isMobile ? 0.6 : 1, /* Consistent with other sections */
            y: isMobile ? 0.6 : 1,
            z: isMobile ? 0.6 : 1,
            duration: 1
        });

        // Ensure opacity is full if we faded it (optional)
        // galleryGroup.children.forEach(c => c.material && (c.material.opacity = 1));

    } else {
        // HIDE IT for all other sections
        // We can just set visible = false after a small delay or animate it out
        // For instant removal as requested:

        // Animate out nicely?
        gsap.to(galleryGroup.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            onComplete: () => {
                if (currentSectionId !== 'home') galleryGroup.visible = false;
            }
        });
    }

    // Handle book group separately as before (only for blog)
    if (sectionId === 'blog') {
        if (bookGroup) {
            bookGroup.visible = true;
            gsap.fromTo(bookGroup.position,
                { y: -5, opacity: 0 },
                { y: 0, opacity: 1, duration: 1 }
            );
            // Center book on mobile
            if (isMobile) {
                bookGroup.position.x = 0;
                bookGroup.position.z = -2; // Slightly back
            }
            gsap.to(bookGroup.rotation, { y: -0.5, duration: 2 });
        }
    } else {
        if (bookGroup) bookGroup.visible = false;
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

    // Trail Logic (Gold Dust)
    if (trailCount++ % 2 === 0) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        dot.style.left = (e.clientX + (Math.random() - 0.5) * 10) + 'px'; // Scattering
        dot.style.top = (e.clientY + (Math.random() - 0.5) * 10) + 'px';
        dot.style.backgroundColor = `rgba(229, 228, 226, ${Math.random() * 0.8 + 0.2})`; // Platinum
        dot.style.width = Math.random() * 3 + 'px'; // Tiny vary sizes
        dot.style.height = dot.style.width;
        dot.style.borderRadius = '50%';
        dot.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.6)'; // White Glow
        dot.style.transition = "transform 1s ease-out, opacity 1s ease-out"; // Long fade

        document.body.appendChild(dot);

        // Float away animation
        setTimeout(() => {
            dot.style.transform = `translate(${(Math.random() - 0.5) * 30}px, ${Math.random() * 30}px)`;
            dot.style.opacity = '0';
        }, 10);

        setTimeout(() => dot.remove(), 1000);
    }
});

// Lerp helper for smooth movement
const lerp = (a, b, n) => (1 - n) * a + n * b;

// -----------------------------------------------------
// INTERACTIVE TEXT EFFECT (HACKER SCRAMBLE) - REMOVED
// -----------------------------------------------------

// -----------------------------------------------------
// TYPEWRITER EFFECT
// -----------------------------------------------------
function initTypewriter() {
    const textElement = document.querySelector('.typing-text');
    if (!textElement) return;

    const phrases = ["BUILDER", "RESEARCHER", "PROBLEM SOLVER", "ENGINEER"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        // Dynamic wait time
        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Finished typing phrase
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before new phrase
        }

        setTimeout(type, typeSpeed);
    }

    // Start loop
    type();
}
initTypewriter();

// -----------------------------------------------------
// 3D TILT EFFECT (Vanilla Logic)
// -----------------------------------------------------
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .tech-card, .education-block, .timeline-right');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation
            // Center is (width/2, height/2)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Max rotation (e.g. 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -10; // Invert Y
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            // Remove transition for snappy follow, or keep it short
            card.style.transition = 'none'; // Snappy
            // OR card.style.transition = 'transform 0.1s ease'; // Smooth
        });
    });
}
initTiltEffect();

// -----------------------------------------------------
// SCROLL REVEAL ANIMATIONS (GSAP)
// -----------------------------------------------------
function initScrollReveals() {
    gsap.registerPlugin(ScrollTrigger);

    // Reveal Hero Text initially (simple fade up)
    gsap.from(".hero-title .line", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5
    });

    // Reveal Sections on Scroll
    const revealElements = document.querySelectorAll(".section-header, .about-text, .timeline-item, .project-card, .education-block");

    revealElements.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%", // Trigger when top of element hits 85% of viewport height
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Staggered Reveals (New Class)
    gsap.utils.toArray('.reveal-text, .reveal-card').forEach(elem => {
        gsap.to(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // 3D SCENE UPDATES ON SCROLL
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => {
                currentSectionId = section.id;
                updateAvatarPosition(section.id);
                updateNavState(section.id);
            },
            onEnterBack: () => {
                currentSectionId = section.id;
                updateAvatarPosition(section.id);
                updateNavState(section.id);
            }
        });
    });
}

function updateNavState(id) {
    const navLinks = document.querySelectorAll('.menu a');
    navLinks.forEach(l => l.classList.remove('active-link'));
    const activeLink = document.querySelector(`.menu a[href="#${id}"]`);
    if (activeLink) activeLink.classList.add('active-link');
}

initScrollReveals();

// MAGNETIC BUTTONS LOGIC
const magnets = document.querySelectorAll('.magnetic-wrap');
magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', function (e) {
        const bounding = magnet.getBoundingClientRect();
        const strength = 20; // Magnetic pull strength

        const x = (((e.clientX - bounding.left) / magnet.offsetWidth) - 0.5) * strength;
        const y = (((e.clientY - bounding.top) / magnet.offsetHeight) - 0.5) * strength;

        gsap.to(magnet.querySelector('.magnetic-inner'), {
            x: x,
            y: y,
            duration: 0.6,
            ease: "power2.out"
        });
    });

    magnet.addEventListener('mouseleave', function (e) {
        gsap.to(magnet.querySelector('.magnetic-inner'), {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
        });
    });
});

// -----------------------------------------------------
// ANIMATION LOOP
// -----------------------------------------------------
// BACKGROUND SHAPES - REMOVED FOR CLEANER LOOK
let shapeGroup = null; // Removed
function createBackgroundShapes() {
    // No-op
}
createBackgroundShapes();

// BLOG ORNAMENTS (Floating Book/Brain)
let bookGroup;
function createBlogOrnaments() {
    bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Wireframe Color
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xE5E4E2, wireframe: true, transparent: true, opacity: 0.3 }); // Platinum
    const pageMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide });

    // Left Page
    const leftPage = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.05), pageMat);
    leftPage.position.x = -0.6;
    leftPage.rotation.y = -0.3;
    const leftWire = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.05), wireMat);
    leftWire.position.x = -0.6;
    leftWire.rotation.y = -0.3;
    bookGroup.add(leftPage);
    bookGroup.add(leftWire);

    // Right Page
    const rightPage = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.05), pageMat);
    rightPage.position.x = 0.6;
    rightPage.rotation.y = 0.3;
    const rightWire = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 0.05), wireMat);
    rightWire.position.x = 0.6;
    rightWire.rotation.y = 0.3;
    bookGroup.add(rightPage);
    bookGroup.add(rightWire);

    // Floating "Ideas" (Particles)
    const ideaGeo = new THREE.IcosahedronGeometry(0.1, 0);
    for (let i = 0; i < 8; i++) {
        const mesh = new THREE.Mesh(ideaGeo, new THREE.MeshBasicMaterial({ color: 0xF0F8FF, wireframe: true })); // Ice Blue

        mesh.position.set(
            (Math.random() - 0.5) * 2,
            0.5 + Math.random(),
            (Math.random() - 0.5) * 1
        );
        mesh.userData = {
            speed: 0.01 + Math.random() * 0.02,
            offset: Math.random() * 10
        };
        bookGroup.add(mesh);
    }

    // Initial State
    bookGroup.position.set(0, 0, 0);
    bookGroup.visible = false;
}
createBlogOrnaments();

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();

function animate() {
    const time = clock.getElapsedTime();

    // Background Shapes Animation
    if (shapeGroup) shapeGroup.rotation.y = time * 0.05;

    // Blog Book Animation
    if (bookGroup && bookGroup.visible) {
        bookGroup.rotation.y = Math.sin(time * 0.2) * 0.1; // Gentle sway
        bookGroup.position.y = Math.sin(time * 0.5) * 0.2; // Float

        // Animate "Ideas"
        bookGroup.children.forEach((child, index) => {
            if (index > 3) { // Skip pages/wires (indices 0-3)
                child.position.y += Math.sin(time * 2 + child.userData.offset) * 0.002;
                child.rotation.x += child.userData.speed;
                child.rotation.y += child.userData.speed;
            }
        });
    }

    // Cinematic Camera Drift (Independent of Mouse)
    const driftX = Math.sin(time * 0.1) * 0.2;
    const driftY = Math.cos(time * 0.15) * 0.2;
    camera.position.x += (driftX - camera.position.x) * 0.01; // Soft follow

    // Note: camera.lookAt or manual rotation adjustments might be needed if drift is too large,
    // but small drift is fine. We just want it to feel "handheld" or "floating".

    // 1. Star Field Animation
    if (starField) {
        starField.rotation.y = time * 0.02; // Very slow, elegant rotation
        starField.rotation.z = time * 0.005;

        // Optional: Twinkle Effect (Needs attribute mutation which is expensive, skip for performance or use shader later)
        // Simple opacity pulse maybe? PointsMaterial doesn't support per-particle opacity easily without shaders.
        // We'll stick to rotation for "floating" feel.
    }

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }

    // Custom Cursor Logic(Smooth Follow)
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
                card.children[0].material.color.setHex(0xE5E4E2); // Platinum Frame
            }
        });

        if (intersects.length > 0) {
            let object = intersects[0].object;
            while (object.parent && object.parent !== galleryGroup) object = object.parent;

            if (object && object.parent === galleryGroup) {
                object.scale.setScalar(lerp(object.scale.x, 1.15, 0.1));
                if (object.children[0] && object.children[0].material) {
                    object.children[0].material.color.setHex(0xffffff); // White highlight
                }
            }
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// Click Ripple Effect -> MAGIC SPARKLE BURST
document.addEventListener('click', (e) => {
    // Create multiple sparkles
    for (let i = 0; i < 8; i++) {
        const spark = document.createElement('div');
        spark.className = 'sparkle';
        // Random scatter
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;

        spark.style.left = (e.clientX) + 'px';
        spark.style.top = (e.clientY) + 'px';
        spark.style.width = (Math.random() * 4 + 2) + 'px';
        spark.style.height = spark.style.width;
        spark.style.backgroundColor = '#E5E4E2'; // Platinum / Diamond
        spark.style.position = 'fixed';
        spark.style.borderRadius = '50%';
        spark.style.pointerEvents = 'none';
        spark.style.zIndex = '9999';
        spark.style.boxShadow = '0 0 10px #ffffff, 0 0 20px #E5E4E2'; // Bright white glow
        spark.style.transition = 'all 0.6s cubic-bezier(0, 1, 0.5, 1)'; // Pop out

        document.body.appendChild(spark);

        // Animate
        setTimeout(() => {
            spark.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0)`;
            spark.style.opacity = '0';
        }, 10);

        setTimeout(() => spark.remove(), 700);
    }
});

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Re-calculate mobile state and update positions
    updateAvatarPosition(currentSectionId);
});

// BLOG INTERACTION
document.addEventListener('DOMContentLoaded', () => {
    const blogCards = document.querySelectorAll('.blog-card'); // Select ALL cards
    const closeBtns = document.querySelectorAll('.close-article'); // Select ALL close buttons

    if (blogCards.length > 0) {
        blogCards.forEach(card => {
            card.addEventListener('click', function (e) {
                // If specific close button clicked, don't expand (handled by close logic)
                if (e.target.closest('.close-article')) return;

                // If already expanded, don't re-trigger
                if (this.classList.contains('expanded')) return;

                // Close any other open cards? Optional. For now let's just expand current.
                // Actually, best UX is usually only one open at a time.
                blogCards.forEach(c => {
                    if (c !== this) c.classList.remove('expanded');
                });

                this.classList.add('expanded');
                this.setAttribute('data-lenis-prevent', 'true'); // Allow internal scroll without Lenis hijacking

                // GSAP Entry Animation for content
                gsap.fromTo(this.querySelector('.full-content'),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, delay: 0.3 }
                );
            });
        });
    }

    if (closeBtns.length > 0) {
        closeBtns.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation(); // Stop card click from firing
                const card = this.closest('.blog-card');
                if (card) {
                    card.classList.remove('expanded');
                    card.removeAttribute('data-lenis-prevent'); // Clean up
                }
            });
        });
    }
});


