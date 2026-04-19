import { useEffect, useState, type FormEvent } from 'react';
import { cooApi } from '../../services/endpoints';
import type { UserResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CooHrsPage() {
  const [hrs, setHrs] = useState<UserResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', mobileNumber: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setHrs((await cooApi.getHrs()).data); }
    catch { toast.error('Failed to load HR users'); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cooApi.createHr(form);
      toast.success('HR created and assigned to your company');
      setShowModal(false);
      setForm({ email: '', password: '', fullName: '', mobileNumber: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">HR Users</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Onboard HR</button>
      </div>
      {hrs.length === 0 ? (
        <div className="empty-state">No HR users yet.</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Company</th></tr></thead>
          <tbody>
            {hrs.map(u => (
              <tr key={u.id}>
                <td><strong>{u.fullName}</strong></td>
                <td>{u.email}</td>
                <td>{u.companyName || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Onboard HR</h2>
            <p className="text-muted mb-16">HR will be automatically assigned to your company.</p>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Full Name *</label>
                <input className="form-control" value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="form-control" type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input className="form-control" type="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Mobile *</label>
                <input className="form-control" value={form.mobileNumber}
                  onChange={e => setForm(f => ({ ...f, mobileNumber: e.target.value }))} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
