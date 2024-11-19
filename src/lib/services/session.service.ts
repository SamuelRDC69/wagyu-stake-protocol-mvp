import { 
  SessionKit, 
  Session, 
  WebRenderer,
  Chains,
  BrowserLocalStorage
} from '@wharfkit/session';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';

export class SessionService {
  private static instance: SessionService;
  private sessionKit: SessionKit;
  private storage: BrowserLocalStorage;

  private constructor() {
    // Initialize storage with app-specific namespace
    this.storage = new BrowserLocalStorage('stakeland-session-storage');
    
    this.sessionKit = new SessionKit({
      appName: 'Stakeland',
      chains: [
        process.env.VITE_NETWORK === 'mainnet' 
          ? Chains.WAX 
          : Chains.WAXTestnet
      ],
      ui: new WebRenderer(),
      walletPlugins: [
        new WalletPluginAnchor(),
      ],
      storage: this.storage
    });
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  async restoreSession(): Promise<Session | undefined> {
    try {
      const session = await this.sessionKit.restore();
      if (session?.chain.id !== this.getCurrentChainId()) {
        await this.logout(session);
        return undefined;
      }
      return session;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return undefined;
    }
  }

  async login(): Promise<Session> {
    const response = await this.sessionKit.login();
    return response.session;
  }

  async logout(session: Session): Promise<void> {
    await this.sessionKit.logout(session);
    this.storage.remove('session');
  }

  getSessionKit(): SessionKit {
    return this.sessionKit;
  }

  private getCurrentChainId(): string {
    return process.env.VITE_NETWORK === 'mainnet' 
      ? Chains.WAX.id 
      : Chains.WAXTestnet.id;
  }
}

export const sessionService = SessionService.getInstance();