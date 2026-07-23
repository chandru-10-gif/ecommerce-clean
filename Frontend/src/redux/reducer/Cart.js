import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    list: [],
  },

  reducers: {

    addItem: (state, { payload }) => {
      const existing = state.list.find((item) => item.id === payload.id);

      if (existing) {
        existing.count += 1;
        existing.price = payload.price;
        if (payload.original_price) existing.original_price = payload.original_price;
        if (payload.is_offer) existing.is_offer = payload.is_offer;
        if (payload.offer_price) existing.offer_price = payload.offer_price;
      } else {
        state.list.push({ ...payload, count: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(state.list));
    },

    modifyItem: (state, { payload }) => {
      state.list = state.list.map((item) =>
        item.id === payload.id ? payload : item
      );

      localStorage.setItem("cart", JSON.stringify(state.list));
    },

    removeitem: (state, { payload }) => {
      state.list = state.list.filter((item) => item.id !== payload.id);

      localStorage.setItem("cart", JSON.stringify(state.list));
    },

  },
});

export const { addItem, modifyItem, removeitem } = cartSlice.actions;
export default cartSlice.reducer;