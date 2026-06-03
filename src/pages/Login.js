import React, { useState } from "react";
import { loginUser } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import loginImage from "../image/3230.jpg";

export default function Login() {

const [username, setUsername] =
useState("");

const [password, setPassword] =
useState("");

const [loading, setLoading] =
useState(false);

const navigate =
useNavigate();

const handleLogin =
async () => {

if(
!username ||
!password
){

alert(
"Please enter username and password"
);

return;

}

setLoading(true);

try {

const data =
await loginUser(
username,
password
);

localStorage.setItem(
"token",
data.accessToken
);



navigate("/");

}
catch(error){



}
finally{

setLoading(false);

}

};

return(

<div
className="d-flex justify-content-center align-items-center"
style={{
minHeight:"100vh",
backgroundColor:"#f5f5f5"
}}
>

<div
className="card shadow p-4"
style={{
width:"350px",
borderRadius:"15px"
}}
>
    <img
src={loginImage}
alt="Login"
className="img-fluid"
style={{
height:"180px",
width:"100%",
objectFit:"cover",
borderRadius:"10px",
marginBottom:"15px"
}}
/>

<h2
className="text-center mb-4"
>
Login
</h2>

<input
type="text"
placeholder="Username"
className="form-control mb-3"
value={username}
onChange={(e)=>
setUsername(
e.target.value
)
}
/>

<input
type="password"
placeholder="Password"
className="form-control mb-3"
value={password}
onChange={(e)=>
setPassword(
e.target.value
)
}
/>

<button
className="btn btn-primary w-100"
onClick={handleLogin}
disabled={loading}
>

{
loading
?
"Loading..."
:
"Login"
}

</button>

<div
className="mt-4 text-center"
style={{
fontSize:"14px",
color:"gray"
}}
>



</div>

</div>

</div>

);

}