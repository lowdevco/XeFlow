import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuIndianRupee } from "react-icons/lu";
import {
  FiTag,
  FiAlignLeft,
  FiCheck,
  FiArrowLeft,
} from "react-icons/fi";
import toast from "react-hot-toast";


// API  wrapper Fetching

import { fetchWithAuth } from "../../js/api";

const AddService = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetchWithAuth("/services/", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          toast.error(errData.detail || "Failed to add service. Please try again."),
        );
      }


      navigate("/service/all");
    } catch (err) {
      toast.error("Error adding service:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header Section */}
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-xeflow-surface border border-xeflow-border rounded-xl text-xeflow-muted hover:text-xeflow-text hover:border-xeflow-brand transition-all shadow-sm"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text">
              Add New Service
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Create a new service offering for your invoices.
            </p>
          </div>
        </div>

        {/* Form Container */}

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {error && (
              toast.error({error})
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ── SERVICE NAME ── */}
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                  Service Name
                </label>
                <div className="relative">
                  <FiTag
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                    size={18}
                  />
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Website Redesign, Server Maintenance"
                    className="w-full pl-11 pr-4 py-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all"
                  />
                </div>
              </div>

              {/* ── PRICE ── */}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                  Base Price

                </label>
                <div className="relative">
                  <LuIndianRupee
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                    size={18}
                  />
                  <input
                    required
                    type="number"
                    name="price"
                    min="0"
                    step="0.01" 
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full pl-11 pr-4 py-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all"
                  />
                </div>
              </div>

              {/* ── DESCRIPTION ── */}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                  Description
                </label>
                <div className="relative">
                  <FiAlignLeft
                    className="absolute left-4 top-4 text-xeflow-muted"
                    size={18}
                  />
                  <textarea
                    required
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the details of this service..."
                    className="w-full pl-11 pr-4 py-3.5 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all resize-y custom-scrollbar"
                  />
                </div>
              </div>
            </div>

            {/* ── SUBMIT FOOTER ── */}

            <div className="pt-6 mt-6 border-t border-xeflow-border flex flex-col sm:flex-row gap-3 justify-end items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-xeflow-brand text-white font-semibold text-sm hover:opacity-90 shadow-lg shadow-xeflow-brand/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FiCheck size={16} />
                )}
                {isSubmitting ? "Saving..." : "Save Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddService;
