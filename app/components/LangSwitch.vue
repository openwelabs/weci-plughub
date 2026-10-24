<script setup lang="ts">
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const target = computed(() => (locale.value === 'zh' ? 'en' : 'zh'))
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    :to="switchLocalePath(target)"
    :aria-label="target === 'en' ? 'Switch to English' : '切换到中文'"
  >
    {{ target === 'en' ? 'EN' : '中' }}
  </UButton>
</template>
