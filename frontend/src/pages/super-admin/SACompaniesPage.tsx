import { useEffect, useState, type FormEvent } from 'react';
import { superAdminApi } from '../../services/endpoints';
import type { CompanyResponse } from '../../types';
import toast from 'react-hot-toast';

export default function SACompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', website: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const res = await superAdminApi.getCompanies();
      setCompanies(res.data);
    } catch { toast.error('Failed to load companies'); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await superAdminApi.createCompany(form);
      toast.success('Company created');
      setShowModal(false);
      setForm({ name: '', address: '', website: '' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this company?')) return;
    try {
      await superAdminApi.deleteCompany(id);
      toast.success('Company deleted');
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Companies</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Company</button>
      </div>
      {companies.length === 0 ? (
        <div className="empty-state">No companies yet. Create one to get started.</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Address</th><th>Website</th><th>Actions</th></tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.address || '—'}</td>
                <td>{c.website ? <a href={c.website} target="_blank" className="link">{c.website}</a> : '—'}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Company</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Company Name *</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="form-control" value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input className="form-control" value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
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

