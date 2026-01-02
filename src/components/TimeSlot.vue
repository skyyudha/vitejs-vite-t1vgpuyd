<script setup>
import { computed } from 'vue';

const props = defineProps({
  time: String,
  activity: Object,
  isNow: Boolean,
  mode: String // 'dark', 'light', atau 'space'
});

const emit = defineEmits(['clickSlot']);

// WARNA TEKS JAM
const timeClass = computed(() => {
  if (props.isNow) return 'text-blue-500 scale-110';
  if (props.mode === 'light') return 'text-slate-600 group-hover:text-slate-900';
  return 'text-slate-500 group-hover:text-slate-300'; // Dark & Space
});

// WARNA GARIS VERTIKAL
const lineClass = computed(() => {
  if (props.mode === 'light') return 'bg-slate-200 group-hover:bg-slate-300';
  if (props.mode === 'space') return 'bg-white/10 group-hover:bg-white/20';
  return 'bg-slate-800 group-hover:bg-slate-700';
});

// WARNA KARTU KEGIATAN (Dynamic based on Mode)
const cardColor = computed(() => {
  // --- KARTU KOSONG ---
  if (!props.activity) {
    if (props.mode === 'light') return 'bg-transparent border-dashed border border-slate-300 opacity-50 hover:opacity-100 hover:bg-slate-50';
    if (props.mode === 'space') return 'bg-transparent border-dashed border border-white/20 opacity-30 hover:opacity-80 hover:bg-white/5 hover:border-white/40';
    return 'bg-transparent border-dashed border border-slate-800 opacity-40 hover:opacity-100 hover:border-slate-600 hover:bg-slate-900';
  }
  
  // --- KARTU TERISI ---
  const cat = props.activity.category;
  
  // LIGHT MODE COLORS (Clean & Bright)
  if (props.mode === 'light') {
    switch (cat) {
      case 'work': return 'bg-blue-700 text-white shadow-md shadow-blue-200 border-l-4 border-blue-900';
      case 'growth': return 'bg-indigo-100 text-indigo-900 border-l-4 border-indigo-500';
      case 'health': return 'bg-emerald-100 text-emerald-900 border-l-4 border-emerald-500';
      case 'personal': return 'bg-slate-100 text-slate-800 border-l-4 border-slate-500';
      default: return 'bg-amber-100 text-amber-900 border-l-4 border-amber-500';
    }
  }

  // DARK & SPACE COLORS (Glow & Glassy)
  // Space mode gets extra glass effect
  const glass = props.mode === 'space' ? 'backdrop-blur-md' : '';
  
  switch (cat) {
    case 'work': return `bg-blue-600 text-white shadow-lg shadow-blue-900/40 border-l-4 border-blue-300 ${glass}`;
    case 'growth': return `bg-indigo-900/50 text-indigo-100 border-l-4 border-indigo-500 hover:bg-indigo-900/70 ${glass}`;
    case 'health': return `bg-emerald-900/40 text-emerald-100 border-l-4 border-emerald-500 hover:bg-emerald-900/60 ${glass}`;
    case 'personal': return `bg-slate-800 text-slate-300 border-l-4 border-slate-500 hover:bg-slate-750 ${glass}`;
    default: return `bg-amber-900/40 text-amber-100 border-l-4 border-amber-500 hover:bg-amber-900/60 ${glass}`;
  }
});

// WARNA TEKS KATEGORI KECIL
const categoryTextClass = computed(() => {
   if (props.mode === 'light' && props.activity?.category !== 'work') return 'text-slate-500 font-bold';
   if (props.activity?.category === 'work') return 'text-blue-200 opacity-100';
   return 'opacity-70';
})
</script>

<template>
  <div class="flex group relative pl-2 md:pl-0">
    
    <div class="w-14 flex flex-col items-center flex-shrink-0 relative mr-3">
      <span :class="['text-[11px] font-bold py-2 tracking-wider transition-colors font-mono', timeClass]">
        {{ time }}
      </span>
      <div :class="['h-full w-[2px] relative flex items-center justify-center transition-colors', lineClass]">
        <div :class="[
          'w-2.5 h-2.5 rounded-full border-[2px] absolute top-0 transition-all box-content', 
          activity 
            ? (mode==='light' ? 'bg-white border-slate-400' : 'bg-slate-900 border-slate-600') 
            : (mode==='space' ? 'bg-black border-white/20' : (mode==='light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800')),
          isNow ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-500/20 z-10 scale-125' : ''
        ]"></div>
      </div>
    </div>

    <div class="flex-1 pb-3 pr-2 cursor-pointer relative z-1" @click="$emit('clickSlot')">
      
      <div v-if="isNow" class="text-blue-500 text-[10px] font-black tracking-widest mb-1 flex items-center gap-2 uppercase animate-pulse">
        <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        NOW
      </div>

      <div :class="['rounded-lg p-3 transition-all duration-200 hover:shadow-md hover:translate-x-1', cardColor]">
        <div v-if="activity">
          <span :class="['text-[9px] uppercase font-bold tracking-widest mb-1 block', categoryTextClass]">
            {{ activity.category }}
          </span>
          <h3 class="font-bold text-sm leading-snug">
            {{ activity.title }}
          </h3>
        </div>
        <div v-else :class="['h-5 flex items-center text-sm font-medium transition-all', mode==='light'?'text-slate-400 group-hover:text-blue-600':'text-slate-600 group-hover:text-slate-400']">
          <span class="text-lg mr-2 opacity-50 font-light leading-none">+</span>
          <span class="text-xs tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Isi...</span>
        </div>
      </div>
    </div>
  </div>
</template>