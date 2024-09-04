const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/home');
});

router.get('/generator', (req, res) => {
    res.render('pages/generator');
})

module.exports = router;