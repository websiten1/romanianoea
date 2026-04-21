/* ROEA — site UI script (drawer menu + page accents). Defensive: runs on DOMReady. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    try {
      var path = (location.pathname || '').toLowerCase();
      var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
      var isRo = path.indexOf('/ro/') !== -1;
      var lang = isRo ? 'lang-ro' : 'lang-en';

      var pageClass = 'page-home';
      if (/^index\.html?$/.test(file) || file === '' || file === '/') pageClass = 'page-home';
      else if (/^about\./.test(file)) pageClass = 'page-about';
      else if (/^hierarchs?\./.test(file) || /^bishop-/.test(file)) pageClass = 'page-hierarchs';
      else if (/^vatra\./.test(file)) pageClass = 'page-vatra';
      else if (/^youth\./.test(file)) pageClass = 'page-youth';
      else if (/^news\./.test(file) || /^event-/.test(file)) pageClass = 'page-news';
      else if (/^solia/.test(file)) pageClass = 'page-solia';
      else if (/^donate\./.test(file)) pageClass = 'page-donate';
      else if (/^structure\./.test(file)) pageClass = 'page-structure';
      else if (/^contact\./.test(file)) pageClass = 'page-contact';
      else if (/^pastoral-letter/.test(file)) pageClass = 'page-letter';

      document.body.classList.add(pageClass, lang);
      if (!document.body.classList.contains('v2')) document.body.classList.add('v2');
    } catch (e) { /* ignore */ }

    /* ----------------------------------------------------------
       Fix brand wordmark whitespace: `<br>` is visually hidden via
       CSS on a single line, which would smash adjacent words. Replace
       any <br> inside the brand name with a space so the wordmark
       reads correctly on a single line on desktop.
       ---------------------------------------------------------- */
    document.querySelectorAll('.site-header .brand__name br').forEach(function (br) {
      var space = document.createTextNode(' ');
      br.parentNode.insertBefore(space, br);
      br.parentNode.removeChild(br);
    });

    /* ----------------------------------------------------------
       Rebuild the primary menu from an authoritative source so
       every page gets the same, correct, complete drawer nav.
       ---------------------------------------------------------- */
    var isRo = document.body.classList.contains('lang-ro');
    var labels = isRo
      ? {
          home: 'Acasă',
          about: 'Despre Episcopie',
          hierarchs: 'Ierarhi',
          vatra: 'Vatra Românească',
          youth: 'Tineret și tabere',
          news: 'Știri și evenimente',
          letter: 'Pastorala 2026',
          solia: 'Solia',
          structure: 'Organizare',
          contact: 'Contact',
          donate: 'Donează',
          eyebrow: 'Centrul Episcopiei',
          followLabel: 'Urmărește-ne',
          mainNav: 'Meniu principal',
          // Short labels for the inline header strip
          headerAbout: 'Despre',
          headerHier: 'Ierarhi',
          headerNews: 'Știri'
        }
      : {
          home: 'Home',
          about: 'About the Episcopate',
          hierarchs: 'Hierarchs',
          vatra: 'The Vatra Românească',
          youth: 'Youth & Camps',
          news: 'News & Events',
          letter: 'Paschal Letter 2026',
          solia: 'Solia · The Herald',
          structure: 'Structure',
          contact: 'Contact',
          donate: 'Donate',
          eyebrow: 'Episcopate Center',
          followLabel: 'Follow',
          mainNav: 'Main menu',
          // Short labels for the inline header strip
          headerAbout: 'About',
          headerHier: 'Hierarchs',
          headerNews: 'News'
        };

    var navItems = [
      { key: 'home',      label: labels.home,      href: 'index.html' },
      { key: 'about',     label: labels.about,     href: 'about.html' },
      { key: 'hierarchs', label: labels.hierarchs, href: 'hierarchs.html' },
      { key: 'vatra',     label: labels.vatra,     href: 'vatra.html' },
      { key: 'youth',     label: labels.youth,     href: 'youth.html' },
      { key: 'news',      label: labels.news,      href: 'news.html' },
      { key: 'letter',    label: labels.letter,    href: 'pastoral-letter-2026.html' },
      { key: 'solia',     label: labels.solia,     href: 'solia.html' },
      { key: 'structure', label: labels.structure, href: 'structure.html' },
      { key: 'contact',   label: labels.contact,   href: 'contact.html' }
    ];

    var pathFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    /* Clean-URL fallback: when Vercel strips the `.html`, pathFile may be
       an empty string or a bare slug like "about". Normalize both. */
    if (!pathFile || pathFile === '/') pathFile = 'index.html';
    if (pathFile.indexOf('.') === -1) pathFile = pathFile + '.html';

    /* Build ABSOLUTE paths so navigation works from any URL depth,
       including after Vercel's cleanUrls rewrites. */
    var navBase = isRo ? '/ro/' : '/';

    var menu = document.getElementById('primaryMenu');
    if (menu) {
      menu.innerHTML = '';
      navItems.forEach(function (item) {
        var li = document.createElement('li');
        if (pathFile === item.href.toLowerCase()) li.className = 'active';
        var a = document.createElement('a');
        a.href = navBase + item.href;
        a.textContent = item.label;
        li.appendChild(a);
        menu.appendChild(li);
      });
    }

    /* ---- Drawer overlay & open/close ---- */
    var toggle = document.getElementById('navToggle');

    function closeMenu() {
      if (menu) menu.classList.remove('is-open');
      document.body.classList.remove('drawer-open');
      var ov = document.getElementById('drawerOverlay');
      if (ov) ov.classList.remove('is-visible');
    }

    function openMenu() {
      if (menu) menu.classList.add('is-open');
      document.body.classList.add('drawer-open');
      var ov = document.getElementById('drawerOverlay');
      if (ov) ov.classList.add('is-visible');
    }

    if (toggle && menu) {
      if (!document.getElementById('drawerOverlay')) {
        var ov = document.createElement('div');
        ov.id = 'drawerOverlay';
        ov.className = 'drawer-overlay';
        document.body.appendChild(ov);
        ov.addEventListener('click', closeMenu);
      }
      if (!menu.querySelector('.drawer-close')) {
        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'drawer-close';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', closeMenu);
        menu.insertBefore(closeBtn, menu.firstChild);
      }
      toggle.setAttribute('type', 'button');
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (menu.classList.contains('is-open')) closeMenu();
        else openMenu();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });
      /* Bulletproof link navigation from inside the drawer:
         On iOS, animating the drawer away (transform) during a tap can
         cancel the click and leave the user stranded. Trigger navigation
         explicitly and defer the close animation until the next tick. */
      menu.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href) return;
        if (href.charAt(0) === '#') return; // same-page anchor
        if (a.target === '_blank' || /^(mailto:|tel:)/.test(href)) {
          closeMenu();
          return;
        }
        e.preventDefault();
        setTimeout(function () { window.location.href = a.href; }, 0);
      });
    }

    /* ---- Inject inline secondary nav (desktop) ---- */
    (function injectHeaderAux() {
      var nav = document.querySelector('.site-header .nav');
      if (!nav || nav.querySelector('.header-aux')) return;
      var aux = document.createElement('div');
      aux.className = 'header-aux';
      aux.innerHTML =
        '<a class="header-aux__link" href="' + navBase + 'about.html">' + labels.headerAbout + '</a>' +
        '<a class="header-aux__link" href="' + navBase + 'hierarchs.html">' + labels.headerHier + '</a>' +
        '<a class="header-aux__link" href="' + navBase + 'news.html">' + labels.headerNews + '</a>' +
        '<a class="header-aux__cta"  href="' + navBase + 'donate.html">' + labels.donate + '</a>';
      var t = nav.querySelector('.nav-toggle');
      if (t) nav.insertBefore(aux, t);
      else nav.appendChild(aux);
    })();

    /* ---- Drawer footer (address + socials) ---- */
    (function enrichDrawer() {
      if (!menu || menu.querySelector('.drawer-foot')) return;
      var foot = document.createElement('div');
      foot.className = 'drawer-foot';
      foot.innerHTML =
        '<span class="drawer-foot__eyebrow">' + labels.eyebrow + '</span>' +
        '<p class="drawer-foot__address">2535 Grey Tower Road<br/>Jackson, MI 49201-9120</p>' +
        '<a class="drawer-foot__phone" href="tel:+15175224800">(517) 522-4800</a>' +
        '<span class="drawer-foot__eyebrow" style="margin-top:6px;">' + labels.followLabel + '</span>' +
        '<div class="drawer-foot__socials">' +
          '<a href="https://www.facebook.com/ROEofA" target="_blank" rel="noopener" aria-label="Facebook">f</a>' +
          '<a href="https://twitter.com/ROEofA" target="_blank" rel="noopener" aria-label="Twitter">t</a>' +
          '<a href="https://www.youtube.com/user/RomanianDioceseROEA" target="_blank" rel="noopener" aria-label="YouTube">y</a>' +
        '</div>';
      menu.appendChild(foot);
    })();

    /* ---- Sticky header scroll state ---- */
    (function stickyHeaderState() {
      var header = document.querySelector('.site-header');
      if (!header) return;
      var onScroll = function () {
        if (window.scrollY > 8) document.body.classList.add('scrolled');
        else document.body.classList.remove('scrolled');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    })();
  });
})();
