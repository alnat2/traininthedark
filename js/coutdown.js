export let countdown;
let timerDisplay;
function secondsToTimeLeftString(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const timeLeft = `${minutes}:${remainderSeconds < 10 ? '0' : '' }${remainderSeconds}`;
  return timeLeft;
}
function displayTimeLeft(seconds) {
  let timeLeft = secondsToTimeLeftString(seconds);
  timerDisplay.value = timeLeft;
}
function timer(seconds) {
  clearInterval(countdown);
  const now = Date.now();
  const then = now + seconds * 1000;
  let secondsLeft;
  displayTimeLeft(seconds);
  countdown = setInterval(() => {
      secondsLeft = Math.round((then - Date.now()) / 1000);
      if (secondsLeft < 0) {
          alert('time is over');
          clearInterval(countdown);
          return;
      }
      displayTimeLeft(secondsLeft);
  }, 1000);
}
export function timersRun(input) {
  if (input.value) {
    timerDisplay = input;
    let timerValue = parseInt(input.value);
    if (isNaN(timerValue)) {
        timerDisplay.value = "--:--";
        return;
    }
    timer(timerValue * 60);
  }
}