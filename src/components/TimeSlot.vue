<script setup>
import { computed } from 'vue';

const props = defineProps({
  time: String,
  activity: Object, // { title, category }
  isNow: Boolean,
});

const emit = defineEmits(['clickSlot']);

// WARNA KATEGORI (Dark Mode Palette)
const cardColor = computed(() => {
  if (!props.activity)
    return 'bg-transparent border-dashed border border-slate-800 opacity-40 hover:opacity-100 hover:border-slate-600 hover:bg-slate-900';

  switch (props.activity.category) {
    // 1. Work (Blue - Brand Color)
    case 'work':
      return 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 border-l-4 border-blue-300';

    // 2. Growth (Violet/Indigo)
    case 'growth':
      return 'bg-indigo-900/50 text-indigo-100 border-l-4 border-indigo-500 hover:bg-indigo-900/70';

    // 3. Health (Emerald/Teal)
    case 'health':
      return 'bg-emerald-900/40 text-emerald-100 border-l-4 border-emerald-500 hover:bg-emerald-900/60';

    // 4. Leisure (Amber/Orange)
    case 'leisure':
      return 'bg-amber-900/40 text-amber-100 border-l-4 border-amber-500 hover:bg-amber-900/60';

    // 5. Personal (Slate/Gray)
    default:
      return 'bg-slate-800 text-slate-300 border-l-4 border-slate-500 hover:bg-slate-750';
  }
});

const categoryTextClass = computed(() => {
  if (props.activity?.category === 'work') return 'text-blue-200 opacity-100';
  return 'opacity-70';
});
</script>

<template>
  <div class="flex group relative pl-2 md:pl-0">
    <div class="w-14 flex flex-col items-center flex-shrink-0 relative mr-3">
      <span
        :class="[
          'text-[11px] font-bold py-2 tracking-wider transition-colors font-mono',
          isNow
            ? 'text-blue-400 scale-110'
            : 'text-slate-600 group-hover:text-slate-400',
        ]"
      >
        {{ time }}
      </span>

      <div
        class="h-full w-[2px] bg-slate-800 relative flex items-center justify-center group-hover:bg-slate-700 transition-colors"
      >
        <div
          :class="[
            'w-2.5 h-2.5 rounded-full border-[2px] absolute top-0 transition-all box-content',
            activity
              ? 'bg-slate-900 border-slate-600 group-hover:border-blue-400'
              : 'bg-slate-900 border-slate-800',
            isNow
              ? 'bg-blue-500 border-blue-500 ring-4 ring-blue-500/20 z-10 scale-125'
              : '',
          ]"
        ></div>
      </div>
    </div>

    <div
      class="flex-1 pb-3 pr-2 cursor-pointer relative z-1"
      @click="$emit('clickSlot')"
    >
      <div
        v-if="isNow"
        class="text-blue-400 text-[10px] font-black tracking-widest mb-1 flex items-center gap-2 uppercase animate-pulse"
      >
        <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        NOW
      </div>

      <div
        :class="[
          'rounded-lg p-3 transition-all duration-200 hover:shadow-md hover:translate-x-1',
          cardColor,
        ]"
      >
        <div v-if="activity">
          <span
            :class="[
              'text-[9px] uppercase font-bold tracking-widest mb-1 block',
              categoryTextClass,
            ]"
          >
            {{ activity.category }}
          </span>
          <h3 class="font-bold text-sm leading-snug">
            {{ activity.title }}
          </h3>
        </div>

        <div
          v-else
          class="h-5 flex items-center text-slate-600 group-hover:text-slate-400 text-sm font-medium transition-all"
        >
          <span class="text-lg mr-2 opacity-50 font-light leading-none">+</span>
          <span
            class="text-xs tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
            >Isi...</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
