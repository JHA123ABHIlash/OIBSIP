import React, { useState } from "react";
import api from '../services/api'
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate=useNavigate();

  async function submitHandler(e){
    e.preventDefault();

    try {
      const res=await api.post('/auth/forgot-password',{email});

    toast.success(res.data.message);
    console.log(res.data.message);

    navigate('/login');

    } catch (error) {
      toast.error(error.response?.data?.message || "Error in Forgot Password");
      console.log("Error in Forgot Password", error.response?.data);
    }

  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">

      <form
        onSubmit={submitHandler}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg "
      >

        <h2 className="font-bold text-2xl text-[#1F1F1F] text-center mb-6 ">
          Please Enter Your Email.
        </h2>

        <input
          type="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          placeholder="Please Enter Your Email"
          required
          className="w-full mb-6 border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
        />
        
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
