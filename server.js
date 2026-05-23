const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

// Serve all static files from the root directory
app.use(express.static(path.join(__dirname, '.')));

app.get('/', (req, res) => {
    // Check if index.html exists, otherwise look for fallback names
    if (fs.existsSync(path.join(__dirname, 'index.html'))) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else if (fs.existsSync(path.join(__dirname, 'home.html'))) {
        res.sendFile(path.join(__dirname, 'home.html'));
    } else {
        // If it can't find a direct file, send a clean status so the server doesn't crash
        res.status(200).send("Cosmic Ops Server Active. Ready for assets.");
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});