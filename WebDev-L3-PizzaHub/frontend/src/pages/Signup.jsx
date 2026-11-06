import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone:"",
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
      
       toast.error("Password do not match");
      return;
    }

    try {
      const response = await api.post("/auth/register", formData);
      // console.log(response);

      toast.success(response.data.message);
      navigate("/verify-email", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      console.log("Signup Error:", error.response?.data);
    }

    // console.log(formData);
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <form
        onSubmit={submitHandler}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg "
      >
        <h2 className="font-bold text-2xl text-[#1F1F1F] text-center mb-6 ">
          Sign Up
        </h2>

        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-[#6B7280] font-medium mb-1"
          >
            Name :{" "}
          </label>
          <input
            type="text"
            placeholder="Please Enter Your Name:"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-[#6B7280] font-medium mb-1"
          >
            Email :{" "}
          </label>
          <input
            type="email"
            placeholder="Please Enter Your Email:"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-[#6B7280] font-medium mb-1"
          >
            Mobile No :{" "}
          </label>
          <input
            type="text"
            placeholder="Please Enter Your Mobile No :"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-[#6B7280] font-medium mb-1"
          >
            Password :{" "}
          </label>
          <input
            type="password"
            placeholder="Please Enter Your Password :"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-[#6B7280] font-medium mb-1"
          >
            Confirm Password :{" "}
          </label>
          <input
            type="password"
            placeholder="Please Enter Your Confirm_Password:"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#E63946] text-white py-2 rounded-lg font-semibold hover:bg-[#C1121F] transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
