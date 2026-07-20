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

/* ==========================================
   THEME TOGGLE (DARK / LIGHT MODE)
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  
  const sunSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  const moonSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

  function updateIcons(theme) {
    themeToggleBtns.forEach(btn => {
      btn.innerHTML = theme === 'dark' ? sunSVG : moonSVG;
    });
  }

  // 1. Check local storage or system preference
  const currentTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (currentTheme === 'dark' || (!currentTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  updateIcons(document.documentElement.getAttribute('data-theme') || 'light');

  // 2. Add click listener to all toggle buttons
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      let theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateIcons('light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateIcons('dark');
      }
    });
  });
});

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

  /* ── SECTION NAV SCROLLSPY & SMART ANIMATE ── */
  const sectionNavLinks = document.querySelectorAll('.section-nav-item');
  const sectionNavList = document.querySelector('.section-nav-list');
  
  if (sectionNavLinks.length > 0 && sectionNavList) {
    // Create the sliding indicator
    const indicator = document.createElement('div');
    indicator.className = 'nav-indicator';
    sectionNavList.appendChild(indicator);

    function updateIndicator(activeLink) {
      if (!activeLink) return;
      indicator.style.width = activeLink.offsetWidth + 'px';
      indicator.style.transform = `translateX(${activeLink.offsetLeft}px)`;
      
      // Auto-scroll the nav container to keep active tab centered on mobile
      if (window.innerWidth <= 991 && sectionNavList) {
        const linkLeft = activeLink.offsetLeft;
        const linkWidth = activeLink.offsetWidth;
        const listWidth = sectionNavList.offsetWidth;
        sectionNavList.scrollTo({
          left: linkLeft - (listWidth / 2) + (linkWidth / 2),
          behavior: 'smooth'
        });
      }
    }

    // Set initial indicator position
    const initialActive = document.querySelector('.section-nav-item.active') || sectionNavLinks[0];
    if (initialActive) {
      setTimeout(() => updateIndicator(initialActive), 100);
    }

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          sectionNavLinks.forEach(link => {
            if (link.getAttribute('href') === id) {
              link.classList.add('active');
              updateIndicator(link);
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    
    sectionNavLinks.forEach(link => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId !== '#') {
        const section = document.querySelector(targetId);
        if (section) sectionObserver.observe(section);
      }
    });

    // Update indicator on window resize
    window.addEventListener('resize', () => {
      const activeLink = document.querySelector('.section-nav-item.active');
      if (activeLink) updateIndicator(activeLink);
    });
  }

  /* ── COOKIE BANNER ── */
  const cookieConsent = localStorage.getItem('cookieConsent');
  if (!cookieConsent) {
    const bannerHTML = `
      <div id="cookie-banner">
        <div class="cookie-text">
          We use essential, performance, and functionality cookies to improve your experience. 
          By using our site, you agree to our <a href="cookie-policy.html">Cookie Policy</a>.
        </div>
        <div class="cookie-buttons">
          <button class="btn-cookie-decline" id="btn-cookie-decline">Decline</button>
          <button class="btn-cookie-accept" id="btn-cookie-accept">Accept All</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
    const banner = document.getElementById('cookie-banner');
    
    // Slight delay to allow CSS transition
    setTimeout(() => {
      banner.classList.add('show');
    }, 100);

    document.getElementById('btn-cookie-accept').addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.classList.remove('show');
    });

    document.getElementById('btn-cookie-decline').addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'declined');
      banner.classList.remove('show');
    });
  }
});

/* ==========================================
   CONTACT PAGE ACTIONS
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Phone click handling
  document.querySelectorAll('.phone-action').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = el.getAttribute('data-phone');
      if (isMobile) {
        window.location.href = 'tel:' + phone;
      } else {
        navigator.clipboard.writeText(phone).then(() => {
          const originalText = el.innerText;
          el.innerText = 'Copied!';
          setTimeout(() => { el.innerText = originalText; }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      }
    });
  });

  // Address click handling
  document.querySelectorAll('.address-action').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const address = el.getAttribute('data-address');
      let url = '';
      if (isIOS) {
        url = 'https://maps.apple.com/?daddr=' + encodeURIComponent(address);
      } else {
        url = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address);
      }
      window.open(url, '_blank');
    });
  });

  // Typewriter effect for CTA Headline (h2)
  const ctaHeadline = document.querySelector('h2.cta-headline');
  if (ctaHeadline) {
    const text = ctaHeadline.textContent;
    ctaHeadline.textContent = '';
    ctaHeadline.classList.add('typewriter-active');
    
    let index = 0;
    function type() {
      if (index < text.length) {
        ctaHeadline.textContent += text.charAt(index);
        index++;
        setTimeout(type, 50);
      } else {
        ctaHeadline.classList.remove('typewriter-active');
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          type();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(ctaHeadline);
  }

  // Active topbar nav link auto-highlight
  const pageName = window.location.pathname.split("/").pop() || 'index.html';
  document.querySelectorAll('.top-nav .nav-links a').forEach(link => {
    link.removeAttribute('style'); // Clear any hardcoded inline style (e.g. from index.html)
    const linkHref = link.getAttribute('href');
    
    const isServiceSubpage = ['data-analytics.html', 'cloud-engineering.html', 'digital-engineering.html', 'cyber-security.html', 'consulting-services.html'].includes(pageName);
    const isExpertiseSubpage = ['data-ai.html', 'modern-applications.html', 'iot-solutions.html'].includes(pageName);
    
    if (
      linkHref === pageName || 
      (linkHref === 'services.html' && isServiceSubpage) ||
      (linkHref === 'expertise.html' && isExpertiseSubpage)
    ) {
      link.style.color = 'var(--brand)';
      link.style.fontWeight = '700';
    }
  });
});

