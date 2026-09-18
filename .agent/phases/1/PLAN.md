---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1 — Audit Integritas Cadangan & Inisialisasi Git Push

## Objective

Memverifikasi bahwa file-file inti cadangan lokal (package.json, vite.config.js,
build.js, public/_redirects) berada dalam kondisi bersih dan siap produksi,
kemudian melakukan inisialisasi commit pertama dan push penuh ke remote GitHub
untuk memicu deploy otomatis Cloudflare Pages — **tanpa mengubah struktur tampilan
yang sudah berjalan stabil**.

---

> [!IMPORTANT]
> **Temuan Kritis Pra-Eksekusi**
>
> Hasil audit awal mengungkap kondisi berikut yang WAJIB diperhatikan sebelum eksekusi:
>
> 1. **Repositori belum memiliki commit apapun** (`No commits yet`) — ini adalah
>    _initial commit_, bukan sinkronisasi biasa.
> 2. **Tidak ada `git remote` yang terkonfigurasi** — URL remote GitHub wajib
>    ditetapkan oleh user sebelum task 2 dieksekusi.
> 3. **`public/_redirects` hanya berisi komentar** (tidak ada rule aktif) — ini
>    disengaja; aturan redirect ditulis oleh `build.js` ke `dist/_redirects`.
> 4. **`vite.config.js` tidak menggunakan plugin React** — proses build bukan
>    `vite build` melainkan custom Node script (`build.js`) yang menyalin file
>    statis. `npm run build` memanggil `node build.js`.

---

## Context

- `package.json`
- `vite.config.js`
- `build.js`
- `public/_redirects`
- `.gitignore`

---

## Tasks

<task type="auto">
  <name>Task 1: Verifikasi Integritas File Cadangan dan Kelayakan Build</name>
  <files>package.json, vite.config.js, build.js, public/_redirects, .gitignore</files>
  <action>
    1. Periksa `package.json`:
       - Pastikan field `"scripts.build"` bernilai `"CI=false node build.js"`.
       - Pastikan dependencies kritis hadir dan konsisten dengan `package-lock.json`.
       - JANGAN mengubah versi apapun — hanya verifikasi.

    2. Periksa `vite.config.js`:
       - Pastikan `base: '/'` sudah ada.
       - Konfirmasi bahwa file ini tidak digunakan secara aktif oleh `build.js`
         (build berjalan via Node script murni, bukan `vite build`).

    3. Periksa `build.js`:
       - Pastikan semua file yang dicopy ada di root proyek:
         kopos-db.js, google-drive-service.js, scheduled-export-worker.js,
         scheduled-export-manager.js, tailwind-theme.js.
       - Laporkan anomali `;;` di akhir template literal `redirectsContent` baris ~80
         kepada user, tapi JANGAN mengubah file sebelum disetujui.
       - Pastikan path direktori stitch dan src valid.

    4. Jalankan build untuk verifikasi:
       ```powershell
       npm run build
       ```
       - Build dinyatakan LULUS jika proses selesai tanpa error dan `dist/`
         mengandung minimal: `index.html`, `_redirects`, `api/env.json`.

    5. Verifikasi `dist/_redirects` memuat minimal 20 route entry aktif.
  </action>
  <verify>
    ```powershell
    # Jalankan build dan cek exit code
    npm run build; if ($LASTEXITCODE -eq 0) { "BUILD OK" } else { "BUILD FAILED" }

    # Verifikasi aset dist tersedia
    Test-Path "dist/index.html", "dist/_redirects", "dist/api/env.json"

    # Hitung jumlah route aktif di dist/_redirects (harus >= 20)
    (Get-Content "dist/_redirects" | Where-Object { $_ -match "^/" }).Count
    ```
  </verify>
  <done>
    - `npm run build` selesai dengan exit code 0 tanpa pesan error.
    - `dist/index.html`, `dist/_redirects`, dan `dist/api/env.json` hadir.
    - `dist/_redirects` memiliki minimal 20 baris route aktif.
    - Tidak ada modifikasi pada file tampilan atau logika bisnis.
  </done>
</task>

<task type="auto">
  <name>Task 2: Inisialisasi Commit Pertama dan Push ke GitHub</name>
  <files>STATE.md, .gitignore</files>
  <action>
    **PRASYARAT:** User wajib menyediakan URL remote GitHub sebelum task ini berjalan.

    1. Buat file `STATE.md` di root proyek:
       ```markdown
       # State — Primkoppol Kasir

       ## Status Terakhir
       - **Tanggal**: [tanggal eksekusi]
       - **Aksi**: Rollback ke cadangan lokal stabil — initial commit
       - **Kondisi**: Repositori lokal terverifikasi bersih, build lulus uji kelayakan
       - **Remote**: origin → [URL GitHub]

       ## Catatan
       - Struktur tampilan tidak diubah (hanya verifikasi & commit)
       - Build berjalan via custom `build.js` (bukan `vite build`)
       - `dist/_redirects` digenerate otomatis oleh build.js
       ```

    2. Pastikan `.gitignore` mengecualikan: `node_modules/`, `dist/`, `.env`.

    3. Konfigurasikan remote:
       ```powershell
       git remote add origin <URL_GITHUB_DARI_USER>
       ```

    4. Staging dan commit awal:
       ```powershell
       git add -A
       git commit -m "chore: initial commit — cadangan lokal terverifikasi stabil

       - Verifikasi integritas: package.json, vite.config.js, build.js, _redirects
       - Build lulus uji kelayakan (dist/ terisi aset lengkap)
       - Struktur tampilan tidak dimodifikasi
       - Siap deploy via Cloudflare Pages"
       ```

    5. Push ke remote:
       ```powershell
       git push -u origin main
       ```

    6. Buat `.agent/STATE.md` dengan konten identik untuk context memory GSD.
  </action>
  <verify>
    ```powershell
    # Verifikasi commit tersimpan
    git log -1 --format="%H %s"

    # Verifikasi remote sinkron
    git status
    # Output yang diharapkan: "Your branch is up to date with 'origin/main'"

    # Verifikasi remote terkonfigurasi
    git remote -v
    ```
  </verify>
  <done>
    - `git log -1` menampilkan commit hash valid dengan pesan commit deklaratif.
    - `git status` menampilkan "Your branch is up to date with 'origin/main'".
    - `git remote -v` menampilkan URL origin yang benar.
    - Deploy Cloudflare Pages terpicu (terlihat di dashboard Cloudflare).
    - `STATE.md` dan `.agent/STATE.md` berisi catatan pemulihan yang akurat.
  </done>
</task>

---

## Success Criteria

- [ ] `npm run build` selesai exit code 0 tanpa error
- [ ] `dist/` berisi `index.html`, `_redirects` (>=20 routes), `api/env.json`
- [ ] Tidak ada perubahan pada file tampilan atau logika bisnis apapun
- [ ] `git log -1` menampilkan initial commit yang valid
- [ ] `git remote -v` menampilkan URL GitHub yang benar
- [ ] `git status` menampilkan branch up-to-date dengan origin/main
- [ ] Deploy Cloudflare Pages terpicu setelah push

---

## Open Questions (Wajib Dijawab User Sebelum Task 2)

> [!WARNING]
> **Q1 — URL Remote GitHub**: Apa URL repository GitHub yang menjadi target push?
> (Contoh: `https://github.com/username/primkoppol-kasir.git`)
>
> **Q2 — Anomali `build.js` baris 80**: Ditemukan `;;` (double semicolon) di akhir
> template literal `redirectsContent`. Tidak menyebabkan error (ada di dalam string),
> namun apakah ini disengaja atau perlu dibersihkan sebelum commit?
>
> **Q3 — Branch GitHub**: Apakah branch target di GitHub adalah `main` atau `master`?
