/* ═══════════════════════════════════════════════════════════
   TPF Studio — main.js
   Чистый JS, без библиотек.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* Cloudflare Worker — прокси для формы и отзывов */
  const WORKER_URL = 'https://tpf-form.energylowlnr.workers.dev';

  /* 1. НАВБАР */
  const navbar = document.getElementById('navbar');
  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* 2. МОБИЛЬНОЕ МЕНЮ */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
  }
  function toggleMenu() {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', toggleMenu);
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('is-open')) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  /* 3. ПЛАВНОЕ ПОЯВЛЕНИЕ */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealElements.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 4. СЧЁТЧИКИ */
  const counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(function (el) {
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = parseFloat(el.dataset.target || '0').toFixed(decimals) + (el.dataset.suffix || '');
    });
  }

  /* 5. FAQ */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;
    button.addEventListener('click', function () {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.faq-question');
        const otherAns = other.querySelector('.faq-answer');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherAns) otherAns.style.maxHeight = '0px';
      });
      if (isOpen) {
        item.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0px';
      } else {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
  window.addEventListener('resize', function () {
    const openItem = document.querySelector('.faq-item.is-open .faq-answer');
    if (openItem) {
      openItem.style.maxHeight = 'none';
      const h = openItem.scrollHeight;
      openItem.style.maxHeight = h + 'px';
    }
  });

  /* 6. АКТИВНАЯ ССЫЛКА */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* 7. АВТОПОДСТАНОВКА УСЛУГИ */
  const serviceSelect = document.getElementById('service');
  document.querySelectorAll('[data-service]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!serviceSelect) return;
      const value = btn.dataset.service;
      const match = Array.from(serviceSelect.options).find(function (opt) {
        return opt.value === value || opt.text.toLowerCase().includes(value.toLowerCase());
      });
      if (match) serviceSelect.value = match.value;
    });
  });

  /* 8. ФОРМА */
  const form      = document.getElementById('leadForm');
  const statusEl  = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  function setStatus(text, type) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.remove('is-success', 'is-error');
    if (type) statusEl.classList.add('is-' + type);
  }
  function setFieldError(input, message) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.toggle('has-error', Boolean(message));
    const errEl = group.querySelector('.form-error');
    if (errEl) errEl.textContent = message || '';
  }
  function validateForm() {
    let valid = true;
    const name    = form.querySelector('#name');
    const contact = form.querySelector('#contact');
    const message = form.querySelector('#message');
    if (!name.value.trim() || name.value.trim().length < 2) {
      setFieldError(name, 'Укажите имя (минимум 2 символа)');
      valid = false;
    } else setFieldError(name, '');
    const cv = contact.value.trim();
    const ok = cv.length >= 5 && (/@[\w.]{3,}/.test(cv) || /[\d\s()+-]{7,}/.test(cv));
    if (!ok) {
      setFieldError(contact, 'Укажите Telegram (@username) или телефон');
      valid = false;
    } else setFieldError(contact, '');
    if (!message.value.trim() || message.value.trim().length < 10) {
      setFieldError(message, 'Опишите задачу подробнее (минимум 10 символов)');
      valid = false;
    } else setFieldError(message, '');
    return valid;
  }

  async function sendLead(data) {
    const res = await fetch(WORKER_URL + '/submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(function () { return {}; });
    if (!res.ok || json.ok === false) {
      throw new Error(json.error || 'Ошибка отправки');
    }
    return json;
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const honeypot = form.querySelector('[name="tpf_x9hp2k"]');
      if (honeypot && honeypot.value.trim() !== '') return;
      if (!validateForm()) {
        setStatus('Проверьте выделенные поля и попробуйте снова.', 'error');
        const firstError = form.querySelector('.has-error input, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляю…';
      setStatus('', null);
      const data = {
        name: form.querySelector('#name').value.trim(),
        contact: form.querySelector('#contact').value.trim(),
        service: form.querySelector('#service').value,
        message: form.querySelector('#message').value.trim()
      };
      try {
        await sendLead(data);
        setStatus('✅ Заявка отправлена — отвечу в течение часа. Спасибо!', 'success');
        form.reset();
        if (statusEl) statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        console.error('[TPF Studio] Ошибка:', err);
        setStatus('❌ Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram: @Vladislav_Igorevich_TPF', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
    form.querySelectorAll('input, textarea').forEach(function (input) {
      input.addEventListener('input', function () { setFieldError(input, ''); });
    });
  }

  /* 9. ПЛАВНЫЙ СКРОЛЛ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
      if (history.pushState) history.pushState(null, '', href);
    });
  });

  /* 10. ГОД */
  const yearEl = document.querySelector('.footer-bottom p');
  if (yearEl) {
    yearEl.textContent = '© ' + new Date().getFullYear() + ' TPF Studio. Владислав.';
  }

  /* 11. ТЕМА */
  (function initTheme() {
    const html = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      try { localStorage.setItem('tpf-theme', theme); } catch (e) {}
    }
    let saved = null;
    try { saved = localStorage.getItem('tpf-theme'); } catch (e) {}
    if (!saved) saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(saved);
    if (toggle) {
      toggle.addEventListener('click', function () {
        applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    }
  })();

  /* ═══════════════════════════════════════════════════════
     12. ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА — полный набор
     ═══════════════════════════════════════════════════════ */
  (function initLang() {
    const html    = document.documentElement;
    const root    = document.getElementById('langRoot');
    const trigger = document.getElementById('langTrigger');
    const menu    = document.getElementById('langMenu');
    const current = document.getElementById('langCurrent');
    const items   = document.querySelectorAll('.lang-item');
    if (!root || !trigger || !menu) return;

    const translations = {
      en: {
        'nav.services': 'Services', 'nav.packages': 'Packages', 'nav.cases': 'Cases',
        'nav.reviews': 'Reviews',
        'nav.process': 'Process', 'nav.faq': 'FAQ', 'nav.cta': 'Discuss a project',
        'hero.pill': 'Available for new projects',
        'hero.title1': 'I build websites and Telegram bots',
        'hero.title2': 'turnkey in 1.5 days',
        'hero.sub': 'TPF Studio — solo development from idea to launch. No middlemen, no missed deadlines, guaranteed.',
        'hero.btn1': 'Discuss a project', 'hero.btn2': 'View cases',
        'stats.experience': 'years of experience', 'stats.projects': 'projects turnkey',
        'stats.days': 'days average', 'stats.turnkey': 'turnkey',
        'about.eyebrow': 'about me', 'about.title': 'One developer instead of a whole team',
        'about.name': 'Vladislav', 'about.role': 'Developer & founder of TPF Studio',
        'about.location': 'Lugansk · remote worldwide',
        'about.p1': 'I am a developer and founder of TPF Studio. I build websites and Telegram bots turnkey: brief to launch, database, notifications, hosting.',
        'about.p2': 'Over 3.5 years I delivered projects for beauty and HoReCa. One person instead of a whole team.',
        'about.badge1': 'Remote', 'about.badge2': 'Contracted', 'about.badge3': 'No air prepayment',
        'services.eyebrow': 'services', 'services.title': 'What I do',
        'services.sub': 'Full cycle: design, markup, backend, database, bots and deploy. Fixed price before start.',
        's1.title': 'Website development', 's1.desc': 'Landings, cafe and salon sites, corporate, e-commerce. Responsive, SEO, analytics.', 's1.price': 'from 15 000 ₽',
        's2.title': 'Telegram bots', 's2.desc': 'Shops, funnels, lead capture, admin notifications, integrations.', 's2.price': 'from 10 000 ₽',
        's3.title': 'Design', 's3.desc': 'Logos, banners, social media, UI mockups.', 's3.price': 'from 5 000 ₽',
        's4.title': 'Integrations & automation', 's4.desc': 'Supabase / PostgreSQL, website leads to Telegram, webhooks, deploy.', 's4.price': 'from 7 000 ₽',
        's5.title': 'Support & updates', 's5.desc': 'Fixes, content updates, bug fixing.', 's5.price': 'on request',
        's6.title': 'Looking for something else?', 's6.desc': 'Describe your task — I will suggest a solution and quote within an hour.', 's6.cta': 'Discuss a task',
        'btn.order': 'Order',
        'packages.eyebrow': 'packages', 'packages.title': 'Ready-made plans',
        'packages.sub': 'Fixed price and timeline.',
        'popular': 'Popular',
        'p1.li1': 'Landing 5–7 sections', 'p1.li2': 'Responsive on all devices', 'p1.li3': 'Lead form to Telegram', 'p1.li4': 'GitHub Pages hosting', 'p1.li5': 'Basic SEO', 'p1.cta': 'Choose START',
        'p2.li1': 'Site 10–14 sections', 'p2.li2': 'Telegram bot', 'p2.li3': 'Database (Supabase / PostgreSQL)', 'p2.li4': 'Admin notifications in Telegram', 'p2.li5': 'Bot admin panel', 'p2.li6': 'Hosting + deploy', 'p2.cta': 'Choose BUSINESS',
        'p3.price': 'from 60 000 ₽', 'p3.li1': 'Site + Telegram bot', 'p3.li2': 'Integrations: CRM / payments / Google Sheets', 'p3.li3': 'Extended admin panel', 'p3.li4': 'Analytics & goals', 'p3.li5': '3 months support', 'p3.cta': 'Choose PREMIUM',
        'process.eyebrow': 'process', 'process.title': 'How I work', 'process.sub': 'Five transparent steps from message to launch.',
        'step1.title': 'Brief & spec', 'step1.desc': 'We discuss the task, fix timeline and price.',
        'step2.title': 'Prototype & design', 'step2.desc': 'Figma mockup, approved before code.',
        'step3.title': 'Development', 'step3.desc': 'Code, database and Telegram bot integration.',
        'step4.title': 'Testing', 'step4.desc': 'Device testing, fixes, polish.',
        'step5.title': 'Launch & handoff', 'step5.desc': 'Deploy, accesses, usage guide.',
        'cases.eyebrow': 'cases', 'cases.title': 'Turnkey projects',
        'cases.sub': 'Real websites with backend, database and Telegram bots. Working right now — open and try.',
        'live': 'Live · working', 'days15': '1.5 days',
        'case1.p1': 'Landing for a nail studio with 14 sections: hero, services with tabs, before/after slider, portfolio, masters, booking form, reviews, promos, FAQ, blog.',
        'case1.p2': 'Backend: serverless on Supabase Edge Functions. Booking form saves leads to PostgreSQL with RLS, Telegram notifications with inline buttons.',
        'case1.p3': 'Grammy Telegram bot: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Karaoke bar «Piramida»',
        'case2.p1': 'Website for karaoke bar: menu with filters, gallery with lightbox, birthday promos, reviews slider, table booking form.',
        'case2.p2': 'Booking: guest leaves a request → saved to Supabase → both admins get Telegram notification with inline buttons.',
        'case2.p3': 'Reviews: guests leave reviews with rating 1 to 5. Published instantly, deleted in one tap.',
        'soon.title': 'Your project could be here', 'soon.text': 'Available for new tasks. Describe your idea — I will show a prototype within 24 hours.', 'soon.cta': 'Discuss a project',
        'btn.openSite': 'Open website', 'btn.wantSame': 'I want the same',
        'reviews.eyebrow': 'reviews', 'reviews.title': 'What clients say',
        'reviews.sub': 'Real feedback from people we worked with.',
        'reviews.loading': 'Loading reviews…', 'reviews.empty': 'No reviews yet. Be the first!',
        'reviews.leaveCta': 'Leave a review',
        'reviews.form.title': 'Leave a review',
        'reviews.form.lead': 'Thanks for sharing your experience! The review will appear immediately on the site.',
        'reviews.form.name': 'Your name', 'reviews.form.namePh': 'How should we address you?',
        'reviews.form.role': 'Company / role (optional)', 'reviews.form.rolePh': 'Cafe, studio, project…',
        'reviews.form.rating': 'Rating',
        'reviews.form.text': 'Review text', 'reviews.form.textPh': 'Tell us how it went',
        'reviews.form.submit': 'Send review',
        'why.eyebrow': 'advantages', 'why.title': 'Why me',
        'why1.title': 'Turnkey', 'why1.desc': 'From spec to hosting, no middlemen.',
        'why2.title': 'Fast', 'why2.desc': 'Average turnaround 1.5 days.',
        'why3.title': 'Fair price', 'why3.desc': 'Fixed upfront, no hidden fees.',
        'why4.title': 'Transparent', 'why4.desc': 'Progress shown, accesses handed over.',
        'why5.title': 'Tech', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API, GitHub Pages.',
        'faq.eyebrow': 'faq', 'faq.title': 'Frequent questions',
        'faq.q1': 'How much does a website cost?', 'faq.a1': 'Landing 5–7 sections — from 15 000 ₽. Site 10–14 sections with bot and DB — from 35 000 ₽. Premium — from 60 000 ₽.',
        'faq.q2': 'What about timelines?', 'faq.a2': 'Average landing — 1.5 days. Complex projects with bot, DB, integrations — 3 to 10 days.',
        'faq.q3': 'What do you need from me?', 'faq.a3': 'Task description, example sites, materials. If missing, I will tell you what to prepare.',
        'faq.q4': 'Do you work with a contract?', 'faq.a4': 'Yes, contracted. Prepayment 30–50%. Rest — after delivery.',
        'faq.q5': 'What is included in turnkey?', 'faq.a5': 'Brief & spec, design, markup, responsive, backend, database, Telegram bot, notifications, deploy, hosting.',
        'faq.q6': 'Do you make updates after delivery?', 'faq.a6': 'Yes. 14 days after delivery — free fixes within the spec.',
        'contact.eyebrow': 'request', 'contact.title': 'Let us discuss your project',
        'contact.sub': 'Describe your task — I will reply within an hour with an exact price and timeline.',
        'contacts.eyebrow': 'contacts', 'contacts.title': 'Write directly',
        'contacts.write': 'Write', 'contacts.open': 'Open',
        'contacts.loc': 'Location', 'contacts.locValue': 'Lugansk · remote worldwide',
        'contacts.locNote': 'Working with clients from any region',
        'form.name': 'Name', 'form.namePh': 'What should I call you?',
        'form.contact': 'Telegram or phone', 'form.contactPh': '@username or +7 900 000-00-00',
        'form.service': 'What do you need',
        'form.service.site': 'Website', 'form.service.bot': 'Telegram bot',
        'form.service.design': 'Design', 'form.service.other': 'Other',
        'form.message': 'Task description', 'form.messagePh': 'What project, functionality, examples, deadlines',
        'form.submit': 'Send request', 'form.note': 'By clicking, you agree to data processing for the response.',
        'footer.slogan': 'Websites and Telegram bots turnkey in 1.5 days.',
        'footer.author': 'Vladislav', 'footer.up': 'Back to top ↑'
      },

      uk: {
        'nav.services': 'Послуги', 'nav.packages': 'Пакети', 'nav.cases': 'Кейси',
        'nav.reviews': 'Відгуки',
        'nav.process': 'Як працюю', 'nav.faq': 'FAQ', 'nav.cta': 'Обговорити проєкт',
        'hero.pill': 'Доступний для нових проєктів',
        'hero.title1': 'Створюю сайти та Telegram-ботів',
        'hero.title2': 'під ключ за 1,5 дня',
        'hero.sub': 'TPF Studio — соло-розробка від ідеї до запуску. Без посередників, без затягування термінів, з гарантією.',
        'hero.btn1': 'Обговорити проєкт', 'hero.btn2': 'Подивитись кейси',
        'stats.experience': 'роки досвіду', 'stats.projects': 'проєкти під ключ',
        'stats.days': 'дні середній термін', 'stats.turnkey': 'під ключ',
        'about.eyebrow': 'про мене', 'about.title': 'Один розробник замість цілої команди',
        'about.name': 'Владислав', 'about.role': 'Розробник і засновник TPF Studio',
        'about.location': 'Луганськ · віддалено по всьому світу',
        'about.p1': 'Я розробник і засновник TPF Studio. Роблю сайти та Telegram-ботів під ключ: від брифу до запуску, БД, сповіщень, хостингу.',
        'about.p2': 'За 3,5 роки реалізував проєкти для б\'юті та HoReCa. Одна людина замість цілої команди.',
        'about.badge1': 'Віддалено', 'about.badge2': 'За договором', 'about.badge3': 'Без передоплати за повітря',
        'services.eyebrow': 'послуги', 'services.title': 'Що я роблю',
        'services.sub': 'Повний цикл: дизайн, верстка, бекенд, БД, боти, деплой. Ціна фіксується до старту.',
        's1.title': 'Розробка сайтів', 's1.desc': 'Лендінги, сайти кафе і салонів, корпоративні, магазини. Адаптив, SEO, аналітика.', 's1.price': 'від 15 000 ₽',
        's2.title': 'Telegram-боти', 's2.desc': 'Магазини, автоворонки, прийом заявок, сповіщення адміну, інтеграції.', 's2.price': 'від 10 000 ₽',
        's3.title': 'Дизайн', 's3.desc': 'Логотипи, банери, оформлення соцмереж, UI-макети.', 's3.price': 'від 5 000 ₽',
        's4.title': 'Інтеграції та автоматизація', 's4.desc': 'Supabase / PostgreSQL, заявки з сайту в Telegram, вебхуки, деплой.', 's4.price': 'від 7 000 ₽',
        's5.title': 'Підтримка та доробки', 's5.desc': 'Правки, оновлення контенту, виправлення багів.', 's5.price': 'за домовленістю',
        's6.title': 'Не знайшли потрібне?', 's6.desc': 'Опишіть задачу — запропоную рішення і назву ціну протягом години.', 's6.cta': 'Обговорити задачу',
        'btn.order': 'Замовити',
        'packages.eyebrow': 'пакети', 'packages.title': 'Готові тарифи',
        'packages.sub': 'Фіксована вартість і термін.',
        'popular': 'Популярний',
        'p1.li1': 'Лендінг 5–7 секцій', 'p1.li2': 'Адаптив під усі пристрої', 'p1.li3': 'Форма заявки в Telegram', 'p1.li4': 'Хостинг GitHub Pages', 'p1.li5': 'Базове SEO', 'p1.cta': 'Обрати СТАРТ',
        'p2.li1': 'Сайт 10–14 секцій', 'p2.li2': 'Telegram-бот', 'p2.li3': 'БД (Supabase / PostgreSQL)', 'p2.li4': 'Сповіщення адміну', 'p2.li5': 'Адмін-панель бота', 'p2.li6': 'Хостинг + деплой', 'p2.cta': 'Обрати БІЗНЕС',
        'p3.price': 'від 60 000 ₽', 'p3.li1': 'Сайт + Telegram-бот', 'p3.li2': 'Інтеграції: CRM / оплата / Google Sheets', 'p3.li3': 'Розширена адмін-панель', 'p3.li4': 'Аналітика', 'p3.li5': 'Підтримка 3 міс', 'p3.cta': 'Обрати ПРЕМІУМ',
        'process.eyebrow': 'процес', 'process.title': 'Як я працюю', 'process.sub': 'П\'ять прозорих кроків.',
        'step1.title': 'Бриф і ТЗ', 'step1.desc': 'Обговорюємо задачу, фіксуємо терміни і ціну.',
        'step2.title': 'Прототип і дизайн', 'step2.desc': 'Макет у Figma, узгоджуємо до коду.',
        'step3.title': 'Розробка', 'step3.desc': 'Код, БД і Telegram-бот.',
        'step4.title': 'Тестування', 'step4.desc': 'Перевірка, правки, доробка.',
        'step5.title': 'Запуск і передача', 'step5.desc': 'Деплой, доступи, інструкція.',
        'cases.eyebrow': 'кейси', 'cases.title': 'Проєкти під ключ',
        'cases.sub': 'Реальні сайти з backend, БД і Telegram-ботами. Працюють зараз.',
        'live': 'Live · працює', 'days15': '1,5 дня',
        'case1.p1': 'Сайт студії манікюру з 14 секцій: hero, послуги, слайдер до/після, портфоліо, майстри, форма запису, відгуки, акції, FAQ, блог.',
        'case1.p2': 'Backend на Supabase Edge Functions. Заявки в PostgreSQL з RLS, сповіщення в Telegram з inline-кнопками.',
        'case1.p3': 'Telegram-бот на Grammy: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Караоке-бар «Піраміда»',
        'case2.p1': 'Сайт караоке-бару: меню, галерея, акції, слайдер відгуків, бронювання.',
        'case2.p2': 'Бронювання: заявка → Supabase → обидва адміни отримують Telegram-сповіщення.',
        'case2.p3': 'Відгуки: гості залишають, відгук публікується одразу, видаляється за один тап.',
        'soon.title': 'Ваш проєкт може бути тут', 'soon.text': 'Доступний для нових задач.', 'soon.cta': 'Обговорити проєкт',
        'btn.openSite': 'Відкрити сайт', 'btn.wantSame': 'Хочу схожий',
        'reviews.eyebrow': 'відгуки', 'reviews.title': 'Що кажуть клієнти',
        'reviews.sub': 'Реальні відгуки людей, з якими ми працювали.',
        'reviews.loading': 'Завантажуємо відгуки…', 'reviews.empty': 'Поки відгуків немає. Будьте першим!',
        'reviews.leaveCta': 'Залишити відгук',
        'reviews.form.title': 'Залишити відгук',
        'reviews.form.lead': 'Дякуємо, що ділитесь враженнями! Відгук з\'явиться одразу на сайті.',
        'reviews.form.name': 'Ваше ім\'я', 'reviews.form.namePh': 'Як вас представити?',
        'reviews.form.role': 'Компанія / роль (необов\'язково)', 'reviews.form.rolePh': 'Кафе, студія, проєкт…',
        'reviews.form.rating': 'Оцінка',
        'reviews.form.text': 'Текст відгуку', 'reviews.form.textPh': 'Розкажіть, як усе пройшло',
        'reviews.form.submit': 'Надіслати відгук',
        'why.eyebrow': 'переваги', 'why.title': 'Чому я',
        'why1.title': 'Під ключ', 'why1.desc': 'Від ТЗ до хостингу.',
        'why2.title': 'Швидко', 'why2.desc': 'Середній термін 1,5 дня.',
        'why3.title': 'Чесна ціна', 'why3.desc': 'Фіксуємо на початку.',
        'why4.title': 'Прозоро', 'why4.desc': 'Показую прогрес.',
        'why5.title': 'Технології', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'faq', 'faq.title': 'Часті питання',
        'faq.q1': 'Скільки коштує сайт?', 'faq.a1': 'Лендінг — від 15 000 ₽. Сайт з ботом — від 35 000 ₽. Преміум — від 60 000 ₽.',
        'faq.q2': 'Які терміни?', 'faq.a2': 'Лендінг — 1,5 дня. Складні проєкти — 3–10 днів.',
        'faq.q3': 'Що потрібно від мене?', 'faq.a3': 'Опис задачі, приклади, матеріали.',
        'faq.q4': 'Працюєш за договором?', 'faq.a4': 'Так. Передоплата 30–50%.',
        'faq.q5': 'Що входить у «під ключ»?', 'faq.a5': 'Бриф, дизайн, верстка, адаптив, backend, БД, бот, сповіщення, деплой, хостинг.',
        'faq.q6': 'Робиш доробки?', 'faq.a6': 'Так. 14 днів після здачі — безкоштовно.',
        'contact.eyebrow': 'заявка', 'contact.title': 'Обговоримо ваш проєкт',
        'contact.sub': 'Опишіть задачу — відповім протягом години.',
        'contacts.eyebrow': 'контакти', 'contacts.title': 'Написати напряму',
        'contacts.write': 'Написати', 'contacts.open': 'Відкрити',
        'contacts.loc': 'Локація', 'contacts.locValue': 'Луганськ · віддалено',
        'contacts.locNote': 'Працюю з будь-якого регіону',
        'form.name': 'Ім\'я', 'form.namePh': 'Як до вас звертатися?',
        'form.contact': 'Telegram або телефон', 'form.contactPh': '@username або +7 900 000-00-00',
        'form.service': 'Що потрібно',
        'form.service.site': 'Сайт', 'form.service.bot': 'Telegram-бот',
        'form.service.design': 'Дизайн', 'form.service.other': 'Інше',
        'form.message': 'Опис задачі', 'form.messagePh': 'Що за проєкт, функціонал, приклади, терміни',
        'form.submit': 'Надіслати заявку', 'form.note': 'Натискаючи, ви погоджуєтесь на обробку даних.',
        'footer.slogan': 'Сайти та Telegram-боти під ключ за 1,5 дня.',
        'footer.author': 'Владислав', 'footer.up': 'Догори ↑'
      },

      pl: {
        'nav.services': 'Usługi', 'nav.packages': 'Pakiety', 'nav.cases': 'Portfolio',
        'nav.reviews': 'Opinie',
        'nav.process': 'Jak pracuję', 'nav.faq': 'FAQ', 'nav.cta': 'Omów projekt',
        'hero.pill': 'Dostępny dla nowych projektów',
        'hero.title1': 'Tworzę strony i boty Telegram',
        'hero.title2': 'pod klucz w 1,5 dnia',
        'hero.sub': 'TPF Studio — samodzielny rozwój od pomysłu do startu. Bez pośredników, terminowo, z gwarancją.',
        'hero.btn1': 'Omów projekt', 'hero.btn2': 'Zobacz portfolio',
        'stats.experience': 'lata doświadczenia', 'stats.projects': 'projekty pod klucz',
        'stats.days': 'dni średni czas', 'stats.turnkey': 'pod klucz',
        'about.eyebrow': 'o mnie', 'about.title': 'Jeden deweloper zamiast całego zespołu',
        'about.name': 'Władysław', 'about.role': 'Deweloper i założyciel TPF Studio',
        'about.location': 'Ługańsk · zdalnie',
        'about.p1': 'Jestem deweloperem i założycielem TPF Studio. Tworzę strony i boty Telegram pod klucz.',
        'about.p2': 'Przez 3,5 roku realizowałem projekty dla beauty i HoReCa. Jedna osoba zamiast zespołu.',
        'about.badge1': 'Zdalnie', 'about.badge2': 'Umowa', 'about.badge3': 'Bez przedpłaty za nic',
        'services.eyebrow': 'usługi', 'services.title': 'Co robię',
        'services.sub': 'Pełny cykl: design, kod, backend, baza danych, boty, deploy. Cena ustalana przed startem.',
        's1.title': 'Tworzenie stron', 's1.desc': 'Landingi, strony kawiarni i salonów, korporacyjne, sklepy.', 's1.price': 'od 15 000 ₽',
        's2.title': 'Boty Telegram', 's2.desc': 'Sklepy, lejki, zbieranie leadów, powiadomienia dla admina, integracje.', 's2.price': 'od 10 000 ₽',
        's3.title': 'Design', 's3.desc': 'Logotypy, banery, social media, makiety UI.', 's3.price': 'od 5 000 ₽',
        's4.title': 'Integracje i automatyzacja', 's4.desc': 'Supabase / PostgreSQL, leady do Telegram, webhooki, deploy.', 's4.price': 'od 7 000 ₽',
        's5.title': 'Wsparcie i poprawki', 's5.desc': 'Poprawki, aktualizacja treści, naprawa błędów.', 's5.price': 'na życzenie',
        's6.title': 'Szukasz czegoś innego?', 's6.desc': 'Opisz zadanie — zaproponuję rozwiązanie w ciągu godziny.', 's6.cta': 'Omów zadanie',
        'btn.order': 'Zamów',
        'packages.eyebrow': 'pakiety', 'packages.title': 'Gotowe plany',
        'packages.sub': 'Stała cena i termin.',
        'popular': 'Popularny',
        'p1.li1': 'Landing 5–7 sekcji', 'p1.li2': 'Responsywność', 'p1.li3': 'Formularz do Telegrama', 'p1.li4': 'Hosting GitHub Pages', 'p1.li5': 'Podstawowe SEO', 'p1.cta': 'Wybierz START',
        'p2.li1': 'Strona 10–14 sekcji', 'p2.li2': 'Bot Telegram', 'p2.li3': 'Baza danych (Supabase / PostgreSQL)', 'p2.li4': 'Powiadomienia w Telegramie', 'p2.li5': 'Panel admina bota', 'p2.li6': 'Hosting + deploy', 'p2.cta': 'Wybierz BIZNES',
        'p3.price': 'od 60 000 ₽', 'p3.li1': 'Strona + bot Telegram', 'p3.li2': 'Integracje: CRM / płatności / Google Sheets', 'p3.li3': 'Rozszerzony panel admina', 'p3.li4': 'Analityka', 'p3.li5': 'Wsparcie 3 miesiące', 'p3.cta': 'Wybierz PREMIUM',
        'process.eyebrow': 'proces', 'process.title': 'Jak pracuję', 'process.sub': 'Pięć przejrzystych kroków.',
        'step1.title': 'Brief i specyfikacja', 'step1.desc': 'Omawiamy zadanie, ustalamy termin i cenę.',
        'step2.title': 'Prototyp i design', 'step2.desc': 'Makieta Figma, zatwierdzona przed kodem.',
        'step3.title': 'Rozwój', 'step3.desc': 'Kod, baza danych, bot Telegram.',
        'step4.title': 'Testowanie', 'step4.desc': 'Testy urządzeń, poprawki.',
        'step5.title': 'Start i przekazanie', 'step5.desc': 'Deploy, dostępy, instrukcja.',
        'cases.eyebrow': 'portfolio', 'cases.title': 'Projekty pod klucz',
        'cases.sub': 'Prawdziwe strony z backendem, bazą danych i botem. Działają teraz.',
        'live': 'Live · działa', 'days15': '1,5 dnia',
        'case1.p1': 'Strona studia manicure z 14 sekcji: hero, usługi, slider przed/po, portfolio, mistrzowie, formularz, opinie, promocje, FAQ, blog.',
        'case1.p2': 'Backend: serverless na Supabase Edge Functions. Formularz zapisuje leady do PostgreSQL z RLS, powiadomienia w Telegramie z przyciskami.',
        'case1.p3': 'Bot Telegram na Grammy: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Bar karaoke «Piramida»',
        'case2.p1': 'Strona baru karaoke: menu z filtrami, galeria, promocje, slider opinii, formularz rezerwacji.',
        'case2.p2': 'Rezerwacja: gość zostawia zgłoszenie → Supabase → obaj adminowie dostają powiadomienie w Telegramie.',
        'case2.p3': 'Opinie: goście zostawiają opinie z oceną 1-5. Publikacja natychmiastowa, usunięcie w jedno kliknięcie.',
        'soon.title': 'Twój projekt może być tutaj', 'soon.text': 'Dostępny dla nowych zadań.', 'soon.cta': 'Omów projekt',
        'btn.openSite': 'Otwórz stronę', 'btn.wantSame': 'Chcę podobny',
        'reviews.eyebrow': 'opinie', 'reviews.title': 'Co mówią klienci',
        'reviews.sub': 'Prawdziwe opinie osób, z którymi pracowaliśmy.',
        'reviews.loading': 'Ładujemy opinie…', 'reviews.empty': 'Brak opinii. Bądź pierwszy!',
        'reviews.leaveCta': 'Zostaw opinię',
        'reviews.form.title': 'Zostaw opinię',
        'reviews.form.lead': 'Dziękujemy za podzielenie się wrażeniami! Opinia pojawi się od razu na stronie.',
        'reviews.form.name': 'Twoje imię', 'reviews.form.namePh': 'Jak się do Ciebie zwracać?',
        'reviews.form.role': 'Firma / rola (opcjonalnie)', 'reviews.form.rolePh': 'Kawiarnia, studio, projekt…',
        'reviews.form.rating': 'Ocena',
        'reviews.form.text': 'Treść opinii', 'reviews.form.textPh': 'Opowiedz, jak poszło',
        'reviews.form.submit': 'Wyślij opinię',
        'why.eyebrow': 'zalety', 'why.title': 'Dlaczego ja',
        'why1.title': 'Pod klucz', 'why1.desc': 'Od specyfikacji do hostingu.',
        'why2.title': 'Szybko', 'why2.desc': 'Średnio 1,5 dnia.',
        'why3.title': 'Uczciwa cena', 'why3.desc': 'Stała cena od początku.',
        'why4.title': 'Przejrzyście', 'why4.desc': 'Pokazuję postępy.',
        'why5.title': 'Technologie', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'faq', 'faq.title': 'Częste pytania',
        'faq.q1': 'Ile kosztuje strona?', 'faq.a1': 'Landing — od 15 000 ₽. Strona z botem — od 35 000 ₽. Premium — od 60 000 ₽.',
        'faq.q2': 'Jakie terminy?', 'faq.a2': 'Landing — 1,5 dnia. Złożone projekty — 3–10 dni.',
        'faq.q3': 'Co jest potrzebne ode mnie?', 'faq.a3': 'Opis zadania, przykłady, materiały.',
        'faq.q4': 'Pracujesz na umowę?', 'faq.a4': 'Tak. Przedpłata 30–50%.',
        'faq.q5': 'Co zawiera „pod klucz”?', 'faq.a5': 'Brief, design, kod, backend, baza, bot, powiadomienia, deploy, hosting.',
        'faq.q6': 'Poprawki po wdrożeniu?', 'faq.a6': 'Tak. 14 dni po — bezpłatne poprawki.',
        'contact.eyebrow': 'zapytanie', 'contact.title': 'Omówmy twój projekt',
        'contact.sub': 'Opisz zadanie — odpowiem w ciągu godziny.',
        'contacts.eyebrow': 'kontakty', 'contacts.title': 'Napisz bezpośrednio',
        'contacts.write': 'Napisz', 'contacts.open': 'Otwórz',
        'contacts.loc': 'Lokalizacja', 'contacts.locValue': 'Ługańsk · zdalnie',
        'contacts.locNote': 'Pracuję z każdego regionu',
        'form.name': 'Imię', 'form.namePh': 'Jak mam się zwracać?',
        'form.contact': 'Telegram lub telefon', 'form.contactPh': '@username lub +7 900 000-00-00',
        'form.service': 'Co potrzebujesz',
        'form.service.site': 'Strona', 'form.service.bot': 'Bot Telegram',
        'form.service.design': 'Design', 'form.service.other': 'Inne',
        'form.message': 'Opis zadania', 'form.messagePh': 'Jaki projekt, funkcje, przykłady, terminy',
        'form.submit': 'Wyślij zapytanie', 'form.note': 'Klikając, zgadzasz się na przetwarzanie danych.',
        'footer.slogan': 'Strony i boty Telegram pod klucz w 1,5 dnia.',
        'footer.author': 'Władysław', 'footer.up': 'Do góry ↑'
      },

      de: {
        'nav.services': 'Leistungen', 'nav.packages': 'Pakete', 'nav.cases': 'Projekte',
        'nav.reviews': 'Bewertungen',
        'nav.process': 'Wie ich arbeite', 'nav.faq': 'FAQ', 'nav.cta': 'Projekt besprechen',
        'hero.pill': 'Verfügbar für neue Projekte',
        'hero.title1': 'Ich baue Websites und Telegram-Bots',
        'hero.title2': 'schlüsselfertig in 1,5 Tagen',
        'hero.sub': 'TPF Studio — Solo-Entwicklung von der Idee bis zum Start. Ohne Mittelsmänner, termingerecht, mit Garantie.',
        'hero.btn1': 'Projekt besprechen', 'hero.btn2': 'Projekte ansehen',
        'stats.experience': 'Jahre Erfahrung', 'stats.projects': 'Projekte schlüsselfertig',
        'stats.days': 'Tage durchschnittlich', 'stats.turnkey': 'schlüsselfertig',
        'about.eyebrow': 'über mich', 'about.title': 'Ein Entwickler statt eines ganzen Teams',
        'about.name': 'Wladislaw', 'about.role': 'Entwickler & Gründer von TPF Studio',
        'about.location': 'Lugansk · remote',
        'about.p1': 'Ich bin Entwickler und Gründer von TPF Studio. Ich baue Websites und Telegram-Bots schlüsselfertig.',
        'about.p2': 'In 3,5 Jahren lieferte ich Projekte für Beauty und HoReCa. Eine Person statt eines Teams.',
        'about.badge1': 'Remote', 'about.badge2': 'Vertraglich', 'about.badge3': 'Keine Luft-Vorauszahlung',
        'services.eyebrow': 'leistungen', 'services.title': 'Was ich mache',
        'services.sub': 'Voller Zyklus: Design, Markup, Backend, Datenbank, Bots, Deploy.',
        's1.title': 'Website-Entwicklung', 's1.desc': 'Landingpages, Café- und Salon-Websites, Corporate, Shops.', 's1.price': 'ab 15 000 ₽',
        's2.title': 'Telegram-Bots', 's2.desc': 'Shops, Funnels, Lead-Erfassung, Admin-Benachrichtigungen, Integrationen.', 's2.price': 'ab 10 000 ₽',
        's3.title': 'Design', 's3.desc': 'Logos, Banner, Social Media, UI-Mockups.', 's3.price': 'ab 5 000 ₽',
        's4.title': 'Integrationen & Automatisierung', 's4.desc': 'Supabase / PostgreSQL, Website-Leads zu Telegram, Webhooks, Deploy.', 's4.price': 'ab 7 000 ₽',
        's5.title': 'Support & Updates', 's5.desc': 'Fixes, Content-Updates, Bugfixing.', 's5.price': 'auf Anfrage',
        's6.title': 'Suchen Sie etwas anderes?', 's6.desc': 'Beschreiben Sie die Aufgabe — ich antworte innerhalb einer Stunde.', 's6.cta': 'Aufgabe besprechen',
        'btn.order': 'Bestellen',
        'packages.eyebrow': 'pakete', 'packages.title': 'Fertige Pakete',
        'packages.sub': 'Fester Preis und Termin.',
        'popular': 'Beliebt',
        'p1.li1': 'Landing 5–7 Sektionen', 'p1.li2': 'Responsive auf allen Geräten', 'p1.li3': 'Lead-Formular zu Telegram', 'p1.li4': 'GitHub Pages Hosting', 'p1.li5': 'Basis-SEO', 'p1.cta': 'START wählen',
        'p2.li1': 'Website 10–14 Sektionen', 'p2.li2': 'Telegram-Bot', 'p2.li3': 'Datenbank (Supabase / PostgreSQL)', 'p2.li4': 'Admin-Benachrichtigungen in Telegram', 'p2.li5': 'Bot-Admin-Panel', 'p2.li6': 'Hosting + Deploy', 'p2.cta': 'BUSINESS wählen',
        'p3.price': 'ab 60 000 ₽', 'p3.li1': 'Website + Telegram-Bot', 'p3.li2': 'Integrationen: CRM / Zahlungen / Google Sheets', 'p3.li3': 'Erweitertes Admin-Panel', 'p3.li4': 'Analytics & Ziele', 'p3.li5': 'Support 3 Monate', 'p3.cta': 'PREMIUM wählen',
        'process.eyebrow': 'prozess', 'process.title': 'Wie ich arbeite', 'process.sub': 'Fünf transparente Schritte.',
        'step1.title': 'Brief & Spezifikation', 'step1.desc': 'Wir besprechen die Aufgabe, fixieren Termin und Preis.',
        'step2.title': 'Prototyp & Design', 'step2.desc': 'Figma-Mockup, vor dem Code freigegeben.',
        'step3.title': 'Entwicklung', 'step3.desc': 'Code, Datenbank, Telegram-Bot.',
        'step4.title': 'Testen', 'step4.desc': 'Gerätetests, Fixes, Feinschliff.',
        'step5.title': 'Start & Übergabe', 'step5.desc': 'Deploy, Zugänge, Anleitung.',
        'cases.eyebrow': 'projekte', 'cases.title': 'Schlüsselfertige Projekte',
        'cases.sub': 'Echte Websites mit Backend, Datenbank und Telegram-Bots. Funktionieren jetzt.',
        'live': 'Live · läuft', 'days15': '1,5 Tage',
        'case1.p1': 'Landing für ein Nagelstudio mit 14 Sektionen: Hero, Services, Vorher/Nachher-Slider, Portfolio, Meister, Buchungsformular, Bewertungen, Aktionen, FAQ, Blog.',
        'case1.p2': 'Backend: serverless auf Supabase Edge Functions. Buchungsformular speichert Leads in PostgreSQL mit RLS, Telegram-Benachrichtigungen mit Inline-Buttons.',
        'case1.p3': 'Grammy Telegram-Bot: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Karaoke-Bar «Piramida»',
        'case2.p1': 'Website für Karaoke-Bar: Menü mit Filtern, Galerie, Aktionen, Bewertungsslider, Buchungsformular.',
        'case2.p2': 'Buchung: Gast sendet Anfrage → Supabase → beide Admins erhalten Telegram-Benachrichtigung.',
        'case2.p3': 'Bewertungen: Gäste hinterlassen Bewertungen mit 1-5 Sternen. Sofort veröffentlicht, ein Klick zum Löschen.',
        'soon.title': 'Ihr Projekt könnte hier sein', 'soon.text': 'Verfügbar für neue Aufgaben.', 'soon.cta': 'Projekt besprechen',
        'btn.openSite': 'Website öffnen', 'btn.wantSame': 'Ich will das auch',
        'reviews.eyebrow': 'bewertungen', 'reviews.title': 'Was Kunden sagen',
        'reviews.sub': 'Echte Bewertungen von Menschen, mit denen wir gearbeitet haben.',
        'reviews.loading': 'Bewertungen werden geladen…', 'reviews.empty': 'Noch keine Bewertungen. Seien Sie der Erste!',
        'reviews.leaveCta': 'Bewertung abgeben',
        'reviews.form.title': 'Bewertung abgeben',
        'reviews.form.lead': 'Danke, dass Sie Ihre Erfahrung teilen! Die Bewertung erscheint sofort auf der Website.',
        'reviews.form.name': 'Ihr Name', 'reviews.form.namePh': 'Wie sollen wir Sie nennen?',
        'reviews.form.role': 'Firma / Rolle (optional)', 'reviews.form.rolePh': 'Café, Studio, Projekt…',
        'reviews.form.rating': 'Bewertung',
        'reviews.form.text': 'Bewertungstext', 'reviews.form.textPh': 'Erzählen Sie, wie es lief',
        'reviews.form.submit': 'Bewertung senden',
        'why.eyebrow': 'vorteile', 'why.title': 'Warum ich',
        'why1.title': 'Schlüsselfertig', 'why1.desc': 'Von Spezifikation bis Hosting.',
        'why2.title': 'Schnell', 'why2.desc': 'Durchschnittlich 1,5 Tage.',
        'why3.title': 'Fairer Preis', 'why3.desc': 'Festpreis von Anfang an.',
        'why4.title': 'Transparent', 'why4.desc': 'Fortschritt wird gezeigt.',
        'why5.title': 'Technik', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'faq', 'faq.title': 'Häufige Fragen',
        'faq.q1': 'Was kostet eine Website?', 'faq.a1': 'Landing — ab 15 000 ₽. Website mit Bot — ab 35 000 ₽. Premium — ab 60 000 ₽.',
        'faq.q2': 'Welche Termine?', 'faq.a2': 'Landing — 1,5 Tage. Komplexe Projekte — 3–10 Tage.',
        'faq.q3': 'Was brauchen Sie von mir?', 'faq.a3': 'Aufgabenbeschreibung, Beispiele, Materialien.',
        'faq.q4': 'Arbeiten Sie mit Vertrag?', 'faq.a4': 'Ja. Vorauszahlung 30–50%.',
        'faq.q5': 'Was ist in „schlüsselfertig“?', 'faq.a5': 'Brief, Design, Markup, Responsive, Backend, DB, Bot, Benachrichtigungen, Deploy, Hosting.',
        'faq.q6': 'Updates nach Lieferung?', 'faq.a6': 'Ja. 14 Tage nach Lieferung — kostenlose Fixes.',
        'contact.eyebrow': 'anfrage', 'contact.title': 'Besprechen wir Ihr Projekt',
        'contact.sub': 'Beschreiben Sie die Aufgabe — ich antworte innerhalb einer Stunde.',
        'contacts.eyebrow': 'kontakte', 'contacts.title': 'Direkt schreiben',
        'contacts.write': 'Schreiben', 'contacts.open': 'Öffnen',
        'contacts.loc': 'Standort', 'contacts.locValue': 'Lugansk · remote',
        'contacts.locNote': 'Arbeite mit jeder Region',
        'form.name': 'Name', 'form.namePh': 'Wie soll ich Sie nennen?',
        'form.contact': 'Telegram oder Telefon', 'form.contactPh': '@username oder +7 900 000-00-00',
        'form.service': 'Was brauchen Sie',
        'form.service.site': 'Website', 'form.service.bot': 'Telegram-Bot',
        'form.service.design': 'Design', 'form.service.other': 'Anderes',
        'form.message': 'Aufgabenbeschreibung', 'form.messagePh': 'Welches Projekt, Funktionen, Beispiele, Termine',
        'form.submit': 'Anfrage senden', 'form.note': 'Mit Klick stimmen Sie der Datenverarbeitung zu.',
        'footer.slogan': 'Websites und Telegram-Bots schlüsselfertig in 1,5 Tagen.',
        'footer.author': 'Wladislaw', 'footer.up': 'Nach oben ↑'
      },

      fr: {
        'nav.services': 'Services', 'nav.packages': 'Forfaits', 'nav.cases': 'Réalisations',
        'nav.reviews': 'Avis',
        'nav.process': 'Processus', 'nav.faq': 'FAQ', 'nav.cta': 'Discuter du projet',
        'hero.pill': 'Disponible pour de nouveaux projets',
        'hero.title1': 'Je crée des sites et bots Telegram',
        'hero.title2': 'clé en main en 1,5 jour',
        'hero.sub': 'TPF Studio — développement solo de l\'idée au lancement. Sans intermédiaires, dans les délais, garanti.',
        'hero.btn1': 'Discuter du projet', 'hero.btn2': 'Voir les réalisations',
        'stats.experience': 'ans d\'expérience', 'stats.projects': 'projets clé en main',
        'stats.days': 'jours en moyenne', 'stats.turnkey': 'clé en main',
        'about.eyebrow': 'à propos', 'about.title': 'Un développeur au lieu d\'une équipe',
        'about.name': 'Vladislav', 'about.role': 'Développeur & fondateur de TPF Studio',
        'about.location': 'Lougansk · à distance',
        'about.p1': 'Je suis développeur et fondateur de TPF Studio. Je crée des sites et bots Telegram clé en main.',
        'about.p2': 'En 3,5 ans, j\'ai livré des projets pour la beauté et HoReCa. Une personne au lieu d\'une équipe.',
        'about.badge1': 'À distance', 'about.badge2': 'Sous contrat', 'about.badge3': 'Sans prépaiement en l\'air',
        'services.eyebrow': 'services', 'services.title': 'Ce que je fais',
        'services.sub': 'Cycle complet : design, code, backend, base de données, bots, déploiement.',
        's1.title': 'Développement web', 's1.desc': 'Landings, sites de cafés et salons, corporate, boutiques.', 's1.price': 'à partir de 15 000 ₽',
        's2.title': 'Bots Telegram', 's2.desc': 'Boutiques, entonnoirs, capture de leads, notifications admin, intégrations.', 's2.price': 'à partir de 10 000 ₽',
        's3.title': 'Design', 's3.desc': 'Logos, bannières, réseaux sociaux, maquettes UI.', 's3.price': 'à partir de 5 000 ₽',
        's4.title': 'Intégrations & automatisation', 's4.desc': 'Supabase / PostgreSQL, leads du site vers Telegram, webhooks, déploiement.', 's4.price': 'à partir de 7 000 ₽',
        's5.title': 'Support & mises à jour', 's5.desc': 'Corrections, mises à jour de contenu, bugfixing.', 's5.price': 'sur demande',
        's6.title': 'Vous cherchez autre chose ?', 's6.desc': 'Décrivez la tâche — je réponds dans l\'heure.', 's6.cta': 'Discuter',
        'btn.order': 'Commander',
        'packages.eyebrow': 'forfaits', 'packages.title': 'Forfaits prêts',
        'packages.sub': 'Prix et délai fixes.',
        'popular': 'Populaire',
        'p1.li1': 'Landing 5–7 sections', 'p1.li2': 'Responsive sur tous appareils', 'p1.li3': 'Formulaire vers Telegram', 'p1.li4': 'Hébergement GitHub Pages', 'p1.li5': 'SEO de base', 'p1.cta': 'Choisir START',
        'p2.li1': 'Site 10–14 sections', 'p2.li2': 'Bot Telegram', 'p2.li3': 'Base de données (Supabase / PostgreSQL)', 'p2.li4': 'Notifications admin', 'p2.li5': 'Panneau admin bot', 'p2.li6': 'Hébergement + déploiement', 'p2.cta': 'Choisir BUSINESS',
        'p3.price': 'à partir de 60 000 ₽', 'p3.li1': 'Site + bot Telegram', 'p3.li2': 'Intégrations : CRM / paiements / Google Sheets', 'p3.li3': 'Panneau admin étendu', 'p3.li4': 'Analytics', 'p3.li5': 'Support 3 mois', 'p3.cta': 'Choisir PREMIUM',
        'process.eyebrow': 'processus', 'process.title': 'Comment je travaille', 'process.sub': 'Cinq étapes transparentes.',
        'step1.title': 'Brief & spécifications', 'step1.desc': 'Nous discutons, fixons le délai et le prix.',
        'step2.title': 'Prototype & design', 'step2.desc': 'Maquette Figma, validée avant le code.',
        'step3.title': 'Développement', 'step3.desc': 'Code, base de données, bot Telegram.',
        'step4.title': 'Tests', 'step4.desc': 'Tests sur appareils, corrections.',
        'step5.title': 'Lancement & livraison', 'step5.desc': 'Déploiement, accès, guide.',
        'cases.eyebrow': 'réalisations', 'cases.title': 'Projets clé en main',
        'cases.sub': 'Vrais sites avec backend, base de données et bot Telegram. Fonctionnent maintenant.',
        'live': 'Live · en ligne', 'days15': '1,5 jour',
        'case1.p1': 'Landing pour un studio d\'ongles avec 14 sections : hero, services, slider avant/après, portfolio, maîtres, formulaire de réservation, avis, promos, FAQ, blog.',
        'case1.p2': 'Backend : serverless sur Supabase Edge Functions. Formulaire de réservation enregistre les leads dans PostgreSQL, notifications Telegram avec boutons.',
        'case1.p3': 'Bot Telegram Grammy : /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Bar karaoké « Piramida »',
        'case2.p1': 'Site de bar karaoké : menu avec filtres, galerie, promos, slider d\'avis, formulaire de réservation.',
        'case2.p2': 'Réservation : demande du client → Supabase → notification Telegram aux deux admins.',
        'case2.p3': 'Avis : les clients laissent un avis de 1 à 5. Publié instantanément, supprimé en un clic.',
        'soon.title': 'Votre projet pourrait être ici', 'soon.text': 'Disponible pour de nouvelles tâches.', 'soon.cta': 'Discuter du projet',
        'btn.openSite': 'Ouvrir le site', 'btn.wantSame': 'Je veux pareil',
        'reviews.eyebrow': 'avis', 'reviews.title': 'Ce que disent les clients',
        'reviews.sub': 'Vrais avis de personnes avec qui nous avons travaillé.',
        'reviews.loading': 'Chargement des avis…', 'reviews.empty': 'Pas encore d\'avis. Soyez le premier !',
        'reviews.leaveCta': 'Laisser un avis',
        'reviews.form.title': 'Laisser un avis',
        'reviews.form.lead': 'Merci de partager votre expérience ! L\'avis apparaîtra immédiatement sur le site.',
        'reviews.form.name': 'Votre nom', 'reviews.form.namePh': 'Comment vous appeler ?',
        'reviews.form.role': 'Entreprise / rôle (optionnel)', 'reviews.form.rolePh': 'Café, studio, projet…',
        'reviews.form.rating': 'Note',
        'reviews.form.text': 'Texte de l\'avis', 'reviews.form.textPh': 'Racontez comment ça s\'est passé',
        'reviews.form.submit': 'Envoyer l\'avis',
        'why.eyebrow': 'avantages', 'why.title': 'Pourquoi moi',
        'why1.title': 'Clé en main', 'why1.desc': 'De la spec à l\'hébergement.',
        'why2.title': 'Rapide', 'why2.desc': '1,5 jour en moyenne.',
        'why3.title': 'Prix juste', 'why3.desc': 'Fixe dès le début.',
        'why4.title': 'Transparent', 'why4.desc': 'Progrès montré.',
        'why5.title': 'Tech', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'faq', 'faq.title': 'Questions fréquentes',
        'faq.q1': 'Combien coûte un site ?', 'faq.a1': 'Landing — à partir de 15 000 ₽. Site avec bot — à partir de 35 000 ₽. Premium — à partir de 60 000 ₽.',
        'faq.q2': 'Quels délais ?', 'faq.a2': 'Landing — 1,5 jour. Projets complexes — 3 à 10 jours.',
        'faq.q3': 'Que faut-il de moi ?', 'faq.a3': 'Description, exemples, matériaux.',
        'faq.q4': 'Travaillez-vous sous contrat ?', 'faq.a4': 'Oui. Prépaie 30–50 %.',
        'faq.q5': 'Que comprend « clé en main » ?', 'faq.a5': 'Brief, design, code, responsive, backend, DB, bot, notifications, déploiement, hébergement.',
        'faq.q6': 'Modifications après livraison ?', 'faq.a6': 'Oui. 14 jours après — corrections gratuites.',
        'contact.eyebrow': 'demande', 'contact.title': 'Discutons de votre projet',
        'contact.sub': 'Décrivez la tâche — je réponds dans l\'heure.',
        'contacts.eyebrow': 'contacts', 'contacts.title': 'Écrire directement',
        'contacts.write': 'Écrire', 'contacts.open': 'Ouvrir',
        'contacts.loc': 'Localisation', 'contacts.locValue': 'Lougansk · à distance',
        'contacts.locNote': 'Je travaille avec toutes les régions',
        'form.name': 'Nom', 'form.namePh': 'Comment vous appeler ?',
        'form.contact': 'Telegram ou téléphone', 'form.contactPh': '@username ou +7 900 000-00-00',
        'form.service': 'Ce dont vous avez besoin',
        'form.service.site': 'Site', 'form.service.bot': 'Bot Telegram',
        'form.service.design': 'Design', 'form.service.other': 'Autre',
        'form.message': 'Description', 'form.messagePh': 'Quel projet, fonctionnalités, exemples, délais',
        'form.submit': 'Envoyer la demande', 'form.note': 'En cliquant, vous acceptez le traitement des données.',
        'footer.slogan': 'Sites et bots Telegram clé en main en 1,5 jour.',
        'footer.author': 'Vladislav', 'footer.up': 'En haut ↑'
      },

      es: {
        'nav.services': 'Servicios', 'nav.packages': 'Paquetes', 'nav.cases': 'Proyectos',
        'nav.reviews': 'Reseñas',
        'nav.process': 'Cómo trabajo', 'nav.faq': 'FAQ', 'nav.cta': 'Discutir proyecto',
        'hero.pill': 'Disponible para nuevos proyectos',
        'hero.title1': 'Creo sitios web y bots de Telegram',
        'hero.title2': 'llave en mano en 1,5 días',
        'hero.sub': 'TPF Studio — desarrollo en solitario de la idea al lanzamiento. Sin intermediarios, a tiempo, con garantía.',
        'hero.btn1': 'Discutir proyecto', 'hero.btn2': 'Ver proyectos',
        'stats.experience': 'años de experiencia', 'stats.projects': 'proyectos llave en mano',
        'stats.days': 'días en promedio', 'stats.turnkey': 'llave en mano',
        'about.eyebrow': 'sobre mí', 'about.title': 'Un desarrollador en lugar de un equipo',
        'about.name': 'Vladislav', 'about.role': 'Desarrollador y fundador de TPF Studio',
        'about.location': 'Lugansk · remoto',
        'about.p1': 'Soy desarrollador y fundador de TPF Studio. Creo sitios web y bots de Telegram llave en mano.',
        'about.p2': 'En 3,5 años entregué proyectos para belleza y HoReCa. Una persona en lugar de un equipo.',
        'about.badge1': 'Remoto', 'about.badge2': 'Con contrato', 'about.badge3': 'Sin prepago al aire',
        'services.eyebrow': 'servicios', 'services.title': 'Qué hago',
        'services.sub': 'Ciclo completo: diseño, código, backend, base de datos, bots, deploy.',
        's1.title': 'Desarrollo web', 's1.desc': 'Landings, sitios de cafés y salones, corporativos, tiendas.', 's1.price': 'desde 15 000 ₽',
        's2.title': 'Bots de Telegram', 's2.desc': 'Tiendas, embudos, captura de leads, notificaciones admin, integraciones.', 's2.price': 'desde 10 000 ₽',
        's3.title': 'Diseño', 's3.desc': 'Logotipos, banners, redes sociales, mockups UI.', 's3.price': 'desde 5 000 ₽',
        's4.title': 'Integraciones y automatización', 's4.desc': 'Supabase / PostgreSQL, leads del sitio a Telegram, webhooks, deploy.', 's4.price': 'desde 7 000 ₽',
        's5.title': 'Soporte y actualizaciones', 's5.desc': 'Correcciones, actualizaciones de contenido, bugfixing.', 's5.price': 'a consultar',
        's6.title': '¿Buscas algo más?', 's6.desc': 'Describe la tarea — respondo en una hora.', 's6.cta': 'Discutir tarea',
        'btn.order': 'Pedir',
        'packages.eyebrow': 'paquetes', 'packages.title': 'Planes listos',
        'packages.sub': 'Precio y plazo fijos.',
        'popular': 'Popular',
        'p1.li1': 'Landing 5–7 secciones', 'p1.li2': 'Responsive en todos los dispositivos', 'p1.li3': 'Formulario a Telegram', 'p1.li4': 'Hosting GitHub Pages', 'p1.li5': 'SEO básico', 'p1.cta': 'Elegir START',
        'p2.li1': 'Sitio 10–14 secciones', 'p2.li2': 'Bot de Telegram', 'p2.li3': 'Base de datos (Supabase / PostgreSQL)', 'p2.li4': 'Notificaciones admin', 'p2.li5': 'Panel admin del bot', 'p2.li6': 'Hosting + deploy', 'p2.cta': 'Elegir BUSINESS',
        'p3.price': 'desde 60 000 ₽', 'p3.li1': 'Sitio + bot Telegram', 'p3.li2': 'Integraciones: CRM / pagos / Google Sheets', 'p3.li3': 'Panel admin extendido', 'p3.li4': 'Analítica', 'p3.li5': 'Soporte 3 meses', 'p3.cta': 'Elegir PREMIUM',
        'process.eyebrow': 'proceso', 'process.title': 'Cómo trabajo', 'process.sub': 'Cinco pasos transparentes.',
        'step1.title': 'Brief y especificación', 'step1.desc': 'Discutimos, fijamos plazo y precio.',
        'step2.title': 'Prototipo y diseño', 'step2.desc': 'Mockup en Figma, aprobado antes del código.',
        'step3.title': 'Desarrollo', 'step3.desc': 'Código, base de datos y bot Telegram.',
        'step4.title': 'Testing', 'step4.desc': 'Pruebas en dispositivos, correcciones.',
        'step5.title': 'Lanzamiento y entrega', 'step5.desc': 'Deploy, accesos, guía.',
        'cases.eyebrow': 'proyectos', 'cases.title': 'Proyectos llave en mano',
        'cases.sub': 'Sitios reales con backend, base de datos y bots de Telegram. Funcionando ahora.',
        'live': 'Live · funcionando', 'days15': '1,5 días',
        'case1.p1': 'Landing para un estudio de uñas con 14 secciones: hero, servicios, slider antes/después, portfolio, maestros, formulario, reseñas, promos, FAQ, blog.',
        'case1.p2': 'Backend: serverless en Supabase Edge Functions. El formulario guarda leads en PostgreSQL con RLS, notificaciones a Telegram con botones inline.',
        'case1.p3': 'Bot de Telegram con Grammy: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Bar de karaoke «Piramida»',
        'case2.p1': 'Sitio para bar de karaoke: menú con filtros, galería, promos, slider de reseñas, formulario de reserva.',
        'case2.p2': 'Reserva: el cliente deja una solicitud → Supabase → ambos admins reciben notificación en Telegram.',
        'case2.p3': 'Reseñas: los clientes dejan reseñas de 1 a 5. Publicadas al instante, eliminadas en un toque.',
        'soon.title': 'Tu proyecto podría estar aquí', 'soon.text': 'Disponible para nuevas tareas.', 'soon.cta': 'Discutir proyecto',
        'btn.openSite': 'Abrir sitio', 'btn.wantSame': 'Quiero uno igual',
        'reviews.eyebrow': 'reseñas', 'reviews.title': 'Lo que dicen los clientes',
        'reviews.sub': 'Reseñas reales de personas con las que trabajamos.',
        'reviews.loading': 'Cargando reseñas…', 'reviews.empty': 'Aún no hay reseñas. ¡Sé el primero!',
        'reviews.leaveCta': 'Dejar una reseña',
        'reviews.form.title': 'Dejar una reseña',
        'reviews.form.lead': '¡Gracias por compartir tu experiencia! La reseña aparecerá inmediatamente en el sitio.',
        'reviews.form.name': 'Tu nombre', 'reviews.form.namePh': '¿Cómo te llamo?',
        'reviews.form.role': 'Empresa / rol (opcional)', 'reviews.form.rolePh': 'Cafetería, estudio, proyecto…',
        'reviews.form.rating': 'Valoración',
        'reviews.form.text': 'Texto de la reseña', 'reviews.form.textPh': 'Cuéntanos cómo fue',
        'reviews.form.submit': 'Enviar reseña',
        'why.eyebrow': 'ventajas', 'why.title': 'Por qué yo',
        'why1.title': 'Llave en mano', 'why1.desc': 'De la spec al hosting.',
        'why2.title': 'Rápido', 'why2.desc': '1,5 días en promedio.',
        'why3.title': 'Precio justo', 'why3.desc': 'Fijo desde el inicio.',
        'why4.title': 'Transparente', 'why4.desc': 'Progreso mostrado.',
        'why5.title': 'Tech', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'faq', 'faq.title': 'Preguntas frecuentes',
        'faq.q1': '¿Cuánto cuesta un sitio?', 'faq.a1': 'Landing — desde 15 000 ₽. Sitio con bot — desde 35 000 ₽. Premium — desde 60 000 ₽.',
        'faq.q2': '¿Qué plazos?', 'faq.a2': 'Landing — 1,5 días. Proyectos complejos — 3 a 10 días.',
        'faq.q3': '¿Qué necesitas de mí?', 'faq.a3': 'Descripción, ejemplos, materiales.',
        'faq.q4': '¿Trabajas por contrato?', 'faq.a4': 'Sí. Prepago 30–50%.',
        'faq.q5': '¿Qué incluye «llave en mano»?', 'faq.a5': 'Brief, diseño, código, responsive, backend, DB, bot, notificaciones, deploy, hosting.',
        'faq.q6': '¿Haces actualizaciones?', 'faq.a6': 'Sí. 14 días después — correcciones gratuitas.',
        'contact.eyebrow': 'solicitud', 'contact.title': 'Hablemos de tu proyecto',
        'contact.sub': 'Describe la tarea — respondo en una hora.',
        'contacts.eyebrow': 'contactos', 'contacts.title': 'Escribir directo',
        'contacts.write': 'Escribir', 'contacts.open': 'Abrir',
        'contacts.loc': 'Ubicación', 'contacts.locValue': 'Lugansk · remoto',
        'contacts.locNote': 'Trabajo con cualquier región',
        'form.name': 'Nombre', 'form.namePh': '¿Cómo te llamo?',
        'form.contact': 'Telegram o teléfono', 'form.contactPh': '@username o +7 900 000-00-00',
        'form.service': 'Qué necesitas',
        'form.service.site': 'Sitio', 'form.service.bot': 'Bot de Telegram',
        'form.service.design': 'Diseño', 'form.service.other': 'Otro',
        'form.message': 'Descripción', 'form.messagePh': 'Qué proyecto, funcionalidad, ejemplos, plazos',
        'form.submit': 'Enviar solicitud', 'form.note': 'Al hacer clic, aceptas el tratamiento de datos.',
        'footer.slogan': 'Sitios y bots de Telegram llave en mano en 1,5 días.',
        'footer.author': 'Vladislav', 'footer.up': 'Arriba ↑'
      },

      tr: {
        'nav.services': 'Hizmetler', 'nav.packages': 'Paketler', 'nav.cases': 'Projeler',
        'nav.reviews': 'Yorumlar',
        'nav.process': 'Nasıl çalışırım', 'nav.faq': 'SSS', 'nav.cta': 'Projeyi görüşelim',
        'hero.pill': 'Yeni projelere açık',
        'hero.title1': 'Web siteleri ve Telegram botları yapıyorum',
        'hero.title2': '1,5 günde anahtar teslim',
        'hero.sub': 'TPF Studio — fikirden lansmana solo geliştirme. Aracısız, zamanında, garantili.',
        'hero.btn1': 'Projeyi görüşelim', 'hero.btn2': 'Projeleri gör',
        'stats.experience': 'yıl deneyim', 'stats.projects': 'anahtar teslim proje',
        'stats.days': 'gün ortalama', 'stats.turnkey': 'anahtar teslim',
        'about.eyebrow': 'hakkımda', 'about.title': 'Bir ekip yerine bir geliştirici',
        'about.name': 'Vladislav', 'about.role': 'Geliştirici ve TPF Studio kurucusu',
        'about.location': 'Lugansk · uzaktan',
        'about.p1': 'TPF Studio\'nun kurucusuyum. Web siteleri ve Telegram botları anahtar teslim yapıyorum.',
        'about.p2': '3,5 yılda güzellik ve HoReCa için projeler teslim ettim. Bir kişi, bir ekip yerine.',
        'about.badge1': 'Uzaktan', 'about.badge2': 'Sözleşmeli', 'about.badge3': 'Boşluğa ön ödeme yok',
        'services.eyebrow': 'hizmetler', 'services.title': 'Ne yapıyorum',
        'services.sub': 'Tam döngü: tasarım, kod, backend, veritabanı, botlar, dağıtım.',
        's1.title': 'Web sitesi geliştirme', 's1.desc': 'Landing, kafe ve salon siteleri, kurumsal, mağaza.', 's1.price': '15 000 ₽\'den',
        's2.title': 'Telegram botları', 's2.desc': 'Mağaza, huni, lead toplama, admin bildirimleri, entegrasyonlar.', 's2.price': '10 000 ₽\'den',
        's3.title': 'Tasarım', 's3.desc': 'Logolar, bannerlar, sosyal medya, UI mockup.', 's3.price': '5 000 ₽\'den',
        's4.title': 'Entegrasyon ve otomasyon', 's4.desc': 'Supabase / PostgreSQL, siteden Telegram\'a lead, webhook, dağıtım.', 's4.price': '7 000 ₽\'den',
        's5.title': 'Destek ve güncelleme', 's5.desc': 'Düzeltmeler, içerik güncelleme, hata düzeltme.', 's5.price': 'talebe göre',
        's6.title': 'Başka bir şey mi arıyorsunuz?', 's6.desc': 'Görevi tanımlayın — bir saat içinde yanıt vereceğim.', 's6.cta': 'Görevi görüşelim',
        'btn.order': 'Sipariş',
        'packages.eyebrow': 'paketler', 'packages.title': 'Hazır paketler',
        'packages.sub': 'Sabit fiyat ve süre.',
        'popular': 'Popüler',
        'p1.li1': 'Landing 5–7 bölüm', 'p1.li2': 'Tüm cihazlarda uyumlu', 'p1.li3': 'Telegram\'a form', 'p1.li4': 'GitHub Pages hosting', 'p1.li5': 'Temel SEO', 'p1.cta': 'START seç',
        'p2.li1': 'Site 10–14 bölüm', 'p2.li2': 'Telegram bot', 'p2.li3': 'Veritabanı (Supabase / PostgreSQL)', 'p2.li4': 'Telegram admin bildirimleri', 'p2.li5': 'Bot admin paneli', 'p2.li6': 'Hosting + dağıtım', 'p2.cta': 'BUSINESS seç',
        'p3.price': '60 000 ₽\'den', 'p3.li1': 'Site + Telegram bot', 'p3.li2': 'Entegrasyonlar: CRM / ödeme / Google Sheets', 'p3.li3': 'Genişletilmiş admin panel', 'p3.li4': 'Analitik', 'p3.li5': '3 ay destek', 'p3.cta': 'PREMIUM seç',
        'process.eyebrow': 'süreç', 'process.title': 'Nasıl çalışırım', 'process.sub': 'Beş şeffaf adım.',
        'step1.title': 'Brief ve spec', 'step1.desc': 'Görevi konuşup süre ve fiyatı sabitliyoruz.',
        'step2.title': 'Prototip ve tasarım', 'step2.desc': 'Figma mockup, koddan önce onaylanır.',
        'step3.title': 'Geliştirme', 'step3.desc': 'Kod, veritabanı ve Telegram bot.',
        'step4.title': 'Test', 'step4.desc': 'Cihaz testi, düzeltme, cila.',
        'step5.title': 'Lansman ve teslim', 'step5.desc': 'Dağıtım, erişimler, kılavuz.',
        'cases.eyebrow': 'projeler', 'cases.title': 'Anahtar teslim projeler',
        'cases.sub': 'Backend, veritabanı ve Telegram botlu gerçek siteler. Şu anda çalışıyor.',
        'live': 'Live · çalışıyor', 'days15': '1,5 gün',
        'case1.p1': 'Tırnak stüdyosu için 14 bölümlü landing: hero, hizmetler, önce/sonra slider, portföy, ustalar, randevu formu, yorumlar, promosyonlar, SSS, blog.',
        'case1.p2': 'Backend: Supabase Edge Functions serverless. Randevu formu lead\'leri RLS ile PostgreSQL\'e kaydeder, Telegram\'a inline butonlu bildirim gönderir.',
        'case1.p3': 'Grammy Telegram bot: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': 'Karaoke bar «Piramida»',
        'case2.p1': 'Karaoke bar sitesi: filtreli menü, galeri, promosyonlar, yorum slider\'ı, rezervasyon formu.',
        'case2.p2': 'Rezervasyon: müşteri talep bırakır → Supabase → iki admin Telegram bildirimi alır.',
        'case2.p3': 'Yorumlar: müşteriler 1-5 yıldız verir. Anında yayınlanır, tek tıkla silinir.',
        'soon.title': 'Projeniz burada olabilir', 'soon.text': 'Yeni görevlere açık.', 'soon.cta': 'Projeyi görüşelim',
        'btn.openSite': 'Siteyi aç', 'btn.wantSame': 'Aynısını istiyorum',
        'reviews.eyebrow': 'yorumlar', 'reviews.title': 'Müşteriler ne diyor',
        'reviews.sub': 'Birlikte çalıştığımız kişilerin gerçek yorumları.',
        'reviews.loading': 'Yorumlar yükleniyor…', 'reviews.empty': 'Henüz yorum yok. İlk siz olun!',
        'reviews.leaveCta': 'Yorum bırak',
        'reviews.form.title': 'Yorum bırak',
        'reviews.form.lead': 'Deneyiminizi paylaştığınız için teşekkürler! Yorum hemen sitede görünecek.',
        'reviews.form.name': 'Adınız', 'reviews.form.namePh': 'Size nasıl hitap edeyim?',
        'reviews.form.role': 'Şirket / rol (isteğe bağlı)', 'reviews.form.rolePh': 'Kafe, stüdyo, proje…',
        'reviews.form.rating': 'Puan',
        'reviews.form.text': 'Yorum metni', 'reviews.form.textPh': 'Nasıl geçtiğini anlatın',
        'reviews.form.submit': 'Yorum gönder',
        'why.eyebrow': 'avantajlar', 'why.title': 'Neden ben',
        'why1.title': 'Anahtar teslim', 'why1.desc': 'Spec\'ten hostinge.',
        'why2.title': 'Hızlı', 'why2.desc': 'Ortalama 1,5 gün.',
        'why3.title': 'Adil fiyat', 'why3.desc': 'Baştan sabit.',
        'why4.title': 'Şeffaf', 'why4.desc': 'İlerleme gösterilir.',
        'why5.title': 'Teknoloji', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'sss', 'faq.title': 'Sık sorulan sorular',
        'faq.q1': 'Site ne kadar?', 'faq.a1': 'Landing — 15 000 ₽\'den. Botlu site — 35 000 ₽\'den. Premium — 60 000 ₽\'den.',
        'faq.q2': 'Süreler?', 'faq.a2': 'Landing — 1,5 gün. Karmaşık — 3–10 gün.',
        'faq.q3': 'Benden ne gerekiyor?', 'faq.a3': 'Görev tanımı, örnekler, materyaller.',
        'faq.q4': 'Sözleşmeli çalışıyor musunuz?', 'faq.a4': 'Evet. %30–50 ön ödeme.',
        'faq.q5': 'Anahtar teslim neyi içerir?', 'faq.a5': 'Brief, tasarım, kod, responsive, backend, DB, bot, bildirimler, dağıtım, hosting.',
        'faq.q6': 'Teslim sonrası güncelleme?', 'faq.a6': 'Evet. 14 gün sonra — ücretsiz düzeltmeler.',
        'contact.eyebrow': 'talep', 'contact.title': 'Projenizi konuşalım',
        'contact.sub': 'Görevi tanımlayın — bir saat içinde yanıt.',
        'contacts.eyebrow': 'iletişim', 'contacts.title': 'Doğrudan yaz',
        'contacts.write': 'Yaz', 'contacts.open': 'Aç',
        'contacts.loc': 'Konum', 'contacts.locValue': 'Lugansk · uzaktan',
        'contacts.locNote': 'Her bölgeyle çalışırım',
        'form.name': 'İsim', 'form.namePh': 'Size nasıl hitap edeyim?',
        'form.contact': 'Telegram veya telefon', 'form.contactPh': '@username veya +7 900 000-00-00',
        'form.service': 'Ne lazım',
        'form.service.site': 'Site', 'form.service.bot': 'Telegram bot',
        'form.service.design': 'Tasarım', 'form.service.other': 'Diğer',
        'form.message': 'Görev tanımı', 'form.messagePh': 'Hangi proje, hangi işlevler, örnekler, süreler',
        'form.submit': 'Talep gönder', 'form.note': 'Tıklayarak veri işlemeyi kabul ediyorsunuz.',
        'footer.slogan': 'Web siteleri ve Telegram botları 1,5 günde anahtar teslim.',
        'footer.author': 'Vladislav', 'footer.up': 'Yukarı ↑'
      },

      zh: {
        'nav.services': '服务', 'nav.packages': '套餐', 'nav.cases': '案例',
        'nav.reviews': '评价',
        'nav.process': '工作流程', 'nav.faq': 'FAQ', 'nav.cta': '讨论项目',
        'hero.pill': '可接新项目',
        'hero.title1': '我制作网站和 Telegram 机器人',
        'hero.title2': '1.5 天交钥匙',
        'hero.sub': 'TPF Studio — 从创意到上线的独立开发。没有中间商，按时交付，有保障。',
        'hero.btn1': '讨论项目', 'hero.btn2': '查看案例',
        'stats.experience': '年经验', 'stats.projects': '交钥匙项目',
        'stats.days': '天平均', 'stats.turnkey': '交钥匙',
        'about.eyebrow': '关于我', 'about.title': '一个人，胜过整个团队',
        'about.name': '弗拉迪斯拉夫', 'about.role': '开发者，TPF Studio 创始人',
        'about.location': '卢甘斯克 · 远程',
        'about.p1': '我是 TPF Studio 的创始人和开发者。制作交钥匙网站和 Telegram 机器人。',
        'about.p2': '3.5 年来为美业和餐饮业交付项目。一个人顶一个团队。',
        'about.badge1': '远程', 'about.badge2': '签合同', 'about.badge3': '不做空气预付款',
        'services.eyebrow': '服务', 'services.title': '我做什么',
        'services.sub': '全流程：设计、代码、后端、数据库、机器人、部署。',
        's1.title': '网站开发', 's1.desc': '落地页、咖啡厅和美容院网站、企业站、商城。', 's1.price': '起 15 000 ₽',
        's2.title': 'Telegram 机器人', 's2.desc': '商店、漏斗、线索收集、管理员通知、集成。', 's2.price': '起 10 000 ₽',
        's3.title': '设计', 's3.desc': 'Logo、海报、社交媒体、UI 稿。', 's3.price': '起 5 000 ₽',
        's4.title': '集成与自动化', 's4.desc': 'Supabase / PostgreSQL、网站线索到 Telegram、webhook、部署。', 's4.price': '起 7 000 ₽',
        's5.title': '支持与更新', 's5.desc': '修复、内容更新、bug 修复。', 's5.price': '面议',
        's6.title': '找别的服务？', 's6.desc': '描述任务 — 一小时内回复。', 's6.cta': '讨论任务',
        'btn.order': '下单',
        'packages.eyebrow': '套餐', 'packages.title': '现成方案',
        'packages.sub': '固定价格和周期。',
        'popular': '热门',
        'p1.li1': '落地页 5–7 个版块', 'p1.li2': '全设备响应式', 'p1.li3': '表单发到 Telegram', 'p1.li4': 'GitHub Pages 托管', 'p1.li5': '基础 SEO', 'p1.cta': '选择 START',
        'p2.li1': '网站 10–14 个版块', 'p2.li2': 'Telegram 机器人', 'p2.li3': '数据库（Supabase / PostgreSQL）', 'p2.li4': 'Telegram 管理员通知', 'p2.li5': '机器人后台', 'p2.li6': '托管 + 部署', 'p2.cta': '选择 BUSINESS',
        'p3.price': '起 60 000 ₽', 'p3.li1': '网站 + Telegram 机器人', 'p3.li2': '集成：CRM / 支付 / Google Sheets', 'p3.li3': '扩展后台', 'p3.li4': '数据分析', 'p3.li5': '3 个月支持', 'p3.cta': '选择 PREMIUM',
        'process.eyebrow': '流程', 'process.title': '我如何工作', 'process.sub': '五个透明步骤。',
        'step1.title': '需求与规格', 'step1.desc': '讨论任务，确定周期和价格。',
        'step2.title': '原型与设计', 'step2.desc': 'Figma 稿，写代码前确认。',
        'step3.title': '开发', 'step3.desc': '代码、数据库、Telegram 机器人。',
        'step4.title': '测试', 'step4.desc': '多设备测试，修改，打磨。',
        'step5.title': '上线与交接', 'step5.desc': '部署、权限、说明书。',
        'cases.eyebrow': '案例', 'cases.title': '交钥匙项目',
        'cases.sub': '带后端、数据库和 Telegram 机器人的真实网站。现在就运行。',
        'live': 'Live · 运行中', 'days15': '1.5 天',
        'case1.p1': '美甲沙龙落地页，14 个版块：hero、服务、前后对比、作品集、美甲师、预约表单、评价、活动、FAQ、博客。',
        'case1.p2': '后端：Supabase Edge Functions。预约表单将线索保存到 PostgreSQL，Telegram 通知带 inline 按钮。',
        'case1.p3': 'Grammy Telegram 机器人：/bookings、/confirm、/cancel、/stats、/reviews、/delete_review。',
        'case2.title': '卡拉 OK 酒吧「Piramida」',
        'case2.p1': '卡拉 OK 酒吧网站：带筛选的菜单、相册、活动、评价滑块、订座表单。',
        'case2.p2': '预订：客人提交申请 → Supabase → 两位管理员都收到 Telegram 通知。',
        'case2.p3': '评价：客人打 1-5 星，立即发布，一键删除。',
        'soon.title': '你的项目可以在这里', 'soon.text': '可接新任务。', 'soon.cta': '讨论项目',
        'btn.openSite': '打开网站', 'btn.wantSame': '我也要一个',
        'reviews.eyebrow': '评价', 'reviews.title': '客户评价',
        'reviews.sub': '我们合作过的真实客户反馈。',
        'reviews.loading': '正在加载评价…', 'reviews.empty': '暂无评价。成为第一个！',
        'reviews.leaveCta': '留下评价',
        'reviews.form.title': '留下评价',
        'reviews.form.lead': '感谢您的分享！评价将立即显示在网站上。',
        'reviews.form.name': '您的姓名', 'reviews.form.namePh': '怎么称呼您？',
        'reviews.form.role': '公司 / 职位（可选）', 'reviews.form.rolePh': '咖啡厅、工作室、项目…',
        'reviews.form.rating': '评分',
        'reviews.form.text': '评价内容', 'reviews.form.textPh': '告诉我们过程如何',
        'reviews.form.submit': '发送评价',
        'why.eyebrow': '优势', 'why.title': '为什么选我',
        'why1.title': '交钥匙', 'why1.desc': '从需求到托管。',
        'why2.title': '快速', 'why2.desc': '平均 1.5 天。',
        'why3.title': '公道价格', 'why3.desc': '一开始就固定。',
        'why4.title': '透明', 'why4.desc': '展示进度。',
        'why5.title': '技术', 'why5.desc': 'HTML/CSS/JS、Supabase、Telegram Bot API。',
        'faq.eyebrow': 'faq', 'faq.title': '常见问题',
        'faq.q1': '网站多少钱？', 'faq.a1': '落地页 — 起 15 000 ₽。带机器人的网站 — 起 35 000 ₽。高级版 — 起 60 000 ₽。',
        'faq.q2': '周期？', 'faq.a2': '落地页 — 1.5 天。复杂项目 — 3 到 10 天。',
        'faq.q3': '我需要提供什么？', 'faq.a3': '任务描述、参考、素材。',
        'faq.q4': '签合同吗？', 'faq.a4': '是的。预付款 30–50%。',
        'faq.q5': '交钥匙包含什么？', 'faq.a5': '需求、设计、代码、响应式、后端、数据库、机器人、通知、部署、托管。',
        'faq.q6': '交付后还改吗？', 'faq.a6': '是的。交付后 14 天内免费修改。',
        'contact.eyebrow': '申请', 'contact.title': '讨论您的项目',
        'contact.sub': '描述任务 — 一小时内回复。',
        'contacts.eyebrow': '联系方式', 'contacts.title': '直接联系',
        'contacts.write': '写信', 'contacts.open': '打开',
        'contacts.loc': '位置', 'contacts.locValue': '卢甘斯克 · 远程',
        'contacts.locNote': '可服务任何地区',
        'form.name': '姓名', 'form.namePh': '怎么称呼您？',
        'form.contact': 'Telegram 或电话', 'form.contactPh': '@username 或 +7 900 000-00-00',
        'form.service': '需要什么',
        'form.service.site': '网站', 'form.service.bot': 'Telegram 机器人',
        'form.service.design': '设计', 'form.service.other': '其他',
        'form.message': '任务描述', 'form.messagePh': '什么项目，什么功能，参考，周期',
        'form.submit': '提交申请', 'form.note': '点击即表示同意处理数据。',
        'footer.slogan': '网站和 Telegram 机器人 1.5 天交钥匙。',
        'footer.author': '弗拉迪斯拉夫', 'footer.up': '回到顶部 ↑'
      },

      ja: {
        'nav.services': 'サービス', 'nav.packages': 'パッケージ', 'nav.cases': '実績',
        'nav.reviews': 'レビュー',
        'nav.process': '進め方', 'nav.faq': 'FAQ', 'nav.cta': 'プロジェクト相談',
        'hero.pill': '新規プロジェクト受付中',
        'hero.title1': 'ウェブサイトと Telegram ボットを作ります',
        'hero.title2': '1.5 日でターンキー',
        'hero.sub': 'TPF Studio — アイデアから公開までのソロ開発。中間業者なし、納期厳守、保証付き。',
        'hero.btn1': 'プロジェクト相談', 'hero.btn2': '実績を見る',
        'stats.experience': '年の経験', 'stats.projects': 'ターンキープロジェクト',
        'stats.days': '日平均', 'stats.turnkey': 'ターンキー',
        'about.eyebrow': '私について', 'about.title': 'チームの代わりに一人の開発者',
        'about.name': 'ウラジスラフ', 'about.role': '開発者・TPF Studio 創設者',
        'about.location': 'ルガンスク · リモート',
        'about.p1': 'TPF Studio の創設者です。ウェブサイトと Telegram ボットをターンキーで制作します。',
        'about.p2': '3.5 年間で美容と飲食業のプロジェクトを納品。一人でチーム分の仕事。',
        'about.badge1': 'リモート', 'about.badge2': '契約制', 'about.badge3': '空中前払いなし',
        'services.eyebrow': 'サービス', 'services.title': 'できること',
        'services.sub': 'フルサイクル：デザイン、コード、バックエンド、DB、ボット、デプロイ。',
        's1.title': 'ウェブサイト開発', 's1.desc': 'ランディング、カフェ・サロンサイト、コーポレート、EC。', 's1.price': '15 000 ₽〜',
        's2.title': 'Telegram ボット', 's2.desc': 'ショップ、ファネル、リード獲得、管理者通知、連携。', 's2.price': '10 000 ₽〜',
        's3.title': 'デザイン', 's3.desc': 'ロゴ、バナー、SNS、UI モックアップ。', 's3.price': '5 000 ₽〜',
        's4.title': '連携と自動化', 's4.desc': 'Supabase / PostgreSQL、サイトから Telegram へ、Webhook、デプロイ。', 's4.price': '7 000 ₽〜',
        's5.title': 'サポート・更新', 's5.desc': '修正、コンテンツ更新、バグ修正。', 's5.price': '応相談',
        's6.title': '別のことをお探しですか？', 's6.desc': 'タスクを送信 — 1 時間以内に返信します。', 's6.cta': 'タスク相談',
        'btn.order': '注文',
        'packages.eyebrow': 'パッケージ', 'packages.title': '既成プラン',
        'packages.sub': '固定価格・固定期間。',
        'popular': '人気',
        'p1.li1': 'ランディング 5–7 セクション', 'p1.li2': '全デバイス対応', 'p1.li3': 'Telegram へフォーム', 'p1.li4': 'GitHub Pages ホスティング', 'p1.li5': '基本 SEO', 'p1.cta': 'START を選ぶ',
        'p2.li1': 'サイト 10–14 セクション', 'p2.li2': 'Telegram ボット', 'p2.li3': 'データベース（Supabase / PostgreSQL）', 'p2.li4': 'Telegram 管理者通知', 'p2.li5': 'ボット管理画面', 'p2.li6': 'ホスティング + デプロイ', 'p2.cta': 'BUSINESS を選ぶ',
        'p3.price': '60 000 ₽〜', 'p3.li1': 'サイト + Telegram ボット', 'p3.li2': '連携：CRM / 決済 / Google Sheets', 'p3.li3': '拡張管理画面', 'p3.li4': 'アナリティクス', 'p3.li5': '3 ヶ月サポート', 'p3.cta': 'PREMIUM を選ぶ',
        'process.eyebrow': 'プロセス', 'process.title': '進め方', 'process.sub': '5 つの透明なステップ。',
        'step1.title': 'ヒアリングと仕様', 'step1.desc': 'タスクを話し合い、期間と価格を確定。',
        'step2.title': 'プロトタイプとデザイン', 'step2.desc': 'Figma モックアップ、コード前に承認。',
        'step3.title': '開発', 'step3.desc': 'コード、DB、Telegram ボット。',
        'step4.title': 'テスト', 'step4.desc': 'デバイステスト、修正、磨き。',
        'step5.title': '公開と引き渡し', 'step5.desc': 'デプロイ、アクセス、手順書。',
        'cases.eyebrow': '実績', 'cases.title': 'ターンキープロジェクト',
        'cases.sub': 'バックエンド、DB、Telegram ボット付きの実サイト。今動いています。',
        'live': 'Live · 稼働中', 'days15': '1.5 日',
        'case1.p1': 'ネイルサロンのランディング 14 セクション：ヒーロー、サービス、ビフォーアフター、ポートフォリオ、マスター、予約フォーム、レビュー、キャンペーン、FAQ、ブログ。',
        'case1.p2': 'バックエンド：Supabase Edge Functions。予約フォームは RLS 付き PostgreSQL にリードを保存、Telegram 通知はインラインボタン付き。',
        'case1.p3': 'Grammy Telegram ボット：/bookings、/confirm、/cancel、/stats、/reviews、/delete_review。',
        'case2.title': 'カラオケバー «Piramida»',
        'case2.p1': 'カラオケバーサイト：フィルター付きメニュー、ギャラリー、キャンペーン、レビュースライダー、予約フォーム。',
        'case2.p2': '予約：ゲストが申請 → Supabase → 両管理者に Telegram 通知。',
        'case2.p3': 'レビュー：ゲストが 1〜5 で評価。即公開、ワンタップで削除。',
        'soon.title': 'あなたのプロジェクトがここに', 'soon.text': '新規タスク受付中。', 'soon.cta': 'プロジェクト相談',
        'btn.openSite': 'サイトを開く', 'btn.wantSame': '同じのが欲しい',
        'reviews.eyebrow': 'レビュー', 'reviews.title': 'お客様の声',
        'reviews.sub': '一緒に仕事をした方々の実際のレビュー。',
        'reviews.loading': 'レビューを読み込み中…', 'reviews.empty': 'まだレビューはありません。最初の一人になりましょう！',
        'reviews.leaveCta': 'レビューを書く',
        'reviews.form.title': 'レビューを書く',
        'reviews.form.lead': 'ご感想をありがとうございます！レビューはすぐにサイトに表示されます。',
        'reviews.form.name': 'お名前', 'reviews.form.namePh': '何とお呼びすれば？',
        'reviews.form.role': '会社 / 役割（任意）', 'reviews.form.rolePh': 'カフェ、スタジオ、プロジェクト…',
        'reviews.form.rating': '評価',
        'reviews.form.text': 'レビュー本文', 'reviews.form.textPh': 'どうだったか教えてください',
        'reviews.form.submit': 'レビューを送信',
        'why.eyebrow': '強み', 'why.title': 'なぜ私',
        'why1.title': 'ターンキー', 'why1.desc': '仕様からホスティングまで。',
        'why2.title': '速い', 'why2.desc': '平均 1.5 日。',
        'why3.title': '公正な価格', 'why3.desc': '最初から固定。',
        'why4.title': '透明', 'why4.desc': '進捗を表示。',
        'why5.title': '技術', 'why5.desc': 'HTML/CSS/JS、Supabase、Telegram Bot API。',
        'faq.eyebrow': 'faq', 'faq.title': 'よくある質問',
        'faq.q1': 'サイトはいくら？', 'faq.a1': 'ランディング — 15 000 ₽〜。ボット付きサイト — 35 000 ₽〜。プレミアム — 60 000 ₽〜。',
        'faq.q2': '期間は？', 'faq.a2': 'ランディング — 1.5 日。複雑なプロジェクト — 3〜10 日。',
        'faq.q3': '私が用意するもの？', 'faq.a3': 'タスク説明、参考サイト、素材。',
        'faq.q4': '契約は？', 'faq.a4': 'はい。前払い 30〜50%。',
        'faq.q5': 'ターンキーに含まれるもの？', 'faq.a5': 'ヒアリング、デザイン、コード、レスポンシブ、バックエンド、DB、ボット、通知、デプロイ、ホスティング。',
        'faq.q6': '納品後の修正は？', 'faq.a6': 'はい。納品後 14 日以内は無料修正。',
        'contact.eyebrow': '申請', 'contact.title': 'プロジェクトを話しましょう',
        'contact.sub': 'タスクを送信 — 1 時間以内に返信。',
        'contacts.eyebrow': '連絡先', 'contacts.title': '直接連絡',
        'contacts.write': '書く', 'contacts.open': '開く',
        'contacts.loc': '場所', 'contacts.locValue': 'ルガンスク · リモート',
        'contacts.locNote': 'どの地域でも対応',
        'form.name': 'お名前', 'form.namePh': '何とお呼びすれば？',
        'form.contact': 'Telegram か電話', 'form.contactPh': '@username または +7 900 000-00-00',
        'form.service': '必要なもの',
        'form.service.site': 'ウェブサイト', 'form.service.bot': 'Telegram ボット',
        'form.service.design': 'デザイン', 'form.service.other': 'その他',
        'form.message': 'タスク説明', 'form.messagePh': 'どんなプロジェクト、機能、参考、期間',
        'form.submit': '送信', 'form.note': 'クリックでデータ処理に同意します。',
        'footer.slogan': 'ウェブサイトと Telegram ボットを 1.5 日でターンキー。',
        'footer.author': 'ウラジスラフ', 'footer.up': '上へ ↑'
      },

      ko: {
        'nav.services': '서비스', 'nav.packages': '패키지', 'nav.cases': '포트폴리오',
        'nav.reviews': '리뷰',
        'nav.process': '작업 방식', 'nav.faq': 'FAQ', 'nav.cta': '프로젝트 논의',
        'hero.pill': '새 프로젝트 가능',
        'hero.title1': '웹사이트와 Telegram 봇을 만듭니다',
        'hero.title2': '1.5일 만에 턴키',
        'hero.sub': 'TPF Studio — 아이디어부터 출시까지 솔로 개발. 중간상인 없이, 정시에, 보장과 함께.',
        'hero.btn1': '프로젝트 논의', 'hero.btn2': '포트폴리오 보기',
        'stats.experience': '년 경력', 'stats.projects': '턴키 프로젝트',
        'stats.days': '일 평균', 'stats.turnkey': '턴키',
        'about.eyebrow': '소개', 'about.title': '팀 대신 한 명의 개발자',
        'about.name': '블라디슬라프', 'about.role': '개발자 · TPF Studio 창립자',
        'about.location': '루간스크 · 원격',
        'about.p1': 'TPF Studio의 창립자입니다. 웹사이트와 Telegram 봇을 턴키로 만듭니다.',
        'about.p2': '3.5년 동안 뷰티와 외식업 프로젝트를 납품했습니다. 한 명이 팀을 대신합니다.',
        'about.badge1': '원격', 'about.badge2': '계약제', 'about.badge3': '공중 선금 없음',
        'services.eyebrow': '서비스', 'services.title': '하는 일',
        'services.sub': '풀 사이클: 디자인, 코드, 백엔드, DB, 봇, 배포.',
        's1.title': '웹사이트 개발', 's1.desc': '랜딩, 카페·살롱 사이트, 기업, 쇼핑몰.', 's1.price': '15 000 ₽부터',
        's2.title': 'Telegram 봇', 's2.desc': '상점, 퍼널, 리드 수집, 관리자 알림, 통합.', 's2.price': '10 000 ₽부터',
        's3.title': '디자인', 's3.desc': '로고, 배너, SNS, UI 목업.', 's3.price': '5 000 ₽부터',
        's4.title': '통합과 자동화', 's4.desc': 'Supabase / PostgreSQL, 사이트에서 Telegram으로, 웹훅, 배포.', 's4.price': '7 000 ₽부터',
        's5.title': '지원과 업데이트', 's5.desc': '수정, 콘텐츠 업데이트, 버그 수정.', 's5.price': '협의',
        's6.title': '다른 게 필요하세요?', 's6.desc': '작업을 설명하세요 — 1시간 안에 답변.', 's6.cta': '작업 논의',
        'btn.order': '주문',
        'packages.eyebrow': '패키지', 'packages.title': '준비된 플랜',
        'packages.sub': '고정 가격과 기간.',
        'popular': '인기',
        'p1.li1': '랜딩 5–7 섹션', 'p1.li2': '모든 기기 반응형', 'p1.li3': 'Telegram으로 폼', 'p1.li4': 'GitHub Pages 호스팅', 'p1.li5': '기본 SEO', 'p1.cta': 'START 선택',
        'p2.li1': '사이트 10–14 섹션', 'p2.li2': 'Telegram 봇', 'p2.li3': '데이터베이스 (Supabase / PostgreSQL)', 'p2.li4': 'Telegram 관리자 알림', 'p2.li5': '봇 관리자 패널', 'p2.li6': '호스팅 + 배포', 'p2.cta': 'BUSINESS 선택',
        'p3.price': '60 000 ₽부터', 'p3.li1': '사이트 + Telegram 봇', 'p3.li2': '통합: CRM / 결제 / Google Sheets', 'p3.li3': '확장 관리자 패널', 'p3.li4': '분석', 'p3.li5': '3개월 지원', 'p3.cta': 'PREMIUM 선택',
        'process.eyebrow': '프로세스', 'process.title': '작업 방식', 'process.sub': '5가지 투명한 단계.',
        'step1.title': '브리프와 스펙', 'step1.desc': '작업을 논의하고 기간과 가격을 확정.',
        'step2.title': '프로토타입과 디자인', 'step2.desc': 'Figma 목업, 코드 전에 승인.',
        'step3.title': '개발', 'step3.desc': '코드, DB, Telegram 봇.',
        'step4.title': '테스트', 'step4.desc': '기기 테스트, 수정, 다듬기.',
        'step5.title': '출시와 인도', 'step5.desc': '배포, 접근 권한, 안내서.',
        'cases.eyebrow': '포트폴리오', 'cases.title': '턴키 프로젝트',
        'cases.sub': '백엔드, DB, Telegram 봇이 있는 실제 사이트. 지금 작동 중.',
        'live': 'Live · 작동 중', 'days15': '1.5일',
        'case1.p1': '네일 스튜디오 랜딩 14 섹션: 히어로, 서비스, 전후 슬라이더, 포트폴리오, 마스터, 예약 폼, 리뷰, 프로모션, FAQ, 블로그.',
        'case1.p2': '백엔드: Supabase Edge Functions. 예약 폼은 RLS가 있는 PostgreSQL에 리드를 저장, Telegram 알림은 인라인 버튼 포함.',
        'case1.p3': 'Grammy Telegram 봇: /bookings, /confirm, /cancel, /stats, /reviews, /delete_review.',
        'case2.title': '노래방 바 «Piramida»',
        'case2.p1': '노래방 바 사이트: 필터 메뉴, 갤러리, 프로모션, 리뷰 슬라이더, 예약 폼.',
        'case2.p2': '예약: 손님이 요청 → Supabase → 두 관리자에게 Telegram 알림.',
        'case2.p3': '리뷰: 손님이 1~5점 평가. 즉시 게시, 원터치 삭제.',
        'soon.title': '당신의 프로젝트가 여기에', 'soon.text': '새 작업 가능.', 'soon.cta': '프로젝트 논의',
        'btn.openSite': '사이트 열기', 'btn.wantSame': '같은 것 원함',
        'reviews.eyebrow': '리뷰', 'reviews.title': '고객 후기',
        'reviews.sub': '함께 일한 분들의 실제 후기.',
        'reviews.loading': '리뷰 로딩 중…', 'reviews.empty': '아직 리뷰가 없습니다. 첫 번째가 되세요!',
        'reviews.leaveCta': '리뷰 남기기',
        'reviews.form.title': '리뷰 남기기',
        'reviews.form.lead': '경험을 공유해 주셔서 감사합니다! 리뷰는 즉시 사이트에 표시됩니다.',
        'reviews.form.name': '이름', 'reviews.form.namePh': '어떻게 불러드릴까요?',
        'reviews.form.role': '회사 / 역할 (선택)', 'reviews.form.rolePh': '카페, 스튜디오, 프로젝트…',
        'reviews.form.rating': '평점',
        'reviews.form.text': '리뷰 내용', 'reviews.form.textPh': '어떻게 진행됐는지 알려주세요',
        'reviews.form.submit': '리뷰 보내기',
        'why.eyebrow': '장점', 'why.title': '왜 나인가',
        'why1.title': '턴키', 'why1.desc': '스펙에서 호스팅까지.',
        'why2.title': '빠름', 'why2.desc': '평균 1.5일.',
        'why3.title': '공정 가격', 'why3.desc': '처음부터 고정.',
        'why4.title': '투명', 'why4.desc': '진행 상황 공개.',
        'why5.title': '기술', 'why5.desc': 'HTML/CSS/JS, Supabase, Telegram Bot API.',
        'faq.eyebrow': 'faq', 'faq.title': '자주 묻는 질문',
        'faq.q1': '사이트 가격은?', 'faq.a1': '랜딩 — 15 000 ₽부터. 봇 포함 사이트 — 35 000 ₽부터. 프리미엄 — 60 000 ₽부터.',
        'faq.q2': '기간은?', 'faq.a2': '랜딩 — 1.5일. 복잡한 프로젝트 — 3~10일.',
        'faq.q3': '제가 준비할 것은?', 'faq.a3': '작업 설명, 예시, 자료.',
        'faq.q4': '계약하나요?', 'faq.a4': '네. 선금 30~50%.',
        'faq.q5': '턴키에 포함된 것은?', 'faq.a5': '브리프, 디자인, 코드, 반응형, 백엔드, DB, 봇, 알림, 배포, 호스팅.',
        'faq.q6': '납품 후 수정?', 'faq.a6': '네. 납품 후 14일 내 무료 수정.',
        'contact.eyebrow': '신청', 'contact.title': '프로젝트를 논의합시다',
        'contact.sub': '작업을 설명하세요 — 1시간 내 답변.',
        'contacts.eyebrow': '연락처', 'contacts.title': '직접 연락',
        'contacts.write': '쓰기', 'contacts.open': '열기',
        'contacts.loc': '위치', 'contacts.locValue': '루간스크 · 원격',
        'contacts.locNote': '모든 지역과 작업',
        'form.name': '이름', 'form.namePh': '어떻게 불러드릴까요?',
        'form.contact': 'Telegram 또는 전화', 'form.contactPh': '@username 또는 +7 900 000-00-00',
        'form.service': '무엇이 필요하세요',
        'form.service.site': '웹사이트', 'form.service.bot': 'Telegram 봇',
        'form.service.design': '디자인', 'form.service.other': '기타',
        'form.message': '작업 설명', 'form.messagePh': '어떤 프로젝트, 기능, 예시, 기간',
        'form.submit': '신청 보내기', 'form.note': '클릭하면 데이터 처리에 동의합니다.',
        'footer.slogan': '웹사이트와 Telegram 봇을 1.5일에 턴키로.',
        'footer.author': '블라디슬라프', 'footer.up': '위로 ↑'
      }
    };

    /* Снимок RU */
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(function (el) {
      if (!el.dataset.i18nRu) el.dataset.i18nRu = el.textContent;
    });
    const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
    i18nPlaceholders.forEach(function (el) {
      if (!el.dataset.i18nRuPlaceholder) el.dataset.i18nRuPlaceholder = el.placeholder || '';
    });

    function applyLang(lang) {
      const dict = translations[lang] || translations.en;
      const isRu = lang === 'ru';
      html.setAttribute('lang', lang);

      i18nElements.forEach(function (el) {
        const key = el.dataset.i18n;
        if (isRu) el.textContent = el.dataset.i18nRu;
        else el.textContent = (dict[key] != null) ? dict[key] : el.dataset.i18nRu;
      });
      i18nPlaceholders.forEach(function (el) {
        const key = el.dataset.i18nPlaceholder;
        if (isRu) el.placeholder = el.dataset.i18nRuPlaceholder;
        else el.placeholder = (dict[key] != null) ? dict[key] : el.dataset.i18nRuPlaceholder;
      });

      if (current) current.textContent = lang.toUpperCase();
      items.forEach(function (it) {
        const active = it.dataset.lang === lang;
        it.classList.toggle('is-active', active);
        it.setAttribute('aria-selected', String(active));
      });

      try { localStorage.setItem('tpf-lang', lang); } catch (e) {}

      if (lang === 'ar') html.setAttribute('dir', 'rtl');
      else html.removeAttribute('dir');
    }

    function openMenu() { menu.hidden = false; root.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
    function closeMenuFn() { menu.hidden = true; root.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    function toggleLangMenu() { if (menu.hidden) openMenu(); else closeMenuFn(); }

    trigger.addEventListener('click', function (e) { e.stopPropagation(); toggleLangMenu(); });
    items.forEach(function (btn) {
      btn.addEventListener('click', function () { applyLang(btn.dataset.lang); closeMenuFn(); });
    });
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) closeMenuFn(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { closeMenuFn(); trigger.focus(); }
    });

    let savedLang = 'ru';
    try { savedLang = localStorage.getItem('tpf-lang') || 'ru'; } catch (e) {}
    applyLang(savedLang);
  })();

  /* ═══════════════════════════════════════════════════════
     13. ОТЗЫВЫ — Cloudflare Worker + D1
     ═══════════════════════════════════════════════════════ */
  (function initReviews() {
    const REVIEWS_URL = WORKER_URL + '/reviews';
    const SUBMIT_URL  = WORKER_URL + '/submit-review';

    const grid     = document.getElementById('reviewsGrid');
    const avgEl    = document.getElementById('reviewsAvg');
    const avgStars = document.getElementById('reviewsAvgStars');
    const countEl  = document.getElementById('reviewsCount');
    const modal    = document.getElementById('reviewModal');
    const openBtn  = document.getElementById('openReviewModal');
    const form     = document.getElementById('reviewForm');
    const statusEl = document.getElementById('reviewStatus');
    const ratingIn = document.getElementById('ratingInput');
    const ratingVal= document.getElementById('rv-rating');

    if (!grid) return;

    function avatarColor(name) {
      const palette = ['#4F46E5','#7C3AED','#EC4899','#F59E0B','#10B981','#06B6D4','#EF4444'];
      let h = 0;
      for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
      return palette[Math.abs(h) % palette.length];
    }

    function escapeHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function formatDate(iso) {
      try {
        return new Date(iso).toLocaleDateString(document.documentElement.lang || 'ru-RU', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
      } catch (e) { return ''; }
    }

    async function loadReviews() {
      try {
        const res = await fetch(REVIEWS_URL);
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || 'Ошибка');
        renderReviews(json.reviews || []);
      } catch (e) {
        console.error('[TPF] Ошибка загрузки отзывов:', e);
        if (countEl) countEl.textContent = 'Отзывы временно недоступны';
      }
    }

    function renderReviews(list) {
      if (list.length) {
        const avg = list.reduce((s, r) => s + Number(r.rating || 0), 0) / list.length;
        const rounded = Math.round(avg);
        if (avgEl) avgEl.textContent = avg.toFixed(1);
        if (avgStars) avgStars.textContent = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
        if (countEl) countEl.textContent = list.length + ' отзыв' + (list.length % 10 === 1 && list.length % 100 !== 11 ? '' : (list.length % 10 >= 2 && list.length % 10 <= 4 && (list.length % 100 < 12 || list.length % 100 > 14) ? 'а' : 'ов'));
      } else {
        if (avgEl) avgEl.textContent = '—';
        if (avgStars) avgStars.textContent = '☆☆☆☆☆';
        if (countEl) countEl.textContent = 'Пока нет отзывов';
      }

      grid.innerHTML = '';
      if (!list.length) {
        grid.innerHTML = '<p class="reviews-empty">Пока отзывов нет. Будьте первым!</p>';
        return;
      }

      list.forEach(r => {
        const rating = Math.max(1, Math.min(5, Number(r.rating) || 5));
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const initial = (r.name || '?').trim().charAt(0).toUpperCase();
        const color = avatarColor(r.name || '?');

        const el = document.createElement('article');
        el.className = 'review-card';
        el.innerHTML =
          '<div class="review-card__head">' +
            '<div class="review-avatar" style="background:' + color + '">' + escapeHtml(initial) + '</div>' +
            '<div class="review-card__meta">' +
              '<b>' + escapeHtml(r.name) + '</b>' +
              '<small>' + (r.role ? escapeHtml(r.role) : formatDate(r.created_at)) + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="review-card__stars">' + stars + '</div>' +
          '<p class="review-card__text">' + escapeHtml(r.text) + '</p>';
        grid.appendChild(el);
      });
    }

    // ---- Модалка ----
    function openModal() {
      if (!modal) return;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      setTimeout(() => form && form.querySelector('#rv-name')?.focus(), 50);
    }
    function closeModal() {
      if (!modal) return;
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    openBtn?.addEventListener('click', openModal);
    modal?.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });

    // ---- Звёзды ----
    if (ratingIn && ratingVal) {
      const stars = ratingIn.querySelectorAll('.rating-star');
      function setRating(v) {
        ratingVal.value = v;
        stars.forEach(s => s.classList.toggle('is-active', +s.dataset.value <= v));
      }
      stars.forEach(s => {
        const v = +s.dataset.value;
        s.addEventListener('click', () => setRating(v));
        s.addEventListener('mouseenter', () => stars.forEach(x => x.classList.toggle('is-hover', +x.dataset.value <= v)));
      });
      ratingIn.addEventListener('mouseleave', () => stars.forEach(x => x.classList.remove('is-hover')));
    }

    // ---- Форма отзыва ----
    if (form) {
      function setError(input, msg) {
        const g = input.closest('.form-group');
        if (!g) return;
        g.classList.toggle('has-error', Boolean(msg));
        const e = g.querySelector('.form-error');
        if (e) e.textContent = msg || '';
      }
      function setFormStatus(t, type) {
        if (!statusEl) return;
        statusEl.textContent = t;
        statusEl.classList.remove('is-success', 'is-error');
        if (type) statusEl.classList.add('is-' + type);
      }

      form.addEventListener('submit', async e => {
        e.preventDefault();
        const name = form.querySelector('#rv-name');
        const text = form.querySelector('#rv-text');
        const hp   = form.querySelector('[name="tpf_rev_hp"]');

        if (hp && hp.value.trim() !== '') return;

        let ok = true;
        if (!name.value.trim() || name.value.trim().length < 2) { setError(name, 'Укажите имя'); ok = false; } else setError(name, '');
        if (!ratingVal.value || +ratingVal.value < 1) { setError(ratingIn || ratingVal, 'Поставьте оценку'); ok = false; }
        if (!text.value.trim() || text.value.trim().length < 10) { setError(text, 'Текст минимум 10 символов'); ok = false; } else setError(text, '');
        if (!ok) return;

        const btn = form.querySelector('#reviewSubmit');
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Отправляем…';
        setFormStatus('', null);

        const payload = {
          name: name.value.trim(),
          role: (form.querySelector('#rv-role')?.value || '').trim(),
          rating: +ratingVal.value,
          text: text.value.trim(),
          honeypot: hp ? hp.value : ''
        };

        try {
          const res = await fetch(SUBMIT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (!res.ok || json.ok === false) throw new Error(json.error || 'Ошибка');
          setFormStatus('✅ Спасибо! Отзыв опубликован.', 'success');
          form.reset();
          if (ratingIn) ratingIn.querySelectorAll('.rating-star').forEach(s => s.classList.remove('is-active'));
          if (ratingVal) ratingVal.value = '';
          loadReviews();
          setTimeout(closeModal, 2200);
        } catch (err) {
          console.error('[TPF] Review error:', err);
          setFormStatus('❌ ' + (err.message || 'Не удалось отправить'), 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = original;
        }
      });
    }

    loadReviews();
  })();

})();