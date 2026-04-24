import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../services/endpoints';
import type { JobResponse } from '../../types';
import toast from 'react-hot-toast';

export default function HrJobsPage() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', skillset: '', category: 'TECHNICAL' as const,
    location: '', salaryMin: '', salaryMax: '',
    requiredQualifications: '', preferredQualifications: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try { setJobs((await hrApi.getMyJobs()).data); }
    catch { toast.error('Failed to load jobs'); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const salaryMin = form.salaryMin ? parseFloat(form.salaryMin) : null;
    const salaryMax = form.salaryMax ? parseFloat(form.salaryMax) : null;
    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      toast.error('Min salary cannot exceed max salary');
      return;
    }
    if ((salaryMin !== null && salaryMax === null) || (salaryMin === null && salaryMax !== null)) {
      toast.error('Both salary min and max must be provided together');
      return;
    }
    setLoading(true);
    try {
      await hrApi.postJob({
        title: form.title, description: form.description,
        skillset: form.skillset.split(',').map(s => s.trim()).filter(Boolean),
        requiredQualifications: form.requiredQualifications.split(',').map(s => s.trim()).filter(Boolean),
        preferredQualifications: form.preferredQualifications.split(',').map(s => s.trim()).filter(Boolean),
        category: form.category, location: form.location || undefined,
        salaryMin: salaryMin, salaryMax: salaryMax,
      });
      toast.success('Job posted');
      setShowModal(false);
      setForm({ title: '', description: '', skillset: '', category: 'TECHNICAL', location: '', salaryMin: '', salaryMax: '', requiredQualifications: '', preferredQualifications: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Posted Jobs</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Post Job</button>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">No jobs posted yet.</div>
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
            {job.requiredQualifications?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <strong>Required Qualifications: </strong>
                <span className="tags" style={{ display: 'inline-flex' }}>
                  {job.requiredQualifications.map(q => <span className="tag" key={q}>{q}</span>)}
                </span>
              </div>
            )}
            {job.preferredQualifications?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <strong>Preferred Qualifications: </strong>
                <span className="tags" style={{ display: 'inline-flex' }}>
                  {job.preferredQualifications.map(q => <span className="tag" key={q}>{q}</span>)}
                </span>
              </div>
            )}
            {job.location && <p><strong>Location:</strong> {job.location}</p>}
            {job.salaryRange && <p><strong>Salary:</strong> {job.salaryRange}</p>}
            <p className="text-muted" style={{ fontSize: '.85rem' }}>Company: {job.companyName}</p>
            <div className="flex-gap mt-8">
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/hr/jobs/${job.id}/applications`)}>
                📋 Applications
              </button>
              <button className="btn btn-warning btn-sm" onClick={() => navigate(`/hr/jobs/${job.id}/match`)}>
                🤖 AI Match
              </button>
              <button className="btn btn-success btn-sm" onClick={() => navigate(`/hr/jobs/${job.id}/selected`)}>
                ✅ Selected
              </button>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Post a Job</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Job Title *</label>
                <input className="form-control" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea className="form-control" rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Skills (comma-separated)</label>
                <input className="form-control" value={form.skillset}
                  onChange={e => setForm(f => ({ ...f, skillset: e.target.value }))}
                  placeholder="Java, Spring Boot, PostgreSQL" />
              </div>
              <div className="form-group">
                <label>Required Qualifications (comma-separated)</label>
                <textarea className="form-control" rows={2} value={form.requiredQualifications}
                  onChange={e => setForm(f => ({ ...f, requiredQualifications: e.target.value }))}
                  placeholder="Bachelor's in CS, 3+ years experience, Strong Java skills" />
              </div>
              <div className="form-group">
                <label>Preferred Qualifications (comma-separated)</label>
                <textarea className="form-control" rows={2} value={form.preferredQualifications}
                  onChange={e => setForm(f => ({ ...f, preferredQualifications: e.target.value }))}
                  placeholder="Master's degree, Cloud experience, Leadership skills" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}>
                    <option value="TECHNICAL">Technical</option>
                    <option value="NON_TECHNICAL">Non-Technical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input className="form-control" value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Salary (LPA, optional)</label>
                  <input className="form-control" type="number" step="0.1" min="0" value={form.salaryMin}
                    onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Max Salary (LPA, optional)</label>
                  <input className="form-control" type="number" step="0.1" min="0" value={form.salaryMax}
                    onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={loading}>{loading ? 'Posting...' : 'Post Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
