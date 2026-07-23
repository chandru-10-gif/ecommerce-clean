import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../container/BackButton";
import { Icon } from "@iconify/react";
import { supabase } from "../services/supabase";

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("name, email, role")
        .eq("id", user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setEmail(data.email || user.email);
        setRole(data.role || "User");
      }
    };

    fetchProfile();
  }, [navigate]);

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

      <h3 className="mt-3">{name}</h3>
      <p className="text-muted">Logged in with: {name}</p>
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
