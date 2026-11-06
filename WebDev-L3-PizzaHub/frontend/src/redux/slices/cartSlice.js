import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: JSON.parse(localStorage.getItem("cart")) || [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;

      // Same pizza customization already in cart?
      const existingItem = state.cart.find(
        (item) => item.cartItemId === newItem.cartItemId
      );

      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1;
       
      } else {
        state.cart.push({
          ...newItem,
          quantity: newItem.quantity || 1,
        });
      }
      // localStorage.setItem("cart", JSON.stringify(state.cart));
    },

    increaseQuantity(state, action) {
      const item = state.cart.find(
        (item) => item.cartItemId === action.payload
      );

      if (item) {
        item.quantity += 1;
        // localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    decreaseQuantity(state, action) {
      const item = state.cart.find(
        (item) => item.cartItemId === action.payload
      );

      if (item && item.quantity > 1) {
        item.quantity -= 1;
        // localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    removeFromCart(state, action) {
      state.cart = state.cart.filter(
        (item) => item.cartItemId !== action.payload
        
      );
      // localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    clearCart(state) {
  state.cart = [];
}
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
   clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
