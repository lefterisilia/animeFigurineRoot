import { useState } from 'react';

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
    const [items, setItems] = useState<CartItem[]>(cart);

    const update = (newCart: CartItem[]) => {
        cart = newCart;
        setItems(cart);
        listeners.forEach(l => l(cart));
    };

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            update(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            update([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id: string) => {
        update(cart.filter(item => item.id !== id));
    };

    return { items, addToCart, removeFromCart };
}
