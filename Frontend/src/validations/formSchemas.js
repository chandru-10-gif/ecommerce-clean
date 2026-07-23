import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .matches(/^[A-Za-z\s]{2,}$/, "Enter a valid name (letters only, min 2 characters)"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: yup
    .string()
    .required("Address is required")
    .min(5, "Enter a valid address (min 5 characters)"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .matches(/^[A-Za-z\s]{2,}$/, "Enter a valid name (letters only, min 2 characters)"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

export const addressSchema = yup.object().shape({
  full_name: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address_line1: yup
    .string()
    .required("Address line 1 is required"),
  address_line2: yup
    .string()
    .default(""),
  city: yup
    .string()
    .required("City is required"),
  state: yup
    .string()
    .required("State is required"),
  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  country: yup
    .string()
    .required("Country is required"),
  address_type: yup
    .string()
    .oneOf(["Home", "Work", "Other"], "Select a valid address type")
    .required("Address type is required"),
  is_default: yup.boolean().default(false),
});

export const otpSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
  token: yup
    .string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be 6 digits"),
});

export const vendorRegisterSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .matches(/^[A-Za-z\s]{2,}$/, "Enter a valid name (letters only, min 2 characters)"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  address: yup
    .string()
    .required("Address is required")
    .min(5, "Enter a valid address (min 5 characters)"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  shop_name: yup
    .string()
    .required("Shop name is required")
    .min(2, "Shop name must be at least 2 characters"),
  shop_description: yup
    .string()
    .default(""),
});

export const productSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be greater than 0"),
  category: yup
    .string()
    .required("Category is required"),
  description: yup
    .string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .min(0, "Stock cannot be negative")
    .integer("Stock must be a whole number"),
  offer_price: yup
    .number()
    .typeError("Offer price must be a number")
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
  is_offer: yup.boolean().default(false),
});
