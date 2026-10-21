// BASE DE DATOS INICIAL
const initialSongs = [
  {
    id: 1,
    title: "Chill Cat Beats",
    artist: "Gato Lo-Fi",
    album: "Gatitos Espaciales",
    genre: "Lo-Fi",
    cover: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Electronic Meow",
    artist: "DJ Paw",
    album: "Gatitos Espaciales",
    genre: "Electronic",
    cover: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Summer Purr",
    artist: "Kitty Pop",
    album: "Noches de Verano",
    genre: "Pop",
    cover: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

let songs = [...initialSongs];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;

// ELEMENTOS DOM
const audioPlayer = document.getElementById('audioPlayer');
const songGrid = document.getElementById('songGrid');
const playBtn = document.getElementById('playBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const playerImg = document.getElementById('playerImg');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const searchInput = document.getElementById('searchInput');

// WEB AUDIO API - EQUALIZADOR Y SINTETIZADOR
let audioCtx;
let trackSource;
let lowFilter, midFilter, highFilter;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    trackSource = audioCtx.createMediaElementSource(audioPlayer);

    // Filtros del Ecualizador
    lowFilter = audioCtx.createBiquadFilter();
    lowFilter.type = 'lowshelf';
    lowFilter.frequency.value = 60;

    midFilter = audioCtx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;

    highFilter = audioCtx.createBiquadFilter();
    highFilter.type = 'highshelf';
    highFilter.frequency.value = 14000;

    // Conectar nodos de Audio
    trackSource
      .connect(lowFilter)
      .connect(midFilter)
      .connect(highFilter)
      .connect(audioCtx.destination);
  }
}

// CAMBIO DE TEMA Y ESTILOS DE BOTONES PATITA DE GATO
function setTheme(colorName) {
  document.body.className = `theme-${colorName}`;
  document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.theme-btn-${colorName}`).classList.add('active');
}

// RENDERING DE CANCIONES EN PANTALLA
function renderSongs(songsToRender) {
  songGrid.innerHTML = '';
  songsToRender.forEach((song) => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      <img src="${song.cover}" class="song-img" alt="${song.title}">
      <h4>${song.title}</h4>
      <p>${song.artist} • ${song.album}</p>
      <div class="song-card-actions">
        <button class="paw-button paw-button-icon" onclick="playSongById(${song.id})">
          <i data-lucide="play"></i>
        </button>
        <button class="paw-button paw-button-icon" onclick="downloadSong('${song.url}', '${song.title}')">
          <i data-lucide="download"></i>
        </button>
      </div>
    `;
    songGrid.appendChild(card);
  });
  lucide.createIcons();
}

// CONTROLES DE REPRODUCCIÓN
function loadSong(song) {
  audioPlayer.src = song.url;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  playerImg.src = song.cover;
}

function playSongById(id) {
  initAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const index = songs.findIndex(s => s.id === id);
  if (index !== -1) {
    currentSongIndex = index;
    loadSong(songs[currentSongIndex]);
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
  }
}

function togglePlay() {
  initAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (!audioPlayer.src) {
    loadSong(songs[0]);
  }

  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
  } else {
    audioPlayer.play();
    isPlaying = true;
  }
  updatePlayButton();
}

function updatePlayButton() {
  playBtn.innerHTML = isPlaying ? `<i data-lucide="pause"></i>` : `<i data-lucide="play"></i>`;
  lucide.createIcons();
}

function playNext() {
  if (isShuffle) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  }
  loadSong(songs[currentSongIndex]);
  if (isPlaying) audioPlayer.play();
}

function playPrev() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(songs[currentSongIndex]);
  if (isPlaying) audioPlayer.play();
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.style.opacity = isShuffle ? '1' : '0.5';
  shuffleBtn.title = isShuffle ? "Modo: Aleatorio" : "Modo: Lineal";
}

// DESCARGA DE CANCIONES
function downloadSong(url, name) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.mp3`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function downloadCurrent() {
  if (songs[currentSongIndex]) {
    downloadSong(songs[currentSongIndex].url, songs[currentSongIndex].title);
  }
}

// FILTROS Y BÚSQUEDA
function filterGenre(genre, element) {
  document.querySelectorAll('#genreCarousel .carousel-card').forEach(c => c.classList.remove('active'));
  element.classList.add('active');

  if (genre === 'Todos') {
    renderSongs(songs);
  } else {
    renderSongs(songs.filter(s => s.genre === genre));
  }
}

function filterAlbum(album, element) {
  document.querySelectorAll('#albumCarousel .carousel-card').forEach(c => c.classList.remove('active'));
  element.classList.add('active');

  if (album === 'Todos') {
    renderSongs(songs);
  } else {
    renderSongs(songs.filter(s => s.album === album));
  }
}

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = songs.filter(s => 
    s.title.toLowerCase().includes(query) ||
    s.artist.toLowerCase().includes(query) ||
    s.genre.toLowerCase().includes(query) ||
    s.album.toLowerCase().includes(query)
  );
  renderSongs(filtered);
});

// SUBIR ARCHIVOS DE MÚSICA
document.getElementById('audioUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const newSong = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      artist: "Artista Personalizado",
      album: "Mi Colección",
      genre: "Personalizado",
      cover: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400",
      url: URL.createObjectURL(file)
    };
    songs.unshift(newSong);
    renderSongs(songs);
    playSongById(newSong.id);
  }
});

// ACTUALIZACIÓN DE BARRA DE PROGRESO
audioPlayer.addEventListener('timeupdate', () => {
  if (audioPlayer.duration) {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    durationTimeEl.textContent = formatTime(audioPlayer.duration);
  }
});

audioPlayer.addEventListener('ended', () => {
  playNext();
});

progressBar.addEventListener('input', () => {
  if (audioPlayer.duration) {
    audioPlayer.currentTime = (progressBar.value / 100) * audioPlayer.duration;
  }
});

function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// MANEJO DE ECUALIZADOR (EVENTOS)
document.getElementById('eqLow').addEventListener('input', (e) => {
  initAudioContext();
  if (lowFilter) lowFilter.gain.value = e.target.value;
  document.getElementById('eqLowVal').textContent = `${e.target.value} dB`;
});

document.getElementById('eqMid').addEventListener('input', (e) => {
  initAudioContext();
  if (midFilter) midFilter.gain.value = e.target.value;
  document.getElementById('eqMidVal').textContent = `${e.target.value} dB`;
});

document.getElementById('eqHigh').addEventListener('input', (e) => {
  initAudioContext();
  if (highFilter) highFilter.gain.value = e.target.value;
  document.getElementById('eqHighVal').textContent = `${e.target.value} dB`;
});

// SINTETIZADOR DE SONIDO (WEBAUDIO)
document.querySelectorAll('.synth-key').forEach(key => {
  key.addEventListener('click', () => {
    const freq = parseFloat(key.getAttribute('data-note'));
    playSynthNote(freq);
  });
});

function playSynthNote(freq) {
  const ctx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}

// INICIALIZACIÓN
window.addEventListener('DOMContentLoaded', () => {
  renderSongs(songs);
  loadSong(songs[0]);
  shuffleBtn.style.opacity = '0.5';
});