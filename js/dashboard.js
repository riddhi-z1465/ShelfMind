/**
 * ShelfMind: Enterprise Dashboard Controller
 * Synchronizes metrics with animated counters, RFID handheld telemetry,
 * licence capacity monitor, and live stock verification widget.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderDashboardStats();
  setupStockVerificationWidget();
});

function renderDashboardStats() {
  const store = window.shelfMindStore;
  if (!store) return;

  const state = store.getState();
  const metrics = state.projectMetrics;
  const licenceSummary = store.getLicenceSummary();

  // 1. Primary Metrics (with animateValue count-up effect)
  animateValue('statTotalVolumes', 0, metrics.totalVolumes, 900);
  animateValue('statUntraceable', 0, metrics.untraceableBooks, 700);

  const elActiveLicences = document.getElementById('statActiveLicences');
  if (elActiveLicences) elActiveLicences.textContent = `${licenceSummary.active} / ${licenceSummary.total} Active`;

  const elHandhelds = document.getElementById('statHandhelds');
  if (elHandhelds) elHandhelds.textContent = `${metrics.rfidHandhelds} Online`;

  // Secondary metrics
  const elIssuedToday = document.getElementById('statIssuedToday');
  if (elIssuedToday) elIssuedToday.textContent = metrics.booksIssuedToday;

  const elReturnedToday = document.getElementById('statReturnedToday');
  if (elReturnedToday) elReturnedToday.textContent = metrics.booksReturnedToday;

  const elReservations = document.getElementById('statActiveReservations');
  if (elReservations) elReservations.textContent = metrics.activeReservationsCount;

  const elPendingFines = document.getElementById('statPendingFines');
  if (elPendingFines) elPendingFines.textContent = `₹${metrics.pendingFinesTotal.toLocaleString()}`;

  // 2. E-Book Licensing Capacity Monitor
  const dotBar = document.getElementById('dashLicenceDotBar');
  if (dotBar) {
    let dots = '';
    licenceSummary.licences.forEach(l => {
      dots += l.status === 'occupied' ? '● ' : '○ ';
    });
    dotBar.textContent = dots.trim();
  }

  const dashLicenceList = document.getElementById('dashLicenceActiveList');
  if (dashLicenceList) {
    dashLicenceList.innerHTML = licenceSummary.licences.map(l => {
      if (l.status === 'occupied') {
        const remaining = 20 - (l.lastActiveMinutesAgo || 0);
        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:12.5px;">
            <div>
              <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(l.user.split(' ')[0])} (${l.id})</div>
              <div style="font-size:11px; color:var(--text-secondary);">${escapeHtml(l.bookTitle)}</div>
            </div>
            <div style="text-align:right;">
              <span class="badge badge-issued" style="font-size:10px;">${remaining}m remaining</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:12.5px;">
            <div style="color:var(--success-text); font-weight:600;">○ ${l.id} Available Slot</div>
            <span class="badge badge-available" style="font-size:10px;">Ready for Loan</span>
          </div>
        `;
      }
    }).join('');
  }
}

function setupStockVerificationWidget() {
  const startBtn = document.getElementById('btnStartQuickStockScan');
  const progressBar = document.getElementById('stockProgressFill');
  const progressText = document.getElementById('stockProgressText');
  const scanCounter = document.getElementById('stockScanCounter');
  const missingCounter = document.getElementById('stockMissingCounter');
  const statusNote = document.getElementById('stockStatusNote');
  const summaryBox = document.getElementById('stockVerificationSummary');

  if (!startBtn) return;

  let isScanning = false;
  let intervalId = null;

  startBtn.addEventListener('click', function () {
    if (isScanning) return;
    isScanning = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Interrogating 6 Handhelds...';
    if (summaryBox) summaryBox.style.display = 'none';

    let current = 0;
    const target = 340000;
    const missingTarget = 4100;
    const step = 9200;

    if (statusNote) {
      statusNote.innerHTML = '<span class="status-dot pulse-green"></span> <strong>Live Interrogation:</strong> 6 handhelds streaming RFID tags across Stack A-J at 180 tags/min...';
    }

    intervalId = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(intervalId);
        isScanning = false;
        startBtn.disabled = false;
        startBtn.textContent = 'Re-Run Verification';

        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = '100% Completed';
        if (scanCounter) scanCounter.textContent = '340,000 / 340,000';
        if (missingCounter) missingCounter.textContent = '4,100 tags flagged';

        if (statusNote) {
          statusNote.innerHTML = '<span style="color:var(--success); font-weight:700;">✓ Verification Finished</span> (Simulated Sweep Complete)';
        }

        if (summaryBox) {
          summaryBox.style.display = 'block';
          summaryBox.innerHTML = `
            <div style="background-color: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; margin-top: 12px;">
              <div style="font-weight: 700; color: var(--text-primary); font-size: 13px; margin-bottom: 4px;">Summary of Simulated Sweep</div>
              <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.6;">
                • <strong>335,900</strong> tags reconciled and shelf-verified.<br>
                • <strong>4,100</strong> untraceable volumes flagged for audit.<br>
                • <strong>14</strong> misplaced items localized into correct stacks.
              </div>
            </div>
          `;
        }

        window.showToast('Stock verification simulation completed (340,000 tags audited)', 'success');
      } else {
        const percent = Math.floor((current / target) * 100);
        const missingSoFar = Math.floor((current / target) * missingTarget);
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = `${percent}%`;
        if (scanCounter) scanCounter.textContent = `${current.toLocaleString()} / 340,000`;
        if (missingCounter) missingCounter.textContent = `${missingSoFar.toLocaleString()} flagged`;
      }
    }, 60);
  });
}

function animateValue(elementId, start, end, duration) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    el.textContent = value.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      el.textContent = end.toLocaleString();
    }
  };
  window.requestAnimationFrame(step);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}
