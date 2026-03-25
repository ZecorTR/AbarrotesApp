import React, { createContext, useContext, useReducer, useMemo } from 'react';

// ─── Actions ────────────────────────────────────────────────────────────────
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';
const CLEAR_CART = 'CLEAR_CART';

// ─── Reducer ────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM: {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case REMOVE_ITEM:
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
    case INCREMENT:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case DECREMENT:
      return {
        ...state,
        items: state.items
          .map((i) => (i.id === action.payload ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0),
      };
    case CLEAR_CART:
      return { ...state, items: [] };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const totalPrice = useMemo(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items]
  );

  const addItem = (product) => dispatch({ type: ADD_ITEM, payload: product });
  const removeItem = (id) => dispatch({ type: REMOVE_ITEM, payload: id });
  const increment = (id) => dispatch({ type: INCREMENT, payload: id });
  const decrement = (id) => dispatch({ type: DECREMENT, payload: id });
  const clearCart = () => dispatch({ type: CLEAR_CART });

  return (
    <CartContext.Provider
      value={{ items: state.items, totalItems, totalPrice, addItem, removeItem, increment, decrement, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
