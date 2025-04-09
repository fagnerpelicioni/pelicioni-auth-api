const router = require('express').Router();
const verifyToken = require('./verifyToken');
const Company = require('../model/Company');
const User = require('../model/User');

router.post('/', verifyToken, async (req, res) => {
    const { name, cnpj, code } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem criar empresas.' });
        }

        const novaEmpresa = new Company({ name, cnpj, code });
        await novaEmpresa.save();
        res.status(201).json(novaEmpresa);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    const { name, cnpj, active, code } = req.body;
    const { id } = req.params;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem atualizar empresas.' });
        }

        const empresaAtualizada = await Company.findByIdAndUpdate(id, { name, cnpj, code, active }, { new: true });
        if (!empresaAtualizada) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }
        empresaAtualizada.name = name || empresaAtualizada.name;
        empresaAtualizada.cnpj = cnpj || empresaAtualizada.cnpj;
        empresaAtualizada.code = code || empresaAtualizada.code;
        empresaAtualizada.active = active !== undefined ? active : empresaAtualizada.active;
        
        // If the company's active flag is set to false, update all associated users
        if (active === false) {
            await User.updateMany(
                { company: id }, // Find all users associated with this company
                { active: false } // Set their active flag to false
            );
        }
        
        res.status(200).json(empresaAtualizada);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem listar empresas.' });
        }

        const empresas = await Company.find().lean();
        res.status(200).json(empresas);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;