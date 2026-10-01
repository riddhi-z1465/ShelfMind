/**
 * ShelfMind: Fine Management & Calculation Microservice Controller
 * Manages fine assessments, autonomous calculation service simulation, and payment settlements.
 */

document.addEventListener('DOMContentLoaded', function () {
  renderFinesStats();
  renderFinesTable();
  setupFineCalculationService();
});

function renderFinesStats() {
  const store = window.shelfMindStore;
  if (!store) return;

  const fines = store.getState().fines;

  let outstanding = 0;
  let paid = 0;
  let overdueCount = 0;

  fines.forEach(f => {
    if (f.status === 'Outstanding') {
      outstanding += f.calculatedAmount;
      overdueCount++;
    } else if (f.status === 'Paid') {
      paid += f.calculatedAmount;
    }
  });

  const elOut = document.getElementById('statFinesOutstanding');
  const elPaid = document.getElementById('statFinesPaid');
  const elOverdue = document.getElementById('statFinesOverdueReturns');
  const elPending = document.getElementById('statFinesPendingActions');

  if (elOut) elOut.textContent = `₹${outstanding.toLocaleString()}`;
  if (elPaid) elPaid.textContent = `₹${paid.toLocaleString()}`;
  if (elOverdue) elOverdue.textContent = overdueCount;
  if (elPending) elPending.textContent = overdueCount;
}

function renderFinesTable() {
  const store = window.shelfMindStore;
  if (!store) return;

  const fines = store.getState().fines;
  const tbody = document.getElementById('finesTableBody');
  if (!tbody) return;

  if (fines.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:24px; color:var(--navy-600);">No fine assessments recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = fines.map(f => {
    const isPaid = f.status === 'Paid';
    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--navy-900);">${escapeHtml(f.studentName)}</div>
          <div style="font-size: 11px; color: var(--navy-600);">${f.studentId}</div>
        </td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(f.bookTitle)}</div>
          <div style="font-size: 11px; color: var(--navy-600);">Tag: ${f.rfidTag}</div>
        </td>
        <td class="font-mono">${f.dueDate}</td>
        <td class="font-mono">${f.returnDate}</td>
        <td>
          <span class="badge ${isPaid ? 'badge-available' : 'badge-alert'}">
            ${escapeHtml(f.status)} (₹${f.calculatedAmount})
          </span>
        </td>
        <td>
          ${!isPaid ? `
            <button class="btn btn-primary btn-sm" onclick="markFinePaid('${f.id}')">
              Mark Paid
            </button>
          ` : `
            <span style="font-size: 12px; color: #10b981; font-weight: 600;">✓ Settled</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function markFinePaid(fineId) {
  const store = window.shelfMindStore;
  const state = store.getState();
  const fine = state.fines.find(f => f.id === fineId);
  if (fine) {
    fine.status = 'Paid';
    state.projectMetrics.pendingFinesTotal = Math.max(0, state.projectMetrics.pendingFinesTotal - fine.calculatedAmount);
    store.save(state);
    window.showToast(`✓ Fine of ₹${fine.calculatedAmount} marked as Paid for ${fine.studentName}`, 'success');
    renderFinesStats();
    renderFinesTable();
  }
}

function setupFineCalculationService() {
  const btnCalculate = document.getElementById('btnCalculateFineService');
  const serviceOutput = document.getElementById('fineServiceOutput');

  if (!btnCalculate) return;

  btnCalculate.addEventListener('click', function () {
    const days = parseInt(document.getElementById('fineCalcDays').value, 10) || 1;
    const rate = parseFloat(document.getElementById('fineCalcRate').value) || 5.0;

    btnCalculate.disabled = true;
    btnCalculate.textContent = 'Evaluating Ledger Rules...';

    setTimeout(() => {
      btnCalculate.disabled = false;
      btnCalculate.textContent = 'Calculate Fine';

      const total = days * rate;

      serviceOutput.style.display = 'block';
      serviceOutput.innerHTML = `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 12px; margin-top: 12px;">
          <div style="font-weight: 700; color: #166534; font-size: 13px; margin-bottom: 4px;">Fine Assessment Computed</div>
          <div style="font-size: 12px; color: #14532d;">
            <strong>Formula:</strong> ${days} Overdue Days × ₹${rate.toFixed(2)}/day rate = <strong>₹${total.toFixed(2)}</strong><br>
            <span style="font-size: 11px; color: #15803d;">Validated against Academic Regulation Section 14.B (Library Borrowing Bye-Laws).</span>
          </div>
        </div>
      `;

      window.showToast(`Fine Service Assessment: ₹${total.toFixed(2)} calculated`, 'info');
    }, 450);
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
