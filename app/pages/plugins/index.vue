<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const q = ref(String(route.query.q || ''))
const sort = ref(route.query.sort === 'downloads' ? 'downloads' : 'newest')
const page = ref(Math.max(1, Number(route.query.page) || 1))

const { data, pending } = await useFetch('/api/plugins', {
  query: { q, sort, page }
})

const sortOptions = computed(() => [
  { label: t('plugins.sortNewest'), value: 'newest' },
  { label: t('plugins.sortDownloads'), value: 'downloads' }
])

watch(sort, () => { page.value = 1 })

function search() {
  page.value = 1
}

useSeoMeta({ title: () => t('nav.plugins') })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-bold">{{ t('nav.plugins') }}</h1>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
      <form class="flex flex-1 gap-2" @submit.prevent="search">
        <UInput
          v-model="q"
          icon="i-lucide-search"
          class="flex-1"
          :placeholder="t('plugins.searchPlaceholder')"
        />
        <UButton type="submit">{{ t('common.search') }}</UButton>
      </form>
      <USelect v-model="sort" :items="sortOptions" class="w-full sm:w-44" />
    </div>

    <div v-if="pending" class="py-20 text-center text-muted">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="!data?.plugins?.length" class="py-20 text-center">
      <UIcon name="i-lucide-package-open" class="mx-auto size-12 text-muted" />
      <p class="mt-3 text-muted">{{ t('plugins.empty') }}</p>
    </div>

    <div v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PluginCard
        v-for="p in data.plugins"
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

    <div v-if="(data?.total || 0) > 24" class="mt-8 flex justify-center">
      <UPagination
        v-model:page="page"
        :total="data?.total || 0"
        :items-per-page="24"
      />
    </div>
  </UContainer>
</template>
