/* ===========================================
   COSMIC GLASS JAVASCRIPT
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===========================================
    // CUSTOM CURSOR
    // ===========================================
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    
    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            
            // Dot follows instantly
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            // Outline follows with slight delay (handled by CSS transition somewhat, but JS ensures position)
            // But for smoother effect we can animate it
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });

            // Update CSS variables for Glow Effects
            document.body.style.setProperty('--mouse-x', `${posX}px`);
            document.body.style.setProperty('--mouse-y', `${posY}px`);
        });

        // Hover Effect for Links/Buttons
        const interactables = document.querySelectorAll('a, button, .xp-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.borderColor = 'var(--primary)';
                cursorOutline.style.backgroundColor = 'rgba(157, 0, 255, 0.1)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.borderColor = 'var(--secondary)';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // ===========================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ===========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // ===========================================
    // TILT EFFECT FOR CARDS (Vanilla JS)
    // ===========================================
    const cards = document.querySelectorAll('.xp-card, .hero-image-glass');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation centered on card
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
            const rotateY = ((x - centerX) / centerX) * 5;  // Max 5deg
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
});
