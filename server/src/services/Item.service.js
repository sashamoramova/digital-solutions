class ItemService {
    constructor() {
        // Генерируем массив чисел от 1 до 1000000
        this.items = Array.from({ length: 1000000 }, (_, i) => ({
            id: i + 1,
            value: i + 1
        }));
        
        // Храним текущее состояние сортировки
        this.currentOrder = [];
        // Храним выбранные элементы
        this.selectedItems = new Set();
    }

    async getItems(page = 1, search = '', limit = 20) {
        page = parseInt(page);
        limit = parseInt(limit);

        // Фильтруем элементы по поиску
        let filteredItems = search
            ? this.items.filter(item => item.value.toString().includes(search))
            : [...this.items];

        // Считаем общее количество
        const total = filteredItems.length;
        const totalPages = Math.ceil(total / limit);

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        let paginatedItems = filteredItems.slice(startIndex, endIndex);

        // Применяем пользовательскую сортировку только к текущей странице
        if (this.currentOrder.length > 0) {
            const orderMap = new Map(this.currentOrder.map((id, index) => [id, index]));
            paginatedItems.sort((a, b) => {
                const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity;
                const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
                return orderA - orderB;
            });
        }

        return {
            items: paginatedItems,
            total,
            page,
            totalPages
        };
    }

    async saveOrder(order) {
        if (!Array.isArray(order)) {
            throw new Error('Order must be an array of item IDs');
        }
        
        // Проверяем, что все ID существуют
        const validIds = order.every(id => this.items.some(item => item.id === id));
        if (!validIds) {
            throw new Error('Invalid item IDs in order array');
        }

        this.currentOrder = order;
        return {
            order: this.currentOrder,
            selected: Array.from(this.selectedItems)
        };
    }

    async saveSelected(selected) {
        if (!Array.isArray(selected)) {
            throw new Error('Selected must be an array of item IDs');
        }

        // Проверяем, что все ID существуют
        const validIds = selected.every(id => this.items.some(item => item.id === id));
        if (!validIds) {
            throw new Error('Invalid item IDs in selected array');
        }

        this.selectedItems = new Set(selected);
        return {
            order: this.currentOrder,
            selected: Array.from(this.selectedItems)
        };
    }

    async getState() {
        return {
            order: [...this.currentOrder],
            selected: Array.from(this.selectedItems)
        };
    }
}

module.exports = ItemService;
