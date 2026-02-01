/* ===========================================
   REDOYAN 3D - INTERACTIVITY
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ===========================================
    // 1. MAGNETIC CURSOR & HOVER EFFECTS
    // ===========================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    const magneticLinks = document.querySelectorAll('a, button, .wall-item, .dark-card');

    window.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${x}px`;
        cursorDot.style.top = `${y}px`;

        // Ring follows with slight delay (handled by CSS transition for smooth feel)
        // We just update position, CSS does the rest
        cursorRing.animate({
            left: `${x}px`,
            top: `${y}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover State
    magneticLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorRing.style.width = '60px';
            cursorRing.style.height = '60px';
            cursorRing.style.background = 'rgba(255, 255, 255, 0.1)';
            cursorRing.style.border = 'none';
        });

        link.addEventListener('mouseleave', () => {
            cursorRing.style.width = '40px';
            cursorRing.style.height = '40px';
            cursorRing.style.background = 'transparent';
            cursorRing.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        });
    });

    // ===========================================
    // 2. 3D AVATAR TILT (Redoyan Style)
    // ===========================================
    const avatarContainer = document.querySelector('.avatar-container');
    const avatarImg = document.querySelector('.avatar-img');

    if (avatarContainer) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.clientX) / 20; // Divider controls sensitivity
            const y = (window.innerHeight / 2 - e.clientY) / 20;

            // Apply rotation to container
            avatarContainer.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
        });
    }

    // ===========================================
    // 3. TYPING ANIMATION (Sumanth/Redoyan Mix)
    // ===========================================
    const typingElement = document.getElementById('typing-text');
    const phrases = [
        "Founding Engineer.",
        "CS & Physics Student.",
        "Creative Technologist.",
        "Artist."
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        if (!typingElement) return;

        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster deletion
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100; // Normal typing
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing
    setTimeout(type, 1000);
});
