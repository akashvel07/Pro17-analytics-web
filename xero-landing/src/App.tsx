import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<'stack' | 'shield' | null>(null);
  const [splashAnim, setSplashAnim] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState('what-we-do');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTestimonialsPaused, setIsTestimonialsPaused] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailOrPhone: '',
    message: ''
  });
  const [cardStates, setCardStates] = useState<('front' | 'middle' | 'back' | 'leaving' | 'entering')[]>([
    'front',
    'middle',
    'back'
  ]);

  const switchToTestimonial = (targetIndex: number) => {
    setCardStates((prevStates) => {
      const nextStates = [...prevStates];
      const currentFront = nextStates.indexOf('front');
      
      // If no front card is found or if target is already front, do nothing
      if (currentFront === -1 || currentFront === targetIndex) return prevStates;

      // Handle leaving state transitions
      nextStates[currentFront] = 'leaving';
      nextStates[targetIndex] = 'front';
      
      const otherIndex = [0, 1, 2].find(idx => idx !== currentFront && idx !== targetIndex);
      if (otherIndex !== undefined) {
        nextStates[otherIndex] = 'middle';
      }

      setActiveTestimonial(targetIndex);

      // Trigger standard CSS transition teleportation sequence
      setTimeout(() => {
        setCardStates((states) => {
          const s = [...states];
          const idx = s.indexOf('leaving');
          if (idx !== -1) s[idx] = 'entering';
          return s;
        });

        setTimeout(() => {
          setCardStates((states) => {
            const s = [...states];
            const idx = s.indexOf('entering');
            if (idx !== -1) s[idx] = 'back';
            return s;
          });
        }, 50);
      }, 500);

      return nextStates;
    });
  };

  // Cycle testimonials interval
  useEffect(() => {
    if (isTestimonialsPaused) return;
    const timer = setInterval(() => {
      const nextIndex = (activeTestimonial + 1) % 3;
      switchToTestimonial(nextIndex);
    }, 3500);
    return () => clearInterval(timer);
  }, [isTestimonialsPaused, activeTestimonial]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.emailOrPhone || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        firstName: '',
        lastName: '',
        emailOrPhone: '',
        message: ''
      });
    }, 4000);
  };

  // Scroll spy effect
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ['what-we-do', 'who-we-are', 'how-we-work', 'domain-expertise', 'affiliations', 'tech-stack', 'testimonials', 'get-in-touch'];
      
      let currentActive = 'what-we-do';
      // Adjust this offset depending on how far down the screen a section needs to be to become "active"
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const { top } = element.getBoundingClientRect();
          const offsetTop = top + window.scrollY;
          
          if (scrollPosition >= offsetTop) {
            currentActive = id;
          }
        }
      }
      
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScrollSpy);
    // trigger once on mount
    handleScrollSpy();

    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const scrollTextRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [activeCards, setActiveCards] = useState<boolean[]>([false, false, false, false]);

  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const [statsRedInView, setStatsRedInView] = useState(false);
  const statsRedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTextRef.current) {
        const rect = scrollTextRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const start = windowHeight * 0.85; 
        const end = windowHeight * 0.4;
        let p = (start - rect.top) / (start - end);
        p = Math.max(0, Math.min(1, p));
        setScrollProgress(p);
      }

      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const start = windowHeight * 0.5;
        const end = -(rect.height - windowHeight * 0.5);
        let p = (start - rect.top) / (start - end);
        p = Math.max(0, Math.min(1, p));
        setTimelineProgress(p);

        // Check each card's position relative to center of screen
        const cardElements = timelineRef.current.querySelectorAll('.timeline-item');
        
        setActiveCards(prevCards => {
          const newActiveCards = [...prevCards];
          let changed = false;
          
          cardElements.forEach((el, index) => {
            const cardRect = el.getBoundingClientRect();
            // The card is considered active if its top edge passes the center of the screen
            const isActive = cardRect.top <= windowHeight / 2;
            
            if (newActiveCards[index] !== isActive) {
              newActiveCards[index] = isActive;
              changed = true;
            }
          });

          return changed ? newActiveCards : prevCards;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    const observerRed = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsRedInView(true);
        observerRed.disconnect();
      }
    }, { threshold: 0.2 });
    
    if (statsRedRef.current) {
      observerRed.observe(statsRedRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const pipelineRef = useRef<HTMLDivElement>(null);
  const nodeStackRef = useRef<HTMLDivElement>(null);
  const nodeXRef = useRef<HTMLDivElement>(null);
  const nodeShieldRef = useRef<HTMLDivElement>(null);
  const beamPathGlowRef = useRef<SVGPathElement>(null);
  const beamPathCoreRef = useRef<SVGPathElement>(null);
  const beamGradientRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    let animationFrameId: number;
    let phase = 'p1'; // 'p1', 'splash', 'p2', 'idle'
    let lastStateChange = performance.now();

    const updatePath = () => {
      if (!pipelineRef.current || !nodeStackRef.current || !nodeXRef.current || !nodeShieldRef.current) return;
      
      const pRect = pipelineRef.current.getBoundingClientRect();
      const sRect = nodeStackRef.current.getBoundingClientRect();
      const xRect = nodeXRef.current.getBoundingClientRect();
      const shRect = nodeShieldRef.current.getBoundingClientRect();
      
      const startX = sRect.left + sRect.width / 2 - pRect.left;
      const startY = sRect.top + sRect.height / 2 - pRect.top;
      
      const midX = xRect.left + xRect.width / 2 - pRect.left;
      const midY = xRect.top + xRect.height / 2 - pRect.top;
      
      const endX = shRect.left + shRect.width / 2 - pRect.left;
      const endY = shRect.top + shRect.height / 2 - pRect.top;
      
      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      
      if (beamPathGlowRef.current && beamPathCoreRef.current) {
        beamPathGlowRef.current.setAttribute('d', d);
        beamPathCoreRef.current.setAttribute('d', d);
      }
    };

    const tick = (now: number) => {
      const elapsed = now - lastStateChange;

      // Update path in case of resize
      updatePath();

      if (phase === 'p1') {
        const duration = 800;
        let p = elapsed / duration;
        if (p > 1) p = 1;

        if (p < 0.4) {
          setActiveNode('stack');
        } else {
          setActiveNode(null);
        }

        const center = (p * 0.5) * 100;
        if (beamGradientRef.current) {
          beamGradientRef.current.setAttribute('x1', `${center - 5}%`);
          beamGradientRef.current.setAttribute('x2', `${center + 5}%`);
        }
        
        if (beamPathGlowRef.current && beamPathCoreRef.current) {
            beamPathGlowRef.current.style.opacity = '0.6';
            beamPathCoreRef.current.style.opacity = '1';
        }

        if (p === 1) {
          phase = 'splash';
          lastStateChange = now;
          setSplashAnim(true);
          if (beamPathGlowRef.current && beamPathCoreRef.current) {
            beamPathGlowRef.current.style.opacity = '0';
            beamPathCoreRef.current.style.opacity = '0';
          }
        }
      } else if (phase === 'splash') {
        const duration = 800;
        if (elapsed > duration) {
          phase = 'p2';
          lastStateChange = now;
          setSplashAnim(false);
          if (beamPathGlowRef.current && beamPathCoreRef.current) {
            beamPathGlowRef.current.style.opacity = '0.6';
            beamPathCoreRef.current.style.opacity = '1';
          }
        }
      } else if (phase === 'p2') {
        const duration = 800;
        let p = elapsed / duration;
        if (p > 1) p = 1;

        if (p > 0.6) {
          setActiveNode('shield');
        } else {
          setActiveNode(null);
        }

        const center = (0.5 + p * 0.5) * 100;
        if (beamGradientRef.current) {
          beamGradientRef.current.setAttribute('x1', `${center - 5}%`);
          beamGradientRef.current.setAttribute('x2', `${center + 5}%`);
        }

        if (p === 1) {
          phase = 'idle';
          lastStateChange = now;
          setActiveNode(null);
        }
      } else if (phase === 'idle') {
        const duration = 1000;
        if (elapsed > duration) {
          phase = 'p1';
          lastStateChange = now;
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updatePath);
    };
  }, []);

  const statementWords = [
    { text: "From", type: "normal" },
    { text: "data", type: "highlight" },
    { text: "strategy", type: "highlight" },
    { text: "to", type: "normal" },
    { text: "deployment", type: "normal" },
    { text: "—", type: "normal" },
    { text: "we", type: "normal" },
    { text: "cover", type: "normal" },
    { text: "the", type: "normal" },
    { text: "full", type: "normal" },
    { text: "spectrum", type: "normal" },
    { text: "of", type: "normal" },
    { text: "modern", type: "highlight" },
    { text: "technology", type: "highlight" },
    { text: "services,", type: "highlight" },
    { text: "designed", type: "normal" },
    { text: "for", type: "normal" },
    { text: "seamless", type: "normal" },
    { text: "integration", type: "normal" },
    { text: "and", type: "normal" },
    { text: "maximum", type: "normal" },
    { text: "ROI.", type: "normal" }
  ];

  return (
    <>
      <div className="bg-glow-container">
        <div className="bg-glow-orb orb-1"></div>
        <div className="bg-glow-orb orb-2"></div>
        <div className="bg-glow-orb orb-3"></div>
      </div>
      <nav>
        <img src="https://pro17analytics.com/assets/images/pro17analytics-logo.png" alt="Pro17 Analytics" style={{ height: '32px', filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)' }} />
        
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><a href="#" style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>Home</a></li>
            <li><a href="#">About</a></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <a href="#">Services</a>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginTop: '2px' }}>
                <polyline points="1 1 5 5 9 1"></polyline>
              </svg>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <a href="#">Expertise</a>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginTop: '2px' }}>
                <polyline points="1 1 5 5 9 1"></polyline>
              </svg>
            </li>
            <li><a href="#">Contact</a></li>
          </ul>
          
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <button className="btn-signup">Let's talk</button>
          </div>
        </div>

        <button 
          className={`menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
        </button>
      </nav>

      <section className="hero-card">
        <div className="hero-grid"></div>
        
        <div className="icon-pipeline" ref={pipelineRef}>
          <svg className="beam-svg" preserveAspectRatio="none">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="0%" y2="0%" ref={beamGradientRef}>
                <stop offset="0%" stopColor="#911A1C" stopOpacity="0" />
                <stop offset="20%" stopColor="#911A1C" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                <stop offset="80%" stopColor="#b82325" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#b82325" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path ref={beamPathGlowRef} fill="none" stroke="url(#beam-gradient)" strokeWidth="2" filter="url(#glow)" style={{opacity: 0.6}} />
            <path ref={beamPathCoreRef} fill="none" stroke="url(#beam-gradient)" strokeWidth="0.8" />
          </svg>

          <div 
            id="node-stack" 
            ref={nodeStackRef}
            className={`icon-node node-light-right ${activeNode === 'stack' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>

          <div className="pipeline-line"></div>

          <div style={{ position: 'relative' }}>
            <div className={`splash ${splashAnim ? 'animate' : ''}`}></div>
            <div id="node-x" ref={nodeXRef} className="icon-node-center">
              <img src="https://pro17analytics.com/assets/images/pro17analytics-logo.png" alt="Pro17 Analytics" style={{ width: '44px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
          </div>

          <div className="pipeline-line right"></div>

          <div 
            id="node-shield" 
            ref={nodeShieldRef}
            className={`icon-node node-light-left ${activeNode === 'shield' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
        </div>

        <div className="hero-content">
          <h1 className="hero-heading">
            TRANSFORM DATA INTO<br />
            <span>INTELLIGENCE</span>
          </h1>
          <p className="hero-sub">
            Empowering enterprises through Artificial Intelligence, Advanced Analytics, Cloud Engineering, Cyber Security and Intelligent Digital Solutions that accelerate business transformation.
          </p>
          <a href="#" className="btn-cta">Get Started</a>
        </div>
      </section>

      <div className="trusted-section">
        <h3 className="trusted-heading">TRUSTED BY INDUSTRY LEADERS</h3>
        <div className="marquee-track">
          <div className="marquee-inner">
            <span className="logo-chip"><img src="https://api.iconify.design/logos/microsoft-azure.svg" alt="" width="16" height="16" /> Microsoft Azure</span>
            <span className="logo-chip"><img src="https://api.iconify.design/logos/aws.svg" alt="" width="16" height="16" /> AWS</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/googlecloud" alt="" width="16" height="16" /> Google Cloud</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/databricks" alt="" width="16" height="16" /> Databricks</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/snowflake" alt="" width="16" height="16" /> Snowflake</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/sap" alt="" width="16" height="16" /> SAP</span>
            <span className="logo-chip"><img src="https://api.iconify.design/logos/microsoft-power-bi.svg" alt="" width="16" height="16" /> Power BI</span>
            <span className="logo-chip"><img src="https://api.iconify.design/logos/tableau-icon.svg" alt="" width="16" height="16" /> Tableau</span>
            {/* duplicate for seamless loop */}
            <span className="logo-chip"><img src="https://api.iconify.design/logos/microsoft-azure.svg" alt="" width="16" height="16" /> Microsoft Azure</span>
            <span className="logo-chip"><img src="https://api.iconify.design/logos/aws.svg" alt="" width="16" height="16" /> AWS</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/googlecloud" alt="" width="16" height="16" /> Google Cloud</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/databricks" alt="" width="16" height="16" /> Databricks</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/snowflake" alt="" width="16" height="16" /> Snowflake</span>
            <span className="logo-chip"><img src="https://cdn.simpleicons.org/sap" alt="" width="16" height="16" /> SAP</span>
            <span className="logo-chip"><img src="https://api.iconify.design/logos/microsoft-power-bi.svg" alt="" width="16" height="16" /> Power BI</span>
            <span className="logo-chip"><img src="https://api.iconify.design/logos/tableau-icon.svg" alt="" width="16" height="16" /> Tableau</span>
          </div>
        </div>
      </div>

      <section className={`stats-section ${statsInView ? 'animate' : ''}`} ref={statsRef}>
        <div className="stats-left">
          <h2>Our Impact</h2>
          <p>No project is beyond our scope. We operate at scale, leveraging advanced analytics and AI technology to serve enterprises across diverse sectors and terrains.</p>
        </div>
        <div className="stats-right">
          <div className="stat-item">
            <div className="stat-line"></div>
            <div className="stat-content">
              <div className="stat-value">20<span>+</span></div>
              <div className="stat-title">Years of Innovation</div>
              <div className="stat-desc">Years of delivering cutting-edge analytics and digital solutions.</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-line"></div>
            <div className="stat-content">
              <div className="stat-value">500<span>+</span></div>
              <div className="stat-title">Enterprise AI Models</div>
              <div className="stat-desc">Advanced machine learning models deployed in diverse conditions.</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-line"></div>
            <div className="stat-content">
              <div className="stat-value">150<span>+</span></div>
              <div className="stat-title">Cloud Migrations</div>
              <div className="stat-desc">Successful infrastructure migrations across various industries.</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-line"></div>
            <div className="stat-content">
              <div className="stat-value">98<span>%</span></div>
              <div className="stat-title">Client Satisfaction</div>
              <div className="stat-desc">Our commitment to excellence is reflected in client feedback.</div>
            </div>
          </div>
        </div>
      </section>

      <div className={`secondary-nav ${activeSection === 'get-in-touch' ? 'released' : ''}`}>
        <ul>
          <li className={activeSection === 'what-we-do' ? 'active' : ''}>
            <a href="#what-we-do" onClick={(e) => { e.preventDefault(); document.getElementById('what-we-do')?.scrollIntoView({behavior: 'smooth'}); }}>What We Do</a>
          </li>
          <li className={activeSection === 'who-we-are' ? 'active' : ''}>
            <a href="#who-we-are" onClick={(e) => { e.preventDefault(); document.getElementById('who-we-are')?.scrollIntoView({behavior: 'smooth'}); }}>Who We Are</a>
          </li>
          <li className={activeSection === 'how-we-work' ? 'active' : ''}>
            <a href="#how-we-work" onClick={(e) => { e.preventDefault(); document.getElementById('how-we-work')?.scrollIntoView({behavior: 'smooth'}); }}>How We Work</a>
          </li>
          <li className={activeSection === 'domain-expertise' ? 'active' : ''}>
            <a href="#domain-expertise" onClick={(e) => { e.preventDefault(); document.getElementById('domain-expertise')?.scrollIntoView({behavior: 'smooth'}); }}>Our Domain Expertise</a>
          </li>
          <li className={activeSection === 'affiliations' ? 'active' : ''}>
            <a href="#affiliations" onClick={(e) => { e.preventDefault(); document.getElementById('affiliations')?.scrollIntoView({behavior: 'smooth'}); }}>Our Affiliations</a>
          </li>
          <li className={activeSection === 'tech-stack' ? 'active' : ''}>
            <a href="#tech-stack" onClick={(e) => { e.preventDefault(); document.getElementById('tech-stack')?.scrollIntoView({behavior: 'smooth'}); }}>Our Tech Stack</a>
          </li>
          <li className={activeSection === 'testimonials' ? 'active' : ''}>
            <a href="#testimonials" onClick={(e) => { e.preventDefault(); document.getElementById('testimonials')?.scrollIntoView({behavior: 'smooth'}); }}>Testimonials</a>
          </li>
          <li className={activeSection === 'get-in-touch' ? 'active' : ''}>
            <a href="#get-in-touch" onClick={(e) => { e.preventDefault(); document.getElementById('get-in-touch')?.scrollIntoView({behavior: 'smooth'}); }}>Get in Touch</a>
          </li>
        </ul>
      </div>

      <section id="what-we-do" className="about-statement-section">
        <div className="about-statement-container">
          <div className="about-left" style={{flexDirection: 'column', gap: '20px'}}>
            <h2 style={{fontFamily: 'Georgia, serif', fontSize: '24px', color: 'var(--text)', margin: 0, fontWeight: 400}}>What We Do</h2>
            <div>
              <a href="#" className="btn-cta">Explore services</a>
            </div>
          </div>
          <div className="about-right">
            <h2 className="statement-text" ref={scrollTextRef}>
              {statementWords.map((w, i) => {
                const step = 1 / statementWords.length;
                const wordStart = i * step;
                const wordEnd = (i + 1) * step;
                
                let wordOpacity = 0.2;
                if (scrollProgress >= wordEnd) {
                  wordOpacity = 1;
                } else if (scrollProgress > wordStart) {
                  const localProgress = (scrollProgress - wordStart) / step;
                  wordOpacity = 0.2 + (0.8 * localProgress);
                }
                
                return (
                  <span 
                    key={i} 
                    className={w.type === 'highlight' ? "highlight-red" : ""}
                    style={{ opacity: wordOpacity, transition: 'opacity 0.1s ease-out' }}
                  >
                    {w.text}{' '}
                  </span>
                );
              })}
            </h2>
          </div>
        </div>
      </section>

      <section className="sticky-services-section">
        <div className="sticky-card-wrapper">
          <div className="b-card card-gradient-1">
            <div className="b-card-content">
              <h3>Data, Analytics & Insights</h3>
              <p>Unlock actionable intelligence from your data with our end-to-end analytics pipelines, BI dashboards, and advanced ML models.</p>
            </div>
            <div className="b-card-footer">
              <span className="b-card-pill">Analytics</span>
              <button className="b-card-arrow">→</button>
            </div>
          </div>
        </div>

        <div className="sticky-card-wrapper">
          <div className="b-card card-gradient-2">
            <div className="b-card-content">
              <h3>Cloud Engineering</h3>
              <p>Architect, migrate, and optimize cloud infrastructure across AWS, Azure, and GCP.</p>
            </div>
            <div className="b-card-footer">
              <span className="b-card-pill">Infrastructure</span>
              <button className="b-card-arrow">→</button>
            </div>
          </div>
        </div>

        <div className="sticky-card-wrapper">
          <div className="b-card card-gradient-3">
            <div className="b-card-content">
              <h3>Digital Engineering</h3>
              <p>Build resilient, high-performance digital products with modern software practices.</p>
            </div>
            <div className="b-card-footer">
              <span className="b-card-pill">Development</span>
              <button className="b-card-arrow">→</button>
            </div>
          </div>
        </div>

        <div className="sticky-card-wrapper">
          <div className="b-card card-gradient-1">
            <div className="b-card-content">
              <h3>Intelligent Edges</h3>
              <p>Seamlessly integrate IoT devices with edge computing frameworks for real-time processing.</p>
            </div>
            <div className="b-card-footer">
              <span className="b-card-pill">IoT</span>
              <button className="b-card-arrow">→</button>
            </div>
          </div>
        </div>

        <div className="sticky-card-wrapper">
          <div className="b-card card-gradient-2">
            <div className="b-card-content">
              <h3>Cyber Security</h3>
              <p>Protect digital assets with comprehensive audits and zero-trust architecture.</p>
            </div>
            <div className="b-card-footer">
              <span className="b-card-pill">Security</span>
              <button className="b-card-arrow">→</button>
            </div>
          </div>
        </div>
      </section>

      <section id="who-we-are" className="who-we-are-section">
        <div className="bento-container">
          
          {/* Main Hero Tile */}
          <div className="bento-tile bento-hero">
            <span className="bento-label">WHO WE ARE</span>
            <h2 className="bento-title">Transforming Data into <span className="highlight-red">Strategic Insights</span></h2>
            <p className="bento-text">
              Pro17 Analytics transforms businesses by harnessing the power of data, AI, and cloud technologies. Our modern engineering and IoT solutions are designed to be scalable, efficient, and perfectly tailored to the demands of today's digital landscape.
            </p>
            <a href="#" className="btn-cta">Start Your Journey</a>
          </div>

          {/* Visual Tech Tile (Radar/Pulse) */}
          <div className="bento-tile bento-visual">
            <div className="radar-wrapper">
              <div className="radar-circle circle-1"></div>
              <div className="radar-circle circle-2"></div>
              <div className="radar-circle circle-3"></div>
              <div className="radar-core">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>
              <div className="radar-dot dot-1"></div>
              <div className="radar-dot dot-2"></div>
              <div className="radar-dot dot-3"></div>
              <div className="radar-dot dot-4"></div>
            </div>
          </div>

          {/* Capabilities Tile */}
          <div className="bento-tile bento-capabilities">
            <ul className="capabilities-list">
              <li>
                <span className="red-diamond"></span>
                AI-First Approach
              </li>
              <li>
                <span className="red-diamond"></span>
                Cloud-Native Solutions
              </li>
              <li>
                <span className="red-diamond"></span>
                Data-Driven Culture
              </li>
              <li>
                <span className="red-diamond"></span>
                End-to-End Delivery
              </li>
            </ul>
          </div>

          {/* Milestone Tile */}
          <div className="bento-tile bento-milestone">
            <h3>20 Years of Excellence</h3>
            <p>Recognized as a top analytics firm, delivering proven data strategies and innovative engineering.</p>
          </div>

        </div>
      </section>

      <section className={`stats-red-section ${statsRedInView ? 'animate' : ''}`} ref={statsRedRef}>
        <div className="stats-red-container">
          <div className="stats-red-item">
            <h3 className="stats-red-num">10<span className="stats-red-plus">+</span></h3>
            <p className="stats-red-label">Years in Business</p>
          </div>
          <div className="stats-red-item">
            <h3 className="stats-red-num">200<span className="stats-red-plus">+</span></h3>
            <p className="stats-red-label">Projects Completed</p>
          </div>
          <div className="stats-red-item">
            <h3 className="stats-red-num">50<span className="stats-red-plus">+</span></h3>
            <p className="stats-red-label">Global Clients</p>
          </div>
          <div className="stats-red-item">
            <h3 className="stats-red-num">99<span className="stats-red-plus">%</span></h3>
            <p className="stats-red-label">Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* HOW WE WORK - TIMELINE */}
      <section id="how-we-work" className="timeline-section">
        <div className="timeline-header">
          <p className="timeline-eyebrow">HOW WE WORK</p>
          <h2 className="timeline-title">Our Proven <span className="text-red">Delivery Process</span></h2>
        </div>
        
        <div className="timeline-container" ref={timelineRef} style={{ '--scroll-progress': `${timelineProgress * 100}%` } as React.CSSProperties}>
          
          {/* Card 1 - Left */}
          <div className={`timeline-item left ${activeCards[0] ? 'active' : ''}`}>
            <div className="timeline-card glass-panel">
              <div className="timeline-card-number">01</div>
              <h3 className="hww-card-title">Discover & Define</h3>
              <p style={{color: 'var(--text-muted)', marginBottom: '0'}}>Deep-dive workshops to understand your goals, data landscape, and business challenges before any code is written.</p>
            </div>
          </div>

          {/* Card 2 - Right */}
          <div className={`timeline-item right ${activeCards[1] ? 'active' : ''}`}>
            <div className="timeline-card glass-panel">
              <div className="timeline-card-number">02</div>
              <h3 className="hww-card-title">Design & Architect</h3>
              <p style={{color: 'var(--text-muted)', marginBottom: '0'}}>Blueprint your solution architecture with scalability, security, and performance at its core from day one.</p>
            </div>
          </div>

          {/* Card 3 - Left */}
          <div className={`timeline-item left ${activeCards[2] ? 'active' : ''}`}>
            <div className="timeline-card glass-panel">
              <div className="timeline-card-number">03</div>
              <h3 className="hww-card-title">Build & Iterate</h3>
              <p style={{color: 'var(--text-muted)', marginBottom: '0'}}>Agile delivery with continuous feedback loops, ensuring every sprint delivers measurable business value.</p>
            </div>
          </div>

          {/* Card 4 - Right */}
          <div className={`timeline-item right ${activeCards[3] ? 'active' : ''}`}>
            <div className="timeline-card glass-panel">
              <div className="timeline-card-number">04</div>
              <h3 className="hww-card-title">Deploy & Optimize</h3>
              <p style={{color: 'var(--text-muted)', marginBottom: '0'}}>Production-grade deployment with ongoing monitoring, optimization, and knowledge transfer to your team.</p>
            </div>
          </div>

        </div>
      </section>

      {/* DOMAIN EXPERTISE */}
      <div id="domain-expertise" className="auto-style-100">
        <div className="timeline-header" style={{ marginBottom: '50px' }}>
          <p className="timeline-eyebrow">OUR DOMAIN EXPERTISE</p>
          <h2 className="timeline-title">Domain <span className="text-red">Expertise</span></h2>
        </div>
        <div className="domain-ticker-wrap auto-style-102">
          {/* fade edges */}
          <div className="auto-style-103"></div>
          <div className="auto-style-104"></div>
          
          <div className="domain-ticker-inner">
            {/* Duplicate items for seamless scroll (24 items total) */}
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_fintech_1783056127670.png" alt="Fin-Tech" loading="lazy" width="128" height="128" /></div><span className="domain-title">Fin-Tech</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_livestock_1783056137889.png" alt="Livestock" loading="lazy" width="128" height="128" /></div><span className="domain-title">Livestock</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_logistics_1783056146998.png" alt="Logistics" loading="lazy" width="128" height="128" /></div><span className="domain-title">Logistics</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_publicsector_1783056160572.png" alt="Public Sector" loading="lazy" width="128" height="128" /></div><span className="domain-title">Public Sector</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_healthcare_1783056177331.png" alt="Healthcare" loading="lazy" width="128" height="128" /></div><span className="domain-title">Healthcare</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_energy_1783056186218.png" alt="Energy" loading="lazy" width="128" height="128" /></div><span className="domain-title">Energy</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_edutech_1783056194977.png" alt="Edu Tech" loading="lazy" width="128" height="128" /></div><span className="domain-title">Edu Tech</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_agriculture_1783056204318.png" alt="Agriculture" loading="lazy" width="128" height="128" /></div><span className="domain-title">Agriculture</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_manufacturing_1783056220895.png" alt="Manufacturing" loading="lazy" width="128" height="128" /></div><span className="domain-title">Manufacturing</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_fmcg_1783056232415.png" alt="FMCG" loading="lazy" width="128" height="128" /></div><span className="domain-title">FMCG</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_telecom_1783056241538.png" alt="Telecom" loading="lazy" width="128" height="128" /></div><span className="domain-title">Telecom</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_facility_1783056251095.png" alt="Facility Management" loading="lazy" width="128" height="128" /></div><span className="domain-title">Facility Management</span></div>
            
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_fintech_1783056127670.png" alt="Fin-Tech" loading="lazy" width="128" height="128" /></div><span className="domain-title">Fin-Tech</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_livestock_1783056137889.png" alt="Livestock" loading="lazy" width="128" height="128" /></div><span className="domain-title">Livestock</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_logistics_1783056146998.png" alt="Logistics" loading="lazy" width="128" height="128" /></div><span className="domain-title">Logistics</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_publicsector_1783056160572.png" alt="Public Sector" loading="lazy" width="128" height="128" /></div><span className="domain-title">Public Sector</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_healthcare_1783056177331.png" alt="Healthcare" loading="lazy" width="128" height="128" /></div><span className="domain-title">Healthcare</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_energy_1783056186218.png" alt="Energy" loading="lazy" width="128" height="128" /></div><span className="domain-title">Energy</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_edutech_1783056194977.png" alt="Edu Tech" loading="lazy" width="128" height="128" /></div><span className="domain-title">Edu Tech</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_agriculture_1783056204318.png" alt="Agriculture" loading="lazy" width="128" height="128" /></div><span className="domain-title">Agriculture</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_manufacturing_1783056220895.png" alt="Manufacturing" loading="lazy" width="128" height="128" /></div><span className="domain-title">Manufacturing</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_fmcg_1783056232415.png" alt="FMCG" loading="lazy" width="128" height="128" /></div><span className="domain-title">FMCG</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_telecom_1783056241538.png" alt="Telecom" loading="lazy" width="128" height="128" /></div><span className="domain-title">Telecom</span></div>
            <div className="domain-item"><div className="domain-icon-wrap"><img src="assets/images/domains/3d_icon_facility_1783056251095.png" alt="Facility Management" loading="lazy" width="128" height="128" /></div><span className="domain-title">Facility Management</span></div>
          </div>
        </div>

        {/* PARTNERS AND CERTIFICATION */}
        <div id="affiliations" className="auto-style-105">
          <div className="timeline-header" style={{ marginBottom: '50px' }}>
            <p className="timeline-eyebrow">OUR AFFILIATIONS</p>
            <h2 className="timeline-title">Partners and <span className="text-red">Certification</span></h2>
          </div>

          <div className="auto-style-107">
            <img className="auto-style-108" src="assets/images/index/microsoft-solutions-partner.png" alt="Microsoft Solutions Partner" width="200" height="120" />
            <img className="auto-style-108" src="assets/images/index/hipaa-compliant.png" alt="HIPAA Compliant" width="200" height="120" />
            <img className="auto-style-108" src="assets/images/index/iso-27001.png" alt="ISO 27001 INTERCERT" width="200" height="120" />
            <img className="auto-style-108" src="assets/images/index/aicpa-soc.png" alt="AICPA SOC" width="200" height="120" />
            <img className="auto-style-109" src="assets/images/index/timextender.png" alt="TIMEXTENDER" width="160" height="40" />
          </div>
        </div>
      </div>

      {/* ===================== TECHNOLOGIES WE LEVERAGE ===================== */}
      <section id="tech-stack" className="tech-section section-pad auto-style-70">
        <div className="container">
          <div className="timeline-header" style={{ marginBottom: '50px' }}>
            <p className="timeline-eyebrow">OUR TECH STACK</p>
            <h2 className="timeline-title">Technologies We <span className="text-red">Currently Leverage</span></h2>
          </div>

          {/* Logos Grid */}
          <div className="tech-logos-grid auto-style-112">
            {/* Cloud & Data */}
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg" alt="Azure Web App" /><div className="auto-style-115">Azure</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg" alt="GCP Suite" /><div className="auto-style-115">GCP Suite</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" alt="AWS" /><div className="auto-style-115">AWS</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg" alt="Firebase" /><div className="auto-style-115">Firebase</div></div>
            
            {/* Data & Analytics */}
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg" alt="SQL Server" /><div className="auto-style-115">SQL Server</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.simpleicons.org/databricks/FF3621" alt="Databricks" /><div className="auto-style-115">Databricks</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://upload.wikimedia.org/wikipedia/commons/c/cf/New_Power_BI_Logo.svg" alt="Power BI" /><div className="auto-style-115">Power BI</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Tableau_Logo.png" alt="Tableau" /><div className="auto-style-115">Tableau</div></div>

            {/* Programming & Frameworks */}
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flutter/flutter-original.svg" alt="Flutter" /><div className="auto-style-115">Flutter</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dart/dart-original.svg" alt="Dart" /><div className="auto-style-115">Dart</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/swift/swift-original.svg" alt="Swift" /><div className="auto-style-115">Swift</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kotlin/kotlin-original.svg" alt="Kotlin" /><div className="auto-style-115">Kotlin</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" alt="Python" /><div className="auto-style-115">Python</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" alt="Node.js" /><div className="auto-style-115">Node.js</div></div>
            <div className="tech-logo-item auto-style-113"><img className="auto-style-114" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/graphql/graphql-plain.svg" alt="GraphQL" /><div className="auto-style-115">GraphQL</div></div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div className="testimonials-container">
          {/* Left Column */}
          <div className="testimonials-left">

            
            <h2 className="section-title testimonials-title">What Our<br />Customers Say</h2>
            
            <p className="testimonials-subtext">
              Relation so in confined smallest children unpacked delicate. Why sir end believe uncivil respect. Always get adieus nature day course for common.
            </p>
            
            <a href="#" className="btn-view-more">
              View More
            </a>
          </div>

          {/* Right Column */}
          <div 
            className="testimonials-right"
            onMouseEnter={() => setIsTestimonialsPaused(true)}
            onMouseLeave={() => setIsTestimonialsPaused(false)}
          >
            {/* Card 1 */}
            <div 
              className={`testimonial-card card-1 ${cardStates[0]} ${cardStates[0] === 'front' ? 'active' : ''}`}
              onClick={() => switchToTestimonial(0)}
            >
              <div className="testimonial-avatar-wrap avatar-blue">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" alt="Mehwish" />
              </div>
              <div className="testimonial-card-content">
                <h4 className="testimonial-author">Mehwish</h4>
                <p className="testimonial-text">
                  Compliment interested discretion estimating on stimulated apartments oh.
                </p>
              </div>
              <div className="quote-icon-bg">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 1 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21zm12 0c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 1 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
                </svg>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              className={`testimonial-card card-2 ${cardStates[1]} ${cardStates[1] === 'front' ? 'active' : ''}`}
              onClick={() => switchToTestimonial(1)}
            >
              <div className="testimonial-avatar-wrap avatar-pink">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="Elizabeth Jeff" />
              </div>
              <div className="testimonial-card-content">
                <h4 className="testimonial-author">Elizabeth Jeff</h4>
                <p className="testimonial-text">
                  Dear so sing when in find read of call. As distrusts behaviour abilities defective is.
                </p>
              </div>
              <div className="quote-icon-bg">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 1 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21zm12 0c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 1 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
                </svg>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              className={`testimonial-card card-3 ${cardStates[2]} ${cardStates[2] === 'front' ? 'active' : ''}`}
              onClick={() => switchToTestimonial(2)}
            >
              <div className="testimonial-avatar-wrap avatar-gray">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" alt="Emily Thomas" />
              </div>
              <div className="testimonial-card-content">
                <h4 className="testimonial-author">Emily Thomas</h4>
                <p className="testimonial-text">
                  Never at water me might. On formed merits hunted unable merely by mr whence or.
                </p>
              </div>
              <div className="quote-icon-bg">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 1 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21zm12 0c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 1 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="get-in-touch" className="contact-section">
        <div className="contact-container">
          {/* Left Column */}
          <div className="contact-left">
            <span className="eyebrow">Contact Us</span>
            <h2 className="section-title contact-subtitle">Need more information?<br />Get in touch with us</h2>
            <p className="contact-desc">
              A connected set of services designed to turn strategy into scale
            </p>
            
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h4 className="contact-info-label">Phone Number</h4>
                  <p className="contact-info-value">
                    USA: <a href="tel:+14697834727">+1 469 783 4727</a><br />
                    IND: <a href="tel:+914623575499">+91 462 357 5499</a>
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h4 className="contact-info-label">Email</h4>
                  <p className="contact-info-value">
                    <a href="mailto:info@pro17analytics.com">info@pro17analytics.com</a>
                  </p>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-icon-wrap">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h4 className="contact-info-label">Address</h4>
                  <p className="contact-info-value" style={{ lineHeight: '1.6' }}>
                    <strong>North America:</strong> 1560 East Southlake Blvd, Suite 100, Southlake, TX 76092, United States<br />
                    <strong>India:</strong> AP Towers, No. A 16, 4th Floor, North Main Rd, NGO A Colony, Tirunelveli, Tamil Nadu 627007
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="contact-right">
            <div className="contact-form-card">
              <h3 className="contact-form-title">Send Message</h3>
              <p className="contact-form-subtitle">
                Please fill out the form below with your details and message to contact with us
              </p>
              
              {formSubmitted ? (
                <div className="contact-success-msg">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h4>Thank You!</h4>
                  <p>Your message has been sent successfully. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="contact-form-element">
                  <div className="form-row-2">
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder="First Name" 
                        required 
                        className="contact-input"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder="Last Name" 
                        className="contact-input"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Email or Phone Number" 
                      required 
                      className="contact-input"
                      value={formData.emailOrPhone}
                      onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <textarea 
                      placeholder="Write Message Here..." 
                      required 
                      rows={5}
                      className="contact-textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  
                  <button type="submit" className="btn-view-more btn-submit" style={{ width: '100%', textAlign: 'center', border: 'none', cursor: 'pointer' }}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-section">
        {/* Dark CTA Banner */}
        <div className="footer-cta-card">
          <div className="footer-cta-glow"></div>
          <h3 className="footer-cta-title">Let's Build Something Extraordinary Together</h3>
          <p className="footer-cta-desc">
            Tell us about your challenge. We'll scope a solution in 48 hours.
          </p>
          <a href="#get-in-touch" onClick={(e) => { e.preventDefault(); document.getElementById('get-in-touch')?.scrollIntoView({behavior: 'smooth'}); }} className="footer-cta-btn">
            Start a Conversation
          </a>
        </div>

        {/* Links Card */}
        <div className="footer-links-card">
          <div className="footer-links-grid">
            {/* Brand Col */}
            <div className="footer-brand-col">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }} style={{ display: 'inline-block' }}>
                <img src="https://pro17analytics.com/assets/images/pro17analytics-logo.png" alt="Pro17 Analytics" height="40" style={{ height: '40px', objectFit: 'contain' }} />
              </a>
              <p className="footer-brand-desc">
                Transforming Data into Strategic Insights — empowering businesses with AI, cloud, and modern engineering.
              </p>
              <div className="footer-socials">
                <a href="https://www.linkedin.com/company/pro17analytics/" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="LinkedIn">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Services Col */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Services</h4>
              <ul className="footer-links-list">
                <li><a href="services.html#tab-data">Data &amp; Analytics</a></li>
                <li><a href="services.html#tab-cloud">Cloud Engineering</a></li>
                <li><a href="services.html#tab-digital">Digital Engineering</a></li>
                <li><a href="services.html#tab-cyber">Cyber Security</a></li>
                <li><a href="services.html#tab-consulting">Consulting</a></li>
              </ul>
            </div>

            {/* Expertise Col */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Expertise</h4>
              <ul className="footer-links-list">
                <li><a href="expertise.html#tab-data">Data and AI</a></li>
                <li><a href="expertise.html#tab-modern">Modern Apps</a></li>
                <li><a href="expertise.html#tab-iot">IoT Solutions</a></li>
              </ul>
            </div>

            {/* Company Col */}
            <div className="footer-links-col">
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links-list">
                <li><a href="about.html">About Us</a></li>
                <li><a href="contact.html">Contact</a></li>
                <li><a href="privacy-policy.html">Privacy Policy</a></li>
                <li><a href="cookie-policy.html">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-divider"></div>

          {/* Footer Bottom */}
          <div className="footer-bottom-row">
            <span>© 2026 Pro17 Analytics. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="privacy-policy.html">Privacy Policy</a>
              <a href="cookie-policy.html">Cookie Policy</a>
              <a href="Main.html">Switch to Main</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
