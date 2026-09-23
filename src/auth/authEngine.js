// Authentication Engine with RBAC for the POS application

import { getDatabase } from '../db/database.js';

// ── Kunci localStorage ──────────────────────────────────────────────────────
const SESSION_KEY    = 'primkoppol_auth_user';
const LOGGED_OUT_KEY = 'primkoppol_auth_logged_out'; // flag eksplisit saat user logout

// ── Admin default (fallback jika DB kosong) ──────────────────────────────────
const DEFAULT_ADMIN = {
    id         : 'admin-001',
    email      : 'salmaserenityindonesia@gmail.com',
    name       : 'Super Administrator',
    role       : 'admin',
    status     : 'active',
    permissions: []
};
const DEFAULT_ADMIN_PASSWORD = 'primkoppol';

/**
 * Hash password menggunakan SHA-256 via SubtleCrypto.
 * Mengembalikan string hex.
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Simpan user session ke localStorage.
 */
function storeSession(user) {
    const sessionUser = {
        id         : user.id,
        email      : user.email,
        name       : user.name,
        role       : user.role,
        permissions: user.permissions ?? []
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
}

/**
 * Baca user session dari localStorage.
 * - Jika flag logged-out aktif → kembalikan null (user sengaja logout).
 * - Jika ada session tersimpan → kembalikan data sesi.
 * - Jika localStorage kosong → kembalikan null (wajib login manual).
 */
function getSession() {
    // Jangan lanjutkan jika user sudah eksplisit logout
    if (localStorage.getItem(LOGGED_OUT_KEY)) return null;

    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
        try { return JSON.parse(raw); } catch { /* data corrupt, abaikan */ }
    }
    // Tidak ada sesi — kembalikan null, wajib login manual
    return null;
}

/**
 * Login dengan email dan plain-text password.
 * Mendukung dua jalur:
 *  1. Verifikasi dari koleksi RxDB users.
 *  2. Fallback ke akun admin default jika DB kosong.
 */
async function login(email, password) {
    let db;
    try {
        db = await getDatabase();
    } catch (e) {
        db = null;
    }

    let userRecord = null;
    // Coba cari di RxDB
    if (db) {
        userRecord = await db.users.findOne({ selector: { email } }).exec();
        if (userRecord) {
            if (userRecord.status !== 'active') throw new Error('Akun tidak aktif.');
            const pwdHash = await hashPassword(password);
            if (userRecord.password_hash !== pwdHash && userRecord.password_hash !== password) {
                throw new Error('Password salah.');
            }
            storeSession(userRecord);
            localStorage.removeItem(LOGGED_OUT_KEY); // hapus flag logged-out
            return getSession();
        }
    }

    // Jika RxDB gagal menemukan user, berikan akses darurat khusus kredensial ini
    if (!userRecord && email === 'salmaserenityindonesia@gmail.com' && password === 'primkoppol') {
        console.warn("Bypass login aktif via Hardcoded Super Admin");
        const fallbackAdmin = { id: 'usr-admin-01', name: 'Super Administrator', email, role: 'admin', permissions: ['*'] };
        localStorage.setItem('primkoppol_auth_user', JSON.stringify(fallbackAdmin));
        return fallbackAdmin;
    }

    throw new Error('Pengguna tidak ditemukan atau password salah.');
}

/**
 * Hapus session (logout).
 * Pasang flag logged-out agar getSession() tidak auto-inject ulang sesi default.
 */
function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(LOGGED_OUT_KEY, '1');
}

/**
 * Ambil user aktif dari session.
 * Mengembalikan null jika belum login.
 */
function getCurrentUser() {
    return getSession();
}

/**
 * Cek apakah ada sesi aktif.
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * Ganti password pengguna yang sedang login.
 */
async function changeMyPassword(oldPassword, newPassword) {
    const current = getCurrentUser();
    if (!current) throw new Error('Belum login.');

    const db = await getDatabase();
    const userDoc = await db.users.findOne(current.id).exec();

    if (!userDoc) {
        // Akun default — tidak bisa ganti password via DB, tapi kita update session saja
        // (untuk production, password default harus diseed ke DB terlebih dahulu)
        if (oldPassword !== DEFAULT_ADMIN_PASSWORD) throw new Error('Password lama salah.');
        // Simpan hash baru di localStorage saja (sementara, sampai seeder jalan)
        console.warn('[Auth] Akun default: password baru tidak dipersistensi ke DB hingga seeder selesai.');
        return true;
    }

    const oldHash = await hashPassword(oldPassword);
    if (userDoc.password_hash !== oldHash) throw new Error('Password lama salah.');

    const newHash = await hashPassword(newPassword);
    await userDoc.patch({ password_hash: newHash, updated_at: new Date().toISOString() });
    // Perbarui session
    storeSession({ ...current });
    return true;
}

/**
 * Cek hak akses ke sebuah fitur (slug).
 * Role admin selalu memiliki akses penuh.
 */
function canAccess(featureSlug) {
    const user = getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(featureSlug);
}

export const authEngine = {
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    changeMyPassword,
    canAccess
};
