import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

export default function BackButton(){

  const navigate = useNavigate();

  return (
    <button
      className="back-btn"
      onClick={()=>navigate(-1)}
    >
      <Icon 
        icon="mdi:arrow-left"
        width="18"
      />
      Back
    </button>
  );
}