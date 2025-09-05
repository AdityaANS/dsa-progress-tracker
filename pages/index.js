import React, { useEffect, useMemo, useState } from 'react';
import {
  googleLogin,
  logout,
  onUser,
  ensureUserDoc,
  saveTopic,
  saveProblem,
  uploadProblemImage
} from '../lib/firebase';

const DEFAULT_TOPICS = [
  { name: 'Arrays', target: 25, solved: 0 },
  { name: 'Strings', target: 20, solved: 0 },
  { name: 'Hashing', target: 15, solved: 0 },
  { name: 'Linked Lists', target: 15, solved: 0 },
  { name: 'Stacks & Queues', target: 15, solved: 0 },
  { name: 'Trees', target: 20, solved: 0 },
  { name: 'Graphs', target: 20, solved: 0 },
  { name: 'Dynamic Programming', target: 30, solved: 0 },
];

export default function Home() {
  const [user, setUser] = useState(null);

  // Initialize with defaults (do not access localStorage directly here)
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [lastSolvedDate, setLastSolvedDate] = useState(null);
  const [streak, setStreak] = useState(0);

  // Load from localStorage only on client-side mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cache = window.localStorage.getItem('dsa_topics');
      if (cache) setTopics(JSON.parse(cache));
    } catch (e) {
      console.error('Failed to read topics from localStorage', e);
    }

    try {
      const savedDate = window.localStorage.getItem('dsa_last_solved');
      if (savedDate) setLastSolvedDate(savedDate);

      const savedStreak = Number(window.localStorage.getItem('dsa_streak') || 0);
      setStreak(savedStreak);
    } catch (e) {
      console.error('Failed to read streak/date from localStorage', e);
    }
  }, []);

  // Persist topics when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('dsa_topics', JSON.stringify(topics));
    } catch (e) {
      console.error('Failed to write topics to localStorage', e);
    }
  }, [topics]);

  // Persist streak and lastSolvedDate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (lastSolvedDate) window.localStorage.setItem('dsa_last_solved', lastSolvedDate);
      window.localStorage.setItem('dsa_streak', String(streak));
    } catch (e) {
      console.error('Failed to write streak/date to localStorage', e);
    }
  }, [lastSolvedDate, streak]);

  // Firebase auth listener
  useEffect(() => {
    const unsub = onUser(async (u) => {
      setUser(u);
      if (u) await ensureUserDoc(u.uid);
    });
    return () => unsub();
  }, []);

  const totalTarget = useMemo(() => topics.reduce((a, b) => a + (Number(b.target) || 0), 0), [topics]);
  const totalSolved = useMemo(() => topics.reduce((a, b) => a + (Number(b.solved) || 0), 0), [topics]);

  function updateTarget(idx, newTarget) {
    const t = [...topics];
    t[idx].target = Number(newTarget || t[idx].target);
    setTopics(t);
    if (user) saveTopic(user.uid, t[idx]).catch(console.error);
  }

  async function addSolved(idx, problemName, link, file) {
    const t = [...topics];
    if (t[idx].solved >= t[idx].target) return;
    t[idx].solved += 1;
    setTopics(t);

    const today = new Date().toDateString();
    if (lastSolvedDate !== today) {
      setStreak((s) => s + 1);
      setLastSolvedDate(today);
    }

    let imageUrl = null;
    try {
      if (user && file) imageUrl = await uploadProblemImage(user.uid, file);
    } catch (e) {
      console.error(e);
    }

    if (user) {
      await saveTopic(user.uid, t[idx]);
      await saveProblem(user.uid, t[idx].name, { name: problemName || 'Untitled', link: link || '', imageUrl });
    }
  }

  function addTopic() {
    const name = prompt('Topic name');
    const target = Number(prompt('Target problems', '10') || 10);
    if (!name) return;
    const t = [...topics, { name, target, solved: 0 }];
    setTopics(t);
    if (user) saveTopic(user.uid, { name, target, solved: 0 }).catch(console.error);
  }

  const overallPct = totalTarget ? Math.round((totalSolved / totalTarget) * 100) : 0;

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="label">DSA Dashboard</div>
          <div className="h1">Your Progress</div>
        </div>
        <div className="row">
          {user ? (
            <>
              <span className="badge">Signed in as {user.displayName}</span>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn" onClick={googleLogin}>Sign in with Google</button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 24, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div className="h2">Overall Progress</div>
            <div className="progress"><span style={{ width: overallPct + '%' }} /></div>
            <div className="small" style={{ marginTop: 8 }}>{totalSolved} / {totalTarget} solved • {overallPct}%</div>
            <div className="small" style={{ marginTop: 4 }}>Streak: <span className="badge">{streak} days</span></div>
          </div>
          <div>
            <button className="btn" onClick={addTopic}>+ Add Topic</button>
          </div>
        </div>
      </div>

      <div className="h2" style={{ marginTop: 16 }}>Topics</div>
      <div className="grid">
        {topics.map((topic, idx) => {
          const pct = topic.target ? Math.round((topic.solved / topic.target) * 100) : 0;
          return (
            <div key={topic.name + idx} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="h2">{topic.name}</div>
                <span className="badge">{topic.solved} / {topic.target}</span>
              </div>
              <div className="progress" style={{ marginTop: 6 }}><span style={{ width: pct + '%' }} /></div>
              <div className="small" style={{ marginTop: 6 }}>{pct}%</div>

              <div className="row" style={{ marginTop: 10 }}>
                <label className="label">Target</label>
                <input className="input" type="number" min="1" defaultValue={topic.target} onBlur={(e) => updateTarget(idx, e.target.value)} />
              </div>

              <div className="row" style={{ marginTop: 10 }}>
                <input className="input" id={`name-${idx}`} placeholder="Problem name" style={{ flex: 2 }} />
                <input className="input" id={`link-${idx}`} placeholder="LeetCode/GfG link" style={{ flex: 3 }} />
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <input className="file" id={`file-${idx}`} type="file" accept="image/*" />
                <button className="btn" onClick={async () => {
                  const name = document.getElementById(`name-${idx}`).value;
                  const link = document.getElementById(`link-${idx}`).value;
                  const fileInput = document.getElementById(`file-${idx}`);
                  const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
                  await addSolved(idx, name, link, file);
                  if (fileInput) fileInput.value = '';
                  document.getElementById(`name-${idx}`).value = '';
                  document.getElementById(`link-${idx}`).value = '';
                }}>+1 Solved</button>
              </div>

              <div className="small" style={{ marginTop: 8 }}>
                Tip: add a screenshot of your submission or approach image. If not signed in, the image won’t be uploaded.
              </div>
            </div>
          );
        })}
      </div>

      <div className="footer">
        Data is saved in <span className="kbd">localStorage</span> by default. Sign in with Google to sync to Firebase (problems & images upload to your account).
      </div>
    </div>
  );
}
