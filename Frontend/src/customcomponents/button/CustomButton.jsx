import React from "react";
import "./customButton.css";

export default function CustomButton({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "primary",
  disabled = false,
}) {

  const variants = {
    primary: "primary",
    danger: "danger",
    warning: "warning",
    success: "success",
    dark: "dark",
    light: "light",
  };


  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-btn ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}