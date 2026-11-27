/* NAMTECH front-end fixes (26 Nov 2026)
 * 1) Header jump: when the page is scrolled down, the top bars are tucked away.
 *    Opening a main-bar menu (Academics, Programs...) used to bring the full
 *    header back, pushing the menu 76px down under the cursor so the wrong
 *    menu opened. Keep the header where it is while a main-bar menu is open.
 * 2) Remove every "Read story" link (story cards and research cards).
 * 3) About us: "Created to aid India's growth" image/panel block 50/50.
 * 4) Our Story timeline (desktop): section stays pinned while the years
 *    advance on scroll; clicking a year or arrow scrolls to that year.
 * 5) Key Pillars (pill layout) with intro text: wider left column.
 */
(function () {
  if (window.__ntFixes) return;
  window.__ntFixes = 1;

  /* ---------- 1. Header hold ---------- */
  var prev = false, hold = false, lastY = window.scrollY;
  var T = 'translateY(calc(-1 * var(--nt-header-collapse, 0px)))';
  function hdr() { return document.querySelector('header.nt-header'); }
  function setHold(h, v) { hold = v; h.style.transform = v ? T : ''; }
  function syncHeader() {
    var h = hdr();
    if (!h) return;
    if (h.classList.contains('is-hidden')) { prev = true; if (hold) setHold(h, false); return; }
    var open = !!h.querySelector('.nt-mainbar [data-open="true"]');
    if (open && (prev || hold)) { if (!hold) setHold(h, true); }
    else { if (hold) setHold(h, false); prev = false; }
  }
  window.addEventListener('scroll', function () {
    var y = window.scrollY, h = hdr();
    if (h && hold && (y < lastY - 6 || y < h.offsetHeight)) { setHold(h, false); prev = false; }
    lastY = y;
  }, { passive: true });

  /* ---------- 2. Remove "Read story" links ---------- */
  function hideReadStory(root) {
    var links = (root || document).querySelectorAll('a.nt-link-arrow');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.style.display !== 'none' && /^\s*Read story/i.test(a.textContent)) a.style.display = 'none';
    }
  }

  /* ---------- 2b. Partner story cards: Academic / Corporate tag ----------
     Keyed by the story slug (from /partnerships/stories/<slug>), so renaming a
     partner does not break it. Add new partners here. */
  var STORY_TAGS = {
    'mit': 'Academic', 'carnegie-mellon-university': 'Academic', 'iit-roorkee': 'Academic', 'tum-asia': 'Academic',
    'amns-india': 'Corporate', 'siemens': 'Corporate', 'cisco': 'Corporate', 'micron': 'Corporate',
    'festo': 'Corporate', 'abb': 'Corporate', 'schneider-electric': 'Corporate', 'lt-heavy-engineering': 'Corporate'
  };
  function tagStories() {
    var cards = document.querySelectorAll('.nt-story-card--text:not([data-nt-tag])');
    for (var i = 0; i < cards.length; i++) {
      var a = cards[i].querySelector('a[href*="/partnerships/stories/"]');
      if (!a) continue;
      var slug = a.getAttribute('href').split('/stories/')[1].replace(/[\/?#].*$/, '');
      var body = cards[i].querySelector('.nt-story-card__body');
      if (STORY_TAGS[slug] && body) {
        cards[i].setAttribute('data-nt-tag', STORY_TAGS[slug]);
        body.setAttribute('data-nt-tag', STORY_TAGS[slug]);
      }
    }
  }

  /* ---------- 2c. Logos not shown on specific pages ---------- */
  var HIDE_LOGOS = {
    '/schools/school-of-manufacturing-technologies': ['Schneider Electric', 'L&T Heavy Engineering', 'AM/NS India']
  };
  function hidePageLogos() {
    var list = HIDE_LOGOS[location.pathname.replace(/\/$/, '')];
    if (!list) return;
    var imgs = document.querySelectorAll('.nt-logos li img');
    for (var i = 0; i < imgs.length; i++) {
      if (list.indexOf(imgs[i].alt) > -1) {
        var li = imgs[i].closest('li');
        if (li && li.style.display !== 'none') li.style.display = 'none';
      }
    }
  }

  /* ---------- 2d. 3 Million Mission map: version with extra pulsing dots
     (Jammu & Kashmir / Ladakh and Andaman & Nicobar) ---------- */
  var MAP_SRC = '/images/india-map-nt.svg?v=2';
  function swapMissionMap() {
    var imgs = document.querySelectorAll('img.nt-mission__map');
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].getAttribute('src') !== MAP_SRC) imgs[i].setAttribute('src', MAP_SRC);
    }
  }

  /* ---------- 2e. Blog pages: load an image file big enough for how it is shown ----------
     Blog banners are 1600x480 but cards crop them to ~3:2, so the browser's default pick
     (by width only) was too small and looked blurry. Pick by the size actually needed. */
  var sharpTimer = 0;
  function sharpenBlogImages() {
    if (!/^\/blogs(\/|$)/.test(location.pathname)) return;
    var imgs = document.querySelectorAll('img[srcset]');
    for (var i = 0; i < imgs.length; i++) {
      var im = imgs[i], r = im.getBoundingClientRect();
      if (r.width < 40) continue;
      var aw = +im.getAttribute('width'), ah = +im.getAttribute('height'), need = r.width;
      if (aw && ah && getComputedStyle(im).objectFit === 'cover') need = Math.max(r.width, r.height * aw / ah);
      var s = Math.ceil(need) + 'px';
      if (im.getAttribute('sizes') !== s) im.setAttribute('sizes', s);
    }
  }
  /* wide banner images (about 3.3:1) are shown uncropped so they stay sharp:
     blog post header = title on purple, full banner below; featured post = banner, panel below */
  function bannerBlog() {
    if (!/^\/blogs(\/|$)/.test(location.pathname)) return;
    function mark(box, img, cls) {
      var w = +img.getAttribute('width'), h = +img.getAttribute('height');
      if (w && h && w / h >= 2) { box.classList.add(cls); box.style.setProperty('--nt-ar', w + ' / ' + h); }
    }
    var heroImg = document.querySelector('.nt-page-hero .nt-page-hero__media img');
    if (heroImg) mark(heroImg.closest('.nt-page-hero'), heroImg, 'nt-hero--banner');
    var feats = document.querySelectorAll('.nt-blog-feature');
    for (var i = 0; i < feats.length; i++) {
      var fi = feats[i].querySelector('.nt-blog-feature__media img');
      if (fi) mark(feats[i], fi, 'nt-feature--banner');
    }
  }
  function queueSharpen() { clearTimeout(sharpTimer); sharpTimer = setTimeout(function () { bannerBlog(); sharpenBlogImages(); }, 150); }
  window.addEventListener('resize', queueSharpen);

  
  /* ---------- 6. Moving Logo Strip (Infinite Smooth Marquee) ---------- */
  function setupLogoMarquee() {
    var bands = document.querySelectorAll('.nt-logo-band');
    for (var i = 0; i < bands.length; i++) {
      var band = bands[i];
      var list = band.querySelector('.nt-logo-band__list');
      if (!list || list.getAttribute('data-nt-marquee') === '1') continue;

      var items = Array.prototype.slice.call(list.children);
      if (items.length < 2) continue;

      list.setAttribute('data-nt-marquee', '1');

      // Ensure block width is at least viewport width so there are no empty gaps
      var minWidth = Math.max(window.innerWidth || 1200, 1600);
      var curWidth = list.scrollWidth;
      while (curWidth < minWidth && items.length > 0) {
        for (var j = 0; j < items.length; j++) {
          var clone = items[j].cloneNode(true);
          list.appendChild(clone);
        }
        curWidth = list.scrollWidth;
      }

      // Clone the entire first block to create the exact matching second half
      var block1 = Array.prototype.slice.call(list.children);
      var frag = document.createDocumentFragment();
      for (var k = 0; k < block1.length; k++) {
        var clone2 = block1[k].cloneNode(true);
        clone2.setAttribute('aria-hidden', 'true');
        frag.appendChild(clone2);
      }
      list.appendChild(frag);

      band.classList.add('nt-logo-band--moving');
    }
  }

  new MutationObserver(function (ms) {
    var added = false, header = false;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.type === 'attributes') {
        var t = m.target;
        if (t.nodeType === 1 && t.closest && t.closest('header.nt-header')) header = true;
      } else if (m.addedNodes.length) {
        added = true;
      }
    }
    if (header) syncHeader();
    if (added) { hideReadStory(); tagStories(); hidePageLogos(); swapMissionMap(); queueSharpen(); setupLogoMarquee(); }
  }).observe(document.documentElement, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'data-open']
  });

  /* ---------- 3. Styles for 4 and 5 ---------- */
  var css = document.createElement('style');
  css.id = 'nt-fixes-css';
  css.textContent =
    '@media (min-width: 992px){' +
      /* About us: image / purple panel 50-50 */
      '.nt-feature.nt-feature--half{grid-template-columns:1fr 1fr}' +
      /* Our Story: pinned timeline */
      '.nt-timeline.nt-tl-pin{height:calc(100vh + (var(--tl-n, 5) - 1) * 50vh);padding-top:0;padding-bottom:0}' +
      '.nt-timeline.nt-tl-pin > .container{position:sticky;top:var(--nt-header-offset, 76px);' +
        'min-height:calc(100vh - var(--nt-header-offset, 76px));display:flex;flex-direction:column;justify-content:center;' +
        'padding-top:1rem;padding-bottom:1rem;transition:top .3s cubic-bezier(.22,1,.36,1)}' +
      /* keep the whole pinned section (heading, photo, years) inside the screen; photo a little smaller */
      '.nt-timeline.nt-tl-pin .nt-split-head{margin-bottom:1.5rem!important}' +
      '.nt-timeline.nt-tl-pin .nt-timeline__panel{min-height:0!important}' +
      '.nt-timeline.nt-tl-pin .nt-timeline__media{width:auto!important;height:clamp(16rem, calc(100vh - 25rem), 24rem)!important;aspect-ratio:4/3;justify-self:end}' +
      '.nt-timeline.nt-tl-pin .nt-timeline__axis{margin-top:1.25rem!important;padding-top:2rem!important}' +
    '}' +
    /* Key Pillars (pill layout): when the section has intro text, give the left column
       3 columns instead of 2 + offset, so the text is readable and the cards stay aligned */
    '@media (min-width: 1200px){' +
      '.nt-pillars--pill .row:has(.nt-pillars__body) > div:first-child{width:25%}' +
      '.nt-pillars--pill .row:has(.nt-pillars__body) > div:last-child{margin-left:0}' +
    '}';
  css.textContent +=
    /* Home hero badge: white patch, black text */
    '.nt-hero__badges{background:#fff!important;border-color:#fff!important}' +
    '.nt-hero__badges span{background:transparent!important;color:#000!important}' +
    /* Programme cards: same height for the Mode / Intake / Duration row on every card */
    '.nt-program-card__facts{min-height:6.5rem}' +
    /* Partner story cards: tag pill + 3-line title area so every description starts at the same height */
    '.nt-story-card--text .nt-story-card__body[data-nt-tag]::before{content:attr(data-nt-tag) " Partner";align-self:flex-start;' +
      'border:1px solid #5d24fc;color:#5d24fc;border-radius:999px;padding:.3rem .95rem;font-size:.8125rem;line-height:1.2;font-weight:400}' +
    '.nt-carousel--story-text .nt-story-card--text h3{min-height:calc(3 * 1.25em)}' +
    '@media (max-width: 767.98px){.nt-carousel--story-text .nt-story-card--text h3{min-height:calc(4 * 1.25em)}}' +
    /* Partner story cards sized to the client reference (at 1600px: 470px cards, 35px titles, 18px text) */
    '.nt-carousel--story-text .nt-carousel__track{--slide:min(29.375rem, 84vw)!important;--gap:.625rem!important}' +
    '.nt-carousel--story-text .nt-story-card--text .nt-story-card__body{padding:clamp(1.5rem, 2.6vw, 2.3rem)!important;gap:1.25rem!important}' +
    '.nt-carousel--story-text .nt-story-card--text h3{font-size:clamp(1.375rem, 1rem + 1vw, 1.875rem)!important;line-height:1.25!important}' +
    '.nt-carousel--story-text .nt-story-card--text p{font-size:clamp(.9375rem, .85rem + .25vw, 1rem)!important;line-height:1.55!important;text-align:left}' +
    '.nt-story-card--text .nt-story-card__body[data-nt-tag]::before{font-size:.75rem!important;padding:.28rem .8rem!important}' +
    /* School / centre / programme cards (image + purple panel): shorter, less empty space;
       cards still grow when their text needs more room */
    '@media (min-width: 768px){.nt-carousel--programs .nt-program-card .nt-program-card__media{min-height:28rem!important}}' +
    /* "Learn more" arrow: visible white circle on the purple panel */
    '.nt-program-card .nt-arrow-dot{background:#fff!important;color:#5d24fc!important;width:1.5rem!important;height:1.5rem!important}' +
    '.nt-program-card .nt-arrow-dot svg{width:.85rem;height:.85rem}' +
    /* Footer: address box keeps its line breaks (campus / registered office / CIN) */
    'footer address{white-space:pre-line}' +
    /* Blog: wide banners shown uncropped (see bannerBlog) */
    '.nt-blog-feature.nt-feature--banner .nt-blog-feature__media{aspect-ratio:var(--nt-ar)!important;min-height:0!important}' +
    '@media (min-width: 992px){.nt-blog-feature.nt-feature--banner .nt-blog-feature__panel{position:relative!important;width:100%!important;min-height:0!important;right:auto!important;bottom:auto!important}' +
      '.nt-blog-feature.nt-feature--banner .nt-blog-feature__panel > *{max-width:56rem}}' +
    '.nt-page-hero.nt-hero--banner .nt-page-hero__grid{grid-template-columns:1fr!important;min-height:0!important}' +
    '@media (min-width: 768px){.nt-page-hero.nt-hero--banner .nt-page-hero__content{padding:3.5rem max(var(--nt-edge, 1rem), calc((100vw - 1280px) / 2)) 2.25rem!important}}' +
    '.nt-page-hero.nt-hero--banner .nt-page-hero__media{min-height:0!important;width:min(1280px, calc(100% - 2 * var(--nt-edge, 1rem)));' +
      'margin:0 auto 3.5rem;aspect-ratio:var(--nt-ar);border-radius:.75rem;overflow:hidden}' +
    /* Partner logo strip: logos 10% larger */
    '.nt-logos:not(.nt-logos--compact) img{height:clamp(1.925rem, 3.3vw, 3.025rem);max-width:9.9rem}';
  (document.head || document.documentElement).appendChild(css);

  /* ---------- 4. About us: 50/50 feature block ---------- */
  function syncFeature() {
    var onAbout = /^\/about\/?$/.test(location.pathname);
    var f = document.querySelectorAll('.nt-feature');
    for (var i = 0; i < f.length; i++) f[i].classList.toggle('nt-feature--half', onAbout);
  }

  /* ---------- 5. Our Story: years advance while the section stays pinned ---------- */
  var mq = window.matchMedia('(min-width: 992px)');
  function tlParts(sec) {
    var btns = sec.querySelectorAll('.nt-timeline__axis button');
    var cur = 0;
    for (var i = 0; i < btns.length; i++) if (btns[i].hasAttribute('aria-current')) cur = i;
    return { btns: btns, n: btns.length, cur: cur };
  }
  function tlGeom(sec) {
    var H = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nt-header-offset')) || 76;
    var r = sec.getBoundingClientRect();
    var range = sec.offsetHeight - window.innerHeight + H;
    return { H: H, top: r.top, range: Math.max(1, range), absTop: r.top + window.scrollY };
  }
  function setupTimeline() {
    var secs = document.querySelectorAll('section.nt-timeline');
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i], p = tlParts(sec);
      if (p.n < 2) continue;
      sec.style.setProperty('--tl-n', p.n);
      sec.classList.toggle('nt-tl-pin', mq.matches);
      if (!sec.__ntTl) {
        sec.__ntTl = 1;
        /* clicking a year or an arrow scrolls to that year's spot so scroll and year stay in sync */
        sec.addEventListener('click', function (e) {
          var s = e.currentTarget;
          if (!e.isTrusted || !s.classList.contains('nt-tl-pin')) return;
          if (!e.target.closest('.nt-timeline__axis button, .nt-carousel__arrow')) return;
          setTimeout(function () {
            var q = tlParts(s), g = tlGeom(s);
            s.__ntTlLock = Date.now() + 900;
            window.scrollTo({ top: g.absTop - g.H + ((q.cur + 0.5) / q.n) * g.range, behavior: 'smooth' });
          }, 0);
        });
      }
    }
    syncTimeline();
  }
  function syncTimeline() {
    if (!mq.matches) return;
    var secs = document.querySelectorAll('section.nt-timeline.nt-tl-pin');
    for (var i = 0; i < secs.length; i++) {
      var sec = secs[i];
      if (sec.__ntTlLock && Date.now() < sec.__ntTlLock) continue;
      var p = tlParts(sec), g = tlGeom(sec);
      var prog = (g.H - g.top) / g.range;
      if (prog < 0 || prog > 1) continue;
      var idx = Math.min(p.n - 1, Math.max(0, Math.floor(prog * p.n)));
      if (idx !== p.cur) p.btns[idx].click();
    }
  }
  window.addEventListener('scroll', syncTimeline, { passive: true });
  window.addEventListener('resize', function () { setupTimeline(); setupLogoMarquee(); });
  if (mq.addEventListener) mq.addEventListener('change', setupTimeline);

  
  /* ---------- 6. Moving Logo Strip (Infinite Smooth Marquee) ---------- */
  function setupLogoMarquee() {
    var bands = document.querySelectorAll('.nt-logo-band');
    for (var i = 0; i < bands.length; i++) {
      var band = bands[i];
      var list = band.querySelector('.nt-logo-band__list');
      if (!list || list.getAttribute('data-nt-marquee') === '1') continue;

      var items = Array.prototype.slice.call(list.children);
      if (items.length < 2) continue;

      list.setAttribute('data-nt-marquee', '1');

      // Ensure block width is at least viewport width so there are no empty gaps
      var minWidth = Math.max(window.innerWidth || 1200, 1600);
      var curWidth = list.scrollWidth;
      while (curWidth < minWidth && items.length > 0) {
        for (var j = 0; j < items.length; j++) {
          var clone = items[j].cloneNode(true);
          list.appendChild(clone);
        }
        curWidth = list.scrollWidth;
      }

      // Clone the entire first block to create the exact matching second half
      var block1 = Array.prototype.slice.call(list.children);
      var frag = document.createDocumentFragment();
      for (var k = 0; k < block1.length; k++) {
        var clone2 = block1[k].cloneNode(true);
        clone2.setAttribute('aria-hidden', 'true');
        frag.appendChild(clone2);
      }
      list.appendChild(frag);

      band.classList.add('nt-logo-band--moving');
    }
  }

  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) {
      if (ms[i].addedNodes.length) {
        syncFeature(); setupTimeline(); setupLogoMarquee();
        return;
      }
    }
  }).observe(document.documentElement, { subtree: true, childList: true });

  function init() { hideReadStory(); tagStories(); hidePageLogos(); swapMissionMap(); syncHeader(); syncFeature(); setupTimeline(); setupLogoMarquee(); queueSharpen(); setupLogoMarquee(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
