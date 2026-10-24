<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const items = computed(() => [
  {
    label: t('nav.plugins'),
    to: localePath('/plugins'),
    icon: 'i-lucide-blocks'
  },
  {
    label: t('nav.guide'),
    to: localePath('/guide'),
    icon: 'i-lucide-book-open'
  }
])
</script>

<template>
  <UHeader :to="localePath('/')" :title="t('brand')">
    <template #left>
      <UIcon name="i-lucide-blocks" class="size-6 text-primary" />
      <span class="font-semibold">{{ t('brand') }}</span>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton
        to="https://github.com/openwelabs/weci"
        target="_blank"
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        aria-label="WeCi on GitHub"
      />
      <LangSwitch />
      <ColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>
  </UHeader>
</template>
