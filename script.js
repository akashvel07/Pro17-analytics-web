/* =============================================
   PRO17 ANALYTICS — JAVASCRIPT
   - Navbar scroll + active links
   - Smooth scroll
   - Mobile menu (Hero A)
   - Scroll animations (IntersectionObserver)
   - Counter animation
   - Tab switching with progress bars
   - Contact form
   - Hero parallax
   - Hero Switcher (A ↔ B)
   - Hero B mobile menu
============================================= */

(function () {
  'use strict';

  
  /* 🔹 SMOOTH SCROLL 🔹 */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') {
        e.preventDefault();
        return;
      }
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } catch (err) {
        // ignore invalid selectors like "#"
      }
    });
  });

  /* ── SCROLL ANIMATIONS ── */

  const animateEls = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animateEls.forEach(el => {
    if (el.getAttribute('data-animate') !== 'stagger') {
      observer.observe(el);
    }
  });

  document.querySelectorAll('[data-animate="stagger"]').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      child.setAttribute('data-animate', 'stagger-child');
      observer.observe(child);
    });
  });

  /* ── COUNTER ANIMATION ── */
  function animateCounter(el, target, duration = 1800) {
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.getAttribute('data-target'), 10));
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter-number').forEach(el => counterObserver.observe(el));

  /* ── TAB SWITCHING ── */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(`tab-${targetTab}`);
      if (panel) {
        panel.classList.add('active');
        panel.querySelectorAll('.progress-fill').forEach(bar => {
          const width = bar.style.width;
          bar.style.width = '0%';
          setTimeout(() => { bar.style.width = width; }, 50);
        });
      }
    });
  });

  document.querySelectorAll('.tab-panel.active .progress-fill').forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = width; }, 600);
  });

  /* ── CONTACT FORM ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#16a34a';
        btn.style.borderColor = '#16a34a';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
          contactForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  /* ── HERO PARALLAX ── */
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      const orb1 = document.querySelector('.hero-orb-1');
      const orb2 = document.querySelector('.hero-orb-2');
      if (orb1) orb1.style.transform = `translateY(${scrollY * 0.3}px)`;
      if (orb2) orb2.style.transform = `translateY(${-scrollY * 0.2}px)`;
    }
  }, { passive: true });

  /* ── MOBILE NAV STYLES (Hero A) ── */
  const mobileStyle = document.createElement('style');
  mobileStyle.textContent = `
    @media (max-width: 768px) {
      #navLinks {
        display: none;
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(17, 17, 17, 0.98);
        backdrop-filter: blur(20px);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        z-index: 999;
        padding: 40px;
      }
      #navLinks.open { display: flex; }
      #navLinks .nav-link { font-size: 24px; padding: 16px 32px; font-weight: 700; }
      .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
      .hamburger.active span:nth-child(2) { opacity: 0; }
      .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
      #navbar { z-index: 1000; }
    }
    [data-animate="stagger-child"] {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    [data-animate="stagger-child"].visible {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(mobileStyle);

  /* ── HERO B MOBILE MENU ── */
  const hbMenuBtn    = document.getElementById('hbMenuBtn');
  const hbMobileMenu = document.getElementById('hbMobileMenu');
  const hbMenuClose  = document.getElementById('hbMenuClose');

  if (hbMenuBtn && hbMobileMenu) {
    hbMenuBtn.addEventListener('click', () => {
      hbMobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (hbMenuClose && hbMobileMenu) {
    hbMenuClose.addEventListener('click', () => {
      hbMobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  if (hbMobileMenu) {
    hbMobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hbMobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── CUSTOM CURSOR ── */
  const customCursor = document.querySelector('.custom-cursor');
  
  if (customCursor && window.matchMedia("(pointer: fine)").matches) {
    let cursorVisible = false;

    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Reveal cursor on first move
      if (!cursorVisible) {
        cursorVisible = true;
        customCursor.style.opacity = '1';
      }

      customCursor.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 200, fill: "forwards" });
    });

    // Add hover state on interactive elements
    const hoverables = document.querySelectorAll('a, button, .b-card, input, select, textarea, .tab-btn');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => customCursor.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => customCursor.classList.remove('cursor-hover'));
    });
  }

  /* ── PROCESS STEPS HIGHLIGHT ── */
  const processSteps = document.querySelectorAll('.process-step');
  if (processSteps.length > 0) {
    const processObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        } else {
          // If the card is below the center of the screen, remove the active class
          // This keeps it highlighted when it scrolls up to stack, but dims it if you scroll back down.
          if (entry.boundingClientRect.top > window.innerHeight / 2) {
            entry.target.classList.remove('active');
          }
        }
      });
    }, {
      rootMargin: "0px 0px -50% 0px", // Triggers when top of card passes 50% of the screen
      threshold: 0
    });

    processSteps.forEach(step => processObserver.observe(step));
  }

  // Dropdown Click Logic
  const dropdownWrappers = document.querySelectorAll('.dropdown-wrapper');
  
  dropdownWrappers.forEach(wrapper => {
    const mainLink = wrapper.querySelector('a.hb-link');
    if (mainLink) {
      mainLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        wrapper.classList.toggle('open');
      });
    }
  });

  document.addEventListener('click', (e) => {
    dropdownWrappers.forEach(wrapper => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove('open');
      }
    });
  });

  console.log('Pro17 Analytics Site initialized 🚀');
})();


/* ====== VERTICAL SERVICES SCROLLSPY ====== */
document.addEventListener('DOMContentLoaded', () => {
  const serviceTabBtns = document.querySelectorAll('.service-tab-btn');
  const servicePanels = document.querySelectorAll('.service-panel');
  if (serviceTabBtns.length === 0) return;

  // Scroll to target on sidebar button click
  serviceTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      
      if (targetPanel) {
        const offset = 100; // Account for fixed header
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = targetPanel.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Highly accurate distance-based viewport scrollspy tracker (Highlights buttons as user scrolls)
  function updateActiveTabOnScroll() {
    let activePanelId = null;
    let minDistance = Infinity;
    const viewportCenter = window.innerHeight / 2;

    servicePanels.forEach(panel => {
      const rect = panel.getBoundingClientRect();
      
      // If the panel covers the center of the screen, it is active
      if (rect.top <= viewportCenter && rect.bottom >= viewportCenter) {
        activePanelId = panel.getAttribute('id');
        minDistance = -1;
      } else if (minDistance !== -1) {
        // Otherwise, find the panel closest to the viewport center
        const panelCenter = rect.top + rect.height / 2;
        const distance = Math.abs(panelCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          activePanelId = panel.getAttribute('id');
        }
      }
    });

    if (activePanelId) {
      serviceTabBtns.forEach(btn => {
        if (btn.getAttribute('data-target') === activePanelId) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  // Bind scroll and resize events for live tracking
  window.addEventListener('scroll', updateActiveTabOnScroll);
  window.addEventListener('resize', updateActiveTabOnScroll);
  updateActiveTabOnScroll(); // Initial run
});

// ==========================================
// BACK TO TOP WITH SCROLL PROGRESS
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  const progressWrap = document.querySelector('.progress-wrap');
  if (progressWrap) {
    const progressPath = document.querySelector('.progress-wrap path');
    const pathLength = progressPath.getTotalLength();
    
    progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
    progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';
    
    const updateProgress = function () {
      const scroll = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = pathLength - (scroll * pathLength / docHeight);
      progressPath.style.strokeDashoffset = progress;
    }
    
    updateProgress();
    window.addEventListener('scroll', updateProgress);
    
    const offset = 50;
    window.addEventListener('scroll', function() {
      if (window.scrollY > offset) {
        progressWrap.classList.add('active-progress');
      } else {
        progressWrap.classList.remove('active-progress');
      }
    });
    
    progressWrap.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// Contact Form AJAX Submission and Popup
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('ajaxContactForm');
  const successPopup = document.getElementById('successPopup');
  const closePopupBtn = document.getElementById('closePopupBtn');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      
      // Submit the form data using Fetch
      fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Show the success popup
        if (successPopup) {
          successPopup.style.display = 'flex';
        }
        contactForm.reset(); // Clear the form
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        alert('There was a problem submitting your form. Please try again.');
      });
    });
  }
  
  if (closePopupBtn && successPopup) {
    closePopupBtn.addEventListener('click', () => {
      successPopup.style.display = 'none';
    });
  }
});
