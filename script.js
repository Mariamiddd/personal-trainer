/**
 * Personal Trainer - Main Script
 * Organized into functional modules for better readability and maintainability.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initStickyHeader();
    initSmoothScroll();
    initMobileMenu();
    initHeroTilt();
    initContactForm();
    initProtocolSelection(); // Added selection system
});

/**
 * 7. Protocol Selection Logic
 * Bridges the gap between Protocol Cards and the Inquiry Form.
 */
function initProtocolSelection() {
    const cards = document.querySelectorAll('.program-card');
    const programSelect = document.getElementById('program');
    const contactSection = document.getElementById('contact');

    if (!cards.length || !programSelect) return;

    cards.forEach(card => {
        // Make the whole card clickable for better UX
        card.style.cursor = 'pointer';

        card.addEventListener('click', (e) => {
            const protocolValue = card.getAttribute('data-value');
            if (!protocolValue) return;

            // 1. Select the option in the dropdown
            programSelect.value = protocolValue;

            // 2. Smoothly scroll to the contact form
            const headerOffset = 90;
            const elementPosition = contactSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // 3. Visual feedback: briefly highlight the form
            const form = document.querySelector('.contact-form');
            form.classList.add('selection-highlight');
            setTimeout(() => form.classList.remove('selection-highlight'), 1500);

            // 4. Update the select field appearance (trigger any change events if needed)
            programSelect.classList.add('field-highlight');
            setTimeout(() => programSelect.classList.remove('field-highlight'), 1500);
        });
    });
}

/**
 * 1. Scroll Reveal Animation
 * Uses IntersectionObserver to reveal elements as they enter the viewport.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-scroll');

    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * 2. Sticky Header Effect
 * Toggles a class on the header based on scroll position.
 */
function initStickyHeader() {
    const header = document.querySelector('#main-header');
    if (!header) return;

    const handleScroll = () => {
        const isScrolled = window.scrollY > 50;
        header.classList.toggle('scrolled', isScrolled);
    };

    // Use a passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * 3. Smooth Anchor Scrolling
 * Implements smooth scrolling for internal links.
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            const headerOffset = 90;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Close mobile menu if open
            const nav = document.querySelector('#main-nav');
            const menuToggle = document.getElementById('menu-toggle');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.classList.remove('open');
            }
        });
    });
}

/**
 * 4. Mobile Menu Toggle
 * Handles hamburger menu interaction.
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('#main-nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('active');
        menuToggle.classList.toggle('open', isOpen);
    });
}

/**
 * 5. Interactive Hero Card (3D Tilt)
 * Adds a subtle 3D perspective effect on mouse move.
 */
function initHeroTilt() {
    const visualCard = document.querySelector('.visual-card');
    if (!visualCard) return;

    const handleMouseMove = (e) => {
        const { innerWidth, innerHeight } = window;
        const xAxis = (innerWidth / 2 - e.pageX) / 50;
        const yAxis = (innerHeight / 2 - e.pageY) / 50;

        visualCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    // Throttle or use RequestAnimationFrame for smoother/cheaper updates
    document.addEventListener('mousemove', handleMouseMove);
}

/**
 * 6. Contact Form Submission with Formspree (AJAX)
 * Prevents redirect and shows elegant inline success message
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const originalText = submitBtn.innerText;
        const formData = new FormData(contactForm);

        // Show loading state
        submitBtn.innerText = 'Initializing Protocol...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        // Create a timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                // Success - Show beautiful success message
                showSuccessMessage(contactForm);
                contactForm.reset();

                // Re-enable button text for future if overlay is closed
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Form submission failed');
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Submission error:', error);

            // Error state
            if (error.name === 'AbortError') {
                submitBtn.innerText = 'Timeout - Try Again';
            } else {
                submitBtn.innerText = 'Error - Try Again';
            }

            submitBtn.style.opacity = '1';
            setTimeout(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

/**
 * Display success message with elegant animation
 */
function showSuccessMessage(form) {
    // Create success overlay
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success-overlay';
    successMessage.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>Protocol Initialized</h3>
            <p>Your consultation request has been received. We'll analyze your baseline and reach out within 24 hours.</p>
            <button class="btn secondary-light" onclick="this.closest('.form-success-overlay').remove();">Close</button>
        </div>
    `;

    // Insert and animate
    form.style.position = 'relative';
    form.appendChild(successMessage);

    setTimeout(() => {
        successMessage.classList.add('active');
    }, 10);
}
