const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite');
const { open } = require('sqlite/sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// 配置
const config = {
  database: 'treehole.db',
  adminUsers: {
    'root': 'Dailinbo0420',
    'Admin0420': 'Dailinbo0420'
  },
  jwtSecret: 'your-secret-key',
  ipLimitSeconds: 60
};

// 日志配置
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'treehole.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(helmet());

// 请求频率限制
const limiter = rateLimit({
  windowMs: config.ipLimitSeconds * 1000,
  max: 1
});

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 数据库初始化
async function initDatabase() {
  try {
    const db = await open({
      filename: config.database,
      driver: sqlite3.Database
    });
    
    await db.exec(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      author TEXT DEFAULT '匿名',
      ip_address TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await db.exec('PRAGMA journal_mode = WAL');
    await db.close();
    console.log('Database initialized successfully');
    return Promise.resolve();
  } catch (err) {
    console.error('Database initialization error:', err);
    return Promise.reject(err);
  }
}

// 获取数据库连接
async function getDb() {
  return open({
    filename: config.database,
    driver: sqlite3.Database
  });
}

// 认证中间件
function checkAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: '认证失败' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const { username, password } = decoded;
    
    if (!config.adminUsers[username] || config.adminUsers[username] !== password) {
      return res.status(401).json({ status: 'error', message: '认证失败' });
    }
    
    req.user = { username };
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: '认证失败' });
  }
}

// 路由
app.get('/get_messages', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT content, author, timestamp FROM messages ORDER BY timestamp DESC');
    await db.close();
    res.json({ messages: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: '数据库查询错误' });
  }
});

app.post('/post_message', limiter, async (req, res) => {
  if (!req.body || !req.body.content) {
    return res.status(400).json({ status: 'error', message: '缺少必要字段' });
  }

  try {
    const content = req.body.content;
    const author = req.body.author || '匿名';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO messages (content, author, ip_address) VALUES (?, ?, ?)',
      [content, author, ip]
    );
    await db.close();
    
    if (result.changes === 0) {
      return res.status(500).json({ status: 'error', message: '留言提交失败' });
    }
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: '留言提交失败' });
  }
});

// 管理员路由
const adminRouter = express.Router();
adminRouter.use(checkAdminAuth);

adminRouter.get('/get_messages', async (req, res) => {
  try {
    const search = req.query.search || '';
    const db = await getDb();
    
    let rows;
    if (search) {
      rows = await db.all(
        'SELECT id, content, author, ip_address, timestamp FROM messages WHERE content LIKE ? ORDER BY timestamp DESC',
        [`%${search}%`]
      );
    } else {
      rows = await db.all(
        'SELECT id, content, author, ip_address, timestamp FROM messages ORDER BY timestamp DESC'
      );
    }
    
    await db.close();
    res.json({ status: 'success', messages: rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: '数据库查询错误' });
  }
});

adminRouter.post('/delete_message', async (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).json({ status: 'error', message: '缺少必要参数' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      'DELETE FROM messages WHERE id = ?',
      [req.body.id]
    );
    await db.close();
    
    if (result.changes === 0) {
      return res.status(404).json({ status: 'error', message: '未找到指定留言' });
    }
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: '删除失败' });
  }
});

adminRouter.post('/delete_all_messages', async (req, res) => {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.status(400).json({ status: 'error', message: '缺少用户名或密码' });
  }

  if (req.user.username !== req.body.username || 
      config.adminUsers[req.body.username] !== req.body.password) {
    return res.status(401).json({ status: 'error', message: '用户名或密码不正确' });
  }

  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM messages');
    await db.close();
    
    res.json({ 
      status: 'success', 
      message: `已删除${result.changes}条留言` 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: '删除失败' });
  }
});

app.use('/admin', adminRouter);

// 静态文件路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 初始化并启动
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
