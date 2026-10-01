/**
 * ShelfMind: Enterprise Reservations Controller
 * Manages priority hold queues, queue visualization, reservation modal, and cancellations.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderReservationsTable();
  setupReservationModal();
});

function renderReservationsTable() {
  const store = window.shelfMindStore;
  if (!store) return;

  const resList = store.getState().reservations;
  const tbody = document.getElementById('reservationsTableBody');
  const queueVisualBox = document.getElementById('queueVisualContainer');
  if (!tbody) return;

  // Queue visual cards
  if (queueVisualBox) {
    const activeHolds = resList.filter(r => r.status === 'Waiting' || r.status === 'Ready for pickup');
    queueVisualBox.innerHTML = activeHolds.map((r, i) => `
      <div style="background-color:var(--bg-surface); border:1px solid var(--border); border-left:3px solid var(--blue); border-radius:var(--radius-xs); padding:12px 14px; display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="width:26px; height:26px; border-radius:50%; background:var(--soft-blue); color:var(--blue); font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center;">
            #${r.queuePosition || (i + 1)}
          </span>
          <div>
            <div style="font-weight:700; color:var(--text-primary); font-size:13px;">${escapeHtml(r.bookTitle)}</div>
            <div style="font-size:11px; color:var(--text-secondary);">Requested by ${escapeHtml(r.studentName)} (${r.studentId}) • Hold Shelf Expiry: ${r.expiryDate || '3 days'}</div>
          </div>
        </div>
        <span class="badge ${r.status === 'Ready for pickup' ? 'badge-available' : 'badge-reserved'}">
          ${r.status === 'Ready for pickup' ? 'Ready' : 'Waiting'}
        </span>
      </div>
    `).join('');
  }

  if (resList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line></svg>
            </div>
            <div class="empty-state-title">No active reservations</div>
            <div class="empty-state-desc">When students reserve books, they will appear in this priority queue.</div>
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnOpenNewReservationModal').click()">Create First Hold</button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  // Columns: Book | Current Availability | Queue Position | Requested By | Requested Date | Status | Actions
  tbody.innerHTML = resList.map(r => {
    let badgeClass = 'badge-available';
    let statusLabel = r.status;
    if (r.status === 'Waiting') {
      badgeClass = 'badge-reserved';
      statusLabel = 'Waiting';
    } else if (r.status === 'Ready for pickup') {
      badgeClass = 'badge-available';
      statusLabel = 'Ready';
    } else if (r.status === 'Completed') {
      badgeClass = 'badge-verification';
      statusLabel = 'Collected';
    } else if (r.status === 'Cancelled') {
      badgeClass = 'badge-missing';
      statusLabel = 'Cancelled';
    }

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(r.bookTitle)}</div>
          <div style="font-size: 11px; color: var(--text-secondary);">Tag: ${r.rfidTag}</div>
        </td>
        <td><span class="badge ${r.status === 'Ready for pickup' ? 'badge-available' : 'badge-issued'}">${r.status === 'Ready for pickup' ? 'On Hold Shelf' : 'Currently Issued'}</span></td>
        <td>
          <span style="font-weight:700; color:var(--text-primary);">
            ${r.queuePosition > 0 ? `#${r.queuePosition}` : 'Next Pickup'}
          </span>
        </td>
        <td>
          <div style="font-weight:500;">${escapeHtml(r.studentName)}</div>
          <div style="font-size: 11px; color: var(--text-secondary);">${r.studentId}</div>
        </td>
        <td class="font-mono">${r.reservationDate}</td>
        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
        <td>
          ${r.status !== 'Cancelled' && r.status !== 'Completed' ? `
            <button class="btn btn-secondary btn-sm" onclick="cancelReservation('${r.id}')" style="color:var(--error);">
              Cancel
            </button>
          ` : `
            <span style="font-size: 12px; color: var(--text-muted);">Closed</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function cancelReservation(resId) {
  const store = window.shelfMindStore;
  const state = store.getState();
  const target = state.reservations.find(r => r.id === resId);
  if (target) {
    target.status = 'Cancelled';
    store.save(state);
    window.showToast(`✓ Reservation ${resId} cancelled`, 'info');
    renderReservationsTable();
  }
}

function setupReservationModal() {
  const btnCreate = document.getElementById('btnOpenNewReservationModal');
  const modalForm = document.getElementById('newReservationForm');

  if (btnCreate) {
    btnCreate.addEventListener('click', function () {
      const selectBook = document.getElementById('resSelectBook');
      if (selectBook) {
        const books = window.shelfMindStore.getBooks();
        selectBook.innerHTML = books.map(b => `
          <option value="${b.id}">${escapeHtml(b.title)} (${b.rfidTag})</option>
        `).join('');
      }
      window.openModal('createReservationModal');
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const bookId = document.getElementById('resSelectBook').value;
      const studentName = document.getElementById('resStudentName').value;
      const studentId = document.getElementById('resStudentId').value;
      const studentEmail = document.getElementById('resStudentEmail').value;

      const store = window.shelfMindStore;
      const state = store.getState();
      const book = store.getBookById(bookId);

      const newRes = {
        id: 'RES-' + Math.floor(305 + Math.random() * 500),
        bookTitle: book ? book.title : 'Selected Volume',
        bookId: bookId,
        rfidTag: book ? book.rfidTag : 'RFID-AUTO',
        studentName: studentName || 'Patron Student',
        studentId: studentId || '21BCE041',
        studentEmail: studentEmail || 'student@univ.edu.in',
        reservationDate: new Date().toISOString().split('T')[0],
        queuePosition: 1,
        status: 'Waiting',
        expiryDate: '2026-10-10'
      };

      state.reservations.unshift(newRes);
      state.projectMetrics.activeReservationsCount += 1;
      store.save(state);

      window.showToast(`✓ Reservation hold created for "${newRes.bookTitle}"`, 'success');
      window.closeModal('createReservationModal');
      renderReservationsTable();
    });
  }
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
