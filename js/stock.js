/**
 * ShelfMind: Enterprise RFID Stock Verification Controller
 * Multi-handheld cluster audit sweep across 340,000 tags with Pause, Resume, Stop controls,
 * telemetry monitoring, and CSV report export.
 */

let verificationInterval = null;
let isPaused = false;
let currentProgress = 0;
const totalTags = 340000;
const missingTarget = 4100;
const duplicateTarget = 14;
const errorTarget = 8;

document.addEventListener('DOMContentLoaded', function () {
  renderStockOverview();
  setupStockVerificationControls();
});

function renderStockOverview() {
  const store = window.shelfMindStore;
  if (!store) return;

  const stock = store.getState().stockVerification;

  const elTotal = document.getElementById('stockTotalTags');
  const elUntraceable = document.getElementById('stockUntraceableTags');
  const elHandheldCount = document.getElementById('stockHandheldCount');

  if (elTotal) elTotal.textContent = stock.totalTags.toLocaleString();
  if (elUntraceable) elUntraceable.textContent = stock.untraceableBooks.toLocaleString();
  if (elHandheldCount) elHandheldCount.textContent = stock.handheldsCount;

  // Render Handheld Grid (Prompt Section 14: Handheld #01, ● Online, 180 tags/min, Last sync: 10:42 AM, Battery)
  const hhContainer = document.getElementById('handheldStatusGrid');
  if (hhContainer) {
    const defaultBatteries = ['94%', '88%', '91%', '82%', '97%', '79%'];
    hhContainer.innerHTML = stock.handhelds.map((hh, idx) => `
      <div class="card" style="margin-bottom:0; padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:700; color:var(--text-primary); font-size:13px;">${hh.name.split(' (')[0]}</span>
          <span class="badge badge-available">
            <span class="status-dot pulse-green"></span>
            Online
          </span>
        </div>
        <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:8px;">
          Sector: ${hh.name.includes('(') ? hh.name.split('(')[1].replace(')', '') : 'Main Stack'}
        </div>
        <div style="background:var(--bg-subtle); padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border); font-size:11.5px; line-height:1.6;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-secondary);">Throughput:</span>
            <strong>180 tags/min</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-secondary);">Last sync:</span>
            <span>10:42 AM</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-secondary);">Battery:</span>
            <strong style="color:var(--text-primary);">${defaultBatteries[idx] || hh.battery}</strong>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function setupStockVerificationControls() {
  const btnStart = document.getElementById('btnStartStockAudit');
  const btnPause = document.getElementById('btnPauseStockAudit');
  const btnResume = document.getElementById('btnResumeStockAudit');
  const btnStop = document.getElementById('btnStopStockAudit');
  const btnExport = document.getElementById('btnExportStockCSV');

  const progressFill = document.getElementById('auditProgressFill');
  const statusHeadline = document.getElementById('auditStatusHeadline');
  const scanCountText = document.getElementById('auditScanCountText');
  const summaryBox = document.getElementById('auditSummaryBox');

  const valScanned = document.getElementById('statTagsScanned');
  const valUnmatched = document.getElementById('statUnmatchedTags');
  const valDuplicate = document.getElementById('statDuplicateReads');
  const valErrors = document.getElementById('statScanErrors');
  const auditLogTerminal = document.getElementById('auditLogTerminal');

  function startSweep() {
    isPaused = false;
    if (btnStart) btnStart.style.display = 'none';
    if (btnPause) btnPause.style.display = 'inline-flex';
    if (btnResume) btnResume.style.display = 'none';
    if (btnStop) btnStop.style.display = 'inline-flex';
    if (statusHeadline) statusHeadline.textContent = 'Verification in progress';
    if (summaryBox) summaryBox.style.display = 'none';

    appendLog('INFO: Initiating multi-handheld RFID sweep cycle across 6 zones (Stack A through Storage).');
    appendLog('INFO: Frequency lock 865.6 MHz UHF. Power level: 30 dBm.');

    if (verificationInterval) clearInterval(verificationInterval);

    verificationInterval = setInterval(() => {
      if (isPaused) return;

      currentProgress += 11500;

      if (currentProgress >= totalTags) {
        currentProgress = totalTags;
        clearInterval(verificationInterval);
        verificationInterval = null;

        if (statusHeadline) statusHeadline.textContent = 'Verification Completed';
        if (progressFill) progressFill.style.width = '100%';
        if (scanCountText) scanCountText.textContent = '340,000 / 340,000 tags';

        if (valScanned) valScanned.textContent = '340,000';
        if (valUnmatched) valUnmatched.textContent = '4,100';
        if (valDuplicate) valDuplicate.textContent = '14';
        if (valErrors) valErrors.textContent = '8';

        if (btnPause) btnPause.style.display = 'none';
        if (btnResume) btnResume.style.display = 'none';
        if (btnStop) btnStop.style.display = 'none';
        if (btnStart) {
          btnStart.style.display = 'inline-flex';
          btnStart.textContent = 'Restart Verification';
        }

        if (summaryBox) {
          summaryBox.style.display = 'block';
          summaryBox.innerHTML = `
            <div style="background-color: var(--success-bg); border: 1px solid var(--success-border); border-radius: var(--radius-sm); padding: 14px; margin-top: 14px;">
              <div style="font-weight:700; color:var(--success-text); font-size:13.5px; margin-bottom:4px;">
                ✓ Verification Completed Successfully
              </div>
              <div style="font-size:12px; color:var(--success-text); line-height:1.6;">
                • <strong>335,900</strong> tags reconciled and verified on shelves.<br>
                • <strong>4,100</strong> untraceable volumes flagged for physical audit review.<br>
                • <strong>14</strong> duplicate transponder registrations identified.<br>
                • <strong>8</strong> CRC scan error packets quarantined.
              </div>
            </div>
          `;
        }

        appendLog('SUCCESS: Complete 340,000 tag audit finished.');
        appendLog('RESULT: 335,900 Verified, 4,100 Missing, 14 Duplicate tags, 8 Unregistered tags localized.');
        window.showToast('Stock Verification finished: 340,000 tags audited', 'success');
      } else {
        const pct = Math.floor((currentProgress / totalTags) * 100);
        const scannedMissing = Math.floor((currentProgress / totalTags) * missingTarget);
        const scannedDupes = Math.floor((currentProgress / totalTags) * duplicateTarget);
        const scannedErr = Math.floor((currentProgress / totalTags) * errorTarget);

        if (progressFill) progressFill.style.width = `${pct}%`;
        if (scanCountText) scanCountText.textContent = `${currentProgress.toLocaleString()} / 340,000 tags (${pct}%)`;

        if (valScanned) valScanned.textContent = currentProgress.toLocaleString();
        if (valUnmatched) valUnmatched.textContent = scannedMissing.toLocaleString();
        if (valDuplicate) valDuplicate.textContent = scannedDupes.toLocaleString();
        if (valErrors) valErrors.textContent = scannedErr.toLocaleString();

        if (pct % 25 === 0) {
          appendLog(`SYNC: Handheld cluster reached ${pct}% milestone (${currentProgress.toLocaleString()} tags scanned).`);
        }
      }
    }, 65);
  }

  if (btnStart) {
    btnStart.addEventListener('click', function () {
      currentProgress = 0;
      startSweep();
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', function () {
      isPaused = true;
      btnPause.style.display = 'none';
      if (btnResume) btnResume.style.display = 'inline-flex';
      if (statusHeadline) statusHeadline.textContent = 'Verification Paused';
      appendLog('PAUSE: Operator paused RFID sweep cycle.');
      window.showToast('Verification sweep paused', 'info');
    });
  }

  if (btnResume) {
    btnResume.addEventListener('click', function () {
      isPaused = false;
      btnResume.style.display = 'none';
      if (btnPause) btnPause.style.display = 'inline-flex';
      if (statusHeadline) statusHeadline.textContent = 'Verification in progress';
      appendLog('RESUME: Resuming RFID sweep cycle.');
      window.showToast('Verification sweep resumed', 'info');
    });
  }

  if (btnStop) {
    btnStop.addEventListener('click', function () {
      if (verificationInterval) clearInterval(verificationInterval);
      verificationInterval = null;
      isPaused = false;

      if (btnPause) btnPause.style.display = 'none';
      if (btnResume) btnResume.style.display = 'none';
      if (btnStop) btnStop.style.display = 'none';
      if (btnStart) {
        btnStart.style.display = 'inline-flex';
        btnStart.textContent = 'Start Verification';
      }

      if (statusHeadline) statusHeadline.textContent = 'Verification Stopped';
      appendLog('STOP: Handheld sweep stopped by user.');
      window.showToast('Verification stopped', 'warning');
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', function () {
      exportStockReportCSV();
    });
  }

  function appendLog(msg) {
    if (!auditLogTerminal) return;
    const now = new Date().toLocaleTimeString();
    auditLogTerminal.innerHTML += `<div><span style="color:var(--text-muted);">[${now}]</span> ${escapeHtml(msg)}</div>`;
    auditLogTerminal.scrollTop = auditLogTerminal.scrollHeight;
  }
}

function exportStockReportCSV() {
  const store = window.shelfMindStore;
  const state = store.getState();
  const books = state.books;

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Book ID,Title,Author,ISBN,RFID Tag,Status,Shelf Location,Audit Result\n';

  books.forEach(b => {
    let auditResult = 'Verified Present';
    if (b.status === 'Missing') auditResult = 'MISSING_UNTRACEABLE';
    if (b.status === 'Issued') auditResult = 'CIRCULATING_LOAN';
    if (b.status === 'Under Verification') auditResult = 'RECONCILIATION_FLAG';

    const row = [
      `"${b.id}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.isbn}"`,
      `"${b.rfidTag}"`,
      `"${b.status}"`,
      `"${b.shelfLocation}"`,
      `"${auditResult}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\nSUMMARY METRICS\n';
  csvContent += 'Total Library Volumes,340000\n';
  csvContent += 'Untraceable Books Flagged,4100\n';
  csvContent += 'Active RFID Handhelds,6\n';
  csvContent += 'Reader Interrogation Rate,180 tags/min/handheld\n';
  csvContent += 'Theoretical Continuous Duration,5h 15m (314.8 minutes)\n';

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ShelfMind_Stock_Verification_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.showToast('✓ Stock Verification CSV report exported successfully', 'success');
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
