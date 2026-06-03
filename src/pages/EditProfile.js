import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {

const navigate =
useNavigate();

const [name,setName] =
useState("Chantru");

const [email,setEmail] =
useState("chantru@gmail.com");

const handleSave = () => {

alert("Profile Updated Successfully");

navigate("/profile");

};

return (

<div className="container mt-4">

<div
className="card p-4 mx-auto"
style={{
maxWidth:"500px"
}}
>

<h3 className="text-center mb-4">
✏️ Edit Profile
</h3>

<label>
Name
</label>

<input
type="text"
className="form-control mb-3"
value={name}
onChange={(e)=>
setName(e.target.value)
}
/>

<label>
Email
</label>

<input
type="email"
className="form-control mb-3"
value={email}
onChange={(e)=>
setEmail(e.target.value)
}
/>

<div className="d-flex justify-content-between">

<button
className="btn btn-secondary"
onClick={() =>
navigate("/profile")
}
>
Cancel
</button>

<button
className="btn btn-success"
onClick={handleSave}
>
Save
</button>

</div>

</div>

</div>

);

}