const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');
const Company = require('../model/Company');

const { registerValidation, loginValidation } = require('../validation');

router.post('/register', async (req, res) => {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).send({ error: error.details[0].message });

    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) return res.status(400).json({ error: 'Já existe um usuário cadastrado com esse email!' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role || 'user',
        company: req.body.company || null,
        active: req.body.active !== undefined ? req.body.active : true,
    });

    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Login route
router.post('/login', async (req, res) => {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const emailExists = await User.findOne({ email: req.body.email });
    if (!emailExists) return res.status(400).json({ error: 'Email não encontrado!' });

    const validPassword = await bcrypt.compare(req.body.password, emailExists.password);
    if (!validPassword) return res.status(400).json({ error: 'Senha inválida!' });

    const isActive = emailExists.active;
    if (!isActive) return res.status(403).json({ error: 'Usuário inativo. Entre em contato com o administrador.' });

    const token = jwt.sign({ _id: emailExists._id, email: emailExists.email, role: emailExists.role }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

    res.header('auth-token', token).json({
        _id: emailExists._id,
        email: emailExists.email,
        token: token,
    });
})

router.post('/logout', (req, res) => {
    res.header('auth-token', '').status(200).json({ message: 'Logout realizado com sucesso!' });
})

router.get('/users', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem listar usuários.' });
        }
        const users = await User.find().populate({
            path: 'company',
            select: 'name _id',
        }).lean();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/users/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, active, company } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar usuários.' });
        }

        const user = await User.findOne({ _id: id });
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.company = company || user.company;
        user.active = active !== undefined ? active : user.active;

        await user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


module.exports = router;