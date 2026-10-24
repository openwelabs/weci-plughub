<script setup lang="ts">
import zhMd from '~/assets/content/guide.zh.md?raw'
import enMd from '~/assets/content/guide.en.md?raw'

const { t, locale } = useI18n()
const md = computed(() => (locale.value === 'zh' ? zhMd : enMd))

useSeoMeta({ title: () => t('nav.guide') })
</script>

<template>
  <UContainer class="max-w-3xl py-10">
    <h1 class="text-2xl font-bold">{{ t('nav.guide') }}</h1>
    <UCard class="mt-6">
      <MDC :value="md" class="prose prose-sm dark:prose-invert max-w-none" />
    </UCard>
  </UContainer>
</template>
