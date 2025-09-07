const router = require('express').Router();
const itemController = require('../controllers/Item.controller');

// Получение списка элементов с пагинацией и поиском
router.get('/', itemController.getItems.bind(itemController));

// Сохранение порядка сортировки
router.post('/order', itemController.saveOrder.bind(itemController));

// Сохранение выбранных элементов
router.post('/selected', itemController.saveSelected.bind(itemController));

// Получение текущего состояния
router.get('/state', itemController.getState.bind(itemController));

module.exports = router;
