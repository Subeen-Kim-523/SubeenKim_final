let kick;
let snare;
let hihat;
let billie;

let bpm = 117;
const stepsPerBeat = 2;
const numSteps = 8;

let intervalMs;
let lastTime = 0;

let step = 0;
let playing = false;
let mode = "drums";

// 볼륨 슬라이더
let drumSlider;
let musicSlider;

// 모드/재생 버튼
let btnDrumsOnly;
let btnDrumsPlusMusic;
let btnPlayPause;

let kickPattern   = new Array(numSteps).fill(false);
let snarePattern  = new Array(numSteps).fill(false);
let hihatPattern  = new Array(numSteps).fill(false);

// 캔버스 크게!
const canvasW = 900;
const canvasH = 600;

// 원 위치 크게 재배치
const hihatCircle = { x: 0.28, y: 0.30, r: 70 };
const snareCircle = { x: 0.72, y: 0.30, r: 70 };
const kickCircle  = { x: 0.50, y: 0.68, r: 150 };

let visualOffsetSteps = 1; // 늦게 들리는 경우 조절

function preload() {
  kick  = loadSound("data/kick.mp3");
  snare = loadSound("data/snare.mp3");
  hihat = loadSound("data/closed_hihat.mp3");
  billie = loadSound("data/edit_2.mp3");
}

function setup() {
  createCanvas(canvasW, canvasH);
  textAlign(CENTER, CENTER);
  textSize(18);

  intervalMs = 60000 / (bpm * stepsPerBeat);

  // UI 재배치
  drumSlider = createSlider(0, 100, 80);
  drumSlider.position(40, canvasH - 150);
  drumSlider.style('width', '200px');

  musicSlider = createSlider(0, 100, 80);
  musicSlider.position(40, canvasH - 110);
  musicSlider.style('width', '200px');

  btnDrumsOnly = createButton("Drums Only");
  btnDrumsOnly.position(300, canvasH - 150);
  btnDrumsOnly.mousePressed(() => {
    mode = "drums";
    if (billie.isPlaying()) billie.stop();
  });

  btnDrumsPlusMusic = createButton("Drums + Music");
  btnDrumsPlusMusic.position(420, canvasH - 150);
  btnDrumsPlusMusic.mousePressed(() => {
    mode = "both";
  
    // ✅ 현재 재생 상태 초기화
    playing = false;          // 재생 상태 끄고
    if (billie.isPlaying()) { // 음악이 돌고 있으면 멈추고
      billie.stop();
    }
  
    // ✅ 타이밍/스텝 초기화
    step = 0;
    lastTime = millis();
  });
  
  btnPlayPause = createButton("Start / Pause");
  btnPlayPause.position(300, canvasH - 110);
  btnPlayPause.mousePressed(togglePlayPause);
}

function draw() {
  background(20);

  // 볼륨 반영
  let drumVol = drumSlider.value() / 100.0;
  let musicVol = musicSlider.value() / 100.0;

  kick.setVolume(drumVol);
  snare.setVolume(drumVol);
  hihat.setVolume(drumVol);
  billie.setVolume(musicVol);

  // 상태 표시
  fill(255);
  text(`Mode: ${mode} | ${playing ? "Playing" : "Paused"} | Step ${step + 1}/${numSteps}`, width / 2, 40);

  // 원 좌표 계산
  const hx = width * hihatCircle.x;
  const hy = height * hihatCircle.y;
  const hr = hihatCircle.r;

  const sx = width * snareCircle.x;
  const sy = height * snareCircle.y;
  const sr = snareCircle.r;

  const kx = width * kickCircle.x;
  const ky = height * kickCircle.y;
  const kr = kickCircle.r;

  // 시각화 오프셋 적용
  let displayStep = (step - visualOffsetSteps + numSteps) % numSteps;

  drawHihatCircle(hx, hy, hr, displayStep);
  drawSnareCircle(sx, sy, sr, displayStep);
  drawKickCircle(kx, ky, kr, displayStep);

  if (!playing) return;

  // 시퀀스 타이밍 처리
  let now = millis();
  if (now - lastTime >= intervalMs) {
    lastTime += intervalMs;
    playPattern(step);
    step = (step + 1) % numSteps;
  }
}

function togglePlayPause() {
    userStartAudio();
  
    if (!playing) {
      // ▶ Start
      playing = true;
      step = 0;               // ✅ 항상 0스텝부터 시작
      lastTime = millis();
  
      if (mode === "both") {
        if (billie.isPlaying()) billie.stop(); // 혹시 몰라서 한 번 끊고
        billie.loop();                         // 0초부터 다시
      } else {
        if (billie.isPlaying()) billie.stop(); // drums only 모드면 확실히 끔
      }
    } else {
      // ⏸ Pause
      playing = false;
      if (billie.isPlaying()) {
        billie.stop();
      }
    }
}
  
// ------- 패턴 재생 -------
function playPattern(s) {
  if (hihatPattern[s]) hihat.play();
  if (kickPattern[s])  kick.play();
  if (snarePattern[s]) snare.play();
}

// ------- 클릭 → 패턴 토글 -------
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
  if (idx !== -1) { hihatPattern[idx] = !hihatPattern[idx]; return; }

  idx = stepFromMouse(sx, sy, sr);
  if (idx !== -1) { snarePattern[idx] = !snarePattern[idx]; return; }

  idx = stepFromMouse(kx, ky, kr);
  if (idx !== -1) { kickPattern[idx] = !kickPattern[idx]; return; }
}

// ------- 도우미 함수들 -------
function angleForStep(i, N) {
  const angleStep = TWO_PI / N;
  const baseAngle = -HALF_PI;
  return baseAngle + i * angleStep;
}

function stepFromMouse(cx, cy, r) {
  const dx = mouseX - cx;
  const dy = mouseY - cy;
  const dist = sqrt(dx * dx + dy * dy);

  if (dist > r || dist < r * 0.35) return -1;

  let ang = atan2(dy, dx);
  const baseAngle = -HALF_PI;
  let a = ang - baseAngle;
  a = (a % TWO_PI + TWO_PI) % TWO_PI;

  const angleStep = TWO_PI / numSteps;
  let idx = floor(a / angleStep);
  return constrain(idx, 0, numSteps - 1);
}

// ------- 원 시각화 -------
function drawHihatCircle(cx, cy, r, currentStep) {
  noStroke();
  for (let i = 0; i < numSteps; i++) {
    const startA = angleForStep(i, numSteps);
    const endA   = angleForStep(i + 1, numSteps);

    let col = hihatPattern[i] ? color(200, 220, 80) : color(70);
    if (i === currentStep) col = lerpColor(col, color(255), 0.4);
    fill(col);
    arc(cx, cy, r*2, r*2, startA, endA, PIE);
  }
  fill(20); circle(cx, cy, r*0.9);
  fill(255); text("Hihat", cx, cy + r + 20);
}

function drawSnareCircle(cx, cy, r, currentStep) {
  noStroke();
  for (let i = 0; i < numSteps; i++) {
    const startA = angleForStep(i, numSteps);
    const endA   = angleForStep(i + 1, numSteps);

    let col = snarePattern[i] ? color(255, 120, 180) : color(60);
    if (i === currentStep) col = lerpColor(col, color(255), 0.4);
    fill(col);
    arc(cx, cy, r*2, r*2, startA, endA, PIE);
  }
  fill(20); circle(cx, cy, r*0.9);
  fill(255); text("Snare", cx, cy + r + 20);
}

function drawKickCircle(cx, cy, r, currentStep) {
  noStroke();
  for (let i = 0; i < numSteps; i++) {
    const startA = angleForStep(i, numSteps);
    const endA   = angleForStep(i + 1, numSteps);

    let col = kickPattern[i] ? color(120, 200, 255) : color(50);
    if (i === currentStep) col = lerpColor(col, color(255), 0.4);
    fill(col);
    arc(cx, cy, r*2, r*2, startA, endA, PIE);
  }
  fill(20); circle(cx, cy, r*0.8);
  fill(255); text("Kick", cx, cy + r + 25);
}
