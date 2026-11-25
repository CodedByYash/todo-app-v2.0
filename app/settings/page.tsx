"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { User, Palette, Shield, Check, AlertTriangle } from "lucide-react";

const Settings = () => {
  const { data: session, update } = useSession();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    theme: "light",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || "",
        email: session.user.email || "",
        theme: "light",
      });
      setLoading(false);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    if (!session?.user) return;

    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          theme: userData.theme,
        }),
      });
      if (res.ok) {
        await update({ name: userData.name });
        setMessage({ type: "success", text: "Settings saved successfully" });
      } else {
        setMessage({ type: "error", text: "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const initials =
    userData.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-1.5">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Profile</h2>
          </div>

          {/* Avatar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <span className="text-lg font-bold text-white">{initials}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{userData.name || "Your Name"}</p>
              <p className="text-sm text-gray-400">{userData.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 transition focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={userData.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-400"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed
              </p>
            </div>
          </div>
        </motion.section>

        {/* Preferences Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-lg bg-purple-50 p-1.5">
              <Palette className="h-4 w-4 text-purple-600" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Preferences</h2>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Theme
            </label>
            <div className="flex gap-3">
              {["light", "dark"].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setUserData({ ...userData, theme })}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium capitalize transition ${
                    userData.theme === theme
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Save button */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </form>

      {/* Danger Zone */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-red-100 bg-white p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-red-50 p-1.5">
            <Shield className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500">
          Once you delete your account, there is no going back.
        </p>
        <button
          type="button"
          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete Account
        </button>
      </motion.section>
    </div>
  );
};

export default Settings;
