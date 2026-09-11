const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
var HTML_FILE = path.join(__dirname, 'index.html');
if (!fs.existsSync(HTML_FILE)) {
  HTML_FILE = path.join(__dirname, '..', '需求收集工作台.html');
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { records: [], updatedAt: null };
  }
}

function writeData(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, status, data) {
  setCORS(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  setCORS(res);
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (e) {
    sendJSON(res, 404, { error: 'File not found' });
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    setCORS(res);
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/ping') {
    sendJSON(res, 200, { ok: true, time: new Date().toISOString() });
    return;
  }

  if (pathname === '/api/records' && method === 'GET') {
    const data = readData();
    sendJSON(res, 200, data);
    return;
  }

  if (pathname === '/api/records' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const records = payload.records || payload;
        if (!Array.isArray(records)) {
          sendJSON(res, 400, { error: 'records must be an array' });
          return;
        }
        const data = { records: records };
        writeData(data);
        sendJSON(res, 200, { ok: true, count: records.length, updatedAt: data.updatedAt });
      } catch (e) {
        sendJSON(res, 400, { error: 'Invalid JSON: ' + e.message });
      }
    });
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    sendFile(res, HTML_FILE, 'text/html; charset=utf-8');
    return;
  }

  if (pathname === '/api/stats') {
    const data = readData();
    sendJSON(res, 200, {
      totalRecords: data.records.length,
      lastUpdated: data.updatedAt,
      serverTime: new Date().toISOString()
    });
    return;
  }

  sendJSON(res, 404, { error: 'Not found: ' + pathname });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================');
  console.log('  需求收集工作台 - 同步服务器');
  console.log('==========================================');
  console.log('');
  console.log('  本机访问:  http://localhost:' + PORT);
  console.log('  局域网:    http://' + getLocalIP() + ':' + PORT);
  console.log('');
  console.log('  手机和电脑连同一 WiFi，用上面的局域网地址即可同步');
  console.log('  部署到云主机后，任何网络都能访问');
  console.log('');
  console.log('  API:');
  console.log('    GET  /api/records  获取全部记录');
  console.log('    POST /api/records  上传全部记录');
  console.log('    GET  /api/ping     健康检查');
  console.log('    GET  /api/stats    统计信息');
  console.log('');
  console.log('  按 Ctrl+C 停止');
  console.log('==========================================');
});

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}
