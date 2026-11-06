import { useEffect, useState } from "react";
import api from "../services/api";

import {
  FaGear,
  FaStore,
  FaUser,
  FaBell,
  FaRotateLeft,
  FaFloppyDisk,
} from "react-icons/fa6";
import toast from "react-hot-toast";

const INITIAL_SETTINGS = {
  storeName: "PizzaHub",
  supportEmail: "",
  supportPhone: "",
  storeAddress: "",
  currency: "INR",
  taxRate: "5",
  preparationTime: "30",
  acceptOrders: true,
  emailNotifications: true,
  lowStockAlerts: true,
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [saving, setSaving] = useState(false);

  
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await api.get("/settings/get-settings");

      if (response.data.success && response.data.settings) {
        setSettings((previous) => ({
          ...previous,
          ...response.data.settings,
          taxRate: String(response.data.settings.taxRate),
          preparationTime: String(
            response.data.settings.preparationTime
          ),
        }));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchSettings();
}, []);


  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!settings.storeName.trim()) {
    toast.error("Store name is required.");
    return;
  }

  if (
    settings.supportEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)
  ) {
    toast.error("Please enter a valid support email.");
    return;
  }

  if (
    settings.taxRate === "" ||
    !Number.isFinite(Number(settings.taxRate)) ||
    Number(settings.taxRate) < 0 ||
    Number(settings.taxRate) > 100
  ) {
    toast.error("Tax rate must be between 0 and 100.");
    return;
  }

  if (
    settings.preparationTime === "" ||
    !Number.isInteger(Number(settings.preparationTime)) ||
    Number(settings.preparationTime) < 1
  ) {
    toast.error("Preparation time must be at least 1 minute.");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      ...settings,
      storeName: settings.storeName.trim(),
      supportEmail: settings.supportEmail.trim(),
      supportPhone: settings.supportPhone.trim(),
      storeAddress: settings.storeAddress.trim(),
      taxRate: Number(settings.taxRate),
      preparationTime: Number(settings.preparationTime),
    };

    const response = await api.put(
      "/settings/update-settings",
      payload
    );

    if (response.data.success && response.data.settings) {
      setSettings((previous) => ({
        ...previous,
        ...response.data.settings,
        taxRate: String(response.data.settings.taxRate),
        preparationTime: String(
          response.data.settings.preparationTime
        ),
      }));
    }

    toast.success(response.data.message || "Settings saved.");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to save settings."
    );
  } finally {
    setSaving(false);
  }
};


  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all fields to their initial values?"
    );

    if (!confirmed) return;

    setSettings(INITIAL_SETTINGS);
    toast.success("Fields reset successfully.");
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#E63946] focus:ring-2 focus:ring-red-100";

  const sectionClass =
    "rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6";

  return (
    <div className="min-h-screen bg-[#FFF8F0] p-4 text-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <FaGear className="text-[#E63946]" />
              Admin Settings
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your store information and preferences.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium transition hover:bg-gray-50"
          >
            <FaRotateLeft />
            Reset Fields
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Information */}
          <section className={sectionClass}>
            <h2 className="flex items-center gap-3 text-lg font-bold">
              <FaStore className="text-[#E63946]" />
              Store Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Basic information about your PizzaHub store.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="storeName"
                  className="text-sm font-medium"
                >
                  Store Name *
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  value={settings.storeName}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="PizzaHub"
                />
              </div>

              <div>
                <label
                  htmlFor="supportEmail"
                  className="text-sm font-medium"
                >
                  Support Email
                </label>
                <input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="support@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="supportPhone"
                  className="text-sm font-medium"
                >
                  Support Phone
                </label>
                <input
                  id="supportPhone"
                  name="supportPhone"
                  type="tel"
                  value={settings.supportPhone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter support phone"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="text-sm font-medium"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="storeAddress"
                  className="text-sm font-medium"
                >
                  Store Address
                </label>
                <textarea
                  id="storeAddress"
                  name="storeAddress"
                  value={settings.storeAddress}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Enter your store address"
                />
              </div>
            </div>
          </section>

          {/* Order Preferences */}
          <section className={sectionClass}>
            <h2 className="flex items-center gap-3 text-lg font-bold">
              <FaGear className="text-[#E63946]" />
              Order Preferences
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="taxRate"
                  className="text-sm font-medium"
                >
                  Tax Rate (%)
                </label>
                <input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Informational for now; does not change checkout calculations.
                </p>
              </div>

              <div>
                <label
                  htmlFor="preparationTime"
                  className="text-sm font-medium"
                >
                  Preparation Time (minutes)
                </label>
                <input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
                  min="1"
                  step="1"
                  value={settings.preparationTime}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-4">
                <input
                  type="checkbox"
                  name="acceptOrders"
                  checked={settings.acceptOrders}
                  onChange={handleChange}
                  className="mt-1 accent-[#E63946]"
                />
                <span>
                  <span className="block font-medium">
                    Accept New Orders
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Preference only. Order placement is not affected yet.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section className={sectionClass}>
            <h2 className="flex items-center gap-3 text-lg font-bold">
              <FaBell className="text-[#E63946]" />
              Notifications
            </h2>

            <div className="mt-6 space-y-4">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-4">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="mt-1 accent-[#E63946]"
                />
                <span>
                  <span className="block font-medium">
                    Email Notifications
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Store your preference for order-related email alerts.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-100 p-4">
                <input
                  type="checkbox"
                  name="lowStockAlerts"
                  checked={settings.lowStockAlerts}
                  onChange={handleChange}
                  className="mt-1 accent-[#E63946]"
                />
                <span>
                  <span className="block font-medium">
                    Low Stock Alerts
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    Store your preference for inventory alerts.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* Admin Profile */}
          <section className={sectionClass}>
            <h2 className="flex items-center gap-3 text-lg font-bold">
              <FaUser className="text-[#E63946]" />
              Admin Account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage your account through the existing profile and
              authentication features. Password changes should use a
              secure backend endpoint.
            </p>
          </section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-lg bg-[#E63946] px-6 py-3 font-semibold text-white transition hover:bg-[#C1121F] disabled:opacity-50"
            >
              <FaFloppyDisk />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
