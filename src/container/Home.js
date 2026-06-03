import React,{
useEffect,
useState
} from "react";

import {
Route,
Routes,
Navigate,
useLocation
} from "react-router-dom";

import Header from "../components/Header";

import Dashboard from "./Dashboard";
import Product from "./Product";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Success from "./Success";
import Profile from "../pages/Profile";
import Wishlist from "../pages/Wishlist";
import Login from "../pages/Login";
import EditProfile from "../pages/EditProfile";



import {
getProducts
} from "../services/ProductService";

export default function Home(){

const location=
useLocation();

const token=
localStorage.getItem(
"token"
);

const [search,setSearch]=
useState("");

const [products,setProducts]=
useState([]);

const [loading,setLoading]=
useState(true);

const [
singleProductLoading,
setSingleProductLoading
]=useState(false);


useEffect(()=>{

if(location.pathname==="/"){

loadProducts();

}

},[location.pathname]);


const loadProducts=
async()=>{

setLoading(true);

try{

const data=
await getProducts();

setTimeout(()=>{

setProducts(data);

setLoading(false);

},1000);

}

catch(error){

console.log(error);

setLoading(false);

}

};


return(

<div>

{
location.pathname!=="/login"
&& token && (

<Header
search={search}
setSearch={setSearch}
/>

)
}

<Routes>

<Route
path="/login"
element={
token
?
<Navigate to="/"/>
:
<Login/>
}
/>
<Route
path="/login"
element={<Login/>}
/>
<Route
path="/edit-profile"
element={<EditProfile/>}
/>

<Route
path="/"
element={
token
?
<Dashboard
products={products}
search={search}
loading={loading}
singleProductLoading={
singleProductLoading
}
setSingleProductLoading={
setSingleProductLoading
}
/>
:
<Navigate to="/login"/>
}
/>



<Route
path="/product/:id"
element={
<Product/>
}
/>

<Route
path="/cart"
element={
<Cart/>
}
/>

<Route
path="/checkout"
element={
<Checkout/>
}
/>

<Route
path="/success"
element={
<Success/>
}
/>

<Route
path="/profile"
element={
<Profile/>
}
/>
<Route
path="/wishlist"
element={<Wishlist/>}
/>

</Routes>

</div>

);

}