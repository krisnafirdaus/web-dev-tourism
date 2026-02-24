# 📚 Git Guide - Workshop Web Development

Panduan menggunakan Git untuk proyek workshop ini.

---

## 🚀 Setup Awal (Lakukan Sekali)

### 1. Inisialisasi Repository

```bash
cd workshop-demo
git init
```

### 2. Konfigurasi Git (Jika Belum)

```bash
git config user.name "Nama Anda"
git config user.email "email@example.com"
```

### 3. Tambahkan File ke Git

```bash
# Tambahkan semua file
# File .gitignore otomatis mencegah node_modules, .env, dll
git add .

# Cek status
git status
```

Output yang diharapkan:
```
On branch main
Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   .gitignore
        new file:   README.md
        new file:   day1-frontend/index.html
        new file:   day1-frontend/script.js
        new file:   day1-frontend/styles.css
        new file:   day2-backend/API_DOCUMENTATION.md
        new file:   day2-backend/PAYMENT_GATEWAY_DEMO.md
        new file:   day2-backend/README.md
        new file:   day2-backend/database.sql
        new file:   day2-backend/demo-payment.js
        new file:   day2-backend/package.json
        new file:   day2-backend/payment-gateway.js
        new file:   day2-backend/server.js
        new file:   day2-backend/setup.bat
        new file:   day2-backend/setup.sh
        new file:   day2-backend/test-api.sh
        new file:   shared/presentation-helper.html

# Note: node_modules TIDAK muncul karena sudah di-ignore! ✨
```

### 4. Commit Pertama

```bash
git commit -m "Initial commit: Workshop Web Development Day 1 & 2"
```

---

## 📋 Push ke GitHub/GitLab

### 1. Buat Repository Baru

**GitHub:**
1. Buka https://github.com/new
2. Isi nama repository: `workshop-hotel-webdev`
3. Jangan centang "Add a README" (sudah ada)
4. Create repository

**GitLab:**
1. Buka https://gitlab.com/projects/new
2. Isi nama project
3. Create project

### 2. Connect dan Push

```bash
# Ganti URL dengan repository Anda
git remote add origin https://github.com/username/workshop-hotel-webdev.git

# Push ke main branch
git branch -M main
git push -u origin main
```

---

## ⚠️ Penting: JANGAN Push File Ini!

File berikut sudah otomatis di-ignore oleh `.gitignore`:

### ❌ Dependencies
```
node_modules/          ← Folder besar, bisa di-install ulang
package-lock.json      ← Bisa di-generate dari package.json
```

### ❌ Environment & Secrets
```
.env                   ← Berisi API keys, passwords!
.env.local
.env.production
```

### ❌ Logs & Temp
```
*.log                  ← File log
tmp/                   ← File temporary
.DS_Store              ← macOS system file
```

### ❌ IDE Files
```
.vscode/               ← VS Code settings personal
.idea/                 ← JetBrains IDE settings
```

---

## 🔄 Workflow Sehari-hari

### Simpan Perubahan

```bash
# Cek apa yang berubah
git status

# Tambahkan file yang dimodifikasi
git add .

# Commit dengan pesan yang jelas
git commit -m "feat: add payment gateway simulation"

# Push ke remote
git push
```

### Ambil Update Terbaru

```bash
git pull origin main
```

---

## 🆘 Troubleshooting

### Kasus 1: Node_modules Sudah Ter-track (Ter-commit)

**Masalah:** `node_modules` sudah masuk ke Git sebelum `.gitignore`

**Solusi:**
```bash
# Hapus dari tracking Git
git rm -r --cached node_modules

# Commit perubahan
git commit -m "Remove node_modules from tracking"

# Push
git push
```

### Kasus 2: .env Tidak Sengaja Ter-commit

**Solusi:**
```bash
# Hapus dari tracking
git rm --cached .env

# Commit
git commit -m "Remove .env from tracking"

# Ganti secrets yang ter-expose!
# (Generate API keys baru jika perlu)
```

### Kasus 3: Cek Apa Saja yang Di-ignore

```bash
# List semua file yang di-ignore
git status --ignored

# Atau cek spesifik file
git check-ignore -v node_modules/express/package.json
```

---

## 📊 Cek Ukuran Repository

```bash
# Lihat ukuran folder
du -sh .git

# Lihat file terbesar di Git
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print $3, $4}' | sort -rn | head -10
```

---

## 🎯 Checklist Sebelum Push

- [ ] `node_modules/` tidak ada di `git status`
- [ ] `.env` tidak ada di `git status`
- [ ] Tidak ada file log (`.log`)
- [ ] Pesan commit jelas (contoh: "feat: add booking API")
- [ ] Semua file penting sudah di-add

---

## 📝 Contoh Pesan Commit yang Baik

```bash
# Format: <type>: <description>

git commit -m "feat: add payment gateway integration"
git commit -m "fix: resolve double booking race condition"
git commit -m "docs: update API documentation"
git commit -m "style: improve landing page CSS"
git commit -m "refactor: optimize database queries"

# Untuk multiple changes
git commit -m "feat: add booking system

- Add POST /api/bookings endpoint
- Implement room availability check
- Add payment integration"
```

---

## 🔗 Resources

- **Git Cheat Sheet:** https://git-scm.com/docs/giteveryday
- **GitHub Docs:** https://docs.github.com/en/get-started
- **Git Ignore Templates:** https://github.com/github/gitignore

---

**Selamat menggunakan Git! 🚀**
