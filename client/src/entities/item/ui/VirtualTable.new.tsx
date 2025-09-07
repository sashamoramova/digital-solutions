import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type Item } from '@/shared/types/item';
import { itemsApi } from '@/entities/item/api';
import styles from './virtual-table.module.css';

interface VirtualTableProps {
    pageSize?: number;
}

export const VirtualTable = ({ pageSize = 20 }: VirtualTableProps) => {
    const [items, setItems] = useState<Item[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    const parentRef = useRef<HTMLDivElement>(null);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Load saved state from localStorage
    useEffect(() => {
        const savedSelectedItems = localStorage.getItem('selectedItems');
        const savedSearchTerm = localStorage.getItem('searchTerm');
        
        if (savedSelectedItems) {
            setSelectedItems(new Set(JSON.parse(savedSelectedItems)));
        }
        if (savedSearchTerm) {
            setSearchTerm(savedSearchTerm);
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        localStorage.setItem('selectedItems', JSON.stringify(Array.from(selectedItems)));
        localStorage.setItem('searchTerm', searchTerm);
    }, [selectedItems, searchTerm]);

    // Filter items based on search term
    const filteredItems = items.filter(item => 
        item.value.toString().includes(searchTerm)
    );

    const rowVirtualizer = useVirtualizer({
        count: loading ? items.length + 1 : totalItems,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35,
        overscan: 5
    });

    const loadItems = async (page: number) => {
        try {
            setLoading(true);
            const response = await itemsApi.getItems(page, pageSize);
            if (response.data) {
                setItems(prev => [...prev, ...response.data.items]);
                setTotalItems(response.data.total);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error('Failed to load items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadItems(1);
    }, []);

    // Load more on scroll
    useEffect(() => {
        const lastItem = rowVirtualizer.getVirtualItems().at(-1);
        if (!lastItem) return;

        const pageToLoad = Math.floor(lastItem.index / pageSize) + 1;
        if (pageToLoad > currentPage && !loading && items.length < totalItems) {
            loadItems(pageToLoad);
        }
    }, [rowVirtualizer.getVirtualItems(), currentPage, loading, items.length, totalItems, pageSize]);

    const toggleItemSelection = useCallback((itemId: number) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }, [filteredItems]);

    const handleClearSelection = useCallback(() => {
        setSelectedItems(new Set());
    }, []);

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Менеджер элементов (1 - 1,000,000)</h1>
            <div className={styles.header}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Поиск элементов..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.actions}>
                    <button onClick={handleSelectAll} className={styles.button}>
                        Выбрать все
                    </button>
                    <button onClick={handleClearSelection} className={styles.button}>
                        Очистить выбор
                    </button>
                </div>
            </div>
            <div className={styles.info}>
                Показано {filteredItems.length} из {totalItems} элементов • {selectedItems.size} выбрано
            </div>
            <div className={styles.tableContainer} ref={parentRef}>
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                        const item = filteredItems[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.index}
                                className={styles.row}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`
                                }}
                            >
                                {item ? (
                                    <>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleItemSelection(item.id)}
                                            className={styles.checkbox}
                                        />
                                        <span>Элемент #{item.id}</span>
                                        <span className={styles.dragHandle}>⋮</span>
                                    </>
                                ) : (
                                    <div className={styles.loadingRow}>
                                        Загрузка...
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
