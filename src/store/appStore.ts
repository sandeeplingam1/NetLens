import { create } from 'zustand'

// ── Types ─────────────────────────────────────────────────────────────────────
export type EnvTag     = 'production' | 'staging' | 'lab' | 'dev' | 'none'
export type AuthMethod = 'password' | 'key' | 'agent'
export type Protocol   = 'SSH' | 'Telnet' | 'Serial'
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama'
export type SplitLayout= 'single' | 'horizontal' | 'vertical' | 'quad'
export type ThemeMode = 'dark' | 'light' | 'high-contrast'

export interface JumpHost {
  host: string; port: number; username: string
  password?: string; privateKey?: string; passphrase?: string
}

export interface PortForward {
  id: string; sessionId: string
  type: 'local' | 'remote'; localPort: number
  remoteHost: string; remotePort: number; active: boolean
}

export interface Credential {
  id: string
  name: string
  username: string
  authMethod: AuthMethod
  password?: string
  privateKey?: string
  passphrase?: string
}

export interface Session {
  id: string; name: string; host: string; port: number
  username: string; protocol: Protocol; authMethod: AuthMethod
  credentialId?: string
  password?: string; privateKey?: string; passphrase?: string
  group: string; env: EnvTag; lastConnected?: number
  color?: string; notes?: string
  // SSH advanced
  jumpHost?: JumpHost
  socksProxy?: { host: string; port: number; type: 4 | 5 }
  agentForwarding?: boolean
  keepaliveInterval?: number
  verifyHost?: boolean
  // per-session appearance
  fontFamily?: string; fontSize?: number; cursorStyle?: string; scrollback?: number
  // Serial-specific
  serialPath?: string; baudRate?: number; dataBits?: number
  stopBits?: number; parity?: 'none' | 'even' | 'odd'
  // Button bar
  buttons?: ButtonBarItem[]
}

export interface ButtonBarItem {
  id: string; label: string; command: string; color?: string
}

export interface MacroCommand { cmd: string; delay: number }
export interface Macro {
  id: string; name: string; description?: string
  commands: MacroCommand[]
  hotkey?: string
  variables?: string[]
  category?: string
}

export interface HighlightRule {
  id: string; pattern: string; color: string; bg: string; enabled: boolean
}

export interface Tab {
  id: string; ptyId: string
  sessionId: string | null; title: string
  isConnected: boolean; isConnecting: boolean
  connectionError: string | null
  terminalOutput: string[]
  logPath?: string
  panePosition?: 'tl' | 'tr' | 'bl' | 'br' | 'left' | 'right' | 'top' | 'bottom'
}

export interface AISettings {
  provider: AIProvider; openaiKey: string; openaiModel: string
  anthropicKey: string; anthropicModel: string
  googleKey: string; googleModel: string
  ollamaBase: string; ollamaModel: string; contextLines: number
}

export interface TermSettings {
  fontFamily: string; fontSize: number; cursorStyle: string
  scrollback: number; bellEnabled: boolean; autoLog: boolean
}

export interface ChatMessage {
  id: string; role: 'user' | 'assistant' | 'system'
  content: string; timestamp: number
  isLoading?: boolean; streamId?: string
}

export interface SSHHostKeyEvent {
  id: string; host: string; port: number; fingerprint: string; stored?: string
}

export interface KeyboardInteractiveEvent {
  id: string; prompts: { prompt: string; echo: boolean }[]
}

export interface ShortcutEntry {
  id: string; label: string; category: string
  keys: string // e.g. 'Meta+k' or 'Meta+Shift+A'
  defaultKeys: string
}

export const DEFAULT_SHORTCUTS: ShortcutEntry[] = [
  { id: 'palette',     label: 'Command Palette',      category: 'General',    keys: 'Meta+k',            defaultKeys: 'Meta+k' },
  { id: 'new-tab',     label: 'New Tab',               category: 'Session',   keys: 'Meta+t',            defaultKeys: 'Meta+t' },
  { id: 'close-tab',   label: 'Close Tab',             category: 'Session',   keys: 'Meta+w',            defaultKeys: 'Meta+w' },
  { id: 'settings',    label: 'Settings',              category: 'General',   keys: 'Meta+,',            defaultKeys: 'Meta+,' },
  { id: 'lock',        label: 'Lock Session',           category: 'Security',  keys: 'Meta+l',            defaultKeys: 'Meta+l' },
  { id: 'toggle-ai',   label: 'Toggle AI Sidebar',     category: 'View',      keys: 'Meta+Shift+A',      defaultKeys: 'Meta+Shift+A' },
  { id: 'sftp',        label: 'SFTP Browser',           category: 'View',      keys: 'Meta+Shift+S',      defaultKeys: 'Meta+Shift+S' },
  { id: 'logs',        label: 'Session Logs',           category: 'View',      keys: 'Meta+Shift+L',      defaultKeys: 'Meta+Shift+L' },
  { id: 'topology',    label: 'Topology View',          category: 'View',      keys: 'Meta+Shift+T',      defaultKeys: 'Meta+Shift+T' },
  { id: 'broadcast',   label: 'Toggle Broadcast',       category: 'Session',   keys: 'Meta+Shift+B',      defaultKeys: 'Meta+Shift+B' },
  { id: 'split-h',     label: 'Split Horizontal',       category: 'Layout',    keys: 'Meta+Shift+H',      defaultKeys: 'Meta+Shift+H' },
  { id: 'split-v',     label: 'Split Vertical',         category: 'Layout',    keys: 'Meta+Shift+V',      defaultKeys: 'Meta+Shift+V' },
  { id: 'split-quad',  label: 'Quad Split',             category: 'Layout',    keys: 'Meta+Shift+4',      defaultKeys: 'Meta+Shift+4' },
  { id: 'split-single',label: 'Single Pane',            category: 'Layout',    keys: 'Meta+Shift+1',      defaultKeys: 'Meta+Shift+1' },
  { id: 'pane-prev',   label: 'Previous Pane',          category: 'Layout',    keys: 'Meta+[',            defaultKeys: 'Meta+[' },
  { id: 'pane-next',   label: 'Next Pane',              category: 'Layout',    keys: 'Meta+]',            defaultKeys: 'Meta+]' },
]

export function matchShortcut(e: KeyboardEvent, shortcutKeys: string): boolean {
  const parts = shortcutKeys.split('+')
  const meta = parts.includes('Meta') || parts.includes('Cmd')
  const ctrl = parts.includes('Ctrl')
  const shift = parts.includes('Shift')
  const alt = parts.includes('Alt') || parts.includes('Option')
  const key = parts[parts.length - 1]
  return ((e.metaKey && meta) || (e.ctrlKey && ctrl)) &&
    e.shiftKey === shift &&
    e.altKey === alt &&
    e.key.toLowerCase() === key.toLowerCase()
}

export interface Workspace {
  id: string; name: string; description?: string
  sessionIds: string[]; createdAt: number
}

export interface AppState {
  // Workspace profiles
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  addWorkspace:             (w: Omit<Workspace, 'id' | 'createdAt'>) => void
  updateWorkspace:          (id: string, u: Partial<Workspace>) => void
  deleteWorkspace:          (id: string) => void
  setActiveWorkspace:       (id: string | null) => void
  addSessionToWorkspace:    (workspaceId: string, sessionId: string) => void
  removeSessionFromWorkspace: (workspaceId: string, sessionId: string) => void

  // Sessions
  sessions: Session[]
  selectedSessionId: string | null
  addSession:    (s: Omit<Session, 'id'>) => void
  updateSession: (id: string, u: Partial<Session>) => void
  deleteSession: (id: string) => void
  selectSession: (id: string | null) => void
  cloneSession:  (id: string) => void
  importSessions:(sessions: Session[]) => void

  // Tabs
  tabs: Tab[]; activeTabId: string | null
  splitLayout: SplitLayout
  broadcastMode: boolean
  paneActiveTabIds: Record<number, string | null>
  activePaneIndex: number
  addTab:            (sessionId?: string) => void
  closeTab:          (id: string, force?: boolean) => void
  setActiveTab:      (id: string) => void
  updateTab:         (id: string, u: Partial<Tab>) => void
  appendOutput:      (tabId: string, data: string) => void
  moveTab:           (fromIndex: number, toIndex: number) => void
  setSplitLayout:    (l: SplitLayout) => void
  toggleBroadcast:   () => void
  setPaneActiveTab:  (pane: number, tabId: string | null) => void
  setActivePaneIndex:(pane: number) => void

  // Port forwards
  portForwards: PortForward[]
  addPortForward:    (pf: Omit<PortForward, 'id'>) => void
  removePortForward: (id: string) => void
  updatePortForward: (id: string, u: Partial<PortForward>) => void

  // Credentials
  credentials: Credential[]
  addCredential:    (c: Credential | Omit<Credential, 'id'>) => void
  updateCredential: (id: string, u: Partial<Credential>) => void
  deleteCredential: (id: string) => void

  // Macros
  macros: Macro[]
  addMacro:    (m: Omit<Macro, 'id'>) => void
  updateMacro: (id: string, u: Partial<Macro>) => void
  deleteMacro: (id: string) => void

  // Highlights
  highlights: HighlightRule[]
  addHighlight:    (h: Omit<HighlightRule, 'id'>) => void
  updateHighlight: (id: string, u: Partial<HighlightRule>) => void
  deleteHighlight: (id: string) => void

  // AI
  aiSettings: AISettings
  updateAISettings: (s: Partial<AISettings>) => void

  // Theme
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void

  // Keyboard shortcuts
  shortcuts: ShortcutEntry[]
  updateShortcut: (id: string, keys: string) => void
  resetShortcuts: () => void

  // Terminal Settings
  termSettings: TermSettings
  updateTermSettings: (s: Partial<TermSettings>) => void

  // Chat
  chatMessages: ChatMessage[]
  addChatMessage:    (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearChat:         () => void
  updateLastMessage: (u: Partial<ChatMessage>) => void

  // SSH dialogs
  hostKeyEvent:   SSHHostKeyEvent | null
  setHostKeyEvent:(e: SSHHostKeyEvent | null) => void
  kbInteractive:  KeyboardInteractiveEvent | null
  setKbInteractive:(e: KeyboardInteractiveEvent | null) => void

  // UI state
  activeView: 'terminal' | 'sessions' | 'settings' | 'logs' | 'sftp' | 'portfwd' | 'macros' | 'hosts' | 'topology'
  setActiveView:          (v: AppState['activeView']) => void
  showAISidebar:          boolean
  toggleAISidebar:        () => void
  showCommandPalette:     boolean
  toggleCommandPalette:   () => void
  showNewSessionModal:    boolean
  setShowNewSessionModal: (v: boolean) => void
  editingSession:         Session | null
  setEditingSession:      (s: Session | null) => void
  pendingInsert:          string | null
  setPendingInsert:       (s: string | null) => void
  showMacroModal:         boolean
  setShowMacroModal:      (v: boolean) => void
  showPortFwdModal:       boolean
  setShowPortFwdModal:    (v: boolean) => void
  showWorkspaceModal:     boolean
  setShowWorkspaceModal:  (v: boolean) => void
  isLocked:               boolean
  lockSession:            () => void
  unlockSession:          (pin: string) => boolean
  lockPin:                string
  setLockPin:             (pin: string) => void
}

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULT_AI: AISettings = {
  provider: 'openai', openaiKey: '', openaiModel: 'gpt-4o-mini',
  anthropicKey: '', anthropicModel: 'claude-3-5-haiku-20241022',
  googleKey: '', googleModel: 'gemini-1.5-flash',
  ollamaBase: 'http://localhost:11434', ollamaModel: 'llama3',
  contextLines: 60,
}

const DEFAULT_TERM: TermSettings = {
  fontFamily: 'JetBrains Mono', fontSize: 13, cursorStyle: 'block',
  scrollback: 10000, bellEnabled: false, autoLog: false,
}

const DEFAULT_HIGHLIGHTS: HighlightRule[] = [
  { id: 'h1', pattern: 'error|Error|ERROR|FAILED|failed',      color: '#ef4444', bg: 'transparent', enabled: true },
  { id: 'h2', pattern: 'warn|Warn|WARNING|warning',             color: '#f59e0b', bg: 'transparent', enabled: true },
  { id: 'h3', pattern: 'success|SUCCESS|Connected|connected',   color: '#22c55e', bg: 'transparent', enabled: true },
  { id: 'h4', pattern: 'down|DOWN|unreachable|UNREACHABLE',      color: '#ef4444', bg: 'transparent', enabled: true },
  { id: 'h5', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', color: '#60a5fa', bg: 'transparent', enabled: true },
]

const DEMO_SESSIONS: Session[] = []

let tabCounter = 1
const mkTabId  = () => `tab-${tabCounter++}`
const mkPtyId  = () => `pty-${crypto.randomUUID()}`

async function loadFromStore<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await (window as any).netlensAPI?.storeGet(key)
    return (val ?? fallback) as T
  } catch { return fallback }
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create<AppState>((set, get) => ({
  // Workspaces
  workspaces: [],
  activeWorkspaceId: null,
  addWorkspace: (w) => set(st => {
    const workspace: Workspace = { ...w, id: crypto.randomUUID(), createdAt: Date.now() }
    const workspaces = [...st.workspaces, workspace]
    persist('workspaces', workspaces)
    return { workspaces, activeWorkspaceId: workspace.id }
  }),
  updateWorkspace: (id, u) => set(st => {
    const workspaces = st.workspaces.map(w => w.id === id ? { ...w, ...u } : w)
    persist('workspaces', workspaces)
    return { workspaces }
  }),
  deleteWorkspace: (id) => set(st => {
    const workspaces = st.workspaces.filter(w => w.id !== id)
    const activeWorkspaceId = st.activeWorkspaceId === id
      ? (workspaces[workspaces.length - 1]?.id || null)
      : st.activeWorkspaceId
    persist('workspaces', workspaces)
    return { workspaces, activeWorkspaceId }
  }),
  setActiveWorkspace: (id) => {
    persist('activeWorkspaceId', id)
    set({ activeWorkspaceId: id })
  },
  addSessionToWorkspace: (workspaceId, sessionId) => set(st => {
    const workspaces = st.workspaces.map(w =>
      w.id === workspaceId && !w.sessionIds.includes(sessionId)
        ? { ...w, sessionIds: [...w.sessionIds, sessionId] }
        : w
    )
    persist('workspaces', workspaces)
    return { workspaces }
  }),
  removeSessionFromWorkspace: (workspaceId, sessionId) => set(st => {
    const workspaces = st.workspaces.map(w =>
      w.id === workspaceId
        ? { ...w, sessionIds: w.sessionIds.filter(s => s !== sessionId) }
        : w
    )
    persist('workspaces', workspaces)
    return { workspaces }
  }),

  // Sessions
  sessions: DEMO_SESSIONS,
  selectedSessionId: null,
  addSession: (s) => {
    const session = { ...s, id: crypto.randomUUID(), verifyHost: s.verifyHost ?? true, keepaliveInterval: s.keepaliveInterval ?? 30000 }
    set(st => {
      const sessions = [...st.sessions, session]
      persist('sessions', sessions)
      // Auto-add to active workspace
      if (st.activeWorkspaceId) {
        const workspaces = st.workspaces.map(w =>
          w.id === st.activeWorkspaceId
            ? { ...w, sessionIds: [...w.sessionIds, session.id] }
            : w
        )
        persist('workspaces', workspaces)
        return { sessions, workspaces }
      }
      return { sessions }
    })
  },
  updateSession: (id, u) => set(st => {
    const sessions = st.sessions.map(s => s.id === id ? { ...s, ...u } : s)
    persist('sessions', sessions); return { sessions }
  }),
  deleteSession: (id) => set(st => {
    const sessions = st.sessions.filter(s => s.id !== id)
    const workspaces = st.workspaces.map(w => ({
      ...w, sessionIds: w.sessionIds.filter(sid => sid !== id)
    }))
    persist('sessions', sessions)
    persist('workspaces', workspaces)
    return { sessions, workspaces }
  }),
  selectSession: (id) => set({ selectedSessionId: id }),
  cloneSession: (id) => {
    const src = get().sessions.find(s => s.id === id)
    if (!src) return
    get().addSession({ ...src, name: `${src.name} (copy)`, lastConnected: undefined })
  },
  importSessions: (incoming) => set(st => {
    // Merge: skip sessions with same host+port+username that already exist
    const existing = new Set(st.sessions.map(s => `${s.host}:${s.port}:${s.username}`))
    const newOnes  = incoming
      .filter(s => !existing.has(`${s.host}:${s.port}:${s.username}`))
      .map(s => ({ ...s, id: crypto.randomUUID() }))
    const sessions = [...st.sessions, ...newOnes]
    const newIds = newOnes.map(s => s.id)
    // Auto-add imported sessions to active workspace
    let workspaces = st.workspaces
    if (st.activeWorkspaceId && newIds.length > 0) {
      workspaces = st.workspaces.map(w =>
        w.id === st.activeWorkspaceId
          ? { ...w, sessionIds: [...w.sessionIds, ...newIds] }
          : w
      )
    }
    persist('sessions', sessions)
    persist('workspaces', workspaces)
    return { sessions, workspaces }
  }),

  // Credentials
  credentials: [],
  addCredential: (c) => set(st => {
    const id = (c as any).id || crypto.randomUUID()
    const credentials = [...st.credentials, { ...c, id } as Credential]
    persist('credentials', credentials); return { credentials }
  }),
  updateCredential: (id, u) => set(st => {
    const credentials = st.credentials.map(c => c.id === id ? { ...c, ...u } : c)
    persist('credentials', credentials); return { credentials }
  }),
  deleteCredential: (id) => set(st => {
    const credentials = st.credentials.filter(c => c.id !== id)
    const sessions = st.sessions.map(s => s.credentialId === id ? { ...s, credentialId: undefined } : s)
    persist('credentials', credentials)
    persist('sessions', sessions)
    return { credentials, sessions }
  }),

  // Tabs
  tabs: [], activeTabId: null,
  splitLayout: 'single', broadcastMode: false,
  paneActiveTabIds: { 0: null, 1: null, 2: null, 3: null },
  activePaneIndex: 0,
  addTab: (sessionId) => {
    const id    = mkTabId()
    const ptyId = mkPtyId()
    const session = sessionId ? get().sessions.find(s => s.id === sessionId) : null
    const tab: Tab = {
      id, ptyId, sessionId: sessionId || null,
      title: session?.name || 'Terminal',
      isConnected: false, isConnecting: false, connectionError: null,
      terminalOutput: [],
    }
    set(st => {
      const paneIdx = st.splitLayout !== 'single' ? st.activePaneIndex : 0
      return {
        tabs: [...st.tabs, tab],
        activeTabId: id,
        paneActiveTabIds: { ...st.paneActiveTabIds, [paneIdx]: id },
      }
    })
  },
  closeTab: (id, force) => set(st => {
    const tab = st.tabs.find(t => t.id === id)
    if (!force && tab?.isConnected && !window.confirm(`"${tab.title}" is connected. Close anyway?`)) {
      return st
    }
    const tabs      = st.tabs.filter(t => t.id !== id)
    const activeTabId = st.activeTabId === id ? (tabs[tabs.length - 1]?.id || null) : st.activeTabId
    const paneActiveTabIds = { ...st.paneActiveTabIds }
    for (const k in paneActiveTabIds) {
      if (paneActiveTabIds[Number(k)] === id) {
        paneActiveTabIds[Number(k)] = tabs[0]?.id || null
      }
    }
    return { tabs, activeTabId, paneActiveTabIds }
  }),
  setActiveTab:   (id) => set({ activeTabId: id }),
  updateTab:      (id, u) => set(st => ({ tabs: st.tabs.map(t => t.id === id ? { ...t, ...u } : t) })),
  moveTab:        (fromIndex, toIndex) => set(st => {
    const tabs = [...st.tabs]
    const [moved] = tabs.splice(fromIndex, 1)
    tabs.splice(toIndex, 0, moved)
    return { tabs }
  }),
  appendOutput:   (tabId, data) => set(st => ({
    tabs: st.tabs.map(t => t.id === tabId
      ? { ...t, terminalOutput: [...t.terminalOutput.slice(-500), data] }
      : t)
  })),
  setSplitLayout: (l) => set(st => {
    // Auto-assign existing tabs to panes when switching layout
    const paneCount = l === 'quad' ? 4 : l === 'single' ? 1 : 2
    const paneActiveTabIds = { ...st.paneActiveTabIds }
    for (let i = 0; i < paneCount; i++) {
      if (!paneActiveTabIds[i] || !st.tabs.find(t => t.id === paneActiveTabIds[i])) {
        paneActiveTabIds[i] = st.tabs[i]?.id || null
      }
    }
    return { splitLayout: l, paneActiveTabIds }
  }),
  toggleBroadcast:    () => set(st => ({ broadcastMode: !st.broadcastMode })),
  setPaneActiveTab:   (pane, tabId) => set(st => ({ paneActiveTabIds: { ...st.paneActiveTabIds, [pane]: tabId }, activeTabId: tabId })),
  setActivePaneIndex: (pane) => set(st => ({ activePaneIndex: pane, activeTabId: st.paneActiveTabIds[pane] || st.activeTabId })),

  // Port forwards
  portForwards: [],
  addPortForward:    (pf)    => set(st => ({ portForwards: [...st.portForwards, { ...pf, id: crypto.randomUUID() }] })),
  removePortForward: (id)    => set(st => ({ portForwards: st.portForwards.filter(p => p.id !== id) })),
  updatePortForward: (id, u) => set(st => ({ portForwards: st.portForwards.map(p => p.id === id ? { ...p, ...u } : p) })),

  // Macros
  macros: [],
  addMacro:    (m)    => set(st => { const macros = [...st.macros, { ...m, id: crypto.randomUUID() }]; persist('macros', macros); return { macros } }),
  updateMacro: (id, u)=> set(st => { const macros = st.macros.map(m => m.id === id ? { ...m, ...u } : m); persist('macros', macros); return { macros } }),
  deleteMacro: (id)   => set(st => { const macros = st.macros.filter(m => m.id !== id); persist('macros', macros); return { macros } }),

  // Highlights
  highlights: DEFAULT_HIGHLIGHTS,
  addHighlight:    (h)    => set(st => { const highlights = [...st.highlights, { ...h, id: crypto.randomUUID() }]; persist('highlights', highlights); return { highlights } }),
  updateHighlight: (id, u)=> set(st => { const highlights = st.highlights.map(h => h.id === id ? { ...h, ...u } : h); persist('highlights', highlights); return { highlights } }),
  deleteHighlight: (id)   => set(st => { const highlights = st.highlights.filter(h => h.id !== id); persist('highlights', highlights); return { highlights } }),

  // AI
  aiSettings: DEFAULT_AI,
  updateAISettings: (s) => set(st => { const aiSettings = { ...st.aiSettings, ...s }; persist('aiSettings', aiSettings); return { aiSettings } }),

  // Theme
  theme: 'dark',
  setTheme: (theme) => {
    persist('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  },

  // Keyboard shortcuts
  shortcuts: DEFAULT_SHORTCUTS.map(s => ({ ...s })),
  updateShortcut: (id, keys) => set(st => {
    const shortcuts = st.shortcuts.map(s => s.id === id ? { ...s, keys } : s)
    persist('shortcuts', shortcuts)
    return { shortcuts }
  }),
  resetShortcuts: () => {
    persist('shortcuts', DEFAULT_SHORTCUTS.map(s => ({ ...s })))
    set({ shortcuts: DEFAULT_SHORTCUTS.map(s => ({ ...s })) })
  },

  // Terminal settings
  termSettings: DEFAULT_TERM,
  updateTermSettings: (s) => set(st => { const termSettings = { ...st.termSettings, ...s }; persist('termSettings', termSettings); return { termSettings } }),

  // Chat
  chatMessages: [],
  addChatMessage:    (msg) => set(st => ({ chatMessages: [...st.chatMessages, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }] })),
  clearChat:         ()    => set({ chatMessages: [] }),
  updateLastMessage: (u)   => set(st => {
    const msgs = [...st.chatMessages]
    if (msgs.length) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...u }
    return { chatMessages: msgs }
  }),

  // SSH dialogs
  hostKeyEvent:    null,
  setHostKeyEvent: (e) => set({ hostKeyEvent: e }),
  kbInteractive:   null,
  setKbInteractive:(e) => set({ kbInteractive: e }),

  // UI
  activeView:             'terminal',
  setActiveView:          (v) => set({ activeView: v }),
  showAISidebar:          true,
  toggleAISidebar:        () => set(st => ({ showAISidebar: !st.showAISidebar })),
  showCommandPalette:     false,
  toggleCommandPalette:   () => set(st => ({ showCommandPalette: !st.showCommandPalette })),
  showNewSessionModal:    false,
  setShowNewSessionModal: (v) => set({ showNewSessionModal: v }),
  editingSession:         null,
  setEditingSession:      (s) => set({ editingSession: s }),
  pendingInsert:          null,
  setPendingInsert:       (s) => set({ pendingInsert: s }),
  showMacroModal:         false,
  setShowMacroModal:      (v) => set({ showMacroModal: v }),
  showPortFwdModal:       false,
  setShowPortFwdModal:    (v) => set({ showPortFwdModal: v }),
  showWorkspaceModal:     false,
  setShowWorkspaceModal:  (v) => set({ showWorkspaceModal: v }),

  // Lock
  isLocked:  false,
  lockPin:   '',
  lockSession:  () => set({ isLocked: true }),
  unlockSession:(pin) => {
    const stored = get().lockPin
    if (!stored || pin === stored) { set({ isLocked: false }); return true }
    return false
  },
  setLockPin: (pin) => set({ lockPin: pin }),
}))

// ── Persist helper ────────────────────────────────────────────────────────────
function persist(key: string, value: any) {
  try { (window as any).netlensAPI?.storeSet(key, value) } catch {}
}

// ── Hydrate from store on boot ─────────────────────────────────────────────────
async function hydrate() {
  try {
    const [sessions, aiSettings, termSettings, macros, highlights, credentials, workspaces, activeWorkspaceId, theme, shortcuts] = await Promise.all([
      loadFromStore<Session[]>('sessions', []),
      loadFromStore<Partial<AISettings>>('aiSettings', {}),
      loadFromStore<Partial<TermSettings>>('termSettings', {}),
      loadFromStore<Macro[]>('macros', []),
      loadFromStore<HighlightRule[]>('highlights', []),
      loadFromStore<Credential[]>('credentials', []),
      loadFromStore<Workspace[]>('workspaces', []),
      loadFromStore<string | null>('activeWorkspaceId', null),
      loadFromStore<ThemeMode>('theme', 'dark'),
      loadFromStore<ShortcutEntry[]>('shortcuts', []),
    ])
    const resolvedTheme = theme || 'dark'
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    useStore.setState(st => ({
      sessions:     sessions.length > 0 ? sessions : st.sessions,
      aiSettings:   { ...st.aiSettings, ...aiSettings },
      termSettings: { ...st.termSettings, ...termSettings },
      macros:       macros.length > 0 ? macros : st.macros,
      highlights:   highlights.length > 0 ? highlights : st.highlights,
      credentials:  credentials.length > 0 ? credentials : st.credentials,
      workspaces:   workspaces.length > 0 ? workspaces : st.workspaces,
      activeWorkspaceId: activeWorkspaceId || st.activeWorkspaceId,
      theme:        resolvedTheme,
      shortcuts:    shortcuts.length > 0 ? shortcuts : st.shortcuts,
    }))
  } catch (e) {
    (window as any).netlensAPI?.log?.('warn', 'Hydration skipped:', e)
  }
}
setTimeout(hydrate, 100)
