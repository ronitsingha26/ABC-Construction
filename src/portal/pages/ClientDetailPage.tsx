import { useEffect, useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { downloadTextFile } from '../../lib/download'
import { usePortalStore } from '../store'
import { usePortalToast } from '../toast'
import { Badge, EmptyState, Modal, PortalButton, PortalCard, TableShell } from '../ui'

type Tab = 'projects' | 'payments' | 'documents' | 'notes'

function toneForStatus(s: string) {
  if (s === 'Completed') return 'green'
  if (s === 'Delayed') return 'red'
  if (s === 'Planning') return 'blue'
  return 'orange'
}

export function ClientDetailPage() {
  const { id } = useParams()
  const store = usePortalStore()
  const toast = usePortalToast()
  const client = store.clients.find((c) => c.id === id)
  const { updateClient } = store

  const [noteDraft, setNoteDraft] = useState('')
  useEffect(() => {
    setNoteDraft('')
  }, [client?.id])

  const [tab, setTab] = useState<Tab>('projects')
  const [openDocs, setOpenDocs] = useState(false)

  const clientProjects = useMemo(() => {
    if (!client) return []
    return store.projects.filter((p) => p.clientId === client.id)
  }, [client, store.projects])

  const payments = useMemo(() => {
    if (!client) return []
    const inv = store.invoices
      .filter((i) => i.clientId === client.id)
      .map((i) => ({
        date: i.issuedDate,
        text: `Invoice ${i.id} issued`,
        tone: i.status === 'Paid' ? 'green' : i.status === 'Overdue' ? 'red' : 'orange',
      }))
    const tx = store.transactions
      .filter((t) => t.type === 'Income' && t.projectId && clientProjects.some((p) => p.id === t.projectId))
      .map((t) => ({
        date: t.date,
        text: `Payment received ₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(t.amountRupees)} — ${t.description}`,
        tone: 'green' as const,
      }))
    return [...tx, ...inv].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12)
  }, [client, clientProjects, store.invoices, store.transactions])

  const documents = useMemo(() => {
    if (!client) return []
    return [
      { name: 'Contract.pdf', type: 'Contract', size: '1.2 MB' },
      { name: 'Blueprint.pdf', type: 'Blueprint', size: '8.4 MB' },
      { name: 'BOQ.xlsx', type: 'BOQ', size: '420 KB' },
      { name: 'Safety-Checklist.pdf', type: 'Compliance', size: '640 KB' },
    ]
  }, [client])

  if (!client) {
    return (
      <div className="space-y-6">
        <PortalCard>
          <div className="font-heading text-2xl font-extrabold text-white">Client Profile</div>
          <div className="mt-1 text-sm text-white/60">Client not found.</div>
          <div className="mt-4">
            <Link to="/portal/clients">
              <PortalButton variant="outline">Back to Clients</PortalButton>
            </Link>
          </div>
        </PortalCard>
        <EmptyState title="No client data" subtitle="This client ID does not exist in the store." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PortalCard className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-xs font-semibold text-white/55">Client Profile</div>
          <div className="mt-1 font-heading text-2xl font-extrabold text-white">{client.name}</div>
          <div className="mt-2 text-sm text-white/65">
            {client.contactPerson ? (
              <>
                <span className="font-semibold text-white/85">{client.contactPerson}</span> • {client.phone}
              </>
            ) : (
              client.phone
            )}
          </div>
          <div className="mt-1 text-sm text-white/55">{client.email}</div>
          <div className="mt-3 text-xs font-semibold text-white/45">
            {client.address ? `${client.address} • ` : ''}
            {client.city}
            {client.gstin ? ` • GSTIN: ${client.gstin}` : ''}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/portal/clients">
            <PortalButton variant="outline">Back</PortalButton>
          </Link>
          <PortalButton variant="outline" onClick={() => setOpenDocs(true)}>
            <FileText className="h-4 w-4" />
            Documents
          </PortalButton>
        </div>
      </PortalCard>

      <PortalCard>
        <div className="flex items-center gap-2">
          {(
            [
              { id: 'projects', label: 'Projects' },
              { id: 'payments', label: 'Payments' },
              { id: 'documents', label: 'Documents' },
              { id: 'notes', label: 'Notes' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                tab === t.id
                  ? 'bg-orange-500 text-slate-950'
                  : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </PortalCard>

      {tab === 'projects' && (
        clientProjects.length === 0 ? (
          <EmptyState title="No projects" subtitle="This client has no linked projects yet." />
        ) : (
          <TableShell>
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs font-bold text-white/60">
                <tr>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {clientProjects.map((p) => (
                  <tr key={p.id} className="text-white/80">
                    <td className="px-5 py-4 font-extrabold text-white">{p.name}</td>
                    <td className="px-5 py-4">{p.city}</td>
                    <td className="px-5 py-4">
                      ₹{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(p.budgetRupees)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={toneForStatus(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right font-extrabold text-white">{p.progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        )
      )}

      {tab === 'payments' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-white">Payment History</div>
          <div className="mt-1 text-xs font-semibold text-white/55">Latest 12 events</div>
          <div className="mt-5 space-y-3">
            {payments.length === 0 ? (
              <EmptyState title="No payments" subtitle="No invoices or income transactions found for this client yet." />
            ) : (
              payments.map((p, idx) => (
                <div
                  key={`${p.date}-${idx}`}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div
                    className={[
                      'mt-1 h-2 w-2 rounded-full',
                      p.tone === 'green' ? 'bg-emerald-400' : p.tone === 'red' ? 'bg-red-400' : 'bg-orange-400',
                    ].join(' ')}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white/50">{p.date}</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">{p.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </PortalCard>
      )}

      {tab === 'documents' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-white">Documents</div>
          <div className="mt-1 text-xs font-semibold text-white/55">Client & project files (demo)</div>
          <div className="mt-5">
            <TableShell>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs font-bold text-white/60">
                  <tr>
                    <th className="px-5 py-3">File</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {documents.map((d) => (
                    <tr key={d.name} className="text-white/80">
                      <td className="px-5 py-4 font-semibold text-white">{d.name}</td>
                      <td className="px-5 py-4">{d.type}</td>
                      <td className="px-5 py-4 text-white/60">{d.size}</td>
                      <td className="px-5 py-4 text-right">
                        <PortalButton
                          variant="ghost"
                          aria-label={`Download ${d.name}`}
                          onClick={() => {
                            const body = [
                              `ABC Construction — ${d.name}`,
                              `Client: ${client?.name ?? '—'}`,
                              `Type: ${d.type}`,
                              `Size: ${d.size}`,
                              '',
                              'This is a demo document placeholder.',
                            ].join('\n')
                            downloadTextFile(d.name.replace(/\s+/g, '_'), body, 'text/plain;charset=utf-8')
                            toast.push({ tone: 'success', title: 'Download started' })
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </PortalButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          </div>
        </PortalCard>
      )}

      {tab === 'notes' && (
        <PortalCard>
          <div className="font-heading text-lg font-extrabold text-white">Internal Notes</div>
          <div className="mt-1 text-xs font-semibold text-white/55">Saved to this client record.</div>
          <div className="mt-5 space-y-4">
            {client.notes ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-xs font-semibold text-white/55">History</div>
                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm text-white/75">
                  {client.notes}
                </pre>
              </div>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-white/70">Add a note</span>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={5}
                className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none ring-orange-500/35 focus:ring-2"
                placeholder="Meeting outcomes, billing quirks, risk flags…"
              />
            </label>
            <div className="flex justify-end">
              <PortalButton
                disabled={!noteDraft.trim()}
                onClick={() => {
                  if (!client) return
                  const stamp = new Date().toLocaleString('en-IN')
                  const entry = noteDraft.trim()
                  const merged = `${client.notes?.trim() ? `${client.notes.trim()}\n\n` : ''}[${stamp}]\n${entry}`
                  updateClient(client.id, { notes: merged.trim() })
                  setNoteDraft('')
                  toast.push({ tone: 'success', title: 'Note saved' })
                }}
              >
                Append note
              </PortalButton>
            </div>
          </div>
        </PortalCard>
      )}

      <Modal
        open={openDocs}
        title="Documents"
        onClose={() => setOpenDocs(false)}
        footer={
          <div className="flex items-center justify-end">
            <PortalButton variant="outline" onClick={() => setOpenDocs(false)}>
              Close
            </PortalButton>
          </div>
        }
      >
        <div className="text-sm text-white/70">
          Use the <span className="font-semibold text-white">Documents</span> tab to download client files.
        </div>
      </Modal>
    </div>
  )
}

