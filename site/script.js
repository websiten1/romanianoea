/* ROEA — site script
   - Builds a single source-of-truth navigation drawer.
   - Mounts the drawer directly on <body> so nothing can clip it.
   - Uses native <a href> navigation; links are not intercepted. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var path = (location.pathname || '').toLowerCase();
    var isRo = path.indexOf('/ro/') !== -1;
    var assetPrefix = isRo ? '../assets/' : 'assets/';
    var localeHomeAlt = isRo ? '../index.html' : 'ro/index.html';

    /* Brand wordmark: replace <br> with a space so words don't smash. */
    document.querySelectorAll('.site-header .brand__name br').forEach(function (br) {
      br.parentNode.insertBefore(document.createTextNode(' '), br);
      br.parentNode.removeChild(br);
    });

    /* Neutralise the old inline header Donate button; drawer owns it now. */
    document.querySelectorAll('.site-header .btn-gold, .site-header .btn-primary').forEach(function (a) {
      a.classList.add('header-cta');
      a.classList.remove('btn', 'btn-gold', 'btn-primary');
    });

    var labels = isRo
      ? {
          home: 'Acasă', about: 'Despre Episcopie', hierarchs: 'Ierarhi',
          history: 'Istorie', youth: 'Tineret',
          news: 'Știri', letter: 'Pastorala 2026',
          structure: 'Organizare', contact: 'Contact',
          donate: 'Donează',
          drawerEyebrow: 'Navigare',
          drawerTitle: 'Episcopia Ortodoxă Rom&acirc;nă a Americii',
          hierarchsEyebrow: 'Ierarhii noștri',
          natRole: '&Icirc;naltpreasf.',
          natName: 'Arhiepiscop Nathaniel',
          andrRole: 'Preasfinția Sa',
          andrName: 'Episcop Andrei',
          footLine: 'Vatra Rom&acirc;nească · Grass Lake, Michigan',
          localeLabel: 'EN'
        }
      : {
          home: 'Home', about: 'About', hierarchs: 'Hierarchs',
          history: 'History', youth: 'Youth',
          news: 'News', letter: 'Pastoral Letter 2026',
          structure: 'Organization', contact: 'Contact',
          donate: 'Donate',
          drawerEyebrow: 'Navigation',
          drawerTitle: 'Romanian Orthodox Episcopate of America',
          hierarchsEyebrow: 'Our Hierarchs',
          natRole: 'His Eminence',
          natName: 'Archbishop Nathaniel',
          andrRole: 'His Grace',
          andrName: 'Bishop Andrei',
          footLine: 'Vatra Rom&acirc;nească · Grass Lake, Michigan',
          localeLabel: 'RO'
        };

    var navItems = [
      { label: labels.home,      href: 'index.html' },
      { label: labels.about,     href: 'about.html' },
      { label: labels.hierarchs, href: 'hierarchs.html' },
      { label: labels.history,   href: 'vatra.html' },
      { label: labels.youth,     href: 'youth.html' },
      { label: labels.news,      href: 'news.html' },
      { label: labels.letter,    href: 'pastoral-letter-2026.html' },
      { label: labels.structure, href: 'structure.html' },
      { label: labels.contact,   href: 'contact.html' }
    ];

    var pathFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!pathFile || pathFile === '/') pathFile = 'index.html';
    if (pathFile.indexOf('.') === -1) pathFile = pathFile + '.html';

    /* --------------------------------------------------------------
       Build / relocate the drawer onto <body>. This keeps it above
       every stacking context and outside any clipping ancestor.
       -------------------------------------------------------------- */
    var existingMenu = document.getElementById('primaryMenu');
    var drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.id = 'siteDrawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', isRo ? 'Meniu principal' : 'Primary menu');

    drawer.innerHTML =
      '<button type="button" class="drawer__close" id="drawerClose" aria-label="Close menu">&times;</button>' +
      '<div class="drawer__top">' +
        '<span class="drawer__eyebrow">' + labels.drawerEyebrow + '</span>' +
        '<h4 class="drawer__title">' + labels.drawerTitle + '</h4>' +
      '</div>' +
      '<nav class="drawer__nav" aria-label="Primary"><ul class="menu" id="primaryMenu"></ul></nav>' +
      '<a class="drawer__cta" href="donate.html">' +
        '<span>' + labels.donate + '</span>' +
        '<span class="drawer__cta-arrow" aria-hidden="true"></span>' +
      '</a>' +
      '<div class="drawer__hierarchs">' +
        '<span class="drawer__eyebrow drawer__eyebrow--light">' + labels.hierarchsEyebrow + '</span>' +
        '<div class="hier-pair">' +
          '<a class="hier-chip" href="hierarchs.html#nathaniel">' +
            '<span class="hier-chip__ring hier-chip__ring--paper">' +
              '<span class="hier-chip__circle">' +
                '<img src="' + assetPrefix + 'nathaniel.png" alt="" />' +
              '</span>' +
            '</span>' +
            '<span class="hier-chip__text">' +
              '<small>' + labels.natRole + '</small>' +
              '<strong>' + labels.natName + '</strong>' +
            '</span>' +
          '</a>' +
          '<a class="hier-chip" href="bishop-andrei.html">' +
            '<span class="hier-chip__ring hier-chip__ring--ink">' +
              '<span class="hier-chip__circle">' +
                '<img src="' + assetPrefix + 'andrei.png" alt="" />' +
              '</span>' +
            '</span>' +
            '<span class="hier-chip__text">' +
              '<small>' + labels.andrRole + '</small>' +
              '<strong>' + labels.andrName + '</strong>' +
            '</span>' +
          '</a>' +
        '</div>' +
      '</div>' +
      '<div class="drawer__foot">' +
        '<span class="drawer__foot-line">' + labels.footLine + '</span>' +
        '<a class="drawer__locale" href="' + localeHomeAlt + '">' + labels.localeLabel + '</a>' +
      '</div>';

    /* Remove any pre-existing header nav BEFORE mounting the new one,
       so we never have two #primaryMenu nodes in the DOM at once. */
    if (existingMenu) {
      var hostNav = existingMenu.closest('nav');
      if (hostNav) hostNav.parentNode.removeChild(hostNav);
      else existingMenu.parentNode.removeChild(existingMenu);
    }

    document.body.appendChild(drawer);

    /* Populate the link list (inside the freshly mounted drawer). */
    var menu = drawer.querySelector('#primaryMenu');
    navItems.forEach(function (item) {
      var li = document.createElement('li');
      if (pathFile === item.href.toLowerCase()) li.className = 'active';
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      li.appendChild(a);
      menu.appendChild(li);
    });

    /* Overlay. */
    var overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.id = 'drawerOverlay';
    document.body.appendChild(overlay);

    function openDrawer() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      overlay.classList.add('is-visible');
      document.body.classList.add('no-scroll', 'drawer-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
    function closeDrawer() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      overlay.classList.remove('is-visible');
      document.body.classList.remove('no-scroll', 'drawer-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    var toggle = document.getElementById('navToggle');
    if (toggle) {
      toggle.setAttribute('type', 'button');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'siteDrawer');
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (drawer.classList.contains('is-open')) closeDrawer();
        else openDrawer();
      });
    }

    overlay.addEventListener('click', closeDrawer);
    var closeBtn = drawer.querySelector('#drawerClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });

    /* When a link inside the drawer is clicked, just close it cosmetically;
       native <a href> navigation does the real work. */
    drawer.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#') return;
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      document.body.classList.remove('no-scroll', 'drawer-open');
    });

    /* --------------------------------------------------------------
       Footer — rebuild every page footer from a single source of
       truth so labels match the simplified drawer menu. No logo.
       Burgundy surface, white type.
       -------------------------------------------------------------- */
    var footer = document.querySelector('.site-footer');
    if (footer) {
      var footerLabels = isRo
        ? {
            eyebrow: 'Est. 1929 · Vatra Rom&acirc;nească, Grass Lake, Michigan',
            title: 'Episcopia Ortodoxă Rom&acirc;nă a Americii',
            nav: [
              { label: 'Despre', href: 'about.html' },
              { label: 'Ierarhi', href: 'hierarchs.html' },
              { label: 'Istorie', href: 'vatra.html' },
              { label: 'Tineret', href: 'youth.html' },
              { label: 'Știri', href: 'news.html' },
              { label: 'Pastorala 2026', href: 'pastoral-letter-2026.html' },
              { label: 'Organizare', href: 'structure.html' },
              { label: 'Contact', href: 'contact.html' },
              { label: 'Donează', href: 'donate.html' }
            ],
            address: '2535 Grey Tower Road · Jackson, MI 49201',
            phone: '(517) 522-4800',
            rights: '© 2026 Episcopia Ortodoxă Rom&acirc;nă a Americii · Toate drepturile rezervate.'
          }
        : {
            eyebrow: 'Est. 1929 · Vatra Rom&acirc;nească, Grass Lake, Michigan',
            title: 'Romanian Orthodox Episcopate of America',
            nav: [
              { label: 'About', href: 'about.html' },
              { label: 'Hierarchs', href: 'hierarchs.html' },
              { label: 'History', href: 'vatra.html' },
              { label: 'Youth', href: 'youth.html' },
              { label: 'News', href: 'news.html' },
              { label: 'Pastoral Letter 2026', href: 'pastoral-letter-2026.html' },
              { label: 'Organization', href: 'structure.html' },
              { label: 'Contact', href: 'contact.html' },
              { label: 'Donate', href: 'donate.html' }
            ],
            address: '2535 Grey Tower Road · Jackson, MI 49201',
            phone: '(517) 522-4800',
            rights: '© 2026 Romanian Orthodox Episcopate of America · All rights reserved.'
          };

      var navHtml = footerLabels.nav.map(function (item) {
        return '<a href="' + item.href + '">' + item.label + '</a>';
      }).join('<span class="footer-nav__dot" aria-hidden="true"></span>');

      footer.innerHTML =
        '<div class="container footer-inner">' +
          '<div class="footer-rule" aria-hidden="true"></div>' +
          '<span class="footer-eyebrow">' + footerLabels.eyebrow + '</span>' +
          '<h3 class="footer-title">' + footerLabels.title + '</h3>' +
          '<nav class="footer-nav" aria-label="Footer">' + navHtml + '</nav>' +
          '<div class="footer-contact">' +
            '<span>' + footerLabels.address + '</span>' +
            '<span class="footer-sep" aria-hidden="true"></span>' +
            '<span>' + footerLabels.phone + '</span>' +
          '</div>' +
          '<div class="socials">' +
            '<a href="https://www.facebook.com/ROEofA" aria-label="Facebook">F</a>' +
            '<a href="https://twitter.com/ROEofA" aria-label="Twitter">T</a>' +
            '<a href="https://www.youtube.com/user/RomanianDioceseROEA" aria-label="YouTube">Y</a>' +
          '</div>' +
          '<div class="copyright">' + footerLabels.rights + '</div>' +
        '</div>';
    }
  });
})();
