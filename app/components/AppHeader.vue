<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { loggedIn, user, clear } = useUserSession()

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

const userMenuItems = computed(() => [
  [
    {
      label: t('auth.myPlugins'),
      icon: 'i-lucide-package',
      to: localePath('/me/plugins')
    }
  ],
  [
    {
      label: t('auth.logout'),
      icon: 'i-lucide-log-out',
      onSelect: () => clear()
    }
  ]
])

function login() {
  window.location.href = '/auth/github'
}
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
      <UDropdownMenu v-if="loggedIn && user" :items="userMenuItems">
        <UAvatar :src="user.avatarUrl" :alt="user.login" size="sm" class="cursor-pointer" />
      </UDropdownMenu>
      <UButton
        v-else
        icon="i-simple-icons-github"
        size="sm"
        :label="t('auth.login')"
        @click="login"
      />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>
  </UHeader>
</template>
