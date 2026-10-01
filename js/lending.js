/**
 * ShelfMind: Enterprise RFID Circulation Workstation Controller
 * Simulates high-throughput 13.56 MHz RFID induction scanning with step indicators,
 * manual fallback entry, condition verification, and fine calculation.
 */

let detectedIssueBook = null;
let detectedReturnBook = null;

document.addEventListener('DOMContentLoaded', function () {
  setupTabs();
  setupIssueSimulation();
  setupReturnSimulation();
});

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      this.classList.add('active');
      const target = document.getElementById(this.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

function setupIssueSimulation() {
  const scanBtn = document.getElementById('btnSimulateIssueScan');
  const manualBtn = document.getElementById('btnManualEntryIssue');
  const zone = document.getElementById('issueScanZone');
  const statusHeadline = document.getElementById('issueScanHeadline');
  const resultCard = document.getElementById('issueDetectedCard');
  const issueActionBtn = document.getElementById('btnConfirmIssue');

  if (!scanBtn) return;

  scanBtn.addEventListener('click', function () {
    zone.classList.add('scanning');
    scanBtn.disabled = true;
    if (statusHeadline) statusHeadline.textContent = 'Reading RFID tag...';

    // Update step indicator
    updateStepIndicator('issueSteps', 1);

    setTimeout(() => {
      zone.classList.remove('scanning');
      scanBtn.disabled = false;
      if (statusHeadline) statusHeadline.textContent = 'Ready to scan';

      // Pick an available book
      const store = window.shelfMindStore;
      const books = store.getBooks();
      let book = books.find(b => b.status === 'Available') || books[0];
      detectedIssueBook = book;

      // Populate detected UI
      document.getElementById('issueDetectedTitle').textContent = book.title;
      document.getElementById('issueDetectedRfid').textContent = `${book.rfidTag} detected`;
      document.getElementById('issueDetectedAuthor').textContent = book.author;
      document.getElementById('issueDetectedLocation').textContent = book.shelfLocation;
      
      const statusEl = document.getElementById('issueDetectedStatus');
      statusEl.textContent = book.status;
      statusEl.className = `badge ${book.status === 'Available' ? 'badge-available' : 'badge-alert'}`;

      resultCard.style.display = 'block';

      if (book.status === 'Available') {
        issueActionBtn.disabled = false;
        issueActionBtn.style.display = 'inline-flex';
        document.getElementById('issueActionWarning').style.display = 'none';
        updateStepIndicator('issueSteps', 2);
      } else {
        issueActionBtn.disabled = true;
        issueActionBtn.style.display = 'none';
        const warn = document.getElementById('issueActionWarning');
        warn.style.display = 'block';
        warn.textContent = `Cannot issue volume: Status is currently "${book.status}".`;
      }

      window.showToast(`✓ RFID scan completed: ${book.rfidTag} detected`, 'info');
    }, 900);
  });

  if (manualBtn) {
    manualBtn.addEventListener('click', function () {
      const tag = prompt('Enter 10-digit ISO 15693 RFID Transponder Tag ID (e.g., RFID-001284):', 'RFID-001284');
      if (tag && tag.trim()) {
        const store = window.shelfMindStore;
        const book = store.getBookById(tag.trim()) || store.getBooks()[0];
        detectedIssueBook = book;
        document.getElementById('issueDetectedTitle').textContent = book.title;
        document.getElementById('issueDetectedRfid').textContent = `${book.rfidTag} detected (Manual Entry)`;
        document.getElementById('issueDetectedAuthor').textContent = book.author;
        document.getElementById('issueDetectedLocation').textContent = book.shelfLocation;
        resultCard.style.display = 'block';
        updateStepIndicator('issueSteps', 2);
        window.showToast(`Identified volume: ${book.title}`, 'info');
      }
    });
  }

  if (issueActionBtn) {
    issueActionBtn.addEventListener('click', function () {
      if (!detectedIssueBook) return;

      const patronName = document.getElementById('issuePatronName').value || 'Student Patron';
      const patronId = document.getElementById('issuePatronId').value || '21BCE041';

      const res = window.shelfMindStore.issueBook(detectedIssueBook.rfidTag, patronName, patronId);
      if (res.success) {
        window.showToast('✓ Book issued successfully', 'success');
        updateStepIndicator('issueSteps', 3);
        resultCard.style.display = 'none';
        detectedIssueBook = null;

        // Gate Log
        window.shelfMindStore.addGateEvent(
          res.book.rfidTag,
          res.book.title,
          'Authorized',
          'Self-Issue Kiosk Stn 01: EAS Security Bit deactivated for 14-day checkout.'
        );

        zone.innerHTML = `
          <div style="padding: 24px; text-align: center;">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--success-bg); color:var(--success); border:1px solid var(--success-border); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px;">✓</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Book issued successfully</div>
            <div style="font-size: 13px; color: var(--text-secondary); max-width: 360px; margin: 0 auto 16px;">
              EAS anti-theft bit toggled to INACTIVE. Patron <strong>${escapeHtml(patronId)}</strong> registered for 14-day loan.<br>
              Due date: <strong>${res.book.dueDate}</strong>
            </div>
            <button class="btn btn-primary btn-sm" onclick="location.reload()">Next Patron Checkout</button>
          </div>
        `;
      } else {
        window.showToast(`⚠ ${res.reason}`, 'warning');
      }
    });
  }
}

function setupReturnSimulation() {
  const scanBtn = document.getElementById('btnSimulateReturnScan');
  const manualBtn = document.getElementById('btnManualEntryReturn');
  const zone = document.getElementById('returnScanZone');
  const statusHeadline = document.getElementById('returnScanHeadline');
  const resultCard = document.getElementById('returnDetectedCard');
  const returnActionBtn = document.getElementById('btnConfirmReturn');

  if (!scanBtn) return;

  scanBtn.addEventListener('click', function () {
    zone.classList.add('scanning');
    scanBtn.disabled = true;
    if (statusHeadline) statusHeadline.textContent = 'Reading RFID tag...';

    updateStepIndicator('returnSteps', 1);

    setTimeout(() => {
      zone.classList.remove('scanning');
      scanBtn.disabled = false;
      if (statusHeadline) statusHeadline.textContent = 'Ready to scan';

      // Pick an issued book
      const store = window.shelfMindStore;
      const books = store.getBooks();
      let book = books.find(b => b.status === 'Issued') || books[1];
      detectedReturnBook = book;

      document.getElementById('returnDetectedTitle').textContent = book.title;
      document.getElementById('returnDetectedRfid').textContent = `${book.rfidTag} detected`;
      document.getElementById('returnDetectedBorrower').textContent = book.currentBorrower ? book.currentBorrower.name : 'Student Account (Karan Verma)';
      document.getElementById('returnDetectedDueDate').textContent = book.dueDate || '12 Sep 2026';

      updateStepIndicator('returnSteps', 2);

      // Check if overdue
      const todayStr = '2026-10-01';
      const isOverdue = book.dueDate && new Date(book.dueDate) < new Date(todayStr);

      const fineWarningBox = document.getElementById('returnFineWarningBox');
      const statusEl = document.getElementById('returnDetectedStatus');

      if (isOverdue) {
        statusEl.textContent = 'Overdue';
        statusEl.className = 'badge badge-alert';
        fineWarningBox.style.display = 'block';
        fineWarningBox.innerHTML = `
          <div style="background-color: var(--warning-bg); border: 1px solid var(--warning-border); border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 12px; font-size: 12px; color: var(--warning-text);">
            <strong>Fine calculation required:</strong><br>
            Volume was due on <strong>${book.dueDate}</strong> (19 days past due).<br>
            Fine Calculation Service estimated assessment: <strong>₹95.00</strong> (Configurable ₹5.00/day standard rate).
          </div>
        `;
      } else {
        statusEl.textContent = 'On Time';
        statusEl.className = 'badge badge-available';
        fineWarningBox.style.display = 'none';
      }

      resultCard.style.display = 'block';
      updateStepIndicator('returnSteps', 3);
      window.showToast(`✓ RFID scan completed: ${book.rfidTag} detected`, 'info');
    }, 900);
  });

  if (manualBtn) {
    manualBtn.addEventListener('click', function () {
      const tag = prompt('Enter RFID tag on returned book:', 'RFID-004821');
      if (tag && tag.trim()) {
        const store = window.shelfMindStore;
        const book = store.getBookById(tag.trim()) || store.getBooks()[1];
        detectedReturnBook = book;
        document.getElementById('returnDetectedTitle').textContent = book.title;
        document.getElementById('returnDetectedRfid').textContent = `${book.rfidTag} detected (Manual Entry)`;
        document.getElementById('returnDetectedBorrower').textContent = book.currentBorrower ? book.currentBorrower.name : 'Student Account';
        document.getElementById('returnDetectedDueDate').textContent = book.dueDate || '12 Sep 2026';
        resultCard.style.display = 'block';
        updateStepIndicator('returnSteps', 3);
      }
    });
  }

  if (returnActionBtn) {
    returnActionBtn.addEventListener('click', function () {
      if (!detectedReturnBook) return;

      const res = window.shelfMindStore.returnBook(detectedReturnBook.rfidTag);
      if (res.success) {
        window.showToast('✓ Book returned successfully', 'success');
        updateStepIndicator('returnSteps', 4);
        resultCard.style.display = 'none';
        detectedReturnBook = null;

        // Gate Log
        window.shelfMindStore.addGateEvent(
          res.book.rfidTag,
          res.book.title,
          'Authorized',
          'Smart Chute Return: EAS Security Bit reactivated to ARMED on physical hold.'
        );

        zone.innerHTML = `
          <div style="padding: 24px; text-align: center;">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--success-bg); color:var(--success); border:1px solid var(--success-border); display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px;">✓</div>
            <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Book returned successfully</div>
            <div style="font-size: 13px; color: var(--text-secondary); max-width: 360px; margin: 0 auto 16px;">
              Smart chute mechanical sort verified. EAS security bit reactivated to ARMED.<br>
              ${res.overdueDays > 0 ? `<span style="color:var(--error); font-weight:600;">Fine calculation ledger entry: ₹${res.fineAmount} (${res.overdueDays} days overdue).</span>` : 'Returned on time without fines.'}
            </div>
            <button class="btn btn-teal btn-sm" onclick="location.reload()">Process Next Return</button>
          </div>
        `;
      } else {
        window.showToast(`⚠ ${res.reason}`, 'warning');
      }
    });
  }
}

function updateStepIndicator(barId, activeStep) {
  const bar = document.getElementById(barId);
  if (!bar) return;
  const items = bar.querySelectorAll('.circulation-step-item');
  items.forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');
    if (stepNum < activeStep) {
      item.classList.add('completed');
    } else if (stepNum === activeStep) {
      item.classList.add('active');
    }
  });
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
