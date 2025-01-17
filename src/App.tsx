import { useState, useEffect } from 'react'
import { Session, SessionKit, Chains } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import WebRenderer from '@wharfkit/web-renderer'
import GameUI from './components/GameUI'
import { WharfkitContext } from './lib/wharfkit/context'
import { ToastProvider } from './lib/contexts/ToastContext'
import './index.css'  // For Tailwind and shadcn/ui styles
import './App.css'    // For your custom styles

const sessionKit = new SessionKit({
  appName: 'Stakeland',
  chains: [Chains.WAXTestnet],
  ui: new WebRenderer(),
  walletPlugins: [
    new WalletPluginAnchor(),
  ],
})

function App() {
  const [session, setSession] = useState<Session | undefined>()
  const [isRestoring, setIsRestoring] = useState(true)

  // Attempt to restore session on component mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const restored = await sessionKit.restore()
        if (restored) {
          console.log('Session restored successfully')
          setSession(restored)
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
      } finally {
        setIsRestoring(false)
      }
    }

    restoreSession()
  }, [])

  // Custom session setter that can be passed down
  const handleSetSession = (newSession: Session | undefined) => {
    setSession(newSession)
  }

  // Show loading state while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-slate-900 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <ToastProvider>
      <WharfkitContext.Provider value={{ session, setSession: handleSetSession, sessionKit }}>
        <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-slate-900">
          <div className="App">
            <GameUI />
          </div>
        </div>
      </WharfkitContext.Provider>
    </ToastProvider>
  )
}

export default App