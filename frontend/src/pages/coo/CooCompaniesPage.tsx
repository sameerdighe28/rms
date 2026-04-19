import { useEffect, useState } from 'react';
import { cooApi } from '../../services/endpoints';
import type { CompanyResponse } from '../../types';
import toast from 'react-hot-toast';

export default function CooCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);

  useEffect(() => {
    (async () => {
      try { setCompanies((await cooApi.getCompanies()).data); }
      catch { toast.error('Failed to load companies'); }
    })();
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Companies</h1>
      </div>
      {companies.length === 0 ? (
        <div className="empty-state">No companies yet.</div>
      ) : (
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Address</th><th>Website</th></tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.address || '—'}</td>
                <td>{c.website ? <a href={c.website} target="_blank" className="link">{c.website}</a> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </>
  );
}
