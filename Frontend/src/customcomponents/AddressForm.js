import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { supabase } from "../services/supabase";
import CountriesDropdown from "./CountriesDropdown";
import StatesDropdown from "./StatesDropdown";
import { addressSchema } from "../validations/formSchemas";

export default function AddressForm({ mode = "add", addressId, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      address_type: "Home",
      is_default: false,
    },
  });

  useEffect(() => {
    if (mode === "edit" && addressId) {
      const fetchAddress = async () => {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("id", addressId)
          .single();

        if (error || !data) {
          alert("Address not found");
          if (onSaved) onSaved();
          return;
        }

        reset({
          full_name: data.full_name || "",
          phone: data.phone || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          country: data.country || "",
          address_type: data.address_type || "Home",
          is_default: data.is_default || false,
        });

        setFetching(false);
      };

      fetchAddress();
    }
  }, [mode, addressId, reset, onSaved]);

  const onSubmit = async (data) => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    if (data.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .neq("id", addressId || "");
    }

    let error;

    if (mode === "edit" && addressId) {
      const result = await supabase
        .from("addresses")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          address_line1: data.address_line1,
          address_line2: data.address_line2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country,
          address_type: data.address_type,
          is_default: data.is_default,
        })
        .eq("id", addressId);
      error = result.error;
    } else {
      const result = await supabase.from("addresses").insert({
        user_id: user.id,
        full_name: data.full_name,
        phone: data.phone,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        address_type: data.address_type,
        is_default: data.is_default,
      });
      error = result.error;
    }

    if (error) {
      alert(error.message);
    } else {
      if (onSaved) onSaved();
    }

    setLoading(false);
  };

  if (fetching) {
    return <div className="text-center py-3">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className={`form-control ${errors.full_name ? "is-invalid" : ""}`}
          {...register("full_name")}
        />
        {errors.full_name && (
          <div className="invalid-feedback">{errors.full_name.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Phone</label>
        <input
          type="text"
          className={`form-control ${errors.phone ? "is-invalid" : ""}`}
          {...register("phone")}
        />
        {errors.phone && (
          <div className="invalid-feedback">{errors.phone.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Address Line 1</label>
        <input
          type="text"
          className={`form-control ${errors.address_line1 ? "is-invalid" : ""}`}
          {...register("address_line1")}
        />
        {errors.address_line1 && (
          <div className="invalid-feedback">{errors.address_line1.message}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Address Line 2 (Optional)</label>
        <input type="text" className="form-control" {...register("address_line2")} />
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">City</label>
          <input
            type="text"
            className={`form-control ${errors.city ? "is-invalid" : ""}`}
            {...register("city")}
          />
          {errors.city && (
            <div className="invalid-feedback">{errors.city.message}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">State</label>
          <StatesDropdown
            name="state"
            value={watch("state")}
            onChange={(e) => setValue("state", e.target.value, { shouldValidate: true })}
            error={errors.state}
            className={`form-select ${errors.state ? "is-invalid" : ""}`}
          />
          {errors.state && (
            <div className="invalid-feedback">{errors.state.message}</div>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Pincode</label>
          <input
            type="text"
            className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
            {...register("pincode")}
          />
          {errors.pincode && (
            <div className="invalid-feedback">{errors.pincode.message}</div>
          )}
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Country</label>
          <CountriesDropdown
            name="country"
            value={watch("country")}
            onChange={(e) => setValue("country", e.target.value, { shouldValidate: true })}
            error={errors.country}
            className={`form-select ${errors.country ? "is-invalid" : ""}`}
          />
          {errors.country && (
            <div className="invalid-feedback">{errors.country.message}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Address Type</label>
        <select
          className={`form-select ${errors.address_type ? "is-invalid" : ""}`}
          {...register("address_type")}
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Other">Other</option>
        </select>
        {errors.address_type && (
          <div className="invalid-feedback">{errors.address_type.message}</div>
        )}
      </div>

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="isDefault"
          {...register("is_default")}
        />
        <label className="form-check-label" htmlFor="isDefault">
          Set as Default Address
        </label>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading
          ? mode === "edit"
            ? "Updating..."
            : "Saving..."
          : mode === "edit"
            ? "Update Address"
            : "Save Address"}
      </button>
    </form>
  );
}
