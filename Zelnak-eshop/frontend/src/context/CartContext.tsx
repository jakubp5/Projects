import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { LocalStorage } from '../enums'
import { Cart } from '../types/Cart'
import { Product } from '../types/Product'

const CartContext = createContext<{
    cart: Cart
    addProduct: (
        id: Product['id'],
        quantity: number,
        price: number,
        sellerId: number,
        productName: Cart['products'][number]['productName']
    ) => void
    removeProduct: (id: Product['id']) => void
    updateProductQuantity: (id: Product['id'], quantityChange: number) => void
    clearCart: () => void
}>({
    cart: { products: [] },
    addProduct: () => {},
    removeProduct: () => {},
    updateProductQuantity: () => {},
    clearCart: () => {},
})

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart>({ products: [] })

    useEffect(() => {
        const storedCart = localStorage.getItem(LocalStorage.Cart)
        if (storedCart) {
            setCart(JSON.parse(storedCart))
        }
    }, [])

    const addProduct = (
        id: Product['id'],
        quantity: number,
        price: number,
        sellerId: number,
        productName: Cart['products'][number]['productName']
    ) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.products.find((p) => p.id === id)
            const updatedCart = existingProduct
                ? {
                      ...prevCart,
                      products: prevCart.products.map((p) =>
                          p.id === id ? { ...p, quantity: p.quantity + quantity } : p
                      ),
                  }
                : {
                      ...prevCart,
                      products: [
                          ...prevCart.products,
                          { id, quantity, price, seller_id: sellerId, productName },
                      ],
                  }

            // Update localStorage
            localStorage.setItem(LocalStorage.Cart, JSON.stringify(updatedCart))
            return updatedCart
        })
    }

    const removeProduct = (id: Product['id']) => {
        setCart((prevCart) => {
            const updatedCart = {
                ...prevCart,
                products: prevCart.products.filter((p) => p.id !== id),
            }

            // Update localStorage
            localStorage.setItem(LocalStorage.Cart, JSON.stringify(updatedCart))
            return updatedCart
        })
    }

    const updateProductQuantity = (id: Product['id'], quantityChange: number) => {
        setCart((prevCart) => {
            const updatedCart = {
                ...prevCart,
                products: prevCart.products.map((p) =>
                    p.id === id ? { ...p, quantity: p.quantity + quantityChange } : p
                ),
            }

            // Update localStorage
            localStorage.setItem(LocalStorage.Cart, JSON.stringify(updatedCart))
            return updatedCart
        })
    }

    const clearCart = () => {
        setCart({ products: [] })
        localStorage.removeItem(LocalStorage.Cart)
    }

    return (
        <CartContext.Provider
            value={{ cart, addProduct, removeProduct, updateProductQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
