import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast';


export default function ResetPassword() {
  const { token } = useParams();
  const [formData,setFormData]=useState({password:"",confirmPassword:""});
  const navigate=useNavigate();


  function handleChange(e){
    const {name,value}=e.target;
    setFormData((prev)=>({...prev,[name]:value}))
  }

  async function handleSubmit(e){
   try {
     e.preventDefault();
    const res=await api.post(`/auth/reset-password/${token}`,formData);
    toast.success(res.data.message);

    navigate('/login')

   } catch (error) {
     toast.error(error.response?.data?.message || "Reset Password failed");
      console.log("Reset Password Error:", error.response?.data);
   }
  }
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <form 
      onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg ">

          <h2 className="font-bold text-2xl text-[#1F1F1F] text-center mb-6 ">
          Please Reset Your Password.
        </h2>


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
  )
}
