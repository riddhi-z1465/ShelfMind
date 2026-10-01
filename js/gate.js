/**
 * ShelfMind: Enterprise Gate Security Controller
 * Simulates pedestrian portal EAS bit interrogation, gate zone transitions
 * (Entry → Reader → Security Zone → Exit), and logs alerts and transit passes.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderGateEvents();
  setupGateSimulation();
});

function renderGateEvents() {
  const store = window.shelfMindStore;
  if (!store) return;

  const events = store.getState().gateEvents;
  const tbody = document.getElementById('gateEventsTableBody');
  if (!tbody) return;

  if (events.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-secondary);">No gate transit events logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = events.map(evt => {
    let badgeClass = 'badge-authorized';
    if (evt.status === 'Alert') badgeClass = 'badge-alert';
    else if (evt.status === 'RFID Read Error') badgeClass = 'badge-error';

    return `
      <tr>
        <td class="font-mono">${evt.time}</td>
        <td class="font-mono"><strong>${evt.rfidTag}</strong></td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(evt.bookTitle)}</div>
          <div style="font-size: 11px; color: var(--text-secondary);">${evt.detail || ''}</div>
        </td>
        <td>${escapeHtml(evt.event)}</td>
        <td><span class="badge ${badgeClass}">${escapeHtml(evt.status)}</span></td>
      </tr>
    `;
  }).join('');
}

function setupGateSimulation() {
  const btnScan = document.getElementById('btnSimulateGateScan');
  const alertBanner = document.getElementById('gateSimAlertBanner');
  const zoneEntry = document.getElementById('zoneStepEntry');
  const zoneReader = document.getElementById('zoneStepReader');
  const zoneSecurity = document.getElementById('zoneStepSecurity');
  const zoneExit = document.getElementById('zoneStepExit');

  if (!btnScan) return;

  btnScan.addEventListener('click', function () {
    btnScan.disabled = true;
    btnScan.textContent = 'Interrogating Pedestrian Portal...';

    // Step 1: Entry
    setGateZoneActive(zoneEntry);

    setTimeout(() => {
      // Step 2: Reader
      setGateZoneActive(zoneReader);
    }, 300);

    setTimeout(() => {
      // Step 3: Security Zone
      setGateZoneActive(zoneSecurity);
    }, 600);

    setTimeout(() => {
      btnScan.disabled = false;
      btnScan.textContent = 'Simulate RFID Scan';

      // Step 4: Exit
      setGateZoneActive(zoneExit);

      // Random outcome
      const isAuthorized = Math.random() > 0.4;
      const store = window.shelfMindStore;
      const state = store.getState();

      let book;
      if (isAuthorized) {
        book = state.books.find(b => b.status === 'Issued') || state.books[1];
        store.addGateEvent(
          book.rfidTag,
          book.title,
          'Authorized',
          'Pedestrian transit cleared: Active loan valid until ' + (book.dueDate || '14 days')
        );

        if (zoneExit) {
          zoneExit.style.backgroundColor = 'var(--success-bg)';
          zoneExit.style.borderColor = 'var(--success-border)';
          zoneExit.innerHTML = `<span style="color:var(--success-text); font-weight:700;">✓ Turnstile Open</span>`;
        }

        if (alertBanner) {
          alertBanner.style.display = 'block';
          alertBanner.className = 'card';
          alertBanner.style.borderLeft = '4px solid var(--success)';
          alertBanner.innerHTML = `
            <div style="padding: 14px 16px;">
              <div style="color:var(--success-text); font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:6px;">
                <span>✓</span> Authorized exit: ${book.rfidTag}
              </div>
              <div style="font-size:12.5px; color:var(--text-secondary); margin-top:4px;">
                "${book.title}" verified with active loan record. Turnstile released.
              </div>
            </div>
          `;
        }

        window.showToast(`Authorized exit: ${book.rfidTag}`, 'success');
      } else {
        book = state.books.find(b => b.status === 'Available' || b.status === 'Missing') || state.books[6];
        store.addGateEvent(
          book.rfidTag,
          book.title,
          'Alert',
          'Security Alert: Unverified RFID tag. Book has no active issue record.'
        );

        if (zoneExit) {
          zoneExit.style.backgroundColor = 'var(--error-bg)';
          zoneExit.style.borderColor = 'var(--error-border)';
          zoneExit.innerHTML = `<span style="color:var(--error-text); font-weight:700;">! Barrier Locked</span>`;
        }

        if (alertBanner) {
          alertBanner.style.display = 'block';
          alertBanner.className = 'card';
          alertBanner.style.borderLeft = '4px solid var(--error)';
          alertBanner.innerHTML = `
            <div style="padding: 14px 16px;">
              <div style="color:var(--error-text); font-weight:700; font-size:13.5px; display:flex; align-items:center; gap:6px;">
                <span>!</span> Alert: Unverified RFID tag
              </div>
              <div style="font-size:12.5px; color:var(--text-primary); margin-top:4px;">
                "${book.title}" (${book.rfidTag}) detected without active checkout. Barrier locked & audible buzzer triggered.
              </div>
            </div>
          `;
        }

        window.showToast('! Security alert: Unverified RFID tag detected', 'alert');
      }

      renderGateEvents();
    }, 1000);
  });
}

function setGateZoneActive(el) {
  if (!el) return;
  const all = document.querySelectorAll('.gate-zone-step');
  all.forEach(a => a.style.borderColor = 'var(--border)');
  el.style.borderColor = 'var(--blue)';
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
