import { createSlice } from "@reduxjs/toolkit";

const Wishlist = createSlice({
  name: "wishlist",

  initialState: {
    list: []
  },

  reducers: {

    addWishlist: (state, action) => {

      const item = state.list.find(
        (el) => el.id === action.payload.id
      );

      if (!item) {
        state.list.push(action.payload);
      }

    },

    removeWishlist: (state, action) => {

      state.list = state.list.filter(
        (el) => el.id !== action.payload
      );

    }

  }
});

export const {
  addWishlist,
  removeWishlist
} = Wishlist.actions;

export default Wishlist.reducer;