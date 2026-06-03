import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/AuthService";

export default function Header({
  search = "",
  setSearch = () => {}
}) {

const navigate = useNavigate();

const [showMenu, setShowMenu] =
useState(false);

const handleLogout = () => {

logoutUser();

navigate("/login");

window.location.reload();

};

return (

<div className="p-3 bg-info">

<h3>Online Shopping</h3>

<div className="row justify-content-center pt-2 pb-2">

<div
className="col-sm-12 col-md-7 col-lg-6 col-xl-5 d-flex align-items-center"
>

<button
className="btn btn-success me-3"
onClick={() => navigate("/")}
>
Home
</button>

<input
className="form-control"
type="search"
placeholder="Search Here..."
value={search}
onChange={(e)=>
setSearch(e.target.value)
}
/>

<button
className="btn btn-success ms-3"
onClick={() => navigate("/cart")}
>
Cart
</button>

<div
className="ms-3"
style={{
position:"relative"
}}
>

<img
src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
alt="profile"
onClick={()=>
setShowMenu(!showMenu)
}
style={{
width:"45px",
height:"45px",
borderRadius:"50%",
cursor:"pointer"
}}
/>

{
showMenu && (

<div
style={{
position:"absolute",
top:"55px",
right:"0",
width:"220px",
background:"white",
borderRadius:"10px",
boxShadow:"0px 3px 10px rgba(0,0,0,0.3)",
padding:"10px",
zIndex:"1000"
}}
>

<div
className="p-2"
style={{cursor:"pointer"}}
onClick={()=>{
navigate("/profile");
setShowMenu(false);
}}
>
👤 My Profile
</div>

<hr/>

<div
className="p-2"
style={{cursor:"pointer"}}
onClick={()=>{
navigate("/wishlist");
setShowMenu(false);
}}
>
❤️ Wishlist
</div>

<hr/>

<div
className="p-2"
style={{cursor:"pointer"}}
>
🎟 Coupons
</div>

<hr/>

<div
className="p-2"
style={{cursor:"pointer"}}
onClick={()=>{
navigate("/cart");
setShowMenu(false);
}}
>
🛒 Cart
</div>

<hr/>

<div
className="p-2"
style={{
cursor:"pointer",
color:"red"
}}
onClick={handleLogout}
>
🚪 Logout
</div>

</div>

)

}

</div>

</div>

</div>

</div>

);

}