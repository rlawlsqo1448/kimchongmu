let allStages = [];
let selectedStages = [];
let currentStageIndex = 0;
let selectedValues = [];
let timerInterval;
let timeLeft;

function startGame() {
  fetch("problems.json")
    .then(response => response.json())
    .then(data => {
      allStages = data;
      selectedStages = shuffleArray(allStages).slice(0, 7); // 랜덤 7문제 선택
      currentStageIndex = 0;
      document.getElementById('start-screen').classList.remove('active');
      document.getElementById('end-screen').classList.remove('active');
      document.getElementById('game-screen').classList.add('active');
      loadStage(selectedStages[currentStageIndex]);
    })
    .catch(error => {
      alert("문제 불러오기 실패!");
      console.error(error);
    });
}

function loadStage(stage) {
  selectedValues = [];
  document.getElementById('question-text').innerText =
    `${stage.title}\n(목표: ${stage.target}${stage.unit}, 오차 ±10%)`;

  const choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';
  stage.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerText = `${choice.name}`; // value 안보이게
    btn.onclick = () => toggleChoice(btn, choice.value);
    choicesDiv.appendChild(btn);
  });

  startTimer(stage.time);
  window.currentStageData = stage;
}

function toggleChoice(button, value) {
  if (button.classList.contains('selected')) {
    button.classList.remove('selected');
    selectedValues = selectedValues.filter(v => v !== value);
  } else {
    button.classList.add('selected');
    selectedValues.push(value);
  }
}

function startTimer(seconds) {
  timeLeft = seconds;
  const timerBar = document.getElementById('timer-bar');
  timerBar.style.width = '100%';
  timerBar.style.backgroundColor = 'green';
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    const percent = (timeLeft / seconds) * 100;
    timerBar.style.width = percent + '%';
    timerBar.style.backgroundColor = percent < 50 ? (percent < 20 ? 'red' : 'orange') : 'green';
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitAnswer();
    }
  }, 1000);
}

function submitAnswer() {
  clearInterval(timerInterval);
  const stage = window.currentStageData;
  const sum = selectedValues.reduce((a, b) => a + b, 0);
  const lowerBound = stage.target * 0.9;
  const upperBound = stage.target * 1.1;

  if (sum >= lowerBound && sum <= upperBound) {
    currentStageIndex++;
    if (currentStageIndex < selectedStages.length) {
      alert(`정답입니다! (${sum}${stage.unit})\n다음 문제로 넘어갑니다.`);
      loadStage(selectedStages[currentStageIndex]);
    } else {
      document.getElementById('game-screen').classList.remove('active');
      document.getElementById('end-screen').classList.add('active');
      document.getElementById('end-message').innerText = `축하합니다! 모든 문제를 맞췄어요!`;
    }
  } else {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('end-screen').classList.add('active');
    document.getElementById('end-message').innerText = `실패! 합계는 ${sum}${stage.unit}였어요.`;
  }
}

function restartGame() {
  startGame();
}

function goToStart() {
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('end-screen').classList.remove('active');
  document.getElementById('start-screen').classList.add('active');
}

function showHowTo() {
  alert("제시된 목표치에 맞게 선택지를 골라 그 합이 오차범위 내에 들어오도록 하세요! 시간 안에!");
}

function showRecords() {
  alert("기록 저장 기능은 추후 추가 예정!");
}

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
