import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../container/BackButton";
import { Icon } from "@iconify/react";

export default function Profile() {
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const userCode = localStorage.getItem("user_code");

  return (
    <div className="container mt-4 text-center">

      <BackButton />

      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        alt="profile"
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          marginTop: "10px",
        }}
      />

      <h3 className="mt-3">{userCode}</h3>
      <p>{email}</p>
      <p>
        <strong>Role:</strong> {role}
      </p>

     <div className="d-flex flex-column align-items-center mt-4">

  <button
    className="btn btn-warning mb-2"
    onClick={() => navigate("/edit-profile")}
  >
    <Icon icon="mdi:pencil" width="18" /> Edit Profile
  </button>

 

  
</div>
    </div>
  );
}