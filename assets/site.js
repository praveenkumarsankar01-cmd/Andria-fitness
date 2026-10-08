(function () {
  'use strict';

  var CONFIG = {
    // Optional. Paste a form endpoint (Formspree, Getform, a Make or Zapier webhook,
    // or your email tool's form URL) to receive sign-ups as JSON.
    endpoint: '',
    trialDays: 10 // how many start dates to offer on the trial form
  };

  var PROGRAMS = { online: 'Online Coaching', group: 'Small Group', pt: '1:1 Personal Training' };
  var KEY = 'andria.signup';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var store = {
    get: function () { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } },
    set: function (v) { try { sessionStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  };

  // Personal data is never shown in full: emails become XXXX@domain, phones keep the last 2 digits.
  function maskEmail(email) {
    email = String(email || '');
    var at = email.lastIndexOf('@');
    return at > 0 ? 'XXXX' + email.slice(at) : 'XXXX@XXXX.com';
  }
  function maskPhone(code, number) {
    var d = String(number || '').replace(/\D/g, '');
    if (!d) return '';
    return (code ? code + ' ' : '') + new Array(Math.max(d.length - 1, 5)).join('X') + d.slice(-2);
  }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function send(data) {
    if (!CONFIG.endpoint || !window.fetch) return Promise.resolve();
    var req = fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({ sentAt: new Date().toISOString(), page: location.pathname }, data)),
      keepalive: true
    }).catch(function () {});
    return Promise.race([req, wait(4000)]);
  }

  /* ---------- shared ---------- */

  function initCommon() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$('[data-month]').forEach(function (el) { el.textContent = new Date().toLocaleString('en-US', { month: 'long' }); });

    var header = $('[data-header]');
    if (header) {
      var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var toggle = $('[data-nav-toggle]');
    var menu = $('[data-mobile-nav]');
    if (toggle && menu) {
      var setMenu = function (open) {
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        $('use', toggle).setAttribute('href', open ? '#i-x' : '#i-menu');
      };
      toggle.addEventListener('click', function () { setMenu(menu.hidden); });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
    }

    initSwipe();
  }

  // Phone swipe rows: counter, progress line and prev/next buttons.
  function initSwipe() {
    var arrow = '<svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg>';
    $$('[data-swipe]').forEach(function (row) {
      var items = row.children, n = items.length;
      var meta = document.createElement('div');
      meta.className = 'swipe-meta';
      meta.innerHTML = '<span class="swipe-count" aria-live="polite"><b>1</b> / ' + n + '</span>' +
        '<span class="swipe-track" aria-hidden="true"><i></i></span>' +
        '<span class="swipe-btns"><button type="button" class="swipe-btn prev" aria-label="Previous">' + arrow + '</button>' +
        '<button type="button" class="swipe-btn next" aria-label="Next">' + arrow + '</button></span>';
      row.parentNode.insertBefore(meta, row.nextSibling);

      var cur = $('b', meta), bar = $('.swipe-track i', meta);
      var prev = $('.prev', meta), next = $('.next', meta);
      bar.style.width = (100 / n) + '%';

      var step = function () {
        var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
        return items[0].getBoundingClientRect().width + gap;
      };
      var update = function () {
        var max = row.scrollWidth - row.clientWidth;
        var i = max > 0 && row.scrollLeft >= max - 4 ? n - 1 : Math.max(0, Math.min(n - 1, Math.round(row.scrollLeft / step())));
        cur.textContent = i + 1;
        bar.style.transform = 'translateX(' + (i * 100) + '%)';
        prev.disabled = i === 0;
        next.disabled = i === n - 1;
      };
      var raf;
      row.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
      prev.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: 'smooth' }); });
      next.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: 'smooth' }); });
      update();
    });
  }

  /* ---------- landing page ---------- */

  function initHome() {
    var bar = $('[data-mobile-cta]');
    var hero = $('[data-hero]');
    var band = $('.cta-band');
    if (bar && hero && band && 'IntersectionObserver' in window) {
      var heroOut = false, bandIn = false;
      var update = function () { bar.classList.toggle('show', heroOut && !bandIn); };
      new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; update(); }).observe(hero);
      new IntersectionObserver(function (e) { bandIn = e[0].isIntersecting; update(); }).observe(band);
    }

    var form = $('#plan-form');
    if (!form) return;
    liveCheck(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkAll(form)) return;
      var data = formData(form);
      if (form.website.value) { location.href = 'thank-you.html?type=plan'; return; }
      data.type = 'plan';
      store.set(data);
      var btn = $('button[type=submit]', form);
      btn.disabled = true;
      btn.firstChild.textContent = 'Sending… ';
      Promise.all([send(data), wait(600)]).then(function () { location.href = 'thank-you.html?type=plan'; });
    });
  }

  /* ---------- form helpers ---------- */

  function formData(form) {
    var out = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.name === 'website') return;
      if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
      else if (el.type === 'checkbox') out[el.name] = el.checked;
      else out[el.name] = el.value.trim();
    });
    return out;
  }

  function checkField(field) {
    var msg = '';
    var radios = $$('input[type=radio]', field);
    var el;
    if (radios.length) {
      el = radios[0];
      if (field.hasAttribute('data-required') && !radios.some(function (r) { return r.checked; })) msg = field.getAttribute('data-msg') || 'Please choose one.';
    } else {
      el = $('input[type=tel]', field) || $('input:not([type=radio]), select, textarea', field);
      if (!el) return true;
      var val = el.type === 'checkbox' ? el.checked : el.value.trim();
      if (el.required && !val) msg = el.getAttribute('data-msg') || 'Please fill this in.';
      else if (val && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) msg = 'Please enter a valid email, like name@example.com.';
      else if (val && el.type === 'tel') {
        var digits = val.replace(/\D/g, '').length;
        if (digits < 6 || digits > 14 || /[^\d\s()+-]/.test(val)) msg = 'Please enter a valid phone number.';
      }
    }
    var err = $('.err', field);
    field.classList.toggle('has-error', !!msg);
    if (err) {
      err.textContent = msg;
      if (!err.id) err.id = 'err-' + Math.random().toString(36).slice(2, 8);
    }
    (radios.length ? radios : [el]).forEach(function (t) {
      if (msg) { t.setAttribute('aria-invalid', 'true'); if (err) t.setAttribute('aria-describedby', err.id); }
      else t.removeAttribute('aria-invalid');
    });
    return !msg;
  }

  function checkAll(root) {
    var first = null;
    $$('.field', root).forEach(function (f) { if (!checkField(f) && !first) first = f; });
    if (first) {
      var target = $('[aria-invalid]', first);
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 250);
      return false;
    }
    return true;
  }

  function liveCheck(root) {
    ['input', 'change'].forEach(function (type) {
      root.addEventListener(type, function (e) {
        var f = e.target.closest('.field');
        if (f && f.classList.contains('has-error')) checkField(f);
      });
    });
  }

  /* ---------- trial sign-up ---------- */

  function initTrial() {
    var form = $('#trial-form');
    var start = $('[data-start-dates]');
    var fmt = function (d) { return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }); };
    start.innerHTML = '<option value="">Choose a date</option>';
    for (var i = 1; i <= CONFIG.trialDays; i++) {
      var d = new Date();
      d.setDate(d.getDate() + i);
      var o = document.createElement('option');
      o.value = d.toISOString().slice(0, 10);
      o.textContent = (i === 1 ? 'Tomorrow, ' : '') + fmt(d);
      start.appendChild(o);
    }

    var program = new URLSearchParams(location.search).get('program');
    if (program && PROGRAMS[program]) form.program.value = program;

    liveCheck(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkAll(form)) return;
      if (form.website.value) { location.href = 'thank-you.html?type=trial'; return; }
      var data = formData(form);
      delete data.consent;
      data.type = 'trial';
      data.startLabel = start.options[start.selectedIndex].textContent;
      store.set(data);
      $('[data-overlay]').hidden = false;
      Promise.all([send(data), wait(900)]).then(function () { location.href = 'thank-you.html?type=trial'; });
    });
  }

  /* ---------- thank-you ---------- */

  function initThanks() {
    var type = new URLSearchParams(location.search).get('type');
    var data = store.get() || {};
    if (data.type && data.type !== type) data = {};
    var view = type === 'plan' ? 'plan' : type === 'trial' && data.firstName ? 'trial' : 'none';
    var section = $('[data-view="' + view + '"]');
    section.hidden = false;
    $$('[data-show]').forEach(function (el) { el.hidden = el.getAttribute('data-show') !== view; });

    if (data.firstName) $$('[data-first-name]', section).forEach(function (el) { el.textContent = data.firstName; });
    else $$('[data-name-wrap]', section).forEach(function (el) { el.hidden = true; });
    if (data.email) $$('[data-masked-email]', section).forEach(function (el) { el.textContent = maskEmail(data.email); });
    if (data.phone) $$('[data-masked-phone]', section).forEach(function (el) { el.textContent = maskPhone(data.phoneCode, data.phone); });
    if (view === 'trial') {
      $('[data-start]', section).textContent = data.startLabel || data.start;
      $('[data-where]', section).textContent = data.where;
      $('[data-time]', section).textContent = data.time;
    }
  }

  /* ---------- boot ---------- */

  function boot() {
    initCommon();
    var page = document.body.getAttribute('data-page');
    if (page === 'home') initHome();
    if (page === 'trial') initTrial();
    if (page === 'thanks') initThanks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
