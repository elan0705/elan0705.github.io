(function(){
"use strict";

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   YEAR
============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();

/* ============================================================
   MOBILE MENU
============================================================ */
var burger = document.getElementById("navBurger");
var mobileMenu = document.getElementById("mobileMenu");

function closeMenu(){
  burger.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
}
function openMenu(){
  burger.setAttribute("aria-expanded", "true");
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
}
burger.addEventListener("click", function(){
  var expanded = burger.getAttribute("aria-expanded") === "true";
  expanded ? closeMenu() : openMenu();
});
mobileMenu.querySelectorAll("a").forEach(function(a){
  a.addEventListener("click", closeMenu);
});

/* ============================================================
   SCROLL-SPY NAV
============================================================ */
var sections = ["top","about","research","projects","publications","journey","contact"]
  .map(function(id){ return document.getElementById(id); })
  .filter(Boolean);

var navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');

function updateActiveNav(){
  var pos = window.scrollY + 140;
  var current = sections[0];
  sections.forEach(function(sec){
    if (sec.offsetTop <= pos) current = sec;
  });
  navLinks.forEach(function(link){
    link.classList.toggle("is-active", link.dataset.nav === current.id);
  });
}
document.addEventListener("scroll", throttle(updateActiveNav, 100), { passive:true });
updateActiveNav();

function throttle(fn, wait){
  var last = 0, timer = null;
  return function(){
    var now = Date.now();
    var args = arguments, ctx = this;
    if (now - last >= wait){
      last = now; fn.apply(ctx, args);
    } else {
      clearTimeout(timer);
      timer = setTimeout(function(){ last = Date.now(); fn.apply(ctx, args); }, wait - (now-last));
    }
  };
}

/* ============================================================
   NAV BACKGROUND ON SCROLL
============================================================ */
var navEl = document.getElementById("nav");
document.addEventListener("scroll", throttle(function(){
  navEl.style.background = window.scrollY > 40 ? "rgba(8,10,13,0.92)" : "rgba(8,10,13,0.72)";
}, 100), { passive:true });

/* ============================================================
   REVEAL ON SCROLL
============================================================ */
var revealEls = document.querySelectorAll(".reveal");
if (reduceMotion){
  revealEls.forEach(function(el){ el.classList.add("is-visible"); });
} else {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:"0px 0px -60px 0px" });
  revealEls.forEach(function(el){ io.observe(el); });
}

/* ============================================================
   HERO STAT COUNTERS
============================================================ */
var counters = document.querySelectorAll(".hstat-num");
var countersDone = false;
function runCounters(){
  if (countersDone) return;
  countersDone = true;
  counters.forEach(function(el){
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion){ el.textContent = target; return; }
    var start = 0;
    var duration = 900;
    var startTime = null;
    function step(ts){
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}
var heroObserver = new IntersectionObserver(function(entries){
  entries.forEach(function(e){ if (e.isIntersecting) runCounters(); });
}, { threshold:0.4 });
var heroStats = document.querySelector(".hero-stats");
if (heroStats) heroObserver.observe(heroStats);

/* ============================================================
   IDENTITY MAP (About section)
============================================================ */
(function buildIdentityMap(){
  var svg = document.getElementById("mapSvg");
  var linesG = document.getElementById("mapLines");
  var nodesG = document.getElementById("mapNodes");
  if (!svg) return;

  var cx = 230, cy = 220, r = 165;
  var nodes = [
    { id:"humans", label:"HUMANS", angle:-90 },
    { id:"cognition", label:"COGNITION", angle:-38 },
    { id:"robotics", label:"ROBOTICS", angle:14 },
    { id:"medical", label:"MEDICAL TECH", angle:66 },
    { id:"design", label:"DESIGN", angle:118 },
    { id:"research", label:"RESEARCH", angle:170 },
    { id:"entrepreneurship", label:"ENTREPRENEURSHIP", angle:222 }
  ];

  var edges = [
    ["humans","cognition"], ["humans","robotics"], ["cognition","robotics"],
    ["robotics","medical"], ["medical","design"], ["design","research"],
    ["research","entrepreneurship"], ["robotics","design"], ["cognition","research"],
    ["humans","medical"]
  ];

  nodes.forEach(function(n){
    var rad = n.angle * Math.PI / 180;
    n.x = cx + r * Math.cos(rad);
    n.y = cy + r * Math.sin(rad);
  });

  function findNode(id){ return nodes.filter(function(n){ return n.id === id; })[0]; }

  edges.forEach(function(edge){
    var a = findNode(edge[0]), b = findNode(edge[1]);
    var line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
    line.classList.add("map-line");
    line.dataset.a = edge[0]; line.dataset.b = edge[1];
    linesG.appendChild(line);
  });

  nodes.forEach(function(n){
    var g = document.createElementNS("http://www.w3.org/2000/svg","g");
    g.dataset.id = n.id;

    var circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx", n.x); circle.setAttribute("cy", n.y);
    circle.setAttribute("r", n.id === "humans" || n.id === "robotics" ? 40 : 34);
    circle.classList.add("map-node-circle");
    g.appendChild(circle);

    var text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.setAttribute("x", n.x); text.setAttribute("y", n.y);
    text.setAttribute("text-anchor","middle");
    text.setAttribute("dy","4");
    text.classList.add("map-node-label");
    text.style.fontSize = n.label.length > 10 ? "8.5px" : "10px";
    text.textContent = n.label;
    g.appendChild(text);

    g.addEventListener("mouseenter", function(){ highlightNode(n.id); });
    g.addEventListener("focus", function(){ highlightNode(n.id); });
    g.addEventListener("mouseleave", clearHighlight);
    g.addEventListener("blur", clearHighlight);
    g.setAttribute("tabindex","0");
    g.setAttribute("role","button");
    g.setAttribute("aria-label", n.label);

    nodesG.appendChild(g);
  });

  function highlightNode(id){
    linesG.querySelectorAll(".map-line").forEach(function(line){
      var active = line.dataset.a === id || line.dataset.b === id;
      line.classList.toggle("is-active", active);
    });
    nodesG.querySelectorAll(".map-node-circle").forEach(function(c){
      var parentId = c.parentNode.dataset.id;
      c.classList.toggle("is-active", parentId === id);
    });
  }
  function clearHighlight(){
    linesG.querySelectorAll(".map-line").forEach(function(l){ l.classList.remove("is-active"); });
    nodesG.querySelectorAll(".map-node-circle").forEach(function(c){ c.classList.remove("is-active"); });
  }
})();

/* ============================================================
   PROJECT DATA + RENDER
============================================================ */
var PROJECTS = [
  {
    num: "01",
    category: "MEDICAL ROBOTICS / TELESURGERY",
    title: "Tele-Surgical Bionic Arm",
    context: "B.Engg Final Year Project",
    desc: "A master–slave robotic arm controlled over Wi-Fi, built to explore telesurgical, bionic and other remote-operation applications — letting an operator's movements drive a robotic arm at a distance.",
    meta: "WI-FI CONTROL · MASTER–SLAVE ARCHITECTURE · BIONICS",
    image: "https://elan0705.github.io/Elangeshwaran/images/portfolio/TSBA.jpg",
    links: [
      { label:"PROJECT ARCHIVE ↗", url:"https://drive.google.com/drive/folders/1FAsNstnQLIku2YWTy9AA0Y07XEZMBg62" },
      { label:"READ THE PAPER ↗", url:"#publications" }
    ]
  },
  {
    num: "02",
    category: "HUMANOID ROBOTICS",
    title: "Dexterous Robotic Arm for Human-Like Reach & Grasp",
    context: "MSc Thesis",
    desc: "A 3D-printed robotic arm designed to resemble the human arm both structurally and functionally, reaching for and grasping objects using inverse kinematics and computer vision.",
    meta: "3D PRINTING · INVERSE KINEMATICS · COMPUTER VISION",
    image: "https://elan0705.github.io/Elangeshwaran/images/portfolio/Dex_rob_arm.jpg",
    video: "https://elan0705.github.io/Elangeshwaran/images/portfolio/Project_video.mp4",
    links: [
      { label:"PROJECT ARCHIVE ↗", url:"https://drive.google.com/drive/folders/1ndtt8HazzvIDF27lGPzgoeGUOSaWtB-6" }
    ]
  },
  {
    num: "03",
    category: "MOTION & GAZE",
    title: "Spatial Synchronization of Gaze & Motion Capture Data",
    context: "Research Project",
    desc: "Synchronizing gaze data from Pupil Labs eye-tracking glasses with Vicon motion-capture data in a shared spatial frame, then visualizing both together in 3D.",
    meta: "PUPIL LABS EYE-TRACKING · VICON MOCAP · 3D VISUALIZATION",
    image: "https://elan0705.github.io/Elangeshwaran/images/portfolio/Spatial_Sync.jpg",
    video: "https://elan0705.github.io/Elangeshwaran/images/portfolio/Mocap_video.mp4",
    links: [
      { label:"PROJECT ARCHIVE ↗", url:"https://drive.google.com/drive/folders/10tIL58sksT-mizm28rU17uV85rIZWuBC" }
    ]
  },
  {
    num: "04",
    category: "PROSTHETICS",
    title: "Height & Cast Adjustable Prosthetic Leg",
    context: "Design Project",
    desc: "A prosthetic leg designed to be adjusted for height and cast changes, intended for a single subject to use over several years rather than requiring repeated replacement.",
    meta: "HUMAN-CENTRED DESIGN · MECHANICAL ADJUSTMENT · LONG-TERM USE",
    video: "https://elan0705.github.io/Elangeshwaran/images/portfolio/leg_prosthetic.mp4",
    links: [
      { label:"MORE WORK ON GITHUB ↗", url:"https://github.com/elan0705" }
    ]
  },
  {
    num: "05",
    category: "APPLIED KINEMATICS · RESEARCH",
    title: "Newton–Raphson IK Solver",
    context: "Technical Project",
    desc: "An inverse-kinematics solver built on the Newton–Raphson method for a 3-degree-of-freedom planar robot — a small, focused piece of the kinematics work behind the larger arm projects.",
    meta: "NEWTON–RAPHSON METHOD · INVERSE KINEMATICS · 3-DOF PLANAR ROBOT",
    video: "https://elan0705.github.io/Elangeshwaran/images/portfolio/NR_IK_calc.mp4",
    links: [
      { label:"MORE WORK ON GITHUB ↗", url:"https://github.com/elan0705" }
    ]
  },
  {
    num: "06",
    category: "SIDE PROJECT",
    title: "Python Game",
    context: "Personal Project",
    desc: "A small Python game built around a comedy character from Indian cinema that was trending on Twitter at the time — a lighter, just-for-fun build alongside the robotics work.",
    meta: "PYTHON",
    image: "https://elan0705.github.io/Elangeshwaran/images/portfolio/Python_Game.jpg",
    video: "https://elan0705.github.io/Elangeshwaran/images/portfolio/game_video.mp4",
    links: [
      { label:"PROJECT ARCHIVE ↗", url:"https://drive.google.com/drive/folders/1MGHnXwK4cTQajLxv3iCO5RdGuw3o2Ypq" }
    ]
  }
];

(function renderProjects(){
  var list = document.getElementById("projectsList");
  if (!list) return;

  PROJECTS.forEach(function(p, idx){
    var proj = document.createElement("article");
    proj.className = "proj reveal";
    proj.style.setProperty("--d", idx);

    var bodyId = "proj-body-" + idx;

    var visualHTML = "";
    if (p.video){
      visualHTML = '<div class="proj-visual"><video controls preload="none" playsinline' +
        (p.image ? ' poster="' + p.image + '"' : '') +
        '><source src="' + p.video + '" type="video/mp4">Your browser does not support this video.</video></div>';
    } else if (p.image){
      visualHTML = '<div class="proj-visual"><img src="' + p.image + '" alt="' + p.title + '" loading="lazy"></div>';
    } else {
      visualHTML = '<div class="proj-visual"><div class="proj-visual-fallback">' + placeholderSVG() + '</div></div>';
    }

    var linksHTML = p.links.map(function(l){
      var target = l.url.indexOf("#") === 0 ? "" : ' target="_blank" rel="noopener"';
      return '<a class="proj-link" href="' + l.url + '"' + target + '>' + l.label + '</a>';
    }).join("");

    proj.innerHTML =
      '<div class="proj-head" role="button" tabindex="0" aria-expanded="false" aria-controls="' + bodyId + '">' +
        '<span class="proj-num">' + p.num + '</span>' +
        '<div class="proj-titles">' +
          '<p class="proj-cat">' + p.category + (p.context ? " · " + p.context : "") + '</p>' +
          '<h3 class="proj-title">' + p.title + '</h3>' +
        '</div>' +
        '<span class="proj-toggle" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2V14M2 8H14" stroke-width="1.4"/></svg></span>' +
      '</div>' +
      '<div class="proj-accent"></div>' +
      '<div class="proj-body" id="' + bodyId + '">' +
        '<div class="proj-body-inner"><div class="proj-content">' +
          '<div class="proj-text">' +
            '<p class="proj-desc">' + p.desc + '</p>' +
            '<p class="proj-meta">' + p.meta + '</p>' +
            '<div class="proj-links">' + linksHTML + '</div>' +
          '</div>' +
          visualHTML +
        '</div></div>' +
      '</div>';

    list.appendChild(proj);

    var head = proj.querySelector(".proj-head");
    function toggle(){
      var isOpen = proj.classList.toggle("is-open");
      head.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); }
    });
  });

  // re-observe newly created reveal elements
  if (!reduceMotion){
    var io2 = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){ entry.target.classList.add("is-visible"); io2.unobserve(entry.target); }
      });
    }, { threshold:0.1, rootMargin:"0px 0px -60px 0px" });
    list.querySelectorAll(".reveal").forEach(function(el){ io2.observe(el); });
  } else {
    list.querySelectorAll(".reveal").forEach(function(el){ el.classList.add("is-visible"); });
  }
})();

function placeholderSVG(){
  return '<svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="#38E0E3" stroke-width="1.4">' +
    '<circle cx="36" cy="20" r="10"/><line x1="36" y1="30" x2="36" y2="46"/>' +
    '<line x1="36" y1="36" x2="22" y2="50"/><line x1="36" y1="36" x2="50" y2="50"/>' +
    '<line x1="36" y1="46" x2="26" y2="64"/><line x1="36" y1="46" x2="46" y2="64"/></svg>';
}

/* ============================================================
   PUBLICATIONS DATA + RENDER + FILTER
============================================================ */
var PUBLICATIONS = [
  {
    year: "2019",
    title: "Redistributing the Pressure of Prosthetic Systems",
    authors: "Elangeshwaran K",
    venue: "Seminar report — Department of Medical Electronics, Dayananda Sagar College of Engineering, Bangalore, India",
    tags: ["report","medical"],
    url: "https://elan0705.github.io/Elangeshwaran/images/pressure%20redistribution%20on%20prosthetics.pdf"
  },
  {
    year: "2019",
    title: "Telesurgical Bionic Arm",
    authors: "Elangeshwaran K, Aranyak Banerjee, Goutham B U, Syed Suhail, Sahana M Kulkarni",
    venue: "International Journal of Engineering Science Invention (IJESI), Vol. 8, Issue 11, Series II, pp. 59–63, November 2019",
    tags: ["robotics","medical"],
    url: "https://elan0705.github.io/Elangeshwaran/images/I0811025963_Tele-Surgical_Bionic_Arm.pdf"
  },
  {
    year: "2020",
    title: "Big Data in Medical Research",
    authors: "Elangeshwaran Kannabiran, Deepa Narasappa, Tejaswini Prakash",
    venue: "International Conference on Recent Trends in Electrical, Electronics, Telecommunications, Instrumentation, Medical Electronics Engg. & Physics (IC RTEETIMP-2020), December 2020",
    tags: ["conference","medical"],
    url: "https://elan0705.github.io/Elangeshwaran/images/DSIC%20-%20420_Big_Data_in_Medical_Research.pdf"
  }
];

(function renderPubs(){
  var list = document.getElementById("pubList");
  if (!list) return;

  function render(filter){
    list.innerHTML = "";
    PUBLICATIONS
      .filter(function(p){ return filter === "all" || p.tags.indexOf(filter) !== -1; })
      .forEach(function(p, i){
        var item = document.createElement("article");
        item.className = "pub-item reveal is-visible";
        item.innerHTML =
          '<span class="pub-year">' + p.year + '</span>' +
          '<div>' +
            '<h3 class="pub-title">' + p.title + '</h3>' +
            '<p class="pub-authors">' + p.authors + '</p>' +
            '<p class="pub-venue">' + p.venue + '</p>' +
          '</div>' +
          '<a class="pub-link" href="' + p.url + '" target="_blank" rel="noopener">VIEW PDF ↗</a>';
        list.appendChild(item);
      });
  }
  render("all");

  var filters = document.querySelectorAll(".pub-filter");
  filters.forEach(function(btn){
    btn.addEventListener("click", function(){
      filters.forEach(function(b){ b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      render(btn.dataset.filter);
    });
  });
})();

})();
