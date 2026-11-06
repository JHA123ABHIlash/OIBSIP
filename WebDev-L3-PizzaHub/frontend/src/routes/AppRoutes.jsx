import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import Menu from "../pages/Menu";
import PizzaDetails from "../pages/PizzaDetails";
import BuildPizza from "../pages/BuildPizza";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/MyOrders";
import OrderDetails from "../pages/OrderDetails";
import AdminOrders from "../pages/AdminOrders";
import AdminRoute from "../pages/AdminRoute";
import AdminDashboard from "../pages/AdminDashboard";
import AdminInventory from "../pages/AdminInventory";
import AdminPizzas from "../pages/AdminPizzas";
import AdminUsers from "../pages/AdminUsers";
import AdminSettings from "../pages/AdminSettings";
import DeliveryAgentTracking from "../pages/DeliveryAgentTracking";
import DeliveryAgentSignup from "../pages/DeliveryAgentSignup";
import AssignDeliveryAgent from "../pages/AssignDeliveryAgent";
import Footer from "../components/Footer";

import { useLocation } from "react-router-dom";

export default function AppRoutes() {
  const location = useLocation();

  const hideFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/delivery-agent");

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/my-order" element={<MyOrders />} />

        <Route path="/my-order-details/:orderId" element={<OrderDetails />} />

        <Route path="/pizza/:pizzaId" element={<PizzaDetails />} />

        <Route path="/build-pizza/:pizzaId" element={<BuildPizza />} />

        <Route path="/build-pizza" element={<BuildPizza />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/delivery-agent/signup"
          element={<DeliveryAgentSignup />}
        />

        <Route path="/delivery-agent" element={<DeliveryAgentTracking />} />

        {/* <Route path="/admin/orders" element={<AdminOrders />} /> */}

        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="pizzas" element={<AdminPizzas />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route
            path="/admin/assign-delivery"
            element={<AssignDeliveryAgent />}
          />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}
