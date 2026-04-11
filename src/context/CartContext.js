import React, { createContext, useContext, useReducer, useMemo } from 'react';

const ADD_ITEM    = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const INCREMENT   = 'INCREMENT';
const DECREMENT   = 'DECREMENT';
const CLEAR_CART  = 'CLEAR_CART';

function cartReducer(state, action) {
  switch (action.type) {

    case ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === product.id
              ? { ...i, quantity: parseFloat((i.quantity + quantity).toFixed(2)) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...product, quantity }],
      };
    }

    case REMOVE_ITEM:
      return { ...state, items: state.items.filter((i) => i.id !== action.payload) };

    case INCREMENT:
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload
            ? { ...i, quantity: parseFloat((i.quantity + 1).toFixed(2)) }
            : i
        ),
      };

    case DECREMENT:
      return {
        ...state,
        items: state.items
          .map((i) =>
            i.id === action.payload
              ? { ...i, quantity: parseFloat((i.quantity - 1).toFixed(2)) }
              : i
          )
          .filter((i) => i.quantity > 0),
      };

    case CLEAR_CART:
      return { ...state, items: [] };

    default:
      return state;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const totalPrice = useMemo(
    () => parseFloat(
      state.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
    ),
    [state.items]
  );

  // quantity: cuántas unidades/kilos agregar (default 1)
  const addItem     = (product, quantity = 1) => dispatch({ type: ADD_ITEM, payload: { product, quantity } });
  const removeItem  = (id) => dispatch({ type: REMOVE_ITEM, payload: id });
  const increment   = (id) => dispatch({ type: INCREMENT, payload: id });
  const decrement   = (id) => dispatch({ type: DECREMENT, payload: id });
  const clearCart   = ()   => dispatch({ type: CLEAR_CART });

  return (
    <CartContext.Provider value={{
      items: state.items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      increment,
      decrement,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}