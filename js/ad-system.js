// Configuración avanzada
const adConfig = {
  interval: 5 * 60 * 1000, // 1 minuto (ajustable)
  duration: 20000, // 20 segundos
  videoAds: [
    "assets/videos/anuncio1.webm",
    "assets/videos/anuncio2.mp4",
    "assets/videos/anuncio3.mp4"
  ],
  imageAds: [
    "assets/images/anuncio1.jpg",
    "assets/images/anuncio2.png",
    "assets/images/anuncio3.gif"
  ],
  adTypes: ['video', 'image'], // Tipos de anuncios a rotar
  volume: 0.5 // Volumen predeterminado
};

// Elementos del DOM
const videoAd = document.getElementById("videoAd");
const adVideo = document.getElementById("adVideo");
const closeAdBtn = document.getElementById("closeAdBtn");
const countdownElement = document.getElementById("adCountdown");

const imageAd = document.getElementById("imageAd");
const adImage = document.getElementById("adImage");
const closeImageBtn = document.getElementById("closeImageBtn");
const imageCountdown = document.getElementById("imageCountdown");

let countdownInterval;
let adTimeout;
let currentAdType;

// Función para seleccionar anuncio aleatorio
function getRandomAd() {
  const adType = adConfig.adTypes[Math.floor(Math.random() * adConfig.adTypes.length)];
  currentAdType = adType;
  
  if (adType === 'video') {
    const randomVideo = adConfig.videoAds[Math.floor(Math.random() * adConfig.videoAds.length)];
    return { type: 'video', src: randomVideo };
  } else {
    const randomImage = adConfig.imageAds[Math.floor(Math.random() * adConfig.imageAds.length)];
    return { type: 'image', src: randomImage };
  }
}

// Función mejorada para mostrar anuncios
function showAd() {
  const ad = getRandomAd();
  
  if (ad.type === 'video') {
    // Configurar video
    adVideo.src = ad.src;
    adVideo.volume = adConfig.volume;
    adVideo.muted = false;
    adVideo.setAttribute('controls', '');
    adVideo.controlsList = 'nodownload noplaybackrate';
    
    // Mostrar contenedor de video
    videoAd.style.display = 'flex';
    imageAd.style.display = 'none';
    
    // Intentar reproducción
    adVideo.play().catch(e => {
      console.log("Autoplay bloqueado, silenciando...");
      adVideo.muted = true;
      adVideo.play()
        .then(_ => startCountdown('video'))
        .catch(e => console.error("Error al reproducir:", e));
    });
    
    startCountdown('video');
  } else {
    // Configurar imagen/GIF
    adImage.src = ad.src;
    
    // Mostrar contenedor de imagen
    imageAd.style.display = 'flex';
    videoAd.style.display = 'none';
    
    startCountdown('image');
  }
}

// Función para la cuenta regresiva
function startCountdown(type) {
  let secondsLeft = adConfig.duration / 1000;
  const element = type === 'video' ? countdownElement : imageCountdown;
  
  updateCountdown(element, secondsLeft);
  
  countdownInterval = setInterval(() => {
    secondsLeft--;
    updateCountdown(element, secondsLeft);
    
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      enableCloseButton(type);
    }
  }, 1000);
}

function updateCountdown(element, seconds) {
  element.textContent = `El anuncio puede cerrarse en ${seconds} segundos`;
}

function enableCloseButton(type) {
  if (type === 'video') {
    closeAdBtn.disabled = false;
    countdownElement.textContent = "Puedes cerrar el anuncio ahora";
  } else {
    closeImageBtn.disabled = false;
    imageCountdown.textContent = "Puedes cerrar el anuncio ahora";
  }
}

// Función para cerrar el anuncio
function closeAd(type) {
  if (type === 'video') {
    adVideo.pause();
    adVideo.currentTime = 0;
    videoAd.style.display = 'none';
    closeAdBtn.disabled = true;
  } else {
    imageAd.style.display = 'none';
    closeImageBtn.disabled = true;
  }
  
  clearInterval(countdownInterval);
  scheduleNextAd();
}

// Programar próximo anuncio
function scheduleNextAd() {
  clearTimeout(adTimeout);
  adTimeout = setTimeout(showAd, adConfig.interval);
}

// Event Listeners
closeAdBtn.addEventListener('click', () => closeAd('video'));
closeImageBtn.addEventListener('click', () => closeAd('image'));

// Iniciar sistema
window.addEventListener('DOMContentLoaded', () => {
  // Precargar anuncios
  preloadAds();
  scheduleNextAd();
});

// Precargar medios para mejor performance
function preloadAds() {
  [...adConfig.videoAds, ...adConfig.imageAds].forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = src.includes('.webm') || src.includes('.mp4') ? 'video' : 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}