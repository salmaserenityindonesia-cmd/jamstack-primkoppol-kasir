---
phase: 1
plan: 3
wave: 1
---

# Plan 1.3: Diagnostik Total, Pembersihan IndexedDB, dan Kompilasi Ulang

## Objective
Melakukan pemasangan pelapor galat agresif untuk diagnostik, serta melakukan reset dependensi dan kompilasi ulang bundle menggunakan Vite untuk memastikan kestabilan aplikasi.

## Context
- index.html
- package.json
- server.js

## Tasks

<task type="auto">
  <name>Task 1: Pemasangan Pelapor Galat Agresif di index.html</name>
  <files>index.html</files>
  <action>
    1. Buka `index.html`.
    2. Pada blok skrip `<head>`, tambahkan penangkap galat paling atas sebelum skrip lain dimuat:
       ```javascript
       window.addEventListener('error', function(e) {
           const errBox = document.querySelector('.bg-red-50');
           if(errBox) {
               errBox.innerHTML = `<p class="font-bold text-red-700">FATAL CRASH:</p><p class="text-sm text-red-600">${e.message}</p><p class="text-xs text-slate-500 mt-2">File: ${e.filename}:${e.lineno}</p>`;
           }
       });
       ```
    3. Pastikan tag pemanggilan skrip bundle menggunakan `type="module"` dan memiliki rute yang benar: `<script type="module" src="/assets/index.js"></script>`.
  </action>
  <verify>Jika terjadi crash sintaks atau 404, kotak merah akan menampilkan detail baris error alih-alih pesan timeout generik.</verify>
  <done>Antarmuka kini mampu melaporkan penyebab crash secara transparan.</done>
</task>

<task type="auto">
  <name>Task 2: Reset Dependensi & Kompilasi Ulang Bundle (Vite)</name>
  <files>package.json</files>
  <action>
    1. Jalankan instalasi ulang untuk memastikan tidak ada pustaka yang hilang: `npm install`.
    2. Eksekusi kompilasi bundle: `npm run build`.
    3. Jika menggunakan server Express (`server.js`), pastikan folder `dist` disajikan (served) sebagai direktori statis agar `/assets/index.js` dapat diakses oleh browser.
  </action>
  <verify>Periksa log terminal, pastikan `vite build` selesai dan berkas `dist/assets/index.js` berhasil dibuat tanpa error.</verify>
  <done>Dependensi terjamin dan bundle JavaScript terbaru siap disajikan ke peramban.</done>
</task>

## Success Criteria
- [ ] Error handler terpasang dengan benar di index.html
- [ ] Bundle JavaScript termuat dengan type="module" dan path src="/assets/index.js"
- [ ] `npm install` dan `npm run build` berhasil dieksekusi tanpa galat dependensi
