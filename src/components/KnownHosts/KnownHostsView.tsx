import { useState, useEffect, useCallback } from 'react'
import { Trash2, Shield, RefreshCw, Copy, Check } from 'lucide-react'
import './KnownHostsView.css'

const api = (window as any).netlensAPI

interface KnownHost { host: string; port: number; fingerprint: string; addedAt: number }

function fmtFingerprint(fp: string) { return fp.match(/.{1,8}/g)?.join(':') || fp }

export default function KnownHostsView() {
  const [hosts, setHosts] = useState<KnownHost[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const raw = await api?.hostsList() || []
    const list = Array.isArray(raw) ? raw : []
    setHosts(list.sort((a: KnownHost, b: KnownHost) => a.host.localeCompare(b.host)))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const remove = async (host: string, port: number) => {
    await api?.hostsDelete({ host, port })
    setHosts(h => h.filter(x => !(x.host === host && x.port === port)))
  }

  const copyFingerprint = async (host: string, fp: string) => {
    try {
      await navigator.clipboard.writeText(fp)
      setCopied(`${host}:${fp}`)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
  }

  return (
    <div className="kh-view">
      <div className="kh-header">
        <div>
          <h2>Known Hosts</h2>
          <p>SSH host keys trusted by NetLens. Verify fingerprints before connecting to untrusted networks.</p>
        </div>
        <button className="btn-secondary" onClick={load}><RefreshCw size={13} /> Refresh</button>
      </div>

      {loading ? (
        <div className="lv-skeleton">
          <div className="skeleton-row" style={{ width: '50%' }} />
          <div className="skeleton-row" style={{ width: '75%' }} />
          <div className="skeleton-row" style={{ width: '60%' }} />
          <div className="skeleton-row" style={{ width: '85%' }} />
        </div>
      ) : hosts.length === 0 ? (
        <div className="kh-empty">
          <Shield size={28} strokeWidth={1.5} />
          <p>No trusted hosts yet. When you connect to a new SSH server and accept its host key, it will appear here.</p>
        </div>
      ) : (
        <div className="kh-table">
          <div className="kh-thead">
            <span>Host</span><span>Port</span><span>Fingerprint (SHA-256)</span><span>Trusted Since</span><span />
          </div>
          {hosts.map(h => {
            const fpFormatted = fmtFingerprint(h.fingerprint)
            return (
              <div key={`${h.host}:${h.port}`} className="kh-row">
                <span className="font-mono kh-host">{h.host}</span>
                <span className="font-mono kh-port">{h.port}</span>
                <span className="font-mono kh-fp" title="Click to copy">
                  {fpFormatted}
                </span>
                <span className="kh-date" title="First trusted">
                  {h.addedAt ? new Date(h.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
                <div className="kh-actions">
                  <button
                    className="kh-action-btn"
                    onClick={() => copyFingerprint(h.host, h.fingerprint)}
                    title={copied === `${h.host}:${h.fingerprint}` ? 'Copied!' : 'Copy fingerprint'}
                  >
                    {copied === `${h.host}:${h.fingerprint}` ? <Check size={11} /> : <Copy size={11} />}
                  </button>
                  <button className="kh-action-btn danger" onClick={() => remove(h.host, h.port)} title="Remove trust">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="kh-info">
        <Shield size={12} />
        <span>Host key fingerprints are verified on each connection. If a server's key changes, you'll be alerted before connecting.</span>
      </div>
    </div>
  )
}
