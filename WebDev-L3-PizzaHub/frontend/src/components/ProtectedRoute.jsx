import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useSelector((state) => state.auth);

 console.log("Protected Token:", token);

 if(loading){
      return <div>Loading...</div>;
 }

if (token) {
  console.log("ACCESS GRANTED");
  return children;
}

console.log("REDIRECT LOGIN");
return <Navigate to="/login" />;
}