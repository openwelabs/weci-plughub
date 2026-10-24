<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const slug = String(route.params.slug)

const { data, error } = await useFetch(`/api/plugins/${slug}`)
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage
  })
}

const plugin = computed(() => data.value!.plugin)
const versions = computed(() => data.value!.versions)
const selectedVersion = ref(versions.value[0]?.version || '')
const versionOptions = computed(() =>
  versions.value.map(v => ({ label: v.version, value: v.version }))
)
const downloadUrl = computed(() => `/api/plugins/${slug}/download/${selectedVersion.value}`)
const iconFailed = ref(false)

useSeoMeta({
  title: () => `${plugin.value.name} · WeCi Plugin Hub`,
  description: () => plugin.value.summary
})
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
      <img
        v-if="!iconFailed"
        :src="`/api/plugins/${slug}/icon`"
        :alt="plugin.name"
        class="size-20 rounded-xl object-cover"
        @error="iconFailed = true"
      >
      <div v-else class="flex size-20 items-center justify-center rounded-xl bg-muted">
        <UIcon name="i-lucide-puzzle" class="size-10 text-muted" />
      </div>

      <div class="min-w-0 flex-1">
        <h1 class="text-3xl font-bold">{{ plugin.name }}</h1>
        <p class="mt-1 text-muted">{{ plugin.summary }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <NuxtLink
            :to="`https://github.com/${plugin.authorLogin}`"
            target="_blank"
            class="flex items-center gap-1.5 hover:text-primary"
          >
            <UAvatar :src="plugin.authorAvatar" :alt="plugin.authorLogin" size="3xs" />
            @{{ plugin.authorLogin }}
          </NuxtLink>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-download" />
            {{ plugin.downloads }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" />
            {{ plugin.updatedAt?.slice(0, 10) }}
          </span>
          <UBadge v-if="plugin.license" variant="subtle" color="neutral">{{ plugin.license }}</UBadge>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <USelect v-model="selectedVersion" :items="versionOptions" class="w-28" />
        <UButton :to="downloadUrl" external icon="i-lucide-download">
          {{ t('plugin.download') }}
        </UButton>
      </div>
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-2">
        <UCard>
          <template #header>
            <h2 class="font-semibold">{{ t('plugin.installTitle') }}</h2>
          </template>
          <ol class="list-decimal space-y-2 pl-5 text-sm">
            <li>{{ t('plugin.installStep1') }}</li>
            <li>
              {{ t('plugin.installStep2') }}
              <code class="mt-1 block rounded bg-muted px-3 py-2 font-mono text-sm">
                weci plugin install ./{{ plugin.slug }}
              </code>
            </li>
            <li>{{ t('plugin.installStep3') }}</li>
          </ol>
        </UCard>

        <UCard v-if="plugin.description">
          <MDC :value="plugin.description" class="prose prose-sm dark:prose-invert max-w-none" />
        </UCard>
      </div>

      <div class="space-y-6">
        <UCard>
          <template #header>
            <h2 class="font-semibold">{{ t('plugin.permissions') }}</h2>
          </template>
          <div v-if="plugin.permissions.length" class="flex flex-wrap gap-2">
            <UBadge v-for="p in plugin.permissions" :key="p" color="warning" variant="subtle">
              {{ p }}
            </UBadge>
          </div>
          <p v-else class="text-sm text-muted">{{ t('plugin.noPermissions') }}</p>
        </UCard>

        <UCard v-if="plugin.keywords.length || plugin.repository">
          <template #header>
            <h2 class="font-semibold">{{ t('plugin.meta') }}</h2>
          </template>
          <div class="space-y-3 text-sm">
            <div v-if="plugin.keywords.length" class="flex flex-wrap gap-2">
              <UBadge v-for="k in plugin.keywords" :key="k" variant="subtle" color="neutral">
                {{ k }}
              </UBadge>
            </div>
            <NuxtLink
              v-if="plugin.repository"
              :to="plugin.repository"
              target="_blank"
              class="flex items-center gap-1.5 text-primary hover:underline"
            >
              <UIcon name="i-simple-icons-github" />
              {{ t('plugin.repository') }}
            </NuxtLink>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="font-semibold">{{ t('plugin.versions') }}</h2>
          </template>
          <ul class="space-y-2 text-sm">
            <li v-for="v in versions" :key="v.version" class="flex items-center justify-between">
              <span class="font-mono">{{ v.version }}</span>
              <span class="text-muted">{{ v.createdAt?.slice(0, 10) }}</span>
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
