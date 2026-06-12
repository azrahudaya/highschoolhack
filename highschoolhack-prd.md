# PRD HighschoolHack

Versi: 0.1
Sumber: highschoolhack-prompt_1.md
Tanggal: 2026-06-11

## 0. Keputusan Produk Terkini

Berdasarkan keputusan terakhir:

1. Scope produk tetap mencakup semua kelas: kelas X, XI, dan XII.
2. Build dilakukan bertahap, tetapi arsitektur dari awal harus mendukung tiga program utama.
3. Produk dirancang untuk multi-sekolah sejak awal.
4. Login mendukung Google/Gmail OAuth dan email/password.
5. Database utama menggunakan Heroku Postgres.
6. RIASEC dan VARK menggunakan referensi online yang jelas. Item asesmen harus dibuat dengan hati-hati agar tidak melanggar lisensi/copyright sumber.

## 1. Ringkasan Produk

HighschoolHack adalah platform pendamping pengembangan diri untuk siswa SMA Indonesia. Produk ini membantu siswa kelas X, XI, dan XII mengenali potensi diri, merencanakan masa depan, menyusun target akademik dan karier, serta mempersiapkan kehidupan setelah lulus.

Produk ini sebaiknya diposisikan sebagai platform bimbingan dan konseling digital untuk sekolah, bukan hanya landing page. Landing page tetap dibutuhkan untuk menjelaskan brand dan program, tetapi nilai utama produk ada pada modul siswa, portofolio perkembangan, dan dashboard Guru BK.

## 2. Masalah yang Ingin Diselesaikan

Banyak siswa SMA belum memiliki arah yang jelas tentang adaptasi sekolah, minat diri, pilihan jurusan, rencana karier, dan kesiapan finansial setelah lulus. Di sisi sekolah, Guru BK sering kesulitan memantau perkembangan banyak siswa secara terstruktur karena data tersebar di formulir, catatan manual, atau belum terdokumentasi.

HighschoolHack menyelesaikan masalah ini dengan memberikan alur bimbingan bertahap, asesmen, refleksi, perencanaan, simulasi, portofolio, dan dashboard monitoring untuk Guru BK.

## 3. Target Pengguna

### Siswa kelas X

Siswa baru SMA yang butuh bantuan adaptasi, mengenali potensi diri, membangun target awal, dan membuat portofolio perkembangan.

### Siswa kelas XI

Siswa yang mulai menentukan arah studi, karier, program studi, tujuan masa depan, dan rencana aksi.

### Siswa kelas XII

Siswa yang sedang mempersiapkan kehidupan setelah lulus, termasuk pilihan kuliah, bekerja, wirausaha, biaya hidup, beasiswa, dan kesiapan finansial.

### Guru BK

Pengguna internal sekolah yang memantau progres siswa, melihat profil perkembangan, mengidentifikasi siswa yang perlu perhatian, dan membuat laporan.

### Admin sekolah

Pengelola akun sekolah, kelas, data Guru BK, dan konfigurasi program. Peran ini tidak terlalu terlihat di prompt, tetapi akan dibutuhkan jika produk dipakai banyak sekolah.

## 4. Tujuan Produk

1. Membantu siswa menyelesaikan perjalanan pengembangan diri secara bertahap sesuai kelas.
2. Menghasilkan portofolio perkembangan siswa yang bisa dicetak atau diunduh.
3. Memberikan Guru BK dashboard yang mudah dipakai untuk monitoring siswa.
4. Menyediakan konten edukatif tentang pendidikan, karier, kuliah, finansial, dan inspirasi.
5. Membangun produk yang bisa berkembang dari MVP sederhana menjadi platform sekolah yang serius.

## 5. Non-Goal

1. HighschoolHack bukan pengganti Guru BK, psikolog, atau konselor profesional.
2. HighschoolHack bukan sistem LMS penuh seperti Moodle atau Google Classroom.
3. HighschoolHack bukan aplikasi keuangan resmi, bank, investasi, atau penasihat finansial profesional.
4. Asesmen RIASEC dan VARK di produk ini harus diposisikan sebagai alat eksplorasi diri, bukan diagnosis psikologis formal.

## 6. Struktur Produk

HighschoolHack memiliki empat area utama:

1. Public website
2. Student app
3. Guru BK dashboard
4. Admin and data management

### Public website

Halaman publik berisi:

- Beranda
- Program utama
- Artikel
- Tentang Kami
- CTA menuju login atau mulai program

### Student app

Aplikasi siswa berisi:

- Login atau masuk sebagai siswa
- Profil siswa
- Program sesuai kelas
- Modul sequential
- Autosave
- Progress tracker
- Portofolio perkembangan
- Print atau download PDF

### Guru BK dashboard

Dashboard Guru BK berisi:

- Statistik ringkas
- Daftar siswa
- Filter kelas
- Detail siswa
- Insight perkembangan
- Export laporan

### Admin and data management

Admin dibutuhkan untuk:

- Mengelola sekolah
- Mengelola kelas
- Mengelola Guru BK
- Mengelola daftar siswa
- Mengelola referensi artikel, program studi, karier, kota, dan beasiswa

## 7. Program Utama

### 7.1 Bekal 10 - Kelas X

Tujuan: membantu siswa kelas X beradaptasi di lingkungan SMA, mengenali potensi diri, membuat target akademik dan pengembangan diri, serta menyusun portofolio awal.

Modul:

1. Langkah Awalku di SMA
2. Mengenal Diriku Lebih Dekat
3. Vision Board SMA-ku
4. Target Pengembangan Diri
5. Belajar dari Perjalanan
6. Merancang Target Prestasi
7. Komitmen Akademikku

Fitur penting:

- Profil siswa
- Asesmen adaptasi
- RIASEC 42 item
- VARK 16 item
- Radar chart RIASEC
- Pie chart VARK
- Vision board
- SMART goals
- Refleksi
- Target akademik
- Kontrak belajar digital
- Portofolio
- Dashboard Guru BK

### 7.2 Setting Goal - Kelas XI

Tujuan: membantu siswa kelas XI memahami dirinya, mengeksplorasi program studi dan karier, menyusun tujuan masa depan, dan membuat rencana aksi.

Modul:

1. Kenali Diriku
2. Eksplorasi Program Studi
3. Eksplorasi Karier
4. Mata Pelajaran Pendukung
5. Goal Setting
6. Rencana Aksi
7. Dashboard Perkembangan
8. Refleksi

Fitur penting:

- Profil minat dan nilai diri
- Database program studi
- Database karier
- Gap analysis nilai
- SMART goal card
- Action plan calendar
- Progress dashboard
- Jurnal refleksi
- Portofolio
- Dashboard Guru BK

### 7.3 Smart Financial to Life - Kelas XII

Tujuan: membantu siswa kelas XII mempersiapkan kehidupan setelah lulus melalui simulasi finansial, informasi beasiswa, dan dashboard kesiapan.

Fitur penting:

- Input identitas singkat
- Target setelah lulus
- Minat
- Uang saku, tabungan awal, dana darurat
- Pilih kota tujuan
- Database biaya hidup kota
- Board-game simulation 12 langkah
- Emergency event
- Financial Readiness Score
- Decision Score
- Risk Score
- Analisis otomatis
- Rekomendasi akademik, karier, pribadi, finansial, sosial
- Export PDF
- Halaman beasiswa
- Dashboard sekolah
- Leaderboard
- Badge system
- Early warning system untuk Guru BK

## 8. Catatan Scope: Besar, Tetapi Bisa Dibangun Bertahap

Scope di prompt sangat ambisius. Jika semua fitur dibangun sekaligus, risiko utamanya adalah produk lama selesai, kualitas tiap fitur dangkal, data tidak rapi, dan sulit diuji dengan pengguna nyata.

Keputusan produk: HighschoolHack tetap mencakup semua kelas X, XI, dan XII. Namun implementasi harus dilakukan bertahap. Artinya, public website dan data model sejak awal memperlihatkan tiga program utama, tetapi fitur interaktif lengkap dibangun per fase.

Strategi yang disarankan:

1. Bangun platform foundation untuk multi-sekolah, auth, role, data model program, dan landing page tiga program.
2. Bangun Bekal 10 sampai usable end-to-end.
3. Lanjutkan Setting Goal dengan memakai module engine yang sama.
4. Lanjutkan Smart Financial setelah struktur data, auth, dan dashboard stabil.

Fitur yang sebaiknya ditunda:

- AI chatbot
- Leaderboard
- PDF dengan QR Code
- Export Excel
- Database kota seluruh Indonesia
- Database beasiswa live dan terupdate otomatis
- Dashboard multi-sekolah yang terlalu kompleks
- Full admin panel lanjutan

Fitur yang harus ada di MVP:

- Landing page
- Tiga program utama tampil sebagai bagian dari produk
- Login siswa
- Google/Gmail OAuth
- Email/password login
- Multi-sekolah foundation
- Profil siswa
- Bekal 10 dengan 7 modul sequential
- Autosave ke database
- Progress tracker
- Portofolio siswa
- Print portfolio
- Dashboard Guru BK sederhana
- Artikel statis
- Responsive web design

## 9. MVP yang Disarankan

### Nama MVP

HighschoolHack Platform Foundation + Bekal 10

### Objective

Membuktikan bahwa HighschoolHack dapat dipakai sebagai platform multi-sekolah dan siswa kelas X bisa menyelesaikan modul pengembangan diri secara mandiri, sementara Guru BK dapat memantau progres mereka dari dashboard.

### Scope MVP

1. Public website dengan tiga program utama: Bekal 10, Setting Goal, Smart Financial.
2. Multi-sekolah foundation: school, class, student, teacher, role.
3. Login Google/Gmail OAuth.
4. Login email/password.
5. Profil siswa.
6. Bekal 10 dengan 7 modul sequential.
7. Sistem lock/unlock modul.
8. Autosave jawaban ke Heroku Postgres.
9. Progress bar dan status modul.
10. Asesmen RIASEC dan VARK berbasis referensi yang aman secara lisensi.
11. Visualisasi hasil asesmen.
12. Portofolio siswa.
13. Print portfolio dari browser.
14. Login Guru BK.
15. Dashboard Guru BK dengan tabel siswa dan detail siswa.
16. Artikel statis dari kategori yang sudah ada.
17. Halaman preview/coming soon untuk Setting Goal dan Smart Financial.

### Di luar MVP

1. Setting Goal kelas XI versi lengkap
2. Smart Financial kelas XII versi lengkap
3. Chatbot
4. Leaderboard
5. PDF server-side yang kompleks
6. QR Code
7. Export Excel
8. Data beasiswa dinamis
9. Multi-tenant school management kompleks

## 10. User Stories MVP

### Siswa

1. Sebagai siswa, saya bisa masuk menggunakan nama, kelas, dan NIS/NISN agar progres saya tersimpan.
2. Sebagai siswa, saya bisa melihat modul mana yang terbuka, sedang dikerjakan, selesai, dan terkunci.
3. Sebagai siswa, saya bisa mengisi modul pertama dan membuka modul berikutnya setelah selesai.
4. Sebagai siswa, saya bisa mengerjakan asesmen RIASEC dan VARK lalu melihat hasilnya dalam grafik.
5. Sebagai siswa, saya bisa melihat portofolio perkembangan diri dari semua jawaban saya.
6. Sebagai siswa, saya bisa mencetak portofolio untuk dikumpulkan atau didiskusikan dengan Guru BK.

### Guru BK

1. Sebagai Guru BK, saya bisa login ke dashboard guru.
2. Sebagai Guru BK, saya bisa melihat jumlah siswa dan rata-rata progres.
3. Sebagai Guru BK, saya bisa mencari dan memfilter siswa berdasarkan kelas.
4. Sebagai Guru BK, saya bisa melihat detail jawaban dan progres siswa.
5. Sebagai Guru BK, saya bisa mengidentifikasi siswa yang belum menyelesaikan modul atau memiliki tantangan adaptasi tinggi.

## 11. Acceptance Criteria MVP

### Login siswa

- Sistem mendukung login Google/Gmail.
- Sistem mendukung login email/password.
- Sistem meminta atau melengkapi profil siswa: nama lengkap, sekolah, kelas, dan NIS/NISN.
- NIS/NISN menjadi identitas siswa di dalam sekolah, tetapi akun login tetap memakai user account.
- Jika siswa yang sama login lagi, data sebelumnya tampil kembali.
- Data siswa tidak tercampur dengan siswa lain.
- Siswa dari sekolah berbeda tidak dapat melihat data satu sama lain.

### Modul sequential

- Modul 1 terbuka sejak awal.
- Modul 2 hanya terbuka setelah Modul 1 selesai.
- Pola lock/unlock berlaku sampai Modul 7.
- Modul terkunci menampilkan pesan bahwa siswa harus menyelesaikan modul sebelumnya.

### Autosave

- Jawaban tersimpan otomatis setelah siswa mengisi atau mengubah data.
- UI menampilkan status simpan, misalnya "Tersimpan otomatis".
- Jika browser ditutup dan dibuka lagi, progres masih tersedia.

### RIASEC dan VARK

- Semua item wajib dijawab sebelum hasil ditampilkan.
- Sistem menghitung skor setiap kategori.
- Sistem menampilkan tipe dominan.
- Sistem menampilkan grafik yang mudah dipahami siswa.

### Portofolio

- Portofolio mengambil data dari semua modul yang telah selesai.
- Portofolio menampilkan profil siswa, hasil asesmen, target, refleksi, dan komitmen.
- Portofolio dapat dicetak dengan layout yang rapi.

### Dashboard Guru BK

- Guru BK hanya dapat melihat data siswa.
- Guru BK tidak dapat mengubah jawaban siswa.
- Dashboard menampilkan total siswa, rata-rata progres, distribusi RIASEC, distribusi VARK, dan daftar siswa.

## 12. Rekomendasi Solusi Teknis

### Rekomendasi utama untuk production

Gunakan satu repository modern dengan frontend dan backend terpisah secara folder, bukan tiga aplikasi terpisah untuk kelas X, XI, XII. Stack yang disarankan:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Express.js
- Prisma ORM
- Heroku Postgres
- Passport.js
- Google OAuth
- Email/password credentials
- React Hook Form dan Zod untuk form validation
- Playwright untuk end-to-end testing
- Vitest untuk unit testing
- React PDF atau print CSS untuk fase PDF

### Deployment Heroku

Heroku cocok untuk aplikasi Node.js/Express selama project memiliki package.json di root, script build/start yang benar, dan konfigurasi environment melalui config vars.

Rekomendasi Heroku:

- Host aplikasi React + Express di Heroku sebagai satu app.
- Build React menjadi static assets.
- Express menjalankan API dan serve hasil build React.
- Gunakan Heroku Postgres sebagai database utama.
- Gunakan environment variables untuk semua secret.
- Jangan menyimpan file upload atau PDF permanen di filesystem Heroku karena filesystem dyno bersifat sementara.
- Generate PDF on demand atau simpan file ke object storage jika nanti dibutuhkan.

### Prototype vs production

Prompt Bekal 10 dan Setting Goal menyebut HTML, CSS, Vanilla JavaScript, satu file, localStorage. Ini bagus untuk prototype cepat atau demo offline, tetapi kurang cocok untuk produk Heroku yang dipakai banyak siswa.

Masalah localStorage untuk production:

- Data hanya tersimpan di browser siswa.
- Guru BK tidak bisa melihat data dari dashboard sungguhan.
- Data hilang jika browser dibersihkan atau perangkat berganti.
- Tidak ada backup terpusat.
- Sulit menjaga keamanan dan hak akses.

Untuk produk yang serius, gunakan database server-side.

## 13. Arsitektur yang Dipilih

### Heroku-first

Frontend dan backend:

- React/Vite sebagai frontend
- Express.js sebagai backend API
- Express serve hasil build React di Heroku

Database:

- Heroku Postgres

Auth:

- Passport.js
- Google/Gmail OAuth
- Email/password credentials

Kelebihan:

- Satu platform deployment utama.
- Cocok jika ingin fokus di Heroku.
- Database dekat dengan aplikasi.
- Lebih rapi untuk multi-sekolah dan role-based access control.

Kekurangan:

- Perlu membangun auth, RLS-like permission, dan admin tooling lebih banyak sendiri.

### Keputusan

Gunakan Heroku-first. Supabase tidak dipakai sebagai database utama agar arsitektur tidak tersebar.

## 14. Data Model Awal

Tabel inti:

- schools
- classes
- users
- accounts
- sessions
- student_profiles
- teacher_profiles
- school_memberships
- program_enrollments
- modules
- module_progress
- module_responses
- assessment_results
- portfolios
- articles
- audit_logs

Tabel lanjutan untuk Setting Goal:

- study_programs
- careers
- subject_targets
- goals
- action_plans
- reflections

Tabel lanjutan untuk Smart Financial:

- city_costs
- financial_simulations
- simulation_decisions
- scholarships
- leaderboard_entries
- early_warning_flags

## 15. Role dan Permission

### Student

- Mengisi profil sendiri
- Mengisi modul sendiri
- Melihat hasil sendiri
- Mencetak portofolio sendiri

### Teacher BK

- Melihat siswa di sekolah atau kelas yang menjadi tanggung jawabnya
- Melihat detail portofolio siswa
- Melihat statistik agregat
- Export laporan jika fitur sudah tersedia
- Tidak bisa mengubah jawaban siswa

### Admin

- Mengelola sekolah, kelas, siswa, dan guru
- Mengelola konten referensi
- Mengelola konfigurasi program

## 16. Privacy dan Keamanan

Karena produk mengelola data siswa SMA, privacy harus dianggap fitur inti.

Requirement keamanan:

- Jangan hardcode username dan password seperti bkadmin/bk123 di production.
- Password harus di-hash jika memakai email/password.
- Gunakan role-based access control.
- Data siswa harus dibatasi per sekolah.
- Guru hanya bisa melihat siswa yang relevan.
- Sediakan mekanisme export dan delete data jika diminta sekolah.
- Minimalkan data pribadi yang dikumpulkan.
- Hindari menyebut asesmen sebagai diagnosis psikologis.
- Simpan audit log untuk akses data sensitif.

## 17. Desain dan UX

Arah visual:

- Clean
- Modern
- Profesional
- Ramah Gen Z
- Banyak whitespace
- Typography Poppins atau Plus Jakarta Sans
- Warna utama putih dan navy
- Aksen ungu muda dan kuning pastel
- Ilustrasi modern, tetapi jangan sampai halaman terasa seperti poster

Prinsip UX:

- Aplikasi harus langsung berguna setelah login.
- Dashboard siswa harus memperlihatkan progres, modul berikutnya, dan hasil penting.
- Modul harus terasa ringan dan tidak seperti formulir panjang.
- Guru BK butuh tampilan data yang padat, bisa dicari, dan mudah dibandingkan.
- Mobile harus nyaman karena siswa kemungkinan sering memakai HP.

## 18. Roadmap

### Phase 0: Product and Technical Foundation

Target:

- Menyiapkan fondasi produk multi-sekolah, auth, database, dan desain sistem sebelum modul besar dibangun.

Deliverables:

- Finalisasi PRD
- Technical architecture
- Database schema awal
- Setup React/Vite
- Setup Express.js
- Setup Heroku deploy
- Setup Heroku Postgres
- Setup Passport.js Google OAuth dan email/password
- Setup role: student, teacher_bk, school_admin, super_admin
- Landing page tiga program

### Phase 1: Bekal 10 End-to-End

Target:

- Validasi produk dengan siswa kelas X dan Guru BK, di atas fondasi multi-sekolah.

Deliverables:

- Public website
- Student login
- Bekal 10 lengkap
- RIASEC/VARK
- Portfolio print
- Guru BK dashboard basic
- Preview page untuk Setting Goal dan Smart Financial

### Phase 2: Setting Goal

Target:

- Menambahkan perjalanan kelas XI.

Deliverables:

- Program studi database
- Karier database
- SMART goals
- Action calendar
- Refleksi berkala
- Dashboard Guru BK untuk Setting Goal

### Phase 3: Smart Financial

Target:

- Menambahkan kesiapan kelas XII.

Deliverables:

- Simulasi finansial
- City cost database versi awal
- Financial readiness score
- Scholarship page
- Dashboard sekolah
- Early warning system

### Phase 4: Intelligence and Scale

Target:

- Membuat produk lebih personal dan scalable.

Deliverables:

- Chatbot BK
- Rekomendasi personal yang lebih baik
- Export PDF dan Excel
- Multi-school admin
- Analytics lanjutan
- Integrasi SSO atau Google login

## 19. Metrik Sukses

MVP:

- Persentase siswa yang menyelesaikan Modul 1
- Persentase siswa yang menyelesaikan semua 7 modul
- Rata-rata waktu penyelesaian program
- Jumlah portofolio yang dicetak
- Jumlah siswa yang dilihat detailnya oleh Guru BK
- Feedback siswa tentang kemudahan penggunaan
- Feedback Guru BK tentang kegunaan dashboard

Produk lanjutan:

- Retention siswa per minggu
- Completion rate per kelas
- Jumlah sekolah aktif
- Jumlah Guru BK aktif
- Jumlah rekomendasi atau intervensi yang ditindaklanjuti
- Completion rate simulasi finansial

## 20. Risiko Produk

1. Scope terlalu besar jika semua fitur langsung dibangun.
2. Konten asesmen butuh validasi dan sumber yang jelas.
3. Data beasiswa dan biaya hidup cepat berubah.
4. Dashboard Guru BK bisa menjadi kompleks jika multi-sekolah tidak dirancang sejak awal.
5. Privacy siswa bisa menjadi risiko serius jika role dan permission tidak ketat.
6. Produk bisa terasa seperti form panjang jika UX modul tidak dibuat ringan.
7. Chatbot bisa memberi jawaban kurang tepat jika tidak dibatasi.

## 21. Keputusan Produk yang Saya Rekomendasikan

1. Jadikan HighschoolHack sebagai platform utama untuk semua kelas X, XI, XII.
2. Jangan gunakan localStorage untuk produk Heroku production.
3. Gunakan database server-side sejak awal.
4. Jangan buat tiga codebase terpisah untuk kelas X, XI, XII.
5. Bangun modul engine yang bisa dipakai ulang untuk semua program.
6. Gunakan print-friendly portfolio dulu sebelum membuat PDF server-side.
7. Buat dashboard Guru BK sederhana tetapi benar-benar berguna.
8. Tunda chatbot sampai data dan alur utama stabil.
9. Tunda leaderboard karena bisa mendorong kompetisi yang kurang sehat untuk konteks BK, kecuali hanya dipakai di Smart Financial sebagai gamification opsional.
10. Bangun UI/route untuk tiga program sejak awal, tetapi implementasi modul lengkap tetap per fase.

## 22. Pertanyaan yang Masih Perlu Dijawab

1. Apakah setiap sekolah akan dibuat oleh super admin, atau sekolah bisa registrasi sendiri?
2. Apakah siswa harus masuk memakai domain Google sekolah, atau boleh Gmail pribadi?
3. Apakah Guru BK perlu approval/manual invite untuk siswa, atau siswa boleh join memakai kode sekolah?
4. Untuk MVP, apakah Guru BK cukup melihat dashboard dan print portfolio, atau wajib export PDF/Excel?
5. Apakah artikel akan berupa link kurasi saja, atau ingin CMS untuk menulis artikel sendiri?

## 23. Referensi Teknis dan Asesmen

- Heroku Node.js deployment: https://devcenter.heroku.com/articles/deploying-nodejs
- Heroku Node.js support reference: https://devcenter.heroku.com/articles/nodejs-support
- Heroku config vars: https://devcenter.heroku.com/articles/config-vars
- Heroku Postgres: https://devcenter.heroku.com/articles/heroku-postgresql
- Vite production build: https://vite.dev/guide/build
- Express production best practices: https://expressjs.com/en/advanced/best-practice-performance.html
- Passport Google OAuth 2.0 strategy: https://www.passportjs.org/packages/passport-google-oauth20/
- O*NET Interest Profiler: https://www.onetcenter.org/IP.html
- O*NET Interest Profiler Manual: https://www.onetcenter.org/reports/IP_Manual.html
- VARK official questionnaire: https://vark-learn.com/the-vark-questionnaire/
- VARK modalities: https://vark-learn.com/introduction-to-vark/the-vark-modalities/
- VARK copyright information: https://vark-learn.com/copyright-information/

Catatan asesmen:

- RIASEC dapat memakai O*NET Interest Profiler sebagai referensi utama untuk struktur Realistic, Investigative, Artistic, Social, Enterprising, Conventional.
- VARK dapat dipakai sebagai referensi konsep Visual, Aural, Read/write, Kinesthetic, tetapi item resmi VARK tidak boleh disalin tanpa izin karena VARK dilindungi copyright/trademark.
- Untuk MVP, buat item asesmen original berbahasa Indonesia yang terinspirasi dari konsep RIASEC/VARK, lalu tampilkan disclaimer bahwa hasil adalah eksplorasi diri, bukan diagnosis psikologis.
