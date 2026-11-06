
import React from "react";
import { Link } from "react-router-dom";
import {
  FaPizzaSlice,
  FaFacebook,
  FaInstagram,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#151515] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand Section */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <FaPizzaSlice className="text-3xl text-[#E63946]" />
              <span className="text-2xl font-extrabold">
                Pizza<span className="text-[#E63946]">Hub</span>
              </span>
            </Link>

            <p className="mt-4 text-sm leading-7 text-gray-400">
              Freshly baked happiness, delivered to your doorstep.
              Build your own pizza and enjoy every delicious bite
              with PizzaHub.
            </p>

            <div className="mt-5 flex gap-4 text-xl">
              <a href="https://www.facebook.com/"
                target="_blank" rel="noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-[#E63946]">
                <FaFacebook />
              </a>

              <a href="https://www.instagram.com/"
                target="_blank" rel="noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-[#E63946]">
                <FaInstagram />
              </a>

              <a href="https://github.com/"
                target="_blank" rel="noreferrer"
                aria-label="GitHub"
                className="text-gray-400 hover:text-[#E63946]">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Quick Links</h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-[#E63946]">Home</Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#E63946]">Our Menu</Link>
              </li>
              <li>
                <Link to="/build-pizza" className="hover:text-[#E63946]">Build Your Pizza</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#E63946]">My Cart</Link>
              </li>
              <li>
                <Link to="/my-order" className="hover:text-[#E63946]">My Orders</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Customer Support</h3>

            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/login" className="hover:text-[#E63946]">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-[#E63946]">
                  Forgot Password
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#E63946]">
                  Explore Pizzas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-5 text-lg font-bold">Contact Us</h3>

            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#E63946]" />
                <span>Support email coming soon</span>
              </li>

              <li className="flex items-center gap-3">
                <FaPhone className="text-[#E63946]" />
                <span>Contact number coming soon</span>
              </li>

              <li className="flex items-center gap-3">
                <FaLocationDot className="text-[#E63946]" />
                <span>Serving delicious pizzas near you</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} PizzaHub.
            All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-600">
            Made with ❤️ for pizza lovers.
          </p>
        </div>

      </div>
    </footer>
  );
}
