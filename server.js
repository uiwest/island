const express = require('express');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// DB 초기화
const db = new Database('island_mail.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS islands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    island_name TEXT NOT NULL,
    color TEXT NOT NULL,
    tree_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS letters (
    id TEXT PRIMARY KEY,
    from_island_id TEXT NOT NULL,
    to_island_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_island_id) REFERENCES islands(id),
    FOREIGN KEY (to_island_id) REFERENCES islands(id)
  );
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 섬 생성 (회원가입)
app.post('/api/islands', (req, res) => {
  const { name, island_name } = req.body;
  if (!name || !island_name) return res.status(400).json({ error: '이름과 섬 이름을 입력해주세요.' });

  const id = uuidv4();
  const colors = ['#7BC67E', '#F4A261', '#E76F51', '#2A9D8F', '#E9C46A', '#A8DADC', '#C77DFF', '#FF6B9D'];
  const trees = ['oak', 'palm', 'pine', 'cherry'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const tree_type = trees[Math.floor(Math.random() * trees.length)];

  const stmt = db.prepare('INSERT INTO islands (id, name, island_name, color, tree_type) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, name, island_name, color, tree_type);

  res.json({ id, name, island_name, color, tree_type });
});

// 내 섬 정보 가져오기
app.get('/api/islands/:id', (req, res) => {
  const island = db.prepare('SELECT * FROM islands WHERE id = ?').get(req.params.id);
  if (!island) return res.status(404).json({ error: '섬을 찾을 수 없어요.' });
  res.json(island);
});

// 모든 섬 목록 (내 섬 제외)
app.get('/api/islands', (req, res) => {
  const { exclude } = req.query;
  let islands;
  if (exclude) {
    islands = db.prepare('SELECT id, name, island_name, color, tree_type FROM islands WHERE id != ? ORDER BY RANDOM() LIMIT 20').all(exclude);
  } else {
    islands = db.prepare('SELECT id, name, island_name, color, tree_type FROM islands ORDER BY RANDOM() LIMIT 20').all();
  }
  res.json(islands);
});

// 편지 보내기
app.post('/api/letters', (req, res) => {
  const { from_island_id, to_island_id, content } = req.body;
  if (!from_island_id || !to_island_id || !content) {
    return res.status(400).json({ error: '필수 정보가 빠졌어요.' });
  }
  if (from_island_id === to_island_id) {
    return res.status(400).json({ error: '자기 자신에게 편지를 보낼 수 없어요.' });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: '편지는 500자 이하로 써주세요.' });
  }

  const fromIsland = db.prepare('SELECT * FROM islands WHERE id = ?').get(from_island_id);
  const toIsland = db.prepare('SELECT * FROM islands WHERE id = ?').get(to_island_id);
  if (!fromIsland || !toIsland) return res.status(404).json({ error: '섬을 찾을 수 없어요.' });

  const id = uuidv4();
  db.prepare('INSERT INTO letters (id, from_island_id, to_island_id, content) VALUES (?, ?, ?, ?)').run(id, from_island_id, to_island_id, content);

  res.json({ id, message: '편지가 날아갔어요! 🦋' });
});

// 받은 편지함
app.get('/api/letters/inbox/:island_id', (req, res) => {
  const letters = db.prepare(`
    SELECT l.*, i.island_name as from_island_name, i.color as from_color
    FROM letters l
    JOIN islands i ON l.from_island_id = i.id
    WHERE l.to_island_id = ?
    ORDER BY l.created_at DESC
  `).all(req.params.island_id);
  res.json(letters);
});

// 보낸 편지함
app.get('/api/letters/outbox/:island_id', (req, res) => {
  const letters = db.prepare(`
    SELECT l.*, i.island_name as to_island_name, i.color as to_color
    FROM letters l
    JOIN islands i ON l.to_island_id = i.id
    WHERE l.from_island_id = ?
    ORDER BY l.created_at DESC
  `).all(req.params.island_id);
  res.json(letters);
});

// 편지 읽음 처리
app.patch('/api/letters/:id/read', (req, res) => {
  db.prepare('UPDATE letters SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// 안 읽은 편지 수
app.get('/api/letters/unread/:island_id', (req, res) => {
  const result = db.prepare('SELECT COUNT(*) as count FROM letters WHERE to_island_id = ? AND is_read = 0').get(req.params.island_id);
  res.json(result);
});

// 랜덤 섬으로 편지 보내기 (익명 매칭)
app.get('/api/islands/random/:exclude_id', (req, res) => {
  const island = db.prepare('SELECT * FROM islands WHERE id != ? ORDER BY RANDOM() LIMIT 1').get(req.params.exclude_id);
  if (!island) return res.status(404).json({ error: '다른 섬이 아직 없어요.' });
  res.json(island);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏝️  섬 우편 서버가 열렸어요! http://localhost:${PORT}`);
});
