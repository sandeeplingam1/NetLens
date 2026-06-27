const { contextBridge, ipcRenderer } = require('electron')

function logToMain(level, ...args) {
  try { ipcRenderer.invoke('log:write', { level, args }) } catch {}
}

contextBridge.exposeInMainWorld('netlensAPI', {
  platform: process.platform,

  // ── Logging (forward renderer logs to main process) ─────────────────────────
  log: (level, ...args) => logToMain(level, ...args),

  // ── Persistence ─────────────────────────────────────────────────────────────
  storeGet: (key)        => ipcRenderer.invoke('store:get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store:set', key, value),

  // ── Keychain ─────────────────────────────────────────────────────────────────
  keychainSave:   (opts) => ipcRenderer.invoke('keychain:save', opts),
  keychainGet:    (opts) => ipcRenderer.invoke('keychain:get', opts),
  keychainDelete: (opts) => ipcRenderer.invoke('keychain:delete', opts),

  // ── Terminal ─────────────────────────────────────────────────────────────────
  terminalCreateLocal:  (opts) => ipcRenderer.invoke('terminal:create-local',  opts),
  terminalCreateSSH:    (cfg)  => ipcRenderer.invoke('terminal:create-ssh',    cfg),
  terminalCreateTelnet: (cfg)  => ipcRenderer.invoke('terminal:create-telnet', cfg),
  terminalCreateSerial: (cfg)  => ipcRenderer.invoke('terminal:create-serial', cfg),
  terminalInput:        (opts) => ipcRenderer.invoke('terminal:input',         opts),
  terminalResize:       (opts) => ipcRenderer.invoke('terminal:resize',        opts),
  terminalKill:         (opts) => ipcRenderer.invoke('terminal:kill',          opts),
  terminalBroadcast:    (opts) => ipcRenderer.invoke('terminal:broadcast',     opts),
  terminalReconnect:    (opts) => ipcRenderer.invoke('terminal:reconnect',     opts),

  // Terminal event subscriptions (return unsubscribe fn)
  onTerminalOutput: (id, cb) => {
    const ch = `terminal:output:${id}`
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onTerminalOutput:', e) } }
    ipcRenderer.on(ch, h)
    return () => ipcRenderer.removeListener(ch, h)
  },
  onTerminalExit: (id, cb) => {
    const ch = `terminal:exit:${id}`
    const h = (_e, code) => { try { cb(code) } catch (e) { logToMain('error', 'onTerminalExit:', e) } }
    ipcRenderer.on(ch, h)
    return () => ipcRenderer.removeListener(ch, h)
  },

  // SSH events
  onSSHUnknownHost: (cb) => {
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onSSHUnknownHost:', e) } }
    ipcRenderer.on('ssh:unknown-host', h)
    return () => ipcRenderer.removeListener('ssh:unknown-host', h)
  },
  onSSHHostKeyChanged: (cb) => {
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onSSHHostKeyChanged:', e) } }
    ipcRenderer.on('ssh:host-key-changed', h)
    return () => ipcRenderer.removeListener('ssh:host-key-changed', h)
  },
  onSSHKeyboardInteractive: (cb) => {
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onSSHKeyboardInteractive:', e) } }
    ipcRenderer.on('ssh:keyboard-interactive', h)
    return () => ipcRenderer.removeListener('ssh:keyboard-interactive', h)
  },
  replySSHTrustHost:          (id, trust)    => ipcRenderer.send(`ssh:trust-host:${id}`, { trust }),
  replySSHKeyboardInteractive:(id, responses)=> ipcRenderer.send(`ssh:keyboard-interactive-reply:${id}`, { responses }),

  // Menu events from main process
  onMenuEvent: (cb) => {
    const events = ['settings','new-session','new-tab','close-tab','broadcast','find','clear',
                    'split-h','split-v','toggle-log','toggle-ai','sftp','palette']
    const handlers = events.map(ev => {
      const h = () => cb(ev)
      ipcRenderer.on(`menu:${ev}`, h)
      return () => ipcRenderer.removeListener(`menu:${ev}`, h)
    })
    return () => handlers.forEach(fn => fn())
  },

  // ── AI ───────────────────────────────────────────────────────────────────────
  aiChat: (params) => ipcRenderer.invoke('ai:chat', params),
  agentChat: (params) => ipcRenderer.invoke('ai:agent-chat', params),
  onAIStreamChunk: (cb) => {
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onAIStreamChunk:', e) } }
    ipcRenderer.on('ai:stream-chunk', h)
    return () => ipcRenderer.removeListener('ai:stream-chunk', h)
  },
  onAIStreamDone: (cb) => {
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onAIStreamDone:', e) } }
    ipcRenderer.on('ai:stream-done', h)
    return () => ipcRenderer.removeListener('ai:stream-done', h)
  },

  // ── SFTP ─────────────────────────────────────────────────────────────────────
  sftpList:     (opts) => ipcRenderer.invoke('sftp:list',     opts),
  sftpDownload: (opts) => ipcRenderer.invoke('sftp:download', opts),
  sftpUpload:   (opts) => ipcRenderer.invoke('sftp:upload',   opts),
  sftpMkdir:    (opts) => ipcRenderer.invoke('sftp:mkdir',    opts),
  sftpDelete:   (opts) => ipcRenderer.invoke('sftp:delete',   opts),

  // ── Port forwarding ──────────────────────────────────────────────────────────
  portFwdStart: (opts) => ipcRenderer.invoke('portfwd:start', opts),
  portFwdStop:  (opts) => ipcRenderer.invoke('portfwd:stop',  opts),
  portFwdList:  ()     => ipcRenderer.invoke('portfwd:list'),
  onPortFwdError: (cb) => {
    const h = (_e, d) => { try { cb(d) } catch (e) { logToMain('error', 'onPortFwdError:', e) } }
    ipcRenderer.on('portfwd:error', h)
    return () => ipcRenderer.removeListener('portfwd:error', h)
  },

  // ── Logging ──────────────────────────────────────────────────────────────────
  logStart:   (opts) => ipcRenderer.invoke('log:start',    opts),
  logWrite:   (opts) => ipcRenderer.invoke('log:write',    opts),
  logStop:    (opts) => ipcRenderer.invoke('log:stop',     opts),
  logOpenDir: ()     => ipcRenderer.invoke('log:open-dir'),
  logList:    ()     => ipcRenderer.invoke('log:list'),

  // ── Macros ───────────────────────────────────────────────────────────────────
  macroRun: (opts) => ipcRenderer.invoke('macro:run', opts),

  // ── Serial ports ─────────────────────────────────────────────────────────────
  serialList: () => ipcRenderer.invoke('serial:list'),

  // ── Known hosts ──────────────────────────────────────────────────────────────
  hostsList:   () => ipcRenderer.invoke('hosts:list'),
  hostsDelete: (opts) => ipcRenderer.invoke('hosts:delete', opts),

  // ── Session import/export ─────────────────────────────────────────────────────
  sessionsExport: (opts) => ipcRenderer.invoke('sessions:export', opts),
  sessionsImport: ()     => ipcRenderer.invoke('sessions:import'),
  sessionsImportSecureCRT: () => ipcRenderer.invoke('sessions:importSecureCRT'),

  // ── Dialogs ──────────────────────────────────────────────────────────────────
  openFile: (opts) => ipcRenderer.invoke('dialog:open-file', opts),
  saveFile: (opts) => ipcRenderer.invoke('dialog:save-file', opts),
})
