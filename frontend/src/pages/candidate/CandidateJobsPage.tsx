import { useEffect, useState } from 'react';
import { candidateApi } from '../../services/endpoints';
import type { JobResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setJobs((await candidateApi.getAvailableJobs()).data); }
      catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load jobs'); }
    })();
  }, []);

  const apply = async (jobId: string) => {
    setApplying(jobId);
    try {
      await candidateApi.applyToJob(jobId);
      toast.success('Applied successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(null); }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Available Jobs</h1>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">No matching jobs available. Make sure your profile category is set.</div>
      ) : (
        jobs.map(job => (
          <div className="card" key={job.id}>
            <div className="card-header">
              <span className="card-title">{job.title}</span>
              <span className={`badge badge-${job.category.toLowerCase()}`}>{job.category}</span>
            </div>
            <p className="text-muted" style={{ marginBottom: 8 }}>{job.description}</p>
            <div style={{ marginBottom: 8 }}>
              <strong>Skills: </strong>
              <span className="tags" style={{ display: 'inline-flex' }}>
                {job.skillset?.map(s => <span className="tag" key={s}>{s}</span>)}
              </span>
            </div>
            {job.location && <p><strong>Location:</strong> {job.location}</p>}
            {job.salaryRange && <p><strong>Salary:</strong> {job.salaryRange}</p>}
            <p className="text-muted" style={{ fontSize: '.85rem' }}>
              {job.companyName} • Posted by {job.postedBy}
            </p>
            <button className="btn btn-primary btn-sm mt-8"
              disabled={applying === job.id}
              onClick={() => apply(job.id)}>
              {applying === job.id ? 'Applying...' : '📩 Apply'}
            </button>
          </div>
        ))
      )}
    </>
  );
}

