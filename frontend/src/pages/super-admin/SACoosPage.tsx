import { useEffect, useState, type FormEvent } from 'react';
import { superAdminApi } from '../../services/endpoints';
import type { UserResponse, CompanyResponse } from '../../types';
import toast from 'react-hot-toast';

export default function SACoosPage() {
  const [coos, setCoos] = useState<UserResponse[]>([]);
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '', mobileNumber: '', companyId: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [cooRes, compRes] = await Promise.all([superAdminApi.getCoos(), superAdminApi.getCompanies()]);
      setCoos(cooRes.data);
      setCompanies(compRes.data);
    } catch { toast.error('Failed to load data'); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.companyId) {
      toast.error('Please select a company for the COO');
      return;
    }
    setLoading(true);
    try {
      await superAdminApi.createCoo(form);
      toast.success('COO created');
      setShowModal(false);
      setForm({ email: '', password: '', fullName: '', mobileNumber: '', companyId: '' });
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">COO Users</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create COO</button>
      </div>
      {coos.length === 0 ? (
        <div className="empty-state">No COOs yet.</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Company</th></tr></thead>
          <tbody>
            {coos.map(u => (
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
            <h2 className="modal-title">Create COO</h2>
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
              <div className="form-group">
                <label>Company *</label>
                <select className="form-control" value={form.companyId}
                  onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))} required>
                  <option value="">Select a company</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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
