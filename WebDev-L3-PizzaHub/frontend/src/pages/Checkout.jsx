
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { FaIndianRupeeSign } from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.cart);

  const token =
    useSelector((state) => state.auth.token) ||
    localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [address, setAddress] = useState({
  fullName: "",
  phone: "",
  house: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
});

const [addressErrors, setAddressErrors] = useState({});

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleAddressChange = (e) => {
  const { name, value } = e.target;

  setAddress((prev) => ({
    ...prev,
    [name]: value,
  }));

  setAddressErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};

const validateAddress = () => {
  const errors = {};

  if (!address.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!/^[6-9]\d{9}$/.test(address.phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  }

  if (!address.house.trim()) {
    errors.house = "House or building is required.";
  }

  if (!address.street.trim()) {
    errors.street = "Street or locality is required.";
  }

  if (!address.city.trim()) {
    errors.city = "City is required.";
  }

  if (!address.state.trim()) {
    errors.state = "State is required.";
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    errors.pincode = "Enter a valid 6-digit PIN code.";
  }

  setAddressErrors(errors);

  return Object.keys(errors).length === 0;
};

  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error("Please log in to place your order.");
      navigate("/login", {
        state: { from: "/checkout" },
      });
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/menu");
      return;
    }

    // Convert frontend cart data to backend format
    const items = cartItems.map((item) => ({
      pizza: item.pizzaId,
      base: item.base,
      sauce: item.sauce,
      cheese: item.cheese,

      vegetables: Array.isArray(item.toppings)
        ? item.toppings
        : Array.isArray(item.vegetable)
          ? item.vegetable
          : [],

      quantity: Number(item.quantity || 1),
    }));

    // Validate cart items before sending the request
    const invalidItem = items.some(
      (item) =>
        !item.pizza ||
        !item.base ||
        !item.sauce ||
        !item.cheese ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    );

    if (invalidItem) {
      toast.error(
        "Some cart items are incomplete. Please review your cart."
      );
      navigate("/cart");
      return;
    }

    try {
      setLoading(true);

      // Backend calculates the final price from the database
      const response = await api.post(
  "/order/create-order",
  {
    items,
    deliveryAddress: {
      fullName: address.fullName.trim(),
      phone: address.phone,
      house: address.house.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode,
    },
  }
);

      const order = response.data?.order;

      if (!response.data?.success || !order?._id) {
        throw new Error(
          response.data?.message ||
            "Order could not be created."
        );
      }

      setCreatedOrder(order);

      toast.success("Order created successfully!");
    } catch (error) {
      console.error(
        "Create order error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to create order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  
const handlePayment = async () => {
  if (!createdOrder?._id) {
    toast.error("Please create an order first.");
    return;
  }

  if (!window.Razorpay) {
    toast.error("Razorpay Checkout script is not loaded.");
    return;
  }

  try {
    setPaymentLoading(true);

    // Create a Razorpay order using the existing MongoDB order
    const response = await api.post(
      "/order/create-razorpay-order",
      { orderId: createdOrder._id }
    );

    const data = response.data;

    if (
      !data?.success ||
      !data?.key ||
      !data?.razorpayOrderId
    ) {
      throw new Error(
        data?.message || "Unable to initialize payment."
      );
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "PizzaHub",
      description: "Pizza order payment",
      order_id: data.razorpayOrderId,

      handler: async (paymentResponse) => {
        try {
          // Verify the payment on the backend
          const verifyResponse = await api.post(
            "/order/verify-payment",
            {
              razorpay_order_id:
                paymentResponse.razorpay_order_id,
              razorpay_payment_id:
                paymentResponse.razorpay_payment_id,
              razorpay_signature:
                paymentResponse.razorpay_signature,
            }
          );

          if (!verifyResponse.data?.success) {
            throw new Error(
              verifyResponse.data?.message ||
                "Payment verification failed."
            );
          }

          setPaymentSuccess(true);

          setCreatedOrder((previousOrder) => ({
            ...previousOrder,
            paymentStatus: "SUCCESS",
          }));

          toast.success("Payment successful!");
        } catch (error) {
          console.error(
            "Payment verification error:",
            error.response?.data || error.message
          );

          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Payment verification failed."
          );
        } finally {
          setPaymentLoading(false);
        }
      },

      modal: {
        ondismiss: () => {
          setPaymentLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (event) => {
      console.error("Razorpay payment failed:", event.error);
      toast.error(
        event.error?.description || "Payment failed. Please try again."
      );
      setPaymentLoading(false);
    });

    razorpay.open();
  } catch (error) {
    console.error(
      "Create Razorpay order error:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message ||
        error.message ||
        "Unable to start payment."
    );

    setPaymentLoading(false);
  }
};


  // Empty cart screen
  if (cartItems.length === 0 && !createdOrder) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <h1 className="text-3xl font-bold text-[#1F1F1F]">
          Your cart is empty
        </h1>

        <p className="mt-3 text-gray-600">
          Add a pizza before checking out.
        </p>

        <Link
          to="/menu"
          className="mt-6 rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white hover:bg-[#C1121F]"
        >
          Explore Pizzas
        </Link>
      </main>
    );
  }

  // Order created successfully
  if (createdOrder) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[#FFF8F0] px-4 text-center">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-[#1F1F1F]">
            Order Created Successfully
          </h1>

          <p className="mt-3 text-gray-600">
            Your order has been saved. Payment has not been taken yet.
          </p>

          <div className="mt-6 rounded-xl bg-[#FFF8F0] p-4 text-left">
            <p className="text-sm text-gray-600">
              Order ID
            </p>

            <p className="mt-1 break-all font-semibold text-[#1F1F1F]">
              {createdOrder._id}
            </p>

            <p className="mt-4 text-sm text-gray-600">
              Server-calculated total
            </p>

            <p className="mt-1 flex items-center font-bold text-[#E63946]">
              <FaIndianRupeeSign className="mr-1" />
              {Number(
                createdOrder.totalAmount || 0
              ).toFixed(2)}
            </p>

            <p className="mt-3 text-sm text-gray-600">
              Payment status:{" "}
              {createdOrder.paymentStatus || "PENDING"}
            </p>
          </div>

          
{paymentSuccess ? (
  <p className="mt-4 font-semibold text-green-700">
    Payment verified successfully!
  </p>
) : (
  <p className="mt-4 text-sm text-gray-500">
    Complete your payment securely using Razorpay Test Mode.
  </p>
)}

{!paymentSuccess && (
  <button
    type="button"
    onClick={handlePayment}
    disabled={paymentLoading}
    className="mt-6 w-full rounded-lg bg-[#E63946] px-4 py-3 font-semibold text-white hover:bg-[#C1121F] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {paymentLoading ? "Processing..." : "Pay Now"}
  </button>
)}

<button
  type="button"
  onClick={() => navigate("/menu")}
  className="mt-3 w-full rounded-lg border border-[#E63946] px-4 py-3 font-semibold text-[#E63946] hover:bg-red-50"
>
  Continue Shopping
</button>


          <button
            type="button"
            onClick={() => navigate("/menu")}
            className="mt-6 w-full rounded-lg bg-[#E63946] px-4 py-3 font-semibold text-white hover:bg-[#C1121F]"
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-[#1F1F1F] sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-2 text-gray-600">
          Review your order before placing it.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <section className="space-y-4 lg:col-span-2">

            
{/* Delivery Address Form */}
<div className="rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-bold text-[#1F1F1F]">
    Delivery Address
  </h2>

  <p className="mt-2 text-sm text-gray-600">
    Enter the address where you want your pizza delivered.
  </p>

  <div className="mt-5 grid gap-4 sm:grid-cols-2">
    {[
      { name: "fullName", label: "Full Name", placeholder: "Enter full name" },
      { name: "phone", label: "Phone Number", placeholder: "10-digit mobile number" },
      { name: "house", label: "House / Building", placeholder: "House or building" },
      { name: "street", label: "Street / Locality", placeholder: "Street or locality" },
      { name: "city", label: "City", placeholder: "Enter city" },
      { name: "state", label: "State", placeholder: "Enter state" },
      { name: "pincode", label: "PIN Code", placeholder: "6-digit PIN code" },
    ].map((field) => (
      <div key={field.name}>
        <label
          htmlFor={field.name}
          className="mb-2 block text-sm font-medium text-[#1F1F1F]"
        >
          {field.label}
        </label>

        <input
          id={field.name}
          name={field.name}
          type="text"
          value={address[field.name]}
          onChange={handleAddressChange}
          placeholder={field.placeholder}
          maxLength={
            field.name === "phone"
              ? 10
              : field.name === "pincode"
                ? 6
                : undefined
          }
          className={`w-full rounded-lg border px-3 py-3 outline-none focus:border-[#E63946] ${
            addressErrors[field.name]
              ? "border-red-500"
              : "border-gray-300"
          }`}
          aria-invalid={Boolean(addressErrors[field.name])}
        />

        {addressErrors[field.name] && (
          <p className="mt-1 text-sm text-red-600">
            {addressErrors[field.name]}
          </p>
        )}
      </div>
    ))}
  </div>
</div>


            {cartItems.map((item) => {
              const vegetables = Array.isArray(item.toppings)
                ? item.toppings
                : Array.isArray(item.vegetable)
                  ? item.vegetable
                  : [];

              return (
                <article
                  key={item.cartItemId || item.pizzaId}
                  className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
                >
                  <img
                    src={item.image}
                    alt={item.name || "Pizza"}
                    className="h-36 w-full rounded-xl object-cover sm:w-36"
                  />

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1F1F1F]">
                      {item.name || "Pizza"}
                    </h2>

                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Base: {item.base}</p>
                      <p>Sauce: {item.sauce}</p>
                      <p>Cheese: {item.cheese}</p>

                      <p>
                        Vegetables:{" "}
                        {vegetables.length
                          ? vegetables.join(", ")
                          : "None"}
                      </p>

                      <p>Quantity: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-1 font-bold text-[#E63946] sm:justify-end">
                    <FaIndianRupeeSign className="mt-1" />

                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    ).toFixed(2)}
                  </div>
                </article>
              );
            })}
          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#1F1F1F]">
              Order Summary
            </h2>

            <div className="mt-5 flex justify-between text-gray-600">
              <span>Total items</span>
              <span>{totalItems}</span>
            </div>

            <div className="mt-3 flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="mt-5 flex justify-between border-t pt-5 text-lg font-bold">
              <span>Total</span>

              <span className="flex items-center text-[#E63946]">
                <FaIndianRupeeSign className="mr-1" />
                {cartTotal.toFixed(2)}
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              The server calculates the final order price from saved
              pizza data. Payment has not been taken yet.
            </p>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-[#E63946] px-4 py-3 font-semibold text-white hover:bg-[#C1121F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Order..."
                : "Place Order"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              disabled={loading}
              className="mt-3 w-full rounded-lg border border-[#E63946] px-4 py-3 font-semibold text-[#E63946] hover:bg-red-50 disabled:opacity-60"
            >
              Back to Cart
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}