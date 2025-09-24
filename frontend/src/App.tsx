import React, { useEffect, useState } from 'react';

type RecordItem = {
  id: string;
  user_email: string;
  title: string;
  priority: 'low' | 'med' | 'high';
  created_at: string;
};

export default function App() {
  const [email, setEmail] = useState('demo@sma.local');
  const [password, setPassword] = useState('demo123');
  const [loggedIn, setLoggedIn] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('low');
  const [error, setError] = useState<string | null>(null);

  async function tryLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // important for cookie session
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'login_failed' }));
        setError(data.error || 'Login failed');
        setLoggedIn(false);
        return;
      }
      setLoggedIn(true);
      await fetchRecords();
    } catch (err) {
      setError(String(err));
    }
  }

  async function fetchRecords() {
    setError(null);
    try {
      const res = await fetch('/api/records', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        // unauthorized probably; mark logged out
        setLoggedIn(false);
        setRecords([]);
      }
    } catch (err) {
      setError(String(err));
    }
  }

  async function createRecord(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, priority }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'create_failed' }));
        setError(data.error || 'Create failed');
        return;
      }

      // created — refetch list
      setTitle('');
      setPriority('low');
      await fetchRecords();
    } catch (err) {
      setError(String(err));
    }
  }

  // on mount, check existing session by attempting to fetch records
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/records', { credentials: 'include' });
        if (res.ok) {
          setLoggedIn(true);
          const data = await res.json();
          setRecords(data);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <div
      style={{
        maxWidth: 680,
        margin: '2rem auto',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1>Tiny Records</h1>

      {!loggedIn ? (
        <form onSubmit={tryLogin} style={{ gap: 8, display: 'grid' }}>
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type='submit'>Login</button>

          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
      ) : (
        <>
          <form
            onSubmit={createRecord}
            style={{ display: 'grid', gap: 8, marginBottom: 12 }}
          >
            <input
              placeholder='Title (min 3 chars)'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as never)}
            >
              <option value='low'>Low</option>
              <option value='med'>Med</option>
              <option value='high'>High</option>
            </select>

            <button type='submit'>Add Record</button>
          </form>

          {error && <div style={{ color: 'red' }}>{error}</div>}

          <h2>Your Records</h2>
          <ul>
            {records.map((r) => (
              <li key={r.id}>
                <strong>{r.id} -</strong> <strong>{r.title}</strong> [
                {r.priority}] —{' '}
                {r.created_at && !isNaN(Date.parse(r.created_at))
                  ? new Date(r.created_at).toLocaleString()
                  : 'No date'}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
