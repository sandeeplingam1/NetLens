export interface HelixAPI {
  platform: string

  storeGet: (key: string) => Promise<any>
  storeSet: (key: string, value: any) => Promise<any>

  keychainSave:   (opts: { account: string; password: string }) => Promise<{ ok: boolean; fallback?: boolean }>
  keychainGet:    (opts: { account: string }) => Promise<string | null>
  keychainDelete: (opts: { account: string }) => Promise<{ ok: boolean }>

  terminalCreateLocal:  (opts: { id: string; cols: number; rows: number }) => Promise<{ ok: boolean; pid?: number } | { error: string }>
  terminalCreateSSH:    (cfg: any) => Promise<{ ok: boolean } | { error: string }>
  terminalCreateTelnet: (cfg: any) => Promise<{ ok: boolean } | { error: string }>
  terminalCreateSerial: (cfg: any) => Promise<{ ok: boolean } | { error: string }>
  terminalInput:        (opts: { id: string; data: string }) => Promise<void>
  terminalResize:       (opts: { id: string; cols: number; rows: number }) => Promise<void>
  terminalKill:         (opts: { id: string }) => Promise<void>
  terminalBroadcast:    (opts: { id: string; data: string }) => Promise<void>
  terminalReconnect:    (opts: { id: string }) => Promise<{ ok?: boolean; error?: string }>

  onTerminalOutput: (id: string, cb: (data: string) => void) => () => void
  onTerminalExit:   (id: string, cb: (code: number) => void) => () => void

  onSSHUnknownHost:          (cb: (ev: any) => void) => () => void
  onSSHHostKeyChanged:       (cb: (ev: any) => void) => () => void
  onSSHKeyboardInteractive:  (cb: (ev: any) => void) => () => void
  replySSHTrustHost:          (id: string, trust: boolean) => void
  replySSHKeyboardInteractive: (id: string, responses: string[]) => void

  onMenuEvent: (cb: (ev: string) => void) => () => void

  onAIStreamChunk: (cb: (d: { streamId: string; delta: string }) => void) => () => void
  onAIStreamDone:  (cb: (d: { streamId: string; content: string; error?: string }) => void) => () => void
  aiChat: (opts: any) => Promise<any>

  sftpList:     (opts: any) => Promise<any>
  sftpDownload: (opts: any) => Promise<any>
  sftpUpload:   (opts: any) => Promise<any>
  sftpMkdir:    (opts: any) => Promise<any>
  sftpDelete:   (opts: any) => Promise<any>

  portFwdStart: (opts: any) => Promise<any>
  portFwdStop:  (opts: any) => Promise<any>
  portFwdList:  () => Promise<any>
  onPortFwdError: (cb: (d: any) => void) => () => void

  logStart:   (opts: { id: string; name: string }) => Promise<{ ok: boolean; logPath?: string }>
  logWrite:   (opts: { id: string; data: string }) => Promise<void>
  logStop:    (opts: { id: string }) => Promise<void>
  logOpenDir: () => Promise<void>
  logList:    () => Promise<any[]>

  macroRun: (opts: { terminalId: string; commands: { cmd: string; delay: number }[] }) => Promise<any>

  serialList: () => Promise<any>

  hostsList:   () => Promise<any>
  hostsDelete: (opts: { key: string }) => Promise<any>

  sessionsExport: (opts: any) => Promise<any>
  sessionsImport: () => Promise<any>
  sessionsImportSecureCRT: () => Promise<any>

  openFile: (opts: any) => Promise<any>
  saveFile: (opts: any) => Promise<any>

  agentChat: (opts: any) => Promise<any>
}

declare global {
  interface Window {
    netlensAPI?: HelixAPI
  }
}
