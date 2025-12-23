import { useState, useMemo } from "react";
import { createClient, type Client } from "../api";
import { useToast } from "./Toast";

interface ClientCreationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export default function ClientCreationDrawer({ isOpen, onClose, onSuccess }: ClientCreationDrawerProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const accentLines = useMemo(
    () => (
      <div className="drawer-accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>
    ),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Client name is required", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await createClient({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      });
      showToast("Client created successfully", "success");
      onSuccess(response.data);
      setFormData({ name: "", email: "", phone: "" });
      onClose();
    } catch (error: any) {
      showToast(error.message || "Failed to create client", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          z-index: 100;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }
        .drawer-overlay.open {
          opacity: 1;
          pointer-events: all;
        }
        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          max-width: 520px;
          background: var(--bg);
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
          z-index: 101;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-weight: 300;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }
        .drawer.open {
          transform: translateX(0);
        }
        .drawer-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .drawer-accent-lines {
          position: absolute;
          inset: 0;
        }
        .drawer-accent-lines .hline,
        .drawer-accent-lines .vline {
          position: absolute;
          background: rgba(11, 92, 255, 0.22);
          opacity: 0.9;
          will-change: transform, opacity;
        }
        .drawer-accent-lines .hline {
          height: 1px;
          left: 0;
          right: 0;
          transform: scaleX(0);
          transform-origin: 50% 50%;
          animation: drawX 800ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .drawer-accent-lines .hline:nth-child(1) {
          top: 20%;
          animation-delay: 150ms;
        }
        .drawer-accent-lines .hline:nth-child(2) {
          top: 50%;
          animation-delay: 280ms;
        }
        .drawer-accent-lines .hline:nth-child(3) {
          top: 80%;
          animation-delay: 410ms;
        }
        .drawer-accent-lines .vline {
          width: 1px;
          top: 0;
          bottom: 0;
          transform: scaleY(0);
          transform-origin: 50% 0%;
          animation: drawY 900ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .drawer-accent-lines .vline:nth-child(4) {
          left: 20%;
          animation-delay: 520ms;
        }
        .drawer-accent-lines .vline:nth-child(5) {
          left: 50%;
          animation-delay: 640ms;
        }
        .drawer-accent-lines .vline:nth-child(6) {
          left: 80%;
          animation-delay: 760ms;
        }
        .drawer-accent-lines .hline::after,
        .drawer-accent-lines .vline::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(11, 92, 255, 0.28), transparent);
          opacity: 0;
          animation: shimmer 900ms ease-out forwards;
        }
        .drawer-accent-lines .hline:nth-child(1)::after {
          animation-delay: 150ms;
        }
        .drawer-accent-lines .hline:nth-child(2)::after {
          animation-delay: 280ms;
        }
        .drawer-accent-lines .hline:nth-child(3)::after {
          animation-delay: 410ms;
        }
        .drawer-accent-lines .vline:nth-child(4)::after {
          animation-delay: 520ms;
        }
        .drawer-accent-lines .vline:nth-child(5)::after {
          animation-delay: 640ms;
        }
        .drawer-accent-lines .vline:nth-child(6)::after {
          animation-delay: 760ms;
        }
        @keyframes drawX {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          60% {
            opacity: 0.9;
          }
          100% {
            transform: scaleX(1);
            opacity: 0.75;
          }
        }
        @keyframes drawY {
          0% {
            transform: scaleY(0);
            opacity: 0;
          }
          60% {
            opacity: 0.9;
          }
          100% {
            transform: scaleY(1);
            opacity: 0.75;
          }
        }
        @keyframes shimmer {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 0.25;
          }
          100% {
            opacity: 0;
          }
        }
        .drawer-header {
          position: relative;
          z-index: 10;
          padding: 24px 28px;
          border-bottom: 1px solid rgba(11, 92, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        }
        .drawer-title {
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 300;
          letter-spacing: -0.01em;
          color: var(--fg);
          margin: 0;
        }
        .drawer-close {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(11, 92, 255, 0.12);
          background: transparent;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .drawer-close:hover {
          color: var(--fg);
          border-color: rgba(11, 92, 255, 0.2);
          background: rgba(11, 92, 255, 0.06);
        }
        .drawer-content {
          position: relative;
          z-index: 10;
          flex: 1;
          overflow-y: auto;
          padding: 32px 28px;
        }
        .drawer-form {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .drawer-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .drawer-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--fg);
          letter-spacing: -0.01em;
        }
        .drawer-label .required {
          color: #ef4444;
          margin-left: 2px;
        }
        .drawer-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(11, 92, 255, 0.12);
          border-radius: 12px;
          background: var(--bg);
          color: var(--fg);
          font-size: 15px;
          font-weight: 300;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .drawer-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(11, 92, 255, 0.08);
        }
        .drawer-input::placeholder {
          color: var(--muted);
          opacity: 0.6;
        }
        .drawer-footer {
          position: relative;
          z-index: 10;
          padding: 20px 28px;
          border-top: 1px solid rgba(11, 92, 255, 0.08);
          display: flex;
          gap: 12px;
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
        }
        .drawer-button {
          flex: 1;
          height: 38px;
          padding: 0 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: inherit;
        }
        .drawer-button-cancel {
          background: transparent;
          color: var(--muted);
          border: 1px solid rgba(11, 92, 255, 0.12);
        }
        .drawer-button-cancel:hover {
          color: var(--fg);
          border-color: rgba(11, 92, 255, 0.2);
          background: rgba(11, 92, 255, 0.06);
        }
        .drawer-button-submit {
          background: var(--primary);
          color: #fff;
          border: 1px solid rgba(11, 92, 255, 0.2);
          box-shadow: 0 10px 30px rgba(11, 92, 255, 0.18);
        }
        .drawer-button-submit:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-1px);
          box-shadow: 0 12px 34px rgba(11, 92, 255, 0.22);
        }
        .drawer-button-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
      <div className={`drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-background">{accentLines}</div>
        <div className="drawer-header">
          <h2 className="drawer-title">Create New Client</h2>
          <button onClick={onClose} className="drawer-close" aria-label="Close">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="drawer-content">
          <form onSubmit={handleSubmit} className="drawer-form">
            <div className="drawer-field">
              <label className="drawer-label">
                Client Name<span className="required">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="drawer-input"
                placeholder="Enter client name"
              />
            </div>

            <div className="drawer-field">
              <label className="drawer-label">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="drawer-input"
                placeholder="client@example.com"
              />
            </div>

            <div className="drawer-field">
              <label className="drawer-label">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="drawer-input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </form>
        </div>

        <div className="drawer-footer">
          <button
            type="button"
            onClick={onClose}
            className="drawer-button drawer-button-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="drawer-button drawer-button-submit"
          >
            {loading ? "Creating..." : "Create Client"}
          </button>
        </div>
      </div>
    </>
  );
}


