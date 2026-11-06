import React, { useState } from "react";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", formData);

      const user = res.data.user;
      const token = res.data.token;

      dispatch(setUser(user));
      dispatch(setToken(token));
      localStorage.setItem("token", token);

      toast.success(res.data.message);

      const role = user.role;

      // console.log("Logged-in User:", user);
      // console.log("User Role:", user?.role);

      if (role === "Admin") {
        navigate("/admin", { replace: true });
      } else if (role === "DeliveryAgent") {
        navigate("/delivery-agent", { replace: true });
      } else if (role === "User") {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      console.log(error.response?.data?.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg "
      >
        <h2 className="font-bold text-2xl text-[#1F1F1F] text-center mb-6 ">
          Login
        </h2>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-[#6B7280] font-medium mb-1"
          >
            Email :{" "}
          </label>
          <input
            type="email"
            placeholder="Please Enter Your Email."
            id="email"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            placeholder="Please Enter Your Password."
            id="password"
            name="password"
            value={formData.password}
            required
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <button className="w-full bg-[#E63946] text-white py-2 rounded-lg font-semibold hover:bg-[#C1121F] transition">
          Login
        </button>
        <Link to="/forgot-password">Forgot Password?</Link>
      </form>
    </div>
  );
}
