import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useStore } from '../store/appStore'

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
})
