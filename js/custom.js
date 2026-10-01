AOS.init();


//   < === Trusted Partner Section Animation === >

function initTrustedPartnerAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const trustedItems = document.querySelectorAll('.trusted-partner .trusted-item');
    if (trustedItems.length > 0) {
        trustedItems.forEach((item) => {
            const image = item.querySelector('.trusted-image img');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: "top 100%",
                    end: "center center",
                    scrub: 1,
                }
            });

            tl.fromTo(item,
                { x: () => window.innerWidth * 0.5 },
                {
                    x: 0,
                    ease: "none",
                    force3D: true
                }
            );

            if (image) {
                tl.fromTo(image,
                    { width: "40%" },
                    {
                        width: "100%",
                        ease: "none"
                    },
                    "<"
                );
            }
        });

        window.addEventListener('load', function () {
            ScrollTrigger.refresh();
        });
        setTimeout(function () {
            ScrollTrigger.refresh();
        }, 500);
    }
}


//   < === Number Counter Animation (.num-counter) === >

function initNumCounters() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const counters = document.querySelectorAll('.num-counter');
    if (!counters.length) return;

    counters.forEach((el) => {
        const rawText = el.textContent.trim();
        const match = rawText.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);

        if (!match) return;

        const prefix = match[1] || '';
        const targetNum = parseFloat(match[2]);
        const suffix = match[3] || '';
        const isDecimal = match[2].includes('.');

        el.textContent = prefix + (isDecimal ? '0.0' : '0') + suffix;

        const counterObj = { value: 0 };

        gsap.to(counterObj, {
            value: targetNum,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
            },
            onUpdate: function () {
                const current = isDecimal ? counterObj.value.toFixed(1) : Math.floor(counterObj.value);
                el.textContent = prefix + current + suffix;
            },
            onComplete: function () {
                el.textContent = prefix + targetNum + suffix;
            }
        });
    });
}

function initAll() {
    initTrustedPartnerAnimation();
    initNumCounters();
    initSmoothScroll();
    initWordScaleAnimation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}


//   < === smooth scroll Animation === >  
function initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({ duration: 1.2 });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }
}


//   < === Word Scale Animation === >

function initWordScaleAnimation() {
    if (typeof gsap === 'undefined') {
        return;
    }

    const elements = document.querySelectorAll('.split-words-scale');
    if (!elements.length) return;

    elements.forEach(element => {
        if (element.dataset.wordAnimDone) return;
        element.dataset.wordAnimDone = 'true';

        gsap.set(element, { perspective: 400 });

        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        while (walker.nextNode()) {
            if (walker.currentNode.nodeValue.trim().length > 0) {
                textNodes.push(walker.currentNode);
            }
        }

        const words = [];
        textNodes.forEach(node => {
            const parent = node.parentNode;
            const text = node.nodeValue;
            const tokens = text.split(/(\s+)/);
            const fragment = document.createDocumentFragment();

            tokens.forEach(token => {
                if (/^\s+$/.test(token)) {
                    fragment.appendChild(document.createTextNode(token));
                } else if (token.length > 0) {
                    const span = document.createElement('span');
                    span.className = 'word-scale-item';
                    span.style.display = 'inline-block';
                    span.style.transformOrigin = 'bottom center';
                    span.style.color = 'inherit';
                    span.style.fontSize = 'inherit';
                    span.style.lineHeight = 'inherit';
                    span.style.margin = '0';
                    span.style.padding = '0';
                    span.textContent = token;
                    fragment.appendChild(span);
                    words.push(span);
                }
            });

            parent.replaceChild(fragment, node);
        });

        if (!words.length) return;

        const setInitialState = () => {
            gsap.set(words, {
                scale: (i) => (i % 2 === 0 ? 0 : 1.45),
                opacity: 0,
                rotateX: -15,
                transformOrigin: "bottom center",
                force3D: true
            });
        };

        setInitialState();

        let isAnimated = false;
        const playAnimation = () => {
            if (isAnimated) return;
            isAnimated = true;

            gsap.to(words, {
                scale: 1,
                opacity: 1,
                rotateX: 0,
                duration: 0.65,
                stagger: 0.035,
                ease: "power2.out",
                force3D: true,
                overwrite: "auto"
            });
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        playAnimation();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                root: null,
                threshold: 0.15,
                rootMargin: "0px 0px -40px 0px"
            });

            observer.observe(element);
        } else if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.create({
                trigger: element,
                start: "top 85%",
                onEnter: playAnimation,
                once: true
            });
        } else {
            playAnimation();
        }
    });
}

window.addEventListener('load', function () {
    initWordScaleAnimation();
    if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
    }
});


//   < === Calisto text animation (only about page) === >
(function () {
  var el = document.getElementById('calisto-text');
  if (!el) return;
 
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(el);
 
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0, target = 0, running = false;
 
  function calc() {
    var r = el.getBoundingClientRect(), vh = innerHeight;
    var p = (vh - r.top) / (vh + r.height);
    target = Math.max(0, Math.min(1, p)) * 100;
  }
  function tick() {
    cur += (target - cur) * 0.08;
    el.style.backgroundPosition = cur.toFixed(2) + '% 50%';
    if (Math.abs(target - cur) > 0.05) requestAnimationFrame(tick);
    else running = false;
  }
  function onScroll() {
    calc();
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
 
  if (!reduce) {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    calc(); cur = target;
    el.style.backgroundPosition = cur + '% 50%';
  }
})();
 
 
//   < === Process slider (slick) === >
$(function () {
  var $slider = $('.process-slider');
  var $section = $('.process-section');
  if (!$slider.length) return;

  /* ---------- 1) Fill: section top window top ma aave tyare, perfect dekhata slides nu j ---------- */
  var started = false;
  var queue = [];
  var busy = false;

  function runQueue() {
    if (busy || !queue.length) return;
    busy = true;
    queue.shift().addClass('is-done');
    setTimeout(function () { busy = false; runQueue(); }, 1400);   // 1 link fill thay pachi next (sequence)
  }

  function updateFill() {
    var rect = $section[0].getBoundingClientRect();
    if (!started) {
      if (rect.top > 0 || rect.bottom <= 0) return;                 // section top window top sudhi nathi pahoncho
      started = true;
    }
    var vw = document.documentElement.clientWidth;
    $slider.find('.slick-slide').each(function () {
      var $s = $(this);
      if ($s.hasClass('is-done') || $s.data('queued')) return;
      var r = $s.find('.process-card')[0].getBoundingClientRect();
      if (r.left >= -1 && r.right <= vw + 1) {                      // card window ma puro dekhay che
        $s.data('queued', true);
        queue.push($s);
      }
    });
    runQueue();
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; updateFill(); });
  }, { passive: true });

  $slider.on('init reInit afterChange', updateFill);

  /* ---------- 2) Slider init ---------- */
  $slider.slick({
    variableWidth: true,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: $('#prev'),
    nextArrow: $('#next'),
    dots: false,
    speed: 400,
    swipeToSlide: true
  });

  /* ---------- 3) Last card container ni right edge ae aave tyare stop + Next disabled ---------- */
  var slick = $slider.slick('getSlick');

  function limits() {
    var list = $slider.find('.slick-list')[0];
    var $slides = $slider.find('.slick-slide');
    if (!list || !$slides.length) return null;

    var edge = parseFloat(getComputedStyle(list).paddingLeft) || 0;       // container left edge
    var visible = list.clientWidth - edge * 2;                             // container content width
    var last = $slides[$slides.length - 1];
    var cardW = $(last).find('.process-card').outerWidth();
    var maxScroll = Math.max(0, last.offsetLeft + cardW - visible);        // last card right = container right

    var kMax = 0;
    if (maxScroll > 0) {
      $slides.each(function (i) {
        if (this.offsetLeft + 50 >= maxScroll) { kMax = i; return false; }
      });
    }
    return { maxScroll: maxScroll, kMax: kMax };
  }

  var getLeft = slick.getLeft;
  slick.getLeft = function (index) {
    var m = limits();
    if (m && m.kMax > 0 && index >= m.kMax) return -m.maxScroll;           // last step exact right edge par
    return getLeft.call(this, index);
  };

  var slideHandler = slick.slideHandler;
  slick.slideHandler = function (index, sync, dontAnimate) {
    var m = limits();
    if (m && index > m.kMax) index = m.kMax;                               // aagal na jay
    return slideHandler.call(this, index, sync, dontAnimate);
  };

  var updateArrows = slick.updateArrows;
  slick.updateArrows = function () {
    updateArrows.call(this);
    var m = limits();
    if (m && this.$nextArrow && this.currentSlide >= m.kMax) {
      this.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
    }
  };

  slick.setPosition();
  slick.updateArrows();
  updateFill();

  var rt;
  $(window).on('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var m = limits();
      if (m && slick.currentSlide > m.kMax) slick.slickGoTo(m.kMax, true);
      slick.setPosition();
      slick.updateArrows();
      updateFill();
    }, 250);
  });
});