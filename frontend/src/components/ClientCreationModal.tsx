import { useState } from "react";
import { createClient, type Client } from "../api";
import { useToast } from "./Toast";

interface ClientCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: Client) => void;
}

export default function ClientCreationModal({ isOpen, onClose, onSuccess }: ClientCreationModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--fg)]">Create New Client</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--fg)] transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-[rgba(11,92,255,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-1">Email (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-[rgba(11,92,255,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--fg)] mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-[rgba(11,92,255,0.12)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[rgba(11,92,255,0.12)] rounded-lg text-[var(--fg)] font-medium hover:bg-[rgba(11,92,255,0.06)] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


