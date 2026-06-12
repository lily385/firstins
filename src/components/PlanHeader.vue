<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  planName: string
  productName: string
  effectiveDate: string
}>()
</script>

<template>
  <div class="pb-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ planName }}</h2>
    <Card>
      <CardContent class="py-2">
        <p class="font-semibold text-gray-800 text-sm">{{ productName }}</p>
        <div class="flex items-center gap-1 mt-1">
          <CalendarDays class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <p class="text-gray-400 text-xs">預定生效日期</p>
        </div>
        <p class="text-gray-600 text-sm mt-0.5">{{ effectiveDate }}</p>
      </CardContent>
    </Card>
  </div>
</template>
