import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../services/endpoints';
import type { SelectedCandidateDetailResponse } from '../../types';

export default function HrSelectedPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [candidates, setCandidates] = useState<SelectedCandidateDetailResponse[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setCandidates((await hrApi.getSelectedCandidates(jobId!)).data);
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to load';
        setError(msg);
      }
    })();
  }, [jobId]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">✅ Selected Candidates</h1>
        <button className="btn btn-outline" onClick={() => navigate('/hr/jobs')}>← Back</button>
      </div>

      {error && <div className="empty-state">{error}</div>}

      {!error && candidates.length === 0 && (
        <div className="empty-state">No selected candidates for this job yet.</div>
      )}

      {candidates.map(c => (
        <div className="card" key={c.applicationId}>
          <div className="card-header">
            <span className="card-title">{c.candidateName}</span>
            <span className="badge badge-selected">SELECTED</span>
          </div>

          <div className="form-row" style={{ marginBottom: 12 }}>
            <div>
              <p><strong>Email:</strong> {c.candidateEmail}</p>
              <p><strong>Mobile:</strong> {c.candidateMobile}</p>
              <p><strong>Category:</strong> <span className={`badge badge-${c.category.toLowerCase()}`}>{c.category}</span></p>
            </div>
            <div>
              <p><strong>Experience:</strong> {c.experienceYears} years</p>
              <p><strong>Expected Salary:</strong> {c.expectedSalaryRange || 'Not specified'}</p>
              <p><strong>Job:</strong> {c.jobTitle} @ {c.companyName}</p>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <strong>Skills: </strong>
            <span className="tags" style={{ display: 'inline-flex' }}>
              {c.skills?.map(s => <span className="tag" key={s}>{s}</span>)}
            </span>
          </div>

          {c.resumeUrl && (
            <p><a href={c.resumeUrl} target="_blank" className="link">📄 View Resume</a></p>
          )}
        </div>
      ))}
    </>
  );
}

