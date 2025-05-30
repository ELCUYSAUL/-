// Configuración
const adConfig = {
  interval: 1 * 60 * 1000, // 5 minutos en milisegundos
  duration: 20000, // 20 segundos en milisegundos
  videoPath: "assets/videos/anuncio.webm" // Ruta a tu video
};

// Elementos del DOM
const videoAd = document.getElementById("videoAd");
const adVideo = document.getElementById("adVideo");
const closeAdBtn = document.getElementById("closeAdBtn");
const countdownElement = document.getElementById("adCountdown");

let countdownInterval;
let adTimeout;

// Función para mostrar el anuncio
function showAd() {
  // Configurar la fuente del video
  adVideo.src = adConfig.videoPath;
  
  // Mostrar el contenedor
  videoAd.style.display = "flex";
  
  // Reproducir el video automáticamente
  adVideo.play().catch(e => console.log("Autoplay bloqueado:", e));
  
  // Iniciar cuenta regresiva
  startCountdown();
}

// Función para la cuenta regresiva
function startCountdown() {
  let secondsLeft = adConfig.duration / 1000;
  updateCountdown(secondsLeft);
  
  countdownInterval = setInterval(() => {
    secondsLeft--;
    updateCountdown(secondsLeft);
    
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      enableCloseButton();
    }
  }, 1000);
}

function updateCountdown(seconds) {
  countdownElement.textContent = `El anuncio puede cerrarse en ${seconds} segundos`;
}

function enableCloseButton() {
  closeAdBtn.disabled = false;
  countdownElement.textContent = "Puedes cerrar el anuncio ahora";
}

// Función para cerrar el anuncio
function closeAd() {
  // Detener el video
  adVideo.pause();
  adVideo.currentTime = 0;
  
  // Ocultar el anuncio
  videoAd.style.display = "none";
  
  // Reiniciar el botón
  closeAdBtn.disabled = true;
  
  // Limpiar intervalos
  clearInterval(countdownInterval);
  
  // Programar próximo anuncio
  scheduleNextAd();
}

// Programar próximo anuncio
function scheduleNextAd() {
  clearTimeout(adTimeout);
  adTimeout = setTimeout(showAd, adConfig.interval);
}

// Event Listeners
closeAdBtn.addEventListener("click", closeAd);

// Iniciar el sistema de anuncios al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  // Mostrar primer anuncio después de 5 minutos
  scheduleNextAd();
  
  // Opcional: Mostrar inmediatamente para pruebas
  // showAd();
});