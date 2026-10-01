/**
 * ShelfMind: Enterprise Books Catalogue & Details Drawer Controller
 * Handles search, multi-parameter filtering, sorting, pagination,
 * and the right-side interactive inventory inspection drawer.
 */

let currentSelectedBookId = null;
let currentPage = 1;
const pageSize = 7;
let sortField = 'title';
let sortAsc = true;

document.addEventListener('DOMContentLoaded', function () {
  renderBooksTable();
  setupFilterListeners();
});

function renderBooksTable() {
  const store = window.shelfMindStore;
  if (!store) return;

  const books = store.getBooks();
  const searchInput = document.getElementById('bookSearchInput');
  const filterAvailability = document.getElementById('filterAvailability');
  const filterCategory = document.getElementById('filterCategory');
  const filterLocation = document.getElementById('filterLocation');
  const filterRfidStatus = document.getElementById('filterRfidStatus');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const availVal = filterAvailability ? filterAvailability.value : 'all';
  const catVal = filterCategory ? filterCategory.value : 'all';
  const locVal = filterLocation ? filterLocation.value : 'all';
  const rfidVal = filterRfidStatus ? filterRfidStatus.value : 'all';

  const tbody = document.getElementById('booksTableBody');
  const countDisplay = document.getElementById('booksCountDisplay');
  const paginationControls = document.getElementById('booksPaginationControls');
  if (!tbody) return;

  // Filter
  let filtered = books.filter(b => {
    const matchQuery = !query || 
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      b.isbn.toLowerCase().includes(query) ||
      b.rfidTag.toLowerCase().includes(query);

    const matchAvail = availVal === 'all' || b.status === availVal;
    const matchCat = catVal === 'all' || b.category === catVal;
    const matchLoc = locVal === 'all' || b.shelfLocation.includes(locVal);
    const matchRfid = rfidVal === 'all' || 
      (rfidVal === 'Active' && b.status !== 'Missing') || 
      (rfidVal === 'Untraced' && b.status === 'Missing');

    return matchQuery && matchAvail && matchCat && matchLoc && matchRfid;
  });

  // Sort
  filtered.sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${books.length} physical volumes`;
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = 1;
  const startIdx = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIdx, startIdx + pageSize);

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <div class="empty-state-title">No matching volumes found</div>
            <div class="empty-state-desc">Try clearing your filters or searching by title, author, or RFID transponder ID.</div>
            <button class="btn btn-secondary btn-sm" onclick="clearFilters()">Reset All Filters</button>
          </div>
        </td>
      </tr>
    `;
    if (paginationControls) paginationControls.style.display = 'none';
    return;
  }

  tbody.innerHTML = pageItems.map(b => {
    let badgeClass = 'badge-available';
    if (b.status === 'Issued') badgeClass = 'badge-issued';
    else if (b.status === 'Reserved') badgeClass = 'badge-reserved';
    else if (b.status === 'Missing') badgeClass = 'badge-missing';
    else if (b.status === 'Under Verification') badgeClass = 'badge-verification';

    const lastScan = b.status === 'Missing' ? 'Alert: Unverified' : 'Today 09:30 AM';

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); cursor:pointer;" onclick="openBookDrawer('${b.id}')">${escapeHtml(b.title)}</div>
          <div style="font-size: 11px; color: var(--text-secondary);">${escapeHtml(b.author)} • ${b.edition || ''}</div>
        </td>
        <td class="font-mono">${escapeHtml(b.isbn)}</td>
        <td>
          <span class="font-mono" style="background:var(--bg-subtle); padding:2px 6px; border-radius:4px; border:1px solid var(--border-strong); font-weight:600; color:var(--blue);">
            ${escapeHtml(b.rfidTag)}
          </span>
        </td>
        <td><span style="font-size: 12px; color: var(--text-secondary);">${escapeHtml(b.category)}</span></td>
        <td><span style="font-size: 12px; color: var(--text-primary); font-weight:500;">${escapeHtml(b.shelfLocation)}</span></td>
        <td><span class="badge ${badgeClass}">${escapeHtml(b.status)}</span></td>
        <td style="font-size: 11px; color: ${b.status === 'Missing' ? 'var(--error)' : 'var(--text-muted)'};">${lastScan}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" onclick="openBookDrawer('${b.id}')" title="Inspect Volume in Right Drawer">
              Details
            </button>
            ${b.status === 'Available' ? `
              <button class="btn btn-primary btn-sm" onclick="quickIssueBook('${b.id}')">
                Issue
              </button>
            ` : b.status === 'Issued' ? `
              <button class="btn btn-teal btn-sm" onclick="quickReturnBook('${b.rfidTag}')">
                Return
              </button>
            ` : `
              <button class="btn btn-secondary btn-sm" onclick="openBookDrawer('${b.id}')">
                View
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Render pagination
  if (paginationControls) {
    paginationControls.style.display = 'flex';
    paginationControls.innerHTML = `
      <span style="font-size:12px; color:var(--text-secondary);">Page ${currentPage} of ${totalPages}</span>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-secondary btn-sm" ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Previous</button>
        <button class="btn btn-secondary btn-sm" ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
      </div>
    `;
  }
}

function changePage(p) {
  currentPage = p;
  renderBooksTable();
}

function clearFilters() {
  document.getElementById('bookSearchInput').value = '';
  document.getElementById('filterAvailability').value = 'all';
  document.getElementById('filterCategory').value = 'all';
  document.getElementById('filterLocation').value = 'all';
  document.getElementById('filterRfidStatus').value = 'all';
  currentPage = 1;
  renderBooksTable();
}

function setupFilterListeners() {
  const searchInput = document.getElementById('bookSearchInput');
  const filterAvailability = document.getElementById('filterAvailability');
  const filterCategory = document.getElementById('filterCategory');
  const filterLocation = document.getElementById('filterLocation');
  const filterRfidStatus = document.getElementById('filterRfidStatus');

  if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderBooksTable(); });
  if (filterAvailability) filterAvailability.addEventListener('change', () => { currentPage = 1; renderBooksTable(); });
  if (filterCategory) filterCategory.addEventListener('change', () => { currentPage = 1; renderBooksTable(); });
  if (filterLocation) filterLocation.addEventListener('change', () => { currentPage = 1; renderBooksTable(); });
  if (filterRfidStatus) filterRfidStatus.addEventListener('change', () => { currentPage = 1; renderBooksTable(); });
}

// ==========================================================================
// RIGHT-SIDE ADVANCED BOOK DETAILS DRAWER (Prompt Section 10)
// ==========================================================================
function openBookDrawer(bookId) {
  const store = window.shelfMindStore;
  const book = store.getBookById(bookId);
  if (!book) return;

  currentSelectedBookId = book.id;

  document.getElementById('drawerBookTitle').textContent = book.title;
  document.getElementById('drawerBookAuthor').textContent = book.author;
  document.getElementById('drawerBookIsbn').textContent = book.isbn;
  document.getElementById('drawerBookRfid').textContent = book.rfidTag;
  document.getElementById('drawerBookCategory').textContent = book.category;
  document.getElementById('drawerBookLocation').textContent = book.shelfLocation;
  document.getElementById('drawerBookCallNumber').textContent = book.callNumber || 'N/A';
  document.getElementById('drawerBookPublisher').textContent = `${book.publisher} (${book.publishYear || ''})`;
  document.getElementById('drawerCoverInitial').textContent = book.title.substring(0, 16);

  // Status Badge
  const statusContainer = document.getElementById('drawerBookStatus');
  let badgeClass = 'badge-available';
  if (book.status === 'Issued') badgeClass = 'badge-issued';
  else if (book.status === 'Reserved') badgeClass = 'badge-reserved';
  else if (book.status === 'Missing') badgeClass = 'badge-missing';
  else if (book.status === 'Under Verification') badgeClass = 'badge-verification';
  statusContainer.innerHTML = `<span class="badge ${badgeClass}">${book.status}</span>`;

  // Borrower / Circulation info
  const borrowerBox = document.getElementById('drawerBorrowerInfo');
  if (book.status === 'Issued' && book.currentBorrower) {
    borrowerBox.innerHTML = `
      <div style="background-color: var(--soft-blue); border: 1px solid var(--blue-border); border-radius: var(--radius-sm); padding: 12px; font-size: 12px; margin-bottom: 16px;">
        <div style="font-weight: 700; color: var(--blue); margin-bottom: 4px;">Active Circulation Record</div>
        <div><strong>Borrower:</strong> ${escapeHtml(book.currentBorrower.name)} (${book.currentBorrower.id})</div>
        <div><strong>Issue Date:</strong> ${book.currentBorrower.issueDate || '2026-09-20'}</div>
        <div><strong>Due Date:</strong> ${book.dueDate || '14 days'}</div>
        <div><strong>EAS Anti-Theft Bit:</strong> <span style="color:var(--text-secondary);">Inactive (Deactivated at Kiosk)</span></div>
      </div>
    `;
  } else if (book.status === 'Reserved' && book.reservedFor) {
    borrowerBox.innerHTML = `
      <div style="background-color: var(--warning-bg); border: 1px solid var(--warning-border); border-radius: var(--radius-sm); padding: 12px; font-size: 12px; margin-bottom: 16px;">
        <div style="font-weight: 700; color: var(--warning-text); margin-bottom: 4px;">Hold Shelf Allocation</div>
        <div><strong>Reserved For:</strong> ${escapeHtml(book.reservedFor)}</div>
        <div><strong>Hold Expiration:</strong> 3 Business Days</div>
      </div>
    `;
  } else if (book.status === 'Missing') {
    borrowerBox.innerHTML = `
      <div style="background-color: var(--error-bg); border: 1px solid var(--error-border); border-radius: var(--radius-sm); padding: 12px; font-size: 12px; margin-bottom: 16px; color: var(--error-text);">
        <div style="font-weight: 700; margin-bottom: 4px;">Untraceable Inventory Flag</div>
        <div>Volume was not detected during the last handheld sweep cycle across Stack CS-06. Pedestrian Gate 01 EAS trip logged.</div>
      </div>
    `;
  } else {
    borrowerBox.innerHTML = `
      <div style="background-color: var(--bg-subtle); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; font-size: 12px; margin-bottom: 16px;">
        <div style="font-weight: 600; color: var(--text-primary);">Shelf Verified (Present)</div>
        <div style="color: var(--text-secondary); margin-top: 2px;">EAS Security Bit is ARMED. Volume is available for patron circulation.</div>
      </div>
    `;
  }

  // History timeline
  const historyList = document.getElementById('drawerCirculationHistory');
  if (book.history && book.history.length > 0) {
    historyList.innerHTML = book.history.map(h => `
      <li style="padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12px; display: flex; justify-content: space-between;">
        <span><strong>${h.date}:</strong> ${h.action} (${h.user})</span>
        <span style="color: var(--text-muted);">${h.condition || 'Verified'}</span>
      </li>
    `).join('');
  } else {
    historyList.innerHTML = `<li style="padding: 8px 0; font-size: 12px; color: var(--text-muted);">No prior loan records for this volume in current semester.</li>`;
  }

  // Configure action buttons
  const btnIssue = document.getElementById('drawerBtnIssue');
  const btnReserve = document.getElementById('drawerBtnReserve');
  const btnReturn = document.getElementById('drawerBtnReturn');

  if (btnIssue) btnIssue.disabled = (book.status === 'Issued' || book.status === 'Missing');
  if (btnReserve) btnReserve.disabled = (book.status === 'Reserved' || book.status === 'Missing');
  if (btnReturn) btnReturn.disabled = (book.status !== 'Issued');

  window.openDrawer('bookDetailsDrawer');
}

function handleDrawerIssue() {
  if (!currentSelectedBookId) return;
  const store = window.shelfMindStore;
  const res = store.issueBook(currentSelectedBookId, 'Student Patron (Self-Desk)', '21BCE041');
  if (res.success) {
    window.showToast(`✓ Book issued successfully (${res.book.rfidTag})`, 'success');
    window.closeDrawer('bookDetailsDrawer');
    renderBooksTable();
  } else {
    window.showToast(`⚠ ${res.reason}`, 'warning');
  }
}

function handleDrawerReserve() {
  if (!currentSelectedBookId) return;
  const store = window.shelfMindStore;
  const state = store.getState();
  const book = state.books.find(b => b.id === currentSelectedBookId);
  if (book) {
    book.status = 'Reserved';
    book.reservedFor = 'Vikas Rao (21BCS019)';
    store.save(state);
    window.showToast(`✓ Reservation placed for ${book.title}`, 'success');
    window.closeDrawer('bookDetailsDrawer');
    renderBooksTable();
  }
}

function handleDrawerReturn() {
  if (!currentSelectedBookId) return;
  const store = window.shelfMindStore;
  const book = store.getBookById(currentSelectedBookId);
  if (book) {
    const res = store.returnBook(book.rfidTag);
    if (res.success) {
      window.showToast(`✓ Book returned successfully (${res.book.rfidTag})`, 'success');
      window.closeDrawer('bookDetailsDrawer');
      renderBooksTable();
    }
  }
}

function quickIssueBook(bookId) {
  openBookDrawer(bookId);
}

function quickReturnBook(rfidTag) {
  const res = window.shelfMindStore.returnBook(rfidTag);
  if (res.success) {
    window.showToast(`✓ Returned ${res.book.title} via RFID Chute`, 'success');
    renderBooksTable();
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
