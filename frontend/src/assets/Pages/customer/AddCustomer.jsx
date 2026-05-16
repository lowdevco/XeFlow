import { useState } from "react";

import {
  FiUpload,
  FiBriefcase,
  FiUser,
  FiPhone,
  FiMail,
  FiCheck,
  FiX,
  FiHash,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; 
import { fetchWithAuth } from "../../js/api";



const AddCustomer = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    repName: "",
    phone: "",
    email: "",
    logo: null,
  });



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, logo: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving customer..."); 

    const submitData = new FormData();
    submitData.append("company_name", formData.companyName);
    submitData.append("rep_name", formData.repName);
    submitData.append("phone", formData.phone);
    submitData.append("email", formData.email);

    if (formData.logo) {
      submitData.append("logo", formData.logo);
    }

    try {
      const response = await fetchWithAuth("/customers/", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        toast.success("Customer saved successfully!", { id: loadingToast }); 
        navigate("/customer/view");
      } else {
        const errorData = await response.json();
        console.error("Failed to save:", errorData);
        toast.error("Failed to save customer. Please check the fields.", {
          id: loadingToast,
        }); 
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Is your Django server running?", {
        id: loadingToast,
      }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-xeflow-text">
            Add New Customer
          </h1>
          <p className="text-sm text-xeflow-muted mt-1">
            Enter the client's company and contact details below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-xeflow-surface border border-xeflow-border rounded-xl shadow-sm p-6 md:p-8 transition-colors duration-300"
        >
          <div className="mb-8">
            <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-3">
              Company Logo
            </label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-xeflow-border bg-xeflow-bg flex items-center justify-center text-xeflow-muted transition-colors hover:border-xeflow-brand/50 overflow-hidden relative">
                {formData.logo ? (
                  <img
                    src={URL.createObjectURL(formData.logo)}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUpload size={24} />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="text-sm text-xeflow-muted">
                <p className="font-medium text-xeflow-text mb-1">Upload Logo</p>
                <p>Recommended: 512x512px. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Customer ID */}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                Customer ID
              </label>
              <div className="relative">
                <FiHash
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted/50"
                  size={18}
                />
                <input
                  readOnly
                  type="text"
                  value="CST-AUTO (Generated upon save)"
                  className="w-full pl-11 pr-4 py-3 bg-xeflow-bg/50 border border-xeflow-border border-dashed rounded-xl text-sm text-xeflow-muted cursor-not-allowed outline-none transition-colors duration-200 select-none"
                />
              </div>
            </div>

            {/* Company Name */}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                Company Name
              </label>
              <div className="relative">
                <FiBriefcase
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                  size={18}
                />
                <input
                  required
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corporation"
                  className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all duration-200"
                />
              </div>
            </div>

            {/* Representative Name */}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                Representative Name
              </label>
              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                  size={18}
                />
                <input
                  required
                  type="text"
                  name="repName"
                  value={formData.repName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all duration-200"
                />
              </div>
            </div>

            {/* Contact Number */}

            <div>
              <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                Contact Number
              </label>
              <div className="relative">
                <FiPhone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                  size={18}
                />
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Address */}

            <div>
              <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                  size={18}
                />
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@acme.com"
                  className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted/50 outline-none focus:border-xeflow-brand transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Inside Form */}

          <div className="flex items-center justify-end gap-3 mt-8">
            <Link to="/customer/view">
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all duration-200"
              >
                <FiX size={16} /> Cancel
              </button>
            </Link>

            <button
              disabled={isSubmitting}
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-xeflow-brand text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-xeflow-brand/20 transition-all duration-200 disabled:opacity-50"
            >
              <FiCheck size={16} />{" "}
              {isSubmitting ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
