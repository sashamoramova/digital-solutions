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

    async getItems(page, search, limit) {
        let filteredItems = [...this.items];

        // Применяем поиск, если есть
        if (search) {
            filteredItems = filteredItems.filter(item => 
                item.value.toString().includes(search)
            );
        }

        // Применяем пользовательскую сортировку
        if (this.currentOrder.length > 0) {
            const orderMap = new Map(this.currentOrder.map((id, index) => [id, index]));
            filteredItems.sort((a, b) => {
                const orderA = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity;
                const orderB = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
                return orderA - orderB;
            });
        }

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            total: filteredItems.length,
            page,
            totalPages: Math.ceil(filteredItems.length / limit)
        };
    }

    async saveOrder(order) {
        this.currentOrder = order;
        return true;
    }

    async saveSelected(selected) {
        this.selectedItems = new Set(selected);
        return true;
    }

    async getState() {
        return {
            order: this.currentOrder,
            selected: Array.from(this.selectedItems)
        };
    }
}

module.exports = ItemService;
