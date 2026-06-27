#!/usr/bin/env node
'use strict'

const { execSync } = require('child_process')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

const MODULES = ['node-pty', 'keytar', '@serialport/bindings-cpp']

// cpu-features ships an outdated nan incompatible with Electron 42's V8 API.
// It's an optional dep of ssh2 — ssh2 works fine without it.
const PROBLEMATIC = [
  'cpu-features',
  join('ssh2', 'node_modules', 'cpu-features'),
]

for (const p of PROBLEMATIC) {
  const dir = join(__dirname, '..', 'node_modules', p)
  if (existsSync(dir)) {
    try { rmSync(dir, { recursive: true, force: true }); console.log(`  removed ${p}`) } catch {}
  }
}

console.log('Rebuilding native modules for Electron:', MODULES.join(', '))
try {
  execSync(
    `npx electron-rebuild -f -w ${MODULES.join(',')}`,
    { stdio: 'inherit', cwd: join(__dirname, '..') },
  )
  console.log('Native module rebuild complete.')
} catch (e) {
  console.error('WARNING: electron-rebuild failed (non-fatal):', e.message)
  console.error('Some features (SSH, serial, keychain) may not work.')
}
