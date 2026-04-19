import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../services/endpoints';
import type { ResumeMatchResponse } from '../../types';
import toast from 'react-hot-toast';

export default function HrMatchPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [result, setResult] = useState<ResumeMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const triggerMatch = async () => {
    setLoading(true);
    try {
      const res = await hrApi.matchCandidates(jobId!);
      setResult(res.data);
      toast.success('Matching complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ML engine failed');
    } finally { setLoading(false); }
  };

  const scoreClass = (score: number) => score >= 75 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low';

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🤖 AI Resume Matching</h1>
        <div className="flex-gap">
          <button className="btn btn-primary" onClick={triggerMatch} disabled={loading}>
            {loading ? 'Matching...' : 'Run AI Match'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/hr/jobs')}>← Back</button>
        </div>
      </div>

      {!result && !loading && (
        <div className="empty-state">
          Click "Run AI Match" to trigger the Python ML engine.<br />
          It will parse resumes and rank candidates by match score.
        </div>
      )}

      {result && (
        <>
          <div className="card mb-16">
            <h3>Job: {result.jobTitle}</h3>
            {result.jobRole && <p><strong>Detected Role:</strong> {result.jobRole}</p>}
            <p className="text-muted">Found {result.matchedCandidates.length} matching candidate(s)</p>
          </div>

          {result.bestCandidate && (
            <div className="card mb-16" style={{ borderLeft: '4px solid var(--success)' }}>
              <div className="card-header">
                <span className="card-title">⭐ Best Candidate: {result.bestCandidate.candidateName}</span>
                <span className={`match-score ${scoreClass(result.bestCandidate.matchScore)}`}>
                  {result.bestCandidate.matchScore.toFixed(1)}% match
                </span>
              </div>
              <p><strong>Email:</strong> {result.bestCandidate.candidateEmail}</p>
              <p><strong>Experience:</strong> {result.bestCandidate.experienceYears} years</p>
              <div style={{ margin: '8px 0' }}>
                <strong>Skills: </strong>
                <span className="tags" style={{ display: 'inline-flex' }}>
                  {result.bestCandidate.skills?.map(s => <span className="tag" key={s}>{s}</span>)}
                </span>
              </div>
              {result.bestCandidate.resumeUrl && (
                <p><a href={result.bestCandidate.resumeUrl} target="_blank" className="link">📄 View Resume</a></p>
              )}
            </div>
          )}

          <h3 className="mb-16">All Candidates (ranked by score)</h3>

          {result.matchedCandidates.map((c, i) => (
            <div className="card" key={c.candidateProfileId}>
              <div className="card-header">
                <span className="card-title">#{i + 1} {c.candidateName}</span>
                <span className={`match-score ${scoreClass(c.matchScore)}`}>
                  {c.matchScore.toFixed(1)}% match
                </span>
              </div>
              <p><strong>Email:</strong> {c.candidateEmail}</p>
              <p><strong>Experience:</strong> {c.experienceYears} years</p>
              <div style={{ margin: '8px 0' }}>
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
      )}
    </>
  );
}

