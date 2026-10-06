// Citizen Portal & Cloud Tracker Logic

let selectedFile = null;
let currentTrackingData = null;
let selectedStarRating = 0;

// Switch hero tabs
function switchTab(tab) {
  const sectionSubmit = document.getElementById('sectionSubmit');
  const sectionTrack = document.getElementById('sectionTrack');
  const tabSubmitBtn = document.getElementById('tabSubmitBtn');
  const tabTrackBtn = document.getElementById('tabTrackBtn');

  if (tab === 'submit') {
    sectionSubmit.style.display = 'block';
    sectionTrack.style.display = 'none';
    tabSubmitBtn.classList.add('active');
    tabTrackBtn.classList.remove('active');
  } else {
    sectionSubmit.style.display = 'none';
    sectionTrack.style.display = 'block';
    tabSubmitBtn.classList.remove('active');
    tabTrackBtn.classList.add('active');
  }
}

// File dropzone logic
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('filePreviewContainer');

if (dropzone && fileInput) {
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });
}

function handleFile(file) {
  selectedFile = file;
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  previewContainer.style.display = 'block';
  previewContainer.innerHTML = `
    <div class="file-preview">
      <span>📄 <strong>${file.name}</strong> (${sizeMB} MB)</span>
      <button type="button" class="btn btn-secondary btn-sm" onclick="removeFile()" style="padding: 2px 8px; font-size: 0.75rem;">✕ Remove</button>
    </div>
  `;
}

function removeFile() {
  selectedFile = null;
  fileInput.value = '';
  previewContainer.style.display = 'none';
  previewContainer.innerHTML = '';
}

// Complaint Form Submit
const complaintForm = document.getElementById('complaintForm');
if (complaintForm) {
  complaintForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ Uploading to Cloud...';

      const formData = new FormData();
      formData.append('title', document.getElementById('complaintTitle').value.trim());
      formData.append('category', document.getElementById('complaintCategory').value);
      formData.append('department', document.getElementById('complaintDept').value.trim());
      formData.append('priority', document.querySelector('input[name="priority"]:checked').value);
      formData.append('complainantName', document.getElementById('userName').value.trim());
      formData.append('complainantEmail', document.getElementById('userEmail').value.trim());
      formData.append('complainantPhone', document.getElementById('userPhone').value.trim());
      formData.append('description', document.getElementById('complaintDesc').value.trim());

      if (selectedFile) {
        formData.append('attachment', selectedFile);
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to lodge complaint.');
      }

      // Success
      document.getElementById('modalTrackingId').textContent = result.data.trackingId;
      document.getElementById('successModal').classList.add('open');
      complaintForm.reset();
      removeFile();
      lucide.createIcons();
    } catch (err) {
      alert('⚠️ Error submitting grievance: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('open');
}

function trackFromModal() {
  const trackingId = document.getElementById('modalTrackingId').textContent;
  closeSuccessModal();
  switchTab('track');
  document.getElementById('trackInput').value = trackingId;
  trackComplaint();
}

function fillTracking(id) {
  switchTab('track');
  document.getElementById('trackInput').value = id;
  trackComplaint();
}

// Live Track Complaint
async function trackComplaint() {
  const trackingId = document.getElementById('trackInput').value.trim();
  if (!trackingId) {
    alert('Please enter a valid Cloud Tracking ID.');
    return;
  }

  const trackBtn = document.getElementById('trackBtn');
  const originalText = trackBtn.innerHTML;

  try {
    trackBtn.disabled = true;
    trackBtn.innerHTML = '⏳ Querying DB...';

    const res = await fetch(`/api/complaints/track/${encodeURIComponent(trackingId)}`);
    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Ticket not found.');
    }

    currentTrackingData = result.data;
    renderTrackingResult(result.data);
  } catch (err) {
    alert(err.message);
    document.getElementById('trackResultContainer').style.display = 'none';
  } finally {
    trackBtn.disabled = false;
    trackBtn.innerHTML = originalText;
  }
}

function renderTrackingResult(ticket) {
  const container = document.getElementById('trackResultContainer');
  container.style.display = 'block';

  // 1. Update Stepper Status
  const steps = ['submitted', 'review', 'inprogress', 'resolved'];
  const statusOrder = {
    'Submitted': 1,
    'Under Review': 2,
    'In Progress': 3,
    'Resolved': 4,
    'Rejected': 0
  };

  const currentLevel = statusOrder[ticket.status] || 1;

  steps.forEach((step, index) => {
    const el = document.getElementById(`step-${step}`);
    el.classList.remove('completed', 'active');

    if (ticket.status === 'Rejected') {
      if (index === 0) el.classList.add('completed');
    } else {
      if (index + 1 < currentLevel) {
        el.classList.add('completed');
      } else if (index + 1 === currentLevel) {
        el.classList.add('active');
      }
    }
  });

  // Extract timeline times
  ticket.timeline.forEach((item) => {
    const dateStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (item.status === 'Submitted') document.getElementById('time-submitted').textContent = dateStr;
    if (item.status === 'Under Review') document.getElementById('time-review').textContent = dateStr;
    if (item.status === 'In Progress') document.getElementById('time-inprogress').textContent = dateStr;
    if (item.status === 'Resolved') document.getElementById('time-resolved').textContent = dateStr;
  });

  // 2. Ticket Details Grid
  const detailsGrid = document.getElementById('ticketDetails');
  const badgeClass = {
    'Submitted': 'badge-submitted',
    'Under Review': 'badge-review',
    'In Progress': 'badge-inprogress',
    'Resolved': 'badge-resolved',
    'Rejected': 'badge-rejected'
  }[ticket.status] || 'badge-submitted';

  detailsGrid.innerHTML = `
    <div class="detail-item">
      <span class="detail-label">Tracking ID</span>
      <span class="detail-value" style="font-family: var(--font-mono); color: var(--accent-cyan);">${ticket.trackingId}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Status</span>
      <span class="detail-value"><span class="badge ${badgeClass}">${ticket.status}</span></span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Priority Level</span>
      <span class="detail-value">${ticket.priority}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Category</span>
      <span class="detail-value">${ticket.category}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Assigned Officer</span>
      <span class="detail-value">${ticket.assignedOfficer || 'Pending Assignment'}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Logged Date</span>
      <span class="detail-value">${new Date(ticket.createdAt).toLocaleDateString()}</span>
    </div>
    <div class="detail-item" style="grid-column: span 3;">
      <span class="detail-label">Grievance Subject</span>
      <span class="detail-value" style="font-size: 1.05rem;">${ticket.title}</span>
    </div>
    <div class="detail-item" style="grid-column: span 3;">
      <span class="detail-label">Description</span>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">${ticket.description}</p>
    </div>
  `;

  // 3. Attachment
  const attachBox = document.getElementById('attachmentDisplay');
  if (ticket.attachment && ticket.attachment.url) {
    attachBox.style.display = 'block';
    const isImage = ticket.attachment.mimetype && ticket.attachment.mimetype.startsWith('image/');
    attachBox.innerHTML = `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.4rem;">📎</span>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${ticket.attachment.filename || 'Cloud Attachment'}</div>
            <div style="font-size: 0.75rem; color: var(--text-dim);">${ticket.attachment.storageProvider || 'Cloud Object Storage'}</div>
          </div>
        </div>
        <a href="${ticket.attachment.url}" target="_blank" class="btn btn-secondary btn-sm">
          👁️ View in Cloud
        </a>
      </div>
    `;
  } else {
    attachBox.style.display = 'none';
  }

  // 4. Resolution Notes
  const resNotesBox = document.getElementById('resolutionNotesBox');
  if (ticket.status === 'Resolved' && ticket.resolutionNotes) {
    resNotesBox.style.display = 'block';
    document.getElementById('resolutionNotesText').textContent = ticket.resolutionNotes;
  } else {
    resNotesBox.style.display = 'none';
  }

  // 5. Feedback Box
  const feedbackBox = document.getElementById('feedbackBox');
  if (ticket.status === 'Resolved') {
    feedbackBox.style.display = 'block';
    if (ticket.feedback && ticket.feedback.rating) {
      feedbackBox.innerHTML = `
        <h4 style="color: #34d399;">🌟 Complainant Feedback Recorded</h4>
        <p style="margin-top: 6px; font-size: 0.9rem;">Rating: <strong>${'★'.repeat(ticket.feedback.rating)}</strong> (${ticket.feedback.rating}/5)</p>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">"${ticket.feedback.comments || 'No comment provided'}"</p>
      `;
    }
  } else {
    feedbackBox.style.display = 'none';
  }

  lucide.createIcons();
}

// Star rating feedback
function setRating(rating) {
  selectedStarRating = rating;
  const stars = document.querySelectorAll('#starRating .star');
  stars.forEach((s, idx) => {
    if (idx < rating) {
      s.classList.add('active');
    } else {
      s.classList.remove('active');
    }
  });
}

async function submitUserFeedback() {
  if (!currentTrackingData) return;
  if (selectedStarRating === 0) {
    alert('Please select a star rating between 1 and 5.');
    return;
  }

  const comments = document.getElementById('feedbackText').value.trim();

  try {
    const res = await fetch(`/api/complaints/${currentTrackingData.trackingId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: selectedStarRating, comments })
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to submit feedback.');

    alert('🎉 Thank you! Your feedback has been recorded in the Cloud Database.');
    trackComplaint();
  } catch (err) {
    alert(err.message);
  }
}

// Telemetry Poller
async function fetchCloudTelemetry() {
  try {
    const res = await fetch('/api/analytics/cloud-telemetry');
    if (!res.ok) return;
    const json = await res.json();
    const data = json.data;

    document.getElementById('navRegionText').textContent = `${data.cloudRegion} | SLA ${data.slaAvailability}`;
    document.getElementById('footerDbStatus').textContent = data.services.database.provider;
    document.getElementById('footerStorageStatus').textContent = data.services.objectStorage.provider;
    document.getElementById('footerUptime').textContent = data.formattedUptime;
  } catch (err) {
    console.warn('Telemetry poll error:', err.message);
  }
}

// Initial Telemetry load and periodic refresh
fetchCloudTelemetry();
setInterval(fetchCloudTelemetry, 15000);
