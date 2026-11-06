import React, { useState } from "react";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate=useNavigate();

  // get email from signup.
  const email = location?.state?.email;

  function changeHandler(e) {
    
    setOtp(e.target.value);
  }

  async function resendOTPHandler() {
    try {
      const res = await api.post("/auth/resendOTP", { email });
      console.log('Resend Otp Response',res);

    } catch (err) {
      console.log("Resend Otp Error",err.message);
    }
  }

  

  async function submitHandler(e) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/verify-email", {
        email,
        otp,
      });
      console.log("Submit Otp Response",res);

      navigate("/login")

    } catch (error) {
      console.log('Submit OTP Error',error.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
      <form onSubmit={submitHandler} className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg ">
        <h1 className="font-bold text-2xl text-[#1F1F1F] mb-6 text-center">
          Verify Your Email
        </h1>

        <div className="m-8">
          <input
            type="text"
            maxLength={6}
            inputMode="numeric"
            required
            value={otp}
            onChange={changeHandler}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#E63946]"
          />
        </div>

        <div className="flex ">
          <button
            type="submit"
            className="w-1/2 mr-4 bg-[#E63946] text-white py-2 rounded-lg font-semibold hover:bg-[#C1121F] transition"
          >
            Verify OTP
          </button>
          <button type="button" onClick={resendOTPHandler} className="w-1/2 bg-[#E63946]  text-white py-2 rounded-lg font-semibold hover:bg-[#C1121F] transition">
            Resend OTP
          </button>
        </div>
      </form>
    </div>
  );
}
