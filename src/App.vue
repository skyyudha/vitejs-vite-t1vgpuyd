<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import TimeSlot from './components/TimeSlot.vue';

// --- DATA & STATE ---
const slots = ref([]);
const isModalOpen = ref(false);
const isProfileOpen = ref(false); // State untuk Dropdown Profil
const isLoggedIn = ref(false); // State Simulasi Login
const showTimePicker = ref(null);
const form = ref({ title: '', category: 'work', startTime: '', endTime: '' });
const currentHourIndex = ref(null);

// Data Wheel
const hoursWheel = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, '0')
);
const minutesWheel = ['00', '30'];

// Kategori
const categories = [
  {
    id: 'work',
    label: 'Work / Study',
    color: 'bg-blue-600',
    border: 'border-blue-500',
  },
  {
    id: 'growth',
    label: 'Growth',
    color: 'bg-indigo-600',
    border: 'border-indigo-500',
  },
  {
    id: 'health',
    label: 'Health',
    color: 'bg-emerald-600',
    border: 'border-emerald-500',
  },
  {
    id: 'personal',
    label: 'Personal',
    color: 'bg-slate-500',
    border: 'border-slate-400',
  },
  {
    id: 'leisure',
    label: 'Leisure',
    color: 'bg-amber-600',
    border: 'border-amber-500',
  },
];

// --- LOGIC (Sama seperti sebelumnya) ---
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

  const idx = generated.findIndex((s) => {
    if (currentM < 30) return s.hour === currentH && s.minute === 0;
    return s.hour === currentH && s.minute === 30;
  });
  currentHourIndex.value = idx;
};

// STATISTIK HARIAN (Computed)
const dailyStats = computed(() => {
  const stats = { work: 0, growth: 0, health: 0, personal: 0, leisure: 0 };
  let totalFilled = 0;
  slots.value.forEach((slot) => {
    if (slot.activity && stats[slot.activity.category] !== undefined) {
      stats[slot.activity.category] += 0.5;
      totalFilled += 0.5;
    }
  });
  return { stats, totalFilled };
});

// Helper Functions & Actions (Sama seperti sebelumnya)
const getNearestTime = () => {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes() < 30 ? '00' : '30';
  return `${h}:${m}`;
};
const add30Minutes = (timeStr) => {
  if (!timeStr) return '00:00';
  if (timeStr === '23:30' || timeStr === '24:00') return '24:00';
  const index = slots.value.findIndex((s) => s.time === timeStr);
  return index !== -1 && index < slots.value.length - 1
    ? slots.value[index + 1].time
    : timeStr;
};

const openEditorFromSlot = (index) => {
  const slot = slots.value[index];
  form.value = slot.activity
    ? {
        ...slot.activity,
        startTime: slot.time,
        endTime: add30Minutes(slot.time),
      }
    : {
        title: '',
        category: 'work',
        startTime: slot.time,
        endTime: add30Minutes(slot.time),
      };
  isModalOpen.value = true;
  showTimePicker.value = null;
};
const openGlobalEditor = () => {
  const nowStr = getNearestTime();
  form.value = {
    title: '',
    category: 'work',
    startTime: nowStr,
    endTime: add30Minutes(nowStr),
  };
  isModalOpen.value = true;
  showTimePicker.value = null;
};
const selectTimeFromWheel = (type, hour, minute) => {
  const newTime = `${hour}:${minute}`;
  if (type === 'start') form.value.startTime = newTime;
  if (type === 'end') form.value.endTime = newTime;
};
const saveActivity = () => {
  if (!form.value.title.trim()) return;
  const timeRegex = /^([0-9]{2}):([0-9]{2})$/;
  if (
    !timeRegex.test(form.value.startTime) ||
    !timeRegex.test(form.value.endTime)
  ) {
    alert('Format waktu harus HH:MM');
    return;
  }
  let startIndex = slots.value.findIndex(
    (s) => s.time === form.value.startTime
  );
  let endIndex =
    form.value.endTime === '24:00'
      ? slots.value.length
      : slots.value.findIndex((s) => s.time === form.value.endTime);
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    alert('Waktu tidak valid!');
    return;
  }
  for (let i = startIndex; i < endIndex; i++) {
    slots.value[i].activity = {
      title: form.value.title,
      category: form.value.category,
    };
  }
  isModalOpen.value = false;
};
const deleteActivity = () => {
  let startIndex = slots.value.findIndex(
    (s) => s.time === form.value.startTime
  );
  if (startIndex !== -1) slots.value[startIndex].activity = null;
  isModalOpen.value = false;
};
const scrollToNow = () => {
  const el = document.getElementById('now-indicator');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
const toggleLogin = () => {
  isLoggedIn.value = !isLoggedIn.value;
};

onMounted(() => {
  generateDailySlots();
  nextTick(() => setTimeout(scrollToNow, 500));
});
</script>

<template>
  <div
    class="min-h-screen bg-slate-950 font-sans antialiased text-slate-200 selection:bg-blue-500/30"
  >
    <div
      class="max-w-6xl mx-auto min-h-screen border-x border-slate-800 bg-slate-925 shadow-2xl relative"
    >
      <div class="lg:grid lg:grid-cols-12 h-screen overflow-hidden">
        <div
          class="hidden lg:flex lg:col-span-4 bg-slate-900 border-r border-slate-800 flex-col p-8 z-20 relative"
        >
          <div class="mb-10 flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-black text-white tracking-tight mb-2">
                Today's Focus
              </h1>
              <p class="text-sm text-slate-400">Manage your energy.</p>
            </div>

            <div class="relative">
              <button
                @click="isProfileOpen = !isProfileOpen"
                class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:border-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <img
                  v-if="isLoggedIn"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  class="w-full h-full object-cover"
                />
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-6 h-6 text-slate-400"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <div
                v-if="isProfileOpen"
                class="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-pop-in origin-top-left"
              >
                <div class="mb-4 pb-4 border-b border-slate-800">
                  <div v-if="isLoggedIn">
                    <h3 class="font-bold text-white">Guest User</h3>
                    <p class="text-xs text-slate-500">guest@example.com</p>
                  </div>
                  <div v-else>
                    <p class="text-xs text-slate-400 mb-3">Sync your data.</p>
                    <button
                      @click="toggleLogin"
                      class="w-full py-2 bg-white text-slate-900 font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition"
                    >
                      Sign in with Google
                    </button>
                  </div>
                </div>
                <div class="pt-2">
                  <button
                    v-if="isLoggedIn"
                    @click="toggleLogin"
                    class="w-full text-left text-xs text-red-400 hover:text-red-300 py-1"
                  >
                    Log out
                  </button>
                  <div v-else class="text-[10px] text-slate-600 text-center">
                    Local Mode
                  </div>
                </div>
              </div>
              <div
                v-if="isProfileOpen"
                @click="isProfileOpen = false"
                class="fixed inset-0 z-40 bg-transparent"
              ></div>
            </div>
          </div>

          <div
            class="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-8"
          >
            <h3
              class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
            >
              Daily Summary
            </h3>
            <div class="space-y-3">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <div :class="['w-2 h-2 rounded-full', cat.color]"></div>
                  <span class="text-slate-300">{{ cat.label }}</span>
                </div>
                <span class="font-mono font-bold text-white"
                  >{{ dailyStats.stats[cat.id] }}h</span
                >
              </div>
            </div>
            <div
              class="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center"
            >
              <span class="text-xs font-bold text-slate-500">TOTAL</span
              ><span class="text-lg font-black text-blue-400"
                >{{ dailyStats.totalFilled }}h</span
              >
            </div>
          </div>

          <button
            @click="openGlobalEditor"
            class="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition flex items-center justify-center gap-2 group"
          >
            <span
              class="text-xl group-hover:rotate-90 transition-transform duration-300"
              >+</span
            >Add New Activity
          </button>
        </div>

        <div
          class="col-span-12 lg:col-span-8 h-screen overflow-y-auto relative scroll-smooth bg-slate-950"
        >
          <header
            class="lg:hidden sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center"
          >
            <div>
              <h1 class="text-xl font-bold text-white">Focus</h1>
              <p class="text-xs text-slate-500">Time Blocking</p>
            </div>

            <div class="relative">
              <button
                @click="isProfileOpen = !isProfileOpen"
                class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden hover:border-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <img
                  v-if="isLoggedIn"
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  class="w-full h-full object-cover"
                />
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-5 h-5 text-slate-400"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <div
                v-if="isProfileOpen"
                class="absolute right-0 top-12 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 animate-pop-in origin-top-right"
              >
                <div class="mb-4 pb-4 border-b border-slate-800">
                  <div v-if="isLoggedIn">
                    <h3 class="font-bold text-white">Guest User</h3>
                    <p class="text-xs text-slate-500">guest@example.com</p>
                  </div>
                  <div v-else>
                    <p class="text-xs text-slate-400 mb-3">Sync your data.</p>
                    <button
                      @click="toggleLogin"
                      class="w-full py-2 bg-white text-slate-900 font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 transition"
                    >
                      Sign in with Google
                    </button>
                  </div>
                </div>
                <div class="mb-4">
                  <h4
                    class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2"
                  >
                    Today's Summary
                  </h4>
                  <div class="space-y-2">
                    <div
                      v-for="cat in categories"
                      :key="cat.id"
                      class="flex items-center justify-between text-xs"
                    >
                      <div class="flex items-center gap-2">
                        <div
                          :class="['w-1.5 h-1.5 rounded-full', cat.color]"
                        ></div>
                        <span class="text-slate-300">{{ cat.label }}</span>
                      </div>
                      <span class="font-mono font-bold text-slate-400"
                        >{{ dailyStats.stats[cat.id] }}h</span
                      >
                    </div>
                  </div>
                </div>
                <div class="pt-2 border-t border-slate-800">
                  <button
                    v-if="isLoggedIn"
                    @click="toggleLogin"
                    class="w-full text-left text-xs text-red-400 hover:text-red-300 py-1"
                  >
                    Log out
                  </button>
                  <div v-else class="text-[10px] text-slate-600 text-center">
                    Local Mode
                  </div>
                </div>
              </div>
              <div
                v-if="isProfileOpen"
                @click="isProfileOpen = false"
                class="fixed inset-0 z-40 bg-transparent"
              ></div>
            </div>
          </header>

          <div class="px-4 py-6 lg:px-12 lg:py-10 relative min-h-full">
            <div
              class="absolute left-[34px] lg:left-[42px] top-0 bottom-0 w-[2px] bg-slate-800 -z-10 bg-dashed"
            ></div>
            <div v-for="(slot, index) in slots" :key="index">
              <div
                :id="index === currentHourIndex ? 'now-indicator' : ''"
              ></div>
              <TimeSlot
                :time="slot.time"
                :activity="slot.activity"
                :isNow="index === currentHourIndex"
                @clickSlot="openEditorFromSlot(index)"
              />
            </div>
          </div>

          <div
            class="lg:hidden fixed bottom-6 right-6 flex flex-col items-center gap-3 z-40 group"
          >
            <button
              @click="scrollToNow"
              class="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 shadow-lg backdrop-blur-sm flex items-center justify-center hover:bg-blue-800/50 hover:text-blue-200 active:scale-90 transition"
              title="Jump to Now"
            >
              <span class="text-[9px] font-black">NOW</span>
            </button>

            <button
              @click="openGlobalEditor"
              class="w-16 h-16 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-900/50 flex items-center justify-center border-2 border-slate-900 hover:scale-105 active:scale-95 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="w-8 h-8 group-hover:rotate-90 transition-transform duration-300"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div
        class="bg-slate-900 border border-slate-700 w-full sm:w-[450px] rounded-3xl shadow-2xl overflow-hidden p-6 animate-slide-up relative text-slate-200"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-black text-white">Edit Schedule</h2>
          <button
            @click="isModalOpen = false"
            class="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>
        <input
          v-model="form.title"
          type="text"
          class="w-full bg-slate-950 border border-slate-700 text-white font-semibold rounded-xl py-4 px-4 mb-6 focus:ring-2 focus:ring-blue-500/50 outline-none placeholder-slate-600"
          placeholder="Activity name..."
          autofocus
        />
        <div class="flex items-start gap-3 mb-6 relative z-20">
          <div class="flex-1 relative group">
            <label
              class="text-[10px] font-bold text-slate-500 uppercase mb-1 block"
              >Start</label
            >
            <div
              class="relative bg-slate-950 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-blue-500 transition-all"
            >
              <input
                v-model="form.startTime"
                @focus="showTimePicker = 'start'"
                type="text"
                maxlength="5"
                class="w-full bg-transparent text-white font-bold py-3 pl-4 outline-none z-10"
              />
            </div>
            <div
              v-if="showTimePicker === 'start'"
              class="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-20 overflow-hidden animate-pop-in h-40 flex"
            >
              <div
                class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px]"
              >
                <div
                  v-for="h in hoursWheel"
                  :key="h"
                  @click="
                    selectTimeFromWheel(
                      'start',
                      h,
                      form.startTime.split(':')[1] || '00'
                    )
                  "
                  class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {{ h }}
                </div>
              </div>
              <div
                class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px] border-l border-slate-700"
              >
                <div
                  v-for="m in minutesWheel"
                  :key="m"
                  @click="
                    selectTimeFromWheel(
                      'start',
                      form.startTime.split(':')[0] || '09',
                      m
                    )
                  "
                  class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {{ m }}
                </div>
              </div>
              <div
                @click="showTimePicker = null"
                class="absolute bottom-0 w-full bg-slate-900/90 text-center py-1 text-xs text-blue-400 cursor-pointer border-t border-slate-700 font-bold"
              >
                OK
              </div>
            </div>
          </div>
          <div class="flex-1 relative group">
            <label
              class="text-[10px] font-bold text-slate-500 uppercase mb-1 block"
              >End</label
            >
            <div
              class="relative bg-slate-950 border border-slate-700 rounded-xl flex items-center overflow-hidden focus-within:border-blue-500 transition-all"
            >
              <input
                v-model="form.endTime"
                @focus="showTimePicker = 'end'"
                type="text"
                maxlength="5"
                class="w-full bg-transparent text-white font-bold py-3 pl-4 outline-none z-10"
              />
            </div>
            <div
              v-if="showTimePicker === 'end'"
              class="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-20 overflow-hidden animate-pop-in h-40 flex"
            >
              <div
                class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px]"
              >
                <div
                  v-for="h in hoursWheel"
                  :key="h"
                  @click="
                    selectTimeFromWheel(
                      'end',
                      h,
                      form.endTime.split(':')[1] || '00'
                    )
                  "
                  class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {{ h }}
                </div>
              </div>
              <div
                class="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar py-[60px] border-l border-slate-700"
              >
                <div
                  v-for="m in minutesWheel"
                  :key="m"
                  @click="
                    selectTimeFromWheel(
                      'end',
                      form.endTime.split(':')[0] || '10',
                      m
                    )
                  "
                  class="h-10 flex items-center justify-center snap-center text-sm font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {{ m }}
                </div>
              </div>
              <div
                @click="showTimePicker = null"
                class="absolute bottom-0 w-full bg-slate-900/90 text-center py-1 text-xs text-blue-400 cursor-pointer border-t border-slate-700 font-bold"
              >
                OK
              </div>
            </div>
          </div>
        </div>
        <div class="mb-8">
          <label
            class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block ml-1"
            >Category</label
          >
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cat in categories"
              :key="cat.id"
              @click="form.category = cat.id"
              :class="[
                'py-3 text-xs font-bold rounded-xl border transition-all capitalize',
                form.category === cat.id
                  ? `bg-slate-800 text-white ${cat.border} border-2 shadow-lg`
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:bg-slate-800',
              ]"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
        <div class="flex gap-4">
          <button
            v-if="form.startTime"
            @click="deleteActivity"
            class="p-4 rounded-2xl text-red-400 bg-red-900/10 border border-red-900/30 hover:bg-red-900/30 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg></button
          ><button
            @click="saveActivity"
            class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-xl transition py-4"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
