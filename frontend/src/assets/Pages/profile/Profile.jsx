import { useState, useEffect, useRef } from "react";
import { FiUser, FiMail, FiCamera, FiCheck, FiLock } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { fetchWithAuth } from "../../js/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    oldPassword: "",
    password: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        oldPassword: "",
        password: "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Updating profile...");

    try {
      const formData = new FormData();
      formData.append("first_name", profileData.firstName);
      formData.append("last_name", profileData.lastName);
      formData.append("email", profileData.email);

      if (profileData.password) {
        formData.append("oldPassword", profileData.oldPassword);
        formData.append("password", profileData.password);
      }

      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      const response = await fetchWithAuth("/users/me/", {
        method: "PATCH",
        body: formData,
      });

      if (response.ok) {
        toast.success("Profile updated successfully!", { id: toastId });
        await refreshUser();
        setProfileData((prev) => ({ ...prev, oldPassword: "", password: "" }));
      } else {
        const errData = await response.json();
        if (errData.oldPassword) {
          throw new Error(errData.oldPassword);
        }
        throw new Error(errData.detail || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-xeflow-bg">
        <div className="w-8 h-8 border-4 border-xeflow-border border-t-xeflow-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  let avatarSrc = null;
  if (previewUrl) {
    avatarSrc = previewUrl;
  } else if (user?.profile?.profile_picture) {
    const pfp = user.profile.profile_picture;
    avatarSrc = pfp.startsWith("http") ? pfp : `http://127.0.0.1:8000${pfp}`;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold text-xeflow-text">Account Settings</h1>
          <p className="text-sm text-xeflow-muted mt-1">
            Manage your profile, preferences, and account security.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300"
        >
          {/* Avatar Section */}
          <div className="p-6 md:p-8 border-b border-xeflow-border flex flex-col md:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 bg-xeflow-bg rounded-full p-1 border-4 border-xeflow-surface shadow-md overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-xeflow-brand to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-black">
                    {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-1 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiCamera size={24} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-xeflow-text">
                Profile Picture
              </h2>
              <p className="text-sm text-xeflow-muted mt-1 max-w-sm">
                Upload a new avatar. Larger images will be resized automatically.
                Maximum upload size is 2 MB.
              </p>
            </div>
            
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="px-5 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-bg font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <FiCamera size={16} /> Change Avatar
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Personal Information */}
            <section>
              <h3 className="text-lg font-bold text-xeflow-text mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand focus:ring-2 focus:ring-xeflow-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand focus:ring-2 focus:ring-xeflow-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand focus:ring-2 focus:ring-xeflow-brand/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-xeflow-border" />

            {/* Password Section */}
            <section>
              <h3 className="text-lg font-bold text-xeflow-text mb-1">
                Account Security
              </h3>
              <p className="text-sm text-xeflow-muted mb-5">
                Update your password to keep your account secure.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                    <input
                      type="password"
                      name="oldPassword"
                      placeholder="••••••••"
                      value={profileData.oldPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand focus:ring-2 focus:ring-xeflow-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted" size={16} />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={profileData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand focus:ring-2 focus:ring-xeflow-brand/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 md:px-8 bg-xeflow-bg border-t border-xeflow-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => refreshUser()}
              className="px-6 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-surface font-semibold text-sm transition-colors"
            >
              Discard Changes
            </button>
            <button
              disabled={isSubmitting}
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-xeflow-brand text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-xeflow-brand/20 transition-all disabled:opacity-50"
            >
              <FiCheck size={16} />{" "}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
