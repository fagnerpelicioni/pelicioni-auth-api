const router = require('express').Router();
const verifyToken = require('./verifyToken');
const User = require('../model/User');
const Link = require('../model/Links');
const Company = require('../model/Company');

router.get('/links', verifyToken, async (req, res) => {
    try {
        const usuario = await User.findById(req.user._id).lean();
        if (!usuario) {
          return res.status(401).json({ error: 'Não autorizado.' });
        }

        const company = await Company.findById(usuario.company).lean();
        const links = await Link.find({ userEmail: usuario.email }).lean();
    
        res.status(200).json({
          id: usuario._id,
          name: usuario.name,
          email: usuario.email,
          role: usuario.role,
          company,
          links
        });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
});

router.post('/links', verifyToken, async (req, res) => {
    const { name, link, userEmail, company } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem criar links.' });
        }

        const usuario = await User.findOne({ email: userEmail }).lean();
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado!' });

        // Save the user's email in the Link document
        const novoLink = new Link({ name, link, userEmail, company });
        await novoLink.save();
        res.status(201).json(novoLink);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/links/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem excluir links.' });
        }
        const linkId = req.params.id;
        const link = await Link.findOneAndDelete(linkId).lean();

        if (!link) {
            return res.status(404).json({ error: 'Link não encontrado.' });
        }

        res.status(204).json({ message: 'Link deletado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;