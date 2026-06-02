import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiX,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../../js/api";
import CustomSelect from "../../components/CustomSelect";

const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "", 
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = useMemo(() => {
    return [
      { value: "0", label: "User (Default)" },
      ...availableRoles.map((role) => ({
        value: role.id.toString(),
        label: role.name,
      })),
    ];
  }, [availableRoles]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetchWithAuth("/groups/", { method: "GET" });
        if (response.ok) {
          const data = await response.json();
          setAvailableRoles(data);
        } else {
          toast.error("Failed to load user roles.");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !formData.username ||
    !formData.email ||
    !formData.password ||
    !formData.role_id
  ) {
    toast.error("Please fill in all fields and select a role.");
    return;
  }

  const toastId = toast.loading("Creating user...");
  setIsSubmitting(true);

  try {
    const response = await fetchWithAuth("/users/register/", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      toast.success("User created successfully!", { id: toastId });
      navigate("/user/view");
    } else {
      const errorData = await response.json();

      if (errorData.username) {
        toast.error(errorData.username[0], { id: toastId });
      } else if (errorData.email) {
        toast.error("Email is already registered.", { id: toastId });
      } else {
        toast.error(errorData.detail || "Failed to create user.", {
          id: toastId,
        });
      }
    }
  } catch (error) {
    console.error("Error creating user:", error);
    toast.error("Network error occurred.", { id: toastId });
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="flex-1 overflow-visible p-4 md:p-8 pb-24 mt-20 lg:mt-30 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-xeflow-text flex items-center gap-2">
              <FiUserPlus className="text-xeflow-brand" /> Add New User
            </h1>
            <p className="text-sm text-xeflow-muted mt-1">
              Create a new account and assign permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-xeflow-border bg-xeflow-surface text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-all shadow-sm">
                <FiX size={16} /> Cancel
              </button>
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-xeflow-brand text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-md shadow-xeflow-brand/20 disabled:opacity-50"
            >
              <FiSave size={18} /> {isSubmitting ? "Saving..." : "Create User"}
            </button>
          </div>
        </div>

        <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-visible transition-colors duration-300">
          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider ml-1">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                      size={18}
                    />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="e.g. johndoe"
                      className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                      size={18}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                      size={18}
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text placeholder:text-xeflow-muted outline-none focus:border-xeflow-brand transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-xeflow-muted uppercase tracking-wider ml-1">
                    User Role
                  </label>
                  <div className="relative">
                    <FiShield
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted z-10 pointer-events-none"
                      size={18}
                    />
                    <CustomSelect
                      value={formData.role_id?.toString() || ""}
                      onChange={(val) =>
                        handleChange({
                          target: { name: "role_id", value: val },
                        })
                      }
                      options={roleOptions}
                      placeholder={isLoadingRoles ? "Loading..." : "Select a role..."}
                      fullWidth={true}
                      align="left"
                      buttonClassName="w-full pl-11 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand text-left"
                      dropdownClassName="w-full left-0 bg-xeflow-surface border border-xeflow-border rounded-xl shadow-2xl p-1.5"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
