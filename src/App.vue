<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Tab bar -->
    <div class="flex gap-1 border-b border-gray-200 bg-white px-4 pt-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="active = tab.id"
        :class="[
          'px-4 py-2 text-sm font-medium rounded-t border',
          active === tab.id
            ? 'bg-white border-b-white text-green-700 border-gray-200'
            : 'bg-gray-100 border-transparent text-gray-500 hover:text-gray-700'
        ]"
      >
        {{ tab.label }}
      </button>
    </div>

    <InsuranceForm v-if="active === 'form'" />
    <InsuranceTable v-else-if="active === 'table'" />
    <InsuranceAdmin v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
