import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-xeflow-surface border-t border-xeflow-border/50 py-5 px-6 md:px-8 mt-auto z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-xeflow-muted">
        <div>
          &copy; 2026 Xeventure IT Solutions. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link
            className="hover:text-xeflow-brand transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            className="hover:text-xeflow-brand transition-colors"
          >
            Privacy Policy
          </Link>
          <a
            href="mailto:support@xeventure.com"
            className="hover:text-xeflow-brand transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
