const ItemService = require('../services/Item.service');
const formatResponse = require('../utils/formatResponse');

class ItemController {
    constructor() {
        this.itemService = new ItemService();
    }

    // Получение списка элементов с пагинацией
    async getItems(req, res) {
        try {
            const { page = 1, search = '', limit = 20 } = req.query;
            const items = await this.itemService.getItems(parseInt(page), search, parseInt(limit));
            res.json(formatResponse(200, 'Items retrieved successfully', items));
        } catch (error) {
            res.status(500).json(formatResponse(500, 'Internal server error', null, error.message));
        }
    }

    // Сохранение порядка сортировки
    async saveOrder(req, res) {
        try {
            const { order } = req.body;
            await this.itemService.saveOrder(order);
            res.json(formatResponse(200, 'Order saved successfully'));
        } catch (error) {
            res.status(500).json(formatResponse(500, 'Internal server error', null, error.message));
        }
    }

    // Сохранение выбранных элементов
    async saveSelected(req, res) {
        try {
            const { selected } = req.body;
            await this.itemService.saveSelected(selected);
            res.json(formatResponse(200, 'Selected items saved successfully'));
        } catch (error) {
            res.status(500).json(formatResponse(500, 'Internal server error', null, error.message));
        }
    }

    // Получение текущего состояния (порядок и выбранные элементы)
    async getState(req, res) {
        try {
            const state = await this.itemService.getState();
            res.json(formatResponse(200, 'State retrieved successfully', state));
        } catch (error) {
            res.status(500).json(formatResponse(500, 'Internal server error', null, error.message));
        }
    }
}

module.exports = new ItemController();
