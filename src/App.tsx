import { useState } from 'react'
import { Session, SessionKit, Chains } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import WebRenderer from '@wharfkit/web-renderer'
import GameUI from './components/GameUI'
import { WharfkitContext } from './lib/wharfkit/context'
import './index.css'  // For Tailwind and shadcn/ui styles
import './App.css'    // For your custom styles

const sessionKit = new SessionKit({
  appName: 'Stakeland',
  chains: [Chains.Jungle4],
  ui: new WebRenderer(),
  walletPlugins: [
    new WalletPluginAnchor(),
  ],
})

function App() {
  const [session, setSession] = useState<Session | undefined>()

  return (
  <WharfkitContext.Provider value={{ session, setSession, sessionKit }}>
    <div className="App">
      <GameUI />
    </div>
  </WharfkitContext.Provider>
  )
}

export default App