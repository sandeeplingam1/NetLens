'use strict'

const path = require('path')
const fs   = require('fs')
const crypto = require('crypto')

let log

try {
  log = require('electron-log')
  log.transports.file.maxSize = 5 * 1024 * 1024
  log.transports.file.maxReservedOldFiles = 3
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'

  const { app } = require('electron')
  const logDir = path.join(app.getPath('userData'), 'logs')
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
  log.transports.file.file = path.join(logDir, `netlens-${crypto.randomUUID().slice(0, 8)}.log`)
  log.transports.console.format = '[{level}] {text}'
} catch {
  // Fallback to console if electron-log is not available (e.g. renderer)
  log = {
    error: (...args) => { try { console.error('[ERROR]', ...args) } catch {} },
    warn:  (...args) => { try { console.warn('[WARN]', ...args) } catch {} },
    info:  (...args) => { try { console.info('[INFO]', ...args) } catch {} },
    debug: (...args) => { try { console.debug('[DEBUG]', ...args) } catch {} },
    verbose: (...args) => { try { console.log('[VERBOSE]', ...args) } catch {} },
  }
}

module.exports = log
