import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../services/endpoints';
import type { JobApplicationResponse, UpdateApplicationStatusRequest } from '../../types';
import toast from 'react-hot-toast';

const nextStatuses: Record<string, string[]> = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEWING', 'REJECTED'],
  INTERVIEWING: ['SELECTED', 'REJECTED'],
};

export default function HrApplicationsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [apps, setApps] = useState<JobApplicationResponse[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try { setApps((await hrApi.getJobApplications(jobId!)).data); }
    catch { toast.error('Failed to load applications'); }
  };

  useEffect(() => { load(); }, [jobId]);

  const updateStatus = async (appId: string, status: string) => {
    setLoading(appId + status);
    try {
      await hrApi.updateApplicationStatus(appId, { status } as UpdateApplicationStatusRequest);
      toast.success(`Status updated to ${status}`);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(null); }
  };

  const handleScheduleInterview = async (appId: string) => {
    if (!scheduledAt) { toast.error('Please select a date/time'); return; }
    setLoading(appId + 'schedule');
    try {
      await hrApi.scheduleInterview(appId, { scheduledAt: new Date(scheduledAt).toISOString() });
      toast.success('Interview scheduled');
      setScheduleModal(null);
      setScheduledAt('');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(null); }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          Applications {apps.length > 0 && <span className="text-muted" style={{ fontSize: '1rem' }}>— {apps[0]?.jobTitle}</span>}
        </h1>
        <button className="btn btn-outline" onClick={() => navigate('/hr/jobs')}>← Back</button>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">No applications for this job yet.</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Candidate</th><th>Email</th><th>Applied At</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {apps.map(app => (
              <tr key={app.id}>
                <td><strong>{app.candidateName}</strong></td>
                <td>{app.candidateEmail}</td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td><span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span></td>
                <td>
                  <div className="flex-gap">
                    {(nextStatuses[app.status] || []).map(s => (
                      <button key={s}
                        className={`btn btn-sm ${s === 'REJECTED' ? 'btn-danger' : 'btn-primary'}`}
                        disabled={loading === app.id + s}
                        onClick={() => updateStatus(app.id, s)}>
                        {s}
                      </button>
                    ))}
                    {app.status === 'INTERVIEWING' && (
                      <button className="btn btn-sm btn-warning"
                        onClick={() => setScheduleModal(app.id)}>
                        📅 Schedule Interview
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {scheduleModal && (
        <div className="modal-overlay" onClick={() => setScheduleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Schedule Interview</h2>
            <div className="form-group">
              <label>Interview Date & Time *</label>
              <input className="form-control" type="datetime-local" value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setScheduleModal(null)}>Cancel</button>
              <button className="btn btn-primary"
                disabled={loading === scheduleModal + 'schedule'}
                onClick={() => handleScheduleInterview(scheduleModal)}>
                {loading === scheduleModal + 'schedule' ? 'Scheduling...' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
