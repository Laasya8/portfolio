// ===== Elegant Cinematic Loader (GSAP) =====
function initCinematicLoader() {
  const loader = document.getElementById('cinematicLoader');
  if (!loader || typeof gsap === 'undefined') {
    if (loader) loader.style.display = 'none';
    return;
  }

  // Initialize Lightfall WebGL Background
  const lightfallContainer = document.getElementById('lightfallContainer');
  let cleanupLightfall = null;
  if (lightfallContainer && typeof initLightfall === 'function') {
    cleanupLightfall = initLightfall(lightfallContainer, {
      colors: ['#A6C8FF', '#5227FF', '#FF9FFC'],
      backgroundColor: '#0A29FF',
      speed: 1,
      streakCount: 8,
      streakWidth: 1,
      streakLength: 1,
      glow: 1,
      density: 1,
      twinkle: 1,
      zoom: 2,
      backgroundGlow: 1,
      opacity: 1,
      mouseInteraction: true,
      mouseStrength: 1,
      mouseRadius: 0.6
    });
  }

  const chars = loader.querySelectorAll('.loader-char');
  const curtainTop = loader.querySelector('.loader-curtain--top');
  const curtainBottom = loader.querySelector('.loader-curtain--bottom');
  const center = loader.querySelector('.loader-center');
  const glow = loader.querySelector('.loader-glow');

  // Set initial states
  gsap.set(chars, { yPercent: 120, opacity: 0 });
  gsap.set(glow, { scale: 0.5, opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      loader.style.display = 'none';
      if (cleanupLightfall) cleanupLightfall();
    },
  });

  // Phase 1: Glow fades in
  tl.to(glow, {
    scale: 1,
    opacity: 1,
    duration: 1,
    ease: 'power2.out',
  }, 0.2);

  // Phase 2: Letters reveal gracefully from bottom
  tl.to(chars, {
    yPercent: 0,
    opacity: 1,
    duration: 1.2,
    stagger: 0.08,
    ease: 'power4.out',
  }, 0.4);

  // Phase 3: Hold to let the user read the name
  tl.to({}, { duration: 1.2 });

  // Phase 4: Elegant Exit - letters fade and drift up
  tl.to(chars, {
    yPercent: -60,
    opacity: 0,
    stagger: { each: 0.04, from: 'edges' },
    duration: 0.8,
    ease: 'power3.in',
  });

  tl.to(center, {
    scale: 1.15,
    duration: 0.8,
    ease: 'power2.in',
  }, '<');

  tl.to(glow, {
    scale: 2.5,
    opacity: 0,
    duration: 1,
    ease: 'power2.in',
  }, '<');

  if (lightfallContainer) {
    tl.to(lightfallContainer, {
      opacity: 0,
      duration: 1.4,
      ease: 'power2.inOut',
    }, '<');
  }

  // Phase 5: Curtains split and dissolve seamlessly into the page
  tl.to(curtainTop, {
    yPercent: -100,
    opacity: 0,
    duration: 1.4,
    ease: 'power3.inOut',
  }, '-=0.2');

  tl.to(curtainBottom, {
    yPercent: 100,
    opacity: 0,
    duration: 1.4,
    ease: 'power3.inOut',
  }, '<');

  // Fade out entire loader container for absolute seamless blending
  tl.to(loader, {
    opacity: 0,
    duration: 1.4,
    ease: 'power3.inOut',
  }, '<');
}

// Initialize on DOM + fonts ready
document.addEventListener('DOMContentLoaded', () => {
  document.fonts.ready.then(() => {
    initCinematicLoader();
  });
});

// ===== Particle Animation on Canvas =====
const initParticles = () => {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`;
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  window.addEventListener('resize', resize);
  init();
  drawParticles();
};

// ===== Typewriter Effect =====
const typewriterElement = document.getElementById('typewriter');
const roles = ['a Developer', 'a Tech Enthusiast', 'a Problem Solver', 'a Data Science Specialist'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typeSpeed = 100;

function type() {
  const currentRole = roles[roleIndex];

  if (isDeleting) {
    if (typewriterElement) typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
    typeSpeed = 50;
  } else {
    if (typewriterElement) typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
    typeSpeed = 100;
  }

  if (!isDeleting && charIndex === currentRole.length) {
    isDeleting = true;
    typeSpeed = 2000;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    typeSpeed = 500;
  }

  setTimeout(type, typeSpeed);
}

// Initialize all on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  if (typewriterElement) setTimeout(type, 1000);
});

// ===== Mouse Glow Effect =====
const mouseGlow = document.getElementById('mouse-glow');
if (mouseGlow) {
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    mouseGlow.style.setProperty('--x', `${x}px`);
    mouseGlow.style.setProperty('--y', `${y}px`);
  });
}

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// ===== Active Nav Link on Scroll =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 200;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
});

// ===== Scroll Reveal Animation =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

// ===== Contact Form Handler =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Change button state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error!';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
    } finally {
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

// ===== Professional 3D Scene (Three.js) =====
// Replaces the CSS-based 3D shapes with a real WebGL 3D scene
let portfolio3D = null;

function initPortfolio3D() {
  if (typeof Portfolio3D === 'undefined' || typeof THREE === 'undefined') {
    console.warn('[Portfolio3D] Three.js or Portfolio3D class not loaded yet');
    return;
  }

  // Create container for 3D scene
  const container = document.createElement('div');
  container.id = 'portfolio-3d-container';
  container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none;';
  document.body.prepend(container);

  portfolio3D = new Portfolio3D();
  portfolio3D.init(container);

  // Update theme on initialization
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  portfolio3D.updateTheme(currentTheme);
}

// Initialize 3D scene after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a beat for Three.js to load
  setTimeout(initPortfolio3D, 100);
});



// ===== Hero 3D Mouse Parallax =====
(function initHeroParallax() {
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.getElementById('profileBorderGlow') || document.querySelector('.image-wrapper');
  if (!hero || !heroContent || !heroImage) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    if (typeof gsap !== 'undefined') {
      gsap.to(heroContent, {
        rotateY: x * 5,
        rotateX: -y * 5,
        transformPerspective: 800,
        duration: 0.6,
        ease: 'power2.out',
      });
      gsap.to(heroImage, {
        rotateY: x * -10,
        rotateX: y * 10,
        x: x * 25,
        y: y * 25,
        transformPerspective: 600,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  });

  hero.addEventListener('mouseleave', () => {
    if (typeof gsap !== 'undefined') {
      gsap.to([heroContent, heroImage], {
        rotateY: 0, rotateX: 0, x: 0, y: 0,
        duration: 0.8, ease: 'power3.out',
      });
    }
  });
})();

// ===== Smooth 3D Tilt Effect on Glass Cards =====
document.querySelectorAll('.glass-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    if (typeof gsap !== 'undefined') {
      gsap.to(card, {
        rotateX, rotateY, y: -8, scale: 1.02,
        transformPerspective: 800, duration: 0.4, ease: 'power2.out',
        boxShadow: `${-rotateY * 2}px ${rotateX * 2}px 40px rgba(0,0,0,0.3), 0 0 30px rgba(139, 92, 246, 0.12)`,
      });
    } else {
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    }

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    card.style.setProperty('--shine-x', `${shineX}%`);
    card.style.setProperty('--shine-y', `${shineY}%`);
  });

  card.addEventListener('mouseleave', () => {
    if (typeof gsap !== 'undefined') {
      gsap.to(card, {
        rotateX: 0, rotateY: 0, y: 0, scale: 1, boxShadow: '',
        duration: 0.6, ease: 'power3.out',
      });
    } else {
      card.style.transform = '';
    }
  });
});

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
if (savedTheme === 'light') {
  htmlElement.setAttribute('data-theme', 'light');
  if (themeIcon) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = htmlElement.getAttribute('data-theme') === 'light';

    if (isLight) {
      htmlElement.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'dark');
      if (themeIcon) {
        themeIcon.style.transform = 'rotate(360deg)';
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
      // Update 3D scene theme
      if (portfolio3D) portfolio3D.updateTheme('dark');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      localStorage.setItem('portfolio-theme', 'light');
      if (themeIcon) {
        themeIcon.style.transform = 'rotate(360deg)';
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
      // Update 3D scene theme
      if (portfolio3D) portfolio3D.updateTheme('light');
    }

    // Reset rotation after animation
    setTimeout(() => {
      if (themeIcon) themeIcon.style.transform = '';
    }, 400);
  });
}
// ===== Custom Interactive Cursor =====
const cursorDot = document.getElementById('cursorDot');
const cursorOutline = document.getElementById('cursorOutline');

if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let outlineX = mouseX;
  let outlineY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot instantly follows cursor
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // Smooth trail animation for outline
  function animateCursor() {
    let distX = mouseX - outlineX;
    let distY = mouseY - outlineY;

    outlineX += distX * 0.15; // interpolation factor
    outlineY += distY * 0.15;

    cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states for interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .project-card, input, textarea');

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorOutline.classList.add('active');
    });
    el.addEventListener('mouseleave', () => {
      cursorOutline.classList.remove('active');
    });
  });
}


