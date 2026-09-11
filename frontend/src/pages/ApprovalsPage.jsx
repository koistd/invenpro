import { useEffect, useState } from 'react';
import api, { unwrapList } from '../utils/api';
import { extractError, formatDate, statusBadge } from '../utils/format';

export default function ApprovalsPage() {
  const [requests, setRequests] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [comments, setComments] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [reqRes, apprRes] = await Promise.all([
      api.get('/requests/'),
      api.get('/approvals/'),
    ]);
    setRequests(unwrapList(reqRes.data).filter((r) => ['Submitted', 'Under Review'].includes(r.status)));
    setApprovals(unwrapList(apprRes.data));
  };

  useEffect(() => {
    load().catch((err) => setError(extractError(err)));
  }, []);

  const decide = async (requestId, action) => {
    setError('');
    try {
      await api.put('/approvals/', {
        request_id: requestId,
        action,
        comments: comments[requestId] || '',
      });
      setMessage(`Request ${action.toLowerCase()}.`);
      load();
    } catch (err) {
      setError(extractError(err, 'Unable to update approval.'));
    }
  };

  return (
    <>
      {error && <p className="error-box">{error}</p>}
      {message && <p className="success-box">{message}</p>}
      <section className="card">
        <div className="card-header"><h2 className="card-title">Pending approvals</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Priority</th>
                <th>Requested by</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && <tr><td colSpan="6">No pending requests.</td></tr>}
              {requests.map((row) => (
                <tr key={row.id}>
                  <td>{row.item_name}</td>
                  <td>{row.quantity}</td>
                  <td><span className={`badge ${statusBadge(row.priority)}`}>{row.priority}</span></td>
                  <td>{row.requested_by_email || '—'}</td>
                  <td>
                    <input
                      className="search-input"
                      value={comments[row.id] || ''}
                      onChange={(e) => setComments((prev) => ({ ...prev, [row.id]: e.target.value }))}
                      placeholder="Optional comments"
                    />
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => decide(row.id, 'Approved')}>Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => decide(row.id, 'Rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: '1.25rem' }}>
        <div className="card-header"><h2 className="card-title">Approval history</h2></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Action</th>
                <th>By</th>
                <th>Comments</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((row) => (
                <tr key={row.id}>
                  <td>{row.request_item}</td>
                  <td><span className={`badge ${statusBadge(row.action)}`}>{row.action}</span></td>
                  <td>{row.approved_by_email || '—'}</td>
                  <td>{row.comments || '—'}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
