const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Create uploads folder
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// SQLite Database
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        available INTEGER DEFAULT 1,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        delivery_notes TEXT,
        total REAL NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        menu_item_id INTEGER,
        quantity INTEGER,
        price_at_time REAL
    )`);
    
    db.get("SELECT COUNT(*) as count FROM menu_items", (err, row) => {
        if (row && row.count === 0) {
            const sampleData = [
                ['Jollof Rice & Chicken', 'Fragrant rice with tomato stew, grilled chicken and plantains', 16.99, 'rice', 1],
                ['Fufu & Egusi Soup', 'Pounded cassava with melon seed soup and meat', 18.99, 'soup', 1],
                ['Puff Puff & Beans', 'Golden fried dough with black-eyed pea stew', 12.99, 'snacks', 1],
                ['Suya Platter', 'Spicy grilled beef skewers', 14.99, 'snacks', 1]
            ];
            const stmt = db.prepare("INSERT INTO menu_items (name, description, price, category, available) VALUES (?, ?, ?, ?, ?)");
            sampleData.forEach(item => stmt.run(item));
            stmt.finalize();
            console.log('Sample data inserted');
        }
    });
});

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Auth middleware
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Routes
app.get('/api/menu', (req, res) => {
    db.all('SELECT * FROM menu_items WHERE available = 1', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, items: rows });
    });
});

app.get('/api/menu/:id', (req, res) => {
    db.get('SELECT * FROM menu_items WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Item not found' });
        res.json({ success: true, item: row });
    });
});

app.post('/api/menu', auth, upload.single('image'), (req, res) => {
    const { name, description, price, category, available } = req.body;
    const image_path = req.file ? `/uploads/${req.file.filename}` : null;
    db.run('INSERT INTO menu_items (name, description, price, category, available, image_path) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, price, category, available ? 1 : 0, image_path],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        });
});

app.put('/api/menu/:id', auth, upload.single('image'), (req, res) => {
    const { name, description, price, category, available } = req.body;
    let updates = [name, description, price, category, available ? 1 : 0];
    let query = 'UPDATE menu_items SET name=?, description=?, price=?, category=?, available=?';
    
    if (req.file) {
        query += ', image_path=?';
        updates.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id=?';
    updates.push(req.params.id);
    
    db.run(query, updates, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

app.delete('/api/menu/:id', auth, (req, res) => {
    db.run('DELETE FROM menu_items WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/orders', (req, res) => {
    const { customer_name, customer_phone, customer_address, items, total, payment_method } = req.body;
    db.run('INSERT INTO orders (customer_name, customer_phone, customer_address, total, payment_method) VALUES (?, ?, ?, ?, ?)',
        [customer_name, customer_phone, customer_address, total, payment_method],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            const orderId = this.lastID;
            items.forEach(item => {
                db.run('INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity, item.price]);
            });
            res.json({ success: true, order_id: orderId });
        });
});

app.get('/api/orders', auth, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, orders: rows });
    });
});

app.put('/api/orders/:id/status', auth, (req, res) => {
    db.run('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
        res.json({ success: true, token, name: 'Administrator' });
    } else {
        res.status(401).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
