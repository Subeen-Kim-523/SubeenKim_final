let kick;
let snare;
let hihat;
let billie;

let bpm = 117;
const stepsPerBeat = 2;
const numSteps = 8;

let intervalMs;
let lastTime = 0;
let started = false;
let step = 0;

// 슬라이더
let drumSlider;
let musicSlider;

function preload() {
  kick  = loadSound("data/kick.mp3");
  snare = loadSound("data/snare.mp3");
  hihat = loadSound("data/closed_hihat.mp3");              
  billie = loadSound("data/edit_2.mp3");  
}

function setup() {
  createCanvas(600, 380);
  textAlign(CENTER, CENTER);
  textSize(16);

  intervalMs = 60000 / (bpm * stepsPerBeat);

  // 🔉 드럼 볼륨 슬라이더 (0 ~ 100)
  drumSlider = createSlider(0, 100, 80);
  drumSlider.position(40, 20);   // 화면 기준 x,y (캔버스 왼쪽 위 기준은 아님!)
  drumSlider.style('width', '120px');

  // 🎵 음악 볼륨 슬라이더
  musicSlider = createSlider(0, 100, 80);
  musicSlider.position(40, 60);
  musicSlider.style('width', '120px');
}

function draw() {
  background(20);

  // 슬라이더 값 읽어서 볼륨 반영
  let drumVol  = drumSlider.value()  / 100.0;
  let musicVol = musicSlider.value() / 100.0;

  kick.setVolume(drumVol);
  snare.setVolume(drumVol);
  hihat.setVolume(drumVol);
  billie.setVolume(musicVol);

  // 슬라이더 라벨
  fill(200);
  textAlign(LEFT, CENTER);
  text("Drum Vol", drumSlider.x * 1 + drumSlider.width + 15, 20);
  text("Music Vol", musicSlider.x * 1 + musicSlider.width + 15, 60);
  textAlign(CENTER, CENTER);

  if (!started) {
    fill(255);
    text("캔버스를 클릭하면 Billie Jean + 드럼 + 시각화 시작", width / 2, 110);
  } else {
    fill(255);
    text(`BPM: ${bpm}   Step: ${step + 1} / ${numSteps}`, width / 2, 110);
  }

  // === 시각화 그리기 ===
  drawHihatCircle(width * 0.2, height * 0.30, 45, step);
  drawSnareCircle(width * 0.55, height * 0.30, 45, step);
  drawKickCircle(width * 0.5,  height * 0.72, 110, step);

  if (!started) return;

  // === 드럼 패턴 재생 타이밍 ===
  let now = millis();
  if (now - lastTime >= intervalMs) {
    lastTime += intervalMs;
    playPattern(step);
    step = (step + 1) % numSteps;
  }
}

// 패턴: 하이햇 전부, 킥 0/4, 스네어 2/6
function playPattern(step) {
  hihat.play();

  if (step === 0 || step === 4) {
    kick.play();
  }

  if (step === 2 || step === 6) {
    snare.play();
  }
}

// 각도 유틸
function angleForStep(i, N) {
  const angleStep = TWO_PI / N;
  const baseAngle = -HALF_PI;
  return baseAngle + i * angleStep;
}

// 하이햇: 8조각 전부, 현재 step 강조
function drawHihatCircle(cx, cy, r, currentStep) {
  const N = numSteps;
  noStroke();

  for (let i = 0; i < N; i++) {
    const startA = angleForStep(i, N);
    const endA   = angleForStep(i + 1, N);

    let col = color(80);
    if (i === currentStep) {
      col = color(200, 220, 80);
    }

    fill(col);
    arc(cx, cy, r * 2, r * 2, startA, endA, PIE);
  }

  fill(20);
  circle(cx, cy, r * 1.0);

  fill(230);
  text("Hihat", cx, cy + r + 18);
}

// 스네어: X 모양(1,3,5,7)
function drawSnareCircle(cx, cy, r, currentStep) {
  const N = numSteps;
  noStroke();

  for (let i = 0; i < N; i++) {
    const startA = angleForStep(i, N);
    const endA   = angleForStep(i + 1, N);

    const isSnareStep = (i === 1 || i === 3 || i === 5 || i === 7);

    let col;
    if (isSnareStep) {
      col = color(255, 120, 180);
    } else {
      col = color(40);
    }

    if (i === currentStep && isSnareStep) {
      col = lerpColor(col, color(255), 0.4);
    } else if (i === currentStep) {
      col = lerpColor(col, color(200), 0.2);
    }

    fill(col);
    arc(cx, cy, r * 2, r * 2, startA, endA, PIE);
  }

  fill(20);
  circle(cx, cy, r * 1.0);

  fill(230);
  text("Snare", cx, cy + r + 18);
}

// 킥: + 모양(0,2,4,6)
function drawKickCircle(cx, cy, r, currentStep) {
  const N = numSteps;
  noStroke();

  for (let i = 0; i < N; i++) {
    const startA = angleForStep(i, N);
    const endA   = angleForStep(i + 1, N);

    const isKickStep = (i === 0 || i === 2 || i === 4 || i === 6);

    let col;
    if (isKickStep) {
      col = color(120, 200, 255);
    } else {
      col = color(30);
    }

    if (i === currentStep && isKickStep) {
      col = lerpColor(col, color(255), 0.4);
    } else if (i === currentStep) {
      col = lerpColor(col, color(200), 0.2);
    }

    fill(col);
    arc(cx, cy, r * 2, r * 2, startA, endA, PIE);
  }

  fill(20);
  circle(cx, cy, r * 0.7);

  fill(230);
  text("Kick", cx, cy + r + 20);
}

function mousePressed() {
  userStartAudio();

  if (!started) {
    started = true;
    lastTime = millis();
    step = 0;
    billie.loop();
  }
}
