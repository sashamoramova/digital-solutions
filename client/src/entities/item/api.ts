import axios from 'axios';
import { type Item, type ItemsResponse, type StateResponse, type SaveOrderRequest, type SaveSelectedRequest } from '@/shared/types/item';

const API_URL = 'http://localhost:3000/api';

export const itemsApi = {
    // Получение списка элементов с пагинацией и поиском
    getItems: async (page: number = 1, limit: number = 20, search: string = '') => {
        const response = await axios.get<ItemsResponse>(`${API_URL}/items`, {
            params: {
                page,
                limit,
                search
            }
        });
        return response.data;
    },

    // Сохранение порядка сортировки
    saveOrder: async (order: number[]) => {
        const response = await axios.post<StateResponse>(`${API_URL}/items/order`, {
            order
        } as SaveOrderRequest);
        return response.data;
    },

    // Сохранение выбранных элементов
    saveSelected: async (selected: number[]) => {
        const response = await axios.post<StateResponse>(`${API_URL}/items/selected`, {
            selected
        } as SaveSelectedRequest);
        return response.data;
    },

    // Получение текущего состояния
    getState: async () => {
        const response = await axios.get<StateResponse>(`${API_URL}/items/state`);
        return response.data;
    }
};
