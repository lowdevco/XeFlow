import { useState } from "react";
import { FiUser, FiMail, FiCamera, FiCheck, FiShield } from "react-icons/fi";

const Profile = () => {

// Dummy Profile Data 

  const [profileData, setProfileData] = useState({

    firstName: "Muhammad",
    lastName: "Irfan",
    email: "irfan@xeflow.com",
    role: "System Administrator",

  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Just a Placeholder for Now

  const handleSave = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-xeflow-bg transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}

        <div>
          <h1 className="text-2xl font-bold text-xeflow-text">My Profile</h1>
          <p className="text-sm text-xeflow-muted mt-1">
            Manage your account settings and personal information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column: Profile Summary Card ── */}

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">

              {/* Cover Photo / Gradient Banner */}

              <div className="h-32 bg-gradient-to-r from-xeflow-brand to-blue-400 relative">
                <button
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
                  title="Change Cover"
                >
                  <FiCamera size={16} />
                </button>
              </div>

              {/* Avatar & Info */}
              
              <div className="px-6 pb-6 relative">
                <div className="flex justify-between items-end -mt-12 mb-4">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-xeflow-surface rounded-full p-1 border-4 border-xeflow-surface shadow-md">
                      <div className="w-full h-full bg-gradient-to-br from-xeflow-brand to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-black">
                        {profileData.firstName[0]}
                        {profileData.lastName[0]}
                      </div>
                    </div>

                    {/* Hover overlay for avatar */}

                    <button className="absolute inset-1 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiCamera size={20} />
                    </button>
                  </div>
                  <span className="px-3 py-1 bg-xeflow-brand/10 text-xeflow-brand text-xs font-bold rounded-full border border-xeflow-brand/20">
                    {profileData.role}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-xeflow-text">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-sm text-xeflow-muted">
                    {profileData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Quick Link Card */}

            <div className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm p-6 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-xeflow-brand/10 text-xeflow-brand flex items-center justify-center">
                  <FiShield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-xeflow-text">
                    Account Security
                  </h3>
                  <p className="text-xs text-xeflow-muted">
                    Update your password
                  </p>
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl border border-xeflow-border text-xeflow-text text-sm font-semibold hover:bg-xeflow-brand/5 transition-colors">
                Change Password
              </button>
            </div>
          </div>


          {/* Edit Form */}

          <div className="lg:col-span-2">
            <form
              onSubmit={handleSave}
              className="bg-xeflow-surface border border-xeflow-border rounded-2xl shadow-sm p-6 md:p-8 transition-colors duration-300"
            >
              <h2 className="text-lg font-bold text-xeflow-text mb-6">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Name */}

                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                      size={16}
                    />
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand transition-all"
                    />
                  </div>
                </div>


                {/* Last Name */}

                <div>
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                      size={16}
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand transition-all"
                    />
                  </div>
                </div>

                {/* Email Address  */}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-xeflow-muted uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-xeflow-muted"
                      size={16}
                    />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-xeflow-bg border border-xeflow-border rounded-xl text-sm text-xeflow-text outline-none focus:border-xeflow-brand transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}

              <div className="mt-8 pt-6 border-t border-xeflow-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl border border-xeflow-border text-xeflow-text hover:bg-xeflow-brand/5 font-semibold text-sm transition-colors"
                >
                  Cancel
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
      </div>
    </div>
  );
};

export default Profile;
