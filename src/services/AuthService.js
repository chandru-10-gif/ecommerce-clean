import axios from "axios";

const AUTH_URL =
"https://dummyjson.com";

export const loginUser =
async(
username,
password
)=>{

try{

const response =
await axios.post(

`${AUTH_URL}/auth/login`,

{
username,
password,
expiresInMins:30
}

);

return response.data;

}
catch(error){

console.log(error);

throw error;

}

};


// Logout function
export const logoutUser = ()=>{

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);

};