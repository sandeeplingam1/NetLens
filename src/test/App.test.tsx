import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '../store/appStore'

// Reset store between tests
beforeEach(() => useStore.setState(useStore.getInitialState()))

describe('App Store', () => {
  it('starts with no tabs', () => {
    const { tabs } = useStore.getState()
    expect(tabs).toHaveLength(0)
  })

  it('adds a tab', () => {
    const { addTab } = useStore.getState()
    addTab()
    const { tabs } = useStore.getState()
    expect(tabs).toHaveLength(1)
    expect(tabs[0].title).toBe('Terminal')
  })

  it('adds a session tab with custom title', () => {
    useStore.getState().addSession({
      name: 'test-session', host: '10.0.0.1', port: 22,
      username: 'admin', protocol: 'SSH', authMethod: 'password',
      group: 'Default', env: 'none',
    })
    const sessions = useStore.getState().sessions
    const session = sessions.find(s => s.name === 'test-session')!
    useStore.getState().addTab(session.id)
    const { tabs } = useStore.getState()
    const tab = tabs.find(t => t.sessionId === session.id)
    expect(tab).toBeTruthy()
    expect(tab!.title).toBe('test-session')
  })

  it('closes a tab', () => {
    const tabs = useStore.getState().tabs
    if (tabs.length > 0) {
      const id = tabs[0].id
      useStore.getState().closeTab(id, true)
      const remaining = useStore.getState().tabs
      expect(remaining.find(t => t.id === id)).toBeUndefined()
    }
  })

  it('moves a tab', () => {
    const { addTab, moveTab } = useStore.getState()
    addTab()
    addTab()
    const before = useStore.getState().tabs.map(t => t.id)
    moveTab(0, 1)
    const after = useStore.getState().tabs.map(t => t.id)
    expect(after[0]).toBe(before[1])
    expect(after[1]).toBe(before[0])
  })

  it('creates a workspace and adds sessions to it', () => {
    const store = useStore.getState()

    // Create workspace
    store.addWorkspace({ name: 'Production', description: 'Production devices', sessionIds: [] })
    const ws = useStore.getState().workspaces[0]
    expect(ws).toBeTruthy()
    expect(ws.name).toBe('Production')
    expect(ws.description).toBe('Production devices')

    // Workspace should be auto-activated
    expect(useStore.getState().activeWorkspaceId).toBe(ws.id)
  })

  it('adds new sessions to active workspace', () => {
    const store = useStore.getState()
    store.addWorkspace({ name: 'Lab', sessionIds: [] })

    // Add session — it should be auto-added to the active workspace
    store.addSession({
      name: 'switch-1', host: '10.0.0.1', port: 22,
      username: 'admin', protocol: 'SSH', authMethod: 'password',
      group: 'Lab', env: 'lab',
    })

    const state = useStore.getState()
    const ws = state.workspaces[0]
    const session = state.sessions[0]
    expect(ws.sessionIds).toContain(session.id)
  })

  it('switches active workspace', () => {
    const store = useStore.getState()
    store.addWorkspace({ name: 'Prod', sessionIds: [] })
    store.addWorkspace({ name: 'Staging', sessionIds: [] })

    store.setActiveWorkspace(useStore.getState().workspaces[1].id)
    expect(useStore.getState().activeWorkspaceId).toBe(useStore.getState().workspaces[1].id)
  })

  it('removes session from workspace on delete', () => {
    const store = useStore.getState()
    store.addWorkspace({ name: 'Default', sessionIds: [] })

    store.addSession({
      name: 'router-1', host: '10.0.0.2', port: 22,
      username: 'admin', protocol: 'SSH', authMethod: 'password',
      group: 'Default', env: 'none',
    })

    const session = useStore.getState().sessions[0]
    expect(useStore.getState().workspaces[0].sessionIds).toContain(session.id)

    // Delete the session
    store.deleteSession(session.id)
    expect(useStore.getState().workspaces[0].sessionIds).not.toContain(session.id)
  })
})
