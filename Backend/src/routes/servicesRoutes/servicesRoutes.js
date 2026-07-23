const express = require('express');
const router = express.Router();
const { Service } = require('../../models/service');
const { User } = require('../../models/user');
const authMiddleware = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.post('/services', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }
        const {
            client,
            type,
            description,
            collaborator,
            start,
            end
        } = req.body;
        if (start && end && new Date(end) <= new Date(start)) {
            return res.status(400).json({
                error: "A data/hora de término deve ser posterior à data/hora de início."
            });
        }
        const collaboratorExists = await User.findById(collaborator);
        if (!collaboratorExists) {
            return res.status(404).json({
                error: 'Colaborador não encontrado'
            });
        }
        const service = await Service.create({
            client,
            type,
            description,
            collaborator,
            start,
            end,
            image: req.file
                ? `/uploads/services/${req.file.filename}`
                : null,
            createdBy: req.user.id
        });
        const createdService = await Service.findById(service._id)
            .populate('collaborator', 'name email');

        return res.status(201).json(createdService);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

router.put('/services/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }
        const { id } = req.params;
        const {
            client,
            type,
            description,
            collaborator,
            start,
            end
        } = req.body;
        const serviceExists = await Service.findById(id);
        if (!serviceExists) {
            return res.status(404).json({
                error: 'Serviço não encontrado'
            });
        }
        const newStart = start !== undefined ? start : serviceExists.start;
        const newEnd = end !== undefined ? end : serviceExists.end;
        if (newStart && newEnd && new Date(newEnd) <= new Date(newStart)) {
            return res.status(400).json({
                error: "A data/hora de término deve ser posterior à data/hora de início."
            });
        }
        if (collaborator) {
            const collaboratorExists = await User.findById(collaborator);
            if (!collaboratorExists) {
                return res.status(404).json({
                    error: 'Colaborador não encontrado'
                });
            }
        }
        const updateData = {
            client,
            type,
            description,
            collaborator,
            start,
            end
        };
        if (req.file) {
            updateData.image = `/uploads/services/${req.file.filename}`;
        }
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: 'after', runValidators: true }
        ).populate('collaborator', 'name email');
        return res.status(200).json(updatedService);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Erro interno do servidor ao atualizar o serviço'
        });
    }
});

router.get('/services', async (req, res) => {
    try {
        const services = await Service.find()
            .populate('collaborator', 'name email')
            .sort({ start: -1 });

        return res.status(200).json(services);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Erro interno do servidor ao buscar serviços'
        });
    }
});

router.delete('/services/:id', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({
                error: "Acesso negado. Apenas administradores podem excluir serviços."
            });
        }

        const { id } = req.params;

        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return res.status(404).json({
                error: 'Serviço não encontrado'
            });
        }
        return res.status(200).json({
            message: 'Serviço excluído com sucesso',
            id: deletedService._id
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Erro interno do servidor ao excluir o serviço'
        });
    }
});

router.patch('/services/:id/toggle-done', authMiddleware, async (req, res) => {
    try {
        if (!req.user.admin) {
            return res.status(403).json({
                error: "Acesso negado"
            });
        }
        const { id } = req.params;
        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                error: 'Serviço não encontrado'
            });
        }
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { $set: { done: !service.done } },
            { returnDocument: 'after', runValidators: true }
        ).populate('collaborator', 'name email');
        return res.status(200).json(updatedService);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Erro interno do servidor ao alterar o status do serviço'
        });
    }
});

module.exports = router;