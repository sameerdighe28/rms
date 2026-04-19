import { useEffect, useState, useRef, type FormEvent } from 'react';
import { candidateApi } from '../../services/endpoints';
import type { CandidateProfileResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    category: 'TECHNICAL' as const, skills: '',
    experienceYears: 0, expectedSalaryMin: '', expectedSalaryMax: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await candidateApi.getProfile();
      setProfile(res.data);
      setForm({
        category: res.data.category as any,
        skills: res.data.skills?.join(', ') || '',
        experienceYears: res.data.experienceYears,
        expectedSalaryMin: res.data.expectedSalaryMin?.toString() || '',
        expectedSalaryMax: res.data.expectedSalaryMax?.toString() || '',
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setIsNew(true);
        setEditing(true);
      }
    }
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      e.target.value = '';
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('File must have .pdf extension');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must not exceed 10MB');
      e.target.value = '';
      return;
    }
    setResumeFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const salMin = form.expectedSalaryMin ? parseFloat(form.expectedSalaryMin) : null;
    const salMax = form.expectedSalaryMax ? parseFloat(form.expectedSalaryMax) : null;
    if (salMin !== null && salMax !== null && salMin > salMax) {
      toast.error('Min expected salary cannot exceed max');
      return;
    }
    if ((salMin !== null && salMax === null) || (salMin === null && salMax !== null)) {
      toast.error('Both expected salary min and max must be provided together');
      return;
    }
    setLoading(true);
    const payload = {
      category: form.category,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      experienceYears: form.experienceYears,
      expectedSalaryMin: salMin,
      expectedSalaryMax: salMax,
    };
    try {
      if (isNew) {
        await candidateApi.createProfile(payload, resumeFile || undefined);
        toast.success('Profile created!');
        setIsNew(false);
      } else {
        await candidateApi.updateProfile(payload, resumeFile || undefined);
        toast.success('Profile updated!');
      }
      setEditing(false);
      setResumeFile(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  if (editing) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">{isNew ? 'Create Profile' : 'Edit Profile'}</h1>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
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
                <label>Experience (years)</label>
                <input className="form-control" type="number" min={0} value={form.experienceYears}
                  onChange={e => setForm(f => ({ ...f, experienceYears: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input className="form-control" value={form.skills}
                onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                placeholder="Java, Python, AWS" />
            </div>
            <div className="form-group">
              <label>Resume (PDF only, max 10MB) {!isNew && '— leave empty to keep current'}</label>
              <input className="form-control" type="file" accept=".pdf,application/pdf"
                ref={fileInputRef} onChange={handleFileChange} />
              {resumeFile && (
                <p className="text-muted mt-8">Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)</p>
              )}
              {!resumeFile && profile?.resumeUrl && (
                <p className="text-muted mt-8">Current resume on file ✅</p>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expected Min Salary (LPA, optional)</label>
                <input className="form-control" type="number" step="0.1" min="0" value={form.expectedSalaryMin}
                  onChange={e => setForm(f => ({ ...f, expectedSalaryMin: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Expected Max Salary (LPA, optional)</label>
                <input className="form-control" type="number" step="0.1" min="0" value={form.expectedSalaryMax}
                  onChange={e => setForm(f => ({ ...f, expectedSalaryMax: e.target.value }))} />
              </div>
            </div>
            <div className="flex-gap">
              <button className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
              {!isNew && <button type="button" className="btn btn-outline" onClick={() => { setEditing(false); setResumeFile(null); }}>Cancel</button>}
            </div>
          </form>
        </div>
      </>
    );
  }

  if (!profile) return <div className="empty-state">Loading...</div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
      </div>
      <div className="card">
        <p><strong>Name:</strong> {profile.candidateName}</p>
        <p><strong>Email:</strong> {profile.candidateEmail}</p>
        <p><strong>Category:</strong> <span className={`badge badge-${profile.category.toLowerCase()}`}>{profile.category}</span></p>
        <p><strong>Experience:</strong> {profile.experienceYears} years</p>
        <div style={{ margin: '8px 0' }}>
          <strong>Skills: </strong>
          <span className="tags" style={{ display: 'inline-flex' }}>
            {profile.skills?.map(s => <span className="tag" key={s}>{s}</span>)}
          </span>
        </div>
        <p><strong>Resume:</strong> {profile.resumeUrl ? '📄 Uploaded ✅' : 'Not uploaded'}</p>
        <p><strong>Expected Salary:</strong> {profile.expectedSalaryRange || 'Not specified'}</p>
      </div>
    </>
  );
}
