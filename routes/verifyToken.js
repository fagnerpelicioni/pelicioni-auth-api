const jwt = require('jsonwebtoken');
const dotenv = require('dotenv'); 

dotenv.config();
const auth = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).json({ error: 'Acesso negado.' });
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Token inválido' });
        }
        res.status(403).json({ error: 'Token inválido' });
    }
}
module.exports = auth;