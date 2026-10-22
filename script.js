(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* ---------- Mobile navigation ---------- */
  var header = $('.site-header');
  var toggle = $('.menu-toggle');
  var nav = $('.main-nav');

  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    $$('a', nav).forEach(function (link) { link.addEventListener('click', function () { setNav(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setNav(false); });
  }

  /* ---------- Header shadow + back-to-top button ---------- */
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '&uarr;';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('scrolled', y > 12);
    toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealTargets = $$('.reveal');
  if (revealTargets.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add('is-visible');
            observer.unobserve(el);
            // Once the entrance has finished, hand the element back to its own hover styles.
            window.setTimeout(function () { el.classList.remove('reveal', 'is-visible'); }, 1400);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
      revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- Open / closed status (Home) ---------- */
  var status = $('#open-status');
  if (status) {
    // Tue-Thu 5-9 PM, Fri-Sat 5-10 PM, Sun 4-8 PM, Mon closed (New York time)
    var hours = { 0: [16, 20], 1: null, 2: [17, 21], 3: [17, 21], 4: [17, 21], 5: [17, 22], 6: [17, 22] };
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var dayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
      var hour = parseInt(map.hour, 10) % 24;
      var now = hour + parseInt(map.minute, 10) / 60;
      var today = hours[dayIndex];
      var open = today && now >= today[0] && now < today[1];
      var label;
      if (open) {
        var closeHr = today[1] > 12 ? today[1] - 12 : today[1];
        label = 'OPEN NOW · UNTIL ' + closeHr + ' PM';
      } else if (today && now < today[0]) {
        label = 'OPENS TONIGHT AT ' + (today[0] > 12 ? today[0] - 12 : today[0]) + ' PM';
      } else {
        label = 'DINNER TUESDAY – SUNDAY';
      }
      status.innerHTML = '<i class="status-dot' + (open ? '' : ' closed') + '"></i> ' + label;
    } catch (err) { /* keep the static text */ }
  }

  /* ---------- Menu filters ---------- */
  var chips = $$('.filter-chip');
  if (chips.length) {
    var cards = $$('.dish-card');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('selected'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('selected');
        chip.setAttribute('aria-pressed', 'true');
        var filter = chip.getAttribute('data-filter');
        var shown = 0;
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.hidden = !match;
          card.classList.remove('filter-in');
          if (match) {
            card.classList.add('is-visible'); // never leave a filtered card invisible
            if (!reduceMotion) {
              void card.offsetWidth; // restart the animation
              card.style.setProperty('--d', (shown * 0.07) + 's');
              card.style.animationDelay = (shown * 0.07) + 's';
              card.classList.add('filter-in');
            }
            shown++;
          }
        });
      });
    });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = $('.lightbox');
  var tiles = $$('.gallery-tile');
  if (lightbox && tiles.length && typeof lightbox.showModal === 'function') {
    var bigImage = $('img', lightbox);
    var caption = $('.lightbox-caption', lightbox);
    var current = 0;
    var show = function (index) {
      current = (index + tiles.length) % tiles.length;
      var img = $('img', tiles[current]);
      var label = $('i', tiles[current]);
      if (!img) return;
      bigImage.src = img.currentSrc || img.src;
      bigImage.alt = img.alt;
      caption.textContent = (current + 1) + ' / ' + tiles.length + (label ? ' · ' + label.textContent : '');
    };
    tiles.forEach(function (tile, i) {
      tile.addEventListener('click', function () {
        if (!$('img', tile)) return; // image failed to load
        show(i);
        lightbox.showModal();
      });
    });
    $('.lightbox-close', lightbox).addEventListener('click', function () { lightbox.close(); });
    $('.lightbox-prev', lightbox).addEventListener('click', function () { show(current - 1); });
    $('.lightbox-next', lightbox).addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Reservation form ---------- */
  var form = $('.reservation-form');
  if (form) {
    var dateField = form.elements.date;
    var timeField = form.elements.time;
    var statusBox = $('.form-status', form);
    var submitBtn = $('.submit-button', form);

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function todayString() {
      var d = new Date();
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
    function parseDate(value) {
      var p = value.split('-');
      return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    }
    function timeToMinutes(text) { // "6:30 PM" -> 1110
      var m = /^(\d+):(\d+)\s*(AM|PM)$/i.exec(text);
      if (!m) return 0;
      var h = parseInt(m[1], 10) % 12;
      if (m[3].toUpperCase() === 'PM') h += 12;
      return h * 60 + parseInt(m[2], 10);
    }
    // Last bookable seating per weekday (minutes). Monday closed.
    var lastSeating = { 0: 19 * 60, 1: null, 2: 20 * 60, 3: 20 * 60, 4: 20 * 60, 5: 21 * 60 + 30, 6: 21 * 60 + 30 };

    function setStatus(text, kind) {
      statusBox.textContent = text;
      statusBox.className = 'form-status' + (kind ? ' ' + kind : '');
    }
    function refreshTimes() {
      var value = dateField.value;
      var day = value ? parseDate(value).getDay() : null;
      var isToday = value === todayString();
      var nowMin = new Date().getHours() * 60 + new Date().getMinutes();
      $$('option', timeField).forEach(function (opt) {
        if (!opt.value) return;
        var mins = timeToMinutes(opt.value);
        var off = false;
        if (day !== null) {
          if (lastSeating[day] === null || mins > lastSeating[day]) off = true;
        }
        if (isToday && mins <= nowMin) off = true;
        opt.disabled = off;
      });
      if (timeField.selectedOptions[0] && timeField.selectedOptions[0].disabled) timeField.value = '';
    }

    dateField.min = todayString();
    dateField.addEventListener('change', function () {
      dateField.classList.remove('invalid');
      if (dateField.value && parseDate(dateField.value).getDay() === 1) {
        setStatus('We’re closed on Mondays. Please choose Tuesday to Sunday.', 'error');
        dateField.classList.add('invalid');
      } else {
        setStatus('');
      }
      refreshTimes();
    });
    $$('input,select', form).forEach(function (field) {
      field.addEventListener('input', function () { field.classList.remove('invalid'); });
    });
    refreshTimes();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var problems = [];
      var name = form.elements.name;
      var email = form.elements.email;
      var guests = form.elements.guests;
      $$('input,select', form).forEach(function (f) { f.classList.remove('invalid'); });

      if (!name.value.trim()) problems.push([name, 'Please enter your name.']);
      if (!email.value.trim() || !email.checkValidity()) problems.push([email, 'Please enter a valid email address.']);
      if (!dateField.value) {
        problems.push([dateField, 'Please choose a date.']);
      } else if (dateField.value < todayString()) {
        problems.push([dateField, 'Please choose today or a future date.']);
      } else if (parseDate(dateField.value).getDay() === 1) {
        problems.push([dateField, 'We’re closed on Mondays. Please choose Tuesday to Sunday.']);
      }
      if (!timeField.value) problems.push([timeField, 'Please choose a time.']);
      if (!guests.value) problems.push([guests, 'Please choose the number of guests.']);

      if (problems.length) {
        problems.forEach(function (p) { p[0].classList.add('invalid'); });
        setStatus(problems[0][1], 'error');
        problems[0][0].focus();
        return;
      }

      var firstName = name.value.trim().split(/\s+/)[0];
      var summary = dateField.value && parseDate(dateField.value).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      submitBtn.disabled = true;
      setStatus('Sending your request…');
      window.setTimeout(function () {
        setStatus('Thanks, ' + firstName + '! We’ve noted a table for ' + guests.value.toLowerCase() + ' on ' + summary + ' at ' + timeField.value + '. We’ll be in touch to confirm.', 'success');
        form.reset();
        dateField.min = todayString();
        refreshTimes();
        submitBtn.disabled = false;
      }, reduceMotion ? 0 : 700);
    });
  }
})();