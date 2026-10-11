/* ═══════════════════════════════════════════════════════════
   TPF Studio — main.js
   Чистый JS, без библиотек.
   Содержит: навбар, мобильное меню, reveal-анимации,
   счётчики, аккордеон FAQ, отправку формы в Telegram,
   активную ссылку при скролле.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     ⚙️  НАСТРОЙКИ ФОРМЫ ЗАЯВОК
     ───────────────────────────────────────────────────────
     Токен бота спрятан в Cloudflare Worker — в исходниках
     сайта его нет. Здесь только URL воркера (PROXY_URL).

     CHAT_ID теперь тоже живёт в Cloudflare, а не тут.
     ═══════════════════════════════════════════════════════ */
  const TELEGRAM_CONFIG = {
    BOT_TOKEN: '',
    CHAT_ID: '',
    PROXY_URL: 'https://tpf-form.energylowinr.workers.dev'
  };

  /* ═══════════════════════════════════════════════════════
     1. НАВБАР — фон при скролле
     ═══════════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  handleNavbarScroll();
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* ═══════════════════════════════════════════════════════
     2. МОБИЛЬНОЕ МЕНЮ
     ═══════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════
     3. ПЛАВНОЕ ПОЯВЛЕНИЕ СЕКЦИЙ (IntersectionObserver)
     ═══════════════════════════════════════════════════════ */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealElements.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ═══════════════════════════════════════════════════════
     4. АНИМИРОВАННЫЕ СЧЁТЧИКИ
     ═══════════════════════════════════════════════════════ */
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

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
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

  /* ═══════════════════════════════════════════════════════
     5. FAQ — АККОРДЕОН
     ═══════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════
     6. АКТИВНАЯ ССЫЛКА В НАВБАРЕ ПРИ СКРОЛЛЕ
     ═══════════════════════════════════════════════════════ */
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
    }, {
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ═══════════════════════════════════════════════════════
     7. АВТОПОДСТАНОВКА УСЛУГИ ИЗ КНОПОК «ЗАКАЗАТЬ»
     ═══════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════
     8. ОТПРАВКА ФОРМЫ ЗАЯВКИ В TELEGRAM
     ═══════════════════════════════════════════════════════ */
  const form       = document.getElementById('leadForm');
  const statusEl   = document.getElementById('formStatus');
  const submitBtn  = document.getElementById('submitBtn');

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
    } else {
      setFieldError(name, '');
    }

    const contactValue = contact.value.trim();
    const contactOk = contactValue.length >= 5 &&
      (/@[\w.]{3,}/.test(contactValue) || /[\d\s()+-]{7,}/.test(contactValue));
    if (!contactOk) {
      setFieldError(contact, 'Укажите Telegram (@username) или телефон');
      valid = false;
    } else {
      setFieldError(contact, '');
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
      setFieldError(message, 'Опишите задачу подробнее (минимум 10 символов)');
      valid = false;
    } else {
      setFieldError(message, '');
    }

    return valid;
  }

  /**
   * Отправляет заявку в Telegram.
   * Если задан PROXY_URL — через Cloudflare Worker (рекомендуется).
   * Иначе — напрямую в Telegram Bot API по BOT_TOKEN + CHAT_ID.
   */
  async function sendLead(data) {
    // ─── Вариант А: через прокси (Cloudflare Worker) ───
    if (TELEGRAM_CONFIG.PROXY_URL) {
      const res = await fetch(TELEGRAM_CONFIG.PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    data.name,
          contact: data.contact,
          service: data.service,
          message: data.message
        })
      });

      const json = await res.json().catch(function () { return {}; });

      if (!res.ok || json.ok === false) {
        throw new Error(json.error || ('Ошибка сервера: ' + res.status));
      }
      return json;
    }

    // ─── Вариант Б: напрямую в Telegram ───
    if (!TELEGRAM_CONFIG.BOT_TOKEN || TELEGRAM_CONFIG.BOT_TOKEN.indexOf('ВСТАВЬТЕ') === 0) {
      throw new Error('CONFIG_MISSING');
    }
    if (!TELEGRAM_CONFIG.CHAT_ID || TELEGRAM_CONFIG.CHAT_ID.indexOf('ВСТАВЬТЕ') === 0) {
      throw new Error('CONFIG_MISSING');
    }

    const text = buildMessage(data);
    const chatIds = TELEGRAM_CONFIG.CHAT_ID
      .split(',')
      .map(function (id) { return id.trim(); })
      .filter(Boolean);

    const results = await Promise.allSettled(
      chatIds.map(function (id) { return sendToOne(id, text); })
    );

    const failed = results.filter(function (r) { return r.status === 'rejected'; });
    if (failed.length === results.length) {
      throw new Error(failed[0].reason ? failed[0].reason.message : 'Ошибка отправки');
    }

    return { ok: true };
  }

  /**
   * Собирает текст сообщения для Telegram (для варианта Б).
   */
  function buildMessage(data) {
    return [
      '🚀 <b>Новая заявка с сайта TPF Studio</b>',
      '',
      '👤 <b>Имя:</b> ' + escapeHtml(data.name),
      '📱 <b>Контакт:</b> ' + escapeHtml(data.contact),
      '🧩 <b>Услуга:</b> ' + escapeHtml(data.service),
      '',
      '📝 <b>Задача:</b>',
      escapeHtml(data.message),
      '',
      '🕒 ' + new Date().toLocaleString('ru-RU')
    ].join('\n');
  }

  /**
   * Отправляет одно сообщение в Telegram Bot API (для варианта Б).
   */
  async function sendToOne(chatId, text) {
    const url = 'https://api.telegram.org/bot' + TELEGRAM_CONFIG.BOT_TOKEN + '/sendMessage';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.description || 'Ошибка Telegram API');
    }
    return json;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot
      const honeypot = form.querySelector('#company');
      if (honeypot && honeypot.value) return;

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
        name:    form.querySelector('#name').value.trim(),
        contact: form.querySelector('#contact').value.trim(),
        service: form.querySelector('#service').value,
        message: form.querySelector('#message').value.trim()
      };

      try {
        await sendLead(data);

        setStatus('✅ Заявка отправлена — отвечу в течение часа. Спасибо!', 'success');
        form.reset();

        if (statusEl) {
          statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

      } catch (err) {
        console.error('[TPF Studio] Ошибка отправки формы:', err);

        if (err.message === 'CONFIG_MISSING') {
          setStatus(
            '⚠️ Форма ещё не подключена к Telegram. Напишите напрямую: @Vladislav_Igorevich_TPF',
            'error'
          );
        } else {
          setStatus(
            '❌ Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram: @Vladislav_Igorevich_TPF',
            'error'
          );
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    form.querySelectorAll('input, textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        setFieldError(input, '');
      });
    });
  }

  /* ═══════════════════════════════════════════════════════
     9. ПЛАВНЫЙ СКРОЛЛ С УЧЁТОМ ВЫСОТЫ НАВБАРА
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;

      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  /* ═══════════════════════════════════════════════════════
     10. ГОД В ФУТЕРЕ
     ═══════════════════════════════════════════════════════ */
  const yearEl = document.querySelector('.footer-bottom p');
  if (yearEl) {
    const currentYear = new Date().getFullYear();
    yearEl.textContent = '© ' + currentYear + ' TPF Studio. Владислав.';
  }

})();