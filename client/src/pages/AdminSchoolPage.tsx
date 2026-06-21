import { CheckCircle2, GraduationCap, LoaderCircle, Pencil, Plus, Save, School, Search, ShieldCheck, Trash2, UserRoundCog, UsersRound, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AdminAppLayout } from '../components/AdminAppLayout';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { AdminAuditLog, AdminClass, AdminOverview, AdminSchoolCleanupOption, AdminStudent, AdminTeacher } from '../types/admin';

type SectionName = 'overview' | 'classes' | 'students' | 'teachers' | 'school';

function Notice({ error, success }: { error: string; success: string }) {
  if (!error && !success) return null;
  return <p className={`mb-5 rounded-lg border p-3 text-sm ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error || success}</p>;
}

function Empty({ text }: { text: string }) {
  return <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">{text}</div>;
}

function ClassesSection({ onNotice }: { onNotice: (error: string, success?: string) => void }) {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(10);
  const [sourceClassId, setSourceClassId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');

  const load = useCallback(() => api<{ classes: AdminClass[] }>('/api/admin/classes').then((response) => setClasses(response.classes)).catch((error: Error) => onNotice(error.message)), [onNotice]);
  useEffect(() => { void load(); }, [load]);

  async function addClass(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/api/admin/classes', { method: 'POST', body: JSON.stringify({ name, grade }) });
      setName('');
      onNotice('', 'Kelas berhasil ditambahkan.');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal menambah kelas.'); }
  }

  async function updateClass(schoolClass: AdminClass) {
    try {
      await api(`/api/admin/classes/${schoolClass.id}`, { method: 'PATCH', body: JSON.stringify({ name: schoolClass.name, grade: schoolClass.grade }) });
      onNotice('', 'Perubahan kelas tersimpan.');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal memperbarui kelas.'); }
  }

  async function deleteClass(schoolClass: AdminClass) {
    if (!window.confirm(`Hapus kelas ${schoolClass.name}?`)) return;
    try {
      await api(`/api/admin/classes/${schoolClass.id}`, { method: 'DELETE' });
      onNotice('', 'Kelas berhasil dihapus.');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal menghapus kelas.'); }
  }

  async function mergeClass(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/api/admin/classes/merge', { method: 'POST', body: JSON.stringify({ sourceClassId, targetClassId }) });
      setSourceClassId('');
      setTargetClassId('');
      onNotice('', 'Kelas duplikat berhasil digabungkan.');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal menggabungkan kelas.'); }
  }

  return <div className="grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
    <div className="space-y-5"><form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={addClass}><h2 className="font-semibold text-[#101b3f]">Tambah kelas</h2><p className="mt-1 text-xs leading-5 text-slate-500">Kelas baru langsung tersedia pada onboarding siswa.</p><label className="mt-5 block text-sm font-semibold text-slate-700">Nama kelas<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setName(event.target.value)} placeholder="Contoh: X-2" required value={name} /></label><label className="mt-4 block text-sm font-semibold text-slate-700">Tingkat<select className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setGrade(Number(event.target.value))} value={grade}><option value={10}>Kelas X</option><option value={11}>Kelas XI</option><option value={12}>Kelas XII</option></select></label><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" type="submit"><Plus className="size-4" />Tambah kelas</button></form><form className="h-fit rounded-lg border border-amber-200 bg-amber-50 p-5" onSubmit={mergeClass}><h2 className="font-semibold text-amber-950">Gabungkan kelas duplikat</h2><p className="mt-1 text-xs leading-5 text-amber-800">Siswa dari kelas asal akan dipindahkan ke kelas tujuan, lalu kelas asal dihapus.</p><label className="mt-5 block text-sm font-semibold text-amber-950">Kelas asal<select className="mt-2 h-11 w-full rounded-lg border border-amber-200 bg-white px-3 font-normal outline-none focus:border-amber-500" onChange={(event) => setSourceClassId(event.target.value)} required value={sourceClassId}><option value="">Pilih kelas asal</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.studentCount} siswa)</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-amber-950">Kelas tujuan<select className="mt-2 h-11 w-full rounded-lg border border-amber-200 bg-white px-3 font-normal outline-none focus:border-amber-500" onChange={(event) => setTargetClassId(event.target.value)} required value={targetClassId}><option value="">Pilih kelas tujuan</option>{classes.filter((item) => item.id !== sourceClassId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={classes.length < 2} type="submit"><CheckCircle2 className="size-4" />Gabungkan kelas</button></form></div>
    <section className="rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-[#101b3f]">Daftar kelas</h2><p className="mt-1 text-xs text-slate-500">{classes.length} kelas aktif</p></div>{classes.length ? <div className="divide-y divide-slate-200">{classes.map((schoolClass) => <div className="grid gap-3 p-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end" key={schoolClass.id}><label className="text-xs font-semibold text-slate-500">Nama<input className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal outline-none focus:border-violet-500" onChange={(event) => setClasses((current) => current.map((item) => item.id === schoolClass.id ? { ...item, name: event.target.value } : item))} value={schoolClass.name} /></label><label className="text-xs font-semibold text-slate-500">Tingkat<select className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal" onChange={(event) => setClasses((current) => current.map((item) => item.id === schoolClass.id ? { ...item, grade: Number(event.target.value) } : item))} value={schoolClass.grade}><option value={10}>X</option><option value={11}>XI</option><option value={12}>XII</option></select></label><div className="flex items-center justify-between gap-2 sm:justify-end"><span className="mr-auto text-xs text-slate-400 sm:mr-2">{schoolClass.studentCount} siswa</span><button className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600" onClick={() => updateClass(schoolClass)} title="Simpan kelas" type="button"><Save className="size-4" /></button><button className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 disabled:opacity-40" disabled={schoolClass.studentCount > 0} onClick={() => deleteClass(schoolClass)} title={schoolClass.studentCount ? 'Kelas masih memiliki siswa' : 'Hapus kelas'} type="button"><Trash2 className="size-4" /></button></div></div>)}</div> : <Empty text="Belum ada kelas." />}</section>
  </div>;
}

function StudentsSection({ onNotice }: { onNotice: (error: string, success?: string) => void }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.memberships.some((membership) => membership.role === 'super_admin') ?? false;
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [selected, setSelected] = useState<AdminStudent | null>(null);
  const [schools, setSchools] = useState<AdminSchoolCleanupOption[]>([]);
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [targetClassName, setTargetClassName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (classId) params.set('classId', classId);
      const [overviewResponse, studentsResponse] = await Promise.all([api<AdminOverview>('/api/admin/overview'), api<{ students: AdminStudent[] }>(`/api/admin/students?${params}`)]);
      setOverview(overviewResponse);
      setStudents(studentsResponse.students);
      if (isSuperAdmin) {
        const schoolResponse = await api<{ schools: AdminSchoolCleanupOption[] }>('/api/admin/cleanup/schools');
        setSchools(schoolResponse.schools);
      }
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal memuat siswa.'); }
  }, [classId, isSuperAdmin, onNotice, search]);
  useEffect(() => { void load(); }, [load]);

  async function saveStudent(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    try {
      await api(`/api/admin/students/${selected.userId}`, { method: 'PATCH', body: JSON.stringify({ fullName: selected.fullName, nisn: selected.nisn, classId: selected.classId }) });
      onNotice('', 'Profil siswa berhasil diperbarui.');
      setSelected(null);
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal memperbarui siswa.'); }
  }

  async function importStudents(event: FormEvent) {
    event.preventDefault();
    const rows = bulkText.split(/\r?\n/).map((row) => row.trim()).filter(Boolean).map((row) => {
      const [email, fullName, className, nisn] = row.split(',').map((cell) => cell.trim());
      return { email, fullName, className, nisn: nisn || undefined };
    });
    try {
      const response = await api<{ imported: Array<{ email: string }>; errors: Array<{ email: string; message: string }> }>('/api/admin/students/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ students: rows }),
      });
      setBulkText('');
      onNotice(response.errors.length ? `${response.imported.length} siswa masuk, ${response.errors.length} gagal.` : '', `${response.imported.length} siswa berhasil diimport.`);
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal import siswa.'); }
  }

  async function moveStudent(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    try {
      await api(`/api/admin/students/${selected.userId}/move-school`, {
        method: 'PATCH',
        body: JSON.stringify({ targetSchoolId, targetClassName: targetClassName || undefined }),
      });
      onNotice('', 'Siswa berhasil dipindahkan ke sekolah tujuan.');
      setSelected(null);
      setTargetSchoolId('');
      setTargetClassName('');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal memindahkan siswa.'); }
  }

  return <div className="grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input aria-label="Cari siswa" className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-violet-500" onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, atau NISN" value={search} /></div><select aria-label="Filter kelas" className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm" onChange={(event) => setClassId(event.target.value)} value={classId}><option value="">Semua kelas</option>{overview?.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Kelas</th><th className="px-5 py-3">NISN</th><th className="px-5 py-3"><span className="sr-only">Edit</span></th></tr></thead><tbody className="divide-y divide-slate-200">{students.map((student) => <tr key={student.userId}><td className="px-5 py-4 font-semibold text-[#101b3f]">{student.fullName}</td><td className="px-5 py-4 text-slate-500">{student.email}</td><td className="px-5 py-4 text-slate-500">{student.className ?? '-'}</td><td className="px-5 py-4 text-slate-500">{student.nisn ?? '-'}</td><td className="px-5 py-4"><button className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-500" onClick={() => setSelected({ ...student })} title={`Edit ${student.fullName}`} type="button"><Pencil className="size-4" /></button></td></tr>)}</tbody></table></div>{!students.length && <Empty text="Tidak ada siswa sesuai pencarian." />}</section>
    <aside className="relative isolate flex flex-col gap-5"><section className={`${selected ? 'order-1' : 'order-2'} h-fit rounded-lg border border-slate-200 bg-white p-5 xl:order-1`}>{selected ? <><form onSubmit={saveStudent}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-[#101b3f]">Edit profil siswa</h2><p className="mt-1 text-xs text-slate-500">{selected.email}</p></div><button className="grid size-8 place-items-center text-slate-400" onClick={() => setSelected(null)} title="Tutup" type="button"><X className="size-4" /></button></div><label className="mt-5 block text-sm font-semibold text-slate-700">Nama lengkap<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setSelected({ ...selected, fullName: event.target.value })} required value={selected.fullName} /></label><label className="mt-4 block text-sm font-semibold text-slate-700">NISN<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setSelected({ ...selected, nisn: event.target.value || null })} value={selected.nisn ?? ''} /></label><label className="mt-4 block text-sm font-semibold text-slate-700">Kelas siswa<select aria-label="Kelas siswa" className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" onChange={(event) => setSelected({ ...selected, classId: event.target.value || null })} value={selected.classId ?? ''}><option value="">Tanpa kelas</option>{overview?.classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" type="submit"><Save className="size-4" />Simpan perubahan</button></form>{isSuperAdmin && <form className="mt-6 border-t border-slate-200 pt-5" onSubmit={moveStudent}><h3 className="font-semibold text-[#101b3f]">Pindah sekolah</h3><label className="mt-4 block text-sm font-semibold text-slate-700">Sekolah tujuan<select className="mt-2 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal" onChange={(event) => setTargetSchoolId(event.target.value)} required value={targetSchoolId}><option value="">Pilih sekolah</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-slate-700">Kelas tujuan<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal" onChange={(event) => setTargetClassName(event.target.value)} placeholder="Contoh: X-1" value={targetClassName} /></label><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white" type="submit">Pindahkan siswa</button></form>}</> : <div className="py-8 text-center"><UserRoundCog className="mx-auto size-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">Pilih siswa untuk diedit</p><p className="mt-1 text-xs leading-5 text-slate-400">Admin dapat memperbarui nama profil, NISN, dan kelas tanpa mengubah jawaban modul.</p></div>}</section><form className={`${selected ? 'order-2' : 'order-1'} relative z-10 rounded-lg border border-slate-200 bg-white p-5 xl:order-2`} onSubmit={importStudents}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-[#101b3f]">Bulk import siswa</h2><p className="mt-1 text-xs leading-5 text-slate-500">Format per baris: email,nama,kelas,nisn. Siswa dapat membuat password pertama lewat menu lupa password atau login Google dengan email yang sama.</p></div><button className="relative z-20 inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={!bulkText.trim()} type="submit"><Plus className="size-4" />Import siswa</button></div><textarea className="mt-4 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm leading-6 outline-none focus:border-violet-500" onChange={(event) => setBulkText(event.target.value)} placeholder="siswa@example.com,Nadia Putri,X-1,0012345678" value={bulkText} /></form></aside>
  </div>;
}

function TeachersSection({ onNotice }: { onNotice: (error: string, success?: string) => void }) {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const load = useCallback(() => api<{ teachers: AdminTeacher[] }>('/api/admin/teachers').then((response) => setTeachers(response.teachers)).catch((error: Error) => onNotice(error.message)), [onNotice]);
  useEffect(() => { void load(); }, [load]);

  async function assign(event: FormEvent) {
    event.preventDefault();
    try {
      await api('/api/admin/teachers', { method: 'POST', body: JSON.stringify({ email, fullName }) });
      setEmail(''); setFullName('');
      onNotice('', 'Akun berhasil ditetapkan sebagai Guru BK.');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal menetapkan Guru BK.'); }
  }

  async function remove(teacher: AdminTeacher) {
    if (!window.confirm(`Cabut akses Guru BK untuk ${teacher.fullName}?`)) return;
    try {
      await api(`/api/admin/teachers/${teacher.userId}`, { method: 'DELETE' });
      onNotice('', 'Akses Guru BK berhasil dicabut.');
      await load();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal mencabut akses.'); }
  }

  return <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]"><form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={assign}><h2 className="font-semibold text-[#101b3f]">Tetapkan Guru BK</h2><p className="mt-1 text-xs leading-5 text-slate-500">Guru harus register atau login Google sekali sebelum dapat ditetapkan.</p><label className="mt-5 block text-sm font-semibold text-slate-700">Email akun<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label><label className="mt-4 block text-sm font-semibold text-slate-700">Nama lengkap<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setFullName(event.target.value)} required value={fullName} /></label><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" type="submit"><ShieldCheck className="size-4" />Tetapkan Guru BK</button></form><section className="rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-[#101b3f]">Akun Guru BK</h2><p className="mt-1 text-xs text-slate-500">{teachers.length} akun aktif</p></div>{teachers.length ? <div className="divide-y divide-slate-200">{teachers.map((teacher) => <div className="flex flex-wrap items-center justify-between gap-4 p-5" key={teacher.userId}><div><p className="font-semibold text-[#101b3f]">{teacher.fullName}</p><p className="mt-1 text-sm text-slate-500">{teacher.email}</p></div><button className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600" onClick={() => remove(teacher)} type="button"><Trash2 className="size-3.5" />Cabut akses</button></div>)}</div> : <Empty text="Belum ada Guru BK." />}</section></div>;
}

function SchoolSection({ onNotice }: { onNotice: (error: string, success?: string) => void }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.memberships.some((membership) => membership.role === 'super_admin') ?? false;
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [name, setName] = useState('');
  const [schools, setSchools] = useState<AdminSchoolCleanupOption[]>([]);
  const [sourceSchoolId, setSourceSchoolId] = useState('');
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const load = useCallback(() => api<AdminOverview>('/api/admin/overview').then((response) => { setOverview(response); setName(response.school.name); }).catch((error: Error) => onNotice(error.message)), [onNotice]);
  useEffect(() => { void load(); }, [load]);
  const loadSchools = useCallback(() => {
    if (!isSuperAdmin) return;
    api<{ schools: AdminSchoolCleanupOption[] }>('/api/admin/cleanup/schools').then((response) => setSchools(response.schools)).catch((error: Error) => onNotice(error.message));
  }, [isSuperAdmin, onNotice]);
  useEffect(() => { loadSchools(); }, [loadSchools]);

  async function save(event: FormEvent) {
    event.preventDefault();
    try { await api('/api/admin/school', { method: 'PATCH', body: JSON.stringify({ name }) }); onNotice('', 'Nama sekolah berhasil diperbarui.'); await load(); } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal memperbarui sekolah.'); }
  }

  async function mergeSchool(event: FormEvent) {
    event.preventDefault();
    if (!window.confirm('Gabungkan sekolah asal ke sekolah tujuan? Operasi ini akan memindahkan siswa, kelas, membership, dan enrollment jika tidak ada konflik.')) return;
    try {
      await api('/api/admin/cleanup/schools/merge', { method: 'POST', body: JSON.stringify({ sourceSchoolId, targetSchoolId }) });
      setSourceSchoolId('');
      setTargetSchoolId('');
      onNotice('', 'Sekolah duplikat berhasil digabungkan.');
      await load();
      loadSchools();
    } catch (error) { onNotice(error instanceof Error ? error.message : 'Gagal menggabungkan sekolah.'); }
  }

  return <div className="grid gap-6 lg:grid-cols-2"><form className="h-fit rounded-lg border border-slate-200 bg-white p-5" onSubmit={save}><h2 className="font-semibold text-[#101b3f]">Profil sekolah</h2><label className="mt-5 block text-sm font-semibold text-slate-700">Nama sekolah<input className="mt-2 h-11 w-full rounded-lg border border-slate-300 px-3 font-normal outline-none focus:border-violet-500" onChange={(event) => setName(event.target.value)} required value={name} /></label><label className="mt-4 block text-sm font-semibold text-slate-700">Slug<input className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 font-normal text-slate-400" disabled value={overview?.school.slug ?? ''} /></label><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#101b3f] px-4 text-sm font-semibold text-white" type="submit"><Save className="size-4" />Simpan profil</button></form><section className="h-fit rounded-lg border border-slate-200 bg-white p-5"><School className="size-5 text-violet-700" /><h2 className="mt-4 font-semibold text-[#101b3f]">Onboarding siswa</h2><p className="mt-2 text-sm leading-6 text-slate-500">Siswa mengisi nama sekolah dan kelas secara manual saat onboarding. Jika sekolah atau kelas belum ada, sistem akan membuatnya otomatis.</p><div className="mt-5 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-950"><p className="font-semibold">Yang perlu dijaga admin</p><ul className="mt-2 list-disc space-y-1 pl-5 text-violet-800"><li>Gunakan nama resmi sekolah pada onboarding siswa.</li><li>Kelas duplikat dapat digabungkan dari menu Manajemen kelas.</li><li>Profil siswa yang salah kelas dapat dirapikan dari menu Manajemen siswa.</li></ul></div></section>{isSuperAdmin && <form className="h-fit rounded-lg border border-amber-200 bg-amber-50 p-5 lg:col-span-2" onSubmit={mergeSchool}><h2 className="font-semibold text-amber-950">Cleanup sekolah duplikat</h2><p className="mt-1 text-sm leading-6 text-amber-800">Khusus super admin. Sistem akan menolak merge jika ada konflik profil siswa, NISN, atau enrollment program di sekolah tujuan.</p><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="block text-sm font-semibold text-amber-950">Sekolah asal<select className="mt-2 h-11 w-full rounded-lg border border-amber-200 bg-white px-3 font-normal outline-none focus:border-amber-500" onChange={(event) => setSourceSchoolId(event.target.value)} required value={sourceSchoolId}><option value="">Pilih sekolah asal</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name} ({school.studentCount} siswa, {school.classCount} kelas)</option>)}</select></label><label className="block text-sm font-semibold text-amber-950">Sekolah tujuan<select className="mt-2 h-11 w-full rounded-lg border border-amber-200 bg-white px-3 font-normal outline-none focus:border-amber-500" onChange={(event) => setTargetSchoolId(event.target.value)} required value={targetSchoolId}><option value="">Pilih sekolah tujuan</option>{schools.filter((school) => school.id !== sourceSchoolId).map((school) => <option key={school.id} value={school.id}>{school.name} ({school.studentCount} siswa)</option>)}</select></label></div><button className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white disabled:opacity-50" disabled={schools.length < 2} type="submit"><CheckCircle2 className="size-4" />Gabungkan sekolah</button></form>}</div>;
}

function OverviewSection({ overview }: { overview: AdminOverview | null }) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  useEffect(() => {
    api<{ logs: AdminAuditLog[] }>('/api/admin/audit-logs').then((response) => setLogs(response.logs)).catch(() => undefined);
  }, []);
  const metrics = [
    { icon: GraduationCap, label: 'Kelas aktif', value: overview?.metrics.totalClasses ?? 0, tone: 'bg-blue-50 text-blue-700' },
    { icon: UsersRound, label: 'Total siswa', value: overview?.metrics.totalStudents ?? 0, tone: 'bg-violet-50 text-violet-700' },
    { icon: ShieldCheck, label: 'Guru BK', value: overview?.metrics.totalTeachers ?? 0, tone: 'bg-emerald-50 text-emerald-700' },
    { icon: CheckCircle2, label: 'Siswa selesaikan Bekal 10', value: overview?.metrics.completedStudents ?? 0, tone: 'bg-amber-50 text-amber-700' },
  ];
  return <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ icon: Icon, label, tone, value }) => <article className="rounded-lg border border-slate-200 bg-white p-5" key={label}><span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon className="size-4" /></span><p className="mt-4 text-2xl font-semibold text-[#101b3f]">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></article>)}</section><section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><div className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-[#101b3f]">Aksi administrasi</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><Link className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:border-violet-300" to="/admin/classes">Kelola kelas<p className="mt-1 text-xs font-normal text-slate-400">Tambah, ubah, dan rapikan kelas.</p></Link><Link className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:border-violet-300" to="/admin/students">Kelola siswa<p className="mt-1 text-xs font-normal text-slate-400">Perbarui profil, NISN, dan kelas.</p></Link><Link className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:border-violet-300" to="/admin/teachers">Kelola Guru BK<p className="mt-1 text-xs font-normal text-slate-400">Tetapkan akun Guru BK.</p></Link><Link className="rounded-lg border border-slate-200 p-4 text-sm font-semibold text-slate-700 hover:border-violet-300" to="/admin/school">Pengaturan sekolah<p className="mt-1 text-xs font-normal text-slate-400">Profil dan alur onboarding.</p></Link></div></div><div className="rounded-lg bg-[#101b3f] p-5 text-white"><School className="size-5 text-[#ffe08a]" /><h2 className="mt-4 font-semibold">Onboarding manual</h2><p className="mt-3 text-sm leading-6 text-white/70">Siswa mengetik nama sekolah dan kelas. Data baru akan masuk otomatis untuk dirapikan admin jika diperlukan.</p><Link className="mt-5 inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#101b3f]" to="/admin/classes">Kelola kelas</Link></div></section><section className="mt-6 rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-[#101b3f]">Audit log terbaru</h2><div className="mt-4 space-y-3">{logs.length ? logs.slice(0, 8).map((log) => <article className="flex flex-col gap-1 rounded-lg border border-slate-200 p-3 text-sm sm:flex-row sm:items-center sm:justify-between" key={log.id}><div><p className="font-semibold text-slate-700">{log.action}</p><p className="text-xs text-slate-400">{log.entityType} oleh {log.actorName}</p></div><span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString('id-ID')}</span></article>) : <p className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400">Belum ada audit log.</p>}</div></section></>;
}

export function AdminSchoolPage({ section }: { section: SectionName }) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(section === 'overview');

  const notice = useCallback((nextError: string, nextSuccess = '') => { setError(nextError); setSuccess(nextSuccess); }, []);
  useEffect(() => {
    if (section !== 'overview') return;
    setLoading(true);
    api<AdminOverview>('/api/admin/overview').then(setOverview).catch((requestError: Error) => setError(requestError.message)).finally(() => setLoading(false));
  }, [section]);

  const titles: Record<SectionName, string> = { overview: 'Ringkasan sekolah', classes: 'Manajemen kelas', students: 'Manajemen siswa', teachers: 'Manajemen Guru BK', school: 'Pengaturan sekolah' };
  return <AdminAppLayout title={titles[section]}><div className="mx-auto max-w-7xl px-5 py-7 lg:px-7"><div className="mb-6"><p className="text-sm font-semibold text-violet-700">Admin Sekolah</p><h1 className="mt-1 text-2xl font-semibold text-[#101b3f]">{titles[section]}</h1>{section === 'overview' && <p className="mt-2 text-sm text-slate-500">{overview?.school.name ?? 'Memuat sekolah...'}</p>}</div><Notice error={error} success={success} />{loading ? <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-7 animate-spin text-violet-600" /></div> : <>{section === 'overview' && <OverviewSection overview={overview} />}{section === 'classes' && <ClassesSection onNotice={notice} />}{section === 'students' && <StudentsSection onNotice={notice} />}{section === 'teachers' && <TeachersSection onNotice={notice} />}{section === 'school' && <SchoolSection onNotice={notice} />}</>}</div></AdminAppLayout>;
}
