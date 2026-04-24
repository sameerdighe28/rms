import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateApi } from '../../services/endpoints';
import type { JobApplicationResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CandidateApplicationsPage() {
  const [apps, setApps] = useState<JobApplicationResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { setApps((await candidateApi.getMyApplications()).data); }
      catch { toast.error('Failed to load applications'); }
    })();
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">You haven't applied to any jobs yet.</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Job Title</th><th>Company</th><th>Status</th><th>Applied On</th><th>Actions</th></tr></thead>
          <tbody>
            {apps.map(app => (
              <tr key={app.id}>
                <td><strong>{app.jobTitle}</strong></td>
                <td>{app.companyName}</td>
                <td><span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span></td>
                <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-outline"
                    onClick={() => navigate(`/candidate/mock-test/${app.id}`)}>
                    📝 Mock Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
