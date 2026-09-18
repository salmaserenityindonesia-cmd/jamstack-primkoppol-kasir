/**
 * PRIMKOPPOL NGAWI - Background Worker for Scheduled Google Drive Exports
 * 
 * Runs independently in a Web Worker background thread, unaffected by UI tab throttling.
 * Periodically evaluates active schedules (Daily, Weekly, or Test Interval)
 * and dispatches TRIGGER_EXPORT events to the main thread when due.
 */

let schedules = [];
let timerId = null;
let isRunning = false;
const CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

self.onmessage = function (event) {
  const data = event.data;
  if (!data || !data.type) return;

  switch (data.type) {
    case 'INIT':
    case 'UPDATE_SCHEDULES':
      schedules = Array.isArray(data.schedules) ? data.schedules : [];
      recalculateNextRuns();
      if (!isRunning) {
        startTimer();
      }
      broadcastStatus();
      break;

    case 'START':
      startTimer();
      broadcastStatus();
      break;

    case 'STOP':
      stopTimer();
      broadcastStatus();
      break;

    case 'CHECK_NOW':
      checkSchedules();
      break;

    case 'FORCE_TRIGGER':
      if (data.scheduleId) {
        const sched = schedules.find(s => s.id === data.scheduleId);
        if (sched) {
          triggerExport(sched, true);
        }
      }
      break;

    case 'EXPORT_COMPLETED':
      handleExportCompleted(data);
      break;

    case 'GET_STATUS':
      broadcastStatus();
      break;

    default:
      break;
  }
};

function startTimer() {
  if (timerId) clearInterval(timerId);
  isRunning = true;
  timerId = setInterval(checkSchedules, CHECK_INTERVAL_MS);
  // Initial check
  checkSchedules();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
}

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalTimeString(d = new Date()) {
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

function recalculateNextRuns() {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  schedules.forEach(sched => {
    if (!sched.enabled) {
      sched.nextRunTimestamp = null;
      sched.nextRunLabel = 'Nonaktif (Dijeda)';
      return;
    }

    const timeParts = (sched.time || '18:00').split(':');
    const targetHour = parseInt(timeParts[0], 10) || 0;
    const targetMin = parseInt(timeParts[1], 10) || 0;

    if (sched.interval === 'daily') {
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMin, 0, 0);
      if (candidate.getTime() <= now.getTime()) {
        // If target time today has already passed, schedule for tomorrow
        candidate.setDate(candidate.getDate() + 1);
      }
      sched.nextRunTimestamp = candidate.getTime();
      sched.nextRunLabel = `Besok pukul ${String(targetHour).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}`;
      if (candidate.getDate() === now.getDate()) {
        sched.nextRunLabel = `Hari ini pukul ${String(targetHour).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}`;
      }
    } else if (sched.interval === 'weekly') {
      const targetDay = typeof sched.dayOfWeek === 'number' ? sched.dayOfWeek : 1; // Default Monday
      const currentDay = now.getDay();
      let daysToAdd = (targetDay - currentDay + 7) % 7;
      
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, targetHour, targetMin, 0, 0);
      if (daysToAdd === 0 && candidate.getTime() <= now.getTime()) {
        // Already passed today, advance by 7 days
        candidate.setDate(candidate.getDate() + 7);
      }

      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      sched.nextRunTimestamp = candidate.getTime();
      sched.nextRunLabel = `${dayNames[targetDay]} pukul ${String(targetHour).padStart(2, '0')}:${String(targetMin).padStart(2, '0')}`;
    } else if (sched.interval === 'test_interval') {
      const intervalMins = sched.intervalMinutes || 5;
      const last = sched.lastRunTimestamp || now.getTime();
      let candidate = last + (intervalMins * 60 * 1000);
      if (candidate <= now.getTime()) {
        candidate = now.getTime() + (intervalMins * 60 * 1000);
      }
      sched.nextRunTimestamp = candidate;
      const diffSecs = Math.max(0, Math.round((candidate - now.getTime()) / 1000));
      sched.nextRunLabel = `Setiap ${intervalMins} mnt (~${Math.ceil(diffSecs / 60)} mnt lagi)`;
    }
  });
}

function checkSchedules() {
  const now = new Date();
  const nowTimestamp = now.getTime();
  const todayStr = getLocalDateString(now);
  const currentTimeStr = getLocalTimeString(now);
  const currentDayOfWeek = now.getDay();

  let triggeredAny = false;

  schedules.forEach(sched => {
    if (!sched.enabled || sched.inProgress) return;

    let isDue = false;

    if (sched.interval === 'daily') {
      const schedTime = sched.time || '18:00';
      // Due if current time >= schedTime and lastRunDate is not today
      if (currentTimeStr >= schedTime && sched.lastRunDate !== todayStr) {
        isDue = true;
      }
    } else if (sched.interval === 'weekly') {
      const targetDay = typeof sched.dayOfWeek === 'number' ? sched.dayOfWeek : 1;
      const schedTime = sched.time || '08:00';
      if (currentDayOfWeek === targetDay && currentTimeStr >= schedTime && sched.lastRunDate !== todayStr) {
        isDue = true;
      }
    } else if (sched.interval === 'test_interval') {
      const intervalMs = (sched.intervalMinutes || 5) * 60 * 1000;
      const last = sched.lastRunTimestamp || 0;
      if (nowTimestamp - last >= intervalMs) {
        isDue = true;
      }
    }

    if (isDue) {
      triggeredAny = true;
      triggerExport(sched, false);
    }
  });

  // Periodically send tick update
  self.postMessage({
    type: 'WORKER_TICK',
    timestamp: now.toISOString(),
    currentTime: currentTimeStr,
    today: todayStr,
    activeSchedulesCount: schedules.filter(s => s.enabled).length
  });
}

function triggerExport(sched, isManualTrigger) {
  sched.inProgress = true;
  self.postMessage({
    type: 'TRIGGER_EXPORT',
    scheduleId: sched.id,
    scheduleName: sched.name,
    reportTypes: sched.reportTypes || ['inventory'],
    folderId: sched.folderId || 'root',
    folderName: sched.folderName || 'Root (Folder Utama Google Drive)',
    titlePrefix: sched.titlePrefix || 'PRIMKOPPOL_AUTO',
    interval: sched.interval,
    isManualTrigger: Boolean(isManualTrigger),
    timestamp: new Date().toISOString()
  });
}

function handleExportCompleted(data) {
  const sched = schedules.find(s => s.id === data.scheduleId);
  const now = new Date();
  if (sched) {
    sched.inProgress = false;
    sched.lastRunTimestamp = now.getTime();
    sched.lastRunDate = getLocalDateString(now);
    sched.lastRunTimeStr = getLocalTimeString(now);
    sched.lastResult = {
      success: Boolean(data.success),
      filesCount: data.filesCount || 0,
      timestamp: now.toISOString(),
      message: data.message || (data.success ? 'Berhasil diekspor' : 'Gagal')
    };
    recalculateNextRuns();
  }
  broadcastStatus();
}

function broadcastStatus() {
  const activeSchedules = schedules.filter(s => s.enabled);
  let nextUpcoming = null;
  if (activeSchedules.length > 0) {
    const sorted = [...activeSchedules]
      .filter(s => s.nextRunTimestamp)
      .sort((a, b) => a.nextRunTimestamp - b.nextRunTimestamp);
    if (sorted.length > 0) {
      nextUpcoming = {
        scheduleId: sorted[0].id,
        name: sorted[0].name,
        timestamp: sorted[0].nextRunTimestamp,
        label: sorted[0].nextRunLabel
      };
    }
  }

  self.postMessage({
    type: 'WORKER_STATUS',
    isRunning: isRunning,
    totalSchedules: schedules.length,
    activeCount: activeSchedules.length,
    nextUpcoming: nextUpcoming,
    schedules: schedules
  });
}
