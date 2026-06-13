import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Calendar as CalendarIcon, HardHat, CheckCircle2 } from 'lucide-react'
import { usePortalStore } from '../store'
import { usePortalAuth } from '../auth'

export function EmployeeDashboard() {
  const { user } = usePortalAuth()
  const { employees, projects, dailyAttendance, punchIn, punchOut, applyLeave, leaveRequests } = usePortalStore()

  // For demo, we assume the user's name matches an employee, or we pick the first one.
  const employee = employees.find((e) => e.name === user?.name) || employees[0]
  const project = projects.find((p) => p.id === employee?.assignedProjectId)
  
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecord = dailyAttendance.find((a) => a.employeeId === employee?.id && a.date === todayStr)

  const [leaveReason, setLeaveReason] = useState('')
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')

  const handlePunchIn = () => {
    if (!employee) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    punchIn(employee.id, todayStr, time)
  }

  const handlePunchOut = () => {
    if (!employee) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    punchOut(employee.id, todayStr, time)
  }

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee || !leaveStart || !leaveEnd || !leaveReason) return
    applyLeave({
      employeeId: employee.id,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
    })
    setLeaveReason('')
    setLeaveStart('')
    setLeaveEnd('')
  }

  const myLeaves = leaveRequests.filter((r) => r.employeeId === employee?.id)

  if (!employee) {
    return <div className="container-page py-8 text-text">No employee profile found.</div>
  }

  return (
    <div className="container-page py-8 space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Good Morning, {employee.name}</h1>
        <p className="mt-1 text-muted">Here is your daily overview and tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Daily Attendance</h2>
              <p className="text-sm text-muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="space-y-4">
            {todayRecord?.punchInTime ? (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Punched In
                  </p>
                  <p className="text-sm text-muted mt-1">At {todayRecord.punchInTime}</p>
                </div>
                {!todayRecord.punchOutTime ? (
                  <button onClick={handlePunchOut} className="btn bg-orange-500 hover:bg-orange-600 text-text border-none shadow-lg shadow-orange-500/20">
                    Punch Out
                  </button>
                ) : (
                  <div className="text-right">
                    <p className="text-muted text-sm font-medium">Punched Out</p>
                    <p className="text-sm text-muted mt-1">At {todayRecord.punchOutTime}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-border rounded-xl">
                <p className="text-muted mb-4">You haven't punched in today.</p>
                <button onClick={handlePunchIn} className="btn bg-orange-500 hover:bg-orange-600 text-text border-none shadow-lg shadow-orange-500/20 w-full">
                  Punch In Now
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Assigned Project */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
              <HardHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Assigned Project</h2>
              <p className="text-sm text-muted">Current deployment site</p>
            </div>
          </div>

          {project ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card hover:bg-slate-50">
                <h3 className="font-semibold text-lg text-text">{project.name}</h3>
                <p className="text-sm text-muted mt-1">{project.location}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card hover:bg-slate-50">
                  <p className="text-xs text-muted mb-1">Status</p>
                  <p className="font-semibold text-sky-400">{project.status}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card hover:bg-slate-50">
                  <p className="text-xs text-muted mb-1">Overall Progress</p>
                  <p className="font-semibold text-text">{project.progress}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-border text-center">
              <p className="text-muted">You are not currently assigned to any project.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Leave Application & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Apply for Leave</h2>
              <p className="text-sm text-muted">Submit a new leave request</p>
            </div>
          </div>

          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted font-medium mb-1 block">Start Date</label>
                <input
                  type="date"
                  required
                  value={leaveStart}
                  onChange={(e) => setLeaveStart(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted font-medium mb-1 block">End Date</label>
                <input
                  type="date"
                  required
                  value={leaveEnd}
                  onChange={(e) => setLeaveEnd(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted font-medium mb-1 block">Reason</label>
              <textarea
                required
                value={leaveReason}
                onChange={(e) => setLeaveReason(e.target.value)}
                className="input w-full min-h-[100px] resize-none"
                placeholder="Why do you need leave?"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Submit Request
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
          <h2 className="text-xl font-bold mb-6">My Leave Requests</h2>
          {myLeaves.length === 0 ? (
            <p className="text-sm text-muted">You have no leave history.</p>
          ) : (
            <div className="space-y-3">
              {myLeaves.map((req) => (
                <div key={req.id} className="p-4 rounded-xl border border-border bg-card hover:bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-secondary font-medium">
                      {req.startDate} to {req.endDate}
                    </p>
                    <p className="text-xs text-muted mt-1">{req.reason}</p>
                  </div>
                  <div>
                    {req.status === 'Approved' ? (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        Approved
                      </span>
                    ) : req.status === 'Rejected' ? (
                      <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                        Rejected
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
