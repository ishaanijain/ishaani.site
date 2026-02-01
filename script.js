/* ===========================================
   PORTFOLIO JAVASCRIPT
   =========================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ===========================================
    // MOBILE MENU TOGGLE
    // ===========================================
    const navToggle = document.querySelector('.nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // ===========================================
    // TYPING ANIMATION (Home Page)
    // ===========================================
    const nameText = document.getElementById('name-text');
    
    if (nameText) {
        const name = "ISHAANI JAIN"; // <-- EDIT YOUR NAME HERE
        let index = 0;
        
        function typeWriter() {
            if (index < name.length) {
                nameText.textContent += name.charAt(index);
                index++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }

    // ===========================================
    // LANGUAGE BAR ANIMATION (About Page)
    // ===========================================
    const languageFills = document.querySelectorAll('.language-fill');
    
    if (languageFills.length > 0) {
        languageFills.forEach(fill => {
            const width = fill.getAttribute('data-width');
            fill.style.width = '0%';
            
            setTimeout(() => {
                fill.style.width = width;
            }, 300);
        });
    }

    // ===========================================
    // SCROLL ANIMATIONS
    // ===========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // ===========================================
    // ACTIVE NAV LINK HIGHLIGHT
    // ===========================================
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

});

/* ===========================================
   UTILITY FUNCTIONS
   You can use these to dynamically update content
   =========================================== */

// Example: Add a new timeline item dynamically
function addTimelineItem(year, title, description) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
        <span class="timeline-year">${year}</span>
        <h3 class="timeline-title">${title}</h3>
        <p class="timeline-desc">${description}</p>
    `;
    
    timeline.appendChild(item);
}

// Example: Add a new skill tag
function addSkill(category, skillName) {
    const categoryEl = document.querySelector(`[data-category="${category}"] .skills-list`);
    if (!categoryEl) return;
    
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.textContent = skillName;
    
    categoryEl.appendChild(tag);
}
