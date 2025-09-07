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
        count: filteredItems.length || (loading ? items.length + 1 : items.length),
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
    }, [rowVirtualizer.getVirtualItems(), currentPage, loading, items.length, totalItems]);

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

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className={styles.info}>
                    Выбрано: {selectedItems.size} из {filteredItems.length}
                </div>
            </div>
            <div ref={parentRef} className={styles.container}>
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative'
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = filteredItems[virtualRow.index];
                        return (
                            <div
                                key={virtualRow.index}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`
                                }}
                                className={styles.row}
                            >
                                {item ? (
                                    <>
                                        <input 
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleItemSelection(item.id)}
                                        />
                                        <span>#{item.value}</span>
                                    </>
                                ) : loading ? (
                                    <div className={styles.loadingRow}>
                                        Загрузка...
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
