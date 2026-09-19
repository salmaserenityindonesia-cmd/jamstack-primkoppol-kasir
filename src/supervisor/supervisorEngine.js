import { createClient } from '@supabase/supabase-js';

const DB_NAME = 'supervisor_cache_db';
const DB_VERSION = 1;

let db;
let supabase;

export async function initSupervisor() {
  await initDB();
  await initSupabase();
  await refreshData();
}

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = event => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = event => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('metrics')) {
        db.createObjectStore('metrics', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('members')) {
        db.createObjectStore('members', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('audit_trail')) {
        db.createObjectStore('audit_trail', { keyPath: 'id' });
      }
    };
  });
}

async function initSupabase() {
  try {
    const res = await fetch('/api/env');
    const env = await res.json();
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    }
  } catch (error) {
    console.error('Error fetching Supabase config', error);
  }
}

export async function refreshData() {
  if (navigator.onLine && supabase) {
    try {
      // Fetch delta updates from Supabase
      const today = new Date().toISOString().slice(0, 10);
      
      const { data: trxData } = await supabase
        .from('transactions')
        .select('*')
        .gte('timestamp', today + 'T00:00:00');
        
      const { data: memberData } = await supabase
        .from('members')
        .select('*');

      await updateCache(trxData || [], memberData || []);
    } catch (e) {
      console.warn('Failed to fetch from Supabase, using cache', e);
    }
  }
  
  await renderFromCache();
}

async function updateCache(transactions, members) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['metrics', 'members', 'audit_trail'], 'readwrite');
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = (e) => reject(e);

    const metricsStore = transaction.objectStore('metrics');
    const membersStore = transaction.objectStore('members');
    const auditStore = transaction.objectStore('audit_trail');

    // Calculate metrics
    let totalCash = 0;
    let totalCredit = 0;
    const auditLog = [];

    transactions.forEach(t => {
      if (t.payment_type === 'cash') totalCash += t.total_amount;
      if (t.payment_type === 'credit') totalCredit += t.total_amount;
      if (t.payment_type === 'debt_payment') {
        auditLog.push(t);
        auditStore.put(t);
      }
    });

    metricsStore.put({ id: 'daily_cash', value: totalCash });
    metricsStore.put({ id: 'daily_credit', value: totalCredit });
    metricsStore.put({ id: 'low_stock', value: 0 }); // Placeholder for low stock logic

    members.forEach(m => {
      membersStore.put(m);
    });
  });
}

async function renderFromCache() {
  const cash = await getFromStore('metrics', 'daily_cash');
  const credit = await getFromStore('metrics', 'daily_credit');
  const lowStock = await getFromStore('metrics', 'low_stock');
  
  const allMembers = await getAllFromStore('members');
  const blockedMembers = allMembers.filter(m => m.status === 'blocked' || m.current_debt > m.credit_limit);
  
  const auditLog = await getAllFromStore('audit_trail');

  // Update UI
  document.getElementById('total-cash').textContent = formatIDR(cash?.value || 0);
  document.getElementById('total-credit').textContent = formatIDR(credit?.value || 0);
  document.getElementById('low-stock').textContent = lowStock?.value || 0;
  document.getElementById('blocked-members').textContent = blockedMembers.length;

  renderBlockedMembers(blockedMembers);
  renderAuditTrail(auditLog.slice(0, 20)); // Limit to last 20
}

function getFromStore(storeName, key) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function getAllFromStore(storeName) {
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

function formatIDR(num) {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function renderBlockedMembers(members) {
  const container = document.getElementById('overlimit-list');
  if (!members.length) {
    container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Tidak ada anggota terblokir.</p>';
    return;
  }

  container.innerHTML = members.map(m => `
    <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
      <div>
        <p class="font-bold text-sm text-slate-800">${m.name}</p>
        <p class="text-xs text-slate-500">${m.unit || '-'}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-red-600">${formatIDR(m.current_debt)}</p>
        <p class="text-[10px] text-slate-400">Limit: ${formatIDR(m.credit_limit)}</p>
      </div>
    </div>
  `).join('');
}

function renderAuditTrail(logs) {
  const container = document.getElementById('audit-trail');
  if (!logs.length) {
    container.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">Tidak ada histori pelunasan.</p>';
    return;
  }

  // Sort by timestamp desc
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  container.innerHTML = logs.map(l => {
    const time = new Date(l.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `
    <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
      <div class="flex items-center gap-3">
        <span class="text-xs text-slate-400 font-mono">${time}</span>
        <div>
          <p class="font-bold text-sm text-slate-800">${l.invoice_number}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-bold text-green-600">+${formatIDR(l.total_amount)}</p>
      </div>
    </div>
  `}).join('');
}
