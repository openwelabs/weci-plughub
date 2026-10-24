<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <UContainer class="py-24 text-center">
    <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
      {{ t('home.heroTitle') }}
    </h1>
    <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">
      {{ t('home.heroSubtitle') }}
    </p>
    <div class="mt-8 flex justify-center gap-3">
      <UButton :to="localePath('/plugins')" size="lg" icon="i-lucide-blocks">
        {{ t('home.browse') }}
      </UButton>
      <UButton :to="localePath('/upload')" size="lg" variant="outline" icon="i-lucide-upload">
        {{ t('home.submit') }}
      </UButton>
    </div>
  </UContainer>
</template>
