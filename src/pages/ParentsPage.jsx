import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import SignInModal from '../components/SignInModal';
import { addStudent, fetchMyStudents, fetchAllStudents, removeStudent } from '../userData';

const ADMIN_EMAILS = ['fathiyayoosef@gmail.com'];

const GRADES = [
  'Pre-Kindergarten', 'Kindergarten',
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade',
  '9th Grade', '10th Grade', '11th Grade', '12th Grade',
];

const EMPTY_FORM = { name: '', grade: GRADES[0], className: '', school: '', parentEmail: '', notes: '' };

function StudentCard({ student, isAdmin, onRemove }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold shrink-0">
        {student.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-gray-800 text-lg">{student.name}</p>
        <p className="text-emerald-700 text-sm font-medium">{student.grade}</p>
        {student.className && <p className="text-gray-500 text-sm">Class: {student.className}</p>}
        {student.school && <p className="text-gray-500 text-sm">{student.school}</p>}
        {student.notes && <p className="text-gray-400 text-xs mt-1 italic">{student.notes}</p>}
        {isAdmin && (
          <p className="text-xs text-gray-400 mt-2">Parent: {student.parentEmail}</p>
        )}
      </div>
      {isAdmin && (
        <button
          onClick={() => onRemove(student.id)}
          className="text-xs text-red-400 hover:text-red-600 shrink-0"
          title="Remove student"
        >
          Remove
        </button>
      )}
    </div>
  );
}

export default function ParentsPage() {
  const { user } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email || '').toLowerCase());

  useEffect(() => {
    if (!user) {
      setStudents([]);
      return;
    }
    setLoading(true);
    setError(null);
    const load = isAdmin ? fetchAllStudents() : fetchMyStudents(user.email);
    load
      .then(setStudents)
      .catch(() => setError('Could not load student information.'))
      .finally(() => setLoading(false));
  }, [user, isAdmin]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.parentEmail.trim()) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await addStudent(form);
      setForm(EMPTY_FORM);
      setSaved(true);
      setStudents(await fetchAllStudents());
    } catch {
      setError('Could not save the student. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id) {
    await removeStudent(id);
    setStudents((s) => s.filter((x) => x.id !== id));
  }

  return (
    <section className="scroll-mt-20 bg-emerald-50 min-h-screen py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">👨‍👩‍👧‍👦 Parents Portal</h2>
      <p className="text-gray-500 mt-2 max-w-xl mx-auto">
        Invited parents sign in with their email to see their children's information
      </p>

      {!user ? (
        <div className="mt-10">
          <p className="text-gray-600 mb-4">Sign in with the email you were invited with</p>
          <button
            onClick={() => setShowSignIn(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold"
          >
            Sign In
          </button>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl mx-auto">
          {error && <p className="text-amber-600 text-sm mb-4">{error}</p>}
          {loading && <p className="text-gray-400 text-sm">Loading students...</p>}

          {!loading && (
            <>
              <h3 className="text-left text-lg font-bold text-gray-700 mb-3">
                {isAdmin ? 'All Students' : 'My Students'}
              </h3>
              {students.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-gray-400 text-sm">
                  {isAdmin
                    ? 'No students yet — add the first one below.'
                    : `No students are linked to ${user.email} yet. Ask the school to invite this email.`}
                </div>
              ) : (
                <div className="space-y-4">
                  {students.map((s) => (
                    <StudentCard key={s.id} student={s} isAdmin={isAdmin} onRemove={handleRemove} />
                  ))}
                </div>
              )}
            </>
          )}

          {isAdmin && (
            <form
              onSubmit={handleAddStudent}
              className="mt-10 bg-white border border-gray-100 rounded-2xl p-6 text-left space-y-3 shadow-sm"
            >
              <h3 className="text-lg font-bold text-gray-700">➕ Add a Student (invite a parent)</h3>
              <input
                type="text"
                required
                placeholder="Student full name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={form.grade}
                  onChange={(e) => setField('grade', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Class / teacher (optional)"
                  value={form.className}
                  onChange={(e) => setField('className', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
                />
              </div>
              <input
                type="text"
                placeholder="School name (optional)"
                value={form.school}
                onChange={(e) => setField('school', e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
              />
              <input
                type="email"
                required
                placeholder="Parent email (this is the invitation)"
                value={form.parentEmail}
                onChange={(e) => setField('parentEmail', e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-200 text-sm outline-none focus:border-emerald-400"
              />
              <textarea
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-2xl border border-gray-200 text-sm outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-2.5 rounded-full text-sm font-semibold"
              >
                {saving ? 'Saving...' : 'Add Student & Invite Parent'}
              </button>
              {saved && <p className="text-emerald-600 text-sm text-center">Student added! The parent can now sign in with that email.</p>}
            </form>
          )}
        </div>
      )}

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </section>
  );
}
