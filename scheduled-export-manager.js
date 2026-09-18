/**
 * PRIMKOPPOL NGAWI - Scheduled Export Manager
 * Coordinates with the Background Worker (`scheduled-export-worker.js`)
 * and triggers Google Drive spreadsheet exports automatically on schedule.
 */

const SCHEDULES_STORAGE_KEY = 'primkoppol_scheduled_exports_v1';
const LOGS_STORAGE_KEY = 'primkoppol_scheduled_export_logs_v1';

let worker = null;
let workerAvailable = false;
let fallbackTimerId = null;
let statusListeners = [];
let executionListeners = [];

let latestWorkerStatus = {
  isRunning: false,
  totalSchedules: 0,
  activeCount: 0,
  nextUpcoming: null,
  isWorkerMode: true
};

// Seed default schedules if not yet present
function getInitialDefaultSchedules() {
  return [
    {
      id: 'sched-daily-closing',
      name: 'Ekspor Harian Kasir & Inventaris',
      interval: 'daily',
      time: '18:00', // Jam tutup kasir shift sore
      reportTypes: ['inventory', 'sales', 'shift'],
      folderId: 'root',
      folderName: 'Root (Folder Utama Google Drive)',
      titlePrefix: 'PRIMKOPPOL_HARIAN',
      enabled: true,
      createdAt: new Date().toISOString(),
      lastRunTimestamp: null,
      lastRunDate: null,
      lastRunTimeStr: null,
      lastResult: null
    },
    {
      id: 'sched-weekly-audit',
      name: 'Audit Mingguan Keuangan & Mutasi Stok',
      interval: 'weekly',
      dayOfWeek: 1, // Senin
      time: '08:00',
      reportTypes: ['finance', 'mutasi'],
      folderId: 'root',
      folderName: 'Root (Folder Utama Google Drive)',
      titlePrefix: 'PRIMKOPPOL_AUDIT',
      enabled: true,
      createdAt: new Date().toISOString(),
      lastRunTimestamp: null,
      lastRunDate: null,
      lastRunTimeStr: null,
      lastResult: null
    }
  ];
}

export function getSchedules() {
  try {
    const raw = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (!raw) {
      const defaults = getInitialDefaultSchedules();
      localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[ScheduledExport] Error reading schedules:', e);
    return [];
  }
}

export function saveSchedules(schedules) {
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    syncSchedulesWithWorker();
  } catch (e) {
    console.error('[ScheduledExport] Error saving schedules:', e);
  }
}

export function getScheduleById(id) {
  const list = getSchedules();
  return list.find(s => s.id === id) || null;
}

export function saveOrUpdateSchedule(scheduleData) {
  const list = getSchedules();
  const index = list.findIndex(s => s.id === scheduleData.id);
  
  if (index >= 0) {
    list[index] = { ...list[index], ...scheduleData, updatedAt: new Date().toISOString() };
  } else {
    const newSchedule = {
      id: scheduleData.id || 'sched_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: scheduleData.name || 'Jadwal Ekspor Baru',
      interval: scheduleData.interval || 'daily',
      time: scheduleData.time || '18:00',
      dayOfWeek: typeof scheduleData.dayOfWeek === 'number' ? scheduleData.dayOfWeek : 1,
      intervalMinutes: scheduleData.intervalMinutes || 5,
      reportTypes: Array.isArray(scheduleData.reportTypes) && scheduleData.reportTypes.length > 0
        ? scheduleData.reportTypes
        : ['inventory'],
      folderId: scheduleData.folderId || 'root',
      folderName: scheduleData.folderName || 'Root (Folder Utama Google Drive)',
      titlePrefix: scheduleData.titlePrefix || 'PRIMKOPPOL_AUTO',
      enabled: scheduleData.enabled !== undefined ? Boolean(scheduleData.enabled) : true,
      createdAt: new Date().toISOString(),
      lastRunTimestamp: null,
      lastRunDate: null,
      lastRunTimeStr: null,
      lastResult: null
    };
    list.unshift(newSchedule);
  }

  saveSchedules(list);
  return list;
}

export function deleteSchedule(scheduleId) {
  let list = getSchedules();
  list = list.filter(s => s.id !== scheduleId);
  saveSchedules(list);
  return list;
}

export function toggleScheduleEnabled(scheduleId, enabled) {
  const list = getSchedules();
  const target = list.find(s => s.id === scheduleId);
  if (target) {
    target.enabled = Boolean(enabled);
    target.updatedAt = new Date().toISOString();
    saveSchedules(list);
  }
  return list;
}

export function getLogs() {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addLogEntry(entry) {
  try {
    const logs = getLogs();
    logs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      ...entry
    });
    if (logs.length > 50) logs.pop();
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('[ScheduledExport] Error saving log:', e);
  }
}

export function clearLogs() {
  try {
    localStorage.removeItem(LOGS_STORAGE_KEY);
  } catch (e) {}
}

export function onStatusChange(callback) {
  if (typeof callback === 'function') {
    statusListeners.push(callback);
    callback(latestWorkerStatus);
  }
}

export function onExportExecuted(callback) {
  if (typeof callback === 'function') {
    executionListeners.push(callback);
  }
}

function notifyStatusListeners(status) {
  latestWorkerStatus = { ...latestWorkerStatus, ...status };
  statusListeners.forEach(cb => {
    try { cb(latestWorkerStatus); } catch (e) { console.error(e); }
  });
}

function notifyExecutionListeners(data) {
  executionListeners.forEach(cb => {
    try { cb(data); } catch (e) { console.error(e); }
  });
}

/**
 * Initialize Web Worker Background Worker with graceful fallback
 */
export function initScheduledExportWorker() {
  if (typeof window === 'undefined') return;

  if (window.Worker) {
    try {
      worker = new Worker('/scheduled-export-worker.js');
      workerAvailable = true;

      worker.onmessage = function (event) {
        handleWorkerMessage(event.data);
      };

      worker.onerror = function (err) {
        console.warn('[ScheduledExport] Worker error, falling back to window timer:', err);
        startFallbackTimer();
      };

      // Send initial schedules
      syncSchedulesWithWorker();
      notifyStatusListeners({ isRunning: true, isWorkerMode: true });
      return;
    } catch (err) {
      console.warn('[ScheduledExport] Could not construct Worker, using in-page timer fallback:', err);
    }
  }

  // Fallback if Worker is not available
  startFallbackTimer();
}

function syncSchedulesWithWorker() {
  const current = getSchedules();
  if (worker && workerAvailable) {
    worker.postMessage({
      type: 'UPDATE_SCHEDULES',
      schedules: current
    });
  } else {
    notifyStatusListeners({
      isRunning: true,
      totalSchedules: current.length,
      activeCount: current.filter(s => s.enabled).length,
      isWorkerMode: false
    });
  }
}

function handleWorkerMessage(data) {
  if (!data || !data.type) return;

  switch (data.type) {
    case 'WORKER_STATUS':
      notifyStatusListeners({
        isRunning: data.isRunning,
        totalSchedules: data.totalSchedules,
        activeCount: data.activeCount,
        nextUpcoming: data.nextUpcoming,
        isWorkerMode: true
      });
      break;

    case 'TRIGGER_EXPORT':
      executeScheduledExport(data);
      break;

    case 'WORKER_TICK':
      // Periodic keep-alive tick
      break;

    default:
      break;
  }
}

/**
 * Executes scheduled batch upload to Google Drive using existing GoogleDriveService
 */
export async function executeScheduledExport(triggerData) {
  const { scheduleId, scheduleName, reportTypes, folderId, folderName, titlePrefix, isManualTrigger } = triggerData;

  const timestamp = new Date().toISOString();
  console.log(`[ScheduledExport] Triggering scheduled export: "${scheduleName}" (${reportTypes.join(', ')})`);

  // Verify Google Drive connection
  const isConnected = window.GoogleDriveService && window.GoogleDriveService.isConnected();
  if (!isConnected) {
    const msg = `Akun Google Drive belum terhubung. Ekspor otomatis untuk "${scheduleName}" tertunda.`;
    console.warn(`[ScheduledExport] ${msg}`);
    
    addLogEntry({
      scheduleId,
      scheduleName,
      status: 'pending_auth',
      success: false,
      message: 'Tertunda: Sesi Google Drive belum aktif. Silakan hubungkan Google Drive.',
      reportTypes,
      folderName,
      isManualTrigger: Boolean(isManualTrigger)
    });

    if (worker && workerAvailable) {
      worker.postMessage({
        type: 'EXPORT_COMPLETED',
        scheduleId,
        success: false,
        message: 'Google Drive auth required',
        filesCount: 0
      });
    }

    notifyExecutionListeners({
      scheduleId,
      scheduleName,
      success: false,
      reason: 'auth_required',
      message: msg
    });

    showScheduledExportToast({
      type: 'warning',
      title: 'Ekspor Terjadwal Tertunda',
      message: `Jadwal "${scheduleName}" siap diekspor, namun akun Google Drive belum terhubung.`
    });

    return;
  }

  // Show starting toast/notification
  showScheduledExportToast({
    type: 'info',
    title: 'Background Worker Aktif',
    message: `Menjalankan ekspor otomatis "${scheduleName}" (${reportTypes.length} laporan ke ${folderName})...`
  });

  const results = [];
  const errors = [];
  const today = new Date().toISOString().slice(0, 10);

  // Use REPORT_METADATA from window or define fallback
  const reportMeta = window.REPORT_METADATA || {
    inventory: { defaultSuffix: 'Laporan_Inventaris_Stok', name: 'Inventaris & Sisa Stok' },
    finance: { defaultSuffix: 'Laporan_Keuangan_Piutang', name: 'Keuangan & Piutang Anggota' },
    sales: { defaultSuffix: 'Laporan_Penjualan_Kasir', name: 'Penjualan & Transaksi Kasir' },
    mutasi: { defaultSuffix: 'Laporan_Mutasi_Stok', name: 'Mutasi Kartu Stok Gudang' },
    shift: { defaultSuffix: 'Laporan_Rekonsiliasi_Shift', name: 'Berita Acara Rekonsiliasi Tutup Shift' }
  };

  for (const rType of reportTypes) {
    const meta = reportMeta[rType] || { defaultSuffix: `Laporan_${rType}`, name: rType };
    const fileName = `${titlePrefix || 'PRIMKOPPOL'}_${meta.defaultSuffix}_${today}`;

    try {
      // Check if file already exists in folder for today
      const existingFile = await window.GoogleDriveService.checkFileExistsInFolder(fileName, folderId);
      
      let uploadRes;
      if (existingFile) {
        // Overwrite existing daily file to keep it updated with latest figures
        uploadRes = await window.GoogleDriveService.overwriteSpreadsheetInGoogleDrive(
          existingFile.id,
          rType,
          fileName,
          folderName
        );
        results.push({ ...uploadRes, reportType: rType, isOverwrite: true });
      } else {
        // Create new spreadsheet
        uploadRes = await window.GoogleDriveService.uploadSpreadsheetToGoogleDrive(
          rType,
          fileName,
          folderId,
          folderName
        );
        results.push({ ...uploadRes, reportType: rType, isOverwrite: false });
      }
    } catch (err) {
      console.error(`[ScheduledExport] Failed to export ${rType}:`, err);
      errors.push({ reportType: rType, error: err.message });
    }
  }

  const isSuccess = results.length > 0 && errors.length === 0;
  const isPartial = results.length > 0 && errors.length > 0;

  // Record in logs
  addLogEntry({
    scheduleId,
    scheduleName,
    status: isSuccess ? 'success' : isPartial ? 'partial' : 'failed',
    success: results.length > 0,
    filesExported: results.map(r => ({
      name: r.name,
      id: r.id,
      link: r.webViewLink,
      rowCount: r.rowCount,
      isOverwrite: r.isOverwrite
    })),
    errors: errors,
    folderName,
    isManualTrigger: Boolean(isManualTrigger)
  });

  // Update schedule's last run info in localStorage
  const allSchedules = getSchedules();
  const sched = allSchedules.find(s => s.id === scheduleId);
  if (sched) {
    const now = new Date();
    sched.lastRunTimestamp = now.getTime();
    sched.lastRunDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    sched.lastRunTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    sched.lastResult = {
      success: results.length > 0,
      filesCount: results.length,
      timestamp: now.toISOString(),
      message: isSuccess ? `Sukses (${results.length} file)` : `Sebagian gagal (${results.length} berhasil, ${errors.length} gagal)`
    };
    saveSchedules(allSchedules);
  }

  // Inform worker
  if (worker && workerAvailable) {
    worker.postMessage({
      type: 'EXPORT_COMPLETED',
      scheduleId,
      success: results.length > 0,
      filesCount: results.length,
      message: isSuccess ? 'Sukses' : 'Selesai dengan catatan'
    });
  }

  // Refresh badges in UI if modal is open
  if (typeof window.updateLastExportedBadges === 'function') {
    window.updateLastExportedBadges();
  }
  if (typeof window.refreshDriveHistoryUI === 'function') {
    window.refreshDriveHistoryUI();
  }
  if (typeof window.renderScheduledExportsListUI === 'function') {
    window.renderScheduledExportsListUI();
  }

  // Toast notification
  if (results.length > 0) {
    showScheduledExportToast({
      type: 'success',
      title: 'Ekspor Otomatis Selesai',
      message: `Jadwal "${scheduleName}" berhasil menyimpan ${results.length} spreadsheet ke Google Drive (${folderName}).`,
      links: results.map(r => ({ name: r.name, url: r.webViewLink }))
    });
  } else {
    showScheduledExportToast({
      type: 'error',
      title: 'Ekspor Otomatis Gagal',
      message: `Gagal mengekspor laporan: ${errors.map(e => e.error).join(', ')}`
    });
  }

  notifyExecutionListeners({
    scheduleId,
    scheduleName,
    success: results.length > 0,
    results,
    errors
  });
}

/**
 * Trigger immediate manual execution of a schedule
 */
export function triggerScheduleNow(scheduleId) {
  const sched = getScheduleById(scheduleId);
  if (!sched) return false;

  if (worker && workerAvailable) {
    worker.postMessage({
      type: 'FORCE_TRIGGER',
      scheduleId: sched.id
    });
  } else {
    executeScheduledExport({
      scheduleId: sched.id,
      scheduleName: sched.name,
      reportTypes: sched.reportTypes,
      folderId: sched.folderId,
      folderName: sched.folderName,
      titlePrefix: sched.titlePrefix,
      interval: sched.interval,
      isManualTrigger: true
    });
  }
  return true;
}

/**
 * Fallback timer for environments where Web Worker is restricted
 */
function startFallbackTimer() {
  if (fallbackTimerId) clearInterval(fallbackTimerId);
  workerAvailable = false;

  fallbackTimerId = setInterval(() => {
    const list = getSchedules();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayOfWeek = now.getDay();

    list.forEach(sched => {
      if (!sched.enabled || sched.inProgress) return;

      let isDue = false;
      if (sched.interval === 'daily' && timeStr >= (sched.time || '18:00') && sched.lastRunDate !== todayStr) {
        isDue = true;
      } else if (sched.interval === 'weekly' && dayOfWeek === sched.dayOfWeek && timeStr >= (sched.time || '08:00') && sched.lastRunDate !== todayStr) {
        isDue = true;
      } else if (sched.interval === 'test_interval') {
        const intervalMs = (sched.intervalMinutes || 5) * 60 * 1000;
        if (now.getTime() - (sched.lastRunTimestamp || 0) >= intervalMs) {
          isDue = true;
        }
      }

      if (isDue) {
        sched.inProgress = true;
        executeScheduledExport({
          scheduleId: sched.id,
          scheduleName: sched.name,
          reportTypes: sched.reportTypes,
          folderId: sched.folderId,
          folderName: sched.folderName,
          titlePrefix: sched.titlePrefix,
          interval: sched.interval,
          isManualTrigger: false
        });
      }
    });
  }, 10000);

  notifyStatusListeners({
    isRunning: true,
    isWorkerMode: false
  });
}

/**
 * Toast Notification for Scheduled Exports
 */
export function showScheduledExportToast({ type = 'info', title, message, links = [] }) {
  let container = document.getElementById('scheduled-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'scheduled-toast-container';
    container.className = 'fixed bottom-5 right-5 z-70 flex flex-col gap-2 max-w-sm pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto p-3.5 bg-white border rounded-xl shadow-xl flex items-start gap-3 text-xs transition-all duration-300 transform translate-y-2 opacity-0 animate-in fade-in slide-in-from-bottom-2';

  let borderColor = 'border-blue-300';
  let iconName = 'info';
  let iconColor = 'text-blue-600';
  let badgeBg = 'bg-blue-100 text-blue-800';

  if (type === 'success') {
    borderColor = 'border-emerald-300';
    iconName = 'check_circle';
    iconColor = 'text-emerald-600';
    badgeBg = 'bg-emerald-100 text-emerald-800';
  } else if (type === 'warning') {
    borderColor = 'border-amber-300';
    iconName = 'warning';
    iconColor = 'text-amber-600';
    badgeBg = 'bg-amber-100 text-amber-800';
  } else if (type === 'error') {
    borderColor = 'border-rose-300';
    iconName = 'error';
    iconColor = 'text-rose-600';
    badgeBg = 'bg-rose-100 text-rose-800';
  }

  toast.classList.add(borderColor);

  let linksHtml = '';
  if (links.length > 0) {
    linksHtml = `
      <div class="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
        ${links.map(l => `
          <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition">
            <span class="truncate max-w-[140px]">${l.name}</span>
            <span class="material-symbols-outlined text-xs">open_in_new</span>
          </a>
        `).join('')}
      </div>
    `;
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined text-lg ${iconColor} shrink-0 mt-0.5">${iconName}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-1 mb-0.5">
        <span class="font-bold text-on-surface">${title}</span>
        <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${badgeBg}">Auto Export</span>
      </div>
      <p class="text-secondary leading-snug text-[11px]">${message}</p>
      ${linksHtml}
    </div>
    <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-700 shrink-0">
      <span class="material-symbols-outlined text-sm">close</span>
    </button>
  `;

  container.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Auto remove after 7 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }
  }, 7000);
}

// Make globally accessible
window.ScheduledExportManager = {
  getSchedules,
  saveSchedules,
  getScheduleById,
  saveOrUpdateSchedule,
  deleteSchedule,
  toggleScheduleEnabled,
  getLogs,
  addLogEntry,
  clearLogs,
  initScheduledExportWorker,
  triggerScheduleNow,
  onStatusChange,
  onExportExecuted,
  showScheduledExportToast,
  getStatus: () => latestWorkerStatus
};

// Auto-initialize worker
initScheduledExportWorker();
