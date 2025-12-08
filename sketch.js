let kick;
let snare;
let hihat;
let billie;

// Billie Jean BPM
let bpm = 117;

// 리듬 그리드
const stepsPerBeat = 2;   // 1박자당 2스텝 = 8분음표
const numSteps = 8;       // 1마디 = 8스텝 (1,1&,2,2&,3,3&,4,4&)

let intervalMs;           // 한 스텝 간격(ms)
let lastTime = 0;
let started = false;

let step = 0;             // 0~7

function preload() {
  kick  = loadSound("data/kick.mp3");
  snare = loadSound("data/snare.mp3");
  hihat = loadSound("data/closed_hihat.mp3");
  billie = loadSound("data/edit_2.mp3");
}

function setup() {
  createCanvas(400, 200);
  textAlign(CENTER, CENTER);
  textSize(18);

  // 1스텝 = 8분음표 간격
  intervalMs = 60000 / (bpm * stepsPerBeat);
}

function draw() {
  background(20);
  fill(255);

  if (!started) {
    text("클릭하면 Billie Jean + 드럼 패턴 같이 시작", width / 2, height / 2);
    return;
  }

  text(`BPM: ${bpm}\nStep: ${step + 1} / ${numSteps}`, width / 2, height / 2);

  let now = millis();

  // 일정 시간(intervalMs) 지날 때마다 다음 스텝으로
  if (now - lastTime >= intervalMs) {
    lastTime += intervalMs;
    playPattern(step);
    step = (step + 1) % numSteps;
  }
}

// Billie Jean 기본 그루브 느낌
// step: 0 1 2 3 4 5 6 7
// 의미: 1 & 2 & 3 & 4 &
//
// - 하이햇: 모든 스텝
// - 킥: 1, 3박  → step 0, 4
// - 스네어: 2, 4박 → step 2, 6
function playPattern(step) {
  // 하이햇: 계속 찍음 (8분음표)
  hihat.play();

  // 킥
  if (step === 0 || step === 4) {
    kick.play();
  }

  // 스네어
  if (step === 2 || step === 6) {
    snare.play();
  }
}

// 첫 클릭 → 노래 + 드럼 동시에 스타트
function mousePressed() {
  userStartAudio();  // 브라우저 오디오 정책 해제

  if (!started) {
    started = true;
    lastTime = millis();
    step = 0;

    billie.loop();   // Billie Jean 재생 시작
    // 드럼은 1박(8분음표 2개) 지난 뒤부터 들어옴
  }
}
