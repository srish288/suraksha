/**
 * PWA Service: Service Worker registration and Install Prompt manager
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PwaService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstallable: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e: Event) => {
        e.preventDefault();
        this.deferredPrompt = e as BeforeInstallPromptEvent;
        this.isInstallable = true;
        window.dispatchEvent(new Event('suraksha_pwa_installable'));
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.isInstallable = false;
        window.dispatchEvent(new Event('suraksha_pwa_installed'));
      });
    }
  }

  public registerServiceWorker(): void {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SURAKSHA PWA ServiceWorker active: ', registration.scope);
          })
          .catch((err) => {
            console.warn('SURAKSHA ServiceWorker registration failed: ', err);
          });
      });
    }
  }

  public canInstall(): boolean {
    return this.isInstallable && !!this.deferredPrompt;
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      this.isInstallable = false;
      return choice.outcome === 'accepted';
    } catch {
      return false;
    }
  }
}

export const pwaService = new PwaService();
