<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const { loggedIn } = useUserSession()

const file = ref<File | null>(null)
const license = ref('')
const repository = ref('')
const keywords = ref('')
const uploading = ref(false)

async function submit() {
  if (!file.value) return
  uploading.value = true
  try {
    const form = new FormData()
    form.append('file', file.value)
    if (license.value) form.append('license', license.value)
    if (repository.value) form.append('repository', repository.value)
    if (keywords.value) form.append('keywords', keywords.value)

    const res = await $fetch<{ slug: string }>('/api/plugins', { method: 'POST', body: form })
    toast.add({ title: t('upload.success'), color: 'success' })
    await navigateTo(localePath(`/plugins/${res.slug}`))
  } catch (error: unknown) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage || String(error)
    toast.add({ title: t('upload.failed'), description: message, color: 'error' })
  } finally {
    uploading.value = false
  }
}

useSeoMeta({ title: () => t('nav.upload') })
</script>

<template>
  <UContainer class="max-w-2xl py-10">
    <h1 class="text-2xl font-bold">{{ t('nav.upload') }}</h1>

    <UCard v-if="!loggedIn" class="mt-6">
      <div class="py-6 text-center text-muted">
        {{ t('auth.loginRequired') }}
      </div>
    </UCard>

    <UCard v-else class="mt-6">
      <div class="space-y-5">
        <UFormField :label="t('upload.fileLabel')" required>
          <UFileUpload v-model="file" accept=".zip,application/zip" class="min-h-36" />
        </UFormField>

        <UFormField label="License">
          <UInput v-model="license" placeholder="MIT" />
        </UFormField>

        <UFormField :label="t('upload.repository')">
          <UInput v-model="repository" placeholder="https://github.com/you/your-plugin" />
        </UFormField>

        <UFormField :label="t('upload.keywords')">
          <UInput v-model="keywords" :placeholder="t('upload.keywordsHint')" />
        </UFormField>

        <UButton :loading="uploading" :disabled="!file" icon="i-lucide-upload" @click="submit">
          {{ t('upload.submit') }}
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
