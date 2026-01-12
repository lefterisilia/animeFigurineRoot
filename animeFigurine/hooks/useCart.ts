import {useEffect, useState} from 'react';
import { getUser } from "@/lib/authStorage";
import { apiClient } from "@/lib/apiClient";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    quantity: number;
};

// Simple global-like state for demo purposes
let cart: CartItem[] = [];
let listeners: Array<(cart: CartItem[]) => void> = [];

export function useCart() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await getUser();
            setUser(userData);
        };
        loadUser();
    }, []);

    
    const [items, setItems] = useState<CartItem[]>(cart);

    const update = (newCart: CartItem[]) => {
        cart = newCart;
        setItems(cart);
        listeners.forEach(l => l(cart));
    };

    const addToCart = async (product: any) => {
        // Sync with backend first
        if (user?.id) {
            try {
                await apiClient.post("/cart/add", {
                    userid: user.id,
                    productid: product.id
                });
                
                // Refetch cart from backend to ensure sync
                const response = await apiClient.get(`/cart/${user.id}`);
                const fetchedItems = response.data.items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image_url,
                    quantity: 1
                }));
                update(fetchedItems);
            } catch (error) {
                console.error("Failed to add item to cart in backend:", error);
            }
        }
    };

    const removeFromCart = async (id: string) => {
        // Sync with backend first
        if (user?.id) {
            try {
                await apiClient.post("/cart/remove", {
                    userid: user.id,
                    productid: id
                });
                
                // Refetch cart from backend to ensure sync
                const response = await apiClient.get(`/cart/${user.id}`);
                const fetchedItems = response.data.items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image_url,
                    quantity: 1
                }));
                update(fetchedItems);
            } catch (error) {
                console.error("Failed to remove item from cart in backend:", error);
            }
        }
    };

    const clearCart = () => {
        update([]);
    };

    return { items, addToCart, removeFromCart, clearCart, update };
}
