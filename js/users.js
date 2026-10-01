/**
 * ShelfMind: Users Controller
 * Manages institutional patrons and staff across Students, Librarians, and Administrators tabs.
 */

let activeUserTab = 'Student';

document.addEventListener('DOMContentLoaded', function () {
  setupUserTabs();
  renderUsersTable();
});

function setupUserTabs() {
  const tabs = document.querySelectorAll('.tab-btn[data-user-role]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      activeUserTab = this.dataset.userRole;
      renderUsersTable();
    });
  });
}

function renderUsersTable() {
  const store = window.shelfMindStore;
  if (!store) return;

  const users = store.getState().users;
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const filtered = users.filter(u => u.role === activeUserTab);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--navy-600);">No ${activeUserTab} accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const isActive = u.status === 'Active';
    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--navy-900);">${escapeHtml(u.name)}</div>
          <div style="font-size: 11px; color: var(--navy-600);">${escapeHtml(u.email)}</div>
        </td>
        <td class="font-mono"><strong>${u.studentId}</strong></td>
        <td><span class="badge ${u.role === 'Administrator' ? 'badge-alert' : u.role === 'Librarian' ? 'badge-issued' : 'badge-verification'}">${u.role}</span></td>
        <td style="text-align:center; font-weight:600;">${u.activeLoans}</td>
        <td style="text-align:center; font-weight:600;">${u.reservations}</td>
        <td><span class="badge ${isActive ? 'badge-available' : 'badge-missing'}">${u.status}</span></td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="viewUserModal('${u.id}')">View</button>
            <button class="btn btn-secondary btn-sm" onclick="editUserPrompt('${u.id}')">Edit</button>
            <button class="btn btn-secondary btn-sm" style="color:var(--status-red);" onclick="toggleSuspendUser('${u.id}')">
              ${isActive ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function viewUserModal(userId) {
  const store = window.shelfMindStore;
  const user = store.getState().users.find(u => u.id === userId);
  if (!user) return;

  alert(`Patron Profile:\nName: ${user.name}\nID: ${user.studentId}\nRole: ${user.role}\nDepartment: ${user.department}\nEmail: ${user.email}\nActive Loans: ${user.activeLoans}\nAccount Status: ${user.status}`);
}

function editUserPrompt(userId) {
  const store = window.shelfMindStore;
  const user = store.getState().users.find(u => u.id === userId);
  if (!user) return;

  const newDept = prompt(`Edit department for ${user.name}:`, user.department);
  if (newDept !== null && newDept.trim() !== '') {
    const state = store.getState();
    const u = state.users.find(x => x.id === userId);
    if (u) {
      u.department = newDept.trim();
      store.save(state);
      window.showToast(`✓ Updated profile for ${user.name}`, 'success');
      renderUsersTable();
    }
  }
}

function toggleSuspendUser(userId) {
  const store = window.shelfMindStore;
  const state = store.getState();
  const u = state.users.find(x => x.id === userId);
  if (u) {
    u.status = u.status === 'Active' ? 'Suspended' : 'Active';
    store.save(state);
    window.showToast(`User ${u.name} is now ${u.status}`, u.status === 'Active' ? 'success' : 'alert');
    renderUsersTable();
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
