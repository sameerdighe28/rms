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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}

