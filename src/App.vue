<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import TimeSlot from './components/TimeSlot.vue';
import SpaceBackground from './components/SpaceBackground.vue';

// --- DATA & STATE ---
const slots = ref([]);
const isModalOpen = ref(false);
const isProfileOpen = ref(false); 
const isLoggedIn = ref(false);    
const showTimePicker = ref(null);
const form = ref({ title: '', category: 'work', startTime: '', endTime: '' });
const currentHourIndex = ref(null);
const isNowInView = ref(true); 

// TEMA (THEME STATE)
const currentTheme = ref('dark'); // 'dark', 'light', 'space'

// Data Wheel
const hoursWheel = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutesWheel = ['00', '30']; 

// Kategori
const categories = [
  { id: 'work', label: 'Work / Study', color: 'bg-blue-600', border: 'border-blue-500' },
  { id: 'growth', label: 'Growth', color: 'bg-indigo-600', border: 'border-indigo-500' },
  { id: 'health', label: 'Health', color: 'bg-emerald-600', border: 'border-emerald-500' },
  { id: 'personal', label: 'Personal', color: 'bg-slate-500', border: 'border-slate-400' },
  { id: 'leisure', label: 'Leisure', color: 'bg-amber-600', border: 'border-amber-500' }
];

// --- THEME STYLING LOGIC ---
const themeStyles = computed(() => {
  if (currentTheme.value === 'light') {
    return {
      appBg: 'bg-slate-50',
      textMain: 'text-slate-800',
      textMuted: 'text-slate-500',
      sidebarBg: 'bg-white border-r border-slate-200',
      cardBg: 'bg-white border border-slate-200 shadow-sm',
      menuBg: 'bg-white border border-slate-200 shadow-xl', 
      headerBg: 'bg-white/90 backdrop-blur-md border-b border-slate-200',
      inputBg: 'bg-slate-100 border-slate-300 text-slate-800',
      modalBg: 'bg-white text-slate-800 border-slate-200',
      lineColor: 'bg-slate-200'
    };
  } else if (currentTheme.value === 'space') {
    return {
      appBg: 'text-white bg-black/30', 
      textMain: 'text-white',
      textMuted: 'text-blue-200/70',
      sidebarBg: 'bg-black/20 backdrop-blur-md border-r border-white/10',
      cardBg: 'bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl',
      menuBg: 'bg-[#0B0F19] border border-white/20 shadow-2xl shadow-purple-900/20', 
      headerBg: 'bg-black/40 backdrop-blur-md border-b border-white/10',
      inputBg: 'bg-white/10 border-white/20 text-white placeholder-white/40',
      modalBg: 'bg-[#0B0F19] border border-white/10 text-white',
      lineColor: 'bg-white/10'
    };
  } else {
    // DARK Mode (Default)
    return {
      appBg: 'bg-slate-950',
      textMain: 'text-slate-200',
      textMuted: 'text-slate-400',
      sidebarBg: 'bg-slate-900 border-r border-slate-800',
      cardBg: 'bg-slate-800/50 border border-slate-700/50',
      menuBg: 'bg-slate-900 border border-slate-700 shadow-xl',
      headerBg: 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800',
      inputBg: 'bg-slate-950 border-slate-700 text-white',
      modalBg: 'bg-slate-900 border-slate-700 text-slate-200',
      lineColor: 'bg-slate-800'
    };
  }
});

// --- LOGIC UTAMA ---
const generateDailySlots = () => {
  const generated = [];
  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    generated.push({ time: `${hour}:00`, hour: i, minute: 0, activity: null });
    generated.push({ time: `${hour}:30`, hour: i, minute: 30, activity: null });
  }
  generated[18].activity = { title: 'Deep Work: Frontend', category: 'work' };
  generated[19].activity = { title: 'Team Meeting', category: 'work' };
  generated[24].activity = { title: 'Gym & Lunch', category: 'health' };
  slots.value = generated;
  const idx = generated.findIndex(s => {
    if (currentM < 30) return s.hour === currentH && s.minute === 0;
    return s.hour === currentH && s.minute === 30;
  });
  currentHourIndex.value = idx;
};

const dailyStats = computed(() => {
  const stats = { work: 0, growth: 0, health: 0, personal: 0, leisure: 0 };
  let totalFilled = 0;
  slots.value.forEach(slot => {
    if (slot.activity && stats[slot.activity.category] !== undefined) {
      stats[slot.activity.category] += 0.5;
      totalFilled += 0.5;
    }
  });
  return { stats, totalFilled };
});

const getNearestTime = () => { const now = new Date(); const h = now.getHours().toString().padStart(2, '0'); const m = now.getMinutes() < 30 ? '00' : '30'; return `${h}:${m}`; };
const add30Minutes = (timeStr) => { if (!timeStr) return '00:00'; if (timeStr === '23:30' || timeStr === '24:00') return '24:00'; const index = slots.value.findIndex(s => s.time === timeStr); return (index !== -1 && index < slots.value.length - 1) ? slots.value[index + 1].time : timeStr; };
const openEditorFromSlot = (index) => { const slot = slots.value[index]; form.value = slot.activity ? { ...slot.activity, startTime: slot.time, endTime: add30Minutes(slot.time) } : { title: '', category: 'work', startTime: slot.time, endTime: add30Minutes(slot.time) }; isModalOpen.value = true; showTimePicker.value = null; };
const openGlobalEditor = () => { const nowStr = getNearestTime(); form.value = { title: '', category: 'work', startTime: nowStr, endTime: add30Minutes(nowStr) }; isModalOpen.value = true; showTimePicker.value = null; };
const selectTimeFromWheel = (type, hour, minute) => { const newTime = `${hour}:${minute}`; if (type === 'start') form.value.startTime = newTime; if (type === 'end') form.value.endTime = newTime; };
const saveActivity = () => { if (!form.value.title.trim()) return; const timeRegex = /^([0-9]{2}):([0-9]{2})$/; if (!timeRegex.test(form.value.startTime) || !timeRegex.test(form.value.endTime)) { alert("Format waktu harus HH:MM"); return; } let startIndex = slots.value.findIndex(s => s.time === form.value.startTime); let endIndex = form.value.endTime === '24:00' ? slots.value.length : slots.value.findIndex(s => s.time === form.value.endTime); if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) { alert('Waktu tidak valid!'); return; } for (let i = startIndex; i < endIndex; i++) { slots.value[i].activity = { title: form.value.title, category: form.value.category }; } isModalOpen.value = false; };
const deleteActivity = () => { let startIndex = slots.value.findIndex(s => s.time === form.value.startTime); if (startIndex !== -1) slots.value[startIndex].activity = null; isModalOpen.value = false; };
const scrollToNow = () => { const el = document.getElementById('now-indicator'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
const toggleLogin = () => { isLoggedIn.value = !isLoggedIn.value; };
const setTheme = (theme) => { currentTheme.value = theme; };

let observer = null;
onMounted(() => { 
  generateDailySlots(); 
  nextTick(() => {
    scrollToNow();
    const el = document.getElementById('now-indicator');
    if (el) {
      observer = new IntersectionObserver(([entry]) => { isNowInView.value = entry.isIntersecting; }, { threshold: 0.1 });
      observer.observe(el);
    }
  }); 
});
onUnmounted(() => { if (observer) observer.disconnect(); });
</script>

<template>
  <div :class="['min-h-screen font-sans antialiased transition-colors duration-500 selection:bg-blue-500/30', themeStyles.appBg, themeStyles.textMain]">
    
    <div class="max-w-6xl mx-auto min-h-screen shadow-2xl relative overflow-hidden">
      
      <SpaceBackground v-if="currentTheme === 'space'" />

      <div class="lg:grid lg:grid-cols-12 h-screen overflow-hidden relative z-10">
        
        <div :class="['hidden lg:flex lg:col-span-4 flex-col p-8 z-20 relative transition-colors', themeStyles.sidebarBg]">
          <div class="mb-10 flex items-center gap-4">
             <div class="relative">
                <button @click="isProfileOpen = !isProfileOpen" :class="['w-14 h-14 rounded-full border flex items-center justify-center overflow-hidden hover:border-blue-500 transition focus:outline-none shadow-lg', currentTheme==='light'?'bg-white border-slate-200':'bg-slate-800 border-slate-700']">
                  <img v-if="isLoggedIn" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" class="w-full h-full object-cover">
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" :class="['w-8 h-8', themeStyles.textMuted]"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" /></svg>
                </button>
                
                <div v-if="isProfileOpen" :class="['absolute left-0 top-16 w-72 rounded-2xl p-4 z-50 animate-pop-in origin-top-left transition-colors', themeStyles.menuBg]">
                  <div class="mb-4 pb-4 border-b border-white/10">
                    <h3 class="font-bold text-sm mb-2 uppercase tracking-wider opacity-50">Appearance</h3>
                    <div class="grid grid-cols-3 gap-2">
                       <button @click="setTheme('light')" :class="['p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition', currentTheme==='light' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100']"><span>☀️</span> Light</button>
                       <button @click="setTheme('dark')" :class="['p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition', currentTheme==='dark' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100']"><span>🌙</span> Dark</button>
                       <button @click="setTheme('space')" :class="['p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition', currentTheme==='space' ? 'bg-purple-900 border-purple-500 text-white' : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100']"><span>🚀</span> Milky Way</button>
                    </div>
                  </div>
                  
                  <div class="mb-4 pb-4 border-b border-white/10">
                    <div v-if="isLoggedIn"><h3 class="font-bold">Guest User</h3><p :class="['text-xs', themeStyles.textMuted]">guest@example.com</p></div>
                    <div v-else><p :class="['text-xs mb-3', themeStyles.textMuted]">Sync your data.</p><button @click="toggleLogin" class="w-full py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-500 transition">Sign in with Google</button></div>
                  </div>
                  <div class="pt-2"><button v-if="isLoggedIn" @click="toggleLogin" class="w-full text-left text-xs text-red-400 hover:text-red-300 py-1">Log out</button><div v-else :class="['text-[10px] text-center', themeStyles.textMuted]">Local Mode</div></div>
                </div>
                <div v-if="isProfileOpen" @click="isProfileOpen = false" class="fixed inset-0 z-40 bg-transparent"></div>
             </div>
             <div><h1 class="text-2xl font-black tracking-tight leading-tight">Today's<br>Focus</h1></div>
          </div>

          <div :class="['rounded-2xl p-6 mb-8 transition-colors', themeStyles.cardBg]">
            <h3 :class="['text-xs font-bold uppercase tracking-wider mb-4', themeStyles.textMuted]">Daily Summary</h3>
            <div class="space-y-3">
              <div v-for="cat in categories" :key="cat.id" class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2"><div :class="['w-2 h-2 rounded-full', cat.color]"></div><span :class="currentTheme==='light'?'text-slate-600':'text-slate-300'">{{ cat.label }}</span></div>
                <span class="font-mono font-bold opacity-90">{{ dailyStats.stats[cat.id] }}h</span>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center"><span :class="['text-xs font-bold', themeStyles.textMuted]">TOTAL</span><span class="text-lg font-black text-blue-500">{{ dailyStats.totalFilled }}h</span></div>
          </div>

          <button @click="openGlobalEditor" class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition flex items-center justify-center gap-2 group">
            <span class="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>Add New Activity
          </button>
        </div>

        <div class="col-span-12 lg:col-span-8 h-screen overflow-y-auto relative scroll-smooth">
          
          <header :class="['lg:hidden sticky top-0 z-30 px-6 py-4 flex justify-between items-center transition-colors', themeStyles.headerBg]">
            <div><h1 class="text-xl font-bold">Focus</h1><p :class="['text-xs', themeStyles.textMuted]">Time Blocking</p></div>
            <div class="relative">
              <button @click="isProfileOpen = !isProfileOpen" :class="['w-9 h-9 rounded-full border flex items-center justify-center overflow-hidden hover:border-blue-500 transition', currentTheme==='light'?'bg-white border-slate-200':'bg-slate-800 border-slate-700']">
                <img v-if="isLoggedIn" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" class="w-full h-full object-cover">
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" :class="['w-5 h-5', themeStyles.textMuted]"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" /></svg>
              </button>
              <div v-if="isProfileOpen" :class="['absolute right-0 top-12 w-72 rounded-2xl p-4 z-50 animate-pop-in origin-top-right transition-colors', themeStyles.menuBg]">
                 <div class="mb-4 pb-4 border-b border-white/10">
                    <h3 class="font-bold text-sm mb-2 uppercase tracking-wider opacity-50">Appearance</h3>
                    <div class="grid grid-cols-3 gap-2">
                       <button @click="setTheme('light')" :class="['p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition', currentTheme==='light' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100']"><span>☀️</span> Light</button>
                       <button @click="setTheme('dark')" :class="['p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition', currentTheme==='dark' ? 'bg-slate-700 border-slate-500 text-white' : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100']"><span>🌙</span> Dark</button>
                       <button @click="setTheme('space')" :class="['p-2 rounded-lg text-xs font-bold border flex flex-col items-center gap-1 transition', currentTheme==='space' ? 'bg-purple-900 border-purple-500 text-white' : 'bg-transparent border-transparent hover:bg-white/5 opacity-50 hover:opacity-100']"><span>🚀</span> Milky Way</button>
                    </div>
                  </div>
                  <div class="mb-4"><h4 :class="['text-[10px] font-bold uppercase tracking-wider mb-2', themeStyles.textMuted]">Today's Summary</h4><div class="space-y-2"><div v-for="cat in categories" :key="cat.id" class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><div :class="['w-1.5 h-1.5 rounded-full', cat.color]"></div><span class="opacity-80">{{ cat.label }}</span></div><span :class="['font-mono font-bold', themeStyles.textMuted]">{{ dailyStats.stats[cat.id] }}h</span></div></div></div>
                  <div class="pt-2 border-t border-white/10"><button v-if="isLoggedIn" @click="toggleLogin" class="w-full text-left text-xs text-red-400 hover:text-red-300 py-1">Log out</button><div v-else :class="['text-[10px] text-center', themeStyles.textMuted]">Local Mode</div></div>
              </div>
              <div v-if="isProfileOpen" @click="isProfileOpen = false" class="fixed inset-0 z-40 bg-transparent"></div>
            </div>
          </header>

          <div class="px-4 py-6 lg:px-12 lg:py-10 relative min-h-full">
             <div :class="['absolute left-[34px] lg:left-[42px] top-0 bottom-0 w-[2px] -z-10 bg-dashed transition-colors', themeStyles.lineColor]"></div>
             <div v-for="(slot, index) in slots" :key="index">
                <div :id="index === currentHourIndex ? 'now-indicator' : ''"></div>
                <TimeSlot :time="slot.time" :activity="slot.activity" :isNow="index === currentHourIndex" :mode="currentTheme" @clickSlot="openEditorFromSlot(index)" />
              </div>
          </div>
          
          <div class="lg:hidden fixed bottom-6 right-6 flex flex-col items-center gap-3 z-40 group">
            
            <Transition name="fab-child">
              <button v-if="!isNowInView" @click="scrollToNow" class="w-12 h-12 rounded-full bg-blue-600/80 border border-blue-400/50 text-white shadow-lg backdrop-blur-md flex items-center justify-center active:scale-90" title="Jump to Now"><span class="text-[9px] font-black">NOW</span></button>
            </Transition>
            
            <button @click="openGlobalEditor" class="w-16 h-16 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-900/50 flex items-center justify-center border-2 border-white/20 transition z-50">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 transition-transform duration-300" :class="!isNowInView ? 'rotate-90' : ''"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div :class="['w-full sm:w-[450px] rounded-3xl shadow-2xl overflow-hidden p-6 animate-slide-up relative border transition-colors', themeStyles.modalBg]">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-black">Edit Schedule</h2>
          <button @click="isModalOpen = false" :class="['p-2 rounded-full transition', currentTheme==='light'?'bg-slate-100 text-slate-500 hover:bg-slate-200':'bg-white/10 text-white/50 hover:text-white hover:bg-white/20']">✕</button>
        </div>
        <input v-model="form.title" type="text" :class="['w-full font-semibold rounded-xl py-4 px-4 mb-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors', themeStyles.inputBg]" placeholder="Activity name..." autofocus>
        <div class="flex items-start gap-3 mb-6 relative z-20">
          <div class="flex-1 relative group">
            <label :class="['text-[10px] font-bold uppercase mb-1 block', themeStyles.textMuted]">Start</label>
            <div :class="['relative rounded-xl flex items-center overflow-hidden focus-within:border-blue-500 transition-all', themeStyles.inputBg]">
              <input v-model="form.startTime" @focus="showTimePicker = 'start'" type="text" maxlength="5" :class="['w-full bg-transparent font-bold py-3 pl-4 outline-none z-10', currentTheme==='light'?'text-slate-800':'text-white']">
            </div>
            <div v-if="showTimePicker === 'start'" :class="['absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl z-20 overflow-hidden animate-pop-in h-40 flex', themeStyles.menuBg]">
               <div class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px]"><div v-for="h in hoursWheel" :key="h" @click="selectTimeFromWheel('start', h, form.startTime.split(':')[1]||'00')" class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-white/10 cursor-pointer">{{ h }}</div></div>
               <div class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px] border-l border-white/10"><div v-for="m in minutesWheel" :key="m" @click="selectTimeFromWheel('start', form.startTime.split(':')[0]||'09', m)" class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-white/10 cursor-pointer">{{ m }}</div></div>
               <div @click="showTimePicker = null" class="absolute bottom-0 w-full bg-blue-600 text-center py-1 text-xs text-white cursor-pointer font-bold">OK</div>
            </div>
          </div>
          <div class="flex-1 relative group">
             <label :class="['text-[10px] font-bold uppercase mb-1 block', themeStyles.textMuted]">End</label>
             <div :class="['relative rounded-xl flex items-center overflow-hidden focus-within:border-blue-500 transition-all', themeStyles.inputBg]">
              <input v-model="form.endTime" @focus="showTimePicker = 'end'" type="text" maxlength="5" :class="['w-full bg-transparent font-bold py-3 pl-4 outline-none z-10', currentTheme==='light'?'text-slate-800':'text-white']">
            </div>
             <div v-if="showTimePicker === 'end'" :class="['absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl z-20 overflow-hidden animate-pop-in h-40 flex', themeStyles.menuBg]">
               <div class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px]"><div v-for="h in hoursWheel" :key="h" @click="selectTimeFromWheel('end', h, form.endTime.split(':')[1]||'00')" class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-white/10 cursor-pointer">{{ h }}</div></div>
               <div class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px] border-l border-white/10"><div v-for="m in minutesWheel" :key="m" @click="selectTimeFromWheel('end', form.endTime.split(':')[0]||'10', m)" class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-white/10 cursor-pointer">{{ m }}</div></div>
               <div @click="showTimePicker = null" class="absolute bottom-0 w-full bg-blue-600 text-center py-1 text-xs text-white cursor-pointer font-bold">OK</div>
            </div>
          </div>
        </div>
        <div class="mb-8">
          <label :class="['text-xs font-bold uppercase tracking-wider mb-3 block ml-1', themeStyles.textMuted]">Category</label>
          <div class="grid grid-cols-3 gap-2"><button v-for="cat in categories" :key="cat.id" @click="form.category = cat.id" :class="['py-3 text-xs font-bold rounded-xl border transition-all capitalize', form.category === cat.id ? `bg-blue-600 text-white border-blue-400 shadow-lg` : themeStyles.inputBg]">{{ cat.label }}</button></div>
        </div>
        <div class="flex gap-4"><button v-if="form.startTime" @click="deleteActivity" class="p-4 rounded-2xl text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button><button @click="saveActivity" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-xl transition py-4">Save</button></div>
      </div>
    </div>
  </div>
</template>

<style>
/* CSS UNTUK ANIMASI HALUS TOMBOL DAN POP-UP */

/* Animasi Tombol NOW (Muncul dari belakang +) */
.fab-child-enter-active,
.fab-child-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-child-enter-from,
.fab-child-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.5); /* Posisi awal/akhir: Turun & Kecil */
}

/* Animasi Pop-in untuk Menu Dropdown & Modal */
@keyframes pop-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-pop-in {
  animation: pop-in 0.2s ease-out;
}

/* Scrollbar Sembunyi untuk Wheel Picker */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>