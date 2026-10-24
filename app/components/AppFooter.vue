<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        © 2026 WeCi Plugin Hub
      </p>
    </template>

    <p class="text-sm text-muted">
      {{ t('footer.disclaimer') }}
    </p>

    <template #right>
      <UButton
        to="https://github.com/openwelabs/weci"
        target="_blank"
        icon="i-lucide-external-link"
        color="neutral"
        variant="ghost"
        size="sm"
      >
        {{ t('footer.project') }}
      </UButton>
      <UButton
        to="https://github.com/openwelabs/weci-plughub"
        target="_blank"
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        size="sm"
      >
        {{ t('footer.hubSource') }}
      </UButton>
    </template>
  </UFooter>
</template>
