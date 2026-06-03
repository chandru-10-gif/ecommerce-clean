import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addWishlist } from "../redux/reducer/Wishlist";

export default function ProductCart(props) {

const dispatch =
useDispatch();

const navigate =
useNavigate();

const [wishlist,setWishlist] =
useState(false);

const singProductGet=()=>{

navigate(
`/product/${props.id}`
);

};

return(

<div
className="card m-2 p-3 text-center d-flex flex-column align-items-center position-relative"
style={{
width:"250px",
height:"420px",
cursor:"pointer",
transition:"all 0.3s ease"
}}

onClick={singProductGet}

onMouseEnter={(e)=>{

e.currentTarget.style.transform=
"scale(1.05)";

e.currentTarget.style.boxShadow=
"0 10px 20px rgba(0,0,0,0.2)";

}}

onMouseLeave={(e)=>{

e.currentTarget.style.transform=
"scale(1)";

e.currentTarget.style.boxShadow=
"none";

}}
>

{/* Wishlist Button */}

<button
onClick={(e)=>{

e.stopPropagation();

setWishlist(!wishlist);

dispatch(
addWishlist({
id:props.id,
title:props.title,
price:props.price,
image:props.image,
category:props.category
})
);

}}

style={{
position:"absolute",
top:"10px",
right:"10px",
border:"none",
background:"transparent",
fontSize:"28px",
cursor:"pointer"
}}
>

{
wishlist
?
"❤️"
:
"🤍"
}

</button>


<img
src={props.image}
alt={props.title}
style={{
width:"100%",
height:"180px",
objectFit:"contain"
}}
/>


<div
className="d-flex flex-column justify-content-center align-items-center flex-grow-1"
>

<h6 className="mt-3">
{props.title}
</h6>

<h5>
₹ {props.price}
</h5>

<p>
{props.category}
</p>

<button
className="btn btn-success mt-3"
onClick={(e)=>{

e.stopPropagation();

singProductGet();

}}
>
Available
</button>

</div>

</div>

);

}