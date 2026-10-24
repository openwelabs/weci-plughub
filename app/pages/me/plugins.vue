<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { loggedIn } = useUserSession()

interface MyPlugin {
  slug: string
  name: string
  summary: string
  downloads: number
  status: string
  created_at: string
  updated_at: string
}

const { data, refresh } = await useFetch<{ plugins: MyPlugin[] }>('/api/me/plugins')

const delistTarget = ref<string | null>(null)
const versionTarget = ref<string | null>(null)
const versionFile = ref<File | null>(null)
const busy = ref(false)

async function delist() {
  if (!delistTarget.value) return
  busy.value = true
  try {
    await $fetch(`/api/plugins/${delistTarget.value}`, { method: 'DELETE' })
    toast.add({ title: t('me.success'), color: 'success' })
    delistTarget.value = null
    await refresh()
  } catch (error: unknown) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage || String(error)
    toast.add({ title: t('me.failed'), description: message, color: 'error' })
  } finally {
    busy.value = false
  }
}

async function uploadVersion() {
  if (!versionTarget.value || !versionFile.value) return
  busy.value = true
  try {
    const form = new FormData()
    form.append('file', versionFile.value)
    await $fetch(`/api/plugins/${versionTarget.value}/versions`, { method: 'POST', body: form })
    toast.add({ title: t('me.success'), color: 'success' })
    versionTarget.value = null
    versionFile.value = null
    await refresh()
  } catch (error: unknown) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage || String(error)
    toast.add({ title: t('me.failed'), description: message, color: 'error' })
  } finally {
    busy.value = false
  }
}

useSeoMeta({ title: () => t('me.title') })
</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-bold">{{ t('me.title') }}</h1>

    <UCard v-if="!loggedIn" class="mt-6">
      <div class="py-6 text-center text-muted">
        {{ t('auth.loginRequired') }}
      </div>
    </UCard>

    <template v-else>
      <div v-if="!data?.plugins?.length" class="py-20 text-center">
        <UIcon name="i-lucide-package-open" class="mx-auto size-12 text-muted" />
        <p class="mt-3 text-muted">{{ t('me.empty') }}</p>
        <UButton :to="localePath('/upload')" class="mt-4" icon="i-lucide-upload">
          {{ t('nav.upload') }}
        </UButton>
      </div>

      <div v-else class="mt-6 space-y-4">
        <UCard v-for="p in data.plugins" :key="p.slug">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <NuxtLink :to="localePath(`/plugins/${p.slug}`)" class="truncate font-semibold hover:text-primary">
                  {{ p.name }}
                </NuxtLink>
                <UBadge :color="p.status === 'active' ? 'success' : 'neutral'" variant="subtle">
                  {{ p.status === 'active' ? t('me.active') : t('me.delisted') }}
                </UBadge>
              </div>
              <p class="mt-1 truncate text-sm text-muted">{{ p.summary }}</p>
              <p class="mt-1 text-xs text-muted">
                {{ p.downloads }} {{ t('me.downloads') }} · {{ p.updated_at?.slice(0, 10) }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <UButton
                size="sm"
                variant="outline"
                icon="i-lucide-upload"
                :disabled="p.status !== 'active'"
                @click="versionTarget = p.slug"
              >
                {{ t('me.newVersion') }}
              </UButton>
              <UButton
                size="sm"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                :disabled="p.status !== 'active'"
                @click="delistTarget = p.slug"
              >
                {{ t('me.delist') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </template>

    <UModal :open="!!delistTarget" :title="t('me.delistConfirmTitle')" @update:open="delistTarget = null">
      <template #body>
        <p>{{ t('me.delistConfirm', { name: delistTarget }) }}</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="delistTarget = null">{{ t('common.cancel') }}</UButton>
          <UButton color="error" :loading="busy" @click="delist">{{ t('common.confirm') }}</UButton>
        </div>
      </template>
    </UModal>

    <UModal :open="!!versionTarget" :title="t('me.versionFor', { name: versionTarget })" @update:open="versionTarget = null">
      <template #body>
        <UFileUpload v-model="versionFile" accept=".zip,application/zip" class="min-h-32" />
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="versionTarget = null">{{ t('common.cancel') }}</UButton>
          <UButton :loading="busy" :disabled="!versionFile" @click="uploadVersion">{{ t('common.confirm') }}</UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
