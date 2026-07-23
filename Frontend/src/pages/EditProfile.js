import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../container/BackButton";
import { supabase } from "../services/supabase";
import { Icon } from "@iconify/react";
import ProfileForm from "../customcomponents/ProfileForm";
import AddressCard from "../customcomponents/AddressCard";
import AddressModal from "../customcomponents/AddressModal";


export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {

  if (location.state?.openAddress) {
    setShowModal(true);
  }

}, [location]);

  const fetchAddresses = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setAddresses(data || []);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
   const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  navigate("/login");
  return;
}
      

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setProfile({
        name: data.name || "",
        phone: data.phone || "",
        email: data.email || user.email,
      });

      fetchAddresses();
    };

    fetchProfile();
  }, [navigate, fetchAddresses]);

  const handleProfileSubmit = async (data) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({ name: data.name, phone: data.phone })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
    } else {
      alert("Profile updated successfully");
      navigate("/profile");
    }

    setLoading(false);
  };
  const [resetLoading, setResetLoading] = useState(false);

  
const handleForgotPassword = async () => {

  if (!profile.email) {
    alert("Email not found");
    return;
  }

  setResetLoading(true);

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      profile.email.trim(),
      {
        redirectTo:`${window.location.origin}/reset-password`,
      }
    );


  setResetLoading(false);


  if(error){
    console.log(error);
    alert(error.message);
  }
  else{
    alert("Password reset link sent");
  }
};
  const handleEditAddress = (address) => {
    navigate(`/edit-address/${address.id}`);
  };

 const handleSetDefault = async (id) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;


  // Remove existing default address
  const { error: removeError } = await supabase
    .from("addresses")
    .update({
      is_default: false,
    })
    .eq("user_id", user.id);


  if (removeError) {
    alert(removeError.message);
    return;
  }


  // Set selected address as default
  const { error } = await supabase
    .from("addresses")
    .update({
      is_default: true,
    })
    .eq("id", id);


  if (error) {
    alert(error.message);
  } else {
    fetchAddresses();
  }
};

  const handleDeleteAddress = async (id) => {
    const ok = window.confirm("Delete this address?");
    if (!ok) return;

    const { error } = await supabase.from("addresses").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      fetchAddresses();
    }
  };

  const handleAddressSaved = () => {
    setShowModal(false);
    fetchAddresses();
  };
  

  return (
    <div className="container mt-4">
      <BackButton />

      <div className="row mt-3">
        {/* LEFT SIDE - Profile Form */}
        <div className="col-lg-6 mb-3">
          <div className="card shadow h-100">
            <div className="card-body">
              <h3 className="text-center mb-4">
                <Icon icon="mdi:account-edit" /> Edit Profile
              </h3>

              <ProfileForm
                initialValues={profile}
                onSubmit={handleProfileSubmit}
                loading={loading}
              />
<button
 className="btn btn-warning w-100 mt-3"
 onClick={handleForgotPassword}
 disabled={resetLoading}
>
{
 resetLoading 
 ? "Sending..."
 : "Forgot Password"
}
</button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Addresses */}
        <div className="col-lg-6">
          <div className="card shadow h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">My Addresses</h4>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowModal(true)}
                >
                  + Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="alert alert-warning">No Address Found</div>
              ) : (
                addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={handleEditAddress}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDeleteAddress}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSaved={handleAddressSaved}
      />
    </div>
  );
}
