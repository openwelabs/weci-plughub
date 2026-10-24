<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const q = ref('')

const { data: newest } = await useFetch('/api/plugins', { query: { sort: 'newest' } })
const { data: popular } = await useFetch('/api/plugins', { query: { sort: 'downloads' } })

useSeoMeta({
  title: 'WeCi Plugin Hub',
  description: () => t('home.heroSubtitle')
})

function search() {
  navigateTo(localePath({ path: '/plugins', query: q.value ? { q: q.value } : {} }))
}
</script>

<template>
  <UContainer class="py-16">
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
        {{ t('home.heroTitle') }}
      </h1>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-muted">
        {{ t('home.heroSubtitle') }}
      </p>

      <form class="mx-auto mt-8 flex max-w-lg gap-2" @submit.prevent="search">
        <UInput
          v-model="q"
          icon="i-lucide-search"
          size="lg"
          class="flex-1"
          :placeholder="t('plugins.searchPlaceholder')"
        />
        <UButton type="submit" size="lg">{{ t('common.search') }}</UButton>
      </form>

      <div class="mt-6 flex justify-center gap-3">
        <UButton :to="localePath('/upload')" variant="outline" icon="i-lucide-upload">
          {{ t('home.submit') }}
        </UButton>
      </div>
    </div>

    <section v-if="newest?.plugins?.length" class="mt-20">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold">{{ t('home.newest') }}</h2>
        <UButton :to="localePath('/plugins')" variant="link" trailing-icon="i-lucide-arrow-right">
          {{ t('home.viewAll') }}
        </UButton>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PluginCard
          v-for="p in newest.plugins.slice(0, 6)"
          :key="p.slug"
          :slug="p.slug"
          :name="p.name"
          :summary="p.summary"
          :downloads="p.downloads"
          :created-at="p.created_at"
          :author-login="p.author_login"
          :author-avatar="p.author_avatar"
        />
      </div>
    </section>

    <section v-if="popular?.plugins?.length" class="mt-16">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold">{{ t('home.popular') }}</h2>
        <UButton :to="localePath({ path: '/plugins', query: { sort: 'downloads' } })" variant="link" trailing-icon="i-lucide-arrow-right">
          {{ t('home.viewAll') }}
        </UButton>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PluginCard
          v-for="p in popular.plugins.slice(0, 6)"
          :key="p.slug"
          :slug="p.slug"
          :name="p.name"
          :summary="p.summary"
          :downloads="p.downloads"
          :created-at="p.created_at"
          :author-login="p.author_login"
          :author-avatar="p.author_avatar"
        />
      </div>
    </section>
  </UContainer>
</template>
