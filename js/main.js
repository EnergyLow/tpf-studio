(function () {
  'use strict';

  /* Cloudflare Worker — прокси для формы и отзывов */
  const WORKER_URL = 'https://tpf-form.energylowlnr.workers.dev';

    /* 0. PRELOADER */
  (function initPreloader() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloaderBar');
    const percentText = document.getElementById('preloaderPercent');
    const statusText = document.getElementById('preloaderText');
    
    if (!preloader) return;

    document.body.classList.add('is-loading');

    // Длительность загрузки (в миллисекундах). 6000 = 6 секунд.
    const duration = 6000; 
    const startTime = performance.now();
    
    // Тексты, которые будут меняться
    const statuses = [
      { p: 0, text: 'Инициализация ядра...' },
      { p: 25, text: 'Загрузка интерфейса...' },
      { p: 50, text: 'Подключение модулей...' },
      { p: 75, text: 'Синхронизация данных...' },
      { p: 95, text: 'Почти готово...' }
    ];

    function updateProgress(currentTime) {
      const elapsed = currentTime - startTime;
      let progress = Math.min((elapsed / duration) * 100, 100);
      
      // Чтобы прогресс не шел идеально ровно (выглядит реалистичнее)
      if (progress < 99) {
         // Небольшая задержка в середине процесса
         if (progress > 40 && progress < 60) {
             progress = 40 + (progress - 40) * 0.5;
         }
      }

      const displayProgress = Math.floor(progress);
      
      if (bar) bar.style.width = displayProgress + '%';
      if (percentText) percentText.textContent = displayProgress + '%';

      // Меняем текст
      if (statusText) {
        const currentStatus = statuses.slice().reverse().find(s => displayProgress >= s.p);
        if (currentStatus) statusText.textContent = currentStatus.text;
      }

      if (progress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Когда 100% — прячем
        setTimeout(() => {
          preloader.classList.add('is-hidden');
          document.body.classList.remove('is-loading');
          
          // Удаляем из DOM через 1 сек (после анимации исчезновения)
          setTimeout(() => preloader.remove(), 1000);
        }, 500); // Небольшая пауза на 100%
      }
    }

    // Запускаем
    requestAnimationFrame(updateProgress);
  })();

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
        setStatus('❌ Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram: @TPF_69', 'error');
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
     12. ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА
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
        'nav.reviews': 'Reviews', 'nav.process': 'Process', 'nav.faq': 'FAQ', 'nav.cta': 'Discuss a project',
        'hero.pill': 'Available for new projects', 'hero.title1': 'I build websites and Telegram bots', 'hero.title2': 'turnkey in 1.5 days',
        'hero.sub': 'TPF Studio — solo development from idea to launch. No middlemen, no missed deadlines, guaranteed.',
        'hero.btn1': 'Discuss a project', 'hero.btn2': 'View cases',
        'stats.experience': 'years of experience', 'stats.projects': 'projects turnkey', 'stats.days': 'days average', 'stats.turnkey': 'turnkey',
        'about.eyebrow': 'about me', 'about.title': 'One developer instead of a whole team',
        'about.name': 'Vladislav', 'about.role': 'Developer & founder of TPF Studio', 'about.location': 'Lugansk · remote worldwide',
        'about.p1': 'I am a developer and founder of TPF Studio. I build websites and Telegram bots turnkey: brief to launch, database, notifications, hosting.',
        'about.p2': 'Over 3.5 years I delivered projects for beauty and HoReCa. One person instead of a whole team.',
        'about.badge1': 'Remote', 'about.badge2': 'Contracted', 'about.badge3': 'No air prepayment',
        'services.eyebrow': 'services', 'services.title': 'What I do',
        'services.sub': 'Full cycle: design, markup, backend, database, bots and deploy. Fixed price before start.',
        's1.title': 'Website development', 's1.desc': 'Landings, cafe and salon sites, corporate, e-commerce. Responsive, SEO, analytics.', 's1.price': 'from 15 000 ₽',
        's2.title': 'Telegram bots', 's2.desc': 'Shops, funnels, lead capture, admin notifications, integrations.', 's2.price': 'from 10 000 ₽',
        's4.title': 'Integrations & automation', 's4.desc': 'Supabase / PostgreSQL, website leads to Telegram, webhooks, deploy.', 's4.price': 'from 7 000 ₽',
        'guarantee1.title': 'Official contract', 'guarantee1.desc': 'We fix the scope of work, deadlines and cost.',
        'guarantee2.title': 'Fixed price', 'guarantee2.desc': 'The cost will not change during the process. No surcharges.',
        'guarantee3.title': 'Free edits', 'guarantee3.desc': '14 days after project delivery I make edits for free.',
        'reviews.eyebrow': 'reviews', 'reviews.title': 'What clients say', 'reviews.loading': 'Loading reviews…', 'reviews.leaveCta': 'Leave a review',
        'faq.eyebrow': 'faq', 'faq.title': 'Frequent questions',
        'faq.q1': 'How much does a website cost?', 'faq.a1': 'Landing 5–7 sections — from 15 000 ₽. Site 10–14 sections with bot and DB — from 35 000 ₽. Premium — from 60 000 ₽.',
        'faq.q2': 'What about timelines?', 'faq.a2': 'Average landing — 1.5 days. Complex projects with bot, DB, integrations — 3 to 10 days.',
        'faq.q3': 'What do you need from me?', 'faq.a3': 'Task description, example sites, materials. If missing, I will tell you what to prepare.',
        'faq.q4': 'Do you work with a contract?', 'faq.a4': 'Yes, contracted. Prepayment 30–50%. Rest — after delivery.',
        'faq.q5': 'What is included in turnkey?', 'faq.a5': 'Brief & spec, design, markup, responsive, backend, database, Telegram bot, notifications, deploy, hosting.',
        'faq.q6': 'Do you make updates after delivery?', 'faq.a6': 'Yes. 14 days after delivery — free fixes within the spec.',
        'contact.eyebrow': 'request', 'contact.title': 'Let us discuss your project', 'contact.sub': 'Describe your task — I will reply within an hour with an exact price and timeline.',
        'contacts.phone': 'Phone', 'contacts.loc': 'Location', 'contacts.locValue': 'Lugansk · remote worldwide', 'contacts.locNote': 'Working with clients from any region',
        'form.name': 'Name', 'form.namePh': 'What should I call you?', 'form.contact': 'Telegram or phone', 'form.contactPh': '@username or +7 900 000-00-00',
        'form.service': 'What do you need', 'form.service.site': 'Website', 'form.service.bot': 'Telegram bot', 'form.service.design': 'Design', 'form.service.other': 'Other',
        'form.message': 'Task description', 'form.messagePh': 'What project, functionality, examples, deadlines', 'form.submit': 'Send request', 'form.note': 'By clicking, you agree to data processing for the response.',
        'footer.slogan': 'Websites and Telegram bots turnkey in 1.5 days.', 'footer.author': 'Vladislav', 'footer.up': 'Back to top ↑'
      },
      uk: {
        'nav.services': 'Послуги', 'nav.packages': 'Пакети', 'nav.cases': 'Кейси', 'nav.reviews': 'Відгуки', 'nav.process': 'Як працюю', 'nav.faq': 'FAQ', 'nav.cta': 'Обговорити проєкт',
        'hero.pill': 'Доступний для нових проєктів', 'hero.title1': 'Створюю сайти та Telegram-ботів', 'hero.title2': 'під ключ за 1,5 дня',
        'hero.sub': 'TPF Studio — соло-розробка від ідеї до запуску. Без посередників, без затягування термінів, з гарантією.', 'hero.btn1': 'Обговорити проєкт', 'hero.btn2': 'Подивитись кейси',
        'stats.experience': 'роки досвіду', 'stats.projects': 'проєкти під ключ', 'stats.days': 'дні середній термін', 'stats.turnkey': 'під ключ',
        'about.eyebrow': 'про мене', 'about.title': 'Один розробник замість цілої команди', 'about.name': 'Владислав', 'about.role': 'Розробник і засновник TPF Studio', 'about.location': 'Луганськ · віддалено по всьому світу',
        'about.p1': 'Я розробник і засновник TPF Studio. Роблю сайти та Telegram-ботів під ключ: від брифу до запуску, БД, сповіщень, хостингу.', 'about.p2': 'За 3,5 роки реалізував проєкти для б\'юті та HoReCa. Одна людина замість цілої команди.',
        'about.badge1': 'Віддалено', 'about.badge2': 'За договором', 'about.badge3': 'Без передоплати за повітря',
        'services.eyebrow': 'послуги', 'services.title': 'Що я роблю', 'services.sub': 'Повний цикл: дизайн, верстка, бекенд, БД, боти, деплой. Ціна фіксується до старту.',
        's1.title': 'Розробка сайтів', 's1.desc': 'Лендінги, сайти кафе і салонів, корпоративні, магазини. Адаптив, SEO, аналітика.', 's1.price': 'від 15 000 ₽',
        's2.title': 'Telegram-боти', 's2.desc': 'Магазини, автоворонки, прийом заявок, сповіщення адміну, інтеграції.', 's2.price': 'від 10 000 ₽',
        's4.title': 'Інтеграції та автоматизація', 's4.desc': 'Supabase / PostgreSQL, заявки з сайту в Telegram, вебхуки, деплой.', 's4.price': 'від 7 000 ₽',
        'guarantee1.title': 'Офіційний договір', 'guarantee1.desc': 'Фіксуємо обсяг робіт, терміни та вартість.',
        'guarantee2.title': 'Фіксована ціна', 'guarantee2.desc': 'Вартість не зміниться в процесі. Без доплат.',
        'guarantee3.title': 'Безкоштовні правки', 'guarantee3.desc': '14 днів після здачі проєкту вношу правки безкоштовно.',
        'reviews.eyebrow': 'відгуки', 'reviews.title': 'Що кажуть клієнти', 'reviews.loading': 'Завантажуємо відгуки…', 'reviews.leaveCta': 'Залишити відгук',
        'faq.eyebrow': 'faq', 'faq.title': 'Часті питання',
        'faq.q1': 'Скільки коштує сайт?', 'faq.a1': 'Лендінг — від 15 000 ₽. Сайт з ботом — від 35 000 ₽. Преміум — від 60 000 ₽.',
        'faq.q2': 'Які терміни?', 'faq.a2': 'Лендінг — 1,5 дня. Складні проєкти — 3–10 днів.',
        'faq.q3': 'Що потрібно від мене?', 'faq.a3': 'Опис задачі, приклади, матеріали.',
        'faq.q4': 'Працюєш за договором?', 'faq.a4': 'Так. Передоплата 30–50%.',
        'faq.q5': 'Що входить у «під ключ»?', 'faq.a5': 'Бриф, дизайн, верстка, адаптив, backend, БД, бот, сповіщення, деплой, хостинг.',
        'faq.q6': 'Робиш доробки?', 'faq.a6': 'Так. 14 днів після здачі — безкоштовно.',
        'contact.eyebrow': 'заявка', 'contact.title': 'Обговоримо ваш проєкт', 'contact.sub': 'Опишіть задачу — відповім протягом години.',
        'contacts.phone': 'Телефон', 'contacts.loc': 'Локація', 'contacts.locValue': 'Луганськ · віддалено', 'contacts.locNote': 'Працюю з будь-якого регіону',
        'form.name': 'Ім\'я', 'form.namePh': 'Як до вас звертатися?', 'form.contact': 'Telegram або телефон', 'form.contactPh': '@username або +7 900 000-00-00',
        'form.service': 'Що потрібно', 'form.service.site': 'Сайт', 'form.service.bot': 'Telegram-бот', 'form.service.design': 'Дизайн', 'form.service.other': 'Інше',
        'form.message': 'Опис задачі', 'form.messagePh': 'Що за проєкт, функціонал, приклади, терміни', 'form.submit': 'Надіслати заявку', 'form.note': 'Натискаючи, ви погоджуєтесь на обробку даних.',
        'footer.slogan': 'Сайти та Telegram-боти під ключ за 1,5 дня.', 'footer.author': 'Владислав', 'footer.up': 'Догори ↑'
      },
      pl: {
        'nav.services': 'Usługi', 'nav.packages': 'Pakiety', 'nav.cases': 'Portfolio', 'nav.reviews': 'Opinie', 'nav.process': 'Jak pracuję', 'nav.faq': 'FAQ', 'nav.cta': 'Omów projekt',
        'hero.pill': 'Dostępny dla nowych projektów', 'hero.title1': 'Tworzę strony i boty Telegram', 'hero.title2': 'pod klucz w 1,5 dnia',
        'hero.sub': 'TPF Studio — samodzielny rozwój od pomysłu do startu. Bez pośredników, terminowo, z gwarancją.', 'hero.btn1': 'Omów projekt', 'hero.btn2': 'Zobacz portfolio',
        'stats.experience': 'lata doświadczenia', 'stats.projects': 'projekty pod klucz', 'stats.days': 'dni średni czas', 'stats.turnkey': 'pod klucz',
        'about.eyebrow': 'o mnie', 'about.title': 'Jeden deweloper zamiast całego zespołu', 'about.name': 'Władysław', 'about.role': 'Deweloper i założyciel TPF Studio', 'about.location': 'Ługańsk · zdalnie',
        'about.p1': 'Jestem deweloperem i założycielem TPF Studio. Tworzę strony i boty Telegram pod klucz.', 'about.p2': 'Przez 3,5 roku realizowałem projekty dla beauty i HoReCa. Jedna osoba zamiast zespołu.',
        'about.badge1': 'Zdalnie', 'about.badge2': 'Umowa', 'about.badge3': 'Bez przedpłaty za nic',
        'services.eyebrow': 'usługi', 'services.title': 'Co robię', 'services.sub': 'Pełny cykl: design, kod, backend, baza danych, boty, deploy. Cena ustalana przed startem.',
        's1.title': 'Tworzenie stron', 's1.desc': 'Landingi, strony kawiarni i salonów, korporacyjne, sklepy.', 's1.price': 'od 15 000 ₽',
        's2.title': 'Boty Telegram', 's2.desc': 'Sklepy, lejki, zbieranie leadów, powiadomienia dla admina, integracje.', 's2.price': 'od 10 000 ₽',
        's4.title': 'Integracje i automatyzacja', 's4.desc': 'Supabase / PostgreSQL, leady do Telegram, webhooki, deploy.', 's4.price': 'od 7 000 ₽',
        'guarantee1.title': 'Oficjalna umowa', 'guarantee1.desc': 'Ustalamy zakres prac, terminy i koszty.',
        'guarantee2.title': 'Stała cena', 'guarantee2.desc': 'Koszt nie zmieni się w trakcie. Bez dopłat.',
        'guarantee3.title': 'Darmowe poprawki', 'guarantee3.desc': '14 dni po oddaniu projektu wprowadzam poprawki za darmo.',
        'reviews.eyebrow': 'opinie', 'reviews.title': 'Co mówią klienci', 'reviews.loading': 'Ładujemy opinie…', 'reviews.leaveCta': 'Zostaw opinię',
        'faq.eyebrow': 'faq', 'faq.title': 'Częste pytania',
        'faq.q1': 'Ile kosztuje strona?', 'faq.a1': 'Landing — od 15 000 ₽. Strona z botem — od 35 000 ₽. Premium — od 60 000 ₽.',
        'faq.q2': 'Jakie terminy?', 'faq.a2': 'Landing — 1,5 dnia. Złożone projekty — 3–10 dni.',
        'faq.q3': 'Co jest potrzebne ode mnie?', 'faq.a3': 'Opis zadania, przykłady, materiały.',
        'faq.q4': 'Pracujesz na umowę?', 'faq.a4': 'Tak. Przedpłata 30–50%.',
        'faq.q5': 'Co zawiera „pod klucz”?', 'faq.a5': 'Brief, design, kod, backend, baza, bot, powiadomienia, deploy, hosting.',
        'faq.q6': 'Poprawki po wdrożeniu?', 'faq.a6': 'Tak. 14 dni po — bezpłatne poprawki.',
        'contact.eyebrow': 'zapytanie', 'contact.title': 'Omówmy twój projekt', 'contact.sub': 'Opisz zadanie — odpowiem w ciągu godziny.',
        'contacts.phone': 'Telefon', 'contacts.loc': 'Lokalizacja', 'contacts.locValue': 'Ługańsk · zdalnie', 'contacts.locNote': 'Pracuję z każdego regionu',
        'form.name': 'Imię', 'form.namePh': 'Jak mam się zwracać?', 'form.contact': 'Telegram lub telefon', 'form.contactPh': '@username lub +7 900 000-00-00',
        'form.service': 'Co potrzebujesz', 'form.service.site': 'Strona', 'form.service.bot': 'Bot Telegram', 'form.service.design': 'Design', 'form.service.other': 'Inne',
        'form.message': 'Opis zadania', 'form.messagePh': 'Jaki projekt, funkcje, przykłady, terminy', 'form.submit': 'Wyślij zapytanie', 'form.note': 'Klikając, zgadzasz się na przetwarzanie danych.',
        'footer.slogan': 'Strony i boty Telegram pod klucz w 1,5 dnia.', 'footer.author': 'Władysław', 'footer.up': 'Do góry ↑'
      },
      de: {
        'nav.services': 'Leistungen', 'nav.packages': 'Pakete', 'nav.cases': 'Projekte', 'nav.reviews': 'Bewertungen', 'nav.process': 'Wie ich arbeite', 'nav.faq': 'FAQ', 'nav.cta': 'Projekt besprechen',
        'hero.pill': 'Verfügbar für neue Projekte', 'hero.title1': 'Ich baue Websites und Telegram-Bots', 'hero.title2': 'schlüsselfertig in 1,5 Tagen',
        'hero.sub': 'TPF Studio — Solo-Entwicklung von der Idee bis zum Start. Ohne Mittelsmänner, termingerecht, mit Garantie.', 'hero.btn1': 'Projekt besprechen', 'hero.btn2': 'Projekte ansehen',
        'stats.experience': 'Jahre Erfahrung', 'stats.projects': 'Projekte schlüsselfertig', 'stats.days': 'Tage durchschnittlich', 'stats.turnkey': 'schlüsselfertig',
        'about.eyebrow': 'über mich', 'about.title': 'Ein Entwickler statt eines ganzen Teams', 'about.name': 'Wladislaw', 'about.role': 'Entwickler & Gründer von TPF Studio', 'about.location': 'Lugansk · remote',
        'about.p1': 'Ich bin Entwickler und Gründer von TPF Studio. Ich baue Websites und Telegram-Bots schlüsselfertig.', 'about.p2': 'In 3,5 Jahren lieferte ich Projekte für Beauty und HoReCa. Eine Person statt eines Teams.',
        'about.badge1': 'Remote', 'about.badge2': 'Vertraglich', 'about.badge3': 'Keine Luft-Vorauszahlung',
        'services.eyebrow': 'leistungen', 'services.title': 'Was ich mache', 'services.sub': 'Voller Zyklus: Design, Markup, Backend, Datenbank, Bots, Deploy.',
        's1.title': 'Website-Entwicklung', 's1.desc': 'Landingpages, Café- und Salon-Websites, Corporate, Shops.', 's1.price': 'ab 15 000 ₽',
        's2.title': 'Telegram-Bots', 's2.desc': 'Shops, Funnels, Lead-Erfassung, Admin-Benachrichtigungen, Integrationen.', 's2.price': 'ab 10 000 ₽',
        's4.title': 'Integrationen & Automatisierung', 's4.desc': 'Supabase / PostgreSQL, Website-Leads zu Telegram, Webhooks, Deploy.', 's4.price': 'ab 7 000 ₽',
        'guarantee1.title': 'Offizieller Vertrag', 'guarantee1.desc': 'Wir legen Umfang, Termine und Kosten fest.',
        'guarantee2.title': 'Fester Preis', 'guarantee2.desc': 'Die Kosten ändern sich nicht. Keine Zuschläge.',
        'guarantee3.title': 'Kostenlose Korrekturen', 'guarantee3.desc': '14 Tage nach Lieferung nehme ich kostenlose Korrekturen vor.',
        'reviews.eyebrow': 'bewertungen', 'reviews.title': 'Was Kunden sagen', 'reviews.loading': 'Bewertungen werden geladen…', 'reviews.leaveCta': 'Bewertung abgeben',
        'faq.eyebrow': 'faq', 'faq.title': 'Häufige Fragen',
        'faq.q1': 'Was kostet eine Website?', 'faq.a1': 'Landing — ab 15 000 ₽. Website mit Bot — ab 35 000 ₽. Premium — ab 60 000 ₽.',
        'faq.q2': 'Welche Termine?', 'faq.a2': 'Landing — 1,5 Tage. Komplexe Projekte — 3–10 Tage.',
        'faq.q3': 'Was brauchen Sie von mir?', 'faq.a3': 'Aufgabenbeschreibung, Beispiele, Materialien.',
        'faq.q4': 'Arbeiten Sie mit Vertrag?', 'faq.a4': 'Ja. Vorauszahlung 30–50%.',
        'faq.q5': 'Was ist in „schlüsselfertig“?', 'faq.a5': 'Brief, Design, Markup, Responsive, Backend, DB, Bot, Benachrichtigungen, Deploy, Hosting.',
        'faq.q6': 'Updates nach Lieferung?', 'faq.a6': 'Ja. 14 Tage nach Lieferung — kostenlose Fixes.',
        'contact.eyebrow': 'anfrage', 'contact.title': 'Besprechen wir Ihr Projekt', 'contact.sub': 'Beschreiben Sie die Aufgabe — ich antworte innerhalb einer Stunde.',
        'contacts.phone': 'Telefon', 'contacts.loc': 'Standort', 'contacts.locValue': 'Lugansk · remote', 'contacts.locNote': 'Arbeite mit jeder Region',
        'form.name': 'Name', 'form.namePh': 'Wie soll ich Sie nennen?', 'form.contact': 'Telegram oder Telefon', 'form.contactPh': '@username oder +7 900 000-00-00',
        'form.service': 'Was brauchen Sie', 'form.service.site': 'Website', 'form.service.bot': 'Telegram-Bot', 'form.service.design': 'Design', 'form.service.other': 'Anderes',
        'form.message': 'Aufgabenbeschreibung', 'form.messagePh': 'Welches Projekt, Funktionen, Beispiele, Termine', 'form.submit': 'Anfrage senden', 'form.note': 'Mit Klick stimmen Sie der Datenverarbeitung zu.',
        'footer.slogan': 'Websites und Telegram-Bots schlüsselfertig in 1,5 Tagen.', 'footer.author': 'Wladislaw', 'footer.up': 'Nach oben ↑'
      },
      fr: {
        'nav.services': 'Services', 'nav.packages': 'Forfaits', 'nav.cases': 'Réalisations', 'nav.reviews': 'Avis', 'nav.process': 'Processus', 'nav.faq': 'FAQ', 'nav.cta': 'Discuter du projet',
        'hero.pill': 'Disponible pour de nouveaux projets', 'hero.title1': 'Je crée des sites et bots Telegram', 'hero.title2': 'clé en main en 1,5 jour',
        'hero.sub': 'TPF Studio — développement solo de l\'idée au lancement. Sans intermédiaires, dans les délais, garanti.', 'hero.btn1': 'Discuter du projet', 'hero.btn2': 'Voir les réalisations',
        'stats.experience': 'ans d\'expérience', 'stats.projects': 'projets clé en main', 'stats.days': 'jours en moyenne', 'stats.turnkey': 'clé en main',
        'about.eyebrow': 'à propos', 'about.title': 'Un développeur au lieu d\'une équipe', 'about.name': 'Vladislav', 'about.role': 'Développeur & fondateur de TPF Studio', 'about.location': 'Lougansk · à distance',
        'about.p1': 'Je suis développeur et fondateur de TPF Studio. Je crée des sites et bots Telegram clé en main.', 'about.p2': 'En 3,5 ans, j\'ai livré des projets pour la beauté et HoReCa. Une personne au lieu d\'une équipe.',
        'about.badge1': 'À distance', 'about.badge2': 'Sous contrat', 'about.badge3': 'Sans prépaiement en l\'air',
        'services.eyebrow': 'services', 'services.title': 'Ce que je fais', 'services.sub': 'Cycle complet : design, code, backend, base de données, bots, déploiement.',
        's1.title': 'Développement web', 's1.desc': 'Landings, sites de cafés et salons, corporate, boutiques.', 's1.price': 'à partir de 15 000 ₽',
        's2.title': 'Bots Telegram', 's2.desc': 'Boutiques, entonnoirs, capture de leads, notifications admin, intégrations.', 's2.price': 'à partir de 10 000 ₽',
        's4.title': 'Intégrations & automatisation', 's4.desc': 'Supabase / PostgreSQL, leads du site vers Telegram, webhooks, déploiement.', 's4.price': 'à partir de 7 000 ₽',
        'guarantee1.title': 'Contrat officiel', 'guarantee1.desc': 'Nous fixons la portée des travaux, les délais et le coût.',
        'guarantee2.title': 'Prix fixe', 'guarantee2.desc': 'Le coût ne changera pas en cours de route. Sans frais supplémentaires.',
        'guarantee3.title': 'Corrections gratuites', 'guarantee3.desc': '14 jours après la livraison, j\'apporte des corrections gratuites.',
        'reviews.eyebrow': 'avis', 'reviews.title': 'Ce que disent les clients', 'reviews.loading': 'Chargement des avis…', 'reviews.leaveCta': 'Laisser un avis',
        'faq.eyebrow': 'faq', 'faq.title': 'Questions fréquentes',
        'faq.q1': 'Combien coûte un site ?', 'faq.a1': 'Landing — à partir de 15 000 ₽. Site avec bot — à partir de 35 000 ₽. Premium — à partir de 60 000 ₽.',
        'faq.q2': 'Quels délais ?', 'faq.a2': 'Landing — 1,5 jour. Projets complexes — 3 à 10 jours.',
        'faq.q3': 'Que faut-il de moi ?', 'faq.a3': 'Description, exemples, matériaux.',
        'faq.q4': 'Travaillez-vous sous contrat ?', 'faq.a4': 'Oui. Prépaie 30–50 %.',
        'faq.q5': 'Que comprend « clé en main » ?', 'faq.a5': 'Brief, design, code, responsive, backend, DB, bot, notifications, déploiement, hébergement.',
        'faq.q6': 'Modifications après livraison ?', 'faq.a6': 'Oui. 14 jours après — corrections gratuites.',
        'contact.eyebrow': 'demande', 'contact.title': 'Discutons de votre projet', 'contact.sub': 'Décrivez la tâche — je réponds dans l\'heure.',
        'contacts.phone': 'Téléphone', 'contacts.loc': 'Localisation', 'contacts.locValue': 'Lougansk · à distance', 'contacts.locNote': 'Je travaille avec toutes les régions',
        'form.name': 'Nom', 'form.namePh': 'Comment vous appeler ?', 'form.contact': 'Telegram ou téléphone', 'form.contactPh': '@username ou +7 900 000-00-00',
        'form.service': 'Ce dont vous avez besoin', 'form.service.site': 'Site', 'form.service.bot': 'Bot Telegram', 'form.service.design': 'Design', 'form.service.other': 'Autre',
        'form.message': 'Description', 'form.messagePh': 'Quel projet, fonctionnalités, exemples, délais', 'form.submit': 'Envoyer la demande', 'form.note': 'En cliquant, vous acceptez le traitement des données.',
        'footer.slogan': 'Sites et bots Telegram clé en main en 1,5 jour.', 'footer.author': 'Vladislav', 'footer.up': 'En haut ↑'
      },
      es: {
        'nav.services': 'Servicios', 'nav.packages': 'Paquetes', 'nav.cases': 'Proyectos', 'nav.reviews': 'Reseñas', 'nav.process': 'Cómo trabajo', 'nav.faq': 'FAQ', 'nav.cta': 'Discutir proyecto',
        'hero.pill': 'Disponible para nuevos proyectos', 'hero.title1': 'Creo sitios web y bots de Telegram', 'hero.title2': 'llave en mano en 1,5 días',
        'hero.sub': 'TPF Studio — desarrollo en solitario de la idea al lanzamiento. Sin intermediarios, a tiempo, con garantía.', 'hero.btn1': 'Discutir proyecto', 'hero.btn2': 'Ver proyectos',
        'stats.experience': 'años de experiencia', 'stats.projects': 'proyectos llave en mano', 'stats.days': 'días en promedio', 'stats.turnkey': 'llave en mano',
        'about.eyebrow': 'sobre mí', 'about.title': 'Un desarrollador en lugar de un equipo', 'about.name': 'Vladislav', 'about.role': 'Desarrollador y fundador de TPF Studio', 'about.location': 'Lugansk · remoto',
        'about.p1': 'Soy desarrollador y fundador de TPF Studio. Creo sitios web y bots de Telegram llave en mano.', 'about.p2': 'En 3,5 años entregué proyectos para belleza y HoReCa. Una persona en lugar de un equipo.',
        'about.badge1': 'Remoto', 'about.badge2': 'Con contrato', 'about.badge3': 'Sin prepago al aire',
        'services.eyebrow': 'servicios', 'services.title': 'Qué hago', 'services.sub': 'Ciclo completo: diseño, código, backend, base de datos, bots, deploy.',
        's1.title': 'Desarrollo web', 's1.desc': 'Landings, sitios de cafés y salones, corporativos, tiendas.', 's1.price': 'desde 15 000 ₽',
        's2.title': 'Bots de Telegram', 's2.desc': 'Tiendas, embudos, captura de leads, notificaciones admin, integraciones.', 's2.price': 'desde 10 000 ₽',
        's4.title': 'Integraciones y automatización', 's4.desc': 'Supabase / PostgreSQL, leads del sitio a Telegram, webhooks, deploy.', 's4.price': 'desde 7 000 ₽',
        'guarantee1.title': 'Contrato oficial', 'guarantee1.desc': 'Fijamos el alcance del trabajo, los plazos y el costo.',
        'guarantee2.title': 'Precio fijo', 'guarantee2.desc': 'El costo no cambiará durante el proceso. Sin recargos.',
        'guarantee3.title': 'Ediciones gratuitas', 'guarantee3.desc': '14 días después de la entrega hago ediciones gratis.',
        'reviews.eyebrow': 'reseñas', 'reviews.title': 'Lo que dicen los clientes', 'reviews.loading': 'Cargando reseñas…', 'reviews.leaveCta': 'Dejar una reseña',
        'faq.eyebrow': 'faq', 'faq.title': 'Preguntas frecuentes',
        'faq.q1': '¿Cuánto cuesta un sitio?', 'faq.a1': 'Landing — desde 15 000 ₽. Sitio con bot — desde 35 000 ₽. Premium — desde 60 000 ₽.',
        'faq.q2': '¿Qué plazos?', 'faq.a2': 'Landing — 1,5 días. Proyectos complejos — 3 a 10 días.',
        'faq.q3': '¿Qué necesitas de mí?', 'faq.a3': 'Descripción, ejemplos, materiales.',
        'faq.q4': '¿Trabajas por contrato?', 'faq.a4': 'Sí. Prepago 30–50%.',
        'faq.q5': '¿Qué incluye «llave en mano»?', 'faq.a5': 'Brief, diseño, código, responsive, backend, DB, bot, notificaciones, deploy, hosting.',
        'faq.q6': '¿Haces actualizaciones?', 'faq.a6': 'Sí. 14 días después — correcciones gratuitas.',
        'contact.eyebrow': 'solicitud', 'contact.title': 'Hablemos de tu proyecto', 'contact.sub': 'Describe la tarea — respondo en una hora.',
        'contacts.phone': 'Teléfono', 'contacts.loc': 'Ubicación', 'contacts.locValue': 'Lugansk · remoto', 'contacts.locNote': 'Trabajo con cualquier región',
        'form.name': 'Nombre', 'form.namePh': '¿Cómo te llamo?', 'form.contact': 'Telegram o teléfono', 'form.contactPh': '@username o +7 900 000-00-00',
        'form.service': 'Qué necesitas', 'form.service.site': 'Sitio', 'form.service.bot': 'Bot de Telegram', 'form.service.design': 'Diseño', 'form.service.other': 'Otro',
        'form.message': 'Descripción', 'form.messagePh': 'Qué proyecto, funcionalidad, ejemplos, plazos', 'form.submit': 'Enviar solicitud', 'form.note': 'Al hacer clic, aceptas el tratamiento de datos.',
        'footer.slogan': 'Sitios y bots de Telegram llave en mano en 1,5 días.', 'footer.author': 'Vladislav', 'footer.up': 'Arriba ↑'
      },
      tr: {
        'nav.services': 'Hizmetler', 'nav.packages': 'Paketler', 'nav.cases': 'Projeler', 'nav.reviews': 'Yorumlar', 'nav.process': 'Nasıl çalışırım', 'nav.faq': 'SSS', 'nav.cta': 'Projeyi görüşelim',
        'hero.pill': 'Yeni projelere açık', 'hero.title1': 'Web siteleri ve Telegram botları yapıyorum', 'hero.title2': '1,5 günde anahtar teslim',
        'hero.sub': 'TPF Studio — fikirden lansmana solo geliştirme. Aracısız, zamanında, garantili.', 'hero.btn1': 'Projeyi görüşelim', 'hero.btn2': 'Projeleri gör',
        'stats.experience': 'yıl deneyim', 'stats.projects': 'anahtar teslim proje', 'stats.days': 'gün ortalama', 'stats.turnkey': 'anahtar teslim',
        'about.eyebrow': 'hakkımda', 'about.title': 'Bir ekip yerine bir geliştirici', 'about.name': 'Vladislav', 'about.role': 'Geliştirici ve TPF Studio kurucusu', 'about.location': 'Lugansk · uzaktan',
        'about.p1': 'TPF Studio\'nun kurucusuyum. Web siteleri ve Telegram botları anahtar teslim yapıyorum.', 'about.p2': '3,5 yılda güzellik ve HoReCa için projeler teslim ettim. Bir kişi, bir ekip yerine.',
        'about.badge1': 'Uzaktan', 'about.badge2': 'Sözleşmeli', 'about.badge3': 'Boşluğa ön ödeme yok',
        'services.eyebrow': 'hizmetler', 'services.title': 'Ne yapıyorum', 'services.sub': 'Tam döngü: tasarım, kod, backend, veritabanı, botlar, dağıtım.',
        's1.title': 'Web sitesi geliştirme', 's1.desc': 'Landing, kafe ve salon siteleri, kurumsal, mağaza.', 's1.price': '15 000 ₽\'den',
        's2.title': 'Telegram botları', 's2.desc': 'Mağaza, huni, lead toplama, admin bildirimleri, entegrasyonlar.', 's2.price': '10 000 ₽\'den',
        's4.title': 'Entegrasyon ve otomasyon', 's4.desc': 'Supabase / PostgreSQL, siteden Telegram\'a lead, webhook, dağıtım.', 's4.price': '7 000 ₽\'den',
        'guarantee1.title': 'Resmi sözleşme', 'guarantee1.desc': 'İş kapsamını, süreleri ve maliyeti sabitliyoruz.',
        'guarantee2.title': 'Sabit fiyat', 'guarantee2.desc': 'Maliyet süreç içinde değişmez. Ek ücret yok.',
        'guarantee3.title': 'Ücretsiz düzeltmeler', 'guarantee3.desc': 'Teslimattan sonraki 14 gün içinde ücretsiz düzeltme yaparım.',
        'reviews.eyebrow': 'yorumlar', 'reviews.title': 'Müşteriler ne diyor', 'reviews.loading': 'Yorumlar yükleniyor…', 'reviews.leaveCta': 'Yorum bırak',
        'faq.eyebrow': 'sss', 'faq.title': 'Sık sorulan sorular',
        'faq.q1': 'Site ne kadar?', 'faq.a1': 'Landing — 15 000 ₽\'den. Botlu site — 35 000 ₽\'den. Premium — 60 000 ₽\'den.',
        'faq.q2': 'Süreler?', 'faq.a2': 'Landing — 1,5 gün. Karmaşık — 3–10 gün.',
        'faq.q3': 'Benden ne gerekiyor?', 'faq.a3': 'Görev tanımı, örnekler, materyaller.',
        'faq.q4': 'Sözleşmeli çalışıyor musunuz?', 'faq.a4': 'Evet. %30–50 ön ödeme.',
        'faq.q5': 'Anahtar teslim neyi içerir?', 'faq.a5': 'Brief, tasarım, kod, responsive, backend, DB, bot, bildirimler, dağıtım, hosting.',
        'faq.q6': 'Teslim sonrası güncelleme?', 'faq.a6': 'Evet. 14 gün sonra — ücretsiz düzeltmeler.',
        'contact.eyebrow': 'talep', 'contact.title': 'Projenizi konuşalım', 'contact.sub': 'Görevi tanımlayın — bir saat içinde yanıt.',
        'contacts.phone': 'Telefon', 'contacts.loc': 'Konum', 'contacts.locValue': 'Lugansk · uzaktan', 'contacts.locNote': 'Her bölgeyle çalışırım',
        'form.name': 'İsim', 'form.namePh': 'Size nasıl hitap edeyim?', 'form.contact': 'Telegram veya telefon', 'form.contactPh': '@username veya +7 900 000-00-00',
        'form.service': 'Ne lazım', 'form.service.site': 'Site', 'form.service.bot': 'Telegram bot', 'form.service.design': 'Tasarım', 'form.service.other': 'Diğer',
        'form.message': 'Görev tanımı', 'form.messagePh': 'Hangi proje, hangi işlevler, örnekler, süreler', 'form.submit': 'Talep gönder', 'form.note': 'Tıklayarak veri işlemeyi kabul ediyorsunuz.',
        'footer.slogan': 'Web siteleri ve Telegram botları 1,5 günde anahtar teslim.', 'footer.author': 'Vladislav', 'footer.up': 'Yukarı ↑'
      },
      zh: {
        'nav.services': '服务', 'nav.packages': '套餐', 'nav.cases': '案例', 'nav.reviews': '评价', 'nav.process': '工作流程', 'nav.faq': 'FAQ', 'nav.cta': '讨论项目',
        'hero.pill': '可接新项目', 'hero.title1': '我制作网站和 Telegram 机器人', 'hero.title2': '1.5 天交钥匙',
        'hero.sub': 'TPF Studio — 从创意到上线的独立开发。没有中间商，按时交付，有保障。', 'hero.btn1': '讨论项目', 'hero.btn2': '查看案例',
        'stats.experience': '年经验', 'stats.projects': '交钥匙项目', 'stats.days': '天平均', 'stats.turnkey': '交钥匙',
        'about.eyebrow': '关于我', 'about.title': '一个人，胜过整个团队', 'about.name': '弗拉迪斯拉夫', 'about.role': '开发者，TPF Studio 创始人', 'about.location': '卢甘斯克 · 远程',
        'about.p1': '我是 TPF Studio 的创始人和开发者。制作交钥匙网站和 Telegram 机器人。', 'about.p2': '3.5 年来为美业和餐饮业交付项目。一个人顶一个团队。',
        'about.badge1': '远程', 'about.badge2': '签合同', 'about.badge3': '不做空气预付款',
        'services.eyebrow': '服务', 'services.title': '我做什么', 'services.sub': '全流程：设计、代码、后端、数据库、机器人、部署。',
        's1.title': '网站开发', 's1.desc': '落地页、咖啡厅和美容院网站、企业站、商城。', 's1.price': '起 15 000 ₽',
        's2.title': 'Telegram 机器人', 's2.desc': '商店、漏斗、线索收集、管理员通知、集成。', 's2.price': '起 10 000 ₽',
        's4.title': '集成与自动化', 's4.desc': 'Supabase / PostgreSQL、网站线索到 Telegram、webhook、部署。', 's4.price': '起 7 000 ₽',
        'guarantee1.title': '官方合同', 'guarantee1.desc': '我们确定工作范围、截止日期和成本。',
        'guarantee2.title': '固定价格', 'guarantee2.desc': '过程中成本不会改变。无额外费用。',
        'guarantee3.title': '免费修改', 'guarantee3.desc': '交付后 14 天内免费修改。',
        'reviews.eyebrow': '评价', 'reviews.title': '客户评价', 'reviews.loading': '正在加载评价…', 'reviews.leaveCta': '留下评价',
        'faq.eyebrow': 'faq', 'faq.title': '常见问题',
        'faq.q1': '网站多少钱？', 'faq.a1': '落地页 — 起 15 000 ₽。带机器人的网站 — 起 35 000 ₽。高级版 — 起 60 000 ₽。',
        'faq.q2': '周期？', 'faq.a2': '落地页 — 1.5 天。复杂项目 — 3 到 10 天。',
        'faq.q3': '我需要提供什么？', 'faq.a3': '任务描述、参考、素材。',
        'faq.q4': '签合同吗？', 'faq.a4': '是的。预付款 30–50%。',
        'faq.q5': '交钥匙包含什么？', 'faq.a5': '需求、设计、代码、响应式、后端、数据库、机器人、通知、部署、托管。',
        'faq.q6': '交付后还改吗？', 'faq.a6': '是的。交付后 14 天内免费修改。',
        'contact.eyebrow': '申请', 'contact.title': '讨论您的项目', 'contact.sub': '描述任务 — 一小时内回复。',
        'contacts.phone': '电话', 'contacts.loc': '位置', 'contacts.locValue': '卢甘斯克 · 远程', 'contacts.locNote': '可服务任何地区',
        'form.name': '姓名', 'form.namePh': '怎么称呼您？', 'form.contact': 'Telegram 或电话', 'form.contactPh': '@username 或 +7 900 000-00-00',
        'form.service': '需要什么', 'form.service.site': '网站', 'form.service.bot': 'Telegram 机器人', 'form.service.design': '设计', 'form.service.other': '其他',
        'form.message': '任务描述', 'form.messagePh': '什么项目，什么功能，参考，周期', 'form.submit': '提交申请', 'form.note': '点击即表示同意处理数据。',
        'footer.slogan': '网站和 Telegram 机器人 1.5 天交钥匙。', 'footer.author': '弗拉迪斯拉夫', 'footer.up': '回到顶部 ↑'
      },
      ja: {
        'nav.services': 'サービス', 'nav.packages': 'パッケージ', 'nav.cases': '実績', 'nav.reviews': 'レビュー', 'nav.process': '進め方', 'nav.faq': 'FAQ', 'nav.cta': 'プロジェクト相談',
        'hero.pill': '新規プロジェクト受付中', 'hero.title1': 'ウェブサイトと Telegram ボットを作ります', 'hero.title2': '1.5 日でターンキー',
        'hero.sub': 'TPF Studio — アイデアから公開までのソロ開発。中間業者なし、納期厳守、保証付き。', 'hero.btn1': 'プロジェクト相談', 'hero.btn2': '実績を見る',
        'stats.experience': '年の経験', 'stats.projects': 'ターンキープロジェクト', 'stats.days': '日平均', 'stats.turnkey': 'ターンキー',
        'about.eyebrow': '私について', 'about.title': 'チームの代わりに一人の開発者', 'about.name': 'ウラジスラフ', 'about.role': '開発者・TPF Studio 創設者', 'about.location': 'ルガンスク · リモート',
        'about.p1': 'TPF Studio の創設者です。ウェブサイトと Telegram ボットをターンキーで制作します。', 'about.p2': '3.5 年間で美容と飲食業のプロジェクトを納品。一人でチーム分の仕事。',
        'about.badge1': 'リモート', 'about.badge2': '契約制', 'about.badge3': '空中前払いなし',
        'services.eyebrow': 'サービス', 'services.title': 'できること', 'services.sub': 'フルサイクル：デザイン、コード、バックエンド、DB、ボット、デプロイ。',
        's1.title': 'ウェブサイト開発', 's1.desc': 'ランディング、カフェ・サロンサイト、コーポレート、EC。', 's1.price': '15 000 ₽〜',
        's2.title': 'Telegram ボット', 's2.desc': 'ショップ、ファネル、リード獲得、管理者通知、連携。', 's2.price': '10 000 ₽〜',
        's4.title': '連携と自動化', 's4.desc': 'Supabase / PostgreSQL、サイトから Telegram へ、Webhook、デプロイ。', 's4.price': '7 000 ₽〜',
        'guarantee1.title': '公式契約', 'guarantee1.desc': '作業範囲、期間、費用を確定します。',
        'guarantee2.title': '固定価格', 'guarantee2.desc': '途中で費用は変わりません。追加料金なし。',
        'guarantee3.title': '無料修正', 'guarantee3.desc': '納品後 14 日以内は無料で修正します。',
        'reviews.eyebrow': 'レビュー', 'reviews.title': 'お客様の声', 'reviews.loading': 'レビューを読み込み中…', 'reviews.leaveCta': 'レビューを書く',
        'faq.eyebrow': 'faq', 'faq.title': 'よくある質問',
        'faq.q1': 'サイトはいくら？', 'faq.a1': 'ランディング — 15 000 ₽〜。ボット付きサイト — 35 000 ₽〜。プレミアム — 60 000 ₽〜。',
        'faq.q2': '期間は？', 'faq.a2': 'ランディング — 1.5 日。複雑なプロジェクト — 3〜10 日。',
        'faq.q3': '私が用意するもの？', 'faq.a3': 'タスク説明、参考サイト、素材。',
        'faq.q4': '契約は？', 'faq.a4': 'はい。前払い 30〜50%。',
        'faq.q5': 'ターンキーに含まれるもの？', 'faq.a5': 'ヒアリング、デザイン、コード、レスポンシブ、バックエンド、DB、ボット、通知、デプロイ、ホスティング。',
        'faq.q6': '納品後の修正は？', 'faq.a6': 'はい。納品後 14 日以内は無料修正。',
        'contact.eyebrow': '申請', 'contact.title': 'プロジェクトを話しましょう', 'contact.sub': 'タスクを送信 — 1 時間以内に返信。',
        'contacts.phone': '電話', 'contacts.loc': '場所', 'contacts.locValue': 'ルガンスク · リモート', 'contacts.locNote': 'どの地域でも対応',
        'form.name': 'お名前', 'form.namePh': '何とお呼びすれば？', 'form.contact': 'Telegram か電話', 'form.contactPh': '@username または +7 900 000-00-00',
        'form.service': '必要なもの', 'form.service.site': 'ウェブサイト', 'form.service.bot': 'Telegram ボット', 'form.service.design': 'デザイン', 'form.service.other': 'その他',
        'form.message': 'タスク説明', 'form.messagePh': 'どんなプロジェクト、機能、参考、期間', 'form.submit': '送信', 'form.note': 'クリックでデータ処理に同意します。',
        'footer.slogan': 'ウェブサイトと Telegram ボットを 1.5 日でターンキー。', 'footer.author': 'ウラジスラフ', 'footer.up': '上へ ↑'
      },
      ko: {
        'nav.services': '서비스', 'nav.packages': '패키지', 'nav.cases': '포트폴리오', 'nav.reviews': '리뷰', 'nav.process': '작업 방식', 'nav.faq': 'FAQ', 'nav.cta': '프로젝트 논의',
        'hero.pill': '새 프로젝트 가능', 'hero.title1': '웹사이트와 Telegram 봇을 만듭니다', 'hero.title2': '1.5일 만에 턴키',
        'hero.sub': 'TPF Studio — 아이디어부터 출시까지 솔로 개발. 중간상인 없이, 정시에, 보장과 함께.', 'hero.btn1': '프로젝트 논의', 'hero.btn2': '포트폴리오 보기',
        'stats.experience': '년 경력', 'stats.projects': '턴키 프로젝트', 'stats.days': '일 평균', 'stats.turnkey': '턴키',
        'about.eyebrow': '소개', 'about.title': '팀 대신 한 명의 개발자', 'about.name': '블라디슬라프', 'about.role': '개발자 · TPF Studio 창립자', 'about.location': '루간스크 · 원격',
        'about.p1': 'TPF Studio의 창립자입니다. 웹사이트와 Telegram 봇을 턴키로 만듭니다.', 'about.p2': '3.5년 동안 뷰티와 외식업 프로젝트를 납품했습니다. 한 명이 팀을 대신합니다.',
        'about.badge1': '원격', 'about.badge2': '계약제', 'about.badge3': '공중 선금 없음',
        'services.eyebrow': '서비스', 'services.title': '하는 일', 'services.sub': '풀 사이클: 디자인, 코드, 백엔드, DB, 봇, 배포.',
        's1.title': '웹사이트 개발', 's1.desc': '랜딩, 카페·살롱 사이트, 기업, 쇼핑몰.', 's1.price': '15 000 ₽부터',
        's2.title': 'Telegram 봇', 's2.desc': '상점, 퍼널, 리드 수집, 관리자 알림, 통합.', 's2.price': '10 000 ₽부터',
        's4.title': '통합과 자동화', 's4.desc': 'Supabase / PostgreSQL, 사이트에서 Telegram으로, 웹훅, 배포.', 's4.price': '7 000 ₽부터',
        'guarantee1.title': '공식 계약', 'guarantee1.desc': '작업 범위, 기한, 비용을 확정합니다.',
        'guarantee2.title': '고정 가격', 'guarantee2.desc': '진행 중 비용이 변경되지 않습니다. 추가 요금 없음.',
        'guarantee3.title': '무료 수정', 'guarantee3.desc': '프로젝트 전달 후 14일 동안 무료로 수정해 드립니다.',
        'reviews.eyebrow': '리뷰', 'reviews.title': '고객 후기', 'reviews.loading': '리뷰 로딩 중…', 'reviews.leaveCta': '리뷰 남기기',
        'faq.eyebrow': 'faq', 'faq.title': '자주 묻는 질문',
        'faq.q1': '사이트 가격은?', 'faq.a1': '랜딩 — 15 000 ₽부터. 봇 포함 사이트 — 35 000 ₽부터. 프리미엄 — 60 000 ₽부터.',
        'faq.q2': '기간은?', 'faq.a2': '랜딩 — 1.5일. 복잡한 프로젝트 — 3~10일.',
        'faq.q3': '제가 준비할 것은?', 'faq.a3': '작업 설명, 예시, 자료.',
        'faq.q4': '계약하나요?', 'faq.a4': '네. 선금 30~50%.',
        'faq.q5': '턴키에 포함된 것은?', 'faq.a5': '브리프, 디자인, 코드, 반응형, 백엔드, DB, 봇, 알림, 배포, 호스팅.',
        'faq.q6': '납품 후 수정?', 'faq.a6': '네. 납품 후 14일 내 무료 수정.',
        'contact.eyebrow': '신청', 'contact.title': '프로젝트를 논의합시다', 'contact.sub': '작업을 설명하세요 — 1시간 내 답변.',
        'contacts.phone': '전화', 'contacts.loc': '위치', 'contacts.locValue': '루간스크 · 원격', 'contacts.locNote': '모든 지역과 작업',
        'form.name': '이름', 'form.namePh': '어떻게 불러드릴까요?', 'form.contact': 'Telegram 또는 전화', 'form.contactPh': '@username 또는 +7 900 000-00-00',
        'form.service': '무엇이 필요하세요', 'form.service.site': '웹사이트', 'form.service.bot': 'Telegram 봇', 'form.service.design': '디자인', 'form.service.other': '기타',
        'form.message': '작업 설명', 'form.messagePh': '어떤 프로젝트, 기능, 예시, 기간', 'form.submit': '신청 보내기', 'form.note': '클릭하면 데이터 처리에 동의합니다.',
        'footer.slogan': '웹사이트와 Telegram 봇을 1.5일에 턴키로.', 'footer.author': '블라디슬라프', 'footer.up': '위로 ↑'
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