import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {

const navigate = useNavigate();

const wishlistItems =
useSelector(
(state)=>state.wishlist.list
);

return (

<div className="container mt-4">

{/* Back Button */}
<button
className="btn btn-secondary mb-3"
onClick={()=>navigate(-1)}
>
← Back
</button>

<h2 className="mb-4">
❤️ My Wishlist
</h2>

{
wishlistItems.length===0
?

(
<h4>
No products in wishlist
</h4>
)

:

(
<div className="row">

{
wishlistItems.map((item)=>(

<div
className="col-md-3"
key={item.id}
>

<div
className="card p-3 mb-3 text-center"
>

<img
src={item.image}
alt={item.title}
style={{
height:"150px",
objectFit:"contain"
}}
/>

<h6 className="mt-3">
{item.title}
</h6>

<h5>
₹ {item.price}
</h5>

<p>
{item.category}
</p>

</div>

</div>

))

}

</div>

)

}

</div>

);

}