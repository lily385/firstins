<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <InsuranceForm v-if="active === 'form'" />
    <InsuranceTable v-else-if="active === 'table'" />
    <InsuranceAdmin v-else />

    <!-- 右側浮動選單 -->
    <div class="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-1 bg-white rounded-xl shadow-lg border border-gray-200 p-1.5">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="active = tab.id"
        :class="[
          'px-2 py-3 text-sm font-medium rounded-lg transition-colors cursor-pointer [writing-mode:vertical-rl]',
          active === tab.id
            ? 'bg-cyan-900 text-white'
            : 'text-gray-600 hover:bg-cyan-50'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
</script>
