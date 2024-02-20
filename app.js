require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // For parsing application/json

const users = [
    // Example user for demonstration
    { id: 1, username: 'testUser', password: 'password' } // In a real application, passwords should be hashed
];

// Secret keys for JWT signing
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'youraccesstokensecret';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'yourrefreshtokensecret';
let refreshTokens = [];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const accessToken = jwt.sign({ userId: user.id }, accessTokenSecret, { expiresIn: '2h' });
        const refreshToken = jwt.sign({ userId: user.id }, refreshTokenSecret, { expiresIn: '30d' });
        refreshTokens.push(refreshToken);

        res.json({
            accessToken,
            refreshToken
        });
    } else {
        res.send('Username or password incorrect');
    }
});

app.post('/token', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.sendStatus(401);
    }
    if (!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }
    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        const accessToken = jwt.sign({ userId: user.id }, accessTokenSecret, { expiresIn: '2h' });

        res.json({
            accessToken
        });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

