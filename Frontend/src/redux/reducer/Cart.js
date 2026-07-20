import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    list: [],
  },

  reducers: {

    // 👇 PUT IT HERE
    addItem: (state, { payload }) => {
      const existing = state.list.find((item) => item.id === payload.id);

      if (existing) {
        existing.count += 1;
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