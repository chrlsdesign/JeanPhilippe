gsap.registerPlugin(ScrollTrigger, Flip, Draggable, CustomEase);

if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
} else {
  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };
}

/*!
 * Smooth Scroll (Lenis)
 */

function lenisScroll() {
  const lenis = new Lenis({
    duration: 2,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // https://easings.net
    direction: "vertical",
    smooth: true,
    smoothTouch: true,
    touchMultiplier: 3.5
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}

/*!
 * Products Page Script
 */

function setImage() {
  let parallaxPercentage = 29;
  $(".hero_img.carousel").each(function (index) {
    let targetElement = $(this);
    let elementOffset = targetElement.offset().left + targetElement.width();
    let parentWidth = $(window).innerWidth() + targetElement.width();
    let myProgress = elementOffset / parentWidth;
    let slideProgress = parallaxPercentage * myProgress;
    if (slideProgress > parallaxPercentage) {
      slideProgress = parallaxPercentage;
    } else if (slideProgress < 0) {
      slideProgress = 0;
    }
    //targetElement.css("transform", `translateX(-${slideProgress}%)`);
    gsap.set(targetElement, {
      xPercent: `-${slideProgress}`
    });
  });
}

function prodScript() {
  gsap.to(".prod_num", {
    yPercent: 0,
    duration: 0.7,
    delay: 0.5
  });
  updatePage();
  Draggable.create(".prod_more-list", {
    bounds: ".prod_more-listwrapper",
    //allowNativeTouchScrolling:false,
    type: "x",
    inertia: true,
    zIndexBoost: false,
    onDrag: setImage,
    onThrowUpdate: setImage,
    dragClickables: true
  });
}

/*!
 * Profile Page Script
 */

function profScript() {
  let sl = gsap.timeline({
    scrollTrigger: {
      trigger: $(".profile_rail"),
      start: "top -30%",
      end: "bottom center",
      scrub: 0.5
    }
  });

  sl.to($(".profile_contentwrapper"), {
    height: "80%"
  })
    .to(
      $(".profile_leftitle"),
      {
        xPercent: 20
      },
      0
    )
    .to(
      $(".profile_righttitle"),
      {
        xPercent: -20
      },
      0
    );

  let bio = gsap.timeline({
    scrollTrigger: {
      trigger: $(".profile_bio"),
      start: "top 50%"
    }
  });

  bio.to(".word", {
    scale: 1,
    stagger: 0.1,
    opacity: 1
  });
}

/*!
 * Work Page Script
 */
function homeSet() {
  let parallaxPercentage = 49;
  $(".work_img").each(function (index) {
    let targetElement = $(this);
    let elementOffset = targetElement.offset().left + targetElement.width();
    let parentWidth = $(window).innerWidth() + targetElement.width();
    let myProgress = elementOffset / parentWidth;
    let slideProgress = parallaxPercentage * myProgress;
    if (slideProgress > parallaxPercentage) {
      slideProgress = parallaxPercentage;
    } else if (slideProgress < 0) {
      slideProgress = 0;
    }
    //targetElement.css("transform", `translateX(-${slideProgress}%)`);
    gsap.set(targetElement, {
      xPercent: `-${slideProgress}`
    });
  });
}

function workScript() {
  let mainItem = $(".work_main-item"),
    handler = $(".work_main-imghandler"),
    customEase = "M0,0 C0.25,1 0.5,1 1,1",
    wk = gsap.timeline({});

  mainItem.eq(0).clone().appendTo(handler);
  $(".work_img-item").first().addClass("is-active");
  wk.to(".work_main-imghandler .work_main-item", {
    delay: 0.2,
    height: "100%",
    duration: 2
  });
  wk.to(
    ".work_img",
    {
      delay: 0.2,
      height: "100%",
      duration: 1.75,
      stagger: 0.15
    },
    0.3
  );

  const wrapper = document.querySelector(".work_img-list");
  const boxes = gsap.utils.toArray(".work_img-item");

  let activeElement;
  const loop = horizontalLoop(boxes, {
    paused: true,
    draggable: true // make it draggable
  });

  boxes.forEach((box, i) =>
    box.addEventListener("click", () =>
      loop.toIndex(i, {
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          $(wrapper).attr("p-e", "none");
        },
        onComplete: () => {
          $(wrapper).attr("p-e", "");
        }
      })
    )
  );

  function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({
        repeat: config.repeat,
        onUpdate:
          onChange &&
          function () {
            let i = tl.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
        paused: config.paused,
        defaults: { ease: "none" },
        onReverseComplete: () =>
          tl.totalTime(tl.rawTime() + tl.duration() * 100)
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap =
        config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1), // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
      timeOffset = 0,
      container =
        center === true
          ? items[0].parentNode
          : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(),
          b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) * 100 +
              gsap.getProperty(el, "xPercent")
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, {
          // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
          xPercent: (i) => xPercents[i]
        });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center
          ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
          : 0;
        center &&
          times.forEach((t, i) => {
            times[i] = timeWrap(
              tl.labels["label" + i] +
                (tl.duration() * widths[i]) / 2 / totalWidth -
                timeOffset
            );
          });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) {
            d = wrap - d;
          }
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop =
            distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
          tl.to(
            item,
            {
              xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond
            },
            0
          )
            .fromTo(
              item,
              {
                xPercent: snap(
                  ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
                )
              },
              {
                xPercent: xPercents[i],
                duration:
                  (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false
              },
              distanceToLoop / pixelsPerSecond
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable
          ? tl.time(times[curIndex], true)
          : tl.progress(progress, true);
      },
      proxy;
    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", () => refresh(true));
    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length); // always go in the shortest direction
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        // if we're wrapping the timeline's playhead, make the proper adjustments
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    // tl.next = vars => toIndex(tl.current()+1, vars);
    // tl.previous = vars => toIndex(tl.current()-1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    if (config.draggable && typeof Draggable === "function") {
      proxy = document.createElement("div");
      let wrap = gsap.utils.wrap(0, 1),
        ratio,
        startProgress,
        draggable,
        dragSpeed,
        lastSnap,
        initChangeX,
        align = () => {
          homeSet();
          tl.progress(
            wrap(startProgress + (draggable.startX - draggable.x) * ratio)
          );
        },
        syncIndex = () => tl.closestIndex(true);
      typeof InertiaPlugin === "undefined" &&
        console.warn(
          "InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club"
        );
      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "x",
        onPressInit() {
          let x = this.x;
          gsap.killTweensOf(tl);
          startProgress = tl.progress();
          refresh();
          dragSpeed = totalWidth * 1.3;
          ratio = 1 / dragSpeed;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        onRelease() {
          syncIndex();
          draggable.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: syncIndex
      })[0];
      tl.draggable = draggable;
    }
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    return tl;
  }

  let activeTitle = $(".is-active .work_img-title")
    .clone()
    .appendTo(".work_img-textholder");

  wk.fromTo(
    activeTitle,
    { display: "block", yPercent: 205 },
    {
      yPercent: 0,
      duration: 1.75,
      ease: CustomEase.create("custom", customEase),
      onComplete: () => {
        $(".work_wrapper").attr("p-e", "");
      }
    },
    1.5
  );

  $(".work_img-item").on("mouseover", function () {
    let idx = $(".work_img-item").index(this);
    let selected = mainItem.eq(idx);

    if ($(this).hasClass("is-active")) {
      return;
    }

    $(".is-active").removeClass("is-active");
    $(this).addClass("is-active");

    let clone = selected.clone(),
      cloneText = $(".is-active").find(".work_img-title").clone();
    clone.appendTo(handler);
    cloneText.appendTo(".work_img-textholder");
    gsap.to(clone, {
      height: "100%",
      duration: 1,
      onComplete: () => {
        clone.prev().remove();
      }
    });

    gsap.to(cloneText, {
      display: "block",
      duration: 0,
      onComplete: () => {
        cloneText.prev().remove();
      }
    });
  });
}

/*!
 * Catalogue Page Script
 */

function cataScript() {
  function getRGB(c) {
    return parseInt(c, 16) || c;
  }

  function getsRGB(c) {
    return getRGB(c) / 255 <= 0.03928
      ? getRGB(c) / 255 / 12.92
      : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
  }

  function getLuminance(hexColor) {
    return (
      0.2126 * getsRGB(hexColor.substr(1, 2)) +
      0.7152 * getsRGB(hexColor.substr(3, 2)) +
      0.0722 * getsRGB(hexColor.substr(-2))
    );
  }

  function getContrast(f, b) {
    const L1 = getLuminance(f);
    const L2 = getLuminance(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function getTextColor(bgColor) {
    const whiteContrast = getContrast(bgColor, "#ffffff");
    const blackContrast = getContrast(bgColor, "#000000");

    return whiteContrast > blackContrast ? "#ffffff" : "#000000";
  }

  var x = [],
    y = [];
  for (const attr of $("[cd-countitem^='list-']")) {
    x.push(
      attr.children.length -
        attr.querySelectorAll(".hero_img.w-dyn-bind-empty").length
    );
  }
  for (const attr of $("[cd-countitem^='value-']")) {
    y.push(attr);
  }
  for (let i = 0; i < x.length; i++) {
    y[i].textContent = x[i];
  }

  $(".cata_palette").on("mouseenter", function () {
    $(this).css(
      "color",
      getTextColor($(this).find(".cata_palette-text").text())
    );
  });

  $(".cata_palette").click(function (e) {
    e.preventDefault();
    const copy = (text) => navigator.clipboard.writeText(text);
    copy($(this).find(".cata_palette-text").text());
  });

  $(".cata_item").each(function (index) {
    let triggerElement = $(this),
      titleTrigger = $(this).parents(".catalogue"),
      targetElement = $(this).find(".cata_img-wrapper"),
      parallaxElement = $(this).find(".cata_img"),
      totalItem = $(this).parents(".catalogue").find(".cata_total-num"),
      title = $(this).parents(".catalogue").find(".cata_section-title"),
      char = $(this).parents(".catalogue").find(".char");

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        // trigger element - viewport
        start: "top bottom"
        /* end: "bottom top",
        toggleActions: "play none restart reverse" */
      }
    });

    let tt = gsap.timeline({
      scrollTrigger: {
        trigger: titleTrigger,
        // trigger element - viewport
        start: "top bottom"
        /* end: "30% top",
        toggleActions: "play none restart reset" */
      }
    });

    let pr = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        // trigger element - viewport
        start: "20% bottom",
        end: "bottom 20%",
        toggleActions: "play reverse none none",
        scrub: 1
      }
    });

    pr.fromTo(
      parallaxElement,
      {
        scale: 1.4
      },
      {
        scale: 1
      },
      0
    );

    tl.to(
      targetElement,
      {
        height: "100%",
        /* xPercent: 0,
        yPercent: 0,
        rotation: 0, */
        ease: "power2.easeIn",
        duration: 2
      },
      0
    );

    tt.to(
      title,
      {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        duration: 2
      },
      0
    );

    tt.to(
      totalItem,
      {
        xPercent: 0,
        yPercent: 0,
        rotation: 0
      },
      0
    );

    tt.to(
      char,
      {
        yPercent: 0,
        stagger: 0.1
      },
      0
    );
  });
}

/*!
 * Global Barba Script
 */

function updatePage() {
  $(window).scrollTop(0);
  $(".overlay").css("opacity", "0");

  $(".footer_mail").click(function (e) {
    const copy = (text) => navigator.clipboard.writeText(text);
    copy($(".footer_heading").text());
  });
}

/* let getSiblings = function (e) {
  // for collecting siblings
  let siblings = [];
  // if no parent, return no sibling
  if (!e.parentNode) {
    return siblings;
  }
  // first child of the parent node
  let sibling = e.parentNode.firstChild;
  // collecting siblings
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== e) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
};

function flip(outgoing, incoming) {
  let state = Flip.getState(outgoing.find(".hero_img"));
  incoming.find(".hero_img").remove();
  outgoing.find(".hero_img").appendTo(incoming);
  Flip.from(state, {
    duration: 1.5,
    ease: CustomEase.create("custom", "M0,0 C0.756,0 0.502,1 1,1")
  });
} */

barba.hooks.before((data) => {
  $("body").attr("p-e", "none");
});

barba.hooks.after((data) => {
  var response = data.next.html.replace(/(<\/?)html( .+?)?>/gi, "$1nothtml$2>");
  var bodyClasses = $(response).filter("nothtml").attr("data-wf-page");
  $("html").attr("data-wf-page", bodyClasses);
  Webflow.destroy();
  Webflow.ready();
  Webflow.require("ix2").init();
  $("body").attr("p-e", "");
  $(data.next.container).removeClass("fixed");
});

barba.hooks.afterEnter(() => {
  lenisScroll();
});

barba.init({
  preventRunning: true,
  transitions: [
    {
      name: "opacity-transition",
      beforeLeave(data) {
        return gsap.to(data.current.container, {
          zIndex: 1
        });
      },
      leave(data) {
        return gsap.to(".overlay", {
          opacity: 1,
          duration: 0.6,
          ease: "power2.out"
        });
      },
      enter(data) {
        const lt = gsap.timeline({
          onComplete: function () {
            updatePage();
          }
        });
        $(data.next.container).addClass("fixed");
        return lt.from(data.next.container, {
          zIndex: 1001,
          yPercent: 150,
          xPercent: -20,
          rotation: 30,
          duration: 0.7,
          ease: "power2.easeOut"
        });
      }
    }
  ],
  views: [
    {
      namespace: "catalogue",
      beforeEnter() {
        gsap.set($(".cata_img-wrapper, .cata_section-title, .cata_total-num"), {
          height: "0%"
          /* xPercent: -50,
          yPercent: 200,
          rotation: 20 */
        });

        const split = SplitType.create(".cata_section-title", {
          types: "chars"
        });

        gsap.set(split.chars, {
          yPercent: 120
        });
      },
      afterEnter() {
        cataScript();
      }
    },
    {
      namespace: "work",
      beforeEnter() {
        /*         gsap.set(".work_main-imghandler > .work_main-item", {
          height: "0%"
        }); */
        gsap.set(".work_img", {
          height: "0%"
        });
        $(".work_wrapper").attr("p-e", "none");
      },
      afterEnter() {
        homeSet();
        workScript();
      }
    },
    {
      namespace: "profile",
      beforeEnter() {
        const bioSplit = SplitType.create(".profile_bio", {
          types: "words"
        });

        gsap.set(bioSplit.words, {
          scale: 1.05,
          opacity: 0
        });
      },
      afterEnter() {
        profScript();
      }
    },
    {
      namespace: "products",
      afterEnter() {
        setImage();
        prodScript();
      }
    }
  ]
});
