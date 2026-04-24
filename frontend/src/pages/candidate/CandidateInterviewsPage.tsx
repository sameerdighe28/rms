import { useEffect, useState } from 'react';
import { candidateApi } from '../../services/endpoints';
import type { InterviewResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CandidateInterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewResponse[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const load = async () => {
    try { setInterviews((await candidateApi.getMyInterviews()).data); }
    catch { toast.error('Failed to load interviews'); }
  };

  useEffect(() => { load(); }, []);

  const handlePostpone = async (interviewId: string) => {
    if (!confirm('Are you sure you want to postpone this interview? The next candidate in queue will get this slot.')) return;
    setLoading(interviewId);
    try {
      await candidateApi.postponeInterview(interviewId);
      toast.success('Interview postponed. You have been moved to the end of the queue.');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to postpone'); }
    finally { setLoading(null); }
  };

  const scheduled = interviews.filter(i => i.status === 'SCHEDULED');
  const others = interviews.filter(i => i.status !== 'SCHEDULED');

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Interviews</h1>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state">No interviews scheduled yet.</div>
      ) : (
        <>
          {scheduled.length > 0 && (
            <>
              <h2 style={{ marginBottom: 12 }}>📅 Upcoming Interviews</h2>
              {scheduled.map(interview => (
                <div className="card" key={interview.id}>
                  <div className="card-header">
                    <span className="card-title">{interview.jobTitle}</span>
                    <span className="badge badge-technical">SCHEDULED</span>
                  </div>
                  <p><strong>Company:</strong> {interview.companyName}</p>
                  <p><strong>Scheduled At:</strong> {new Date(interview.scheduledAt).toLocaleString()}</p>
                  <p className="text-muted" style={{ fontSize: '.85rem' }}>
                    Postponements used: {interview.postponeCount}/2
                  </p>
                  <div className="flex-gap mt-8">
                    <button
                      className="btn btn-warning btn-sm"
                      disabled={loading === interview.id || interview.postponeCount >= 2}
                      onClick={() => handlePostpone(interview.id)}>
                      {loading === interview.id ? 'Postponing...' : '⏰ Postpone Interview'}
                    </button>
                    {interview.postponeCount >= 2 && (
                      <span className="text-muted" style={{ fontSize: '.85rem' }}>Max postponements reached</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {others.length > 0 && (
            <>
              <h2 style={{ marginBottom: 12, marginTop: 24 }}>📋 Past / Postponed Interviews</h2>
              <div className="table-wrap"><table>
                <thead><tr><th>Job</th><th>Company</th><th>Scheduled At</th><th>Status</th><th>Postponements</th></tr></thead>
                <tbody>
                  {others.map(i => (
                    <tr key={i.id}>
                      <td><strong>{i.jobTitle}</strong></td>
                      <td>{i.companyName}</td>
                      <td>{new Date(i.scheduledAt).toLocaleString()}</td>
                      <td><span className={`badge badge-${i.status.toLowerCase()}`}>{i.status}</span></td>
                      <td>{i.postponeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </>
          )}
        </>
      )}
    </>
  );
}

