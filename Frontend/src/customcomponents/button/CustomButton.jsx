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
  const baseStyle =
    "px-3 py-2 rounded fw-semibold border-0";

  const variants = {
    primary: "btn btn-primary",
    danger: "btn btn-danger",
    warning: "btn btn-warning",
    success: "btn btn-success",
    dark: "btn btn-dark",
    light: "btn btn-light border",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}