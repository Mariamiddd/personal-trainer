/**
 * Personal Trainer - Main Script
 * Optimized for performance, accessibility, and high-end visual feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollReveal();
    initStickyHeader();
    initSmoothScroll();
    initMobileMenu();
    initContactForm();
    initProtocolSelection();
});

/**
 * 0. Preloader Logic
 */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('fade-out');
            // Remove from DOM after transition
            setTimeout(() => preloader.remove(), 800);
        }, 500); // Minimum visibility time for smooth feel
    });
}

/**
 * 1. Protocol Selection Logic
 * Synchronizes cards with the inquiry form and provides visual feedback.
 */
function initProtocolSelection() {
    const cards = document.querySelectorAll('.program-card');
    const selectorItems = document.querySelectorAll('.selector-item');
    const programSelect = document.getElementById('program');
    const contactSection = document.getElementById('contact');

    if (!programSelect) return;

    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const val = card.getAttribute('data-value');
            if (val) updateProtocolSelection(val, true);
        });
    });

    selectorItems.forEach(item => {
        item.addEventListener('click', () => {
            const val = item.getAttribute('data-value');
            if (val) updateProtocolSelection(val, false);
        });
    });

    function updateProtocolSelection(value, shouldScroll = false) {
        programSelect.value = value;
        selectorItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-value') === value);
        });

        if (shouldScroll && contactSection) {
            const headerHeight = document.querySelector('#main-header').offsetHeight || 80;
            const elementPosition = contactSection.getBoundingClientRect().top + window.pageYOffset;

            window.scrollTo({
                top: elementPosition - headerHeight,
                behavior: "smooth"
            });

            const form = document.querySelector('.contact-form');
            if (form) {
                form.classList.add('selection-highlight');
                setTimeout(() => form.classList.remove('selection-highlight'), 1200);
            }
        }
    }

    // Expose for HTML onclick access
    window.updateProtocolSelection = updateProtocolSelection;
}

/**
 * 2. Scroll Reveal Animation
 * Uses IntersectionObserver with a staggered entry for a premium feel.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-scroll');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -80px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        // Group entries that appear together to calculate stagger
        const appearing = entries.filter(e => e.isIntersecting);
        appearing.forEach((entry, index) => {
            setTimeout(() => {
                entry.target.classList.add('active');
            }, index * 150); // Increased stagger for better visibility
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * 3. Sticky Header
 */
function initStickyHeader() {
    const header = document.querySelector('#main-header');
    if (!header) return;

    const handleScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * 4. Smooth Anchor Scrolling
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();
            const headerHeight = document.querySelector('#main-header').offsetHeight || 80;
            const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

            window.scrollTo({
                top: elementPosition - headerHeight,
                behavior: "smooth"
            });

            // Close mobile menu
            const nav = document.querySelector('#main-nav');
            const menuToggle = document.getElementById('menu-toggle');
            if (nav?.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.classList.remove('open');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });
}

/**
 * 5. Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('#main-nav');

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('active');
        menuToggle.classList.toggle('open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
}

/**
 * 6. Contact Form Submission
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text') || submitBtn;

        const originalText = btnText.innerText;
        const formData = new FormData(contactForm);

        btnText.innerText = 'Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                showSuccessMessage(contactForm);
                contactForm.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            btnText.innerText = 'Error - Try Again';
            setTimeout(() => {
                btnText.innerText = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

function showSuccessMessage(form) {
    const successOverlay = document.createElement('div');
    successOverlay.className = 'form-success-overlay';
    successOverlay.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>Inquiry Received</h3>
            <p>Your request has been sent successfully. We will be in touch shortly.</p>
            <button class="btn secondary-light" onclick="this.closest('.form-success-overlay').remove(); document.body.style.overflow = '';">Close</button>
        </div>
    `;
    form.appendChild(successOverlay);
    setTimeout(() => successOverlay.classList.add('active'), 10);
}

