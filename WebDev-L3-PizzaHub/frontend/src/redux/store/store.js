
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../slices/authSlice";
import cartSlice from "../slices/cartSlice";

const cartPersistenceMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  if (action.type.startsWith("cart/")) {
    const cart = storeAPI.getState().cart.cart;

    const serializableCart = cart.map((item) => ({
      cartItemId: item.cartItemId,
      pizzaId: item.pizzaId,
      name: item.name,
      image: item.image,
      base: item.base,
      sauce: item.sauce,
      cheese: item.cheese,
      vegetable: item.vegetable,
      price: item.price,
      quantity: item.quantity,
    }));

    localStorage.setItem("cart", JSON.stringify(serializableCart));
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cartPersistenceMiddleware),
});
