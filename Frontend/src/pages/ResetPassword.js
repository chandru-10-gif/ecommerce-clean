import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";


export default function ResetPassword(){

  const navigate = useNavigate();

  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);



  const handleUpdatePassword = async()=>{


    if(!password){

      alert("Enter new password");
      return;

    }


    setLoading(true);



    const {
      error
    } = await supabase.auth.updateUser({

      password:password

    });



    if(error){

      alert(error.message);

    }
    else{

      alert("Password updated successfully");

      navigate("/login");

    }


    setLoading(false);


  };





  return (

    <div className="container mt-5">


      <div
      className="card p-4 shadow mx-auto"
      style={{
        maxWidth:"400px"
      }}
      >


      <h3 className="text-center mb-4">
        Reset Password
      </h3>



      <input

      type="password"

      className="form-control mb-3"

      placeholder="Enter new password"

      value={password}

      onChange={(e)=>setPassword(e.target.value)}

      />




      <button

      className="btn btn-success w-100"

      onClick={handleUpdatePassword}

      disabled={loading}

      >

      {
        loading
        ?
        "Updating..."
        :
        "Update Password"
      }

      </button>


      </div>


    </div>

  );

}