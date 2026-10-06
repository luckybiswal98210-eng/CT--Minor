// Admin Console Controller

let allTickets = [];
let currentSelectedTicket = null;
let debounceTimer = null;

async function loadComplaints() {
  const tableBody = document.getElementById('complaintsTableBody');
  const search = document.getElementById('adminSearch').value.trim();
  const status = document.getElementById('filterStatus').value;
  const category = document.getElementById('filterCategory').value;
  const priority = document.getElementById('filterPriority').value;

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);
    if (category && category !== 'All') params.append('category', category);
    if (priority && priority !== 'All') params.append('priority', priority);

    const res = await fetch(`/api/complaints?${params.toString()}`);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Failed to fetch tickets.');

    allTickets = json.data;
    updateKpis();
    renderTable(allTickets);
  } catch (err) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: #f87171; padding: 30px;">
          ⚠️ Error fetching cloud records: ${err.message}
        </td>
      </tr>
    `;
  }
}

function updateKpis() {
  const total = allTickets.length;
  const pending = allTickets.filter(t => t.status === 'Submitted' || t.status === 'Under Review').length;
  const inProgress = allTickets.filter(t => t.status === 'In Progress').length;
  const resolved = allTickets.filter(t => t.status === 'Resolved').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statInProgress').textContent = inProgress;
  document.getElementById('statResolved').textContent = resolved;
}

function renderTable(tickets) {
  const tableBody = document.getElementById('complaintsTableBody');

  if (tickets.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">
          No complaints found matching the criteria.
        </td>
      </tr>
    `;
    return;
  }

  const badgeMap = {
    'Submitted': 'badge-submitted',
    'Under Review': 'badge-review',
    'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved',
    'Rejected': 'badge-rejected'
  };

  const priorityColor = {
    'Low': '#34d399',
    'Medium': '#fbbf24',
    'High': '#fb923c',
    'Urgent': '#f87171'
  };

  tableBody.innerHTML = tickets.map(t => `
    <tr>
      <td><span class="tracking-pill">${t.trackingId}</span></td>
      <td style="max-width: 240px; font-weight: 600;">
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</div>
        <div style="font-size: 0.75rem; color: var(--text-dim); font-weight: normal;">Dept: ${t.department || 'General'}</div>
      </td>
      <td><span style="font-size: 0.82rem; color: var(--text-muted);">${t.category}</span></td>
      <td>
        <span style="font-weight: 700; font-size: 0.8rem; color: ${priorityColor[t.priority] || '#fff'};">
          ● ${t.priority}
        </span>
      </td>
      <td>
        <div style="font-size: 0.85rem; font-weight: 600;">${t.complainantName}</div>
        <div style="font-size: 0.75rem; color: var(--text-dim);">${t.complainantEmail}</div>
      </td>
      <td><span class="badge ${badgeMap[t.status] || 'badge-submitted'}">${t.status}</span></td>
      <td style="font-size: 0.8rem; color: var(--text-dim); font-family: var(--font-mono);">
        ${new Date(t.createdAt).toLocaleDateString()}
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openTriage('${t._id || t.trackingId}')">
          <i data-lucide="sliders" style="width: 13px; height: 13px;"></i> Triage
        </button>
      </td>
    </tr>
  `).join('');

  lucide.createIcons();
}

function debounceFilter() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadComplaints();
  }, 300);
}

function resetFilters() {
  document.getElementById('adminSearch').value = '';
  document.getElementById('filterStatus').value = 'All';
  document.getElementById('filterCategory').value = 'All';
  document.getElementById('filterPriority').value = 'All';
  loadComplaints();
}

// Open Triage Modal
function openTriage(id) {
  const ticket = allTickets.find(t => (t._id === id || t.trackingId === id));
  if (!ticket) return;

  currentSelectedTicket = ticket;
  const modal = document.getElementById('triageModal');
  const detailsView = document.getElementById('modalDetailsView');

  // Fill hidden and inputs
  document.getElementById('modalTicketId').value = ticket._id || ticket.trackingId;
  document.getElementById('modalStatus').value = ticket.status;
  document.getElementById('modalDepartment').value = ticket.department || '';
  document.getElementById('modalOfficer').value = ticket.assignedOfficer || '';
  document.getElementById('modalComments').value = '';
  document.getElementById('modalResolutionNotes').value = ticket.resolutionNotes || '';

  let attachHtml = '<span style="color: var(--text-dim); font-size: 0.85rem;">None</span>';
  if (ticket.attachment && ticket.attachment.url) {
    attachHtml = `
      <a href="${ticket.attachment.url}" target="_blank" class="btn btn-secondary btn-sm" style="display: inline-flex; margin-top: 4px;">
        📎 View Evidence (${ticket.attachment.filename || 'Document'})
      </a>
    `;
  }

  detailsView.innerHTML = `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-family: var(--font-mono); font-size: 1.1rem; color: var(--accent-cyan); font-weight: 700;">${ticket.trackingId}</span>
        <span class="badge badge-submitted">${ticket.priority} Priority</span>
      </div>
      <h4 style="font-size: 1.1rem; margin-bottom: 6px;">${ticket.title}</h4>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 12px;">${ticket.description}</p>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.82rem; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;">
        <div><strong>Complainant:</strong> ${ticket.complainantName} (${ticket.complainantEmail})</div>
        <div><strong>Category:</strong> ${ticket.category}</div>
        <div><strong>Current Status:</strong> ${ticket.status}</div>
        <div><strong>Cloud Attachment:</strong> ${attachHtml}</div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  lucide.createIcons();
}

function closeTriageModal() {
  document.getElementById('triageModal').classList.remove('open');
  currentSelectedTicket = null;
}

// Handle Form Submit
async function handleTriageSubmit(e) {
  e.preventDefault();
  if (!currentSelectedTicket) return;

  const id = document.getElementById('modalTicketId').value;
  const status = document.getElementById('modalStatus').value;
  const department = document.getElementById('modalDepartment').value.trim();
  const assignedOfficer = document.getElementById('modalOfficer').value.trim();
  const comments = document.getElementById('modalComments').value.trim();
  const resolutionNotes = document.getElementById('modalResolutionNotes').value.trim();

  const saveBtn = document.getElementById('modalSaveBtn');
  const origText = saveBtn.innerHTML;

  try {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '⏳ Committing to Cloud DB...';

    const res = await fetch(`/api/complaints/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        department,
        assignedOfficer,
        comments,
        resolutionNotes,
        updatedBy: assignedOfficer || 'Campus Support Officer'
      })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Update failed.');

    closeTriageModal();
    loadComplaints();
  } catch (err) {
    alert('⚠️ Error updating status: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = origText;
  }
}

// Initial load
loadComplaints();
