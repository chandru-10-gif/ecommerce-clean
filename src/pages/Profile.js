import React from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {

const navigate =
useNavigate();

return (

<div className="container mt-4">

<div
className="card p-4 position-relative"
>

<button
className="btn btn-secondary position-absolute"
style={{
top:"10px",
left:"10px"
}}
onClick={() => navigate(-1)}
>
← Back
</button>

<div className="text-center">

<img
src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
alt="profile"
style={{
width:"100px",
height:"100px",
borderRadius:"50%"
}}
/>

<h3 className="mt-3">
Chantru
</h3>

<p>
chantru@gmail.com
</p>

</div>

<hr/>

<div className="d-flex flex-column align-items-center">

<button
className="btn btn-warning mb-2"
onClick={() =>
navigate("/edit-profile")
}
>
✏️ Edit Profile
</button>

<button
className="btn btn-primary"
onClick={() => {

localStorage.removeItem("token");

navigate("/login");

}}
>
➕ Add Another Account
</button>

</div>

</div>

</div>

);

}