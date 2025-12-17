let kick;
let snare;
let hihat;
let billie;

const stepsPerBeat = 2;
const numSteps = 8;

let intervalMs;
let lastTime = 0;

let step = 0;
let playing = false; // Is it playing now?
let mode = "none"; // "none" | "drums" | "both"

// Volume sliders
let drumSlider;
let musicSlider;

// Buttons for mode selection
let btnDrumsOnly;
let btnDrumsPlusMusic;

// Arrays for pattern
let kickPattern   = new Array(numSteps).fill(false);
let snarePattern  = new Array(numSteps).fill(false);
let hihatPattern  = new Array(numSteps).fill(false);

// canvas size
const canvasW = 900;
const canvasH = 600;

const hihatCircle = { x: 0.15, y: 0.40, r: 70 };
const snareCircle = { x: 0.15, y: 0.75, r: 70 };
const kickCircle  = { x: 0.45, y: 0.6, r: 150 };

// visallize offest steps
let visualOffsetSteps = 1;

const fixedMusicBpm = 117;   // force BPM for Drum + Music
let bpm = fixedMusicBpm;
let bpmSlider;

let labelBpm, labelDrum, labelMusic;


// Button design
function styleSquareButton(btn, color) {
    btn.style('width', '80px');
    btn.style('height', '80px');
    btn.style('background', '#0B0F14');
    btn.style('border', `2px solid ${color}`);
    btn.style('color', color);
    btn.style('font-family', 'Supercharge');
    btn.style('font-size', '14px');
    btn.style('letter-spacing', '1px');
    btn.style('text-transform', 'uppercase');
    btn.style('cursor', 'pointer');
    btn.style('border-radius', '8px');
    btn.style('padding', '0');
}
  


function preload() {
  kick  = loadSound("data/kick.mp3");
  snare = loadSound("data/snare.mp3");
  hihat = loadSound("data/closed_hihat.mp3");
  billie = loadSound("data/edit_2.mp3");

  font = loadFont('data/SuperchargeCondensed-jE5KO.otf');
}


function setup() {
    createCanvas(canvasW, canvasH);
    textAlign(CENTER, CENTER);
    textSize(18);
  
    intervalMs = 60000 / (bpm * stepsPerBeat);
  
    // volume control
    drumSlider = createSlider(0, 100, 80);
    drumSlider.position(canvasW * 0.75, canvasH * 0.7);
    drumSlider.style('width', '200px');

  
    musicSlider = createSlider(0, 100, 80);
    musicSlider.position(canvasW * 0.75, canvasH * 0.75);
    musicSlider.style('width', '200px');

    // BPM slider (visable at drum only mode)
    bpmSlider = createSlider(60, 180, bpm, 1);
    bpmSlider.position(canvasW * 0.75, canvasH * 0.65);
    bpmSlider.style('width', '200px');
    bpmSlider.hide(); 
  

    // Drums Only Button
    btnDrumsOnly = createButton("Drums<br>Only");
    btnDrumsOnly.position(canvasW - 250, canvasH * 0.35);
    styleSquareButton(btnDrumsOnly, '#4D96FF');
    btnDrumsOnly.mousePressed(onDrumsOnlyClicked);
  
    // Drums + Music Button
    btnDrumsPlusMusic = createButton("Drums<br>Music");
    btnDrumsPlusMusic.position(canvasW - 160, canvasH * 0.35);
    styleSquareButton(btnDrumsPlusMusic, '#C77DFF');
    btnDrumsPlusMusic.mousePressed(onDrumsPlusMusicClicked);
  

    // --- Labels for Sliders ---
    labelBpm = createDiv("BPM");
    labelBpm.position(canvasW * 0.65, canvasH * 0.65);
    labelBpm.style("color", "#FFFFFF");
    labelBpm.style('font-family', 'Supercharge');
    labelBpm.style("font-size", "14px");
    labelBpm.style("letter-spacing", "1px");

    labelDrum = createDiv("DRUM VOL");
    labelDrum.position(canvasW * 0.65, canvasH * 0.7);
    labelDrum.style("color", "#FFFFFF");
    labelDrum.style('font-family', 'Supercharge');
    labelDrum.style("font-size", "14px");
    labelDrum.style("letter-spacing", "1px");

    labelMusic = createDiv("MUSIC VOL");
    labelMusic.position(canvasW * 0.65, canvasH * 0.75);
    labelMusic.style("color", "#FFFFFF");
    labelMusic.style('font-family', 'Supercharge');
    labelMusic.style("font-size", "14px");
    labelMusic.style("letter-spacing", "1px");
  }
  

function draw() {
  //background(20);
  background('#0B0F14');


  fill("#fff700");
  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(50);
  text("Pick your Rhythm!", width / 2 + 2, 50);


  fill("#F715AB");
  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(50);
  text("Pick your Rhythm!", width / 2, 50);


  fill("#ffffff");
  textFont(font);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("CONTROL", canvasW * 0.8, canvasH * 0.6 - 10);

  // Volume Settings
  const drumVol  = drumSlider.value()/100.0;
  const musicVol = musicSlider.value()/100.0;
  kick.setVolume(drumVol);
  snare.setVolume(drumVol);
  hihat.setVolume(drumVol);
  billie.setVolume(musicVol);
  
  // --- Change UI + Mode by BPM --- //
    let modeLabel = "None";
    if (mode === "drums") {
        modeLabel = "Drums Only";
      
        bpmSlider.show();
        labelBpm.show();
      
        musicSlider.hide();
        labelMusic.hide();
      
        drumSlider.show();
        labelDrum.show();
      
        bpm = bpmSlider.value();
      
      } else if (mode === "both") {
        modeLabel = "Drums + Music";
      
        bpmSlider.hide();
        labelBpm.hide();
      
        musicSlider.show();
        labelMusic.show();
      
        drumSlider.show();
        labelDrum.show();
      
        bpm = fixedMusicBpm;
        bpmSlider.value(bpm);
      
      } else {
        // mode === "none"
        bpmSlider.hide();
        labelBpm.hide();
      
        musicSlider.hide();
        labelMusic.hide();
      
        drumSlider.hide();
        labelDrum.hide();
      
        bpm = fixedMusicBpm;
      }
      

    // Navigate (Mode/BPM)
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(30);
    text(`Mode: ${modeLabel}     BPM: ${bpm}`, width / 2, 110);


  intervalMs = 60000 / (bpm * stepsPerBeat);


  // circle center positions
  const hx = width * hihatCircle.x;
  const hy = height * hihatCircle.y;
  const hr = hihatCircle.r;

  const sx = width * snareCircle.x;
  const sy = height * snareCircle.y;
  const sr = snareCircle.r;

  const kx = width * kickCircle.x;
  const ky = height * kickCircle.y;
  const kr = kickCircle.r;

  const displayStep = (step - visualOffsetSteps + numSteps) % numSteps;

  drawHihatCircle(hx, hy, hr, displayStep);
  drawSnareCircle(sx, sy, sr, displayStep);
  drawKickCircle(kx, ky, kr, displayStep);

  if (!playing) return;

  const now = millis();
  if (now - lastTime >= intervalMs) {
    lastTime += intervalMs;
    playPattern(step);
    step = (step + 1) % numSteps;
  }
}

// ====  Mode button handlers ==== //

// Drums Only button: toggle
function onDrumsOnlyClicked() {
  userStartAudio();

  if (playing && mode === "drums") {
    stopAll();
    mode = "none";
  } else {
    stopAll();
    mode = "drums";
    startFromBeginning(withMusic = false);  // without music
  }
}

// Drums + Music 버튼: 토글
function onDrumsPlusMusicClicked() {
  userStartAudio();

  if (playing && mode === "both") {
    stopAll();
    mode = "none";
  } else {
    stopAll();
    mode = "both";
    startFromBeginning(withMusic = true);   // With music
  }
}

// Starts from beginning, step 0
function startFromBeginning(withMusic) {
  step = 0;
  lastTime = millis();
  playing = true;

  if (withMusic) {
    billie.loop(); 
  }
}

// Stop all playback
function stopAll() {
  playing = false;
  step = 0;
  if (billie.isPlaying()) {
    billie.stop();
  }
}

// ==== Pattern playback === // 

function playPattern(s) {
  if (hihatPattern[s]) hihat.play();
  if (kickPattern[s])  kick.play();
  if (snarePattern[s]) snare.play();
}

function angleForStep(i, N) {
  const angleStep = TWO_PI / N;
  const baseAngle = -HALF_PI;
  return baseAngle + i * angleStep;
}

function stepFromMouse(cx, cy, r) {
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > r || dist < r * 0.35) return -1;

  let ang = Math.atan2(dy, dx);
  const baseAngle = -HALF_PI;
  let a = ang - baseAngle;
  a = (a % TWO_PI + TWO_PI) % TWO_PI;

  const angleStep = TWO_PI / numSteps;
  let idx = Math.floor(a / angleStep);
  idx = constrain(idx, 0, numSteps - 1);
  return idx;
}

// Click -> Pattern toggle
function mousePressed() {
  userStartAudio();

  const hx = width * hihatCircle.x;
  const hy = height * hihatCircle.y;
  const hr = hihatCircle.r;

  const sx = width * snareCircle.x;
  const sy = height * snareCircle.y;
  const sr = snareCircle.r;

  const kx = width * kickCircle.x;
  const ky = height * kickCircle.y;
  const kr = kickCircle.r;

  let idx = stepFromMouse(hx, hy, hr);
  if (idx !== -1) {
    hihatPattern[idx] = !hihatPattern[idx];
    return;
  }

  idx = stepFromMouse(sx, sy, sr);
  if (idx !== -1) {
    snarePattern[idx] = !snarePattern[idx];
    return;
  }

  idx = stepFromMouse(kx, ky, kr);
  if (idx !== -1) {
    kickPattern[idx] = !kickPattern[idx];
    return;
  }
}

// ----- Visualize circles (Drum) ------ // 

function drawHihatCircle(cx, cy, r, currentStep) {
  noStroke();
  for (let i = 0; i < numSteps; i++) {
    const startA = angleForStep(i, numSteps);
    const endA   = angleForStep(i + 1, numSteps);

    let col = hihatPattern[i] ? color(200, 220, 80) : color(70);
    if (i === currentStep) {
      col = lerpColor(col, color(255), 0.4);
    }
    fill(col);
    arc(cx, cy, r * 2, r * 2, startA, endA, PIE);
  }
  fill(20);
  circle(cx, cy, r * 0.9);
  fill(255);
  text("Hihat", cx, cy + r + 20);
}

function drawSnareCircle(cx, cy, r, currentStep) {
  noStroke();
  for (let i = 0; i < numSteps; i++) {
    const startA = angleForStep(i, numSteps);
    const endA   = angleForStep(i + 1, numSteps);

    let col = snarePattern[i] ? color(255, 120, 180) : color(60);
    if (i === currentStep) {
      col = lerpColor(col, color(255), 0.4);
    }
    fill(col);
    arc(cx, cy, r * 2, r * 2, startA, endA, PIE);
  }
  fill(20);
  circle(cx, cy, r * 0.9);
  fill(255);
  text("Snare", cx, cy + r + 20);
}

function drawKickCircle(cx, cy, r, currentStep) {
  noStroke();
  for (let i = 0; i < numSteps; i++) {
    const startA = angleForStep(i, numSteps);
    const endA   = angleForStep(i + 1, numSteps);

    let col = kickPattern[i] ? color(120, 200, 255) : color(50);
    if (i === currentStep) {
      col = lerpColor(col, color(255), 0.4);
    }
    fill(col);
    arc(cx, cy, r * 2, r * 2, startA, endA, PIE);
  }
  fill(20);
  circle(cx, cy, r * 0.8);
  fill(255);
  text("Kick", cx, cy + r + 25);
}
