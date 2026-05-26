"use client";

import { useState } from "react";
import { Key, Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export default function SettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    if (!apiKey.startsWith("ey")) {
      setError("API key should start with 'ey...' (JWT format)");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/settings/save-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to save API key");
      }

      setSaved(true);
      setApiKey("");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Section */}
      <div>
        <h3 className="text-sm font-medium text-white mb-1">MiniMax API Key</h3>
        <p className="text-xs text-slate-400 mb-4">
          Your key is encrypted with AES-256-GCM and stored securely on the server.
          It never touches the browser or localStorage.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/30"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2.5 rounded-xl font-medium transition-all"
          >
            {isSaving ? (
              "Encrypting & Saving..."
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved Securely!
              </>
            ) : (
              "Save API Key"
            )}
          </button>
        </div>
      </div>

      {/* Preset Info */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-sm font-medium text-white mb-3">Mode Presets</h3>
        <div className="space-y-2">
          {[
            { name: "Chat", desc: "General conversation", temp: "0.7" },
            { name: "Tasks", desc: "Task planning & checklists", temp: "0.2" },
            { name: "Design", desc: "Creative & UI design", temp: "0.8" },
            { name: "Code", desc: "Programming & debugging", temp: "0.1" },
            { name: "Research", desc: "Deep analysis & synthesis", temp: "0.3" },
            { name: "Writing", desc: "Creative writing & storytelling", temp: "0.9" },
          ].map((preset) => (
            <div
              key={preset.name}
              className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg"
            >
              <div>
                <span className="text-sm text-slate-200">{preset.name}</span>
                <span className="text-xs text-slate-500 ml-2">{preset.desc}</span>
              </div>
              <span className="text-xs text-slate-400">temp: {preset.temp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Info */}
      <div className="border-t border-white/5 pt-6">
        <h3 className="text-sm font-medium text-white mb-3">🔒 Security</h3>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-300 font-medium mb-2">Encryption Active</p>
          <ul className="text-xs text-green-400/70 space-y-1">
            <li>✓ AES-256-GCM encryption</li>
            <li>✓ Random IV per key</li>
            <li>✓ Auth tag verification</li>
            <li>✓ Server-side only storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}