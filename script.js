import storybookSceneUrl from "./storybook-scene.png";
import storybookWinSceneUrl from "./storybook-win-scene.png";

const PASSWORD = "7609";
const MAX_DIGITS = 4;
const RESET_DELAY_MS = 900;
const WIN_SCENE_DELAY_MS = 500;

const slots = Array.from(document.querySelectorAll("[data-slot]"));
const keypad = document.querySelector(".keypad-grid");
const statusText = document.getElementById("status-text");
const winBanner = document.getElementById("win-banner");
const replayButton = document.getElementById("replay-button");
const sparkleBurst = document.getElementById("sparkle-burst");
const errorPopup = document.getElementById("error-popup");
const sceneImage = document.querySelector(".scene-image");
const scenePreload = document.querySelector(".scene-preload");

let currentInput = "";
let isLocked = false;
let isUnlocked = false;

function renderSlots(state = "") {
  slots.forEach((slot, index) => {
    const digit = currentInput[index];
    slot.textContent = digit ?? "";
    slot.classList.toggle("filled", Boolean(digit));
    slot.classList.toggle("error", state === "error");
    slot.classList.toggle("success", state === "success");
  });
}

function setStatus(message) {
  statusText.textContent = message;
}

function setLockedState(nextState) {
  isLocked = nextState;
  keypad.querySelectorAll("button").forEach((button) => {
    button.disabled = nextState && !isUnlocked;
  });
}

function clearInput() {
  currentInput = "";
  renderSlots();
}

function setScene(mode = "default") {
  if (!sceneImage) {
    return;
  }

  const nextSrc = mode === "win" ? storybookWinSceneUrl : storybookSceneUrl;

  if (nextSrc) {
    sceneImage.src = nextSrc;
  }
}

function flashError() {
  document.body.classList.remove("show-error-popup");
  void document.body.offsetWidth;
  document.body.classList.add("show-error-popup");
  errorPopup?.setAttribute("aria-hidden", "false");

  setStatus("Hãy thử lại với mã khác.");
  setLockedState(true);

  window.setTimeout(() => {
    document.body.classList.remove("show-error-popup");
    errorPopup?.setAttribute("aria-hidden", "true");
    clearInput();
    setLockedState(false);
    setStatus("Nhập lại mã 4 số để giải cứu Cinderella.");
  }, RESET_DELAY_MS);
}

function unlockCastle() {
  isUnlocked = true;
  renderSlots("success");
  setStatus("Chính xác! Chờ một chút, Cinderella đang được giải cứu.");
  setLockedState(true);

  window.setTimeout(() => {
    document.body.classList.add("unlocked");
    setScene("win");
    setStatus("Thành công! Cánh cửa đã mở, Cinderella đã được cứu.");
    winBanner.setAttribute("aria-hidden", "false");
    sparkleBurst.setAttribute("aria-hidden", "false");
  }, WIN_SCENE_DELAY_MS);
}

function checkPassword() {
  if (currentInput !== PASSWORD) {
    flashError();
    return;
  }

  unlockCastle();
}

function addDigit(digit) {
  if (isLocked || isUnlocked || currentInput.length >= MAX_DIGITS) {
    return;
  }

  currentInput += digit;
  renderSlots();

  if (currentInput.length === MAX_DIGITS) {
    checkPassword();
  } else {
    setStatus(`Đã nhập ${currentInput.length}/4 chữ số. Tiếp tục đi.`);
  }
}

function deleteDigit() {
  if (isLocked || isUnlocked || currentInput.length === 0) {
    return;
  }

  currentInput = currentInput.slice(0, -1);
  renderSlots();
  setStatus(
    currentInput.length
      ? `Còn ${MAX_DIGITS - currentInput.length} ô trống. Bạn có thể nhập tiếp.`
      : "Đã xóa hết số. Nhập mã mới để tiếp tục."
  );
}

function resetGame() {
  currentInput = "";
  isLocked = false;
  isUnlocked = false;
  document.body.classList.remove("unlocked", "show-error-popup");
  keypad.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
  });
  setScene("default");
  renderSlots();
  setStatus("Hãy nhập mã 4 số để mở khóa và cứu Cinderella.");
  winBanner.setAttribute("aria-hidden", "true");
  sparkleBurst.setAttribute("aria-hidden", "true");
  errorPopup?.setAttribute("aria-hidden", "true");
}

function handleAction(action) {
  if (action === "delete") {
    deleteDigit();
    return;
  }

  if (action === "reset") {
    resetGame();
  }
}

replayButton?.addEventListener("click", () => {
  resetGame();
});

keypad.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  const digit = target.dataset.key;
  const action = target.dataset.action;

  if (digit) {
    addDigit(digit);
  } else if (action) {
    handleAction(action);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key >= "0" && event.key <= "9") {
    addDigit(event.key);
    return;
  }

  if (event.key === "Backspace") {
    deleteDigit();
    return;
  }

  if (event.key === "Escape" || event.key.toLowerCase() === "r") {
    resetGame();
  }
});

renderSlots();
setScene("default");
if (scenePreload) {
  scenePreload.src = storybookWinSceneUrl;
}
winBanner.setAttribute("aria-hidden", "true");
sparkleBurst.setAttribute("aria-hidden", "true");
errorPopup?.setAttribute("aria-hidden", "true");
