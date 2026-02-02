/* ===========================================
   REDOYAN REPLICA - SLIDE ENGINE
   =========================================== */
console.log("🚀 VERSION 6 - SLIDE ENGINE LOADED");

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
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            switchSection(targetId);
        }
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

// PARTICLE SYSTEM (Force Field)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);
const initialPosArray = new Float32Array(particlesCount * 3); // Store original positions

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
    initialPosArray[i] = posArray[i];
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
// particlesGeometry.setAttribute('initialPosition', new THREE.BufferAttribute(initialPosArray, 3)); // Custom attribute if needed

const particlesMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff, transparent: true, opacity: 0.5 });
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
            color: 0xf5f5f5,
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

    // Mobile Adjustment: Less offset X, maybe adjust Z
    const isMobile = window.innerWidth < 768;

    switch (sectionId) {
        case 'home':
            gsap.to(galleryGroup.position, { x: 0, y: 0, z: 0, duration: 1 });
            gsap.to(galleryGroup.scale, { x: 1, y: 1, z: 1, duration: 1 });
            break;
        case 'about':
            // Mobile: Center it (x=0) but push back slightly if needed
            // Desktop: Offset left (x=-2)
            gsap.to(galleryGroup.position, {
                x: isMobile ? 0 : -2,
                y: isMobile ? 2 : 0,
                z: isMobile ? -5 : 0,
                duration: 1
            });
            break;
        case 'experience':
            gsap.to(galleryGroup.position, {
                x: isMobile ? 0 : 2,
                y: -0.5,
                z: isMobile ? -5 : 0,
                duration: 1
            });
            break;
        case 'projects':
            gsap.to(galleryGroup.position, {
                x: 0,
                y: isMobile ? 2 : 0,
                z: isMobile ? -5 : 0,
                duration: 1
            });
            if (bookGroup) bookGroup.visible = false;
            break;
        case 'contact':
            gsap.to(galleryGroup.position, {
                x: isMobile ? 0 : 3,
                y: 0,
                z: 0,
                duration: 1
            });
            if (bookGroup) bookGroup.visible = false;
            break;
        case 'blog':
            // Blog: Move far away
            gsap.to(galleryGroup.position, { x: 5, y: 0, z: -5, duration: 1.5 });

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
            break;
        default:
            if (bookGroup) bookGroup.visible = false;
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


}
initScrollReveals();

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
            color: 0xcccccc,
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
    }
}
createBackgroundShapes();

// BLOG ORNAMENTS (Floating Book/Brain)
let bookGroup;
function createBlogOrnaments() {
    bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Wireframe Color
    const wireMat = new THREE.MeshBasicMaterial({ color: 0xe879f9, wireframe: true, transparent: true, opacity: 0.3 });
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
        const mesh = new THREE.Mesh(ideaGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true }));
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

    // 1. Starfield Particles Animation (Force Field)
    if (particlesMesh) {
        // Slow Rotation
        particlesMesh.rotation.y = time * 0.05;

        // Force Field Logic
        // We need to transform mouse 2D into 3D world space approximately
        // Since particles are z -10 to +10, let's assume a plan around z=0 or vary per particle
        // Simple approach: Repel based on screen space projection or rough world space

        const positions = particlesMesh.geometry.attributes.position.array;

        // Convert mouse to Three.js world coordinates (roughly at z=0 plane)
        const vector = new THREE.Vector3(mouse3D.x, mouse3D.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));

        // Mouse World Pos (roughly)
        const mouseX = pos.x;
        const mouseY = pos.y;

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;

            // Get current and original positions
            // To make "rotation" work with "fixed" original positions, we have to apply rotation manually or 
            // simplify: let the mesh rotate, but apply local displacement?
            // Easier: Apply displacement to vertex positions relative to their initial spot.

            const ix = initialPosArray[i3];
            const iy = initialPosArray[i3 + 1];
            const iz = initialPosArray[i3 + 2];

            // Calculate distance to mouse (in this frame's rotated space, it's tricky, so let's ignore mesh rotation for physics calculation for simplicity, or reverse transform mouse)
            // Simpler visual hack: Repel x/y based on mouse

            // Distance from particle to mouse
            const dx = ix - mouseX * 2; // Multiplier to cover wider area as camera is far
            const dy = iy - mouseY * 2;
            // distSquared is faster
            const distSq = dx * dx + dy * dy;

            if (distSq < 2) { // Repulsion Radius
                const dist = Math.sqrt(distSq);
                const force = (2 - dist) * 2; // Strength

                // Push away
                positions[i3] = ix + (dx / dist) * force * 0.5;
                positions[i3 + 1] = iy + (dy / dist) * force * 0.5;
                positions[i3 + 2] = iz + force * 2; // Also push back in Z for 3D feel
            } else {
                // Return to original
                positions[i3] = lerp(positions[i3], ix, 0.1);
                positions[i3 + 1] = lerp(positions[i3 + 1], iy, 0.1);
                positions[i3 + 2] = lerp(positions[i3 + 2], iz, 0.1);
            }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
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

// BLOG INTERACTION
document.addEventListener('DOMContentLoaded', () => {
    const blogCard = document.querySelector('.blog-card');
    const closeBtn = document.querySelector('.close-article');

    if (blogCard) {
        blogCard.addEventListener('click', function (e) {
            // If already expanded, don't trigger (unless clicking something specifically handleable)
            if (this.classList.contains('expanded')) return;

            this.classList.add('expanded');

            // GSAP Entry Animation for content
            gsap.fromTo('.full-content',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.3 }
            );
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            const card = document.querySelector('.blog-card');
            if (card) {
                card.classList.remove('expanded');
            }
        });
    }
});
