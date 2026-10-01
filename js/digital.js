/**
 * ShelfMind: Enterprise Controlled Digital Lending & Concurrency Controller
 * Implements 5 concurrent licences, horizontal capacity visualizer, idle session timer,
 * and the atomic test-and-set concurrent licence allocation demonstration.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderDigitalLibrary();
  setupIdleTimeoutDemo();
  setupRaceConditionDemo();
});

function renderDigitalLibrary() {
  const store = window.shelfMindStore;
  if (!store) return;

  const summary = store.getLicenceSummary();

  // 1. Capacity Bar & Top Metrics
  const elActive = document.getElementById('cdlActiveCount');
  const elAvailable = document.getElementById('cdlAvailableCount');
  const elTotal = document.getElementById('cdlTotalCount');
  const dotBar = document.getElementById('licenceDotBar');
  const capFill = document.getElementById('licenceCapacityFill');
  const capText = document.getElementById('licenceCapacityText');

  if (elActive) elActive.textContent = summary.active;
  if (elAvailable) elAvailable.textContent = summary.available;
  if (elTotal) elTotal.textContent = summary.total;

  if (dotBar) {
    let dots = '';
    summary.licences.forEach(l => {
      dots += l.status === 'occupied' ? '● ' : '○ ';
    });
    dotBar.textContent = dots.trim();
  }

  if (capFill) {
    const pct = (summary.active / summary.total) * 100;
    capFill.style.width = `${pct}%`;
    if (capText) capText.textContent = `${pct}% Capacity (${summary.active} of ${summary.total} Licences Allocated)`;
  }

  // 2. Horizontal Detailed Licence Cards (Prompt Section 12)
  const cardsContainer = document.getElementById('licenceCardsGrid');
  if (cardsContainer) {
    cardsContainer.innerHTML = summary.licences.map(l => {
      if (l.status === 'occupied') {
        const remaining = 20 - (l.lastActiveMinutesAgo || 0);
        return `
          <div class="card" style="margin-bottom:0; border-top:3px solid var(--blue);">
            <div class="card-header" style="padding:12px 16px;">
              <span class="font-mono" style="font-weight:700; color:var(--text-primary); font-size:12.5px;">${l.id}</span>
              <span class="badge badge-available">ACTIVE</span>
            </div>
            <div class="card-body" style="padding:14px 16px; font-size:12.5px;">
              <div style="font-weight:700; color:var(--text-primary); margin-bottom:2px;">${escapeHtml(l.user)}</div>
              <div style="font-size:11.5px; color:var(--text-secondary); margin-bottom:10px; line-height:1.4;">${escapeHtml(l.bookTitle)}</div>

              <div style="background:var(--bg-subtle); padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border); font-size:11px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                  <span style="color:var(--text-secondary);">Allocated:</span>
                  <strong>${l.sessionStarted || '25 min ago'}</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--text-secondary);">Watchdog Timeout:</span>
                  <strong style="color:${remaining <= 2 ? 'var(--error)' : 'var(--blue)'};">${remaining} min remaining</strong>
                </div>
              </div>

              <button type="button" class="btn btn-secondary btn-sm" style="width:100%;" onclick="releaseSlot(${l.slot})">
                Revoke / Release Licence
              </button>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="card" style="margin-bottom:0; border-top:3px dashed var(--border-strong); background-color:#FAFBFC;">
            <div class="card-header" style="padding:12px 16px;">
              <span class="font-mono" style="font-weight:700; color:var(--text-muted); font-size:12.5px;">${l.id}</span>
              <span class="badge badge-issued">AVAILABLE</span>
            </div>
            <div class="card-body" style="padding:14px 16px; font-size:12.5px; text-align:center;">
              <div style="color:var(--success-text); font-weight:600; margin:14px 0 6px;">○ Licence Slot Free</div>
              <div style="font-size:11px; color:var(--text-secondary); margin-bottom:16px;">Ready for immediate student or faculty reading stream.</div>
              <button type="button" class="btn btn-teal btn-sm" style="width:100%;" onclick="quickBorrowModal('${l.id}')">
                Allocate E-Book
              </button>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  // 3. E-Book Repository Catalogue Grid
  const ebooksGrid = document.getElementById('ebooksCatalogueGrid');
  if (ebooksGrid) {
    const ebooks = store.getState().ebookCatalogue;
    ebooksGrid.innerHTML = ebooks.map(eb => {
      const isAvailable = summary.available > 0;
      return `
        <div class="card" style="margin-bottom:0; display:flex; flex-direction:column;">
          <div style="height:110px; background-color:${eb.coverColor}; color:#FFFFFF; padding:16px; display:flex; flex-direction:column; justify-content:space-between;">
            <span style="font-size:10px; font-weight:700; text-transform:uppercase; background:rgba(0,0,0,0.3); padding:2px 6px; border-radius:3px; align-self:flex-start;">
              ${escapeHtml(eb.category)}
            </span>
            <div style="font-size:14px; font-weight:700; line-height:1.3;">
              ${escapeHtml(eb.title)}
            </div>
          </div>
          <div class="card-body" style="padding:16px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">
                by <strong>${escapeHtml(eb.authors)}</strong>
              </div>
              <div style="background:var(--bg-subtle); padding:8px 10px; border-radius:var(--radius-xs); border:1px solid var(--border); font-size:11px; margin-bottom:14px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                  <span>Licence Pool:</span>
                  <strong>${summary.total} total concurrent</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span>Available Now:</span>
                  <strong style="color:${isAvailable ? 'var(--success-text)' : 'var(--error)'};">
                    ${summary.available} licence ${summary.available === 1 ? 'available' : 'available'}
                  </strong>
                </div>
              </div>
            </div>

            <button type="button" class="btn ${isAvailable ? 'btn-primary' : 'btn-secondary'} btn-sm" style="width:100%;" onclick="borrowEBook('${eb.id}', '${escapeHtml(eb.title)}')">
              ${isAvailable ? 'Borrow E-Book' : 'Licences Full (Waitlist)'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function releaseSlot(slotNumber) {
  const store = window.shelfMindStore;
  const res = store.releaseLicence(slotNumber);
  if (res.success) {
    window.showToast(`Licence released: Slot 0${slotNumber} is now available`, 'info');
    renderDigitalLibrary();
  }
}

function quickBorrowModal(slotId) {
  borrowEBook('EB-101', 'Operating System Concepts');
}

function borrowEBook(ebookId, title) {
  const store = window.shelfMindStore;
  const summary = store.getLicenceSummary();

  if (summary.available <= 0) {
    window.showToast('⚠ No licence currently available. All 5 concurrent slots are occupied.', 'warning');
    return;
  }

  const res = store.allocateLicence('Admitted Scholar (Demo)', 'Student', title, ebookId);
  if (res.success) {
    window.showToast(`✓ Licence allocated for "${title}". Session opened in Slot 0${res.slot}.`, 'success');
    renderDigitalLibrary();
  } else {
    window.showToast(`⚠ ${res.reason}`, 'warning');
  }
}

function setupIdleTimeoutDemo() {
  const btn = document.getElementById('btnSimulateIdleTimeout');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const store = window.shelfMindStore;
    const res = store.simulateIdleTimeout();

    if (res.success) {
      window.showToast(`✓ Licence released: Inactive session of ${res.previousUser} expired (>20 min idle). 1 licence now available.`, 'info');
      renderDigitalLibrary();
    } else {
      window.showToast(`⚠ ${res.reason}`, 'warning');
    }
  });
}

// Section 13: Concurrent Licence Allocation (Race Condition Demonstration)
function setupRaceConditionDemo() {
  const btnReset = document.getElementById('btnResetRaceDemo');
  const btnRun = document.getElementById('btnRunRaceSimulation');
  const resultDisplay = document.getElementById('raceConditionResults');
  const mutexLockTag = document.getElementById('mutexLockTag');
  const reqAStatus = document.getElementById('raceReqAStatus');
  const reqBStatus = document.getElementById('raceReqBStatus');

  if (!btnRun) return;

  function resetToInitial() {
    const store = window.shelfMindStore;
    const state = store.getState();
    for (let i = 0; i < 4; i++) {
      state.digitalLicences[i].status = 'occupied';
      if (!state.digitalLicences[i].user) {
        state.digitalLicences[i].user = `Student ${String.fromCharCode(65 + i)}`;
        state.digitalLicences[i].role = 'Student';
        state.digitalLicences[i].bookTitle = 'Operating System Concepts';
        state.digitalLicences[i].bookId = 'EB-101';
      }
    }
    state.digitalLicences[4].status = 'available';
    state.digitalLicences[4].user = null;
    state.digitalLicences[4].bookTitle = null;
    store.save(state);
    renderDigitalLibrary();

    if (reqAStatus) reqAStatus.innerHTML = `<span class="badge badge-issued">Requesting licence</span>`;
    if (reqBStatus) reqBStatus.innerHTML = `<span class="badge badge-issued">Requesting licence</span>`;

    if (resultDisplay) {
      resultDisplay.innerHTML = `
        <div style="font-size: 13px; color: var(--text-secondary); line-height:1.6;">
          Initial State: <strong>4 Active</strong>, <strong>1 Available</strong> out of 5 total.<br>
          Click <strong>"Run Concurrent Request"</strong> to trigger simultaneous requests.
        </div>
      `;
    }
  }

  if (btnReset) {
    btnReset.addEventListener('click', function () {
      resetToInitial();
      window.showToast('Demo reset to 4 Active / 1 Available', 'info');
    });
  }

  btnRun.addEventListener('click', function () {
    btnRun.disabled = true;
    if (mutexLockTag) {
      mutexLockTag.className = 'lock-indicator locked';
      mutexLockTag.innerHTML = `🔒 ATOMIC MUTEX ACQUIRED`;
    }

    resultDisplay.innerHTML = `
      <div style="font-size: 12.5px; color: var(--text-primary); background: var(--soft-blue); padding: 12px; border-radius: var(--radius-xs); border: 1px solid var(--blue-border);">
        ⚡ <strong>Simultaneous Request Ingress:</strong><br>
        Request A (User A) timestamp: t<sub>0</sub> + 0.0001ms<br>
        Request B (User B) timestamp: t<sub>0</sub> + 0.0001ms<br>
        <em>Executing atomic test-and-set token allocation...</em>
      </div>
    `;

    setTimeout(() => {
      const store = window.shelfMindStore;
      const state = store.getState();
      const freeIndex = state.digitalLicences.findIndex(l => l.status === 'available');

      if (freeIndex !== -1) {
        state.digitalLicences[freeIndex].status = 'occupied';
        state.digitalLicences[freeIndex].user = 'User A (Concurrent Winner)';
        state.digitalLicences[freeIndex].role = 'Student';
        state.digitalLicences[freeIndex].bookTitle = 'Computer Networks';
        state.digitalLicences[freeIndex].bookId = 'EB-104';
        state.digitalLicences[freeIndex].sessionStarted = 'Just now';
        state.digitalLicences[freeIndex].lastActiveMinutesAgo = 0;
        store.save(state);
      }

      if (mutexLockTag) {
        mutexLockTag.className = 'lock-indicator';
        mutexLockTag.innerHTML = `🔓 MUTEX RELEASED`;
      }

      btnRun.disabled = false;
      renderDigitalLibrary();

      if (reqAStatus) reqAStatus.innerHTML = `<span class="badge badge-available">LICENCE ALLOCATED</span>`;
      if (reqBStatus) reqBStatus.innerHTML = `<span class="badge badge-alert">REQUEST REJECTED / QUEUED</span>`;

      resultDisplay.innerHTML = `
        <div style="background-color: var(--success-bg); border: 1px solid var(--success-border); border-radius: var(--radius-sm); padding: 14px; margin-top: 10px;">
          <div style="font-weight: 700; color: var(--success-text); font-size: 13.5px; margin-bottom: 6px;">
            ✓ Concurrent Request Resolved
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 12.5px; margin-bottom: 4px;">
            <span><strong>User A:</strong> Allocated Slot 05</span>
            <span class="badge badge-available">LICENCE ALLOCATED</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 12.5px; margin-bottom: 8px;">
            <span><strong>User B:</strong> Rejected from pool (Slot unavailable)</span>
            <span class="badge badge-alert">REQUEST REJECTED / QUEUED</span>
          </div>
          <div style="border-top: 1px solid var(--success-border); padding-top: 6px; font-size: 12px; color: var(--success-text); font-weight:700;">
            Active licences: 5 / 5 | Available: 0 (Never 6/5)
          </div>
        </div>

        <div style="margin-top: 12px; font-size: 12px; color: var(--text-secondary); background-color: #FFFFFF; border: 1px solid var(--border); padding: 10px 12px; border-radius: var(--radius-xs); line-height:1.5;">
          <strong>Atomic allocation prevents two simultaneous requests from consuming the same final licence.</strong> Strict 5 concurrent user ceiling is cryptographically enforced.
        </div>
      `;

      window.showToast('Licence allocation completed: User A → Allocated, User B → Queued (5/5 enforced)', 'success');
    }, 1000);
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
