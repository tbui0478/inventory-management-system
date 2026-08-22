/**
 * Inventory Management System Frontend Core Application
 */

const API_BASE = '/api';

// Application State
let state = {
  inventory: [],
  orders: [],
  warehouses: [],
  stats: {},
  selectedItemIds: new Set(),
  activeTab: 'inventory',
  searchTerm: '',
  categoryFilter: 'ALL'
};

// DOM Content Loaded Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEventListeners();
  loadAllData();
});

/* ==========================================================================
   Navigation & Tabs
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update view visibility
  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.style.display = 'block';
    } else {
      view.style.display = 'none';
    }
  });

  // Load view-specific dynamic content
  if (tabId === 'products') renderProductsView();
  if (tabId === 'orders') fetchOrders();
  if (tabId === 'tracking') renderTrackingView();
  if (tabId === 'warehouse') fetchWarehouses();
  if (tabId === 'overview') renderOverviewView();
}

/* ==========================================================================
   Event Listeners & Toolbar Setup
   ========================================================================== */
function initEventListeners() {
  // Search and Filter
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value.toLowerCase();
      renderInventoryTable();
    });
  }

  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      state.categoryFilter = e.target.value;
      renderInventoryTable();
    });
  }

  // Checkbox Select All
  const selectAllCheckbox = document.getElementById('select-all-checkbox');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.item-checkbox');
      state.selectedItemIds.clear();
      checkboxes.forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) {
          state.selectedItemIds.add(parseInt(cb.dataset.id));
        }
      });
      updateDeleteButtonState();
    });
  }

  // Delete Selected Button
  const deleteBtn = document.getElementById('delete-selected-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteSelectedItems);
  }

  // Modal Triggers
  document.getElementById('open-new-item-modal')?.addEventListener('click', () => openItemModal());
  document.getElementById('open-new-order-modal')?.addEventListener('click', () => openOrderModal());
  document.getElementById('settings-btn')?.addEventListener('click', () => openModal('settings-modal'));
  
  // Close Modal Buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });

  // Item Form Submit
  document.getElementById('item-form')?.addEventListener('submit', handleItemFormSubmit);
  document.getElementById('order-form')?.addEventListener('submit', handleOrderFormSubmit);
}

/* ==========================================================================
   API Fetch Calls
   ========================================================================== */
async function loadAllData() {
  await Promise.all([fetchStats(), fetchInventory()]);
}

async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (res.ok) {
      state.stats = await res.json();
      updateDashboardMetrics();
    }
  } catch (err) {
    console.warn('Dashboard stats fetch failed:', err);
  }
}

async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE}/inventory`);
    if (res.ok) {
      state.inventory = await res.json();
      renderInventoryTable();
      fetchStats();
    }
  } catch (err) {
    showToast('Failed to load inventory data.', 'error');
  }
}

async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (res.ok) {
      state.orders = await res.json();
      renderOrdersView();
    }
  } catch (err) {
    console.warn('Fetch orders failed:', err);
  }
}

async function fetchWarehouses() {
  try {
    const res = await fetch(`${API_BASE}/warehouses`);
    if (res.ok) {
      state.warehouses = await res.json();
      renderWarehouseView();
    }
  } catch (err) {
    console.warn('Fetch warehouses failed:', err);
  }
}

/* ==========================================================================
   Dashboard & UI Rendering
   ========================================================================== */
function updateDashboardMetrics() {
  document.getElementById('stat-total-products').textContent = state.stats.totalProducts || 0;
  document.getElementById('stat-low-stock').textContent = state.stats.lowStockCount || 0;
  document.getElementById('stat-units-to-order').textContent = state.stats.totalUnitsToOrder || 0;
  
  const val = state.stats.totalValuation || 0;
  document.getElementById('stat-valuation').textContent = `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  const filtered = state.inventory.filter(item => {
    const matchesSearch = (item.productName || '').toLowerCase().includes(state.searchTerm) ||
                          (item.sku || '').toLowerCase().includes(state.searchTerm) ||
                          (item.location || '').toLowerCase().includes(state.searchTerm);
    const matchesCategory = state.categoryFilter === 'ALL' || item.category === state.categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-box-open" style="font-size: 32px; margin-bottom: 8px; display: block;"></i>
          No inventory items found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const onHand = item.onHand || 0;
    const minStock = item.minStock || 0;
    const maxStock = item.maxStock || 100;
    const toOrder = item.toOrder || Math.max(0, maxStock - onHand);

    let statusBadge = '<span class="status-badge in-stock"><i class="fa-solid fa-circle-check"></i> In Stock</span>';
    if (onHand === 0) {
      statusBadge = '<span class="status-badge reorder-needed"><i class="fa-solid fa-circle-exclamation"></i> Out of Stock</span>';
    } else if (onHand <= minStock) {
      statusBadge = '<span class="status-badge low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span>';
    }

    const isChecked = state.selectedItemIds.has(item.id) ? 'checked' : '';

    return `
      <tr>
        <td>
          <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${isChecked} onchange="toggleItemSelect(${item.id})">
        </td>
        <td>
          <div class="product-cell">
            <span class="product-name">${escapeHtml(item.productName)}</span>
            <span class="product-sku">${escapeHtml(item.sku)} • $${(item.unitPrice || 0).toFixed(2)}</span>
          </div>
        </td>
        <td>${escapeHtml(item.location || 'N/A')}</td>
        <td>
          <div class="qty-control">
            <button class="qty-btn" onclick="adjustQty(${item.id}, -1)">-</button>
            <span style="font-weight: 700; width: 32px; text-align: center;">${onHand}</span>
            <button class="qty-btn" onclick="adjustQty(${item.id}, 1)">+</button>
          </div>
          <div style="margin-top: 4px;">${statusBadge}</div>
        </td>
        <td><span style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(item.route || 'Standard')}</span></td>
        <td>${minStock}</td>
        <td>${maxStock}</td>
        <td><span class="to-order-highlight">${toOrder}</span></td>
        <td style="text-align: right;">
          <button class="icon-btn" onclick="editItem(${item.id})" title="Edit" style="display: inline-flex; width: 32px; height: 32px;">
            <i class="fa-solid fa-pen-to-square" style="font-size: 12px;"></i>
          </button>
          <button class="icon-btn" onclick="deleteSingleItem(${item.id})" title="Delete" style="display: inline-flex; width: 32px; height: 32px; color: var(--accent-danger);">
            <i class="fa-solid fa-trash-can" style="font-size: 12px;"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleItemSelect(id) {
  if (state.selectedItemIds.has(id)) {
    state.selectedItemIds.delete(id);
  } else {
    state.selectedItemIds.add(id);
  }
  updateDeleteButtonState();
}

function updateDeleteButtonState() {
  const btn = document.getElementById('delete-selected-btn');
  if (btn) {
    btn.disabled = state.selectedItemIds.size === 0;
  }
}

/* ==========================================================================
   CRUD Operations
   ========================================================================== */
async function adjustQty(id, delta) {
  try {
    const res = await fetch(`${API_BASE}/inventory/${id}/adjust-stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    if (res.ok) {
      await fetchInventory();
    }
  } catch (err) {
    showToast('Failed to update quantity', 'error');
  }
}

async function handleItemFormSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('item-id').value;
  const payload = {
    productName: document.getElementById('form-product-name').value,
    sku: document.getElementById('form-sku').value,
    category: document.getElementById('form-category').value,
    location: document.getElementById('form-location').value,
    route: document.getElementById('form-route').value,
    onHand: parseInt(document.getElementById('form-on-hand').value) || 0,
    unitPrice: parseFloat(document.getElementById('form-unit-price').value) || 0.0,
    minStock: parseInt(document.getElementById('form-min-stock').value) || 0,
    maxStock: parseInt(document.getElementById('form-max-stock').value) || 100
  };

  try {
    const method = itemId ? 'PUT' : 'POST';
    const url = itemId ? `${API_BASE}/inventory/${itemId}` : `${API_BASE}/inventory`;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('item-modal');
      showToast(itemId ? 'Item updated successfully!' : 'Item created successfully!', 'success');
      await fetchInventory();
    } else {
      showToast('Error saving item.', 'error');
    }
  } catch (err) {
    showToast('Connection error saving item.', 'error');
  }
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  const payload = {
    productName: document.getElementById('order-product-name').value,
    quantity: parseInt(document.getElementById('order-quantity').value) || 1,
    supplier: document.getElementById('order-supplier').value,
    totalCost: parseFloat(document.getElementById('order-total-cost').value) || 0,
    status: 'PENDING'
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      closeModal('order-modal');
      showToast('Purchase order generated!', 'success');
      switchTab('orders');
    }
  } catch (err) {
    showToast('Failed to create order', 'error');
  }
}

function openItemModal(item = null) {
  document.getElementById('item-form').reset();
  if (item) {
    document.getElementById('item-modal-title').textContent = 'Edit Inventory Item';
    document.getElementById('item-id').value = item.id;
    document.getElementById('form-product-name').value = item.productName || '';
    document.getElementById('form-sku').value = item.sku || '';
    document.getElementById('form-category').value = item.category || 'Electronics';
    document.getElementById('form-location').value = item.location || '';
    document.getElementById('form-route').value = item.route || 'Express Freight';
    document.getElementById('form-on-hand').value = item.onHand || 0;
    document.getElementById('form-unit-price').value = item.unitPrice || 0;
    document.getElementById('form-min-stock').value = item.minStock || 0;
    document.getElementById('form-max-stock').value = item.maxStock || 100;
  } else {
    document.getElementById('item-modal-title').textContent = 'Add New Inventory Item';
    document.getElementById('item-id').value = '';
  }
  openModal('item-modal');
}

function editItem(id) {
  const item = state.inventory.find(i => i.id === id);
  if (item) openItemModal(item);
}

async function deleteSingleItem(id) {
  if (confirm('Are you sure you want to delete this inventory item?')) {
    try {
      const res = await fetch(`${API_BASE}/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Item deleted.', 'info');
        state.selectedItemIds.delete(id);
        await fetchInventory();
      }
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  }
}

async function deleteSelectedItems() {
  if (state.selectedItemIds.size === 0) return;
  if (confirm(`Delete ${state.selectedItemIds.size} selected items?`)) {
    const ids = Array.from(state.selectedItemIds);
    for (const id of ids) {
      await fetch(`${API_BASE}/inventory/${id}`, { method: 'DELETE' });
    }
    state.selectedItemIds.clear();
    showToast('Selected items removed.', 'info');
    await fetchInventory();
  }
}

function openOrderModal() {
  document.getElementById('order-form').reset();
  openModal('order-modal');
}

/* ==========================================================================
   Secondary Views Rendering
   ========================================================================== */
function renderProductsView() {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  tbody.innerHTML = state.inventory.map(item => `
    <tr>
      <td><code>${escapeHtml(item.sku)}</code></td>
      <td style="font-weight: 600;">${escapeHtml(item.productName)}</td>
      <td>${escapeHtml(item.category || 'General')}</td>
      <td>$${(item.unitPrice || 0).toFixed(2)}</td>
      <td><span class="status-badge in-stock">Active SKU</span></td>
    </tr>
  `).join('');
}

function renderOrdersView() {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;
  if (state.orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No orders found.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.orders.map(o => `
    <tr>
      <td><strong>${escapeHtml(o.orderNumber || '')}</strong></td>
      <td>${escapeHtml(o.productName || '')}</td>
      <td>${o.quantity} units</td>
      <td>${escapeHtml(o.supplier || '')}</td>
      <td>$${(o.totalCost || 0).toFixed(2)}</td>
      <td><span class="status-badge ${o.status === 'PENDING' ? 'low-stock' : 'in-stock'}">${o.status}</span></td>
    </tr>
  `).join('');
}

function renderWarehouseView() {
  const tbody = document.getElementById('warehouse-table-body');
  if (!tbody) return;
  if (state.warehouses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No warehouses configured.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.warehouses.map(w => {
    const pct = Math.round((w.currentStock / w.capacity) * 100);
    return `
      <tr>
        <td><code>${escapeHtml(w.code)}</code></td>
        <td style="font-weight: 600;">${escapeHtml(w.name)}</td>
        <td>${escapeHtml(w.location)}</td>
        <td>${w.capacity.toLocaleString()} units</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; background: var(--bg-dark); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="width: ${pct}%; background: var(--primary); height: 100%;"></div>
            </div>
            <span style="font-size: 0.8rem; font-weight: 700;">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTrackingView() {
  const container = document.getElementById('tracking-list');
  if (!container) return;
  container.innerHTML = `
    <div class="metric-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span class="status-badge in-stock"><i class="fa-solid fa-truck-ramp-box"></i> In Transit</span>
        <h4 style="margin-top: 8px;">Shipment #TRK-98124 - Express Freight</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem;">From: Apex Seating Co. ➔ To: Main Central Hub (WH-001)</p>
      </div>
      <div style="text-align: right;">
        <span style="font-weight: 700; color: var(--accent-info);">Est. Arrival: Tomorrow, 2:00 PM</span>
      </div>
    </div>
    <div class="metric-card" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span class="status-badge in-stock"><i class="fa-solid fa-check"></i> Delivered</span>
        <h4 style="margin-top: 8px;">Shipment #TRK-44102 - Standard Ground</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem;">From: Vivid Displays ➔ To: West Coast Depot (WH-002)</p>
      </div>
      <div style="text-align: right;">
        <span style="font-weight: 700; color: var(--accent-success);">Completed</span>
      </div>
    </div>
  `;
}

function renderOverviewView() {
  const list = document.getElementById('audit-log-list');
  if (!list) return;
  list.innerHTML = `
    <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.88rem;">
      <i class="fa-solid fa-bell" style="color: var(--accent-warning); margin-right: 8px;"></i>
      <strong>Low Stock Warning:</strong> "Fiber Optic Cable 50m" reached critical safety threshold (3 on hand).
    </div>
    <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.88rem;">
      <i class="fa-solid fa-cart-shopping" style="color: var(--primary); margin-right: 8px;"></i>
      <strong>Auto Reorder Triggered:</strong> Generated Purchase Order ORD-8921-A for Apex Seating Co.
    </div>
    <div style="padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; font-size: 0.88rem;">
      <i class="fa-solid fa-database" style="color: var(--accent-success); margin-right: 8px;"></i>
      <strong>PostgreSQL Connection Active:</strong> Connected to database <code>inventory_db</code> on port 5432.
    </div>
  `;
}

/* ==========================================================================
   Utilities & Modal Helpers
   ========================================================================== */
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${escapeHtml(message)}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
