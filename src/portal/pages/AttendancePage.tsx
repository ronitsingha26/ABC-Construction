import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { usePortalStore } from '../store'

export function AttendancePage() {
  const { projects, employees, dailyAttendance, leaveRequests, updateLeaveStatus } = usePortalStore()
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves'>('attendance')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all')
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().split('T')[0])

  // Filter employees by project
  const filteredEmployees = employees.filter((e) =>
    selectedProjectId === 'all' ? true : e.assignedProjectId === selectedProjectId
  )

  const pendingLeaves = leaveRequests.filter((r) => r.status === 'Pending')
  const historyLeaves = leaveRequests.filter((r) => r.status !== 'Pending')

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">Attendance & Leaves</h1>
          <p className="mt-1 text-muted">Manage workforce attendance and leave requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'attendance'
              ? 'bg-orange-500 text-text'
              : 'text-muted hover:bg-card hover:bg-slate-50 hover:text-text'
          }`}
        >
          Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'leaves'
              ? 'bg-orange-500 text-text'
              : 'text-muted hover:bg-card hover:bg-slate-50 hover:text-text'
          }`}
        >
          Leave Requests
          {pendingLeaves.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-text">
              {pendingLeaves.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'attendance' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card hover:bg-slate-50 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-muted whitespace-nowrap">
                Select Project:
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="input py-2 w-full sm:w-64"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-sm font-medium text-muted whitespace-nowrap">Date:</label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="input py-2 w-full sm:w-auto"
              />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-card hover:bg-slate-50 text-muted">
                    <th className="px-4 py-3 font-medium">Employee Name</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Punch In</th>
                    <th className="px-4 py-3 font-medium">Punch Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEmployees.map((emp) => {
                    const record = dailyAttendance.find(
                      (a) => a.employeeId === emp.id && a.date === dateStr
                    )
                    const project = projects.find((p) => p.id === emp.assignedProjectId)
                    return (
                      <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-text font-medium">{emp.name}</td>
                        <td className="px-4 py-3 text-muted">{emp.role}</td>
                        <td className="px-4 py-3 text-muted">
                          {project ? project.name : 'Unassigned'}
                        </td>
                        <td className="px-4 py-3">
                          {record?.status === 'Present' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
                              Present
                            </span>
                          ) : record?.status === 'Absent' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-600 border border-red-500/20">
                              Absent
                            </span>
                          ) : record?.status === 'On Leave' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2 py-1 text-xs font-semibold text-orange-400 border border-orange-500/20">
                              On Leave
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-card hover:bg-slate-50 px-2 py-1 text-xs font-semibold text-muted border border-border">
                              Not Punched In
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {record?.punchInTime || '-'}
                        </td>
                        <td className="px-4 py-3 text-secondary">
                          {record?.punchOutTime || '-'}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted">
                        No employees found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'leaves' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Pending Leaves */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
            {pendingLeaves.length === 0 ? (
              <p className="text-muted text-sm">No pending leave requests.</p>
            ) : (
              <div className="grid gap-4">
                {pendingLeaves.map((req) => {
                  const emp = employees.find((e) => e.id === req.employeeId)
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-orange-500/30 bg-orange-500/5"
                    >
                      <div>
                        <h3 className="font-semibold text-text">{emp?.name || 'Unknown'}</h3>
                        <p className="text-sm text-muted mt-1">
                          {req.startDate} to {req.endDate}
                        </p>
                        <p className="text-sm text-muted mt-1">Reason: {req.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateLeaveStatus(req.id, 'Approved')}
                          className="btn bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border border-emerald-500/20"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(req.id, 'Rejected')}
                          className="btn bg-red-500/20 text-red-600 hover:bg-red-500/30 border border-red-500/20"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* History Leaves */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Leave History</h2>
            {historyLeaves.length === 0 ? (
              <p className="text-muted text-sm">No leave history.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card hover:bg-slate-50 text-muted">
                      <th className="px-4 py-3 font-medium">Employee</th>
                      <th className="px-4 py-3 font-medium">Date Range</th>
                      <th className="px-4 py-3 font-medium">Reason</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyLeaves.map((req) => {
                      const emp = employees.find((e) => e.id === req.employeeId)
                      return (
                        <tr key={req.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-text">{emp?.name}</td>
                          <td className="px-4 py-3 text-muted">
                            {req.startDate} - {req.endDate}
                          </td>
                          <td className="px-4 py-3 text-muted">{req.reason}</td>
                          <td className="px-4 py-3">
                            {req.status === 'Approved' ? (
                              <span className="text-emerald-600 font-semibold">{req.status}</span>
                            ) : (
                              <span className="text-red-600 font-semibold">{req.status}</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
