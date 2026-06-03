import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducer/Cart";
import wishlistReducer from "./reducer/Wishlist";


// Load Cart
const loadCart = () => {

  try{

    const data =
    localStorage.getItem("cart");

    return data
    ? JSON.parse(data)
    : [];

  }
  catch{

    return [];

  }

};


// Load Wishlist
const loadWishlist = () => {

  try{

    const data =
    localStorage.getItem(
      "wishlist"
    );

    return data
    ? JSON.parse(data)
    : [];

  }
  catch{

    return [];

  }

};


const store = configureStore({

  reducer: {

    cart: cartReducer,

    wishlist:
    wishlistReducer

  },

  preloadedState: {

    cart: {

      list: loadCart()

    },

    wishlist: {

      list: loadWishlist()

    }

  }

});


// Save to localStorage
store.subscribe(()=>{

localStorage.setItem(

"cart",

JSON.stringify(
store.getState().cart.list
)

);

localStorage.setItem(

"wishlist",

JSON.stringify(
store.getState().wishlist.list
)

);

});

export default store;