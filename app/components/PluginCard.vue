<script setup lang="ts">
defineProps<{
  slug: string
  name: string
  summary: string
  downloads: number
  createdAt: string
  authorLogin: string
  authorAvatar: string
}>()

const localePath = useLocalePath()
const iconFailed = ref(false)
</script>

<template>
  <NuxtLink :to="localePath(`/plugins/${slug}`)" class="block h-full">
    <UCard class="h-full transition hover:ring-2 hover:ring-primary/50">
      <div class="flex items-start gap-3">
        <img
          v-if="!iconFailed"
          :src="`/api/plugins/${slug}/icon`"
          :alt="name"
          class="size-10 rounded-md object-cover"
          loading="lazy"
          @error="iconFailed = true"
        >
        <div v-else class="flex size-10 items-center justify-center rounded-md bg-muted">
          <UIcon name="i-lucide-puzzle" class="size-5 text-muted" />
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ name }}</p>
          <p class="truncate text-xs text-muted">@{{ authorLogin }}</p>
        </div>
      </div>
      <p class="mt-3 line-clamp-2 min-h-10 text-sm text-muted">{{ summary }}</p>
      <div class="mt-3 flex items-center justify-between text-xs text-muted">
        <span class="flex items-center gap-1">
          <UIcon name="i-lucide-download" />
          {{ downloads }}
        </span>
        <span>{{ createdAt?.slice(0, 10) }}</span>
      </div>
    </UCard>
  </NuxtLink>
</template>
