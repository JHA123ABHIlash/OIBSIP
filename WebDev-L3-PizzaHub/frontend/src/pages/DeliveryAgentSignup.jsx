
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function DeliveryAgentSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function submitHandler(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await api.post(
        "/auth/register-delivery-agent",
        formData
      );

      toast.success(response.data.message);

      navigate("/verify-email", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Delivery agent signup failed"
      );
      console.log("Delivery Agent Signup Error:", error.response?.data);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <form
        onSubmit={submitHandler}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg"
      >
        <h2 className="font-bold text-2xl text-[#1F1F1F] text-center mb-2">
          Delivery Agent Registration
        </h2>

        <p className="text-sm text-[#6B7280] text-center mb-6">
          Register to manage and deliver orders.
        </p>

        {[
          {
            label: "Name",
            name: "name",
            type: "text",
            placeholder: "Enter your full name",
          },
          {
            label: "Email",
            name: "email",
            type: "email",
            placeholder: "Enter your email",
          },
          {
            label: "Phone",
            name: "phone",
            type: "number",
            placeholder: "Enter your Phone No: ",
          },
          {
            label: "Password",
            name: "password",
            type: "password",
            placeholder: "Enter your password",
          },
          {
            label: "Confirm Password",
            name: "confirmPassword",
            type: "password",
            placeholder: "Confirm your password",
          },
        ].map((field) => (
          <div className="mb-4" key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-[#6B7280] font-medium mb-1"
            >
              {field.label}:
            </label>

            <input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              required
              autoComplete={
                field.name === "password"
                  ? "new-password"
                  : field.name === "confirmPassword"
                  ? "new-password"
                  : field.name === "email"
                  ? "email"
                  : "name"
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-[#E63946] text-white py-2 rounded-lg font-semibold hover:bg-[#C1121F] transition"
        >
          Register as Delivery Agent
        </button>

        <p className="text-center text-sm text-[#6B7280] mt-4">
          Already registered?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#E63946] font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}