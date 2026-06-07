import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../container/BackButton";
import { Icon } from "@iconify/react";

export default function EditProfile() {
  const navigate = useNavigate();

  const [name, setName] = useState("Chantru");
  const [email, setEmail] = useState("chantru@gmail.com");

  const handleSave = () => {
    alert("Profile Updated Successfully!");
    navigate("/profile");
  };

  return (
    <div className="container mt-4">
      
      <BackButton />


      {/* Edit Profile Card */}
      <div
        className="card p-4 mx-auto shadow"
        style={{ maxWidth: "500px" }}
      >
        <h3 className="text-center mb-4">
          <Icon icon="mdi:pencil" /> Edit Profile
        </h3>

        <div className="mb-3">
          <label className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        <div className="d-flex justify-content-between">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>

          <button
            className="btn btn-success"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}