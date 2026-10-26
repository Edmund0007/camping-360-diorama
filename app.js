/* ==========================================================================
   CAMPING 360° / SE3041 DIORAMA & 360° OBJECT MOTION PRESENTATION ENGINE
   Horizontal Touch Swipe & Mouse Drag Engine with Inertia Momentum Physics
   Supporting:
     - 🌿 Environment 3D 360° (Environment_3D.mp4)
     - 🧱 Lego Minifigure 360° (Lego_minifigure.mp4)
     - 🚙 Lego Jeep 4x4 360° (jeep1.mp4)
     - 🛞 Red Trail Jeep 360° (jeep2.mp4)
   ========================================================================== */

(function () {
  'use strict';

  try {
    sessionStorage.clear();
  } catch (e) {}

  // --- APP STATE ---
  const state = {
    angle: 0,                 // Current smoothed angle (0 to 360)
    targetAngle: 0,           // Target angle set by mouse drag, touch swipe, or auto-rotation
    isDragging: false,
    lastX: 0,
    velocity: 0,              // Inertia momentum velocity
    isAutoSpin: true,
    spinSpeed: 1.0,
    currentModel: 'diorama',   // 'diorama', 'lego', 'jeep1', 'jeep2'
    lightingMode: 'dark',     // 'dark', 'neon', 'sunlight'
    hotspotsEnabled: true,
    fps: 60,
    lastTime: performance.now()
  };

  // DOM Elements
  const canvas360 = document.getElementById('object360Canvas');
  const ctx360 = canvas360 ? canvas360.getContext('2d') : null;

  const viewportContainer = document.getElementById('viewportContainer');
  const studioCard = document.querySelector('.studio-card');
  const dragHint = document.getElementById('dragHint');
  const angleReadout = document.getElementById('angleReadout');
  const fpsReadout = document.getElementById('fpsReadout');
  const currentModelBadge = document.getElementById('currentModelBadge');
  const scrubberInput = document.getElementById('scrubberInput');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const btnFullscreenToggle = document.getElementById('btnFullscreenToggle');

  const hotspot1 = document.getElementById('hotspot1');
  const popup1 = document.getElementById('popup1');
  const hotspot2 = document.getElementById('hotspot2');
  const popup2 = document.getElementById('popup2');
  const hotspot3 = document.getElementById('hotspot3');
  const popup3 = document.getElementById('popup3');

  const hotspotTag1 = document.getElementById('hotspotTag1');
  const hotspotTitle1 = document.getElementById('hotspotTitle1');
  const hotspotDesc1 = document.getElementById('hotspotDesc1');

  const hotspotTag2 = document.getElementById('hotspotTag2');
  const hotspotTitle2 = document.getElementById('hotspotTitle2');
  const hotspotDesc2 = document.getElementById('hotspotDesc2');

  const hotspotTag3 = document.getElementById('hotspotTag3');
  const hotspotTitle3 = document.getElementById('hotspotTitle3');
  const hotspotDesc3 = document.getElementById('hotspotDesc3');

  // --- 360 OBJECT MODELS CONFIGURATION ---
  const MODELS = {
    diorama: {
      id: 'diorama',
      name: 'ENVIRONMENT 3D 360°',
      video: document.getElementById('dioramaVideo'),
      hotspots: [
        {
          tag: 'Environment 3D',
          title: 'Digital Landscape Render',
          desc: 'High-fidelity 3D environment motion picture capture formatted for 360° turntable presentation.',
          pin: (cx, cy, sinA) => ({ x: cx + sinA * 40, y: cy - 60 }),
          popup: (cx, cy, sinA) => ({ x: cx + sinA * 40 + 30, y: cy - 100 })
        },
        {
          tag: 'Turntable Lighting',
          title: 'Studio Softbox Key Light',
          desc: 'Continuous diffuse LED studio light setup providing uniform illumination during motion capture.',
          pin: (cx, cy, sinA) => ({ x: cx - 60 + sinA * 50, y: cy + 10 }),
          popup: (cx, cy, sinA) => ({ x: cx - 60 + sinA * 50 - 290, y: cy - 10 })
        },
        {
          tag: 'Capture Engine',
          title: 'SE3041 Video Presentation',
          desc: 'High-frame-rate digital video capture formatted for interactive 360° web scrubbing.',
          pin: (cx, cy, sinA) => ({ x: cx + 80 + sinA * 30, y: cy + 80 }),
          popup: (cx, cy, sinA) => ({ x: cx + 80 + sinA * 30 - 290, y: cy + 60 })
        }
      ]
    },
    lego: {
      id: 'lego',
      name: 'LEGO MINIFIGURE 360°',
      video: document.getElementById('legoVideo'),
      hotspots: [
        {
          tag: 'LEGO Assembly',
          title: 'Molded Minifigure Helmet',
          desc: 'Custom injection molded Lego ABS plastic helmet with 360-degree paint details.',
          pin: (cx, cy, sinA) => ({ x: cx + sinA * 20, y: cy - 140 }),
          popup: (cx, cy, sinA) => ({ x: cx + sinA * 20 + 30, y: cy - 180 })
        },
        {
          tag: 'Pad Print',
          title: 'Torso Emblem Artwork',
          desc: 'Multi-color pad printed insignia on front and back of Lego character torso.',
          pin: (cx, cy, sinA) => ({ x: cx + sinA * 25, y: cy - 20 }),
          popup: (cx, cy, sinA) => ({ x: cx + sinA * 25 - 290, y: cy - 40 })
        },
        {
          tag: 'Articulation',
          title: 'Dual Leg Hinge Joints',
          desc: 'Standardized friction snap-fit leg joints engineered for precision stud grid alignment.',
          pin: (cx, cy, sinA) => ({ x: cx + sinA * 30, y: cy + 120 }),
          popup: (cx, cy, sinA) => ({ x: cx + sinA * 30 + 30, y: cy + 70 })
        }
      ]
    },
    jeep1: {
      id: 'jeep1',
      name: 'LEGO JEEP 4x4 360°',
      video: document.getElementById('jeep1Video'),
      hotspots: [
        {
          tag: 'Front Grille & Bumper',
          title: 'Slotted Grille & Headlights',
          desc: 'Tan off-road grille with integrated round headlights and heavy-duty front bumper.',
          pin: (cx, cy, sinA) => ({ x: cx - 60 + sinA * 45, y: cy + 20 }),
          popup: (cx, cy, sinA) => ({ x: cx - 60 + sinA * 45 - 290, y: cy - 40 })
        },
        {
          tag: 'Cockpit & Driver',
          title: 'Explorer Minifigure & Roll Cage',
          desc: 'Poseable driver with safari cap seated inside open-cockpit reinforced tubular roll-cage chassis.',
          pin: (cx, cy, sinA) => ({ x: cx + 25 + sinA * 25, y: cy - 90 }),
          popup: (cx, cy, sinA) => ({ x: cx + 25 + sinA * 25 + 30, y: cy - 130 })
        },
        {
          tag: 'All-Terrain Wheels',
          title: 'Mud Tread Off-Road Tires',
          desc: 'Deep-groove knobby off-road rubber tires with authentic mud splatter texture and 4x4 rims.',
          pin: (cx, cy, sinA) => ({ x: cx + 60 + sinA * 45, y: cy + 85 }),
          popup: (cx, cy, sinA) => ({ x: cx + 60 + sinA * 45 - 290, y: cy + 30 })
        }
      ]
    },
    jeep2: {
      id: 'jeep2',
      name: 'RED TRAIL JEEP 360°',
      video: document.getElementById('jeep2Video'),
      hotspots: [
        {
          tag: 'Front End Armor',
          title: 'Tubular Bull Bar & Grille',
          desc: 'Heavy-duty front tubular brush guard with round headlights and signature red trail fascia.',
          pin: (cx, cy, sinA) => ({ x: cx - 50 + sinA * 40, y: cy + 15 }),
          popup: (cx, cy, sinA) => ({ x: cx - 50 + sinA * 40 - 290, y: cy - 45 })
        },
        {
          tag: 'Expedition Gear',
          title: 'Roof Rack & Raised Snorkel',
          desc: 'High-clearance deep water intake snorkel and modular roof cage for rugged overland trails.',
          pin: (cx, cy, sinA) => ({ x: cx + 20 + sinA * 25, y: cy - 100 }),
          popup: (cx, cy, sinA) => ({ x: cx + 20 + sinA * 25 + 30, y: cy - 140 })
        },
        {
          tag: 'Monster Chassis',
          title: 'Solid Axle Lift & Big Foot Tires',
          desc: 'High ground-clearance suspension with oversized beadlock wheels and aggressive rock-crawling treads.',
          pin: (cx, cy, sinA) => ({ x: cx + 65 + sinA * 45, y: cy + 95 }),
          popup: (cx, cy, sinA) => ({ x: cx + 65 + sinA * 45 - 290, y: cy + 40 })
        }
      ]
    }
  };

  // --- FRAME CACHE ENGINE (Instant 0ms Drag & Scrubbing) ---
  const TOTAL_FRAMES = 90;
  const frameCaches = {
    diorama: [],
    lego: [],
    jeep1: [],
    jeep2: []
  };

  // Active Video Helper
  function getActiveVideo() {
    return MODELS[state.currentModel]?.video || MODELS.diorama.video;
  }

  // Preload frame cache offscreen for silky smooth scrubbing
  function initVideoFramePreload(modelKey) {
    const model = MODELS[modelKey];
    if (!model || !model.video) return;
    const v = model.video;
    if (!v.duration || isNaN(v.duration) || v.duration === 0) return;
    if (frameCaches[modelKey].length >= TOTAL_FRAMES) return;

    const duration = v.duration;
    const tempVideo = document.createElement('video');
    tempVideo.src = v.src;
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    tempVideo.onloadedmetadata = () => {
      let count = 0;
      function captureNext() {
        if (count >= TOTAL_FRAMES) return;
        tempVideo.currentTime = (count / TOTAL_FRAMES) * duration;
      }

      tempVideo.onseeked = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = tempVideo.videoWidth || 1280;
        offCanvas.height = tempVideo.videoHeight || 720;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(tempVideo, 0, 0, offCanvas.width, offCanvas.height);
        frameCaches[modelKey][count] = offCanvas;
        count++;
        captureNext();
      };

      captureNext();
    };
  }

  // Setup Video Elements for seamless HTML5 streaming
  Object.keys(MODELS).forEach(key => {
    const v = MODELS[key].video;
    if (v) {
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.addEventListener('loadedmetadata', () => initVideoFramePreload(key));
      v.addEventListener('loadeddata', () => initVideoFramePreload(key));
      v.load();
    }
  });

  // Safe Non-Blocking Video Time Synchronizer
  function syncVideoToAngle() {
    const video = getActiveVideo();
    if (!video || !video.duration || isNaN(video.duration) || video.seeking) return;
    
    const targetTime = (state.angle / 360) * video.duration;
    if (Math.abs(video.currentTime - targetTime) > 0.03) {
      try {
        video.currentTime = targetTime;
      } catch (err) {}
    }
  }

  // Live capture rendered video frames into RAM cache during auto-rotation
  function recordVideoFrame(v, modelKey) {
    if (!v || !v.duration || isNaN(v.duration) || v.paused || v.videoWidth === 0) return;
    const cache = frameCaches[modelKey];
    if (!cache) return;
    const idx = Math.floor((v.currentTime / v.duration) * TOTAL_FRAMES) % TOTAL_FRAMES;
    if (!cache[idx]) {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = v.videoWidth;
      offCanvas.height = v.videoHeight;
      const offCtx = offCanvas.getContext('2d');
      offCtx.drawImage(v, 0, 0, v.videoWidth, v.videoHeight);
      cache[idx] = offCanvas;
    }
  }

  // --- MAIN 360 CANVAS RENDERER ---
  function draw360Frame() {
    if (!ctx360 || !canvas360) return;

    const w = canvas360.width;
    const h = canvas360.height;
    ctx360.clearRect(0, 0, w, h);

    const video = getActiveVideo();
    const cache = frameCaches[state.currentModel];

    // 1. RAM MEMORY FRAME DRAW (Instant 0ms latency during manual drag/touch swipe)
    if (cache && cache.length > 0 && !state.isAutoSpin) {
      const frameIdx = Math.floor((state.angle / 360) * TOTAL_FRAMES) % TOTAL_FRAMES;
      const normalizedIdx = frameIdx < 0 ? frameIdx + TOTAL_FRAMES : frameIdx;
      const cachedFrame = cache[normalizedIdx] || cache[0];

      if (cachedFrame) {
        const videoRatio = cachedFrame.width / cachedFrame.height;
        const canvasRatio = w / h;
        let drawW = w;
        let drawH = h;
        let offX = 0;
        let offY = 0;

        if (videoRatio > canvasRatio) {
          drawW = h * videoRatio;
          offX = (w - drawW) / 2;
        } else {
          drawH = w / videoRatio;
          offY = (h - drawH) / 2;
        }

        ctx360.save();
        ctx360.drawImage(cachedFrame, offX, offY, drawW, drawH);
        applyLightingOverlay(w, h);
        ctx360.restore();

        updateHotspots();
        return;
      }
    }

    // 2. DIRECT VIDEO STREAM RENDER (Full 60fps/144fps Native Aspect Ratio)
    if (video) {
      const vW = video.videoWidth || 1280;
      const vH = video.videoHeight || 720;
      const videoRatio = vW / vH;
      const canvasRatio = w / h;
      let drawW = w;
      let drawH = h;
      let offX = 0;
      let offY = 0;

      if (videoRatio > canvasRatio) {
        drawW = h * videoRatio;
        offX = (w - drawW) / 2;
      } else {
        drawH = w / videoRatio;
        offY = (h - drawH) / 2;
      }

      ctx360.save();
      try {
        ctx360.drawImage(video, offX, offY, drawW, drawH);
      } catch (err) {}
      applyLightingOverlay(w, h);
      ctx360.restore();

      recordVideoFrame(video, state.currentModel);
    }

    updateHotspots();
  }

  function applyLightingOverlay(w, h) {
    if (state.lightingMode === 'neon') {
      ctx360.fillStyle = 'rgba(70, 92, 59, 0.08)';
      ctx360.fillRect(0, 0, w, h);
    } else if (state.lightingMode === 'sunlight') {
      ctx360.fillStyle = 'rgba(203, 239, 67, 0.12)';
      ctx360.fillRect(0, 0, w, h);
    }
  }

  // --- HOTSPOT POSITIONS & CONTENT UPDATER ---
  function updateHotspots() {
    if (!state.hotspotsEnabled) {
      [hotspot1, hotspot2, hotspot3].forEach(h => { if (h) h.style.opacity = '0'; });
      return;
    }

    const model = MODELS[state.currentModel];
    if (!model || !model.hotspots) return;

    const rad = (state.angle * Math.PI) / 180;
    const sinA = Math.sin(rad);

    const w = viewportContainer ? viewportContainer.clientWidth : 800;
    const h = viewportContainer ? viewportContainer.clientHeight : 500;
    const cx = w / 2;
    const cy = h / 2;

    const [h1, h2, h3] = model.hotspots;

    if (h1 && hotspot1 && popup1) {
      if (hotspotTag1) hotspotTag1.textContent = h1.tag;
      if (hotspotTitle1) hotspotTitle1.textContent = h1.title;
      if (hotspotDesc1) hotspotDesc1.textContent = h1.desc;
      const pinPos = h1.pin(cx, cy, sinA);
      const popPos = h1.popup(cx, cy, sinA);
      hotspot1.style.left = `${pinPos.x}px`;
      hotspot1.style.top = `${pinPos.y}px`;
      popup1.style.left = `${popPos.x}px`;
      popup1.style.top = `${popPos.y}px`;
      hotspot1.style.opacity = '1';
    }

    if (h2 && hotspot2 && popup2) {
      if (hotspotTag2) hotspotTag2.textContent = h2.tag;
      if (hotspotTitle2) hotspotTitle2.textContent = h2.title;
      if (hotspotDesc2) hotspotDesc2.textContent = h2.desc;
      const pinPos = h2.pin(cx, cy, sinA);
      const popPos = h2.popup(cx, cy, sinA);
      hotspot2.style.left = `${pinPos.x}px`;
      hotspot2.style.top = `${pinPos.y}px`;
      popup2.style.left = `${popPos.x}px`;
      popup2.style.top = `${popPos.y}px`;
      hotspot2.style.opacity = '1';
    }

    if (h3 && hotspot3 && popup3) {
      if (hotspotTag3) hotspotTag3.textContent = h3.tag;
      if (hotspotTitle3) hotspotTitle3.textContent = h3.title;
      if (hotspotDesc3) hotspotDesc3.textContent = h3.desc;
      const pinPos = h3.pin(cx, cy, sinA);
      const popPos = h3.popup(cx, cy, sinA);
      hotspot3.style.left = `${pinPos.x}px`;
      hotspot3.style.top = `${pinPos.y}px`;
      popup3.style.left = `${popPos.x}px`;
      popup3.style.top = `${popPos.y}px`;
      hotspot3.style.opacity = '1';
    }
  }

  // --- MOUSE DRAG & TOUCH SWIPE ENGINE WITH INERTIA MOMENTUM ---
  function onPointerDown(e) {
    if (e.target.closest('.hotspot-pin') || e.target.closest('.hotspot-popup')) {
      return;
    }

    state.isDragging = true;
    state.lastX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    state.velocity = 0;

    state.isAutoSpin = false;
    if (playPauseBtn) playPauseBtn.textContent = '▶';

    const video = getActiveVideo();
    if (video && !video.paused) video.pause();

    if (dragHint) dragHint.classList.add('fade-out');
  }

  function onPointerMove(e) {
    if (!state.isDragging) return;

    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = currentX - state.lastX;
    state.lastX = currentX;

    const sensitivity = 0.75;
    const step = deltaX * sensitivity;
    
    let newTarget = (state.targetAngle + step) % 360;
    if (newTarget < 0) newTarget += 360;
    
    state.targetAngle = newTarget;
    state.velocity = step; // Store instantaneous drag velocity for smooth inertia momentum decay
  }

  function onPointerUp() {
    state.isDragging = false;
  }

  // Mouse Wheel Scroll Handler
  function onWheelScroll(e) {
    e.preventDefault();
    state.isAutoSpin = false;
    if (playPauseBtn) playPauseBtn.textContent = '▶';

    const video = getActiveVideo();
    if (video && !video.paused) video.pause();

    const rawDelta = e.deltaY;
    const scrollStep = Math.sign(rawDelta) * Math.max(6, Math.min(24, Math.abs(rawDelta) * 0.18));

    let newTarget = (state.targetAngle + scrollStep) % 360;
    if (newTarget < 0) newTarget += 360;
    state.targetAngle = newTarget;

    if (dragHint) dragHint.classList.add('fade-out');
  }

  // Attach Pointer Event Listeners
  if (viewportContainer) {
    viewportContainer.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    viewportContainer.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    viewportContainer.addEventListener('wheel', onWheelScroll, { passive: false });
  }

  if (studioCard) {
    studioCard.addEventListener('wheel', onWheelScroll, { passive: false });
  }

  // Fullscreen Studio Toggle Handler
  if (btnFullscreenToggle) {
    btnFullscreenToggle.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (viewportContainer.requestFullscreen) {
          viewportContainer.requestFullscreen();
        } else if (viewportContainer.webkitRequestFullscreen) {
          viewportContainer.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // Scrubber Range Input
  if (scrubberInput) {
    scrubberInput.addEventListener('input', (e) => {
      state.isAutoSpin = false;
      if (playPauseBtn) playPauseBtn.textContent = '▶';
      const video = getActiveVideo();
      if (video && !video.paused) video.pause();

      state.targetAngle = parseFloat(e.target.value);
      state.angle = state.targetAngle;
      syncVideoToAngle();

      if (angleReadout) angleReadout.textContent = `${Math.round(state.angle)}°`;
      if (dragHint) dragHint.classList.add('fade-out');
    });
  }

  // Play / Pause Auto Spin Toggle
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      state.isAutoSpin = !state.isAutoSpin;
      playPauseBtn.textContent = state.isAutoSpin ? '❚❚' : '▶';

      const video = getActiveVideo();
      if (video) {
        if (state.isAutoSpin) video.play().catch(() => {});
        else video.pause();
      }
    });
  }

  // MODEL SELECTOR BUTTONS
  function switchModel(modelKey) {
    if (!MODELS[modelKey]) {
      modelKey = 'diorama';
    }

    // Pause all video streams
    Object.values(MODELS).forEach(m => {
      if (m.video && !m.video.paused) {
        m.video.pause();
      }
    });

    state.currentModel = modelKey;
    state.isAutoSpin = true;
    if (playPauseBtn) playPauseBtn.textContent = '❚❚';

    // Synchronize active pill buttons across HUD and bottom controls
    document.querySelectorAll('[data-model]').forEach(b => {
      b.classList.toggle('active', b.dataset.model === modelKey);
    });

    const activeModel = MODELS[modelKey];
    if (currentModelBadge) {
      currentModelBadge.textContent = activeModel.name;
    }

    const video = activeModel.video;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = state.spinSpeed;
      video.play().catch(() => {});
    }

    state.angle = 0;
    state.targetAngle = 0;
    if (scrubberInput) scrubberInput.value = 0;
    if (angleReadout) angleReadout.textContent = '0°';

    // Close any visible hotspot popups
    document.querySelectorAll('.hotspot-popup').forEach(p => p.classList.remove('visible'));
    updateHotspots();
  }

  document.querySelectorAll('[data-model]').forEach(btn => {
    btn.addEventListener('click', () => switchModel(btn.dataset.model));
  });

  document.getElementById('btnSelectLegoHero')?.addEventListener('click', () => {
    switchModel('diorama');
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Lighting Selectors
  document.querySelectorAll('[data-light]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-light]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.lightingMode = btn.dataset.light;
    });
  });

  // Speed Selectors
  document.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.spinSpeed = parseFloat(btn.dataset.speed);

      const video = getActiveVideo();
      if (video) video.playbackRate = state.spinSpeed;
    });
  });

  // Hotspots Toggle & Popups
  const btnToggleHotspots = document.getElementById('btnToggleHotspots');
  if (btnToggleHotspots) {
    btnToggleHotspots.addEventListener('click', (e) => {
      state.hotspotsEnabled = !state.hotspotsEnabled;
      e.target.textContent = `📍 Hotspots: ${state.hotspotsEnabled ? 'ON' : 'OFF'}`;
    });
  }

  [
    { pin: hotspot1, popup: popup1 },
    { pin: hotspot2, popup: popup2 },
    { pin: hotspot3, popup: popup3 }
  ].forEach(item => {
    if (item.pin && item.popup) {
      item.pin.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVis = item.popup.classList.contains('visible');
        document.querySelectorAll('.hotspot-popup').forEach(p => p.classList.remove('visible'));
        if (!isVis) {
          item.popup.classList.add('visible');
        }
      });
    }
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.hotspot-popup').forEach(p => p.classList.remove('visible'));
  });

  // Global user interaction trigger for autoplay policy unblock
  document.addEventListener('pointerdown', () => {
    const video = getActiveVideo();
    if (video && video.paused && state.isAutoSpin) {
      video.play().catch(() => {});
    }
  }, { once: true });

  // --- MAIN 60FPS/144FPS RENDER LOOP WITH INERTIA PHYSICS ---
  function renderLoop(timestamp) {
    const dt = timestamp - state.lastTime;
    state.lastTime = timestamp;
    if (dt > 0) {
      state.fps = Math.round(1000 / dt);
      if (fpsReadout) fpsReadout.textContent = state.fps;
    }

    const video = getActiveVideo();

    // 1. Auto-spin Mode driven by HTML5 Video Playback
    if (state.isAutoSpin && !state.isDragging) {
      if (video) {
        if (video.paused) video.play().catch(() => {});

        if (video.duration && !isNaN(video.duration) && video.duration > 0) {
          state.angle = (video.currentTime / video.duration) * 360;
          state.targetAngle = state.angle;
        }
      }
    } else {
      // 2. Interactive Drag & Touch Swipe Physics with Inertia Momentum
      if (!state.isDragging) {
        if (Math.abs(state.velocity) > 0.05) {
          state.targetAngle = (state.targetAngle + state.velocity) % 360;
          if (state.targetAngle < 0) state.targetAngle += 360;
          state.velocity *= 0.92; // Natural friction momentum decay
        } else {
          state.velocity = 0;
        }
      }

      // Smooth exponential lerp smoothing
      let diff = (state.targetAngle - state.angle) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      state.angle = (state.angle + diff * 0.35) % 360;
      if (state.angle < 0) state.angle += 360;

      syncVideoToAngle();
    }

    if (scrubberInput) scrubberInput.value = state.angle;
    if (angleReadout) angleReadout.textContent = `${Math.round(state.angle)}°`;

    // Draw active 360 frame on canvas continuously
    draw360Frame();

    requestAnimationFrame(renderLoop);
  }

  // --- VEHICLE PHOTO LIGHTBOX CONTROLLER (Lego & Red Jeep) ---
  const galleryCards = document.querySelectorAll('.gallery-card, .sb-lightbox-trigger');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const galleryData = {
    storyboard: [
      { src: 'storyboard.jpg', caption: 'story board — story board of the promo video (Wilderness Adventure Diorama Storyboard Sheet | Total Duration: 43s)' },
      { src: 'storyboard_shot_1.jpg', caption: 'story board — Shot 01: River Adventure (5s) | Rear tracking shot | Paddle ripples' },
      { src: 'storyboard_shot_2.jpg', caption: 'story board — Shot 02: Rocky River Crossing (4s) | Low wheel close-up | Water splashes' },
      { src: 'storyboard_shot_3.jpg', caption: 'story board — Shot 03: Beside the Waterfall (5s) | Three-quarter view; pan | Fine waterfall mist' },
      { src: 'storyboard_shot_4.jpg', caption: 'story board — Shot 04: Hidden Stream (3s) | Static close-up | Water highlights' },
      { src: 'storyboard_shot_5.jpg', caption: 'story board — Shot 05: Another Explorer Arrives (4s) | Front tracking shot | Light tyre dust' },
      { src: 'storyboard_shot_6.jpg', caption: 'story board — Shot 06: Tackling the Rough Trail (5s) | Low side view | Subtle camera shake' },
      { src: 'storyboard_shot_7.jpg', caption: 'story board — Shot 07: Meeting by the Stream (5s) | Wide shot | Soft waterfall spray' },
      { src: 'storyboard_shot_8.jpg', caption: 'story board — Shot 08: Setting Up Camp (5s) | Eye-level medium shot | Gradual light change' },
      { src: 'storyboard_shot_9.jpg', caption: 'story board — Shot 09: Campfire Celebration (7s) | Wide shot; pull back | Fire glow and embers' }
    ],
    jungle: [
      { src: 'jungle_camping_5.jpg', caption: 'jungle camping environment — Expedition Orange Ridge Tent Pitch (Waterfall & Campsite)' },
      { src: 'jungle_camping_1.jpg', caption: 'jungle camping environment — Isometric Overview (Waterfall, River & Kayak)' },
      { src: 'jungle_camping_2.jpg', caption: 'jungle camping environment — Modular Terrain Split (Dual Bookend Modules)' },
      { src: 'jungle_camping_3.jpg', caption: 'jungle camping environment — Low-Light Campsite Macro (Footbridge & Explorer)' },
      { src: 'jungle_camping_4.jpg', caption: 'jungle camping environment — Top-Down Aerial Perspective (River & Flora)' }
    ],
    camping_net: [
      { src: 'camping_net_1.jpg', caption: 'camping net — Outdoor Perspective (Orange Micro-Mesh Ridge Tent on Stone Ledge)' },
      { src: 'camping_net_2.jpg', caption: 'camping net — 4-View Technical Study (Front Entry, Rear Wall, Frame & Macro Mesh)' }
    ],
    lego: [
      { src: 'lego_jeep_3.jpg', caption: 'Lego style jeep 4 X 4 — Front 3/4 Quarter Angle (Tan Grille & Explorer Driver)' },
      { src: 'lego_jeep_2.jpg', caption: 'Lego style jeep 4 X 4 — Side Profile (Roll Cage, Coil Springs & Mud Tires)' },
      { src: 'lego_jeep_1.jpg', caption: 'Lego style jeep 4 X 4 — Rear Elevation (Tailgate, Beige Bumper & Mud Splatter)' }
    ],
    red: [
      { src: 'red_jeep_4.jpg', caption: 'Red Jeep — Front Elevation (Signature Grille & Solid Front Axle Lift)' },
      { src: 'red_jeep_2.jpg', caption: 'Red Jeep — Left Side Profile (High-Clearance Suspension & Roof Rack)' },
      { src: 'red_jeep_3.jpg', caption: 'Red Jeep — Right Side Profile (Deep Water Snorkel & Rock Crawler Tires)' },
      { src: 'red_jeep_1.jpg', caption: 'Red Jeep — Rear Elevation (Tailgate & Dual Axle Support Links)' }
    ]
  };

  let activeGalleryKey = 'lego';
  let currentGalleryIndex = 0;

  function openLightbox(galleryKey, index) {
    activeGalleryKey = galleryKey || 'lego';
    const list = galleryData[activeGalleryKey] || galleryData.lego;
    currentGalleryIndex = index;
    const item = list[index];
    if (!item) return;
    if (lightboxImg) lightboxImg.src = item.src;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxModal) lightboxModal.classList.add('active');
  }

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  function showNextLightbox() {
    const list = galleryData[activeGalleryKey] || galleryData.lego;
    currentGalleryIndex = (currentGalleryIndex + 1) % list.length;
    openLightbox(activeGalleryKey, currentGalleryIndex);
  }

  function showPrevLightbox() {
    const list = galleryData[activeGalleryKey] || galleryData.lego;
    currentGalleryIndex = (currentGalleryIndex - 1 + list.length) % list.length;
    openLightbox(activeGalleryKey, currentGalleryIndex);
  }

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const galleryKey = card.dataset.gallery || 'lego';
      const idx = parseInt(card.dataset.imgIndex, 10);
      if (!isNaN(idx)) openLightbox(galleryKey, idx);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevLightbox);

  window.addEventListener('keydown', (e) => {
    if (!lightboxModal?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextLightbox();
    if (e.key === 'ArrowLeft') showPrevLightbox();
  });

  // --- INIT ---
  window.addEventListener('load', () => {
    switchModel('diorama');
    Object.keys(MODELS).forEach(k => initVideoFramePreload(k));
    requestAnimationFrame(renderLoop);
  });

})();
