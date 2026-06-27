import { useState, useRef, useEffect } from 'react'
import { Layers, Check, Plus, Edit3, Trash2 } from 'lucide-react'
import { useStore, Workspace } from '../../store/appStore'
import './WorkspaceSwitcher.css'

export default function WorkspaceSwitcher() {
  const {
    workspaces, activeWorkspaceId,
    setActiveWorkspace, addWorkspace,
    updateWorkspace, deleteWorkspace,
    setShowWorkspaceModal,
  } = useStore()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCreate = () => {
    const name = newName.trim()
    if (!name) return
    addWorkspace({ name, sessionIds: [] })
    setNewName('')
    setOpen(false)
  }

  const handleRename = (id: string) => {
    const name = editName.trim()
    if (!name) return
    updateWorkspace(id, { name })
    setEditing(null)
  }

  const activeLabel = activeWorkspace?.name || 'No workspace'

  return (
    <div className="workspace-switcher" ref={ref}>
      <button className="workspace-trigger" onClick={() => setOpen(!open)} aria-label="Switch workspace">
        <Layers size={12} />
        <span className="workspace-label truncate">{activeLabel}</span>
        <span className="workspace-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="workspace-dropdown glass animate-fade-in">
          <div className="workspace-list">
            {workspaces.map(w => (
              <div
                key={w.id}
                className={`workspace-item ${w.id === activeWorkspaceId ? 'active' : ''}`}
              >
                {editing === w.id ? (
                  <input
                    className="workspace-edit-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(w.id); if (e.key === 'Escape') setEditing(null) }}
                    onBlur={() => handleRename(w.id)}
                    autoFocus
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <button
                      className="workspace-select"
                      onClick={() => { setActiveWorkspace(w.id); setOpen(false) }}
                    >
                      {w.id === activeWorkspaceId && <Check size={12} className="workspace-check" />}
                      <span className="truncate">{w.name}</span>
                      <span className="workspace-count">{w.sessionIds.length}</span>
                    </button>
                    <div className="workspace-item-actions">
                      <button
                        className="ws-icon-btn"
                        onClick={e => { e.stopPropagation(); setEditing(w.id); setEditName(w.name) }}
                        title="Rename"
                      >
                        <Edit3 size={10} />
                      </button>
                      {workspaces.length > 1 && (
                        <button
                          className="ws-icon-btn danger"
                          onClick={e => { e.stopPropagation(); deleteWorkspace(w.id) }}
                          title="Delete"
                        >
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="workspace-create">
            <input
              className="workspace-input"
              placeholder="New workspace name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
            />
            <button className="ws-btn" onClick={handleCreate} disabled={!newName.trim()}>
              <Plus size={12} /> Create
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
