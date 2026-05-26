interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isInstallable = computed(() => deferredPrompt.value !== null)

let listenersRegistered = false

function registerListeners() {
  if (listenersRegistered || !import.meta.client) return
  listenersRegistered = true

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
  })
}

export function usePwaInstall() {
  registerListeners()

  async function installApp() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
  }

  return { isInstallable, installApp }
}
