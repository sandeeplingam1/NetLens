'use strict'

const log = require('./logger')

const CURRENT_VERSION = 2

function runMigrations(store) {
  const currentVersion = store.get('schemaVersion', 0)

  if (currentVersion >= CURRENT_VERSION) return

  log.info(`Schema migration: ${currentVersion} -> ${CURRENT_VERSION}`)

  if (currentVersion < 1) migrateV0ToV1(store)
  if (currentVersion < 2) migrateV1ToV2(store)

  store.set('schemaVersion', CURRENT_VERSION)
  log.info('Schema migration complete')
}

// v0 -> v1: Initial schema versioning; convert knownHosts from {host:port: fingerprint}
// to [{ host, port, fingerprint, addedAt, alias? }] for richer known hosts management
function migrateV0ToV1(store) {
  const oldHosts = store.get('knownHosts', {})
  if (Object.keys(oldHosts).length === 0) return

  const newHosts = Object.entries(oldHosts).map(([key, fingerprint]) => {
    const [host, port] = key.split(':')
    return {
      host, port: parseInt(port, 10) || 22,
      fingerprint, addedAt: Date.now(),
    }
  })
  store.set('knownHosts', newHosts)
  log.info(`Migrated ${newHosts.length} known hosts to v1 format`)
}

// v1 -> v2: Add workspaces field with a default workspace
function migrateV1ToV2(store) {
  const sessions = store.get('sessions', [])
  const defaultWorkspace = {
    id: 'workspace-default',
    name: 'Default',
    description: 'Default workspace',
    sessionIds: sessions.map(s => s.id),
    createdAt: Date.now(),
  }
  store.set('workspaces', [defaultWorkspace])
  store.set('activeWorkspaceId', 'workspace-default')
  log.info('Created default workspace with all sessions')
}

module.exports = { runMigrations, CURRENT_VERSION }
