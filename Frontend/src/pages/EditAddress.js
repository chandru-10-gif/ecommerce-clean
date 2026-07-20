import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../container/BackButton";
import { Icon } from "@iconify/react";
import AddressForm from "../customcomponents/AddressForm";

export default function EditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSaved = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="container mt-4">
      <BackButton />

      <div className="card p-4 shadow mx-auto" style={{ maxWidth: "600px" }}>
        <h3 className="text-center mb-4">Edit Address</h3>

        <AddressForm mode="edit" addressId={id} onSaved={handleSaved} />

        <button
          className="btn btn-info mt-3"
          onClick={() => navigate("/edit-profile")}
        >
          <Icon icon="mdi:map-marker" width="18" /> Back to Profile
        </button>
      </div>
    </div>
  );
}
