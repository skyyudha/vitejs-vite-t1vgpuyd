<script setup>
import { onMounted, ref } from 'vue';

// --- GENERATOR GALAKSI SPIRAL (MATH BASED) ---
const galaxyLayerSmall = ref('');
const galaxyLayerMedium = ref('');
const galaxyLayerLarge = ref('');

// Fungsi untuk membuat koordinat Spiral
const generateGalaxySpiral = (count, color) => {
  let shadows = [];
  const arms = 3; // Jumlah lengan spiral
  const spin = 10; // Faktor putaran

  for (let i = 0; i < count; i++) {
    // Distirbusi eksponensial agar padat di tengah
    const distance = Math.pow(Math.random(), 0.6) * 80; 
    
    // Perhitungan Sudut Spiral
    const armID = i % arms;
    const armOffset = (armID / arms) * 2 * Math.PI; 
    const spinOffset = (distance / 80) * spin; 
    
    // Random Scatter (Sebaran acak agar terlihat alami seperti gas)
    const scatter = Math.random() * (0.5 + distance / 15); 
    const angle = armOffset + spinOffset + (Math.random() > 0.5 ? scatter : -scatter);

    // Konversi ke koordinat CSS
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    shadows.push(`${x}vmax ${y}vmax ${color}`);
  }
  return shadows.join(',');
};

// --- BINTANG RAKSASA (DOM ELEMENTS) ---
// Bintang-bintang besar yang berkedip di lapisan teratas
const starsGiant = ref([]);
const generateGiantStars = (count) => Array.from({ length: count }, () => {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * 60;
  return {
    top: `calc(50% + ${Math.sin(angle) * dist}vmax)`, 
    left: `calc(50% + ${Math.cos(angle) * dist}vmax)`, 
    size: (Math.random() * 8 + 4) + 'px', 
    delay: Math.random() * 5 + 's',
    opacity: Math.random() * 0.5 + 0.5 
  }
});

onMounted(() => {
  // Generate 3 Lapisan Galaksi
  // 1. Dust Kecil (Dasar Ungu/Biru)
  galaxyLayerSmall.value = generateGalaxySpiral(2500, 'rgba(120, 100, 255, 0.5)');
  // 2. Bintang Sedang (Biru Muda)
  galaxyLayerMedium.value = generateGalaxySpiral(1000, 'rgba(200, 230, 255, 0.7)');
  // 3. Bintang Terang (Putih)
  galaxyLayerLarge.value = generateGalaxySpiral(300, '#FFFFFF');

  // Generate Bintang DOM (Paling Besar)
  starsGiant.value = generateGiantStars(60);
});
</script>

<template>
  <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#020305]">
    
    <div class="absolute inset-[-100%] flex items-center justify-center animate-galaxy-spin">
      
      <div class="absolute w-[20vmax] h-[20vmax] bg-white rounded-full blur-[80px] opacity-30 animate-pulse-slow z-0 mix-blend-screen"></div>
      
      <div class="absolute w-[100vmax] h-[100vmax] bg-radial-galaxy opacity-40 blur-3xl animate-spin-medium-reverse"></div>

      <div class="galaxy-dust" :style="{ boxShadow: galaxyLayerSmall, width: '1px', height: '1px' }"></div>
      <div class="galaxy-dust" :style="{ boxShadow: galaxyLayerMedium, width: '2px', height: '2px' }"></div>
      <div class="galaxy-dust" :style="{ boxShadow: galaxyLayerLarge, width: '3px', height: '3px' }"></div>

      <div class="absolute inset-0">
        <div v-for="(star, i) in starsGiant" :key="'g'+i" 
            class="absolute bg-blue-100 rounded-full shadow-[0_0_15px_2px_rgba(255,255,255,0.8)] animate-float"
            :style="{ top: star.top, left: star.left, width: star.size, height: star.size, opacity: star.opacity, animationDelay: star.delay }">
        </div>
      </div>

    </div>

    <div class="fixed inset-0 z-40 bg-vignette mix-blend-multiply pointer-events-none"></div>

  </div>
</template>

<style scoped>
/* RENDERING BINTANG */
.galaxy-dust {
  background: transparent;
  border-radius: 50%;
  position: absolute;
  left: 50%; 
  top: 50%;
}

/* WARNA LATAR GAS GALAKSI */
.bg-radial-galaxy {
  background: radial-gradient(
    circle at center, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(124, 58, 237, 0.2) 20%, /* Violet */
    rgba(16, 185, 129, 0.1) 40%, /* Emerald hint */
    rgba(30, 64, 175, 0.1) 60%, /* Blue */
    transparent 80%
  );
}

/* VIGNETTE */
.bg-vignette {
  background: radial-gradient(circle at center, transparent 20%, #000 100%);
}

/* ANIMASI ROTASI GALAKSI UTAMA */
.animate-galaxy-spin {
  animation: spin 240s linear infinite; /* 4 Menit per putaran penuh */
}

/* ANIMASI PENDUKUNG */
.animate-pulse-slow { animation: pulse 4s ease-in-out infinite alternate; }
.animate-spin-medium-reverse { animation: spin 180s linear infinite reverse; }
.animate-float { animation: float 8s ease-in-out infinite; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse { 0% { opacity: 0.3; scale: 0.9; } 100% { opacity: 0.5; scale: 1.1; } }
@keyframes float { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 1; } }
</style>