import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import API from '../../api/axios';

export default function TutorMarks() {
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('Mid Term');
  const [students, setStudents] = useState([]);
  const [existingMarks, setExistingMarks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    API.get('/auth/me').then(({ data }) => {
      if (data.profile?.subject) setSubject(data.profile.subject);
    });
  }, []);

  async function loadStudents(e) {
    e.preventDefault();
    const [studentsRes, marksRes] = await Promise.all([
      API.get('/students'),
      API.get(`/marks?subject=${encodeURIComponent(subject)}`)
    ]);
    const filtered = marksRes.data.filter((m) => m.examType === examType);
    const initInputs = {};
    studentsRes.data.forEach((s) => {
      const existing = filtered.find((m) => m.studentId === s.id);
      initInputs[s.id] = { obtained: existing ? existing.marksObtained : '', total: existing ? existing.totalMarks : 100 };
    });
    setStudents(studentsRes.data);
    setExistingMarks(filtered);
    setInputs(initInputs);
    setLoaded(true);
  }

  async function saveRow(studentId) {
    const { obtained, total } = inputs[studentId];
    if (obtained === '' || total === '') { alert('Enter both marks obtained and total marks.'); return; }
    try {
      await API.post('/marks', { studentId, subject, examType, marksObtained: Number(obtained), totalMarks: Number(total) });
      alert('Saved ✓');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save.');
    }
  }

  return (
    <div className="app">
      <Sidebar role="tutor" />
      <main className="content">
        <div className="topbar">
          <h1>Marks Entry</h1>
          <p className="muted">Enter exam marks for your students.</p>
        </div>

        <div className="card">
          <form onSubmit={loadStudents} className="inline-form">
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required />
            <select value={examType} onChange={(e) => setExamType(e.target.value)}>
              {['Mid Term', 'Final', 'Assignment', 'Quiz'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <button type="submit" className="btn btn-primary">Load Students</button>
          </form>
        </div>

        {loaded && (
          <div className="card">
            <h3>{subject} · {examType} · {students.length} students</h3>
            {students.map((s) => (
              <div key={s.id} className="marks-row">
                <div>{s.name} <span className="roster-meta">{s.rollNo}</span></div>
                <input type="number" min="0" value={inputs[s.id]?.obtained}
                  onChange={(e) => setInputs({ ...inputs, [s.id]: { ...inputs[s.id], obtained: e.target.value } })}
                  placeholder="Obtained" />
                <input type="number" min="1" value={inputs[s.id]?.total}
                  onChange={(e) => setInputs({ ...inputs, [s.id]: { ...inputs[s.id], total: e.target.value } })}
                  placeholder="Total" />
                <button className="btn btn-ghost" style={{ padding: '6px 10px' }} onClick={() => saveRow(s.id)}>Save</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}