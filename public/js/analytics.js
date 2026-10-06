// Cloud Analytics & Telemetry Controller

let statusChartInstance = null;
let priorityChartInstance = null;
let categoryChartInstance = null;

// Initialize Chart.js styling
Chart.defaults.color = '#9ca3af';
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

async function loadAnalytics() {
  await Promise.all([
    fetchStats(),
    fetchTelemetry()
  ]);
}

async function fetchStats() {
  try {
    const res = await fetch('/api/analytics/stats');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);

    const stats = json.data;
    renderStatusChart(stats);
    renderPriorityChart(stats.priorityCounts);
    renderCategoryChart(stats.categoryCounts);
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

async function fetchTelemetry() {
  try {
    const res = await fetch('/api/analytics/cloud-telemetry');
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);

    const t = json.data;
    document.getElementById('cloudRegionVal').textContent = t.cloudRegion;
    document.getElementById('cloudSlaVal').textContent = `${t.slaAvailability} SLA`;
    document.getElementById('cloudDbVal').textContent = t.services.database.provider;
    document.getElementById('cloudStorageVal').textContent = t.services.objectStorage.provider;
    document.getElementById('cloudUptimeVal').textContent = t.formattedUptime;
    document.getElementById('cloudMemoryVal').textContent = `${t.memoryUsageMB.rss} MB`;
    document.getElementById('cloudRequestsVal').textContent = t.totalRequestsServed;
    document.getElementById('cloudNotifVal').textContent = t.services.notificationService.type;

    renderEventStream(t.recentCloudEvents);
  } catch (err) {
    console.error('Failed to load telemetry:', err);
  }
}

function renderStatusChart(stats) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  const data = [
    stats.submitted || 0,
    stats.underReview || 0,
    stats.inProgress || 0,
    stats.resolved || 0,
    stats.rejected || 0
  ];

  if (statusChartInstance) {
    statusChartInstance.data.datasets[0].data = data;
    statusChartInstance.update();
    return;
  }

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
      datasets: [{
        data,
        backgroundColor: [
          '#f59e0b',
          '#38bdf8',
          '#818cf8',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 2,
        borderColor: '#111827'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '68%'
    }
  });
}

function renderPriorityChart(prio) {
  const ctx = document.getElementById('priorityChart').getContext('2d');
  const data = [
    prio.Low || 0,
    prio.Medium || 0,
    prio.High || 0,
    prio.Urgent || 0
  ];

  if (priorityChartInstance) {
    priorityChartInstance.data.datasets[0].data = data;
    priorityChartInstance.update();
    return;
  }

  priorityChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Low (72h)', 'Medium (48h)', 'High (24h)', 'Urgent (6h)'],
      datasets: [{
        data,
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#f97316',
          '#ef4444'
        ],
        borderWidth: 2,
        borderColor: '#111827'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderCategoryChart(catCounts) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  const labels = Object.keys(catCounts);
  const values = Object.values(catCounts);

  if (categoryChartInstance) {
    categoryChartInstance.data.labels = labels;
    categoryChartInstance.data.datasets[0].data = values;
    categoryChartInstance.update();
    return;
  }

  categoryChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Number of Tickets',
        data: values,
        backgroundColor: 'rgba(6, 182, 212, 0.65)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { stepSize: 1 }
        },
        y: {
          grid: { display: false }
        }
      }
    }
  });
}

function renderEventStream(events) {
  const terminal = document.getElementById('eventLogsTerminal');
  if (!events || events.length === 0) return;

  terminal.innerHTML = events.map(e => {
    const time = new Date(e.timestamp).toLocaleTimeString();
    return `
      <div class="event-row">
        <span class="event-time">[${time}]</span>
        <span class="event-badge">${e.type}</span>
        <span class="event-msg">${e.details}</span>
      </div>
    `;
  }).join('');
}

// Initial load & Polling
loadAnalytics();
setInterval(loadAnalytics, 8000);
