/**
 * ShelfMind: Analytics & Reports Controller
 * Renders statistical breakdowns, clean canvas/SVG charts, and circulation metrics.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderReportMetrics();
  drawCirculationBarChart();
  drawLicenceDonutChart();
  drawCollectionPieChart();
});

function renderReportMetrics() {
  const store = window.shelfMindStore;
  if (!store) return;

  const state = store.getState();
  const metrics = state.projectMetrics;
  const licenceSummary = store.getLicenceSummary();

  // Physical Collection
  const total = metrics.totalVolumes; // 340,000
  const untraceable = metrics.untraceableBooks; // 4,100
  const issued = 48200; // Realistic active circulating loan volume
  const available = total - untraceable - issued;

  const elTot = document.getElementById('repTotalVolumes');
  const elUnt = document.getElementById('repUntraceable');
  const elIss = document.getElementById('repIssued');
  const elAvail = document.getElementById('repAvailable');

  if (elTot) elTot.textContent = total.toLocaleString();
  if (elUnt) elUnt.textContent = untraceable.toLocaleString();
  if (elIss) elIss.textContent = issued.toLocaleString();
  if (elAvail) elAvail.textContent = available.toLocaleString();

  // Digital Lending
  const elActiveEb = document.getElementById('repActiveEbooks');
  const elLicUtil = document.getElementById('repLicenceUtil');
  const elTimeouts = document.getElementById('repTimeouts');

  if (elActiveEb) elActiveEb.textContent = state.ebookCatalogue.length;
  if (elLicUtil) elLicUtil.textContent = `${Math.round((licenceSummary.active / licenceSummary.total) * 100)}% (${licenceSummary.active}/${licenceSummary.total})`;
  if (elTimeouts) elTimeouts.textContent = '38 Releases';

  // RFID Operations
  const elScans = document.getElementById('repTotalScans');
  const elSweepProg = document.getElementById('repSweepProg');
  const elGateEvts = document.getElementById('repGateEvents');

  if (elScans) elScans.textContent = '340,000';
  if (elSweepProg) elSweepProg.textContent = '100% Completed';
  if (elGateEvts) elGateEvts.textContent = `${state.gateEvents.length + 142} Passes`;
}

// Chart 1: 7-Day Circulation Activity (Canvas)
function drawCirculationBarChart() {
  const canvas = document.getElementById('chartCirculation');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.parentElement.clientWidth - 40;
  const height = 200;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const issues = [120, 145, 138, 162, 142, 85, 40];
  const returns = [110, 130, 125, 140, 118, 70, 32];

  const maxVal = 200;
  const chartHeight = height - 40;
  const chartWidth = width - 40;
  const barGroupWidth = chartWidth / days.length;
  const barWidth = 14;

  ctx.clearRect(0, 0, width, height);

  // Background grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let y = 0; y <= 4; y++) {
    const yPos = 10 + (chartHeight / 4) * y;
    ctx.beginPath();
    ctx.moveTo(35, yPos);
    ctx.lineTo(width, yPos);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${maxVal - y * 50}`, 8, yPos + 3);
  }

  // Draw Bars
  days.forEach((day, idx) => {
    const xBase = 45 + idx * barGroupWidth;

    // Issue bar
    const issH = (issues[idx] / maxVal) * chartHeight;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(xBase, 10 + (chartHeight - issH), barWidth, issH);

    // Return bar
    const retH = (returns[idx] / maxVal) * chartHeight;
    ctx.fillStyle = '#0d9488';
    ctx.fillRect(xBase + barWidth + 3, 10 + (chartHeight - retH), barWidth, retH);

    // Label
    ctx.fillStyle = '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day, xBase + barWidth, height - 8);
  });
}

// Chart 2: Collection Status Distribution Donut (Canvas)
function drawCollectionPieChart() {
  const canvas = document.getElementById('chartCollectionDonut');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 180;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 70;
  const innerRadius = 45;

  const data = [
    { label: 'Available', value: 287700, color: '#10b981' },
    { label: 'Issued', value: 48200, color: '#2563eb' },
    { label: 'Untraceable', value: 4100, color: '#ef4444' }
  ];

  const total = data.reduce((acc, d) => acc + d.value, 0);
  let startAngle = -0.5 * Math.PI;

  data.forEach(slice => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();

    startAngle = endAngle;
  });

  // Center text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('340,000', centerX, centerY - 6);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText('Volumes', centerX, centerY + 10);
}

// Chart 3: Concurrent Licences Donut
function drawLicenceDonutChart() {
  const canvas = document.getElementById('chartLicencesDonut');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 180;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  const summary = window.shelfMindStore.getLicenceSummary();
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 70;
  const innerRadius = 45;

  const data = [
    { label: 'Active', value: summary.active, color: '#2563eb' },
    { label: 'Available', value: summary.available, color: '#10b981' }
  ];

  const total = summary.total;
  let startAngle = -0.5 * Math.PI;

  data.forEach(slice => {
    if (slice.value > 0) {
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      startAngle = endAngle;
    }
  });

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${summary.active}/${total}`, centerX, centerY - 6);
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText('Active', centerX, centerY + 10);
}

window.addEventListener('resize', function () {
  drawCirculationBarChart();
});
