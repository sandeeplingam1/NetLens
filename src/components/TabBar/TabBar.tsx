import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../../store/appStore'
import './TabBar.css'

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab, moveTab } = useStore()
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const dragNode = useRef<HTMLElement | null>(null)

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  const closeContext = () => setContextMenu(null)

  const handleCloseOthers = (tabId: string) => {
    tabs.filter(t => t.id !== tabId).forEach(t => closeTab(t.id, true))
    closeContext()
  }

  const handleCloseAll = () => {
    tabs.forEach(t => closeTab(t.id, true))
    closeContext()
  }

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragNode.current = e.currentTarget as HTMLElement
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (idx !== dragOverIdx) setDragOverIdx(idx)
  }

  const handleDragLeave = () => setDragOverIdx(null)

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault()
    if (dragIdx !== null && dragIdx !== toIdx) {
      moveTab(dragIdx, toIdx)
    }
    setDragIdx(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  const handleDragEnd = () => {
    setDragIdx(null)
    setDragOverIdx(null)
    dragNode.current = null
  }

  return (
    <div className="tabbar" onClick={closeContext} role="tablist" aria-label="Terminal tabs">
      <div className="tabs-list">
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-label={tab.title}
            className={`tab ${activeTabId === tab.id ? 'active' : ''} ${dragIdx === idx ? 'dragging' : ''} ${dragOverIdx === idx ? 'drag-over' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onContextMenu={e => handleContextMenu(e, tab.id)}
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            style={{ borderLeft: `2px solid ${tab.isConnected ? 'var(--accent-green)' : 'transparent'}` }}
          >
            <span className="tab-label truncate">{tab.title}</span>
            <button
              className="tab-close"
              aria-label={`Close ${tab.title}`}
              onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}

        <button className="new-tab" onClick={() => addTab()} data-tooltip="New Tab (⌘T)" aria-label="New tab">
          <Plus size={13} strokeWidth={2} />
        </button>
      </div>

      {contextMenu && (
        <div
          className="context-menu glass animate-fade-in"
          role="menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button role="menuitem" onClick={() => { closeTab(contextMenu.tabId); closeContext() }}>
            Close
          </button>
          <div className="context-divider" role="separator" />
          <button role="menuitem" onClick={() => handleCloseOthers(contextMenu.tabId)}>
            Close Others
          </button>
          <button role="menuitem" onClick={handleCloseAll}>
            Close All
          </button>
        </div>
      )}
    </div>
  )
}
