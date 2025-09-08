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
            if (isNaN(parseInt(page)) || isNaN(parseInt(limit))) {
                return res.status(400).json(formatResponse(400, 'Invalid page or limit parameter', null));
            }
            
            const items = await this.itemService.getItems(page, search, limit);
            res.json(formatResponse(200, 'Items retrieved successfully', items));
        } catch (error) {
            res.status(500).json(formatResponse(500, 'Internal server error', null, error.message));
        }
    }

    // Сохранение порядка сортировки
    async saveOrder(req, res) {
        try {
            const { order } = req.body;
            if (!Array.isArray(order)) {
                return res.status(400).json(formatResponse(400, 'Order must be an array', null));
            }
            
            const state = await this.itemService.saveOrder(order);
            res.json(formatResponse(200, 'Order saved successfully', state));
        } catch (error) {
            if (error.message.includes('Invalid item IDs')) {
                return res.status(400).json(formatResponse(400, error.message, null));
            }
            res.status(500).json(formatResponse(500, 'Internal server error', null, error.message));
        }
    }

    // Сохранение выбранных элементов
    async saveSelected(req, res) {
        try {
            const { selected } = req.body;
            if (!Array.isArray(selected)) {
                return res.status(400).json(formatResponse(400, 'Selected must be an array', null));
            }
            
            const state = await this.itemService.saveSelected(selected);
            res.json(formatResponse(200, 'Selected items saved successfully', state));
        } catch (error) {
            if (error.message.includes('Invalid item IDs')) {
                return res.status(400).json(formatResponse(400, error.message, null));
            }
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
