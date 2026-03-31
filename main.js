const urlParams = new URLSearchParams(window.location.search);
const STEP_ORDER = [
  "step-1",
  "step-example",
  "step-2",
  "step-3",
  "step-4",
  "step-eps-setup",
  "step-eps-live",
  "step-5a",
  "step-5b",
  "step-5c",
];
const HERO_TEXT_LINES = [
  { text: "LOCAL", tracking: 0 },
  { text: "DIFFERENTIAL", tracking: 0.085 },
  { text: "PRIVACY", tracking: 0 },
];
const EXAMPLE_STYLES = {
  neutral: {
    label: "Pet gerbil",
    accent: "#5e6b7d",
    accentSoft: "rgba(94,107,125,0.1)",
    fur: "#b58b67",
    belly: "#efddc8",
    ear: "#f3c6c6",
    tail: "#cf9e80",
    cheek: "#eeb89d",
    spark: "",
    vibe: "none",
  },
  skibidi: {
    label: "Rizz Rodent",
    accent: "#2c88d9",
    accentSoft: "rgba(44,136,217,0.18)",
    fur: "#bf9067",
    belly: "#efddc8",
    ear: "#f5c4c9",
    tail: "#d09d80",
    cheek: "#f4b89c",
    spark: "♥",
    vibe: "shades",
  },
  rizz: {
    label: "6-7 Squeaker",
    accent: "#ff6f61",
    accentSoft: "rgba(255,111,97,0.18)",
    fur: "#c5966f",
    belly: "#f3e0cb",
    ear: "#f7c7c8",
    tail: "#d3a186",
    cheek: "#ffb1a6",
    spark: "",
    vibe: "bowtie",
  },
  carl: {
    label: "Carl",
    accent: "#148a88",
    accentSoft: "rgba(20,138,136,0.18)",
    fur: "#ab815d",
    belly: "#e6d4bf",
    ear: "#efc1bc",
    tail: "#c89378",
    cheek: "#efb59e",
    spark: "✦",
    vibe: "glasses",
  },
};
const EXAMPLE_VOTE_RESULTS = {
  skibidi: 11,
  rizz: 14,
  carl: 2,
};
const EXAMPLE_PRIVACY_TOSS_PATTERNS = {
  "👧🏿": [{ side: "heads", duration: 0.74, arcLift: 50, drift: 10 }],
  "👦🏻": [{ side: "heads", duration: 0.78, arcLift: 54, drift: -12 }],
  "👨🏾‍🦲": [
    { side: "tails", duration: 0.8, arcLift: 62, drift: 16 },
    { side: "heads", duration: 0.76, arcLift: 56, drift: -10 },
    { side: "tails", duration: 0.82, arcLift: 60, drift: 12 },
  ],
  "👱🏼‍♀️": [
    { side: "tails", duration: 0.76, arcLift: 58, drift: -14 },
    { side: "heads", duration: 0.74, arcLift: 52, drift: 8 },
    { side: "heads", duration: 0.79, arcLift: 56, drift: -6 },
  ],
  "🧕🏽": [
    { side: "tails", duration: 0.81, arcLift: 60, drift: 14 },
    { side: "tails", duration: 0.77, arcLift: 54, drift: -8 },
    { side: "heads", duration: 0.75, arcLift: 57, drift: 10 },
  ],
  "🧑🏽": [
    { side: "tails", duration: 0.79, arcLift: 59, drift: -12 },
    { side: "heads", duration: 0.75, arcLift: 53, drift: 9 },
    { side: "tails", duration: 0.8, arcLift: 58, drift: -7 },
  ],
};
const HERO_FONT_FAMILY =
  '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
const HERO_LINE_HEIGHT = 0.98;

// One shared state object keeps the scroll scene, controls, and simulation in sync.
const state = {
  currentStepId: "",
  currentArticleId: "",
  currentRailRef: "step-1",
  pTruth: 0.5,
  participantsTarget: 1000,
  participantsCap: 5000,
  trueYesRate: 0.3,
  teacherMode: urlParams.get("teacher") === "1",
  showMath: false,
  testModePreset: "30/70",
  stepOrder: STEP_ORDER,
  streamMode: true,
  spawnRatePerSecond: 260,
  paused: false,
  slowMotion: 1,
  statusMessage: "Ready to scroll",
  sceneTitle: "",
  sceneSubtitle: "",
  renderMetrics: {
    width: 0,
    height: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    stacked: window.innerWidth <= 900,
  },
  sceneFlags: {
    showSlider: false,
    showParticipants: false,
    showCounts: true,
  },
  geometry: {},
  particles: [],
  spawnCursor: 0,
  spawnAccumulator: 0,
  publicYesCount: 0,
  publicNoCount: 0,
  completedCount: 0,
  runComplete: false,
  runId: 0,
  animationFrame: 0,
  lastTimestamp: 0,
  coinRotation: 0,
  teacherChecks: [],
  overlayDirty: false,
  stepProgress: 0,
  heroCoins: [],
  heroPointer: {
    active: false,
    x: 0,
    y: 0,
  },
  exampleStyle: "neutral",
  exampleVoteResults: null,
  examplePrivacyAnimation: null,
  logoAssetStatus: {},
  // Chapter 6 & 7 epsilon state
  epsEpsilon: 1.0,
  // Chapter 4 coin state
  coinFlipping: false,
  coinSide: null,           // "heads" | "tails" (first flip)
  coinSide2: null,          // "heads" | "tails" (second flip, after tails)
  coinIsSecondFlip: false,  // did user get tails first?
  coinUserAnswer: null,     // real answer (only if heads)
  coinPublicAnswer: null,   // what was publicly reported
  coinResponses: [],        // all collected responses this session
  coinCountdownTimer: null,
};

const dom = {
  body: document.body,
  steps: Array.from(document.querySelectorAll(".step")),
  storyRail: document.querySelector(".story-rail"),
  storyRailProgress: document.querySelector(".story-rail__progress"),
  railItems: Array.from(document.querySelectorAll(".story-rail__item")),
  railButtons: Array.from(document.querySelectorAll(".story-rail__button")),
  exampleVoteButtons: Array.from(document.querySelectorAll("[data-example-style]")),
  heroVisual: document.querySelector(".hero__visual"),
  heroCoinfield: document.querySelector(".hero__coinfield"),
  storyProgress: document.getElementById("story-progress"),
  sceneKicker: document.getElementById("scene-kicker"),
  sceneCount: document.getElementById("scene-count"),
  sceneTitle: document.getElementById("scene-title"),
  sceneSubtitle: document.getElementById("scene-subtitle"),
  vizShell: document.querySelector(".viz-shell"),
  truthGroup: document.getElementById("truth-control-group"),
  truthSlider: document.getElementById("truth-slider"),
  truthOutput: document.getElementById("truth-output"),
  truthHelper: document.getElementById("truth-helper"),
  participantsGroup: document.getElementById("participants-control-group"),
  participantsInput: document.getElementById("participants-input"),
  participantStatus: document.getElementById("participant-status"),
  teacherPanel: document.getElementById("teacher-panel"),
  toggleMathButton: document.getElementById("toggle-math-button"),
  pauseButton: document.getElementById("pause-button"),
  trueRateSlider: document.getElementById("true-rate-slider"),
  trueRateOutput: document.getElementById("true-rate-output"),
  slowMotionSlider: document.getElementById("slow-motion-slider"),
  slowMotionOutput: document.getElementById("slow-motion-output"),
  presetButtons: Array.from(document.querySelectorAll("[data-preset]")),
  mathPanel: document.getElementById("math-panel"),
  mathSummary: document.getElementById("math-summary"),
  mathFormulaText: document.getElementById("math-formula-text"),
  teacherChecks: document.getElementById("teacher-checks"),
  stage: document.getElementById("viz-stage"),
  canvas: document.getElementById("particle-canvas"),
  svgNode: document.getElementById("viz-overlay"),
  publicYesCount: document.getElementById("public-yes-count"),
  publicNoCount: document.getElementById("public-no-count"),
  trueYesRateDisplay: document.getElementById("true-yes-rate-display"),
  vizStatus: document.getElementById("viz-status"),
  statYes: document.getElementById("stat-card-yes"),
  statNo: document.getElementById("stat-card-no"),
  statTrueRate: document.getElementById("stat-card-true-rate"),
  controlsHud: document.querySelector(".controls-hud"),
  controlsHudToggle: document.getElementById("controls-hud-toggle"),
  controlsHudPanel: document.getElementById("controls-hud-panel"),
  // Chapter 4 coin panel (state-machine)
  coinPanel: document.getElementById("coin-interactive-panel"),
  whoWhyPanel: document.getElementById("who-why-panel"),
  cpFlipBtn:    document.getElementById("cp-flip-btn"),
  cpReflipBtn:  document.getElementById("cp-reflip-btn"),
  cpRetryBtn:   document.getElementById("cp-retry-btn"),
  cpCoinInner:  document.getElementById("cp-coin-inner"),
  cpBackWord:   document.getElementById("cp-back-word"),
  cpBackSub:    document.getElementById("cp-back-sub"),
  cpCoinInner2: document.getElementById("cp-coin-inner-2"),
  cpBackWord2:  document.getElementById("cp-back-word-2"),
  cpBackSub2:   document.getElementById("cp-back-sub-2"),
  cpCountdownNum:  document.getElementById("cp-countdown-num"),
  cpCountdownRing: document.getElementById("cp-countdown-ring"),
  cpRandomBadge:   document.getElementById("cp-random-badge"),
  cpDoneMsg:       document.getElementById("cp-done-msg"),
  cpStatAnswer:    document.getElementById("cp-stat-answer"),
  cpStatMethod:    document.getElementById("cp-stat-method"),
  cpStatTally:     document.getElementById("cp-stat-tally"),
  cpStates: {
    idle:    document.getElementById("cp-state-idle"),
    heads:   document.getElementById("cp-state-heads"),
    tails:   document.getElementById("cp-state-tails"),
    reflip:  document.getElementById("cp-state-reflip"),
    random:  document.getElementById("cp-state-random"),
    done:    document.getElementById("cp-state-done"),
  },
  // Chapter 6 & 7 epsilon panel
  epsPanel:       document.getElementById("eps-panel"),
  epsStateSetup:  document.getElementById("eps-state-setup"),
  epsStateLive:   document.getElementById("eps-state-live"),
  epsTrueBars:    document.getElementById("eps-true-bars"),
  epsSlider:      document.getElementById("eps-slider"),
  epsValDisplay:  document.getElementById("eps-val-display"),
  epsDesc:        document.getElementById("eps-desc"),
  epsLiveMeta:    document.getElementById("eps-live-meta"),
  epsPieCanvas:   document.getElementById("eps-pie-canvas"),
  epsBarCanvas:   document.getElementById("eps-bar-canvas"),
  epsPieLabel:    document.getElementById("eps-pie-label"),
  epsBottomNote:  document.getElementById("eps-bottom-note"),
  // Chapter 5 db results
  dbResultsPanel: document.getElementById("db-results-panel"),
  dbPublicYes: document.getElementById("db-public-yes"),
  dbPublicNo: document.getElementById("db-public-no"),
  dbRawYes: document.getElementById("db-raw-yes"),
  dbEstimatedTrue: document.getElementById("db-estimated-true"),
};

const ctx = dom.canvas.getContext("2d");
const svg = d3.select(dom.svgNode);
const sceneLayer = svg.append("g").attr("class", "scene-layer");
const flowLayer = svg.append("g").attr("class", "flow-layer");
const labelLayer = svg.append("g").attr("class", "label-layer");

let scroller = null;

function ensureOptionalLogoAsset(path) {
  const status = state.logoAssetStatus[path];

  if (status === "ready") {
    return true;
  }

  if (status === "loading" || status === "missing") {
    return false;
  }

  state.logoAssetStatus[path] = "loading";

  const image = new Image();
  image.addEventListener("load", () => {
    state.logoAssetStatus[path] = "ready";
    requestSceneRender();
  });
  image.addEventListener("error", () => {
    state.logoAssetStatus[path] = "missing";
  });
  image.src = path;
  return false;
}

function init() {
  buildHeroCoinfield();
  configureTeacherMode();
  bindControls();
  resizeScene();
  restartSimulation("init");
  setActiveStep(dom.steps[0]);
  setupScrollama();
  initCompanyCards();        // Initialize company cards
  initStudentVotingPanel();  // Initialize student voting panel
  initKanonPanel();          // Initialize K-anonymity panel
  state.animationFrame = window.requestAnimationFrame(tick);
}

function buildHeroCoinfield() {
  if (!dom.heroCoinfield) {
    return;
  }

  const fragment = document.createDocumentFragment();
  const rect = dom.heroCoinfield.getBoundingClientRect();
  state.heroCoins = [];

  getHeroCoinCoordinates().forEach(({ left, top, tone }) => {
    const coin = createHeroCoin(left, top, tone);
    fragment.appendChild(coin);
    state.heroCoins.push({
      element: coin,
      homeX: (left / 100) * rect.width,
      homeY: (top / 100) * rect.height,
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
      phase: Math.random() * Math.PI * 2,
      floatSpeed: 0.4 + Math.random() * 0.35,
      floatRadiusX: 0.3 + Math.random() * 0.7,
      floatRadiusY: 0.35 + Math.random() * 0.85,
      maxOffset: 30 + Math.random() * 8,
      tilt: (Math.random() - 0.5) * 1.5,
    });
  });

  dom.heroCoinfield.replaceChildren(fragment);
}

function getHeroCoinCoordinates() {
  const rect = dom.heroCoinfield.getBoundingClientRect();
  const width = Math.max(Math.round(rect.width), 320);
  const height = Math.max(Math.round(rect.height), 240);
  const scale = 2;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return [];
  }

  canvas.width = width * scale;
  canvas.height = height * scale;

  const paddingX = Math.round(canvas.width * 0.045);
  const paddingY = Math.round(canvas.height * 0.1);
  const fontSize = fitHeroFontSize(context, canvas.width - paddingX * 2, canvas.height - paddingY * 2);
  const lineHeight = fontSize * HERO_LINE_HEIGHT;
  const sampleStep = Math.max(8, Math.round(fontSize / 16));
  const startY = canvas.height / 2 - ((HERO_TEXT_LINES.length - 1) * lineHeight) / 2;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `400 ${fontSize}px ${HERO_FONT_FAMILY}`;

  HERO_TEXT_LINES.forEach((line, index) => {
    drawHeroLine(context, line, canvas.width / 2, startY + index * lineHeight, fontSize);
  });

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const coordinates = [];

  for (let y = paddingY; y < canvas.height - paddingY; y += sampleStep) {
    for (let x = paddingX; x < canvas.width - paddingX; x += sampleStep) {
      if (!heroCellHasInk(imageData, canvas.width, canvas.height, x, y, sampleStep)) {
        continue;
      }

      const gridX = Math.round((x - paddingX) / sampleStep);
      const gridY = Math.round((y - paddingY) / sampleStep);

      coordinates.push({
        left: ((x + sampleStep * 0.5) / canvas.width) * 100,
        top: ((y + sampleStep * 0.5) / canvas.height) * 100,
        tone: (gridX + gridY) % 6 === 0 ? "accent" : "base",
      });
    }
  }

  return coordinates;
}

function createHeroCoin(left, top, tone = "base") {
  const coin = document.createElement("div");
  coin.className = `hero-coin hero-coin--${tone}`;
  coin.style.left = `${left}%`;
  coin.style.top = `${top}%`;

  const spin = document.createElement("div");
  spin.className = "hero-coin__spin";

  const front = document.createElement("span");
  front.className = "hero-coin__face hero-coin__face--front";

  const back = document.createElement("span");
  back.className = "hero-coin__face hero-coin__face--back";

  spin.append(front, back);
  coin.append(spin);

  return coin;
}

function fitHeroFontSize(context, maxWidth, maxHeight) {
  let fontSize = Math.min(maxHeight / 2.15, maxWidth / 4.6);

  while (fontSize > 28) {
    context.font = `400 ${fontSize}px ${HERO_FONT_FAMILY}`;
    const widestLine = Math.max(...HERO_TEXT_LINES.map((line) => measureHeroLine(context, line, fontSize)));
    const totalHeight = fontSize + (HERO_TEXT_LINES.length - 1) * fontSize * HERO_LINE_HEIGHT;

    if (widestLine <= maxWidth && totalHeight <= maxHeight) {
      return fontSize;
    }

    fontSize -= 3;
  }

  return 28;
}

function measureHeroLine(context, line, fontSize) {
  const letterSpacing = fontSize * (line.tracking || 0);
  const baseWidth = context.measureText(line.text).width;

  if (!letterSpacing || line.text.length < 2) {
    return baseWidth;
  }

  return baseWidth + letterSpacing * (line.text.length - 1);
}

function drawHeroLine(context, line, centerX, centerY, fontSize) {
  const text = line.text;
  const letterSpacing = fontSize * (line.tracking || 0);

  if (!letterSpacing || text.length < 2) {
    context.fillText(text, centerX, centerY);
    return;
  }

  const totalWidth = measureHeroLine(context, line, fontSize);
  let cursorX = centerX - totalWidth / 2;

  Array.from(text).forEach((character) => {
    const characterWidth = context.measureText(character).width;
    context.fillText(character, cursorX + characterWidth / 2, centerY);
    cursorX += characterWidth + letterSpacing;
  });
}

function heroCellHasInk(imageData, width, height, x, y, sampleStep) {
  const searchRadius = Math.max(2, Math.floor(sampleStep * 0.35));

  for (let offsetY = -searchRadius; offsetY <= searchRadius; offsetY += 2) {
    const sampleY = clamp(Math.round(y + offsetY), 0, height - 1);

    for (let offsetX = -searchRadius; offsetX <= searchRadius; offsetX += 2) {
      const sampleX = clamp(Math.round(x + offsetX), 0, width - 1);
      const alphaIndex = (sampleY * width + sampleX) * 4 + 3;

      if (imageData[alphaIndex] > 60) {
        return true;
      }
    }
  }

  return false;
}

function configureTeacherMode() {
  if (state.teacherMode) {
    dom.teacherPanel.hidden = false;
  }
  updateMathPanel();
  updateTruthUI();
  updateTrueRateUI();
  updateFooter();
}

function bindControls() {
  bindHeroInteraction();

  dom.railButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scrollToStep(button.dataset.stepRef);
    });
  });

  dom.exampleVoteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setExampleStyle(button.dataset.exampleStyle);
    });
  });

  dom.truthSlider.addEventListener("input", onTruthSliderInput);
  dom.participantsInput.addEventListener("change", commitParticipantsInput);
  dom.participantsInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      commitParticipantsInput();
      dom.participantsInput.blur();
    }
  });

  if (state.teacherMode) {
    dom.toggleMathButton.addEventListener("click", () => {
      state.showMath = !state.showMath;
      updateMathPanel();
    });

    dom.pauseButton.addEventListener("click", () => {
      state.paused = !state.paused;
      dom.pauseButton.textContent = state.paused ? "Resume" : "Pause";
      state.statusMessage = state.paused ? "Animation paused" : "Animation resumed";
      updateFooter();
      runTeacherChecks();
    });

    dom.trueRateSlider.addEventListener("input", () => {
      state.trueYesRate = Number(dom.trueRateSlider.value);
      state.testModePreset = "Custom";
      updateTrueRateUI();
      restartSimulation("teacher-true-rate");
    });

    dom.slowMotionSlider.addEventListener("input", () => {
      state.slowMotion = Number(dom.slowMotionSlider.value);
      dom.slowMotionOutput.value = `${Math.round(state.slowMotion * 100)}%`;
      state.statusMessage = `Speed set to ${Math.round(state.slowMotion * 100)}%`;
      updateFooter();
      runTeacherChecks();
    });

    dom.presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const presetValue = Number(button.dataset.preset);
        state.trueYesRate = presetValue;
        state.testModePreset = presetValue === 0.3 ? "30/70" : "70/30";
        dom.trueRateSlider.value = String(presetValue);
        updateTrueRateUI();
        restartSimulation("teacher-preset");
      });
    });
  }

  if (dom.controlsHudToggle) {
    dom.controlsHudToggle.addEventListener("click", () => {
      toggleControlsHud();
    });
  }

  window.addEventListener("keydown", onGlobalKeydown);
  window.addEventListener("pointerdown", onWindowPointerDown);
  window.addEventListener("resize", onResize);
  updateExampleVoteUI();
  bindCoinInteraction();
  bindEpsSlider();
}

function bindEpsSlider() {
  const slider = document.getElementById("eps-slider");
  if (!slider) return;
  slider.addEventListener("input", () => {
    state.epsEpsilon = parseFloat(slider.value);
    renderEpsLive(state.epsEpsilon);
  });
}

// ── Chapter 4: Coin Interaction ──────────────────────

function cpShowState(name) {
  // Hide all cp-state divs, show the named one
  if (!dom.cpStates) return;
  Object.entries(dom.cpStates).forEach(([key, el]) => {
    if (!el) return;
    if (key === name) {
      el.classList.remove("cp-state--hidden");
      el.classList.add("cp-state--visible");
    } else {
      el.classList.add("cp-state--hidden");
      el.classList.remove("cp-state--visible");
    }
  });
}

function cpAnimateCoin(innerEl, backWordEl, backSubEl, side, onDone) {
  if (!innerEl) { onDone && onDone(); return; }
  const word = side === "heads" ? "Heads!" : "Tails!";
  const sub  = side === "heads" ? "Tell the truth" : "Answer randomly";

  innerEl.classList.remove("cp-spinning", "cp-landed-heads", "cp-landed-tails");
  void innerEl.offsetWidth; // force reflow

  if (backWordEl) backWordEl.textContent = side === "heads" ? "H" : "T";
  if (backSubEl)  backSubEl.textContent  = side === "heads" ? "Heads!" : "Tails!";

  innerEl.classList.add("cp-spinning");

  innerEl.addEventListener("animationend", () => {
    innerEl.classList.remove("cp-spinning");
    innerEl.classList.add(side === "heads" ? "cp-landed-heads" : "cp-landed-tails");
    onDone && onDone();
  }, { once: true });
}

function cpStartCountdown(onDone) {
  let secs = 2;
  const circ = 163.4; // 2π × 26

  const tick = () => {
    if (dom.cpCountdownNum) dom.cpCountdownNum.textContent = String(secs);
    if (dom.cpCountdownRing) {
      const offset = circ - (secs / 2) * circ;
      dom.cpCountdownRing.style.strokeDashoffset = String(offset);
    }
  };

  tick();
  const timer = setInterval(() => {
    secs -= 1;
    tick();
    if (secs <= 0) {
      clearInterval(timer);
      state.coinCountdownTimer = null;
      onDone && onDone();
    }
  }, 1000);
  state.coinCountdownTimer = timer;
}

function cpSubmitAnswer(answer, method) {
  state.coinUserAnswer   = method === "truth" ? answer : null;
  state.coinPublicAnswer = answer;

  state.coinResponses.push({
    publicAnswer: answer,
    method,
    coinSide:  state.coinSide,
    coinSide2: state.coinSide2 || null,
    timestamp: Date.now(),
  });

  const total    = state.coinResponses.length;
  const yesCount = state.coinResponses.filter(r => r.publicAnswer === "YES").length;
  const noCount  = total - yesCount;

  const explanation = method === "truth"
    ? `You answered <strong>${answer}</strong> honestly (Heads → truth). Recorded as "<strong>${answer}</strong>".`
    : `You answered <strong>${answer}</strong> randomly (after Tails). Recorded as "<strong>${answer}</strong>" — but no one can verify it.`;

  if (dom.cpDoneMsg)    dom.cpDoneMsg.innerHTML = explanation;
  if (dom.cpStatAnswer) dom.cpStatAnswer.textContent = answer;
  if (dom.cpStatMethod) dom.cpStatMethod.textContent = method === "truth" ? "Heads → Truth" : "Tails → Random";
  if (dom.cpStatTally)  dom.cpStatTally.textContent  = `${yesCount} YES · ${noCount} NO (${total} total)`;

  cpShowState("done");
}

function resetCoinGame() {
  if (state.coinCountdownTimer) { clearInterval(state.coinCountdownTimer); state.coinCountdownTimer = null; }
  state.coinSide  = null;
  state.coinSide2 = null;
  state.coinUserAnswer   = null;
  state.coinPublicAnswer = null;

  // Reset coin visuals
  [dom.cpCoinInner, dom.cpCoinInner2].forEach(el => {
    if (!el) return;
    el.classList.remove("cp-spinning", "cp-landed-heads", "cp-landed-tails");
  });
  if (dom.cpBackWord)  dom.cpBackWord.textContent  = "?";
  if (dom.cpBackSub)   dom.cpBackSub.textContent   = "";
  if (dom.cpBackWord2) dom.cpBackWord2.textContent = "?";
  if (dom.cpBackSub2)  dom.cpBackSub2.textContent  = "";

  cpShowState("idle");
}

function bindCoinInteraction() {
  // First flip
  const flipBtn = document.getElementById("cp-flip-btn");
  if (flipBtn) {
    flipBtn.addEventListener("click", () => {
      flipBtn.disabled = true;
      const side = Math.random() < 0.5 ? "heads" : "tails";
      state.coinSide = side;

      cpAnimateCoin(dom.cpCoinInner, dom.cpBackWord, dom.cpBackSub, side, () => {
        flipBtn.disabled = false;
        if (side === "heads") {
          cpShowState("heads");
        } else {
          cpShowState("tails");
          cpStartCountdown(() => {
            cpShowState("reflip");
          });
        }
      });
    });
  }

  // Answer buttons after HEADS
  const headsYes = document.getElementById("cp-heads-yes");
  const headsNo  = document.getElementById("cp-heads-no");
  if (headsYes) headsYes.addEventListener("click", () => cpSubmitAnswer("YES", "truth"));
  if (headsNo)  headsNo.addEventListener("click",  () => cpSubmitAnswer("NO",  "truth"));

  // Second flip button (after tails countdown)
  const reflipBtn = document.getElementById("cp-reflip-btn");
  if (reflipBtn) {
    reflipBtn.addEventListener("click", () => {
      reflipBtn.disabled = true;
      const side2 = Math.random() < 0.5 ? "heads" : "tails";
      state.coinSide2 = side2;

      cpAnimateCoin(dom.cpCoinInner2, dom.cpBackWord2, dom.cpBackSub2, side2, () => {
        reflipBtn.disabled = false;
        const label = side2 === "heads" ? "🟡 Heads (2nd flip) — answer randomly!" : "🔵 Tails again — answer randomly!";
        if (dom.cpRandomBadge) dom.cpRandomBadge.textContent = label;
        cpShowState("random");
      });
    });
  }

  // Answer buttons after RANDOM (second flip)
  const randYes = document.getElementById("cp-random-yes");
  const randNo  = document.getElementById("cp-random-no");
  if (randYes) randYes.addEventListener("click", () => cpSubmitAnswer("YES", "random"));
  if (randNo)  randNo.addEventListener("click",  () => cpSubmitAnswer("NO",  "random"));

  // Retry button
  const retryBtn = document.getElementById("cp-retry-btn");
  if (retryBtn) retryBtn.addEventListener("click", resetCoinGame);
}


function setExampleStyle(styleId) {
  if (!EXAMPLE_STYLES[styleId] || state.exampleStyle === styleId) {
    return;
  }

  state.exampleStyle = styleId;
  updateExampleVoteUI();
  state.statusMessage = `Example view: ${EXAMPLE_STYLES[styleId].label}`;
  updateFooter();

  if (state.currentStepId === "step-example") {
    requestSceneRender();
  }
}

function updateExampleVoteUI() {
  dom.exampleVoteButtons.forEach((button) => {
    const isSelected = button.dataset.exampleStyle === state.exampleStyle;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function createExampleVoteResultsAnimation() {
  const votePool = Object.entries(EXAMPLE_VOTE_RESULTS).flatMap(([styleId, total]) =>
    Array.from({ length: total }, () => styleId)
  );

  for (let index = votePool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [votePool[index], votePool[swapIndex]] = [votePool[swapIndex], votePool[index]];
  }

  const ordinals = {
    skibidi: 0,
    rizz: 0,
    carl: 0,
  };

  const drops = votePool.map((styleId, index) => {
    ordinals[styleId] += 1;

    return {
      styleId,
      ordinal: ordinals[styleId],
      tone: Math.random() < 0.36 ? "blue" : "gold",
      startAt: index * 0.18 + Math.random() * 0.05,
      duration: 0.88 + Math.random() * 0.16,
      spawnXRatio: 0.12 + Math.random() * 0.76,
      swayRatio: (Math.random() - 0.5) * 0.18,
      targetJitterRatio: (Math.random() - 0.5) * 0.14,
      size: 0.88 + Math.random() * 0.22,
      tilt: (Math.random() - 0.5) * 24,
    };
  });

  const finalDrop = drops[drops.length - 1];

  return {
    elapsed: 0,
    complete: false,
    drops,
    lastReportedTotal: 0,
    totalDuration: finalDrop ? finalDrop.startAt + finalDrop.duration + 0.5 : 0,
  };
}

function getExampleVoteResultCounts(elapsed, drops) {
  const counts = {
    skibidi: 0,
    rizz: 0,
    carl: 0,
  };

  drops.forEach((drop) => {
    if (elapsed >= drop.startAt + drop.duration) {
      counts[drop.styleId] += 1;
    }
  });

  return counts;
}

function updateExampleVoteResultsAnimation(dt) {
  if (state.currentStepId !== "scene-example-results" || !state.exampleVoteResults) {
    return;
  }

  const animation = state.exampleVoteResults;
  const wasComplete = animation.complete;
  animation.elapsed = Math.min(animation.elapsed + dt, animation.totalDuration);
  animation.complete = animation.elapsed >= animation.totalDuration - 0.0001;

  const counts = getExampleVoteResultCounts(animation.elapsed, animation.drops);
  const totalCounted = counts.skibidi + counts.rizz + counts.carl;

  if (totalCounted !== animation.lastReportedTotal) {
    animation.lastReportedTotal = totalCounted;
    state.statusMessage = animation.complete
      ? "Vote results finalized: 6-7 Squeaker wins"
      : `Counting votes: ${totalCounted}/${animation.drops.length}`;
    updateFooter();
  }

  if (!animation.complete || !wasComplete) {
    requestSceneRender();
  }
}

function getExamplePrivacyStudents() {
  return state.renderMetrics.width < 720
    ? ["👧🏿", "👦🏻", "👨🏾‍🦲", "👱🏼‍♀️", "🧕🏽"]
    : ["👧🏿", "👦🏻", "👨🏾‍🦲", "👱🏼‍♀️", "🧕🏽", "🧑🏽"];
}

function createExamplePrivacyAnimation() {
  const students = getExamplePrivacyStudents();
  let maxEnd = 0;

  const rows = students.map((emoji, rowIndex) => {
    const pattern = EXAMPLE_PRIVACY_TOSS_PATTERNS[emoji] || [
      { side: "tails", duration: 0.78, arcLift: 56, drift: 0 },
      { side: "heads", duration: 0.76, arcLift: 52, drift: -8 },
      { side: "tails", duration: 0.8, arcLift: 58, drift: 8 },
    ];
    const rowStart = rowIndex * 0.22;
    const coins = pattern.map((coinPattern, coinIndex) => {
      const startAt = rowStart + (coinIndex === 0 ? 0 : 0.34 + (coinIndex - 1) * 0.26);
      const duration = coinPattern.duration;
      maxEnd = Math.max(maxEnd, startAt + duration);

      return {
        side: coinPattern.side,
        label: String(coinIndex + 1),
        startAt,
        duration,
        arcLift: coinPattern.arcLift,
        drift: coinPattern.drift,
      };
    });

    return {
      emoji,
      coins,
    };
  });

  return {
    elapsed: 0,
    complete: false,
    rows,
    totalDuration: maxEnd + 0.3,
  };
}

function updateExamplePrivacyAnimation(dt) {
  if (state.currentStepId !== "scene-example-privacy" || !state.examplePrivacyAnimation) {
    return;
  }

  const animation = state.examplePrivacyAnimation;
  const wasComplete = animation.complete;
  animation.elapsed = Math.min(animation.elapsed + dt, animation.totalDuration);
  animation.complete = animation.elapsed >= animation.totalDuration - 0.0001;

  if (!animation.complete || !wasComplete) {
    requestSceneRender();
  }
}

function onGlobalKeydown(event) {
  if (shouldIgnoreGlobalKeydown(event)) {
    return;
  }

  if (event.key === "Escape" && isControlsHudOpen()) {
    event.preventDefault();
    toggleControlsHud(false);
    return;
  }

  if (event.key === "?" || event.key === "/") {
    event.preventDefault();
    toggleControlsHud();
    return;
  }

  if (isControlsHudOpen() && event.key !== "Escape") {
    return;
  }

  const nextKeys = new Set(["j", "l", "ArrowDown", "ArrowRight", "PageDown"]);
  const previousKeys = new Set(["k", "h", "ArrowUp", "ArrowLeft", "PageUp"]);

  if (nextKeys.has(event.key)) {
    event.preventDefault();
    navigateStoryBy(1);
    return;
  }

  if (previousKeys.has(event.key)) {
    event.preventDefault();
    navigateStoryBy(-1);
  }
}

function shouldIgnoreGlobalKeydown(event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
    return true;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest('input, textarea, select, button, summary, [contenteditable="true"], [contenteditable=""]')
  );
}

function navigateStoryBy(offset) {
  const currentIndex = Math.max(
    dom.steps.findIndex((step) => step.id === state.currentArticleId),
    0
  );
  const nextIndex = clamp(currentIndex + offset, 0, dom.steps.length - 1);

  if (nextIndex === currentIndex) {
    return;
  }

  scrollToStep(dom.steps[nextIndex].id);
}

function isControlsHudOpen() {
  return dom.controlsHud?.dataset.open === "true";
}

function toggleControlsHud(forceState) {
  if (!dom.controlsHud || !dom.controlsHudToggle || !dom.controlsHudPanel) {
    return;
  }

  const nextState = typeof forceState === "boolean" ? forceState : !isControlsHudOpen();
  dom.controlsHud.dataset.open = nextState ? "true" : "false";
  dom.controlsHudToggle.setAttribute("aria-expanded", String(nextState));
  dom.controlsHudPanel.hidden = !nextState;
}

function onWindowPointerDown(event) {
  if (!isControlsHudOpen() || !dom.controlsHud) {
    return;
  }

  if (event.target instanceof Node && !dom.controlsHud.contains(event.target)) {
    toggleControlsHud(false);
  }
}

function bindHeroInteraction() {
  if (!dom.heroVisual) {
    return;
  }

  dom.heroVisual.addEventListener("pointerenter", onHeroPointerMove);
  dom.heroVisual.addEventListener("pointermove", onHeroPointerMove);
  dom.heroVisual.addEventListener("pointerleave", () => {
    state.heroPointer.active = false;
  });
}

function onHeroPointerMove(event) {
  if (!dom.heroCoinfield) {
    return;
  }

  const rect = dom.heroCoinfield.getBoundingClientRect();
  state.heroPointer.active = true;
  state.heroPointer.x = event.clientX - rect.left;
  state.heroPointer.y = event.clientY - rect.top;
}

function setupScrollama() {
  scroller = scrollama();
  scroller
    .setup({
      step: ".step",
      offset: 0.55,
      progress: true,
      debug: false,
    })
    .onStepEnter((response) => {
      setActiveStep(response.element);
    })
    .onStepProgress((response) => {
      if (response.element.id === state.currentArticleId) {
        state.stepProgress = response.progress;
        if (state.currentRailRef === "step-1") {
          requestSceneRender();
        }
      }
      updateStoryChrome(response.index, response.progress);
    });
}

function onResize() {
  buildHeroCoinfield();
  resizeScene();
  if (scroller) {
    scroller.resize();
  }
  updateStoryChrome(dom.steps.findIndex((step) => step.id === state.currentArticleId), state.stepProgress);
  renderScene();
}

function requestSceneRender() {
  state.overlayDirty = true;
}

function getStepSceneId(step) {
  return step?.dataset.sceneRef || step?.id || "scene-definition";
}

function getStepRailRef(step) {
  return step?.dataset.railRef || step?.id || "step-1";
}

function getSceneTheme(sceneId) {
  if (sceneId === "scene-definition" || sceneId === "scene-compare") {
    return "step-1";
  }

  if (
    sceneId === "scene-example-voting" ||
    sceneId === "scene-example-results" ||
    sceneId === "scene-example-privacy" ||
    sceneId === "scene-example-flow"
  ) {
    return "step-example";
  }

  return sceneId;
}

function getRailSteps(railRef = state.currentRailRef) {
  return dom.steps.filter((step) => getStepRailRef(step) === railRef);
}

function getRailSegmentProgress(railRef = state.currentRailRef, articleId = state.currentArticleId, stepProgress = state.stepProgress) {
  const chapterSteps = getRailSteps(railRef);

  if (!chapterSteps.length) {
    return clamp(stepProgress, 0, 1);
  }

  const articleIndex = Math.max(
    chapterSteps.findIndex((step) => step.id === articleId),
    0
  );

  return clamp((articleIndex + stepProgress) / chapterSteps.length, 0, 1);
}

function getRailFillPercent(railIndex, chapterProgress) {
  if (!dom.storyRailProgress || !dom.railItems.length) {
    return ((railIndex + chapterProgress) / Math.max(STEP_ORDER.length, 1)) * 100;
  }

  const progressRect = dom.storyRailProgress.getBoundingClientRect();

  if (!progressRect.height) {
    return ((railIndex + chapterProgress) / Math.max(STEP_ORDER.length, 1)) * 100;
  }

  const currentItem = dom.railItems[railIndex];
  const nextItem = dom.railItems[Math.min(railIndex + 1, dom.railItems.length - 1)];
  const currentRect = currentItem?.getBoundingClientRect();
  const nextRect = nextItem?.getBoundingClientRect();

  if (!currentRect || !nextRect) {
    return ((railIndex + chapterProgress) / Math.max(STEP_ORDER.length, 1)) * 100;
  }

  const currentCenter = clamp(
    currentRect.top + currentRect.height * 0.5 - progressRect.top,
    0,
    progressRect.height
  );
  const nextCenter =
    railIndex < dom.railItems.length - 1
      ? clamp(nextRect.top + nextRect.height * 0.5 - progressRect.top, 0, progressRect.height)
      : progressRect.height;
  const fillPixels = currentCenter + (nextCenter - currentCenter) * chapterProgress;

  return clamp((fillPixels / progressRect.height) * 100, 0, 100);
}

function updateStoryChrome(activeIndex = dom.steps.findIndex((step) => step.id === state.currentArticleId), stepProgress = 0) {
  const safeIndex = activeIndex < 0 ? 0 : activeIndex;
  const railIndex = Math.max(STEP_ORDER.indexOf(state.currentRailRef), 0);
  const chapterProgress = getRailSegmentProgress(state.currentRailRef, state.currentArticleId, stepProgress);
  const fillPercent = getRailFillPercent(railIndex, chapterProgress);

  dom.body.dataset.scene = getSceneTheme(state.currentStepId);
  dom.sceneCount.textContent = String(railIndex + 1).padStart(2, "0");
  dom.storyProgress.style.height = `${fillPercent}%`;

  dom.railItems.forEach((item, index) => {
    item.classList.toggle("is-active", index === railIndex);
    item.classList.toggle("is-past", index < railIndex);
  });

  dom.railButtons.forEach((button, index) => {
    if (index === railIndex) {
      button.setAttribute("aria-current", "step");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function scrollToStep(stepId) {
  const targetStep = dom.steps.find((step) => step.id === stepId);

  if (!targetStep) {
    return;
  }

  const targetTop = targetStep.getBoundingClientRect().top + window.scrollY - Math.max(window.innerHeight * 0.14, 96);
  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth",
  });
}

function resizeScene() {
  const rect = dom.stage.getBoundingClientRect();
  state.renderMetrics.width = rect.width;
  state.renderMetrics.height = rect.height;
  state.renderMetrics.stacked = window.innerWidth <= 900;

  dom.canvas.width = Math.round(rect.width * state.renderMetrics.dpr);
  dom.canvas.height = Math.round(rect.height * state.renderMetrics.dpr);
  dom.canvas.style.width = `${rect.width}px`;
  dom.canvas.style.height = `${rect.height}px`;
  ctx.setTransform(state.renderMetrics.dpr, 0, 0, state.renderMetrics.dpr, 0, 0);

  dom.svgNode.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  state.geometry = buildGeometry(rect.width, rect.height);
  repositionParticlesAfterResize();
}

function buildGeometry(width, height) {
  const compact = width < 620;
  const flowCenterY = height * (compact ? 0.52 : 0.5);
  const laneOffset = compact ? Math.max(height * 0.16, 70) : height * 0.18;
  const bucketWidth = compact ? Math.min(width * 0.24, 112) : Math.min(width * 0.18, 138);
  const bucketHeight = compact ? 92 : 112;

  return {
    width,
    height,
    spawn: { x: width * 0.12, y: flowCenterY },
    gate: { x: width * 0.44, y: flowCenterY },
    guideLeft: { x: width * 0.64, y: flowCenterY - laneOffset },
    guideRight: { x: width * 0.64, y: flowCenterY + laneOffset },
    bucketYes: {
      x: width * 0.84,
      y: flowCenterY - laneOffset,
      width: bucketWidth,
      height: bucketHeight,
      barWidth: bucketWidth - (compact ? 22 : 28),
      barHeight: compact ? 10 : 12,
    },
    bucketNo: {
      x: width * 0.84,
      y: flowCenterY + laneOffset,
      width: bucketWidth,
      height: bucketHeight,
      barWidth: bucketWidth - (compact ? 22 : 28),
      barHeight: compact ? 10 : 12,
    },
    topCard: {
      x: width * 0.09,
      y: height * 0.1,
      width: width * 0.82,
      height: height * 0.28,
    },
    pipelineY: height * 0.53,
  };
}

function repositionParticlesAfterResize() {
  state.particles.forEach((particle) => {
    if (particle.phase === "IN_BUCKET" || particle.phase === "POST_COIN") {
      const bucket = particle.publicAnswer === "YES" ? state.geometry.bucketYes : state.geometry.bucketNo;
      particle.bucketTargetX = bucket.x + particle.bucketOffsetX;
      particle.bucketTargetY = bucket.y + particle.bucketOffsetY;
    }
  });
}

function createParticipants(total) {
  return Array.from({ length: total }, (_, index) => {
    const secretAnswer = Math.random() < state.trueYesRate ? "YES" : "NO";
    return {
      id: `${state.runId}-${index}`,
      secretAnswer,
      publicAnswer: null,
      phase: "SPAWN",
      x: -40,
      y: state.geometry.spawn.y,
      size: secretAnswer === "YES" ? 6 : 8,
      toCoinProgress: 0,
      postCoinProgress: 0,
      startX: -40 - Math.random() * 140,
      startY: state.geometry.spawn.y + (Math.random() - 0.5) * (state.renderMetrics.height * 0.14),
      drift: (Math.random() - 0.5) * (state.renderMetrics.height * 0.12),
      speed: 0.32 + Math.random() * 0.16,
      routeBend: (Math.random() - 0.5) * 56,
      bucketOffsetX: (Math.random() - 0.5) * (state.geometry.bucketYes.width * 0.14),
      bucketOffsetY: (Math.random() - 0.5) * (state.geometry.bucketYes.height * 0.22),
      decisionTruthProbability: null,
      runId: state.runId,
    };
  });
}

function restartSimulation(reason) {
  state.runId += 1;
  state.particles = createParticipants(state.participantsTarget);
  state.spawnCursor = 0;
  state.spawnAccumulator = 0;
  state.publicYesCount = 0;
  state.publicNoCount = 0;
  state.completedCount = 0;
  state.runComplete = false;
  state.statusMessage =
    reason === "teacher-preset" || reason === "teacher-true-rate"
      ? "Simulation restarted with a new hidden truth rate"
      : "Streaming participants toward the coin gate";
  updateFooter();
  runTeacherChecks();
  if (state.currentStepId === "step-4") {
    requestSceneRender();
  }
}

function onTruthSliderInput() {
  state.pTruth = Number(dom.truthSlider.value);
  updateTruthUI();
  if (state.runComplete) {
    restartSimulation("truth-slider-after-complete");
  } else {
    state.statusMessage = "New particles will follow the updated coin bias";
    updateFooter();
    runTeacherChecks();
  }
  requestSceneRender();
}

function commitParticipantsInput() {
  const rawValue = Number(dom.participantsInput.value);
  const clamped = clamp(Math.round(rawValue || 0), 1, state.participantsCap);
  dom.participantsInput.value = String(clamped);
  state.participantsTarget = clamped;

  if (rawValue > state.participantsCap) {
    dom.participantStatus.textContent = `That is a big crowd, so the demo caps the class at ${state.participantsCap.toLocaleString()} participants.`;
  } else if (rawValue < 1 || Number.isNaN(rawValue)) {
    dom.participantStatus.textContent = "Use at least 1 participant so the simulation has someone to protect.";
  } else {
    dom.participantStatus.textContent = `Re-running the simulation with ${clamped.toLocaleString()} participants.`;
  }

  restartSimulation("participants");
}

function setActiveStep(stepRef) {
  const step = typeof stepRef === "string" ? dom.steps.find((item) => item.id === stepRef) : stepRef;

  if (!step) {
    return;
  }

  const sceneId = getStepSceneId(step);
  const sceneChanged = state.currentStepId !== sceneId;
  const previousArticleId = state.currentArticleId;

  state.currentArticleId = step.id;
  state.currentRailRef = getStepRailRef(step);
  state.stepProgress = 0;
  dom.steps.forEach((item) => {
    item.classList.toggle("is-active", item.id === state.currentArticleId);
  });

  if (sceneChanged) {
    state.currentStepId = sceneId;

    switch (sceneId) {
      case "scene-who-why":
        state.sceneFlags = { showWhoWhy: true };
        syncControlVisibility();
        break;
    case "scene-definition":
        enterStep1Definition();
        break;
      case "scene-compare":
        enterStep1Compare();
        break;
      case "scene-example-voting":
        enterStepExampleVoting();
        break;
      case "scene-example-results":
        enterStepExampleResults();
        break;
      case "scene-example-privacy":
        enterStepExamplePrivacy();
        break;
      case "scene-example-flow":
        enterStepExampleFlow();
        break;
      case "step-2":
        enterStep2();
        break;
      case "step-example":
        enterStepExample();
        break;
      case "step-3":
        enterStep3();
        break;
      case "step-4":
        enterStep4();
        break;
      case "step-eps-setup":
        enterStepEpsSetup();
        break;
      case "step-eps-live":
        enterStepEpsLive();
        break;
      case "step-5a":
        enterStep5a();
        break;
      case "step-5b":
        enterStep5b();
        break;
      case "step-5c":
        enterStep5c();
        break;
      case "scene-kanon-sarah":
        enterStepKanonSarah();
        break;
      case "scene-kanon-exposed":
        enterStepKanonExposed();
        break;
      case "scene-kanon-definition":
        enterStepKanonDefinition();
        break;
      case "scene-kanon-transform":
        enterStepKanonTransform();
        break;
      case "scene-kanon-group":
        enterStepKanonGroup();
        break;
      case "scene-kanon-input":
        enterStepKanonInput();
        break;
      case "scene-kanon-why":
      case "scene-kanon-tradeoff":
      case "scene-kanon-impact":
        enterStepKanonStatic();
        break;
      default:
        enterStep1Definition();
    }

    renderScene();
  } else if (
    ["scene-definition", "scene-compare"].includes(state.currentStepId) &&
    previousArticleId !== state.currentArticleId
  ) {
    syncStep1BeatMeta();
    syncControlVisibility();
    renderScene();
  }

  updateStoryChrome(dom.steps.findIndex((item) => item.id === state.currentArticleId), 0.1);
}

function enterStep1Definition() {
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  syncStep1BeatMeta();
  syncControlVisibility();
}

function enterStep1Compare() {
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  syncStep1BeatMeta();
  syncControlVisibility();
}

function syncStep1BeatMeta() {
  switch (state.currentArticleId) {
    case "step-1":
      state.sceneTitle = "";
      state.sceneSubtitle = "";
      state.statusMessage = "Opening view: start with the question";
      break;
    case "step-1b":
      state.sceneTitle = "";
      state.sceneSubtitle = "";
      state.statusMessage = "Who uses differential privacy: example users fade in around the question";
      break;
    case "step-1b2":
      state.sceneTitle = "";
      state.sceneSubtitle = "";
      state.statusMessage = "Why companies use differential privacy";
      break;
    case "step-1c":
      state.sceneTitle = "Compare neighboring datasets";
      state.sceneSubtitle = "Hold everything fixed except one student.";
      state.statusMessage = "Comparison view: line up two class lists that differ by one person";
      break;
    case "step-1d":
      state.sceneTitle = "The crowd pattern stays";
      state.sceneSubtitle = "Both releases tell nearly the same class story.";
      state.statusMessage = "Comparison view: the person fades, the aggregate stays";
      break;
    default:
      state.sceneTitle = "Differential privacy";
      state.sceneSubtitle = "A released result should stay nearly the same when one person's data changes.";
      state.statusMessage = "Definition view: start with the rule";
  }

  if (["step-1", "step-1b", "step-1b2"].includes(state.currentArticleId)) {
    dom.sceneKicker.textContent = "";
  } else if (["step-1c", "step-1d"].includes(state.currentArticleId)) {
    dom.sceneKicker.textContent = "Chapter 2";
  } else {
    dom.sceneKicker.textContent = "Chapter 1";
  }
}

function enterStep1() {
  enterStep1Definition();
}

function enterStep2() {
  state.sceneTitle = "Randomized response";
  state.sceneSubtitle = "Question, coin flip, noisy reply.";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "Flow chart: sensitive question to noisy local report";
  dom.sceneKicker.textContent = "Chapter 3";
  syncControlVisibility();
}

function enterStepExample() {
  state.sceneTitle = "";
  state.sceneSubtitle = "";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = `Example view: ${EXAMPLE_STYLES[state.exampleStyle].label}`;
  dom.sceneKicker.textContent = "";
  updateExampleVoteUI();
  syncControlVisibility();
}

function enterStepExampleVoting() {
  state.sceneTitle = "";
  state.sceneSubtitle = "";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "Voting view: public favorites and one private preference";
  dom.sceneKicker.textContent = "";
  syncControlVisibility();
}

function enterStepExampleResults() {
  state.sceneTitle = "";
  state.sceneSubtitle = "";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.exampleVoteResults = createExampleVoteResultsAnimation();
  state.statusMessage = "Vote results: the bars fill as the votes drop in";
  dom.sceneKicker.textContent = "";
  syncControlVisibility();
}

function enterStepExamplePrivacy() {
  state.sceneTitle = "";
  state.sceneSubtitle = "";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.examplePrivacyAnimation = createExamplePrivacyAnimation();
  state.statusMessage = "Privacy view: local randomization crosses the barrier and only the aggregate survives";
  dom.sceneKicker.textContent = "";
  syncControlVisibility();
}

function enterStepExampleFlow() {
  state.sceneTitle = "";
  state.sceneSubtitle = "";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "Flow view: Carl can appear even when Carl was not the truthful vote";
  dom.sceneKicker.textContent = "";
  syncControlVisibility();
}

function enterStep3() {
  state.sceneTitle = "Flip the coin. Then answer the survey.";
  state.sceneSubtitle = "Heads = tell the truth. Tails = answer randomly.";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
    showCoin: true,
    showDbResults: false,
  };
  state.statusMessage = "Flip the coin and answer to experience randomized response";
  dom.sceneKicker.textContent = "Chapter 4";
  syncControlVisibility();
  // Reset coin game when entering this chapter
  resetCoinGame();
}

function enterStep4() {
  state.sceneTitle = "What the crowd really thinks — protected";
  state.sceneSubtitle = "Noisy public answers. True rate estimated with math.";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
    showCoin: false,
    showDbResults: true,
  };
  state.statusMessage = "Showing aggregate results from the randomized response survey";
  dom.sceneKicker.textContent = "Chapter 5";
  syncControlVisibility();
  animateDbResults();
}

function enterStep5a() {
  state.sceneTitle = "Google’s RAPPOR: scramble on the device, learn from the crowd";
  state.sceneSubtitle = "Scramble first. Aggregate later.";
  state.sceneFlags = {
    showSlider: true,
    showParticipants: false,
    showCounts: false,
    showCoin: false,
    showDbResults: false,
    showEps: false,
  };
  state.statusMessage = "Pipeline view: device → randomized report → aggregator";
  dom.sceneKicker.textContent = "Chapter 8";
  syncControlVisibility();
}

function enterStepEpsSetup() {
  state.sceneTitle = "The true dataset — before any noise";
  state.sceneSubtitle = "1 million votes, exact counts. Publishing this exposes everyone.";
  state.sceneFlags = {
    showSlider: false, showParticipants: false, showCounts: false,
    showCoin: false, showDbResults: false, showEps: true, epsMode: "setup",
  };
  state.statusMessage = "True dataset: see the raw counts before DP noise is applied";
  dom.sceneKicker.textContent = "Chapter 6";
  syncControlVisibility();
  renderEpsTrueDataset();
}

function enterStepEpsLive() {
  state.sceneTitle = "Tune ε and watch the noise change";
  state.sceneSubtitle = "Drag the slider. The published counts update live.";
  state.sceneFlags = {
    showSlider: false, showParticipants: false, showCounts: false,
    showCoin: false, showDbResults: false, showEps: true, epsMode: "live",
  };
  state.statusMessage = "Live ε explorer: drag the knob to see privacy vs accuracy";
  dom.sceneKicker.textContent = "Chapter 7";
  syncControlVisibility();
  renderEpsLive(state.epsEpsilon);
}

function enterStep5b() {
  state.sceneTitle = "Apple: on-device privacy before trend learning";
  state.sceneSubtitle = "Private contribution, visible trend.";
  state.sceneFlags = {
    showSlider: true,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "Pipeline view: on-device noise → trend result";
  dom.sceneKicker.textContent = "Chapter 9";
  syncControlVisibility();
}

function enterStep5c() {
  state.sceneTitle = "TikTok PrivacyGo: protected measurement for advertising";
  state.sceneSubtitle = "Protected matching, aggregate reporting.";
  state.sceneFlags = {
    showSlider: true,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "Pipeline view: private matching → DP-protected reporting";
  dom.sceneKicker.textContent = "Chapter 10";
  syncControlVisibility();
}


// ── Who/Why Panel (step-1b2) ──────────────────────────
function renderWhoWhyPanel() {
  const panel = dom.whoWhyPanel;
  if (!panel) return;
  // Only rebuild if empty
  if (panel.children.length > 0) return;

  const companies = [
    {
      emoji: "🎵",
      name: "TikTok",
      role: "Social media platform",
      why: "TikTok’s PrivacyGo program uses DP to measure ad campaign reach and conversion rates without ever exposing which videos any individual user watched.",
      accent: "#ff6f61",
      bg: "rgba(255,111,97,0.07)",
      border: "rgba(255,111,97,0.28)",
    },
    {
      emoji: "🍎",
      name: "Apple",
      role: "Device & software maker",
      why: "Apple applies DP on-device before data leaves your iPhone — learning popular emoji, keyboard words, and health trends across millions of users while guaranteeing no individual record is identifiable.",
      accent: "#148a88",
      bg: "rgba(20,138,136,0.07)",
      border: "rgba(20,138,136,0.28)",
    },
    {
      emoji: "💬",
      name: "Meta",
      role: "Social networking",
      why: "Meta uses DP in its research pipelines to train recommendation models on billions of interactions. It ensures that removing any one person’s data changes the model output by at most e^ε.",
      accent: "#2c88d9",
      bg: "rgba(44,136,217,0.07)",
      border: "rgba(44,136,217,0.28)",
    },
    {
      emoji: "📈",
      name: "US Bureau of Labor Statistics",
      role: "Government agency",
      why: "The BLS publishes wage and employment statistics from sensitive surveys. DP lets them release accurate national-level data while legally protecting every individual respondent.",
      accent: "#f2b84b",
      bg: "rgba(242,184,75,0.08)",
      border: "rgba(242,184,75,0.35)",
    },
  ];

  panel.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "wwp-grid";

  companies.forEach((c) => {
    const card = document.createElement("div");
    card.className = "wwp-card";
    card.style.setProperty("--accent", c.accent);
    card.style.setProperty("--bg", c.bg);
    card.style.setProperty("--border-col", c.border);
    card.style.background = c.bg;
    card.style.borderColor = c.border;

    card.innerHTML = `
      <div class="wwp-card__top">
        <span class="wwp-card__emoji">${c.emoji}</span>
        <div>
          <div class="wwp-card__name" style="color:${c.accent}">${c.name}</div>
          <div class="wwp-card__role">${c.role}</div>
        </div>
      </div>
      <div class="wwp-card__why">${c.why}</div>
      <div class="wwp-card__hint" style="color:${c.accent}">Click to expand ↓</div>
    `;

    const why = card.querySelector(".wwp-card__why");
    const hint = card.querySelector(".wwp-card__hint");

    const expand = () => {
      card.classList.add("is-expanded");
      card.style.background = c.bg.replace("0.07","0.14").replace("0.08","0.14");
      card.style.borderColor = c.accent;
      card.style.boxShadow = `0 8px 22px ${c.border}`;
      why.style.maxHeight = "8rem";
      why.style.opacity = "1";
      why.style.marginTop = "0.45rem";
      hint.style.opacity = "0";
    };
    const collapse = () => {
      card.classList.remove("is-expanded");
      card.style.background = c.bg;
      card.style.borderColor = c.border;
      card.style.boxShadow = "none";
      why.style.maxHeight = "0";
      why.style.opacity = "0";
      why.style.marginTop = "0";
      hint.style.opacity = "1";
    };

    card.addEventListener("click", () => {
      const wasExpanded = card.classList.contains("is-expanded");
      grid.querySelectorAll(".wwp-card.is-expanded").forEach(c2 => {
        c2.classList.remove("is-expanded");
        const b = c2.querySelector(".wwp-card__why");
        const h = c2.querySelector(".wwp-card__hint");
        c2.style.boxShadow = "none";
        if (b) { b.style.maxHeight="0"; b.style.opacity="0"; b.style.marginTop="0"; }
        if (h) h.style.opacity = "1";
        // reset bg/border via stored styles not available here, use class
      });
      if (!wasExpanded) expand();
    });

    card.addEventListener("mouseenter", () => {
      if (!card.classList.contains("is-expanded")) {
        card.style.transform = "translateY(-2px)";
        card.style.boxShadow = `0 5px 16px ${c.border}`;
      }
    });
    card.addEventListener("mouseleave", () => {
      if (!card.classList.contains("is-expanded")) {
        card.style.transform = "";
        card.style.boxShadow = "none";
      }
    });

    grid.appendChild(card);
  });

  panel.appendChild(grid);
}

function syncControlVisibility() {
  dom.truthGroup.classList.toggle("is-hidden", !state.sceneFlags.showSlider);
  dom.participantsGroup.classList.toggle("is-hidden", !state.sceneFlags.showParticipants);

  [dom.statYes, dom.statNo].forEach((element) => {
    element.classList.toggle("is-dim", !state.sceneFlags.showCounts);
  });

  // Who-Why panel (step-1b2)
  const showWhoWhy = !!state.sceneFlags.showWhoWhy;
  if (dom.whoWhyPanel) {
    dom.whoWhyPanel.classList.toggle("is-hidden", !showWhoWhy);
    if (showWhoWhy) renderWhoWhyPanel();
  }

  // Coin interactive panel (Chapter 4)
  const showCoin = !!state.sceneFlags.showCoin;
  if (dom.coinPanel) {
    dom.coinPanel.classList.toggle("is-hidden", !showCoin);
  }

  // DB results panel (Chapter 5)
  const showDb = !!state.sceneFlags.showDbResults;
  if (dom.dbResultsPanel) {
    dom.dbResultsPanel.classList.toggle("is-hidden", !showDb);
  }

  // Epsilon panel (Chapters 6 & 7)
  const showEps = !!state.sceneFlags.showEps;
  if (dom.epsPanel) {
    dom.epsPanel.classList.toggle("is-hidden", !showEps);
    if (showEps) {
      const mode = state.sceneFlags.epsMode;
      if (dom.epsStateSetup) dom.epsStateSetup.classList.toggle("eps-state--hidden", mode !== "setup");
      if (dom.epsStateLive)  dom.epsStateLive.classList.toggle("eps-state--hidden",  mode !== "live");
    }
  }

  // Hide the viz-stage canvas when showing coin, db, or eps panels
  const hideStage = showWhoWhy || showCoin || showDb || showEps;
  if (dom.stage) {
    dom.stage.style.display = hideStage ? "none" : "";
  }

  // When a full-takeover panel (coin / db / eps) is active:
  // hide only the viz-shell header and footer (NOT control-panel — it has the slider).
  // Each control group inside control-panel hides itself via is-hidden.
  const fullTakeover = showWhoWhy || showCoin || showDb || showEps;
  const shellHeader = document.querySelector(".viz-shell__header");
  const vizFooter   = document.querySelector(".viz-footer");
  if (shellHeader) shellHeader.style.display = fullTakeover ? "none" : "";
  if (vizFooter)   vizFooter.style.display   = fullTakeover ? "none" : "";

  dom.vizShell?.classList.toggle(
    "viz-shell--minimal",
    [
      "step-1",
      "step-1b",
      "step-1b2",
      "step-example",
      "step-example-vote",
      "step-example-results",
      "step-example-privacy",
      "step-example-flow",
    ].includes(state.currentArticleId)
  );
  dom.sceneTitle.textContent = state.sceneTitle;
  dom.sceneSubtitle.textContent = state.sceneSubtitle;
  updateFooter();
}

function updateTruthUI() {
  dom.truthSlider.value = String(state.pTruth);
  dom.truthOutput.value = state.pTruth.toFixed(2);
  const truthPercent = Math.round(state.pTruth * 100);
  const randomPercent = Math.round((1 - state.pTruth) * 100);
  dom.truthHelper.textContent = `p = ${state.pTruth.toFixed(2)} → ${truthPercent}% truth, ${randomPercent}% random.`;
}

function updateTrueRateUI() {
  const pct = Math.round(state.trueYesRate * 100);
  dom.trueRateSlider.value = String(state.trueYesRate);
  dom.trueRateOutput.value = `${pct}%`;
  dom.trueYesRateDisplay.textContent = `${pct}%`;
  updateMathPanel();
  updateFooter();
  runTeacherChecks();
}

function updateMathPanel() {
  if (!state.teacherMode) {
    return;
  }

  dom.mathPanel.classList.toggle("is-hidden", !state.showMath);
  dom.toggleMathButton.textContent = state.showMath ? "Hide Math" : "Show Math";

  if (state.pTruth === 0) {
    dom.mathFormulaText.textContent = "Not solvable when p = 0";
    dom.mathSummary.textContent =
      "If nobody answers truthfully, the public reports cannot recover the original YES rate.";
    return;
  }

  dom.mathFormulaText.textContent = "θ = (r - 0.5 × (1 - p)) / p";

  if (state.completedCount === 0) {
    dom.mathSummary.textContent =
      "Waiting for enough public answers to estimate the true YES rate.";
    return;
  }

  const observedRate = state.publicYesCount / Math.max(state.completedCount, 1);
  const estimate = clamp((observedRate - 0.5 * (1 - state.pTruth)) / state.pTruth, 0, 1);
  dom.mathSummary.textContent = `Observed public YES rate r = ${observedRate.toFixed(
    2
  )}. Estimated true YES rate θ ≈ ${(estimate * 100).toFixed(1)}%. Hidden truth rate is ${(
    state.trueYesRate * 100
  ).toFixed(1)}%.`;
}

function runTeacherChecks() {
  if (!state.teacherMode) {
    return;
  }

  const checks = [
    {
      ok: state.pTruth >= 0 && state.pTruth <= 1,
      message: `p is in range [0, 1]: ${state.pTruth.toFixed(2)}`,
    },
    {
      ok: state.participantsTarget >= 1 && state.participantsTarget <= state.participantsCap,
      message: `Participants are in range [1, ${state.participantsCap}]: ${state.participantsTarget}`,
    },
    {
      ok: state.publicYesCount + state.publicNoCount === state.completedCount,
      message: `Public YES + Public NO = completed participants: ${state.completedCount}`,
    },
    {
      ok: !state.runComplete || state.completedCount === state.participantsTarget,
      message: state.runComplete
        ? `Completed run matches participant target: ${state.participantsTarget}`
        : "Run still in progress",
    },
    {
      ok: state.pTruth !== 0,
      message:
        state.pTruth === 0
          ? "Estimation panel disabled because p = 0"
          : "Estimation formula is solvable",
    },
  ];

  state.teacherChecks = checks;
  dom.teacherChecks.innerHTML = checks
    .map(
      (check) =>
        `<div class="teacher-check ${
          check.ok ? "teacher-check--ok" : "teacher-check--warn"
        }">${check.message}</div>`
    )
    .join("");
  updateMathPanel();
}

function renderScene() {
  sceneLayer.selectAll("*").interrupt().remove();
  flowLayer.selectAll("*").interrupt().remove();
  labelLayer.selectAll("*").interrupt().remove();

  switch (state.currentStepId) {
    case "scene-who-why":
      // panel is HTML, no canvas rendering needed
      break;
    case "scene-definition":
      renderStep1DefinitionScene();
      break;
    case "scene-compare":
      renderStep1CompareScene();
      break;
    case "scene-example-voting":
      renderStepExampleVotingScene();
      break;
    case "scene-example-results":
      renderStepExampleResultsScene();
      break;
    case "scene-example-privacy":
      renderStepExamplePrivacyScene();
      break;
    case "scene-example-flow":
      renderStepExampleFlowScene();
      break;
    case "step-2":
      renderStep2Scene();
      break;
    case "step-example":
      renderStepExampleScene();
      break;
    case "step-3":
      renderStep3Scene();
      break;
    case "step-4":
      renderStep4Scene();
      break;
    case "step-eps-setup":
      // handled by HTML panel, no SVG rendering needed
      break;
    case "step-eps-live":
      // handled by HTML panel, no SVG rendering needed
      break;
    case "step-5a":
      renderStep5aScene();
      break;
    case "step-5b":
      renderStep5bScene();
      break;
    case "step-5c":
      renderStep5cScene();
      break;
    default:
      renderStep1DefinitionScene();
  }

  updateFooter();
  state.overlayDirty = false;
}

function renderStep1DefinitionScene() {
  const { width, height } = state.renderMetrics;
  const compact = width < 620;
  const isWhoUsesBeat = state.currentArticleId === "step-1b";
  const emojiFade = isWhoUsesBeat
    ? 1 - easeOut(clamp(state.stepProgress / 0.34, 0, 1))
    : 1;
  const cardReveal = isWhoUsesBeat
    ? easeOut(clamp((state.stepProgress - 0.12) / 0.52, 0, 1))
    : 0;

  const appendFloatingGlyph = ({
    x,
    y,
    text,
    size,
    fill,
    family,
    weight,
    opacity = 1,
    dx = 0,
    dy = -12,
    dur = 8,
    delay = 0,
  }) => {
    const glyph = labelLayer
      .append("text")
      .attr("x", width * x)
      .attr("y", height * y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-family", family)
      .attr("font-size", size)
      .attr("font-weight", weight)
      .attr("fill", fill)
      .attr("opacity", opacity)
      .text(text);

    glyph
      .append("animateTransform")
      .attr("attributeName", "transform")
      .attr("type", "translate")
      .attr("dur", `${dur}s`)
      .attr("begin", `${delay}s`)
      .attr("repeatCount", "indefinite")
      .attr("values", `0 0; ${dx} ${dy}; ${dx * -0.45} ${dy * -0.45}; 0 0`);

    const lowOpacity = opacity <= 0.22 ? opacity * 0.45 : Math.max(opacity - 0.14, 0);
    glyph
      .append("animate")
      .attr("attributeName", "opacity")
      .attr("dur", `${dur}s`)
      .attr("begin", `${delay}s`)
      .attr("repeatCount", "indefinite")
      .attr("values", `${opacity}; ${lowOpacity}; ${opacity}`);
  };

  const appendOrgPlaceholder = ({ name, x, y, accent, assetPath }, index) => {
    const cardWidth = compact ? 168 : 236;
    const cardHeight = compact ? 72 : 92;
    const iconSize = compact ? 36 : 46;
    const iconX = -cardWidth / 2 + (compact ? 14 : 18);
    const iconY = -iconSize / 2;
    const yLift = (1 - cardReveal) * (compact ? 18 : 24);
    const baseX = width * x;
    const baseY = height * y + yLift;
    const hasAsset = ensureOptionalLogoAsset(assetPath);
    const group = labelLayer
      .append("g")
      .attr("opacity", cardReveal)
      .attr("transform", `translate(${baseX}, ${baseY})`);

    group
      .append("rect")
      .attr("x", -cardWidth / 2)
      .attr("y", -cardHeight / 2)
      .attr("width", cardWidth)
      .attr("height", cardHeight)
      .attr("rx", 18)
      .attr("fill", "rgba(255,255,255,0.86)")
      .attr("stroke", accent)
      .attr("stroke-opacity", 0.26);

    if (hasAsset) {
      group
        .append("image")
        .attr("href", assetPath)
        .attr("x", iconX)
        .attr("y", iconY)
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("preserveAspectRatio", "xMidYMid meet");
    } else {
      group
        .append("rect")
        .attr("x", iconX)
        .attr("y", iconY)
        .attr("width", iconSize)
        .attr("height", iconSize)
        .attr("rx", 7)
        .attr("fill", "rgba(255,255,255,0.12)")
        .attr("stroke", accent)
        .attr("stroke-dasharray", "4 4");
    }

    group
      .append("text")
      .attr("x", iconX + iconSize + (compact ? 12 : 16))
      .attr("y", compact ? 5 : 6)
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 16 : 20)
      .attr("font-weight", 700)
      .attr("fill", "#15253d")
      .text(name);

    group.append("title").text(`${name} placeholder: add ${assetPath}`);
    group
      .append("animateTransform")
      .attr("attributeName", "transform")
      .attr("type", "translate")
      .attr("dur", `${7.4 + index * 0.55}s`)
      .attr("begin", `${index * 0.25}s`)
      .attr("repeatCount", "indefinite")
      .attr(
        "values",
        `${baseX} ${baseY}; ${baseX} ${baseY - (compact ? 7 : 10)}; ${baseX} ${baseY}; ${baseX} ${baseY + (compact ? 4 : 6)}; ${baseX} ${baseY}`
      );
  };

  sceneLayer
    .append("circle")
    .attr("cx", width * 0.5)
    .attr("cy", height * 0.5)
    .attr("r", compact ? 108 : 148)
    .attr("fill", "rgba(255,255,255,0.52)")
    .attr("stroke", "rgba(20,138,136,0.18)")
    .attr("stroke-width", 2);

  sceneLayer
    .append("circle")
    .attr("cx", width * 0.5)
    .attr("cy", height * 0.5)
    .attr("r", compact ? 150 : 198)
    .attr("fill", "none")
    .attr("stroke", "rgba(20,138,136,0.12)")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "8 10");

  [
    {
      text: "🤷🏽‍♂️",
      x: 0.5,
      y: 0.52,
      size: compact ? 118 : 168,
      opacity: emojiFade,
      dx: 0,
      dy: compact ? -8 : -12,
      dur: 8.8,
    },
    {
      text: "🤷🏻‍♀️",
      x: 0.31,
      y: 0.43,
      size: compact ? 58 : 86,
      opacity: 0.62 * emojiFade,
      dx: compact ? 6 : 10,
      dy: compact ? -9 : -12,
      dur: 7.2,
      delay: 0.8,
    },
    {
      text: "🤷🏿",
      x: 0.71,
      y: 0.39,
      size: compact ? 54 : 80,
      opacity: 0.58 * emojiFade,
      dx: compact ? -8 : -12,
      dy: compact ? 8 : 10,
      dur: 8.1,
      delay: 1.2,
    },
    {
      text: "🤷🏾‍♀️",
      x: 0.67,
      y: 0.73,
      size: compact ? 50 : 74,
      opacity: 0.46 * emojiFade,
      dx: compact ? 8 : 11,
      dy: compact ? -6 : -9,
      dur: 7.7,
      delay: 0.4,
    },
    {
      text: "🤷🏼‍♂️",
      x: 0.34,
      y: 0.76,
      size: compact ? 46 : 68,
      opacity: 0.4 * emojiFade,
      dx: compact ? -6 : -10,
      dy: compact ? -7 : -10,
      dur: 9.4,
      delay: 1.6,
    },
  ]
    .filter((emoji) => emoji.opacity > 0.02)
    .forEach((emoji) =>
      appendFloatingGlyph({
        ...emoji,
        fill: "#15253d",
      })
    );

  [
    {
      x: 0.22,
      y: 0.23,
      size: compact ? 34 : 50,
      fill: "rgba(20,138,136,0.5)",
      dx: compact ? -4 : -7,
      dy: compact ? -12 : -16,
      dur: 6.8,
      delay: 0.5,
    },
    {
      x: 0.79,
      y: 0.25,
      size: compact ? 31 : 44,
      fill: "rgba(242,184,75,0.56)",
      dx: compact ? 6 : 8,
      dy: compact ? -8 : -12,
      dur: 8.4,
      delay: 1,
    },
    {
      x: 0.84,
      y: 0.57,
      size: compact ? 28 : 40,
      fill: "rgba(129,200,239,0.52)",
      dx: compact ? 4 : 7,
      dy: compact ? 7 : 10,
      dur: 7.3,
      delay: 0.2,
    },
    {
      x: 0.66,
      y: 0.9,
      size: compact ? 24 : 34,
      fill: "rgba(20,138,136,0.42)",
      dx: compact ? -6 : -8,
      dy: compact ? 5 : 8,
      dur: 9.1,
      delay: 1.8,
    },
    {
      x: 0.17,
      y: 0.61,
      size: compact ? 26 : 36,
      fill: "rgba(242,184,75,0.5)",
      dx: compact ? 6 : 9,
      dy: compact ? 4 : 7,
      dur: 7.9,
      delay: 1.1,
    },
    {
      x: 0.4,
      y: 0.14,
      size: compact ? 22 : 30,
      fill: "rgba(129,200,239,0.48)",
      dx: compact ? 3 : 5,
      dy: compact ? -6 : -8,
      dur: 6.6,
      delay: 1.4,
    },
  ].forEach((mark) =>
    appendFloatingGlyph({
      ...mark,
      text: "?",
      family: "Sora",
      weight: 700,
    })
  );

  if (!isWhoUsesBeat || cardReveal <= 0.01) {
    return;
  }

  [
    {
      name: "TikTok",
      x: 0.31,
      y: 0.31,
      accent: "#ff6f61",
      assetPath: "assets/logos/tiktok.svg",
    },
    {
      name: "Apple",
      x: 0.7,
      y: 0.31,
      accent: "#148a88",
      assetPath: "assets/logos/apple.svg",
    },
    {
      name: "Meta",
      x: 0.31,
      y: 0.71,
      accent: "#2c88d9",
      assetPath: "assets/logos/meta.svg",
    },
    {
      name: "BLS",
      x: 0.7,
      y: 0.71,
      accent: "#f2b84b",
      assetPath: "assets/logos/bls.png",
    },
  ].forEach((org, index) => appendOrgPlaceholder(org, index));
}

function renderStep1CompareScene() {
  renderSceneBackdrop("differential privacy");
  const { width, height } = state.renderMetrics;
  const compact = width < 620;
  const leftReveal = 1;
  const rightReveal =
    state.currentArticleId === "step-1c" ? easeOut(clamp((state.stepProgress - 0.06) / 0.56, 0, 1)) : 1;
  const takeawayReveal =
    state.currentArticleId === "step-1d" ? easeOut(clamp(state.stepProgress / 0.7, 0, 1)) : 0;
  const definitionWidth = compact ? width * 0.8 : width * 0.72;
  const definitionHeight = compact ? 136 : 122;
  const definitionX = (width - definitionWidth) / 2;
  const definitionY = height * (compact ? 0.14 : 0.13);
  const cardWidth = compact ? width * 0.35 : width * 0.29;
  const cardHeight = compact ? height * 0.36 : height * 0.39;
  const cardY = compact ? height * 0.43 : height * 0.4;
  const cardXs = compact ? [width * 0.08, width * 0.57] : [width * 0.14, width * 0.48];
  const cards = [
    {
      x: cardXs[0],
      title: "Class list A",
      note: "Maya is included",
      share: 0.3,
      label: "30% YES",
      mode: "include",
      accent: "#2c88d9",
    },
    {
      x: cardXs[1],
      title: "Change one student",
      note: "Maya is removed",
      share: 0.29,
      label: "29% YES",
      mode: "remove",
      accent: "#f2b84b",
    },
  ];

  labelLayer
    .append("foreignObject")
    .attr("x", definitionX)
    .attr("y", definitionY)
    .attr("width", definitionWidth)
    .attr("height", definitionHeight)
    .html(
      `<div xmlns="http://www.w3.org/1999/xhtml" style="background:rgba(255,255,255,0.92);border:1px solid rgba(21,37,61,0.12);border-radius:24px;padding:${compact ? "16px 18px" : "18px 22px"};color:#15253d;font:${compact ? "15px/1.45" : "17px/1.5"} 'Atkinson Hyperlegible', sans-serif;">
        <div style="font:700 ${compact ? "13px" : "14px"} 'Sora', sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:#148a88;margin-bottom:8px;">Definition</div>
        <div style="font:700 ${compact ? "18px" : "21px"} 'Sora', sans-serif;line-height:1.2;margin-bottom:6px;">The released result should stay nearly the same even if one person's data changes.</div>
        <div style="color:#526277;">Keep the crowd pattern. Blur the role of any one person.</div>
      </div>`
    );

  labelLayer
    .append("text")
    .attr("x", width * 0.5)
    .attr("y", compact ? height * 0.37 : height * 0.35)
    .attr("text-anchor", "middle")
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 13 : 14)
    .attr("font-weight", 700)
    .attr("letter-spacing", "0.14em")
    .attr("text-transform", "uppercase")
    .attr("fill", "#148a88")
    .text("Two class lists, one student changed");

  cards.forEach((card, index) => {
    const cardReveal = index === 0 ? leftReveal : rightReveal;
    const group = sceneLayer
      .append("g")
      .attr("transform", `translate(${card.x}, ${cardY + (1 - cardReveal) * 18})`)
      .attr("opacity", cardReveal);
    const gridColumns = 4;
    const gapX = compact ? 18 : 23;
    const gapY = compact ? 18 : 22;
    const highlightIndex = 6;

    group
      .append("rect")
      .attr("width", cardWidth)
      .attr("height", cardHeight)
      .attr("rx", 26)
      .attr("fill", "rgba(255,255,255,0.92)")
      .attr("stroke", `${card.accent}`)
      .attr("stroke-width", 2);

    group
      .append("text")
      .attr("x", 18)
      .attr("y", 28)
      .attr("fill", "#15253d")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 16 : 18)
      .attr("font-weight", 700)
      .text(card.title);

    group
      .append("text")
      .attr("x", 18)
      .attr("y", 50)
      .attr("fill", "#526277")
      .attr("font-size", compact ? 12 : 13)
      .text(card.note);

    d3.range(12).forEach((index) => {
      const cx = 24 + (index % gridColumns) * gapX;
      const cy = 78 + Math.floor(index / gridColumns) * gapY;

      if (index === highlightIndex && card.mode === "include") {
        group
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", compact ? 6 : 7)
          .attr("fill", "#f2b84b")
          .attr("stroke", "#15253d")
          .attr("stroke-width", 2);
        return;
      }

      if (index === highlightIndex && card.mode === "remove") {
        group
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", compact ? 6 : 7)
          .attr("fill", "rgba(255,255,255,0.76)")
          .attr("stroke", "#f2b84b")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "3 3");
        return;
      }

      if (index % 4 === 0) {
        group
          .append("rect")
          .attr("x", cx - (compact ? 6 : 7))
          .attr("y", cy - (compact ? 6 : 7))
          .attr("width", compact ? 12 : 14)
          .attr("height", compact ? 12 : 14)
          .attr("rx", 4)
          .attr("fill", "#ee8f3b")
          .attr("opacity", 0.92);
      } else {
        group
          .append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", compact ? 5 : 6)
          .attr("fill", "#2c88d9")
          .attr("opacity", 0.92);
      }
    });

    group
      .append("text")
      .attr("x", 18)
      .attr("y", cardHeight - 46)
      .attr("fill", "#148a88")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 13 : 14)
      .attr("font-weight", 700)
      .text("Published result");

    group
      .append("rect")
      .attr("x", 18)
      .attr("y", cardHeight - 32)
      .attr("width", cardWidth - 36)
      .attr("height", compact ? 10 : 12)
      .attr("rx", 999)
      .attr("fill", "rgba(21,37,61,0.08)");

    group
      .append("rect")
      .attr("x", 18)
      .attr("y", cardHeight - 32)
      .attr("width", (cardWidth - 36) * card.share)
      .attr("height", compact ? 10 : 12)
      .attr("rx", 999)
      .attr("fill", card.accent);

    group
      .append("text")
      .attr("x", 18)
      .attr("y", cardHeight - 42)
      .attr("fill", "#15253d")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 18 : 22)
      .attr("font-weight", 700)
      .text(card.label);
  });

  labelLayer
    .append("text")
    .attr("x", width * 0.5)
    .attr("y", cardY + cardHeight * 0.56)
    .attr("text-anchor", "middle")
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 32 : 40)
    .attr("font-weight", 700)
    .attr("fill", "rgba(20,138,136,0.5)")
    .attr("opacity", takeawayReveal)
    .text("≈");

  labelLayer
    .append("foreignObject")
    .attr("x", compact ? width * 0.12 : width * 0.2)
    .attr("y", compact ? height * 0.84 : height * 0.83)
    .attr("width", compact ? width * 0.76 : width * 0.6)
    .attr("height", compact ? 72 : 64)
    .attr("opacity", takeawayReveal)
    .html(
      `<div xmlns="http://www.w3.org/1999/xhtml" style="text-align:center;color:#526277;font:${compact ? "14px" : "16px"} 'Atkinson Hyperlegible', sans-serif;line-height:1.45;">Both releases tell almost the same class story, so Maya is hard to isolate from the published result.</div>`
    );
}

function renderStepExampleScene() {
  const { width, height } = state.renderMetrics;
  const compact = width < 620;
  const style = EXAMPLE_STYLES[state.exampleStyle] || EXAMPLE_STYLES.neutral;
  const centerX = width * 0.54;
  const centerY = height * (compact ? 0.55 : 0.56);
  const scale = compact ? 0.92 : 1.08;
  const muzzleFill = "#f5e4d1";
  const glows = [
    { x: 0.24, y: 0.19, r: compact ? 50 : 72, fill: style.accentSoft },
    { x: 0.76, y: 0.24, r: compact ? 38 : 56, fill: "rgba(129,200,239,0.14)" },
    { x: 0.8, y: 0.76, r: compact ? 42 : 60, fill: "rgba(242,184,75,0.12)" },
  ];

  const appendSpark = ({ x, y, size, fill, delay }) => {
    const glyph = labelLayer
      .append("text")
      .attr("x", width * x)
      .attr("y", height * y)
      .attr("text-anchor", "middle")
      .attr("font-family", "Sora")
      .attr("font-size", size)
      .attr("font-weight", 700)
      .attr("fill", fill)
      .text(style.spark);

    glyph
      .append("animateTransform")
      .attr("attributeName", "transform")
      .attr("type", "translate")
      .attr("dur", "6.8s")
      .attr("begin", `${delay}s`)
      .attr("repeatCount", "indefinite")
      .attr("values", `0 0; 0 -8; 0 0; 0 6; 0 0`);
  };

  const makeSixSevenRelativeMotion = (highLift, lowLift) =>
    `0 0; 0 0; 0 -${highLift}; 0 -${highLift}; 0 0; 0 0; 0 -${lowLift}; 0 -${lowLift}; 0 0; 0 0`;

  const makeSixSevenAbsoluteMotion = (x, y, highLift, lowLift) =>
    `${x} ${y}; ${x} ${y}; ${x} ${y - highLift}; ${x} ${y - highLift}; ${x} ${y}; ${x} ${y}; ${x} ${
      y - lowLift
    }; ${x} ${y - lowLift}; ${x} ${y}; ${x} ${y}`;

  const appendFloatGlyph = ({ x, y, glyph, size, fill, delay, drift = 10, values, dur = "7.4s" }) => {
    const mark = labelLayer
      .append("text")
      .attr("x", width * x)
      .attr("y", height * y)
      .attr("text-anchor", "middle")
      .attr("font-family", '"Sora", sans-serif')
      .attr("font-size", size)
      .attr("font-weight", 700)
      .attr("fill", fill)
      .attr("opacity", 0.9)
      .text(glyph);

    const animationValues =
      values ?? `0 0; 0 -${drift}; 0 0; 0 ${Math.round(drift * 0.55)}; 0 0`;

    mark
      .append("animateTransform")
      .attr("attributeName", "transform")
      .attr("type", "translate")
      .attr("dur", dur)
      .attr("begin", `${delay}s`)
      .attr("repeatCount", "indefinite")
      .attr("values", animationValues);
  };

  const drawWhiskers = () => {
    [
      { y1: 18, y2: 4, x2: 118 },
      { y1: 26, y2: 26, x2: 124 },
      { y1: 34, y2: 48, x2: 118 },
    ].forEach((line) => {
      gerbil
        .append("line")
        .attr("x1", 64)
        .attr("y1", line.y1)
        .attr("x2", line.x2)
        .attr("y2", line.y2)
        .attr("stroke", "#805841")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round");

      gerbil
        .append("line")
        .attr("x1", -64)
        .attr("y1", line.y1)
        .attr("x2", -line.x2)
        .attr("y2", line.y2)
        .attr("stroke", "#805841")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round");
      });
  };

  glows.forEach((glow) => {
    sceneLayer
      .append("circle")
      .attr("cx", width * glow.x)
      .attr("cy", height * glow.y)
      .attr("r", glow.r)
      .attr("fill", glow.fill);
  });

  sceneLayer
    .append("ellipse")
    .attr("cx", centerX)
    .attr("cy", centerY + 128 * scale)
    .attr("rx", 98 * scale)
    .attr("ry", 18 * scale)
    .attr("fill", "rgba(18,35,56,0.1)");

  const gerbilFloat = sceneLayer.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
  gerbilFloat
    .append("animateTransform")
    .attr("attributeName", "transform")
    .attr("type", "translate")
    .attr("dur", compact ? "7.2s" : "8s")
    .attr("repeatCount", "indefinite")
    .attr(
      "values",
      `${centerX} ${centerY}; ${centerX} ${centerY - 14 * scale}; ${centerX} ${centerY}; ${centerX} ${
        centerY + 6 * scale
      }; ${centerX} ${centerY}`
    );

  const gerbilScale = gerbilFloat.append("g").attr("transform", `scale(${scale})`);
  const gerbil = gerbilScale.append("g");
  gerbil
    .append("animateTransform")
    .attr("attributeName", "transform")
    .attr("type", "rotate")
    .attr("dur", compact ? "6.6s" : "7.4s")
    .attr("repeatCount", "indefinite")
    .attr("values", `0 0 0; -3 0 0; 0 0 0; 2 0 0; 0 0 0`);

  [
    { x: -62, y: -78, r: 30 },
    { x: 62, y: -78, r: 30 },
  ].forEach((ear) => {
    gerbil.append("circle").attr("cx", ear.x).attr("cy", ear.y).attr("r", ear.r).attr("fill", style.fur);
    gerbil
      .append("circle")
      .attr("cx", ear.x)
      .attr("cy", ear.y)
      .attr("r", 15)
      .attr("fill", style.ear);
  });

  gerbil
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 92)
    .attr("fill", style.fur);

  gerbil
    .append("ellipse")
    .attr("cx", -26)
    .attr("cy", -24)
    .attr("rx", 42)
    .attr("ry", 28)
    .attr("fill", "rgba(255,255,255,0.12)")
    .attr("transform", "rotate(-18 -26 -24)");

  gerbil
    .append("ellipse")
    .attr("cx", 0)
    .attr("cy", 28)
    .attr("rx", 54)
    .attr("ry", 38)
    .attr("fill", muzzleFill);

  gerbil
    .append("ellipse")
    .attr("cx", -36)
    .attr("cy", 20)
    .attr("rx", 14)
    .attr("ry", 10)
    .attr("fill", style.cheek)
    .attr("opacity", 0.5);

  gerbil
    .append("ellipse")
    .attr("cx", 36)
    .attr("cy", 20)
    .attr("rx", 14)
    .attr("ry", 10)
    .attr("fill", style.cheek)
    .attr("opacity", 0.5);

  gerbil
    .append("circle")
    .attr("cx", -26)
    .attr("cy", -10)
    .attr("r", 8)
    .attr("fill", "#15253d");

  gerbil
    .append("circle")
    .attr("cx", 26)
    .attr("cy", -10)
    .attr("r", 8)
    .attr("fill", "#15253d");

  gerbil
    .append("circle")
    .attr("cx", -24)
    .attr("cy", -12)
    .attr("r", 2.2)
    .attr("fill", "#ffffff");

  gerbil
    .append("circle")
    .attr("cx", 28)
    .attr("cy", -12)
    .attr("r", 2.2)
    .attr("fill", "#ffffff");

  gerbil
    .append("ellipse")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("rx", 10)
    .attr("ry", 7)
    .attr("fill", "#f08c8c");

  gerbil
    .append("path")
    .attr("d", "M -10 38 Q 0 46, 10 38")
    .attr("fill", "none")
    .attr("stroke", "#8b5c46")
    .attr("stroke-width", 3)
    .attr("stroke-linecap", "round");

  drawWhiskers();

  if (style.vibe === "shades") {
    [
      { x: -28, y: -10 },
      { x: 28, y: -10 },
    ].forEach((lens) => {
      gerbil
        .append("circle")
        .attr("cx", lens.x)
        .attr("cy", lens.y - 2)
        .attr("r", 19)
        .attr("fill", "#182b43");

      gerbil
        .append("circle")
        .attr("cx", lens.x - 6)
        .attr("cy", lens.y - 8)
        .attr("r", 5.5)
        .attr("fill", "rgba(255,255,255,0.18)");

      gerbil
        .append("circle")
        .attr("cx", lens.x)
        .attr("cy", lens.y - 2)
        .attr("r", 20.5)
        .attr("fill", "none")
        .attr("stroke", "#101f32")
        .attr("stroke-width", 3.5);
    });

    gerbil
      .append("rect")
      .attr("x", -9)
      .attr("y", -15)
      .attr("width", 18)
      .attr("height", 4)
      .attr("rx", 999)
      .attr("fill", "#2c88d9");

    gerbil
      .append("path")
      .attr("d", "M -50 -24 Q 0 -38, 50 -24")
      .attr("fill", "none")
      .attr("stroke", "#102238")
      .attr("stroke-width", 6)
      .attr("stroke-linecap", "round");

    gerbil
      .append("path")
      .attr("d", "M -46 70 Q 0 92, 46 70")
      .attr("fill", "none")
      .attr("stroke", "#f2b84b")
      .attr("stroke-width", 6)
      .attr("stroke-linecap", "round");

    gerbil
      .append("circle")
      .attr("cx", -26)
      .attr("cy", 78)
      .attr("r", 4)
      .attr("fill", "#f2b84b");

    gerbil
      .append("circle")
      .attr("cx", 26)
      .attr("cy", 78)
      .attr("r", 4)
      .attr("fill", "#f2b84b");

  } else if (style.vibe === "bowtie") {
    glows.forEach((glow, index) => {
      const glyphSize = Math.max(24, Math.round(glow.r * (compact ? 0.62 : 0.7)));
      const offsetX = compact ? 0.026 : 0.024;
      const offsetY = compact ? 0.01 : 0.008;
      const baseDelay = index * 0.32;
      const drift = compact ? 16 : 18;
      const values = makeSixSevenRelativeMotion(drift, Math.round(drift * 0.66));

      appendFloatGlyph({
        x: glow.x - offsetX,
        y: glow.y + offsetY,
        glyph: "6",
        size: glyphSize,
        fill: index === 0 ? "rgba(255,111,97,0.76)" : index === 1 ? "rgba(129,200,239,0.9)" : "rgba(242,184,75,0.86)",
        delay: 0.15 + baseDelay,
        dur: "1.18s",
        values,
      });
      appendFloatGlyph({
        x: glow.x + offsetX,
        y: glow.y + offsetY,
        glyph: "7",
        size: glyphSize,
        fill: index === 0 ? "rgba(255,111,97,0.9)" : index === 1 ? "rgba(129,200,239,0.72)" : "rgba(242,184,75,0.96)",
        delay: 0.32 + baseDelay,
        dur: "1.18s",
        values,
      });
    });

    gerbil
      .append("path")
      .attr("d", "M -52 70 L -18 92 L -52 104 Z")
      .attr("fill", style.accent);

    gerbil
      .append("path")
      .attr("d", "M 52 70 L 18 92 L 52 104 Z")
      .attr("fill", style.accent);

    gerbil
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 90)
      .attr("r", 10)
      .attr("fill", "#fff6f5");

    [
      { x: centerX - 48 * scale, y: centerY + 156 * scale, phase: "0s" },
      { x: centerX + 48 * scale, y: centerY + 156 * scale, phase: "0.24s" },
    ].forEach((paw) => {
      const pawGroup = sceneLayer.append("g").attr("transform", `translate(${paw.x}, ${paw.y})`);

      pawGroup
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "translate")
        .attr("dur", "1.02s")
        .attr("begin", paw.phase)
        .attr("repeatCount", "indefinite")
        .attr("values", makeSixSevenAbsoluteMotion(paw.x, paw.y, 26, 18));

      pawGroup
        .append("ellipse")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("rx", 27 * scale)
        .attr("ry", 21 * scale)
        .attr("fill", style.fur);

      [-11, 0, 11].forEach((toeX) => {
        pawGroup
          .append("line")
          .attr("x1", toeX * scale)
          .attr("y1", -17 * scale)
          .attr("x2", toeX * scale)
          .attr("y2", -7 * scale)
          .attr("stroke", "#805841")
          .attr("stroke-width", 3.4 * scale)
          .attr("stroke-linecap", "round");
      });
    });
  } else if (style.vibe === "glasses") {
    [-26, 26].forEach((x) => {
      gerbil
        .append("circle")
        .attr("cx", x)
        .attr("cy", -10)
        .attr("r", 20)
        .attr("fill", "none")
        .attr("stroke", "#344152")
        .attr("stroke-width", 3.5);
    });

    gerbil
      .append("line")
      .attr("x1", -6)
      .attr("y1", -10)
      .attr("x2", 6)
      .attr("y2", -10)
      .attr("stroke", "#344152")
      .attr("stroke-width", 3);
  }

  if (style.spark) {
    [
      { x: 0.2, y: 0.2, size: compact ? 26 : 34, fill: style.accent, delay: 0.1 },
      { x: 0.78, y: 0.28, size: compact ? 18 : 24, fill: "rgba(20,138,136,0.44)", delay: 0.5 },
      { x: 0.7, y: 0.82, size: compact ? 22 : 28, fill: "rgba(242,184,75,0.5)", delay: 0.9 },
    ].forEach(appendSpark);
  }
}

function renderStepExampleVotingScene() {
  const { width, height } = state.renderMetrics;
  const compact = width < 620;
  const faceScale = compact ? 0.72 : 0.88;
  const items = compact
    ? [
        {
          styleId: "rizz",
          x: width * 0.32,
          y: height * 0.34,
          rainEmojis: ["😍", "❤️", "✨"],
          glow: "rgba(242,184,75,0.18)",
        },
        {
          styleId: "skibidi",
          x: width * 0.7,
          y: height * 0.35,
          rainEmojis: ["👍", "🔥", "👏"],
          glow: "rgba(20,138,136,0.16)",
        },
        {
          styleId: "carl",
          x: width * 0.51,
          y: height * 0.73,
          rainEmojis: ["👎", "😒", "🙅"],
          glow: "rgba(255,111,97,0.14)",
        },
      ]
    : [
        {
          styleId: "rizz",
          x: width * 0.22,
          y: height * 0.53,
          rainEmojis: ["😍", "❤️", "✨"],
          glow: "rgba(242,184,75,0.18)",
        },
        {
          styleId: "skibidi",
          x: width * 0.5,
          y: height * 0.46,
          rainEmojis: ["👍", "🔥", "👏"],
          glow: "rgba(20,138,136,0.16)",
        },
        {
          styleId: "carl",
          x: width * 0.78,
          y: height * 0.55,
          rainEmojis: ["👎", "😒", "🙅"],
          glow: "rgba(255,111,97,0.14)",
        },
      ];

  const drawVotingGerbil = ({ styleId, x, y, rainEmojis, glow }) => {
    const style = EXAMPLE_STYLES[styleId];
    const shadowY = y + 78 * faceScale;

    sceneLayer
      .append("circle")
      .attr("cx", x)
      .attr("cy", y - 8 * faceScale)
      .attr("r", compact ? 88 : 112)
      .attr("fill", glow);

    sceneLayer
      .append("ellipse")
      .attr("cx", x)
      .attr("cy", shadowY)
      .attr("rx", 54 * faceScale)
      .attr("ry", 12 * faceScale)
      .attr("fill", "rgba(18,35,56,0.08)");

    const floatGroup = sceneLayer.append("g").attr("transform", `translate(${x}, ${y})`);
    floatGroup
      .append("animateTransform")
      .attr("attributeName", "transform")
      .attr("type", "translate")
      .attr("dur", "7.1s")
      .attr("begin", `${x / Math.max(width, 1)}s`)
      .attr("repeatCount", "indefinite")
      .attr("values", `${x} ${y}; ${x} ${y - 10}; ${x} ${y}; ${x} ${y + 4}; ${x} ${y}`);

    [
      { x: -38, y: -44, r: 16 },
      { x: 38, y: -44, r: 16 },
    ].forEach((ear) => {
      floatGroup
        .append("circle")
        .attr("cx", ear.x * faceScale)
        .attr("cy", ear.y * faceScale)
        .attr("r", ear.r * faceScale)
        .attr("fill", style.fur);

      floatGroup
        .append("circle")
        .attr("cx", ear.x * faceScale)
        .attr("cy", ear.y * faceScale)
        .attr("r", 8 * faceScale)
        .attr("fill", style.ear);
    });

    floatGroup
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 52 * faceScale)
      .attr("fill", style.fur);

    floatGroup
      .append("ellipse")
      .attr("cx", -14 * faceScale)
      .attr("cy", -18 * faceScale)
      .attr("rx", 24 * faceScale)
      .attr("ry", 14 * faceScale)
      .attr("fill", "rgba(255,255,255,0.12)")
      .attr("transform", `rotate(-18 ${-14 * faceScale} ${-18 * faceScale})`);

    floatGroup
      .append("ellipse")
      .attr("cx", 0)
      .attr("cy", 14 * faceScale)
      .attr("rx", 30 * faceScale)
      .attr("ry", 20 * faceScale)
      .attr("fill", "#f5e4d1");

    [-20, 20].forEach((xOffset) => {
      floatGroup
        .append("ellipse")
        .attr("cx", xOffset * faceScale)
        .attr("cy", 10 * faceScale)
        .attr("rx", 8 * faceScale)
        .attr("ry", 6 * faceScale)
        .attr("fill", style.cheek)
        .attr("opacity", 0.5);
    });

    [-15, 15].forEach((xOffset) => {
      floatGroup
        .append("circle")
        .attr("cx", xOffset * faceScale)
        .attr("cy", -6 * faceScale)
        .attr("r", 4.8 * faceScale)
        .attr("fill", "#15253d");

      floatGroup
        .append("circle")
        .attr("cx", (xOffset + (xOffset < 0 ? 1.5 : 2)) * faceScale)
        .attr("cy", -7.5 * faceScale)
        .attr("r", 1.3 * faceScale)
        .attr("fill", "#ffffff");
    });

    floatGroup
      .append("ellipse")
      .attr("cx", 0)
      .attr("cy", 10 * faceScale)
      .attr("rx", 6 * faceScale)
      .attr("ry", 4.2 * faceScale)
      .attr("fill", "#f08c8c");

    floatGroup
      .append("path")
      .attr("d", `M ${-7 * faceScale} ${22 * faceScale} Q 0 ${28 * faceScale}, ${7 * faceScale} ${22 * faceScale}`)
      .attr("fill", "none")
      .attr("stroke", "#8b5c46")
      .attr("stroke-width", 2.2 * faceScale)
      .attr("stroke-linecap", "round");

    [
      { y1: 10, y2: 2, x2: 66 },
      { y1: 16, y2: 16, x2: 70 },
      { y1: 22, y2: 30, x2: 66 },
    ].forEach((line) => {
      floatGroup
        .append("line")
        .attr("x1", 34 * faceScale)
        .attr("y1", line.y1 * faceScale)
        .attr("x2", line.x2 * faceScale)
        .attr("y2", line.y2 * faceScale)
        .attr("stroke", "#805841")
        .attr("stroke-width", 2.1 * faceScale)
        .attr("stroke-linecap", "round");

      floatGroup
        .append("line")
        .attr("x1", -34 * faceScale)
        .attr("y1", line.y1 * faceScale)
        .attr("x2", -line.x2 * faceScale)
        .attr("y2", line.y2 * faceScale)
        .attr("stroke", "#805841")
        .attr("stroke-width", 2.1 * faceScale)
        .attr("stroke-linecap", "round");
    });

    if (style.vibe === "shades") {
      [-16, 16].forEach((xOffset) => {
        floatGroup
          .append("circle")
          .attr("cx", xOffset * faceScale)
          .attr("cy", -7 * faceScale)
          .attr("r", 12.5 * faceScale)
          .attr("fill", "#182b43");

        floatGroup
          .append("circle")
          .attr("cx", (xOffset - 4) * faceScale)
          .attr("cy", -11 * faceScale)
          .attr("r", 3.2 * faceScale)
          .attr("fill", "rgba(255,255,255,0.18)");

        floatGroup
          .append("circle")
          .attr("cx", xOffset * faceScale)
          .attr("cy", -7 * faceScale)
          .attr("r", 13.8 * faceScale)
          .attr("fill", "none")
          .attr("stroke", "#101f32")
          .attr("stroke-width", 2.4 * faceScale);
      });

      floatGroup
        .append("rect")
        .attr("x", -6.5 * faceScale)
        .attr("y", -10 * faceScale)
        .attr("width", 13 * faceScale)
        .attr("height", 3.2 * faceScale)
        .attr("rx", 999)
        .attr("fill", "#2c88d9");
    } else if (style.vibe === "bowtie") {
      floatGroup
        .append("path")
        .attr(
          "d",
          `M ${-30 * faceScale} ${39 * faceScale} L ${-10 * faceScale} ${52 * faceScale} L ${-30 * faceScale} ${
            62 * faceScale
          } Z`
        )
        .attr("fill", style.accent);

      floatGroup
        .append("path")
        .attr(
          "d",
          `M ${30 * faceScale} ${39 * faceScale} L ${10 * faceScale} ${52 * faceScale} L ${30 * faceScale} ${
            62 * faceScale
          } Z`
        )
        .attr("fill", style.accent);

      floatGroup
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 51 * faceScale)
        .attr("r", 6 * faceScale)
        .attr("fill", "#fff6f5");
    } else if (style.vibe === "glasses") {
      [-16, 16].forEach((xOffset) => {
        floatGroup
          .append("circle")
          .attr("cx", xOffset * faceScale)
          .attr("cy", -6 * faceScale)
          .attr("r", 13 * faceScale)
          .attr("fill", "none")
          .attr("stroke", "#344152")
          .attr("stroke-width", 2.4 * faceScale);
      });

      floatGroup
        .append("line")
        .attr("x1", -4 * faceScale)
        .attr("y1", -6 * faceScale)
        .attr("x2", 4 * faceScale)
        .attr("y2", -6 * faceScale)
        .attr("stroke", "#344152")
        .attr("stroke-width", 2.2 * faceScale);
    }

    const labelY = y + 118 * faceScale;

    labelLayer
      .append("text")
      .attr("x", x)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 16 : 18)
      .attr("font-weight", 700)
      .attr("fill", "#15253d")
      .text(style.label);

    const rainConfig = compact
      ? [
          { xOffset: -18, yOffset: 24, delay: 0.08 },
          { xOffset: 0, yOffset: 34, delay: 0.42 },
          { xOffset: 18, yOffset: 28, delay: 0.72 },
        ]
      : [
          { xOffset: -22, yOffset: 24, delay: 0.08 },
          { xOffset: 0, yOffset: 36, delay: 0.42 },
          { xOffset: 22, yOffset: 28, delay: 0.72 },
        ];

    rainConfig.forEach(({ xOffset, yOffset, delay }, index) => {
      const rainEmojiGlyph = rainEmojis[index % rainEmojis.length];
      const rainEmoji = labelLayer
        .append("text")
        .attr("x", x + xOffset)
        .attr("y", labelY + yOffset)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", (compact ? 19 : 23) * faceScale)
        .text(rainEmojiGlyph);

      rainEmoji
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "translate")
        .attr("dur", "1.75s")
        .attr("begin", `${delay + x / Math.max(width * 4.8, 1)}s`)
        .attr("repeatCount", "indefinite")
        .attr("values", `0 -8; 0 -8; 0 18; 0 44; 0 72; 0 72`);

      rainEmoji
        .append("animate")
        .attr("attributeName", "opacity")
        .attr("dur", "1.75s")
        .attr("begin", `${delay + x / Math.max(width * 4.8, 1)}s`)
        .attr("repeatCount", "indefinite")
        .attr("values", "0; 1; 1; 0.9; 0; 0");
    });
  };

  items.forEach(drawVotingGerbil);
}

function renderStepExampleResultsScene() {
  const { width, height } = state.renderMetrics;
  const compact = width < 620;
  const animation = state.exampleVoteResults || (state.exampleVoteResults = createExampleVoteResultsAnimation());
  const voteCounts = getExampleVoteResultCounts(animation.elapsed, animation.drops);
  const maxVotes = Math.max(...Object.values(EXAMPLE_VOTE_RESULTS));
  const baseline = height * (compact ? 0.79 : 0.82);
  const chartTop = height * (compact ? 0.18 : 0.14);
  const maxBarHeight = compact ? height * 0.34 : height * 0.52;
  const barWidth = compact ? Math.min(width * 0.2, 82) : Math.min(width * 0.17, 116);
  const labelGap = compact ? 17 : 20;
  const categories = [
    { styleId: "skibidi", labelLines: ["Rizz", "Rodent"], total: EXAMPLE_VOTE_RESULTS.skibidi, x: width * (compact ? 0.22 : 0.22) },
    { styleId: "rizz", labelLines: ["6-7", "Squeaker"], total: EXAMPLE_VOTE_RESULTS.rizz, x: width * 0.5 },
    { styleId: "carl", labelLines: ["Carl"], total: EXAMPLE_VOTE_RESULTS.carl, x: width * (compact ? 0.78 : 0.78) },
  ];
  const categoryByStyle = Object.fromEntries(categories.map((category) => [category.styleId, category]));

  sceneLayer
    .append("line")
    .attr("x1", width * 0.1)
    .attr("y1", baseline)
    .attr("x2", width * 0.9)
    .attr("y2", baseline)
    .attr("stroke", "rgba(18,35,56,0.18)")
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round");

  categories.forEach((category) => {
    const style = EXAMPLE_STYLES[category.styleId];
    const currentVotes = voteCounts[category.styleId];
    const barHeight = (currentVotes / maxVotes) * maxBarHeight;
    const barX = category.x - barWidth / 2;
    const countY = baseline - Math.max(barHeight, 14) - (compact ? 18 : 22);

    sceneLayer
      .append("rect")
      .attr("x", barX)
      .attr("y", baseline - barHeight)
      .attr("width", barWidth)
      .attr("height", barHeight)
      .attr("fill", style.accent)
      .attr("opacity", 0.9);

    labelLayer
      .append("text")
      .attr("x", category.x)
      .attr("y", countY)
      .attr("text-anchor", "middle")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 24 : 30)
      .attr("font-weight", 700)
      .attr("fill", "#15253d")
      .text(String(currentVotes));

    category.labelLines.forEach((line, index) => {
      labelLayer
        .append("text")
        .attr("x", category.x)
        .attr("y", baseline + 28 + index * labelGap)
        .attr("text-anchor", "middle")
        .attr("font-family", "Sora")
        .attr("font-size", compact ? 14 : 16)
        .attr("font-weight", 700)
        .attr("fill", "#15253d")
        .text(line);
    });
  });

  animation.drops.forEach((drop) => {
    const localTime = animation.elapsed - drop.startAt;

    if (localTime < 0 || localTime > drop.duration) {
      return;
    }

    const category = categoryByStyle[drop.styleId];
    const progress = clamp(localTime / drop.duration, 0, 1);
    const eased = easeInOut(progress);
    const startX = width * drop.spawnXRatio;
    const startY = chartTop - 48;
    const controlX = width * clamp(drop.spawnXRatio + drop.swayRatio, 0.08, 0.92);
    const controlY = height * (compact ? 0.34 : 0.3);
    const targetX = category.x + drop.targetJitterRatio * barWidth;
    const targetY = baseline - (drop.ordinal / category.total) * maxBarHeight + 8;
    const coinX = quadraticBezier(startX, controlX, targetX, eased);
    const coinY = quadraticBezier(startY, controlY, targetY, eased);
    const coinOpacity = progress > 0.9 ? 1 - (progress - 0.9) / 0.1 : 1;
    const coinRadius = (compact ? 9 : 11) * drop.size;
    const tilt = drop.tilt * (1 - progress * 0.4);
    const coinFill = drop.tone === "blue" ? "#81c8ef" : "#f2b84b";
    const coinStroke = drop.tone === "blue" ? "#3f8fbe" : "#d5962d";

    const coinGroup = sceneLayer
      .append("g")
      .attr("transform", `translate(${coinX}, ${coinY}) rotate(${tilt})`)
      .attr("opacity", coinOpacity);

    coinGroup
      .append("circle")
      .attr("r", coinRadius)
      .attr("fill", coinFill)
      .attr("stroke", coinStroke)
      .attr("stroke-width", 2);

    coinGroup
      .append("circle")
      .attr("r", coinRadius * 0.66)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.45)")
      .attr("stroke-width", 1.6);
  });
}

function renderStepExamplePrivacyScene() {
  const { width, height } = state.renderMetrics;
  const compact = width < 720;
  const studentEmojis = getExamplePrivacyStudents();
  const animation =
    state.examplePrivacyAnimation && state.examplePrivacyAnimation.rows.length === studentEmojis.length
      ? state.examplePrivacyAnimation
      : (state.examplePrivacyAnimation = createExamplePrivacyAnimation());
  const rowStart = height * (compact ? 0.06 : 0.04);
  const rowEnd = height * (compact ? 0.89 : 0.92);
  const rows = studentEmojis.map((emoji, index) => ({
    emoji,
    y:
      studentEmojis.length === 1
        ? (rowStart + rowEnd) / 2
        : rowStart + ((rowEnd - rowStart) * index) / (studentEmojis.length - 1),
  }));
  const subjectX = width * (compact ? 0.13 : 0.12);
  const resultX = width * (compact ? 0.32 : 0.33);
  const arrowStartX = resultX + (compact ? 24 : 28);
  const barrierX = width * (compact ? 0.47 : 0.48);
  const aggregatorX = width * (compact ? 0.68 : 0.69);
  const aggregatorY = height * (compact ? 0.5 : 0.52);
  const chartX = width * (compact ? 0.87 : 0.89);
  const chartBaseline = height * (compact ? 0.64 : 0.62);
  const barWidth = compact ? 16 : 18;
  const barGap = compact ? 8 : 10;
  const chartHeights = [52, 68, 16];

  const drawArrowHead = (x, y, angleDegrees, size = 12, fill = "#575757") => {
    sceneLayer
      .append("path")
      .attr(
        "d",
        `M ${-size} ${-size * 0.6} L 0 0 L ${-size} ${size * 0.6}`
      )
      .attr("transform", `translate(${x}, ${y}) rotate(${angleDegrees})`)
      .attr("fill", "none")
      .attr("stroke", fill)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
  };

  const drawPrivacyCoin = (x, y, side, label, opacity = 1, scale = 1) => {
    const rx = (compact ? 8 : 9) * scale;
    const ry = (compact ? 18 : 20) * scale;
    const fill = side === "tails" ? "#81c8ef" : "#f2b84b";
    const stroke = side === "tails" ? "#3f8fbe" : "#d5962d";
    const textFill = side === "tails" ? "#ffffff" : "#173042";

    const group = sceneLayer
      .append("g")
      .attr("transform", `translate(${x}, ${y}) rotate(-36)`)
      .attr("opacity", opacity);

    group
      .append("ellipse")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("rx", rx)
      .attr("ry", ry)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("stroke-width", 1.8);

    group
      .append("ellipse")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("rx", rx - 2)
      .attr("ry", ry - 3)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.34)")
      .attr("stroke-width", 1.4);

    group
      .append("ellipse")
      .attr("cx", -1.5)
      .attr("cy", -4)
      .attr("rx", Math.max(rx - 4, 1))
      .attr("ry", Math.max(ry - 6, 1))
      .attr("fill", "rgba(255,255,255,0.24)");

    group
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("transform", "rotate(36)")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 8 : 9)
      .attr("font-weight", 700)
      .attr("fill", textFill)
      .text(label);
  };

  rows.forEach((row, index) => {
    labelLayer
      .append("text")
      .attr("x", subjectX)
      .attr("y", row.y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", compact ? 56 : 66)
      .text(row.emoji);

    const rowAnimation = animation.rows[index];
    const stackSpacing = compact ? 18 : 21;
    const stackLift = (rowAnimation.coins.length - 1) * stackSpacing * 0.5;

    rowAnimation.coins.forEach((coin, coinIndex) => {
      const stackY = row.y - stackLift + coinIndex * stackSpacing;
      const stackX = resultX + coinIndex * (compact ? 6 : 8);
      const elapsed = animation.elapsed - coin.startAt;

      if (elapsed < 0) {
        return;
      }

      if (elapsed >= coin.duration) {
        drawPrivacyCoin(stackX, stackY, coin.side, coin.label);
        return;
      }

      const t = easeInOut(clamp(elapsed / coin.duration, 0, 1));
      const startX = subjectX + (compact ? 30 : 34);
      const startY = row.y - (compact ? 10 : 12);
      const controlX = startX + (stackX - startX) * 0.58 + coin.drift * 0.25;
      const controlY = row.y - coin.arcLift;
      const coinX = quadraticBezier(startX, controlX, stackX, t);
      const coinY = quadraticBezier(startY, controlY, stackY, t);
      const opacity = t > 0.92 ? 1 - (t - 0.92) / 0.08 : 1;

      drawPrivacyCoin(coinX, coinY, coin.side, coin.label, opacity, 1);
    });
  });

  sceneLayer
    .append("line")
    .attr("x1", barrierX)
    .attr("y1", rows[0].y - 26)
    .attr("x2", barrierX)
    .attr("y2", rows[rows.length - 1].y + 26)
    .attr("stroke", "#4b6070")
    .attr("stroke-width", 1.6)
    .attr("stroke-dasharray", "4 6");

  rows.forEach((row, index) => {
    const endY = aggregatorY + (index - 2) * (compact ? 14 : 10);
    const endX = aggregatorX - (compact ? 60 : 72);
    const path = `M ${arrowStartX} ${row.y} L ${endX} ${endY}`;

    drawFlowArrow(path, "#585858");
    drawArrowHead(endX, endY, Math.atan2(endY - row.y, endX - arrowStartX) * (180 / Math.PI), compact ? 9 : 10, "#585858");
  });

  labelLayer
    .append("text")
    .attr("x", aggregatorX)
    .attr("y", aggregatorY + 4)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("font-size", compact ? 44 : 54)
    .text("🧑🏻‍🏫");

  drawFlowArrow(`M ${aggregatorX + 66} ${aggregatorY} L ${chartX - 54} ${aggregatorY}`, "#585858");
  drawArrowHead(chartX - 54, aggregatorY, 0, compact ? 9 : 10, "#585858");

  const chartLeft = chartX - ((barWidth * 3 + barGap * 2) / 2);
  [
    { height: chartHeights[0], fill: EXAMPLE_STYLES.skibidi.accent },
    { height: chartHeights[1], fill: EXAMPLE_STYLES.rizz.accent },
    { height: chartHeights[2], fill: EXAMPLE_STYLES.carl.accent },
  ].forEach((bar, index) => {
    sceneLayer
      .append("rect")
      .attr("x", chartLeft + index * (barWidth + barGap))
      .attr("y", chartBaseline - bar.height)
      .attr("width", barWidth)
      .attr("height", bar.height)
      .attr("fill", bar.fill)
      .attr("opacity", 0.92);
  });

  labelLayer
    .append("text")
    .attr("x", subjectX)
    .attr("y", rows[rows.length - 1].y + (compact ? 42 : 48))
    .attr("text-anchor", "middle")
    .attr("font-family", "Atkinson Hyperlegible")
    .attr("font-size", compact ? 15 : 17)
    .attr("fill", "#15253d")
    .text("Students");

  labelLayer
    .append("text")
    .attr("x", barrierX)
    .attr("y", rows[rows.length - 1].y + 80)
    .attr("text-anchor", "middle")
    .attr("font-family", "Atkinson Hyperlegible")
    .attr("font-size", compact ? 15 : 17)
    .attr("fill", "#15253d")
    .text("Local Differential Privacy Barrier");

  labelLayer
    .append("text")
    .attr("x", aggregatorX)
    .attr("y", aggregatorY + 56)
    .attr("text-anchor", "middle")
    .attr("font-family", "Atkinson Hyperlegible")
    .attr("font-size", compact ? 15 : 17)
    .attr("fill", "#15253d")
    .text("Teacher");
}

function renderStepExampleFlowScene() {
  const { width, height } = state.renderMetrics;
  const compact = width < 720;
  const stroke = "#585858";
  const nodeFill = "rgba(255,255,255,0.9)";
  const nodeStroke = "rgba(21,37,61,0.16)";
  const softFill = "rgba(255,248,238,0.86)";
  const reportClusterOffsetY = height * (compact ? 0.05 : 0.045);
  const start = { x: width * (compact ? 0.14 : 0.13), y: height * 0.22 };
  const coin1 = { x: width * (compact ? 0.34 : 0.31), y: height * 0.22 };
  const truth = { x: width * (compact ? 0.6 : 0.58), y: height * (compact ? 0.14 : 0.17) };
  const extraCoins = { x: width * (compact ? 0.34 : 0.31), y: height * (compact ? 0.62 : 0.64) };
  const rizz = { x: width * (compact ? 0.68 : 0.68), y: height * 0.39 + reportClusterOffsetY };
  const squeaker = { x: width * (compact ? 0.68 : 0.68), y: height * 0.57 + reportClusterOffsetY };
  const carl = { x: width * (compact ? 0.68 : 0.68), y: height * 0.75 + reportClusterOffsetY };
  const pillWidth = compact ? 80 : 94;
  const pillHeight = compact ? 36 : 42;
  const boxWidth = compact ? 138 : 164;
  const boxHeight = compact ? 56 : 64;
  const diamondWidth = compact ? 94 : 108;
  const diamondHeight = compact ? 58 : 66;
  const tagHeight = compact ? 22 : 24;
  const reportAccentWidth = compact ? 10 : 12;

  const drawArrowHead = (x, y, angleDegrees, size = 10, fill = stroke) => {
    sceneLayer
      .append("path")
      .attr("d", `M ${-size} ${-size * 0.6} L 0 0 L ${-size} ${size * 0.6}`)
      .attr("transform", `translate(${x}, ${y}) rotate(${angleDegrees})`)
      .attr("fill", "none")
      .attr("stroke", fill)
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
  };

  const drawNodeText = (x, y, lines, size = compact ? 12 : 13) => {
    const text = labelLayer
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-family", "Sora")
      .attr("font-size", size)
      .attr("font-weight", 700)
      .attr("fill", "#15253d");

    lines.forEach((line, index) => {
      text
        .append("tspan")
        .attr("x", x)
        .attr("dy", index === 0 ? `${-(lines.length - 1) * 0.55}em` : "1.1em")
        .text(line);
    });
  };

  const drawTag = (x, y, text, fill = "rgba(255,255,255,0.9)", textFill = "#526277") => {
    const tagWidth = Math.max((compact ? 28 : 32) + text.length * (compact ? 6 : 7), compact ? 46 : 52);
    sceneLayer
      .append("rect")
      .attr("x", x - tagWidth * 0.5)
      .attr("y", y - tagHeight * 0.5)
      .attr("width", tagWidth)
      .attr("height", tagHeight)
      .attr("rx", tagHeight * 0.5)
      .attr("fill", fill)
      .attr("stroke", "rgba(21,37,61,0.08)");

    labelLayer
      .append("text")
      .attr("x", x)
      .attr("y", y + 0.5)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 11 : 12)
      .attr("font-weight", 700)
      .attr("fill", textFill)
      .text(text);
  };

  const drawPill = (center, label) => {
    sceneLayer
      .append("rect")
      .attr("x", center.x - pillWidth * 0.5)
      .attr("y", center.y - pillHeight * 0.5)
      .attr("width", pillWidth)
      .attr("height", pillHeight)
      .attr("rx", pillHeight * 0.5)
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 2);
    sceneLayer
      .append("circle")
      .attr("cx", center.x - pillWidth * 0.28)
      .attr("cy", center.y)
      .attr("r", compact ? 4.5 : 5)
      .attr("fill", "#148a88");
    drawNodeText(center.x, center.y + 1, [label], compact ? 13 : 14);
  };

  const drawBox = (center, lines, accent = "#d9e7f4", options = {}) => {
    const { tone = nodeFill, align = "center" } = options;
    sceneLayer
      .append("rect")
      .attr("x", center.x - boxWidth * 0.5)
      .attr("y", center.y - boxHeight * 0.5)
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("rx", 16)
      .attr("fill", tone)
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 2);
    sceneLayer
      .append("rect")
      .attr("x", center.x - boxWidth * 0.5)
      .attr("y", center.y - boxHeight * 0.5)
      .attr("width", reportAccentWidth)
      .attr("height", boxHeight)
      .attr("fill", accent)
      .attr("opacity", 0.9);
    if (align === "left") {
      const text = labelLayer
        .append("text")
        .attr("x", center.x - boxWidth * 0.5 + reportAccentWidth + (compact ? 14 : 16))
        .attr("y", center.y)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .attr("font-family", "Sora")
        .attr("font-size", compact ? 12 : 13)
        .attr("font-weight", 700)
        .attr("fill", "#15253d");

      lines.forEach((line, index) => {
        text
          .append("tspan")
          .attr("x", center.x - boxWidth * 0.5 + reportAccentWidth + (compact ? 14 : 16))
          .attr("dy", index === 0 ? `${-(lines.length - 1) * 0.55}em` : "1.1em")
          .text(line);
      });
      return;
    }

    drawNodeText(center.x + 4, center.y, lines);
  };

  const drawDiamond = (center, lines, accent = "#f2b84b") => {
    sceneLayer
      .append("path")
      .attr(
        "d",
        `M ${center.x} ${center.y - diamondHeight * 0.5}
         L ${center.x + diamondWidth * 0.5} ${center.y}
         L ${center.x} ${center.y + diamondHeight * 0.5}
         L ${center.x - diamondWidth * 0.5} ${center.y} Z`
      )
      .attr("fill", softFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-width", 2);
    sceneLayer
      .append("ellipse")
      .attr("cx", center.x)
      .attr("cy", center.y - (compact ? 16 : 18))
      .attr("rx", compact ? 10 : 12)
      .attr("ry", compact ? 16 : 18)
      .attr("fill", accent)
      .attr("stroke", d3.color(accent)?.darker(0.4)?.formatHex() || accent)
      .attr("stroke-width", 1.6)
      .attr("transform", `rotate(-24 ${center.x} ${center.y - (compact ? 16 : 18)})`);
    drawNodeText(center.x, center.y, lines, compact ? 11.5 : 12.5);
  };

  sceneLayer
    .append("circle")
    .attr("cx", truth.x + (compact ? 14 : 20))
    .attr("cy", truth.y - (compact ? 24 : 28))
    .attr("r", compact ? 52 : 66)
    .attr("fill", "rgba(129,200,239,0.16)");

  sceneLayer
    .append("circle")
    .attr("cx", rizz.x + (compact ? 10 : 16))
    .attr("cy", squeaker.y)
    .attr("r", compact ? 118 : 138)
    .attr("fill", "rgba(242,184,75,0.12)");

  drawTag(truth.x, truth.y - (compact ? 58 : 66), "Truth path", "rgba(129,200,239,0.18)", "#2b6b93");
  drawTag(rizz.x, rizz.y - (compact ? 38 : 42), "Randomized reports", "rgba(242,184,75,0.18)", "#8d6121");

  drawPill(start, "Start");
  drawDiamond(coin1, ["Coin 1"], "#f2b84b");
  drawBox(truth, ["Answer", "truthfully"], "#81c8ef", {
    tone: "rgba(244,250,255,0.92)",
  });
  drawDiamond(extraCoins, ["Coin 2", "& Coin 3"], "#81c8ef");
  drawBox(rizz, ["Report", "Rizz Rodent"], EXAMPLE_STYLES.skibidi.accent, {
    tone: "rgba(255,255,255,0.92)",
    align: "left",
  });
  drawBox(squeaker, ["Report", "6-7 Squeaker"], EXAMPLE_STYLES.rizz.accent, {
    tone: "rgba(255,255,255,0.92)",
    align: "left",
  });
  drawBox(carl, ["Report", "Carl"], EXAMPLE_STYLES.carl.accent, {
    tone: "rgba(255,255,255,0.92)",
    align: "left",
  });

  drawFlowArrow(
    `M ${start.x + pillWidth * 0.5} ${start.y}
     C ${start.x + pillWidth * 0.9} ${start.y}, ${coin1.x - diamondWidth * 0.85} ${coin1.y}, ${coin1.x - diamondWidth * 0.5} ${coin1.y}`,
    stroke
  );
  drawArrowHead(coin1.x - diamondWidth * 0.5, coin1.y, 0, compact ? 8 : 9, stroke);

  drawFlowArrow(
    `M ${coin1.x + diamondWidth * 0.34} ${coin1.y - diamondHeight * 0.1}
     C ${coin1.x + diamondWidth * 0.82} ${coin1.y - diamondHeight * 0.8},
       ${truth.x - boxWidth * 0.85} ${truth.y},
       ${truth.x - boxWidth * 0.5} ${truth.y}`,
    stroke
  );
  drawArrowHead(truth.x - boxWidth * 0.5, truth.y, 0, compact ? 8 : 9, stroke);
  drawTag((coin1.x + truth.x) * 0.5, truth.y - (compact ? 28 : 34), "Heads");

  drawFlowArrow(
    `M ${coin1.x} ${coin1.y + diamondHeight * 0.5}
     C ${coin1.x} ${coin1.y + diamondHeight * 0.95},
       ${extraCoins.x} ${extraCoins.y - diamondHeight * 0.95},
       ${extraCoins.x} ${extraCoins.y - diamondHeight * 0.5}`,
    stroke
  );
  drawArrowHead(extraCoins.x, extraCoins.y - diamondHeight * 0.5, 90, compact ? 8 : 9, stroke);
  drawTag(coin1.x + (compact ? 42 : 50), (coin1.y + extraCoins.y) * 0.5, "Tails");

  [
    { label: "HH", node: rizz, angle: -18, curveY: rizz.y - boxHeight * 0.9 },
    { label: "HT", node: squeaker, angle: 0, curveY: squeaker.y },
    { label: "TH", node: carl, angle: 18, curveY: carl.y + boxHeight * 0.9 },
  ].forEach((target) => {
    const endX = target.node.x - boxWidth * 0.5;
    const endY = target.node.y;
    drawFlowArrow(
      `M ${extraCoins.x + diamondWidth * 0.48} ${extraCoins.y}
       C ${extraCoins.x + diamondWidth * 0.94} ${target.curveY},
         ${endX - (compact ? 34 : 40)} ${target.curveY},
         ${endX} ${endY}`,
      stroke
    );
    drawArrowHead(
      endX,
      endY,
      Math.atan2(endY - extraCoins.y, endX - (extraCoins.x + diamondWidth * 0.48)) * (180 / Math.PI),
      compact ? 8 : 9,
      stroke
    );
    drawTag((extraCoins.x + endX) * 0.5, (extraCoins.y + endY) * 0.5 - (compact ? 8 : 12), target.label);
  });

  const loopStartX = extraCoins.x + diamondWidth * 0.32;
  const loopStartY = extraCoins.y + diamondHeight * 0.16;
  const loopEndX = extraCoins.x - diamondWidth * 0.22;
  const loopEndY = extraCoins.y + diamondHeight * 0.1;
  drawFlowArrow(
    `M ${loopStartX} ${loopStartY}
     C ${extraCoins.x + diamondWidth * 1.12} ${extraCoins.y + diamondHeight * 0.92},
       ${extraCoins.x - diamondWidth * 1.22} ${extraCoins.y + diamondHeight * 1.15},
       ${loopEndX} ${loopEndY}`,
    stroke
  );
  drawArrowHead(loopEndX, loopEndY, 180, compact ? 8 : 9, stroke);
  drawTag(extraCoins.x, extraCoins.y + diamondHeight * 1.36, "TT");
}

function renderStep2Scene() {
  renderSceneBackdrop("randomized response surveys");
  const { width, height } = state.renderMetrics;
  const compact = width < 620;

  if (compact) {
    const question = { x: width * 0.15, y: height * 0.18, width: width * 0.7, height: 72 };
    const coin1 = { x: width * 0.5, y: height * 0.39, r: 34 };
    const truth = { x: width * 0.08, y: height * 0.53, width: width * 0.36, height: 70 };
    const coin2 = { x: width * 0.72, y: height * 0.53, r: 30 };
    const yesBox = { x: width * 0.52, y: height * 0.72, width: width * 0.18, height: 62 };
    const noBox = { x: width * 0.74, y: height * 0.72, width: width * 0.18, height: 62 };

    drawFlowCard(question.x, question.y, question.width, question.height, "Sensitive question", "Ask it privately", "#15253d");
    drawFlowCoinNode(coin1.x, coin1.y, coin1.r, "Coin 1", "truth?", "#f2b84b");
    drawFlowCard(truth.x, truth.y, truth.width, truth.height, "Tell truth", "answer honestly", "#148a88");
    drawFlowCoinNode(coin2.x, coin2.y, coin2.r, "Coin 2", "random", "#81c8ef");
    drawFlowCard(yesBox.x, yesBox.y, yesBox.width, yesBox.height, "Say YES", "50%", "#2c88d9");
    drawFlowCard(noBox.x, noBox.y, noBox.width, noBox.height, "Say NO", "50%", "#ee8f3b");

    drawFlowArrow(`M ${width * 0.5} ${question.y + question.height} L ${coin1.x} ${coin1.y - coin1.r}`, "rgba(21,37,61,0.18)");
    drawFlowArrow(`M ${coin1.x - 18} ${coin1.y + 12} C ${coin1.x - 42} ${coin1.y + 34}, ${truth.x + truth.width * 0.76} ${truth.y - 18}, ${truth.x + truth.width * 0.5} ${truth.y}`, "rgba(20,138,136,0.3)");
    drawFlowArrow(`M ${coin1.x + 18} ${coin1.y + 12} C ${coin1.x + 46} ${coin1.y + 34}, ${coin2.x - 24} ${coin2.y - 46}, ${coin2.x} ${coin2.y - coin2.r}`, "rgba(129,200,239,0.45)");
    drawFlowArrow(`M ${coin2.x - 12} ${coin2.y + coin2.r - 6} C ${coin2.x - 34} ${coin2.y + 34}, ${yesBox.x + yesBox.width * 0.34} ${yesBox.y - 18}, ${yesBox.x + yesBox.width * 0.5} ${yesBox.y}`, "rgba(44,136,217,0.35)");
    drawFlowArrow(`M ${coin2.x + 12} ${coin2.y + coin2.r - 6} C ${coin2.x + 34} ${coin2.y + 34}, ${noBox.x + noBox.width * 0.66} ${noBox.y - 18}, ${noBox.x + noBox.width * 0.5} ${noBox.y}`, "rgba(238,143,59,0.35)");

    drawFlowLabel(coin1.x - 56, coin1.y + 8, "Heads", "#148a88", 12);
    drawFlowLabel(coin1.x + 46, coin1.y + 10, "Tails", "#526277", 12);
    drawFlowLabel(coin2.x - 46, coin2.y + 48, "Heads", "#2c88d9", 12);
    drawFlowLabel(coin2.x + 22, coin2.y + 48, "Tails", "#ee8f3b", 12);
  } else {
    const question = { x: width * 0.08, y: height * 0.42, width: width * 0.22, height: 90 };
    const coin1 = { x: width * 0.38, y: height * 0.48, r: 44 };
    const truth = { x: width * 0.55, y: height * 0.2, width: width * 0.18, height: 84 };
    const coin2 = { x: width * 0.56, y: height * 0.72, r: 38 };
    const yesBox = { x: width * 0.71, y: height * 0.55, width: width * 0.13, height: 72 };
    const noBox = { x: width * 0.71, y: height * 0.77, width: width * 0.13, height: 72 };
    const output = { x: width * 0.86, y: height * 0.47, width: width * 0.1, height: 120 };

    drawFlowCard(question.x, question.y, question.width, question.height, "Sensitive question", "Ask it privately", "#15253d");
    drawFlowCoinNode(coin1.x, coin1.y, coin1.r, "Coin 1", "truth?", "#f2b84b");
    drawFlowCard(truth.x, truth.y, truth.width, truth.height, "Tell truth", "honest answer", "#148a88");
    drawFlowCoinNode(coin2.x, coin2.y, coin2.r, "Coin 2", "random", "#81c8ef");
    drawFlowCard(yesBox.x, yesBox.y, yesBox.width, yesBox.height, "Say YES", "50%", "#2c88d9");
    drawFlowCard(noBox.x, noBox.y, noBox.width, noBox.height, "Say NO", "50%", "#ee8f3b");
    drawFlowCard(output.x, output.y, output.width, output.height, "Noisy reply", "survey sees this", "#ff6f61");

    drawFlowArrow(`M ${question.x + question.width} ${question.y + question.height / 2} C ${question.x + question.width + 42} ${question.y + question.height / 2}, ${coin1.x - 64} ${coin1.y}, ${coin1.x - coin1.r} ${coin1.y}`, "rgba(21,37,61,0.18)");
    drawFlowArrow(`M ${coin1.x + 16} ${coin1.y - 28} C ${coin1.x + 70} ${coin1.y - 66}, ${truth.x - 26} ${truth.y + 20}, ${truth.x} ${truth.y + truth.height / 2}`, "rgba(20,138,136,0.3)");
    drawFlowArrow(`M ${coin1.x + 18} ${coin1.y + 26} C ${coin1.x + 68} ${coin1.y + 74}, ${coin2.x - 42} ${coin2.y - 44}, ${coin2.x - coin2.r} ${coin2.y}`, "rgba(129,200,239,0.45)");
    drawFlowArrow(`M ${coin2.x + 18} ${coin2.y - 18} C ${coin2.x + 52} ${coin2.y - 36}, ${yesBox.x - 24} ${yesBox.y + 20}, ${yesBox.x} ${yesBox.y + yesBox.height / 2}`, "rgba(44,136,217,0.35)");
    drawFlowArrow(`M ${coin2.x + 18} ${coin2.y + 18} C ${coin2.x + 52} ${coin2.y + 34}, ${noBox.x - 24} ${noBox.y + 20}, ${noBox.x} ${noBox.y + noBox.height / 2}`, "rgba(238,143,59,0.35)");
    drawFlowArrow(`M ${truth.x + truth.width} ${truth.y + truth.height / 2} C ${truth.x + truth.width + 34} ${truth.y + truth.height / 2}, ${output.x - 18} ${output.y + 24}, ${output.x} ${output.y + 32}`, "rgba(20,138,136,0.25)");
    drawFlowArrow(`M ${yesBox.x + yesBox.width} ${yesBox.y + yesBox.height / 2} C ${yesBox.x + yesBox.width + 24} ${yesBox.y + yesBox.height / 2}, ${output.x - 18} ${output.y + output.height / 2}, ${output.x} ${output.y + output.height / 2}`, "rgba(44,136,217,0.25)");
    drawFlowArrow(`M ${noBox.x + noBox.width} ${noBox.y + noBox.height / 2} C ${noBox.x + noBox.width + 24} ${noBox.y + noBox.height / 2}, ${output.x - 18} ${output.y + output.height - 24}, ${output.x} ${output.y + output.height - 32}`, "rgba(238,143,59,0.25)");

    drawFlowLabel(coin1.x + 30, coin1.y - 52, "Heads", "#148a88");
    drawFlowLabel(coin1.x + 26, coin1.y + 64, "Tails", "#526277");
    drawFlowLabel(coin2.x + 40, coin2.y - 34, "Heads", "#2c88d9");
    drawFlowLabel(coin2.x + 40, coin2.y + 46, "Tails", "#ee8f3b");
  }

  labelLayer
    .append("foreignObject")
    .attr("x", compact ? width * 0.12 : width * 0.18)
    .attr("y", compact ? height * 0.84 : height * 0.82)
    .attr("width", compact ? width * 0.76 : width * 0.62)
    .attr("height", compact ? 84 : 72)
    .html(
      `<div xmlns="http://www.w3.org/1999/xhtml" style="background:rgba(255,255,255,0.88);border:1px solid rgba(21,37,61,0.1);border-radius:20px;padding:${compact ? "12px 14px" : "14px 18px"};color:#526277;font:${compact ? "14px" : "16px"} 'Atkinson Hyperlegible', sans-serif;line-height:1.45;">This is the local model: the student adds noise before the answer reaches the survey, so any one report is harder to trust on its own.</div>`
    );
}

function renderStep3Scene() {
  // Chapter 4 is fully handled by the interactive HTML coin panel.
  // Nothing to draw on canvas/SVG.
}

function renderStep4Scene() {
  const geometry = state.geometry;
  const yesBucket = geometry.bucketYes;
  const noBucket = geometry.bucketNo;
  const compact = state.renderMetrics.width < 620;
  const sourceX = geometry.spawn.x - 28;

  flowLayer
    .append("path")
    .attr(
      "d",
      `M ${sourceX} ${geometry.spawn.y} C ${geometry.spawn.x + 70} ${geometry.spawn.y}, ${
        geometry.gate.x - 80
      } ${geometry.gate.y}, ${geometry.gate.x} ${geometry.gate.y}`
    )
    .attr("fill", "none")
    .attr("stroke", "rgba(21,37,61,0.15)")
    .attr("stroke-width", 4)
    .attr("stroke-dasharray", "10 12");

  flowLayer
    .append("path")
    .attr(
      "d",
      `M ${geometry.gate.x} ${geometry.gate.y} C ${geometry.gate.x + 70} ${geometry.gate.y}, ${
        geometry.guideLeft.x
      } ${geometry.guideLeft.y}, ${yesBucket.x - yesBucket.width / 2} ${yesBucket.y}`
    )
    .attr("fill", "none")
    .attr("stroke", "rgba(44,136,217,0.22)")
    .attr("stroke-width", 4)
    .attr("stroke-dasharray", "12 12");

  flowLayer
    .append("path")
    .attr(
      "d",
      `M ${geometry.gate.x} ${geometry.gate.y} C ${geometry.gate.x + 70} ${geometry.gate.y}, ${
        geometry.guideRight.x
      } ${geometry.guideRight.y}, ${noBucket.x - noBucket.width / 2} ${noBucket.y}`
    )
    .attr("fill", "none")
    .attr("stroke", "rgba(238,143,59,0.22)")
    .attr("stroke-width", 4)
    .attr("stroke-dasharray", "12 12");

  sceneLayer
    .append("rect")
    .attr("x", yesBucket.x - yesBucket.width / 2)
    .attr("y", yesBucket.y - yesBucket.height / 2)
    .attr("width", yesBucket.width)
    .attr("height", yesBucket.height)
    .attr("rx", 24)
    .attr("fill", "rgba(44,136,217,0.12)")
    .attr("stroke", "rgba(44,136,217,0.55)")
    .attr("stroke-width", 3);

  sceneLayer
    .append("rect")
    .attr("x", noBucket.x - noBucket.width / 2)
    .attr("y", noBucket.y - noBucket.height / 2)
    .attr("width", noBucket.width)
    .attr("height", noBucket.height)
    .attr("rx", 24)
    .attr("fill", "rgba(238,143,59,0.12)")
    .attr("stroke", "rgba(238,143,59,0.55)")
    .attr("stroke-width", 3);

  labelLayer
    .append("text")
    .attr("x", geometry.spawn.x - 6)
    .attr("y", geometry.spawn.y - (compact ? 74 : 88))
    .attr("text-anchor", "middle")
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 18 : 22)
    .attr("font-weight", 700)
    .attr("fill", "#15253d")
    .text("Secret answers");

  labelLayer
    .append("text")
    .attr("x", geometry.gate.x)
    .attr("y", geometry.gate.y - (compact ? 74 : 88))
    .attr("text-anchor", "middle")
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 20 : 24)
    .attr("font-weight", 700)
    .attr("fill", "#15253d")
    .text("Coin Flip Gate");

  labelLayer
    .append("text")
    .attr("x", geometry.gate.x)
    .attr("y", geometry.gate.y - (compact ? 48 : 58))
    .attr("text-anchor", "middle")
    .attr("font-size", compact ? 15 : 18)
    .attr("fill", "#526277")
    .text("Heads = truth. Tails = random Yes/No.");

  drawGateCoin(geometry.gate.x, geometry.gate.y);
  drawBucketLabels();
  drawSecretLegend();
}

function renderStep5aScene() {
  renderPipelineScene(
    [
      { label: "Device", note: "Chrome client", accent: "#81c8ef", icon: "assets/icons/browser.svg" },
      { label: "Randomized report", note: "Scramble first", accent: "#f2b84b" },
      { label: "Aggregator", note: "Group analysis", accent: "#148a88" },
      { label: "Crowd insights", note: "Safe summary", accent: "#ff6f61" },
    ],
    "RAPPOR keeps the privacy step close to the user before group-level analysis begins."
  );
}

function renderStep5bScene() {
  renderPipelineScene(
    [
      { label: "On-device", note: "Message stays local", accent: "#81c8ef", icon: "assets/icons/phone.svg" },
      { label: "Private donation", note: "Add noise", accent: "#148a88" },
      { label: "Limited contributions", note: "Contribute a little", accent: "#f2b84b" },
      { label: "Trend result", note: "Crowd pattern only", accent: "#ff6f61" },
    ],
    "Apple’s description focuses on learning trends while limiting what leaves the device."
  );
}

function renderStep5cScene() {
  renderPipelineScene(
    [
      { label: "Publisher data", note: "One side", accent: "#81c8ef" },
      { label: "Advertiser data", note: "Other side", accent: "#ff6f61" },
      { label: "Private matching", note: "Protected computation", accent: "#f2b84b" },
      { label: "DP reporting", note: "Aggregate only", accent: "#148a88" },
    ],
    "PrivacyGo-like systems protect measurement so only DP-protected aggregate results are reported."
  );
}

function renderPipelineScene(nodes, caption) {
  renderSceneBackdrop("pipeline");
  const { width, height } = state.renderMetrics;
  const compact = width < 620;
  const baseY = state.geometry.pipelineY;
  const gap = width / (nodes.length + 1);
  const radius = compact ? 38 : 48;
  const positions = compact
    ? [
        { x: width * 0.3, y: height * 0.38 },
        { x: width * 0.7, y: height * 0.38 },
        { x: width * 0.3, y: height * 0.62 },
        { x: width * 0.7, y: height * 0.62 },
      ]
    : nodes.map((_, index) => ({ x: gap * (index + 1), y: baseY }));

  nodes.forEach((node, index) => {
    const position = positions[index];
    const group = sceneLayer
      .append("g")
      .attr("transform", `translate(${position.x}, ${position.y})`);

    group
      .append("circle")
      .attr("r", radius)
      .attr("fill", `${node.accent}22`)
      .attr("stroke", node.accent)
      .attr("stroke-width", 3);

    if (node.icon) {
      group
        .append("image")
        .attr("href", node.icon)
        .attr("x", -20)
        .attr("y", -20)
        .attr("width", 40)
        .attr("height", 40);
    } else {
      group
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 10)
        .attr("font-family", "Sora")
        .attr("font-size", 22)
        .attr("font-weight", 700)
        .attr("fill", node.accent)
        .text(index + 1);
    }

    group
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", compact ? 76 : 92)
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 18 : 20)
      .attr("font-weight", 700)
      .attr("fill", "#15253d")
      .text(node.label);

    group
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", compact ? 98 : 118)
      .attr("font-size", compact ? 14 : 16)
      .attr("fill", "#526277")
      .text(node.note);

    if (index < nodes.length - 1) {
      const next = positions[index + 1];
      const compactPath =
        position.y === next.y
          ? `M ${position.x + radius + 10} ${position.y} C ${position.x + 48} ${position.y - 18}, ${next.x - 48} ${next.y + 18}, ${next.x - radius - 10} ${next.y}`
          : `M ${position.x} ${position.y + radius + 10} C ${position.x} ${position.y + 48}, ${next.x} ${next.y - 48}, ${next.x} ${next.y - radius - 10}`;
      sceneLayer
        .append("path")
        .attr(
          "d",
          compact
            ? compactPath
            : `M ${position.x + 56} ${position.y} C ${position.x + 92} ${position.y - 24}, ${next.x - 92} ${next.y + 24}, ${next.x - 56} ${next.y}`
        )
        .attr("fill", "none")
        .attr("stroke", "rgba(21,37,61,0.18)")
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round");
    }
  });

  labelLayer
    .append("text")
    .attr("x", width * 0.5)
    .attr("y", height * 0.18)
    .attr("text-anchor", "middle")
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 24 : 32)
    .attr("font-weight", 700)
    .attr("fill", "#15253d")
    .text("Same idea, fancier pipeline");

  labelLayer
    .append("foreignObject")
    .attr("x", compact ? width * 0.1 : width * 0.18)
    .attr("y", compact ? height * 0.76 : height * 0.72)
    .attr("width", compact ? width * 0.8 : width * 0.64)
    .attr("height", compact ? 110 : 120)
    .html(
      `<div xmlns="http://www.w3.org/1999/xhtml" style="background:rgba(255,255,255,0.88);border:1px solid rgba(21,37,61,0.12);border-radius:20px;padding:16px 18px;color:#15253d;font: ${compact ? "16px" : "18px"} 'Atkinson Hyperlegible', sans-serif;line-height:1.5;">${caption}</div>`
    );
}

function drawFlowCard(x, y, width, height, title, note, accent = "#148a88") {
  const compact = state.renderMetrics.width < 620;
  const group = sceneLayer.append("g").attr("transform", `translate(${x}, ${y})`);

  group
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("rx", 22)
    .attr("fill", "rgba(255,255,255,0.94)")
    .attr("stroke", accent)
    .attr("stroke-width", 2);

  group
    .append("text")
    .attr("x", width / 2)
    .attr("y", height * 0.43)
    .attr("text-anchor", "middle")
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 15 : 17)
    .attr("font-weight", 700)
    .attr("fill", "#15253d")
    .text(title);

  group
    .append("text")
    .attr("x", width / 2)
    .attr("y", height * 0.7)
    .attr("text-anchor", "middle")
    .attr("font-size", compact ? 12 : 13)
    .attr("fill", "#526277")
    .text(note);

  return group;
}

function drawFlowCoinNode(x, y, radius, label, note, accent = "#f2b84b") {
  const compact = state.renderMetrics.width < 620;
  const group = sceneLayer.append("g").attr("transform", `translate(${x}, ${y})`);

  group
    .append("circle")
    .attr("r", radius)
    .attr("fill", `${accent}22`)
    .attr("stroke", accent)
    .attr("stroke-width", 3);

  group
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", compact ? -4 : -6)
    .attr("font-family", "Sora")
    .attr("font-size", compact ? 15 : 17)
    .attr("font-weight", 700)
    .attr("fill", "#15253d")
    .text(label);

  group
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", compact ? 14 : 16)
    .attr("font-size", compact ? 11 : 12)
    .attr("fill", "#526277")
    .text(note);

  return group;
}

function drawFlowArrow(pathData, stroke = "rgba(21,37,61,0.18)") {
  sceneLayer
    .append("path")
    .attr("d", pathData)
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", 4)
    .attr("stroke-linecap", "round");
}

function drawFlowLabel(x, y, text, fill = "#526277", size = 13) {
  labelLayer
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("font-family", "Sora")
    .attr("font-size", size)
    .attr("font-weight", 700)
    .attr("fill", fill)
    .text(text);
}

function renderSceneBackdrop(label) {
  const { width, height } = state.renderMetrics;
  sceneLayer
    .append("rect")
    .attr("x", width * 0.08)
    .attr("y", height * 0.08)
    .attr("width", width * 0.84)
    .attr("height", height * 0.84)
    .attr("rx", 32)
    .attr("fill", "rgba(255,255,255,0.72)")
    .attr("stroke", "rgba(21,37,61,0.1)");

  labelLayer
    .append("text")
    .attr("x", width * 0.1)
    .attr("y", height * 0.12)
    .attr("font-size", 14)
    .attr("font-family", "Sora")
    .attr("font-weight", 700)
    .attr("letter-spacing", "0.16em")
    .attr("fill", "#148a88")
    .text(label.toUpperCase());
}

function drawCoinLegend(width, height) {
  const compact = width < 620;
  const legend = sceneLayer
    .append("g")
    .attr("transform", `translate(${width * (compact ? 0.12 : 0.18)}, ${height * (compact ? 0.74 : 0.72)})`);
  const rows = [
    { label: "Heads", note: "Tell the truth", accent: "#148a88" },
    { label: "Tails", note: "Answer random Yes/No", accent: "#ff6f61" },
  ];

  rows.forEach((row, index) => {
    const y = index * 58;
    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", y)
      .attr("r", 12)
      .attr("fill", row.accent);
    legend
      .append("text")
      .attr("x", 26)
      .attr("y", y + 5)
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 17 : 20)
      .attr("font-weight", 700)
      .attr("fill", "#15253d")
      .text(row.label);
    legend
      .append("text")
      .attr("x", compact ? 92 : 110)
      .attr("y", y + 5)
      .attr("font-size", compact ? 15 : 18)
      .attr("fill", "#526277")
      .text(row.note);
  });
}

function drawGateCoin(x, y) {
  const gateGroup = sceneLayer.append("g").attr("transform", `translate(${x}, ${y})`);
  gateGroup
    .append("ellipse")
    .attr("rx", 56)
    .attr("ry", 58)
    .attr("fill", d3.interpolateRgb("#f2b84b", "#148a88")(state.pTruth))
    .attr("stroke", "#15253d")
    .attr("stroke-width", 4)
    .attr("transform", `rotate(${d3.scaleLinear().domain([0, 1]).range([-12, 12])(state.pTruth)})`);
  gateGroup
    .append("text")
    .attr("text-anchor", "middle")
    .attr("y", 8)
    .attr("font-family", "Sora")
    .attr("font-size", 32)
    .attr("font-weight", 800)
    .attr("fill", "#fffdf8")
    .text("H");
}

function drawBucketLabels() {
  const yesBucket = state.geometry.bucketYes;
  const noBucket = state.geometry.bucketNo;
  const compact = state.renderMetrics.width < 620;
  const buckets = [
    { bucket: yesBucket, label: "YES", count: state.publicYesCount, accent: "#2c88d9" },
    { bucket: noBucket, label: "NO", count: state.publicNoCount, accent: "#ee8f3b" },
  ];

  buckets.forEach(({ bucket, label, count, accent }) => {
    const left = bucket.x - bucket.width / 2 + 14;
    const top = bucket.y - bucket.height / 2 + (compact ? 22 : 24);
    const ratio = state.participantsTarget ? count / state.participantsTarget : 0;
    const barWidth = bucket.barWidth;

    labelLayer
      .append("text")
      .attr("x", left)
      .attr("y", top)
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 17 : 19)
      .attr("font-weight", 700)
      .attr("fill", accent)
      .text(label);

    labelLayer
      .append("text")
      .attr("x", left + barWidth)
      .attr("y", top)
      .attr("text-anchor", "end")
      .attr("font-family", "Sora")
      .attr("font-size", compact ? 17 : 19)
      .attr("font-weight", 700)
      .attr("fill", "#15253d")
      .text(count.toLocaleString());

    labelLayer
      .append("rect")
      .attr("x", left)
      .attr("y", top + 14)
      .attr("width", barWidth)
      .attr("height", bucket.barHeight)
      .attr("rx", bucket.barHeight / 2)
      .attr("fill", "rgba(18,35,56,0.12)");

    labelLayer
      .append("rect")
      .attr("x", left)
      .attr("y", top + 14)
      .attr("width", Math.max(barWidth * ratio, ratio > 0 ? 6 : 0))
      .attr("height", bucket.barHeight)
      .attr("rx", bucket.barHeight / 2)
      .attr("fill", accent);

    labelLayer
      .append("text")
      .attr("x", left)
      .attr("y", top + (compact ? 40 : 44))
      .attr("font-size", compact ? 13 : 15)
      .attr("fill", "#526277")
      .text(`${Math.round(ratio * 100)}% of the class`);
  });
}

function drawSecretLegend() {
  const compact = state.renderMetrics.width < 620;
  const legend = labelLayer
    .append("g")
    .attr(
      "transform",
      `translate(${state.renderMetrics.width * 0.05}, ${state.renderMetrics.height * (compact ? 0.23 : 0.18)})`
    );
  legend
    .append("circle")
    .attr("r", 8)
    .attr("fill", "#2c88d9");
  legend
    .append("text")
    .attr("x", 18)
    .attr("y", 5)
    .attr("font-size", compact ? 14 : 17)
    .attr("fill", "#15253d")
    .text("Secret YES = blue circle");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 26)
    .attr("width", 16)
    .attr("height", 16)
    .attr("fill", "#ee8f3b");
  legend
    .append("text")
    .attr("x", 24)
    .attr("y", 39)
    .attr("font-size", compact ? 14 : 17)
    .attr("fill", "#15253d")
    .text("Secret NO = orange square");

  legend
    .append("text")
    .attr("x", 0)
    .attr("y", 68)
    .attr("font-size", compact ? 13 : 16)
    .attr("fill", "#526277")
    .text("Collectors only see the public boxes.");
}

function updateFooter() {
  dom.publicYesCount.textContent = state.publicYesCount.toLocaleString();
  dom.publicNoCount.textContent = state.publicNoCount.toLocaleString();
  dom.trueYesRateDisplay.textContent = `${Math.round(state.trueYesRate * 100)}%`;
  dom.vizStatus.textContent = state.statusMessage;
}

function tick(timestamp) {
  const rawDt = state.lastTimestamp ? Math.min((timestamp - state.lastTimestamp) / 1000, 0.05) : 0.016;
  state.lastTimestamp = timestamp;

  updateHeroCoinfield(rawDt, timestamp / 1000);

  if (!state.paused) {
    updateSimulation(rawDt);
    updateExampleVoteResultsAnimation(rawDt);
    updateExamplePrivacyAnimation(rawDt);
  }

  drawCanvas();

  if (state.overlayDirty) {
    renderScene();
  }

  state.animationFrame = window.requestAnimationFrame(tick);
}

function updateHeroCoinfield(dt, timeSeconds) {
  if (!state.heroCoins.length || !dom.heroCoinfield) {
    return;
  }

  const fieldRect = dom.heroCoinfield.getBoundingClientRect();
  const interactionRadius = Math.max(Math.min(fieldRect.width * 0.12, 92), 54);
  const springStrength = 15;
  const damping = Math.exp(-8 * dt);

  state.heroCoins.forEach((coin) => {
    const idleX = Math.sin(timeSeconds * coin.floatSpeed + coin.phase) * coin.floatRadiusX;
    const idleY = Math.cos(timeSeconds * coin.floatSpeed * 0.9 + coin.phase) * coin.floatRadiusY;
    let forceX = (idleX - coin.offsetX) * springStrength;
    let forceY = (idleY - coin.offsetY) * springStrength;

    if (state.heroPointer.active) {
      const currentX = coin.homeX + coin.offsetX;
      const currentY = coin.homeY + coin.offsetY;
      const deltaX = currentX - state.heroPointer.x;
      const deltaY = currentY - state.heroPointer.y;
      const distance = Math.hypot(deltaX, deltaY) || 0.001;

      if (distance < interactionRadius) {
        const strength = 1 - distance / interactionRadius;
        const repulsion = 1450 * strength * strength;
        forceX += (deltaX / distance) * repulsion;
        forceY += (deltaY / distance) * repulsion;
      }
    }

    coin.velocityX = (coin.velocityX + forceX * dt) * damping;
    coin.velocityY = (coin.velocityY + forceY * dt) * damping;
    coin.offsetX += coin.velocityX * dt;
    coin.offsetY += coin.velocityY * dt;

    const offsetDistance = Math.hypot(coin.offsetX, coin.offsetY);
    if (offsetDistance > coin.maxOffset) {
      const scale = coin.maxOffset / offsetDistance;
      coin.offsetX *= scale;
      coin.offsetY *= scale;
      coin.velocityX *= 0.7;
      coin.velocityY *= 0.7;
    }

    coin.element.style.transform = `translate3d(${coin.offsetX.toFixed(2)}px, ${coin.offsetY.toFixed(
      2
    )}px, 0) rotateZ(${(coin.tilt + coin.offsetX * 0.03).toFixed(2)}deg)`;
  });
}

function updateSimulation(dt) {
  if (!state.particles.length) {
    return;
  }

  const spawnRate = state.spawnRatePerSecond * state.slowMotion;
  state.spawnAccumulator += dt * spawnRate;

  while (state.spawnCursor < state.particles.length && state.spawnAccumulator >= 1) {
    spawnParticle(state.particles[state.spawnCursor]);
    state.spawnCursor += 1;
    state.spawnAccumulator -= 1;
  }

  const motionFactor = state.slowMotion;
  for (let index = 0; index < state.spawnCursor; index += 1) {
    updateParticle(state.particles[index], dt * motionFactor);
  }

  if (!state.runComplete && state.completedCount === state.participantsTarget) {
    state.runComplete = true;
    state.statusMessage = "Run complete. Change the slider or class size to try again.";
    updateFooter();
    runTeacherChecks();
  }
}

function spawnParticle(particle) {
  particle.phase = "TO_COIN";
  particle.x = particle.startX;
  particle.y = particle.startY;
  particle.toCoinProgress = 0;
  particle.postCoinProgress = 0;
}

function updateParticle(particle, dt) {
  if (particle.phase === "SPAWN" || particle.phase === "IN_BUCKET") {
    return;
  }

  if (particle.phase === "TO_COIN") {
    particle.toCoinProgress = Math.min(particle.toCoinProgress + dt * particle.speed, 1);
    const t = easeInOut(particle.toCoinProgress);
    particle.x = quadraticBezier(
      particle.startX,
      state.geometry.gate.x * 0.22,
      state.geometry.gate.x,
      t
    );
    particle.y = quadraticBezier(
      particle.startY,
      state.geometry.spawn.y + particle.drift,
      state.geometry.gate.y,
      t
    );

    if (particle.toCoinProgress >= 1) {
      decidePublicAnswer(particle);
      particle.phase = "POST_COIN";
    }
    return;
  }

  if (particle.phase === "POST_COIN") {
    particle.postCoinProgress = Math.min(particle.postCoinProgress + dt * particle.speed * 0.9, 1);
    const t = easeOut(particle.postCoinProgress);
    const bucket = particle.publicAnswer === "YES" ? state.geometry.bucketYes : state.geometry.bucketNo;
    const controlX = particle.publicAnswer === "YES" ? state.geometry.guideLeft.x : state.geometry.guideRight.x;
    const controlY = particle.publicAnswer === "YES" ? state.geometry.guideLeft.y : state.geometry.guideRight.y;

    particle.x = quadraticBezier(
      state.geometry.gate.x,
      controlX + particle.routeBend * 0.2,
      bucket.x + particle.bucketOffsetX,
      t
    );
    particle.y = quadraticBezier(
      state.geometry.gate.y,
      controlY,
      bucket.y + particle.bucketOffsetY,
      t
    );

    if (particle.postCoinProgress >= 1) {
      particle.phase = "IN_BUCKET";
      state.completedCount += 1;
      updateMathPanel();
      runTeacherChecks();
    }
  }
}

// Public answers are assigned only at the gate so slider changes affect later arrivals only.
function decidePublicAnswer(particle) {
  particle.decisionTruthProbability = state.pTruth;
  const usesTruth = Math.random() < state.pTruth;
  if (usesTruth) {
    particle.publicAnswer = particle.secretAnswer;
  } else {
    particle.publicAnswer = Math.random() < 0.5 ? "YES" : "NO";
  }

  const bucket = particle.publicAnswer === "YES" ? state.geometry.bucketYes : state.geometry.bucketNo;
  particle.bucketTargetX = bucket.x + particle.bucketOffsetX;
  particle.bucketTargetY = bucket.y + particle.bucketOffsetY;

  if (particle.publicAnswer === "YES") {
    state.publicYesCount += 1;
  } else {
    state.publicNoCount += 1;
  }

  updateFooter();
  if (state.currentStepId === "step-4") {
    requestSceneRender();
  }
}

function drawCanvas() {
  const { width, height } = state.renderMetrics;
  ctx.clearRect(0, 0, width, height);

  if (state.currentStepId !== "step-4") {
    drawAmbientParticles();
    return;
  }

  for (let index = 0; index < state.spawnCursor; index += 1) {
    const particle = state.particles[index];
    const isYes = particle.secretAnswer === "YES";
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.fillStyle = isYes ? "rgba(44,136,217,0.9)" : "rgba(238,143,59,0.92)";
    ctx.strokeStyle = "#15253d";
    ctx.lineWidth = 1.2;

    if (isYes) {
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.rect(-5.5, -5.5, 11, 11);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawAmbientParticles() {
  const count = 28;
  for (let index = 0; index < count; index += 1) {
    const x = ((index * 97 + state.lastTimestamp * 0.04) % state.renderMetrics.width);
    const y = (index * 63) % state.renderMetrics.height;
    ctx.beginPath();
    ctx.fillStyle = index % 2 === 0 ? "rgba(44,136,217,0.12)" : "rgba(238,143,59,0.12)";
    ctx.arc(x, y, 5 + (index % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function quadraticBezier(start, control, end, t) {
  const inverse = 1 - t;
  return inverse * inverse * start + 2 * inverse * t * control + t * t * end;
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// ── Epsilon Visualization (Chapters 6 & 7) ─────────────

// True 1-million vote dataset (fixed, realistic)
const EPS_TRUE_DATA = [
  { name: "Rizz Rodent", votes: 412000, color: "#ff6f61", colorSoft: "rgba(255,111,97,0.15)" },
  { name: "6-7 Squeaker", votes: 448000, color: "#2c88d9", colorSoft: "rgba(44,136,217,0.15)" },
  { name: "Carl",         votes: 140000, color: "#148a88", colorSoft: "rgba(20,138,136,0.15)" },
];
const EPS_TOTAL = EPS_TRUE_DATA.reduce((s, d) => s + d.votes, 0); // 1,000,000

// Laplace noise: sample from Lap(0, 1/ε) using inverse CDF
function lapNoise(epsilon) {
  const b = 1 / epsilon;
  const u = Math.random() - 0.5;
  return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// Noise upper-bound for 95% of draws: ub = -b * ln(0.05) ≈ b * 3
function lapNoiseUB(epsilon) {
  return (1 / epsilon) * Math.log(20); // ≈ 3/ε
}

// Leak probability from differencing attack (worst-case, from paper §3.4)
// P_leak = e^ε / (1 + e^ε)
function leakProbability(epsilon) {
  const eEps = Math.exp(epsilon);
  return eEps / (1 + eEps);
}

function renderEpsTrueDataset() {
  const container = dom.epsTrueBars;
  if (!container) return;

  const maxVotes = Math.max(...EPS_TRUE_DATA.map(d => d.votes));
  let html = '<div class="eps-true-table">';

  EPS_TRUE_DATA.forEach(d => {
    const pct = (d.votes / maxVotes * 100).toFixed(1);
    const share = (d.votes / EPS_TOTAL * 100).toFixed(1);
    html += `
      <div class="eps-true-row">
        <span class="eps-true-row__name">${d.name}</span>
        <div class="eps-true-row__track">
          <div class="eps-true-row__fill" style="width:${pct}%;background:${d.color}" data-target="${pct}"></div>
        </div>
        <span class="eps-true-row__count">${(d.votes).toLocaleString()}</span>
        <span class="eps-true-row__share">${share}%</span>
      </div>`;
  });

  html += '</div>';
  html += `<p class="eps-true-total">Total votes: <strong>${EPS_TOTAL.toLocaleString()}</strong></p>`;
  container.innerHTML = html;

  // Animate bars in
  requestAnimationFrame(() => {
    container.querySelectorAll('.eps-true-row__fill').forEach(el => {
      el.style.width = '0%';
      requestAnimationFrame(() => {
        el.style.transition = 'width 1.1s cubic-bezier(0.22,1,0.36,1)';
        el.style.width = el.dataset.target + '%';
      });
    });
  });
}

function renderEpsLive(epsilon) {
  if (!dom.epsPanel || dom.epsPanel.classList.contains('is-hidden')) return;

  // Update slider UI
  if (dom.epsSlider) dom.epsSlider.value = String(epsilon);
  if (dom.epsValDisplay) dom.epsValDisplay.textContent = epsilon.toFixed(2);
  if (dom.epsLiveMeta) dom.epsLiveMeta.textContent = `ε = ${epsilon.toFixed(2)} · Laplace noise applied`;

  // Description
  let desc;
  if (epsilon <= 0.3)      desc = "Very strong privacy — counts are heavily scrambled";
  else if (epsilon <= 0.8) desc = "Strong privacy — counts shift significantly";
  else if (epsilon <= 1.5) desc = "Moderate privacy — counts shift noticeably";
  else if (epsilon <= 3.0) desc = "Weaker privacy — counts are fairly close to truth";
  else                     desc = "Minimal privacy — counts almost match the true values";
  if (dom.epsDesc) dom.epsDesc.textContent = desc;

  // Generate noisy counts (3 samples to show variability)
  const noisyData = EPS_TRUE_DATA.map(d => {
    const noise = lapNoise(epsilon);
    const noisy = Math.max(0, Math.round(d.votes + noise));
    const ub = lapNoiseUB(epsilon);
    return { ...d, noisy, ub, noise };
  });

  // Bottom note
  const ub = lapNoiseUB(epsilon);
  if (dom.epsBottomNote) {
    dom.epsBottomNote.innerHTML =
      `At ε = ${epsilon.toFixed(2)}, 95% of draws add noise in the range [−${Math.round(ub).toLocaleString()}, +${Math.round(ub).toLocaleString()}] votes. ` +
      `${epsilon <= 1 ? "Strong privacy: individuals are well hidden inside this range." : "Higher ε means smaller noise and less privacy protection."}`;
  }

  // Draw pie chart
  drawEpsPie(epsilon);

  // Draw bar chart
  drawEpsBarChart(noisyData, epsilon);
}

function drawEpsPie(epsilon) {
  const canvas = dom.epsPieCanvas;
  if (!canvas) return;
  const ctx2 = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2 - 8;
  const r = Math.min(W, H) / 2 - 12;

  ctx2.clearRect(0, 0, W, H);

  const leak = leakProbability(epsilon);
  const safe = 1 - leak;

  // Draw pie
  const slices = [
    { start: -Math.PI / 2, end: -Math.PI / 2 + safe * Math.PI * 2, color: "#148a88", label: "Safe" },
    { start: -Math.PI / 2 + safe * Math.PI * 2, end: -Math.PI / 2 + Math.PI * 2, color: "#ff6f61", label: "Leak" },
  ];

  slices.forEach(s => {
    ctx2.beginPath();
    ctx2.moveTo(cx, cy);
    ctx2.arc(cx, cy, r, s.start, s.end);
    ctx2.closePath();
    ctx2.fillStyle = s.color;
    ctx2.fill();
  });

  // Inner circle (donut)
  ctx2.beginPath();
  ctx2.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
  ctx2.fillStyle = "rgba(255,255,255,0.92)";
  ctx2.fill();

  // Center text
  ctx2.textAlign = "center";
  ctx2.fillStyle = "#122338";
  ctx2.font = "bold 13px Sora, sans-serif";
  ctx2.fillText((leak * 100).toFixed(1) + "%", cx, cy - 4);
  ctx2.fillStyle = "#526277";
  ctx2.font = "10px Atkinson Hyperlegible, sans-serif";
  ctx2.fillText("leak risk", cx, cy + 12);

  if (dom.epsPieLabel) {
    dom.epsPieLabel.textContent = `${(leak * 100).toFixed(1)}% leak probability at ε = ${epsilon.toFixed(2)}`;
  }
}

function drawEpsBarChart(noisyData, epsilon) {
  const canvas = dom.epsBarCanvas;
  if (!canvas) return;
  const ctx2 = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx2.clearRect(0, 0, W, H);

  const padL = 18, padR = 12, padT = 18, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxVal = Math.max(...EPS_TRUE_DATA.map(d => d.votes)) * 1.18;
  const n = noisyData.length;
  const groupW = chartW / n;
  const barW = groupW * 0.28;

  // Gridlines
  ctx2.strokeStyle = "rgba(18,35,56,0.07)";
  ctx2.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const y = padT + chartH * (1 - f);
    ctx2.beginPath();
    ctx2.moveTo(padL, y);
    ctx2.lineTo(padL + chartW, y);
    ctx2.stroke();
    ctx2.fillStyle = "rgba(18,35,56,0.3)";
    ctx2.font = "9px Sora";
    ctx2.textAlign = "right";
    ctx2.fillText(Math.round(maxVal * f / 1000) + "k", padL - 2, y + 3);
  });

  noisyData.forEach((d, i) => {
    const cx = padL + groupW * i + groupW / 2;

    // True bar (blue, slightly transparent)
    const trueH = (d.votes / maxVal) * chartH;
    const trueX = cx - barW - 2;
    const trueY = padT + chartH - trueH;
    ctx2.fillStyle = "rgba(44,136,217,0.65)";
    ctx2.fillRect(trueX, trueY, barW, trueH);

    // Noisy bar (candidate color)
    const noisyH = Math.max(2, (d.noisy / maxVal) * chartH);
    const noisyX = cx + 2;
    const noisyY = padT + chartH - noisyH;
    ctx2.fillStyle = d.color;
    ctx2.globalAlpha = 0.85;
    ctx2.fillRect(noisyX, noisyY, barW, noisyH);
    ctx2.globalAlpha = 1;

    // Error bar (noise range ub)
    const ubH = (d.ub / maxVal) * chartH;
    const noisyCenterY = padT + chartH - noisyH;
    const errorX = noisyX + barW / 2;
    ctx2.strokeStyle = "rgba(18,35,56,0.55)";
    ctx2.lineWidth = 1.5;
    ctx2.beginPath();
    ctx2.moveTo(errorX, Math.max(padT, noisyCenterY - ubH));
    ctx2.lineTo(errorX, Math.min(padT + chartH, noisyCenterY + ubH));
    ctx2.stroke();
    // Caps
    [noisyCenterY - ubH, noisyCenterY + ubH].forEach(capY => {
      const clampedY = Math.min(padT + chartH, Math.max(padT, capY));
      ctx2.beginPath();
      ctx2.moveTo(errorX - 4, clampedY);
      ctx2.lineTo(errorX + 4, clampedY);
      ctx2.stroke();
    });

    // Label
    ctx2.fillStyle = "#122338";
    ctx2.font = "bold 9px Sora, sans-serif";
    ctx2.textAlign = "center";
    const labelY = padT + chartH + 14;
    // Truncate long names
    const shortName = d.name.length > 9 ? d.name.slice(0, 8) + "…" : d.name;
    ctx2.fillText(shortName, cx, labelY);

    // Noisy count label above bar
    ctx2.fillStyle = d.color;
    ctx2.font = "bold 9px Sora, sans-serif";
    ctx2.fillText(Math.round(d.noisy / 1000) + "k", noisyX + barW / 2, Math.max(padT + 8, noisyY - 3));
  });
}

// ── DB Results Animation (Chapter 5) ─────────────────
function animateDbResults() {
  if (!dom.dbResultsPanel) return;

  // Simulated database values (realistic for a 30% true YES rate, p=0.65)
  const trueYesRate = 0.30;
  const p = 0.65;
  const n = 847;
  // r = p * theta + (1 - p) * 0.5
  const r = p * trueYesRate + (1 - p) * 0.5;
  const publicYesPct = Math.round(r * 100);
  const publicNoPct = 100 - publicYesPct;
  const publicYesCount = Math.round(r * n);
  const publicNoCount = n - publicYesCount;
  // Estimated true rate
  const estimatedTrue = Math.round(((r - 0.5 * (1 - p)) / p) * 100);

  // Reset bars to zero first
  const yesFill = dom.dbResultsPanel.querySelector(".db-bar-row__fill--yes");
  const noFill = dom.dbResultsPanel.querySelector(".db-bar-row__fill--no");
  if (yesFill) yesFill.style.width = "0%";
  if (noFill) noFill.style.width = "0%";
  if (dom.dbPublicYes) dom.dbPublicYes.textContent = "0%";
  if (dom.dbPublicNo) dom.dbPublicNo.textContent = "0%";
  if (dom.dbRawYes) dom.dbRawYes.textContent = "—";
  if (dom.dbEstimatedTrue) dom.dbEstimatedTrue.textContent = "—";

  // Animate after a short delay
  setTimeout(() => {
    if (yesFill) yesFill.style.width = `${publicYesPct}%`;
    if (noFill) noFill.style.width = `${publicNoPct}%`;

    // Count up numbers
    animateCount(dom.dbPublicYes, 0, publicYesPct, 1200, (v) => `${v}%`);
    animateCount(dom.dbPublicNo, 0, publicNoPct, 1200, (v) => `${v}%`);

    setTimeout(() => {
      if (dom.dbRawYes) dom.dbRawYes.textContent = `${publicYesPct}% (${publicYesCount} of ${n})`;
      if (dom.dbEstimatedTrue) {
        animateCount(dom.dbEstimatedTrue, 0, estimatedTrue, 900, (v) => `~${v}%`);
      }
    }, 900);
  }, 350);
}

function animateCount(el, from, to, duration, format) {
  if (!el) return;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (to - from) * eased);
    el.textContent = format(value);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ============================================================================
// COMPANY CARDS (Chapter 1c - Why use it?)
// ============================================================================
function initCompanyCards() {
  const cards = document.querySelectorAll('.company-card');
  
  cards.forEach(card => {
    const toggle = card.querySelector('.company-card__toggle');
    const header = card.querySelector('.company-card__header');
    
    // Toggle button click
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.toggle('company-card--expanded');
        const isExpanded = card.classList.contains('company-card--expanded');
        toggle.setAttribute('aria-expanded', isExpanded);
      });
    }
    
    // Header click (also toggles)
    if (header) {
      header.addEventListener('click', () => {
        card.classList.toggle('company-card--expanded');
        const isExpanded = card.classList.contains('company-card--expanded');
        const toggle = card.querySelector('.company-card__toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', isExpanded);
        }
      });
    }
  });
}

function enterStepWhyUseIt() {
  // Hide all other panels
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  
  state.sceneTitle = "Why use it?";
  state.sceneSubtitle = "Real companies using differential privacy";
  state.statusMessage = "Company examples: see why organizations chose differential privacy";
  dom.sceneKicker.textContent = "";
  
  // Show company cards panel, hide others
  const cardsPanel = document.getElementById('company-cards-panel');
  const epsPanel = document.getElementById('eps-panel');
  const dbPanel = document.getElementById('db-results-panel');
  
  if (cardsPanel) cardsPanel.classList.remove('is-hidden');
  if (epsPanel) epsPanel.classList.add('is-hidden');
  if (dbPanel) dbPanel.classList.add('is-hidden');
  
  // Hide the viz-stage (the canvas/svg visualization)
  const vizStage = document.getElementById('viz-stage');
  if (vizStage) vizStage.style.display = 'none';
  
  syncControlVisibility();
}


// ============================================================================
// STUDENT VOTING PANEL (Captain's View)
// ============================================================================
function initStudentVotingPanel() {
  const studentItems = document.querySelectorAll('.student-item');
  
  studentItems.forEach(item => {
    item.addEventListener('click', () => {
      // Toggle revealed state
      item.classList.toggle('is-revealed');
      
      // Toggle vote visibility
      const voteEl = item.querySelector('.student-vote');
      if (voteEl) {
        voteEl.classList.toggle('is-hidden');
      }
    });
  });
}

function enterStepExampleCaptain() {
  state.sceneTitle = "Privacy Problem";
  state.sceneSubtitle = "The captain knows everyone's votes";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "Captain view: click students to reveal their votes";
  dom.sceneKicker.textContent = "";
  
  // Show student voting panel, hide others
  const studentPanel = document.getElementById('student-voting-panel');
  const cardsPanel = document.getElementById('company-cards-panel');
  const epsPanel = document.getElementById('eps-panel');
  const vizStage = document.getElementById('viz-stage');
  
  if (studentPanel) studentPanel.classList.remove('is-hidden');
  if (cardsPanel) cardsPanel.classList.add('is-hidden');
  if (epsPanel) epsPanel.classList.add('is-hidden');
  if (vizStage) vizStage.style.display = 'none';
  
  syncControlVisibility();
}


// ============================================================================
// K-ANONYMITY MEDICAL RECORDS PANEL
// ============================================================================
function initKanonPanel() {
  const submitBtn = document.getElementById('kanon-submit-btn');
  const anonymizeBtn = document.getElementById('kanon-anonymize-btn');
  const resetBtn = document.getElementById('kanon-reset-btn');
  
  const ageInput = document.getElementById('kanon-age');
  const zipInput = document.getElementById('kanon-zip');
  const conditionInput = document.getElementById('kanon-condition');
  
  const inputSection = document.getElementById('kanon-input-section');
  const comparison = document.getElementById('kanon-comparison');
  const afterCard = document.getElementById('kanon-after-card');
  
  if (!submitBtn) return;
  
  // Submit button handler
  submitBtn.addEventListener('click', () => {
    const age = ageInput.value;
    const zip = zipInput.value;
    const condition = conditionInput.value;
    
    if (!age || !zip || !condition) {
      alert('Please fill in all fields!');
      return;
    }
    
    // Show the "before" state
    document.getElementById('before-age').textContent = age;
    document.getElementById('before-zip').textContent = zip;
    document.getElementById('before-condition').textContent = condition;
    
    // Calculate anonymized values
    const ageNum = parseInt(age);
    const ageRange = getAgeRange(ageNum);
    const zipArea = zip.substring(0, 3) + '**';
    
    document.getElementById('after-age').textContent = ageRange;
    document.getElementById('after-zip').textContent = zipArea;
    document.getElementById('after-condition').textContent = condition;
    
    // Show comparison
    inputSection.classList.add('is-hidden');
    comparison.classList.remove('is-hidden');
    anonymizeBtn.classList.remove('is-hidden');
    resetBtn.classList.remove('is-hidden');
  });
  
  // Anonymize button handler
  anonymizeBtn.addEventListener('click', () => {
    afterCard.classList.remove('is-hidden');
    anonymizeBtn.classList.add('is-hidden');
  });
  
  // Reset button handler
  resetBtn.addEventListener('click', () => {
    ageInput.value = '';
    zipInput.value = '';
    conditionInput.value = '';
    
    inputSection.classList.remove('is-hidden');
    comparison.classList.add('is-hidden');
    afterCard.classList.add('is-hidden');
    anonymizeBtn.classList.add('is-hidden');
    resetBtn.classList.add('is-hidden');
  });
}

function getAgeRange(age) {
  if (age < 10) return '0-10';
  if (age < 20) return '10-20';
  if (age < 30) return '20-30';
  if (age < 40) return '30-40';
  if (age < 50) return '40-50';
  if (age < 60) return '50-60';
  if (age < 70) return '60-70';
  if (age < 80) return '70-80';
  return '80+';
}

function enterStepKanonInput() {
  state.sceneTitle = "Medical Records Privacy";
  state.sceneSubtitle = "Enter your information to see the risk";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "K-anonymity demonstration: input your data";
  dom.sceneKicker.textContent = "";
  
  // Show K-anonymity panel, hide others
  const kanonPanel = document.getElementById('kanon-panel');
  const cardsPanel = document.getElementById('company-cards-panel');
  const studentPanel = document.getElementById('student-voting-panel');
  const epsPanel = document.getElementById('eps-panel');
  const vizStage = document.getElementById('viz-stage');
  
  if (kanonPanel) kanonPanel.classList.remove('is-hidden');
  if (cardsPanel) cardsPanel.classList.add('is-hidden');
  if (studentPanel) studentPanel.classList.add('is-hidden');
  if (epsPanel) epsPanel.classList.add('is-hidden');
  if (vizStage) vizStage.style.display = 'none';
  
  syncControlVisibility();
}



function enterStepKanonStatic() {
  state.sceneTitle = "K-Anonymity";
  state.sceneSubtitle = "Privacy through grouping";
  state.sceneFlags = {
    showSlider: false,
    showParticipants: false,
    showCounts: false,
  };
  state.statusMessage = "K-anonymity explanation";
  dom.sceneKicker.textContent = "";
  
  // Hide all panels, show viz-stage
  const kanonPanel = document.getElementById('kanon-panel');
  const cardsPanel = document.getElementById('company-cards-panel');
  const studentPanel = document.getElementById('student-voting-panel');
  const epsPanel = document.getElementById('eps-panel');
  const vizStage = document.getElementById('viz-stage');
  
  if (kanonPanel) kanonPanel.classList.add('is-hidden');
  if (cardsPanel) cardsPanel.classList.add('is-hidden');
  if (studentPanel) studentPanel.classList.add('is-hidden');
  if (epsPanel) epsPanel.classList.add('is-hidden');
  if (vizStage) vizStage.style.display = '';
  
  syncControlVisibility();
}


// K-Anonymity Scene Handlers - Show different visualizations for each step
function showKanonViz(vizId) {
  // Hide all kanon visualizations
  const allViz = document.querySelectorAll('.kanon-viz');
  allViz.forEach(v => v.classList.remove('is-active'));
  
  // Hide other panels
  const cardsPanel = document.getElementById('company-cards-panel');
  const studentPanel = document.getElementById('student-voting-panel');
  const epsPanel = document.getElementById('eps-panel');
  const vizStage = document.getElementById('viz-stage');
  
  if (cardsPanel) cardsPanel.classList.add('is-hidden');
  if (studentPanel) studentPanel.classList.add('is-hidden');
  if (epsPanel) epsPanel.classList.add('is-hidden');
  if (vizStage) vizStage.style.display = 'none';
  
  // Show K-anonymity panel
  const kanonPanel = document.getElementById('kanon-panel');
  if (kanonPanel) {
    kanonPanel.classList.remove('is-hidden');
    
    // Show specific visualization
    const targetViz = document.getElementById(vizId);
    if (targetViz) {
      targetViz.classList.add('is-active');
    }
  }
}

function enterStepKanonSarah() {
  state.sceneTitle = "Sarah's Medical Record";
  state.sceneSubtitle = "A typical hospital record";
  showKanonViz('kanon-viz-sarah');
  syncControlVisibility();
}

function enterStepKanonExposed() {
  state.sceneTitle = "Database Search";
  state.sceneSubtitle = "Anyone can identify Sarah";
  showKanonViz('kanon-viz-exposed');
  syncControlVisibility();
}

function enterStepKanonDefinition() {
  state.sceneTitle = "K-Anonymity Explained";
  state.sceneSubtitle = "Hide in a group of k people";
  showKanonViz('kanon-viz-definition');
  syncControlVisibility();
}

function enterStepKanonTransform() {
  state.sceneTitle = "Data Transformation";
  state.sceneSubtitle = "Exact → Ranges";
  showKanonViz('kanon-viz-transform');
  syncControlVisibility();
}

function enterStepKanonGroup() {
  state.sceneTitle = "Group Privacy";
  state.sceneSubtitle = "Sarah + 4 others = k=5";
  showKanonViz('kanon-viz-group');
  syncControlVisibility();
}

init();
