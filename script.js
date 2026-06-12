(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sticky header */
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav toggle */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Active nav link on scroll */
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  /* Reveal-on-scroll */
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach((el) => {
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* Animated stat counters */
  const statEls = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute('data-count') || '0');
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const divisor = Math.pow(10, decimals);

    if (reduceMotion) {
      el.textContent = (target / divisor).toFixed(decimals) + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (target * eased) / divisor;
      el.textContent = current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (statEls.length) {
    if ('IntersectionObserver' in window) {
      const statObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      statEls.forEach((el) => statObserver.observe(el));
    } else {
      statEls.forEach(animateCount);
    }
  }

  /* Hero glow follows pointer */
  const hero = document.querySelector('.hero');
  const heroGlow = document.getElementById('heroGlow');
  if (hero && heroGlow && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroGlow.style.left = `${x}%`;
      heroGlow.style.top = `${y}%`;
    });
  }

  /* Contact form — posts to FormSubmit via hidden iframe so the page never navigates.
     First submission: check elonhuang123@gmail.com for an activation email and click it.
     Every submission after that arrives in Gmail automatically. */
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const iframe  = document.getElementById('formsubmitIframe');

  if (form && iframe) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      form.classList.add('is-loading');
      submitBtn.disabled = true;

      iframe.onload = () => {
        iframe.onload = null;
        form.classList.remove('is-loading');
        submitBtn.disabled = false;
        success.classList.add('visible');
        form.reset();
        window.setTimeout(() => success.classList.remove('visible'), 6000);
      };

      form.submit();
    });
  }

  /* Scroll progress bar */
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = `scaleX(${Math.min(ratio, 1)})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
  }

  /* Back-to-top button */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = () => backToTop.classList.toggle('visible', window.scrollY > 600);
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Magnetic buttons — prominent CTAs gently follow the cursor */
  if (finePointer && !reduceMotion) {
    const magnets = document.querySelectorAll('.btn-lg, .nav-cta');
    magnets.forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* 3D tilt on cards */
  if (finePointer && !reduceMotion) {
    const tiltCards = document.querySelectorAll('.service-card, .portfolio-card, .price-card');
    const MAX = 7; // degrees
    tiltCards.forEach((card) => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${-py * MAX}deg) rotateY(${px * MAX}deg) translateY(-6px) scale(1.015)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ============ Helper chat bot ============ */
  const chatbot   = document.getElementById('chatbot');
  const launcher  = document.getElementById('chatLauncher');
  const panel     = document.getElementById('chatPanel');
  const messages  = document.getElementById('chatMessages');
  const quickWrap = document.getElementById('chatQuick');
  const chatForm  = document.getElementById('chatForm');
  const chatText  = document.getElementById('chatText');

  if (chatbot && launcher && panel && messages && chatForm) {
    let greeted = false;

    // Pre-written answers (no internet/AI needed — safe and free)
    const answers = {
      pricing:  "Our websites start at <strong>$499</strong> for a one-page <em>Launch</em> site and <strong>$2,499</strong> for a multi-page <em>Growth</em> site. Bigger projects (like online stores) get a custom quote. 💰",
      time:     "Most websites take about <strong>2–6 weeks</strong> from start to launch — it depends on the size and how fast we get your photos and text. ⏱️",
      services: "We design and build websites, online stores, redesigns, SEO, and branding — basically everything to get a business online and looking great. 🛠️",
      contact:  "The best way to reach us is the contact form — just scroll down or <a href=\"#contact\">click here to open it</a>. We reply within one business day! ✉️",
      ownership:"Yes — once your project is paid, the whole website is <strong>100% yours</strong>. No lock-in, no monthly licence fees. 🔑",
      support:  "Yep! We offer optional plans for updates, fixes, and security — or you can edit things yourself with an easy system. 🧰",
      greeting: "Hey there! 👋 I'm the Forge Helper. Ask me about pricing, timing, or how to get in touch!",
      thanks:   "You're very welcome! 😊 Anything else you'd like to know?",
      fallback: "Good question! I'm a little helper bot, so I'm best with pricing, timing, and contact info. For anything else, pop it in the <a href=\"#contact\">contact form</a> and a real human will reply. 🙂"
    };

    // Figure out which answer fits what the visitor typed
    const matchAnswer = (raw) => {
      const t = ' ' + raw.toLowerCase() + ' ';
      const has = (...words) => words.some((w) => t.includes(w));
      if (has('hello', 'hi ', 'hey', 'yo ', 'howdy')) return answers.greeting;
      if (has('price', 'cost', 'how much', 'pricing', 'expensive', 'cheap', 'budget', 'quote', '$', 'pay')) return answers.pricing;
      if (has('how long', 'time', 'fast', 'quick', 'week', 'when', 'deadline', 'soon')) return answers.time;
      if (has('own', 'mine', 'keep', 'rights', 'belong')) return answers.ownership;
      if (has('support', 'maintain', 'after', 'update', 'fix', 'help me')) return answers.support;
      if (has('contact', 'email', 'reach', 'talk', 'hire', 'start', 'begin', 'get going', 'message')) return answers.contact;
      if (has('service', 'do you', 'make', 'build', 'offer', 'website', 'store', 'shop', 'ecommerce', 'seo', 'logo', 'brand', 'redesign')) return answers.services;
      if (has('thank', 'thanks', 'cheers')) return answers.thanks;
      return answers.fallback;
    };

    const addMessage = (html, who) => {
      const el = document.createElement('div');
      el.className = `chat-msg ${who}`;
      el.innerHTML = html;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    };

    // Bot "types" for a moment, then replies
    const botReply = (html) => {
      const typing = addMessage('<span></span><span></span><span></span>', 'bot');
      typing.classList.add('typing');
      const delay = reduceMotion ? 200 : 650;
      window.setTimeout(() => {
        typing.remove();
        addMessage(html, 'bot');
      }, delay);
    };

    const openChat = () => {
      chatbot.classList.add('open');
      launcher.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      if (!greeted) {
        greeted = true;
        botReply(answers.greeting);
      }
      window.setTimeout(() => chatText && chatText.focus(), 300);
    };
    const closeChat = () => {
      chatbot.classList.remove('open');
      launcher.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    };

    launcher.addEventListener('click', () => {
      chatbot.classList.contains('open') ? closeChat() : openChat();
    });

    // Quick-reply pills
    if (quickWrap) {
      quickWrap.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-q]');
        if (!btn) return;
        const key = btn.getAttribute('data-q');
        addMessage(btn.textContent.trim(), 'user');
        botReply(answers[key] || answers.fallback);
      });
    }

    // Typed questions
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatText.value.trim();
      if (!text) return;
      addMessage(text.replace(/</g, '&lt;'), 'user');
      chatText.value = '';
      botReply(matchAnswer(text));
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatbot.classList.contains('open')) closeChat();
    });
  }
})();
