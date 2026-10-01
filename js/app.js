/**
 * ShelfMind: Enterprise Global Controller
 * Handles Navigation, Command Palette (⌘ K), Drawers, Modals, Dropdowns, and UI Synchronization
 */

(function () {
  'use strict';

  // --- Toast Notification Utility ---
  window.showToast = function (message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    if (type === 'warning') {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    } else if (type === 'alert' || type === 'danger' || type === 'error') {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else if (type === 'info') {
      iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `<span style="display:flex; align-items:center;">${iconSvg}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease-in';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  };

  // --- Modal Helpers ---
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // --- Right-Side Drawer Helpers ---
  window.openDrawer = function (drawerId) {
    const drawer = document.getElementById(drawerId);
    if (drawer) {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeDrawer = function (drawerId) {
    const drawer = document.getElementById(drawerId);
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // --- Command Palette (⌘ K) Helpers ---
  window.openCommandPalette = function () {
    let overlay = document.getElementById('globalCommandPalette');
    if (!overlay) {
      createGlobalCommandPalette();
      overlay = document.getElementById('globalCommandPalette');
    }
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('commandPaletteInput');
    if (input) {
      input.value = '';
      input.focus();
      filterCommandPalette('');
    }
  };

  window.closeCommandPalette = function () {
    const overlay = document.getElementById('globalCommandPalette');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  function createGlobalCommandPalette() {
    const div = document.createElement('div');
    div.id = 'globalCommandPalette';
    div.className = 'command-palette-overlay';
    div.innerHTML = `
      <div class="command-palette-box">
        <div class="command-search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-secondary); flex-shrink:0;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="commandPaletteInput" placeholder="Type a command or jump to page... (ESC to close)" autocomplete="off">
          <span class="kbd-shortcut">ESC</span>
        </div>
        <div class="command-items-list" id="commandItemsContainer">
          <!-- Dynamically filtered -->
        </div>
      </div>
    `;
    document.body.appendChild(div);

    const input = document.getElementById('commandPaletteInput');
    input.addEventListener('input', function (e) {
      filterCommandPalette(e.target.value.toLowerCase().trim());
    });

    div.addEventListener('click', function (e) {
      if (e.target === div) window.closeCommandPalette();
    });
  }

  const COMMAND_ITEMS = [
    { label: 'Dashboard Overview', group: 'Navigation', icon: 'grid', url: 'dashboard.html' },
    { label: 'Books Catalogue & Inventory', group: 'Navigation', icon: 'book', url: 'books.html' },
    { label: 'RFID Issue & Return Station', group: 'Quick Actions', icon: 'repeat', url: 'issue-return.html' },
    { label: 'Digital Library & E-Book Licences', group: 'Quick Actions', icon: 'cpu', url: 'digital-library.html' },
    { label: 'Stock Verification Sweep', group: 'Operations', icon: 'check-square', url: 'stock-verification.html' },
    { label: 'Gate Security EAS Portal', group: 'Operations', icon: 'shield', url: 'gate-security.html' },
    { label: 'Fine Management & Calculations', group: 'Operations', icon: 'alert-circle', url: 'fines.html' },
    { label: 'Patron & Staff Directory', group: 'Management', icon: 'users', url: 'users.html' },
    { label: 'Operational Analytics & Reports', group: 'Management', icon: 'bar-chart', url: 'reports.html' }
  ];

  function filterCommandPalette(q) {
    const container = document.getElementById('commandItemsContainer');
    if (!container) return;

    const filtered = COMMAND_ITEMS.filter(item => 
      !q || item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No matching commands or navigation routes found.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => `
      <a href="${item.url}" class="command-item">
        <div class="command-item-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--blue);"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span><strong>${item.label}</strong></span>
        </div>
        <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase;">${item.group}</span>
      </a>
    `).join('');
  }

  // --- Keyboard Shortcuts (⌘ K / Ctrl+K and ESC) ---
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      window.openCommandPalette();
    } else if (e.key === 'Escape') {
      window.closeCommandPalette();
      document.querySelectorAll('.drawer-overlay.active').forEach(d => d.classList.remove('active'));
      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      document.querySelectorAll('.dropdown-menu.active').forEach(dd => dd.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });

  // Close modals or drawers on backdrop click
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (e.target.classList.contains('drawer-overlay')) {
      e.target.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Close user dropdown if clicking outside
    const userWrapper = document.querySelector('.user-menu-wrapper');
    const dropdown = document.getElementById('userDropdownMenu');
    if (dropdown && dropdown.classList.contains('active')) {
      if (!userWrapper || !userWrapper.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    }
  });

  // --- Global Synchronization Refresh Helper ---
  window.triggerGlobalSync = function () {
    const btn = document.getElementById('btnSyncData');
    if (btn) btn.style.transform = 'rotate(180deg)';

    window.showToast('Connecting to Central RFID Tag Broker...', 'info');

    setTimeout(() => {
      if (btn) btn.style.transform = 'rotate(0deg)';
      window.showToast('✓ Library state synchronized with RFID server (340,000 tags verified)', 'success');
      
      const syncText = document.getElementById('lastSyncText');
      if (syncText) syncText.textContent = 'Synchronized just now';
    }, 700);
  };

  // --- DOM Content Loaded Setup ---
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Sidebar Mobile Toggle
    const mobileToggle = document.getElementById('mobileNavToggle');
    const sidebar = document.querySelector('.sidebar');

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop && sidebar) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', function () {
        sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', function () {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    }

    // 2. Highlight Active Sidebar Item
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'dashboard.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 3. User Dropdown Toggle
    const userMenuTrigger = document.getElementById('userProfileMenuTrigger');
    const userDropdown = document.getElementById('userDropdownMenu');
    if (userMenuTrigger && userDropdown) {
      userMenuTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
      });
    }

    // 4. Quick Search Button Hook
    const quickSearchBtn = document.getElementById('quickSearchBtn');
    if (quickSearchBtn) {
      quickSearchBtn.addEventListener('click', function () {
        window.openCommandPalette();
      });
    }

    // 5. Populate User Info from Store
    if (window.shelfMindStore) {
      const state = window.shelfMindStore.getState();
      const elUserName = document.getElementById('currentUserName');
      const elUserRole = document.getElementById('currentUserRole');
      if (elUserName && state.currentUser) elUserName.textContent = state.currentUser.name;
      if (elUserRole && state.currentUser) elUserRole.textContent = state.currentUser.role;
    }
  });

})();
