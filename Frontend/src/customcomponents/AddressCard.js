import React from "react";

export default function AddressCard({ address, onEdit, onSetDefault, onDelete }) {
  return (
    <div className="card address-card shadow-sm mb-3">
      <div className="card-body p-3">

        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-1 small-title">
            {address.address_type}
          </h6>

          {address.is_default && (
            <span className="badge bg-success small-badge">
              Default
            </span>
          )}
        </div>

        <hr className="my-2" />

        <p className="mb-1 small">
          <strong>{address.full_name}</strong>
        </p>

        <p className="mb-1 small">
          {address.phone}
        </p>

        <p className="mb-1 small">
          {address.address_line1}
        </p>

        {address.address_line2 && (
          <p className="mb-1 small">
            {address.address_line2}
          </p>
        )}

        <p className="mb-1 small">
          {address.city}, {address.state} - {address.pincode}
        </p>

        <p className="mb-2 small">
          {address.country}
        </p>


        <div className="d-flex gap-2">
          <button
            className="btn btn-warning btn-sm px-2 py-1"
            onClick={() => onEdit(address)}
          >
            Edit
          </button>


          {!address.is_default && (
            <button
              className="btn btn-outline-success btn-sm px-2 py-1"
              onClick={() => onSetDefault(address.id)}
            >
              Default
            </button>
          )}


          <button
            className="btn btn-danger btn-sm px-2 py-1"
            onClick={() => onDelete(address.id)}
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}