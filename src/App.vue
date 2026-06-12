<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <InsuranceForm v-if="active === 'form'" />
    <InsuranceTable v-else-if="active === 'table'" />
    <InsuranceAdmin v-else />

    <!-- 右側浮動選單 -->
    <div class="fixed right-0 sm:right-4 top-1/4 sm:top-1/2 sm:-translate-y-1/2 z-50 flex items-start">
      <!-- Mobile 面板（v-if + Transition，sm 以上隱藏）：在箭頭左側 -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <div
          v-if="mobileExpanded"
          class="flex flex-col gap-1 bg-white shadow-lg border border-r-0 border-gray-200 p-1.5 rounded-l-xl sm:hidden"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="active = tab.id; mobileExpanded = false"
            :class="[
              'px-2 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer [writing-mode:vertical-rl] border-l-2',
              active === tab.id
                ? 'border-red-600 text-cyan-900 font-semibold'
                : 'border-transparent text-gray-600 hover:bg-cyan-50',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </Transition>

      <!-- Mobile 收合/展開箭頭（sm 以上隱藏）：緊貼右側邊緣 -->
      <button
        @click="mobileExpanded = !mobileExpanded"
        class="sm:hidden flex items-center justify-center w-5 h-12 bg-white border border-l-0 border-gray-200 rounded-r-lg shadow-md cursor-pointer text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeftIcon v-if="!mobileExpanded" class="size-3" />
        <ChevronRightIcon v-else class="size-3" />
      </button>

      <!-- Desktop 面板（永遠顯示，mobile 隱藏） -->
      <div class="hidden sm:flex flex-col gap-1 bg-white shadow-lg border border-gray-200 p-1.5 rounded-xl">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="active = tab.id"
          :class="[
            'px-2 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer [writing-mode:vertical-rl] border-l-2',
            active === tab.id
              ? 'border-red-600 text-cyan-900 font-semibold'
              : 'border-transparent text-gray-600 hover:bg-cyan-50',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import AppHeader from './components/AppHeader.vue'
import InsuranceForm from './components/InsuranceForm.vue'
import InsuranceTable from './components/InsuranceTable.vue'
import InsuranceAdmin from './components/InsuranceAdmin.vue'

const tabs = [
  { id: 'form' as const, label: '險種選單' },
  { id: 'table' as const, label: '分類總覽' },
  { id: 'admin' as const, label: '後台設定' },
]
const active = ref<'form' | 'table' | 'admin'>('form')
const mobileExpanded = ref(false)
</script>
