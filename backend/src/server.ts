import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

// ============ Middleware ============
app.use(express.json());
app.use(cookieParser());

// ============ In-memory stores ============
type User = { email: string; password: string };
const DEMO_USER: User = { email: 'demo@sma.local', password: 'demo123' };

type Session = { email: string };
const sessions: Record<string, Session> = {};

type RecordItem = {
  id: string;
  user_email: string;
  title: string;
  priority: 'low' | 'med' | 'high';
  created_at: string;
};
const records: RecordItem[] = [];

// ============ Auth Middleware ============
function authRequired(req: Request, res: Response, next: NextFunction) {
  const sid = req.cookies['sid'];
  if (!sid || !sessions[sid]) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  (req as any).user = sessions[sid]; // attach user
  next();
}

// ============ Routes ============

// Login -> sets a cookie
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    const sid = crypto.randomBytes(16).toString('hex');
    sessions[sid] = { email };

    res.cookie('sid', sid, {
      httpOnly: true,
      sameSite: 'lax', // safe default for dev
      secure: false, // set true only if using HTTPS
    });

    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'invalid_credentials' });
});

// Secure GET /records
app.get('/api/records', authRequired, (req: Request, res: Response) => {
  const user = (req as any).user as Session;
  const userRecords = records.filter((r) => r.user_email === user.email);
  res.json(userRecords);
});

// Secure POST /records
app.post('/api/records', authRequired, (req: Request, res: Response) => {
  const user = (req as any).user as Session;
  const { title, priority } = req.body;

  if (!title || title.length < 3) {
    return res.status(400).json({ error: 'title_too_short' });
  }
  if (!['low', 'med', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'invalid_priority' });
  }

  const record: RecordItem = {
    id: String(records.length + 1),
    user_email: user.email,
    title,
    priority,
    created_at: new Date().toISOString(), // ✅ always valid ISO
  };

  records.push(record);
  res.status(201).json(record);
});

// Health check (optional)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ============ Start server ============
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
