/* Change this only if you print a new QR pass. */
const VALID_CODE = "AR-FPS-26.06.19-21";
const COUNT_KEY = "stageAccessCount2026";

let scanner = null;
let lastScan = "";
let lastScanAt = 0;

const countEl = document.getElementById("access-count");
const titleEl = document.getElementById("result-title");
const messageEl = document.getElementById("result-message");
const resultEl = document.getElementById("result");
const startButton = document.getElementById("start-button");

function getCount() { return Number(localStorage.getItem(COUNT_KEY) || 0); }
function showCount() { countEl.textContent = getCount(); }
function setResult(kind, title, message) {
  resultEl.className = `result ${kind}`;
  titleEl.textContent = title;
  messageEl.textContent = message;
}
function normalize(text) { return String(text || "").trim(); }
function onScanSuccess(decodedText) {
  const value = normalize(decodedText);
  const now = Date.now();
  if (value === lastScan && now - lastScanAt < 3500) return;
  lastScan = value; lastScanAt = now;

  if (value === VALID_CODE) {
    const next = getCount() + 1;
    localStorage.setItem(COUNT_KEY, String(next));
    showCount();
    setResult("valid", "VÁLIDO ✅", `Acceso registrado: ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
    navigator.vibrate?.([100, 60, 100]);
  } else {
    setResult("invalid", "NEGADO ❌", "Este código no está autorizado para acceso al escenario.");
    navigator.vibrate?.([200, 80, 200]);
  }
}
async function startScanner() {
  if (!window.Html5Qrcode) {
    setResult("invalid", "ERROR", "No se pudo cargar el escáner. Revise la conexión a internet e inténtelo de nuevo.");
    return;
  }
  startButton.disabled = true;
  startButton.textContent = "Escáner activo";
  scanner = new Html5Qrcode("reader");
  try {
    await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, () => {});
    document.getElementById("scanner-message").textContent = "Enfoque el código QR dentro del recuadro.";
  } catch (error) {
    startButton.disabled = false;
    startButton.textContent = "Iniciar escáner";
    setResult("invalid", "CÁMARA NO DISPONIBLE", "Permita el acceso a la cámara en el navegador e inténtelo de nuevo.");
  }
}
document.getElementById("reset-button").addEventListener("click", () => {
  if (confirm("¿Desea reiniciar el contador a cero?")) {
    localStorage.setItem(COUNT_KEY, "0"); showCount(); setResult("neutral", "LISTO", "El contador se reinició.");
  }
});
startButton.addEventListener("click", startScanner);
showCount();
