const express = require('express');
const router = express.Router();
const db = global.db || require('../config/db');

// GET ALL PRODUCTS
router.get('/', (req, res) => {
    const { category, search, sort } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    let params = [];

    if (category && category !== 'all') { sql += " AND category = ?"; params.push(category); }
    if (search) { sql += " AND (name LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    
    if (sort === 'price_low') sql += " ORDER BY price ASC";
    else if (sort === 'price_high') sql += " ORDER BY price DESC";
    else sql += " ORDER BY id DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB Error' });
        
        const products = results.map(p => ({
            ...p,
            images: p.image ? [p.image] : []
        }));
        res.json({ success: true, count: products.length, products: products });
    });
});

// CREATE PRODUCT (Saves the Base64 text string)
router.post('/', (req, res) => {
    const { name, price, category, description, image } = req.body;

    if (!name || !price || !category) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const sql = "INSERT INTO products (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [name, price, category, description, image], (err, result) => {
        if (err) {
            console.error("Error saving product:", err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.status(201).json({ success: true, message: 'Saved successfully' });
    });
});

// DELETE
router.delete('/:id', (req, res) => {
    db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

module.exports = router;