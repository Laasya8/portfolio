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

// ===== Smooth Tilt Effect on Project Cards =====
document.querySelectorAll('.glass-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== AI Chatbot Widget =====
(function () {
  const chatbotFab = document.getElementById('chatbotFab');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotClose = document.getElementById('chatbotClose');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotSuggestions = document.getElementById('chatbotSuggestions');

  if (!chatbotFab || !chatbotWindow) return;

  let isOpen = false;
  let hasGreeted = false;

  // Knowledge base about Laasya
  const knowledge = {
    about: "I'm Cheerla Sai Laasya Priya — a developer driven by curiosity and a love for technology. I enjoy turning complex problems into clean, user-friendly solutions. With a strong foundation in modern development practices, I continuously explore new frameworks, tools, and paradigms. I believe in writing code that is not only functional but also elegant and maintainable.",
    skills: "Laasya is skilled in: Python (Backend & Scripting), Java (OOP & Applications), JavaScript (Web Development), HTML & CSS (Frontend Design), React (UI Development), Node.js (Server-side JS), SQL (Database Management), Git (Version Control), C/C++ (Systems Programming), and Data Structures & Algorithms.",
    projects: {
      luxestyle: "🛍️ LuxeStyle E-Commerce — A premium fashion e-commerce platform with minimalist aesthetics, full shopping flow, JWT-based authentication, and a RESTful API. Built with Node.js, SQLite, JWT, and REST API.",
      agrichain: "🌾 AgriChain — A farm-to-table supply chain tracker with role-based access, QR code scanning, blockchain verification, Firebase sync, and a mobile-first responsive dashboard. Built with React, Firebase, Blockchain, and Tailwind CSS.",
      gensathi: "🏛️ GenSathi — A civic complaint management platform with smart duplicate detection, gamified XP system, real-time map tracking, community upvoting, and proof-based resolution. Built with Next.js, Firestore, Maps API, and Cloudinary."
    },
    contact: "You can reach Laasya at:\n📧 Email: laasya1106@gmail.com\n🔗 GitHub: github.com/Laasya8\n💼 LinkedIn: linkedin.com/in/sai-laasya-priya/",
    github: "Laasya's GitHub profile is @Laasya8 with 10+ repositories, 50+ contributions, and proficiency in 5+ languages. She's always building cool stuff, one commit at a time!",
    resume: "You can download Laasya's resume directly from this portfolio! Look for the 'Download Resume' button in the hero section at the top of the page.",
    highlights: "Laasya is a Problem Solver (analytical thinking & creative solutions), a Developer (full-stack development enthusiast), a Learner (constantly exploring new tech), and a Team Player (collaboration & communication)."
  };

  // Normalize text to handle typos: collapse repeated chars, strip noise
  function normalize(str) {
    return str
      .toLowerCase()
      .replace(/(.)\1+/g, '$1')   // "maail" -> "mail", "helllo" -> "helo"
      .replace(/[^a-z0-9\s]/g, '') // strip special chars
      .trim();
  }

  // Test a regex against BOTH raw and normalized input
  function fuzzyTest(regex, raw, norm) {
    return regex.test(raw) || regex.test(norm);
  }

  // Fuzzy keyword scoring: check how many topic keywords appear in the text
  function keywordScore(text, keywords) {
    const norm = normalize(text);
    let score = 0;
    for (const kw of keywords) {
      if (norm.includes(kw) || text.includes(kw)) score++;
    }
    return score;
  }

  function getResponse(input) {
    const q = input.toLowerCase().trim();
    const qn = normalize(q);

    // Greetings
    if (fuzzyTest(/^(hi|hello|hey|hola|greetings|sup|yo|howdy)/i, q, qn)) {
      return "Hello! 👋 I'm Laasya's AI assistant. I can tell you about her skills, projects, experience, and more. What would you like to know?";
    }

    // About
    if (fuzzyTest(/about|who is|tel.? me about|introduce|background|herself|bio/i, q, qn)) {
      return knowledge.about;
    }

    // Skills
    if (fuzzyTest(/skil|tech|technolog|stack|proficien|language|framework|tool|what (does|can) she (do|use|know)/i, q, qn)) {
      return knowledge.skills;
    }

    // Specific project queries
    if (fuzzyTest(/luxe|e-?commerce|ecommerce|fashion|shopping/i, q, qn)) {
      return knowledge.projects.luxestyle;
    }
    if (fuzzyTest(/agri|farm|supply chain|blockchain|qr/i, q, qn)) {
      return knowledge.projects.agrichain;
    }
    if (fuzzyTest(/gen\s?sathi|civic|complaint|gamif/i, q, qn)) {
      return knowledge.projects.gensathi;
    }

    // General projects
    if (fuzzyTest(/project|built|portfolio|work|created|developed|made/i, q, qn)) {
      return "Laasya has built some amazing projects:\n\n" +
        knowledge.projects.luxestyle + "\n\n" +
        knowledge.projects.agrichain + "\n\n" +
        knowledge.projects.gensathi;
    }

    // Contact / Email
    if (fuzzyTest(/contact|reach|e?mail|connect|linkedin|hire|get in touch|message her|write to/i, q, qn)) {
      return knowledge.contact;
    }

    // GitHub
    if (fuzzyTest(/github|git|repo|open.?source|contribution/i, q, qn)) {
      return knowledge.github;
    }

    // Resume
    if (fuzzyTest(/resume|cv|download|document|pdf/i, q, qn)) {
      return knowledge.resume;
    }

    // Education
    if (fuzzyTest(/education|college|university|degree|study|student|learn/i, q, qn)) {
      return "Laasya has a strong academic foundation in computer science and technology. She's continuously learning and exploring new areas in tech, from web development to data science.";
    }

    // Interests
    if (fuzzyTest(/interest|hobby|hobbies|passion|love|enjoy|free time/i, q, qn)) {
      return "When Laasya isn't coding, she's exploring the latest in tech, contributing to open-source projects, or learning something new. She's always excited to collaborate on projects that make a positive impact! 🚀";
    }

    // Highlights / strengths
    if (fuzzyTest(/strength|highlight|quality|qualities|good at/i, q, qn)) {
      return knowledge.highlights;
    }

    // Thank you
    if (fuzzyTest(/thank|thanks|thx|appreciate|grateful/i, q, qn)) {
      return "You're welcome! 😊 Feel free to ask anything else about Laasya, or check out the portfolio sections above. Have a great day!";
    }

    // Goodbye
    if (fuzzyTest(/bye|goodbye|see you|later|cya/i, q, qn)) {
      return "Goodbye! 👋 Thanks for visiting Laasya's portfolio. Feel free to come back anytime or reach out via the contact section!";
    }

    // Data Science
    if (fuzzyTest(/data\s?science|machine\s?learning|ml|ai|artificial|deep\s?learning/i, q, qn)) {
      return "Laasya is a Data Science specialist! She has expertise in Python for data analysis and scripting, and continuously explores machine learning and AI technologies. Check out her projects for hands-on implementations!";
    }

    // Availability
    if (fuzzyTest(/available|open to|looking for|opportunit|hire|hiring|freelance|intern/i, q, qn)) {
      return "Yes! Laasya is currently open to opportunities. 🟢 Whether it's internships, collaborations, or full-time roles — she'd love to connect! Reach out at laasya1106@gmail.com or through LinkedIn.";
    }

    // Fuzzy keyword fallback: try to match the best topic even with heavy typos
    const topicScores = [
      { score: keywordScore(q, ['about', 'who', 'her', 'bio', 'intro', 'herself']), response: knowledge.about },
      { score: keywordScore(q, ['skil', 'tech', 'stack', 'language', 'python', 'java', 'react', 'node', 'sql', 'git', 'html', 'css', 'code']), response: knowledge.skills },
      { score: keywordScore(q, ['project', 'built', 'made', 'create', 'develop', 'luxe', 'agri', 'sathi']), response: "Laasya has built some amazing projects:\n\n" + knowledge.projects.luxestyle + "\n\n" + knowledge.projects.agrichain + "\n\n" + knowledge.projects.gensathi },
      { score: keywordScore(q, ['contact', 'mail', 'email', 'reach', 'connect', 'linkedin', 'phone', 'message']), response: knowledge.contact },
      { score: keywordScore(q, ['github', 'git', 'repo', 'open source', 'commit']), response: knowledge.github },
      { score: keywordScore(q, ['resume', 'cv', 'download', 'pdf']), response: knowledge.resume },
      { score: keywordScore(q, ['hire', 'available', 'opportunity', 'intern', 'freelance', 'job', 'work with']), response: "Yes! Laasya is currently open to opportunities. 🟢 Whether it's internships, collaborations, or full-time roles — she'd love to connect! Reach out at laasya1106@gmail.com or through LinkedIn." },
    ];

    const bestMatch = topicScores.reduce((best, t) => t.score > best.score ? t : best, { score: 0, response: null });
    if (bestMatch.score > 0) {
      return bestMatch.response;
    }

    // Default fallback
    const fallbacks = [
      "That's a great question! I'm best at answering about Laasya's skills, projects, and background. Try asking about those! 💡",
      "Hmm, I'm not sure about that one. But I can tell you all about Laasya's projects, skills, or how to contact her! 🤔",
      "I'd love to help! Try asking me about Laasya's projects, tech stack, or how to get in touch with her. 😊"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  function addMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-msg ${type}`;

    if (type === 'bot') {
      msgDiv.innerHTML = `
        <img src="chatbot-avatar.png" alt="AI" class="chatbot-msg-avatar">
        <div class="chatbot-msg-bubble">${text.replace(/\n/g, '<br>')}</div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="chatbot-msg-bubble">${text.replace(/\n/g, '<br>')}</div>
      `;
    }

    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chatbot-msg bot';
    typingDiv.id = 'chatbot-typing';
    typingDiv.innerHTML = `
      <img src="chatbot-avatar.png" alt="AI" class="chatbot-msg-avatar">
      <div class="chatbot-msg-bubble chatbot-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById('chatbot-typing');
    if (typing) typing.remove();
  }

  function handleSend() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatbotInput.value = '';

    // Hide suggestions after first message
    if (chatbotSuggestions) {
      chatbotSuggestions.style.display = 'none';
    }

    // Show typing indicator
    showTyping();

    // Simulate response delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      removeTyping();
      const response = getResponse(text);
      addMessage(response, 'bot');
    }, delay);
  }

  // Toggle chat window
  chatbotFab.addEventListener('click', () => {
    isOpen = !isOpen;
    chatbotWindow.classList.toggle('open', isOpen);

    if (isOpen && !hasGreeted) {
      hasGreeted = true;
      setTimeout(() => {
        addMessage("Hello! 👋 I'm Laasya's AI assistant. I can help you explore her portfolio, learn about her skills, or find her projects. What would you like to know?", 'bot');
      }, 400);
    }

    if (isOpen) {
      setTimeout(() => chatbotInput.focus(), 400);
    }
  });

  // Close chat
  chatbotClose.addEventListener('click', () => {
    isOpen = false;
    chatbotWindow.classList.remove('open');
  });

  // Send on button click
  chatbotSend.addEventListener('click', handleSend);

  // Send on Enter key
  chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  });

  // Suggestion pill clicks
  document.querySelectorAll('.chatbot-suggestion-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const msg = pill.getAttribute('data-msg');
      chatbotInput.value = msg;
      handleSend();
    });
  });
})();
