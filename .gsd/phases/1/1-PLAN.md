# Phase 1: Perbaikan Seeder Akun Admin & Fail-Safe Login

## Objective
Memperbaiki Seeder Akun Admin di RxDB dan menambahkan fail-safe login di authEngine sesuai protokol GSD.

## Tasks

<task type="auto">
  <name>Task 1: Perbaiki Injeksi Seeder Admin di Inisialisasi Database</name>
  <files>src/db/database.js, src/index.js</files>
  <action>
    1. Buka berkas yang menangani inisialisasi RxDB (biasanya `src/db/database.js` atau di dalam `src/index.js` pada fungsi `initDatabase`).
    2. Segera setelah koleksi `users` terdaftar di RxDB, tambahkan pengecekan jumlah baris data:
       ```javascript
       const existingUsers = await myDatabase.users.find().exec();
       if (existingUsers.length === 0) {
           console.log("Seeding default admin user...");
           await myDatabase.users.insert({
               id: 'usr-admin-01',
               email: 'salmaserenityindonesia@gmail.com',
               name: 'Super Administrator',
               password_hash: 'primkoppol', // Pada tahap awal, simpan plaintext/hash sederhana ini
               role: 'admin',
               status: 'active',
               permissions: ['*'],
               updated_at: new Date().toISOString()
           });
       }
       ```
    3. Pastikan blok kode ini ditunggu (`await`) sebelum memancarkan `window.__POS_SYSTEM_READY__ = true`.
  </action>
  <verify>Buka IndexedDB di browser, periksa object store `docs` di bawah `users`, dan pastikan terdapat 1 baris data berisi email salmaserenityindonesia@gmail.com.</verify>
  <done>Database RxDB kini dijamin selalu memiliki minimal 1 akun admin saat pertama kali dijalankan.</done>
</task>

<task type="auto">
  <name>Task 2: Pasang Fail-Safe Hardcode di Engine Login</name>
  <files>src/auth/authEngine.js</files>
  <action>
    1. Buka `src/auth/authEngine.js`.
    2. Pada fungsi `login(email, password)` yang melakukan kueri ke RxDB, tambahkan jaring pengaman (bypass) jika pembacaan database lokal bermasalah/kosong:
       ```javascript
       // Jika RxDB gagal menemukan user, berikan akses darurat khusus kredensial ini
       if (!userRecord && email === 'salmaserenityindonesia@gmail.com' && password === 'primkoppol') {
           console.warn("Bypass login aktif via Hardcoded Super Admin");
           const fallbackAdmin = { id: 'usr-admin-01', name: 'Super Administrator', email, role: 'admin', permissions: ['*'] };
           localStorage.setItem('primkoppol_auth_user', JSON.stringify(fallbackAdmin));
           return fallbackAdmin;
       }
       ```
    3. Jalankan `npm run build` untuk mengompilasi ulang bundle `dist/assets/index.js`.
  </action>
  <verify>Masukkan email salmaserenityindonesia@gmail.com dan sandi primkoppol di layar login, sistem harus mengizinkan masuk tanpa error.</verify>
  <done>Sistem login memiliki resistensi tinggi terhadap kegagalan pembacaan database inisial.</done>
</task>
