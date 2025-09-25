import React, { useState, useRef, useEffect } from "react";

interface UserDropdownProps {
  username: string;
  coordinatorAddr: string;
  onLogout: () => void;
  onMenuSelect: (menuId: string) => void;
}

const userMenuItems = [
  {
    id: "users.password",
    label: "Change Password",
    icon: "🔑",
    description: "Update account password",
  },
  {
    id: "users.groups",
    label: "My Groups",
    icon: "👥",
    description: "View group memberships",
  },
  {
    id: "users.session",
    label: "Current Session",
    icon: "🔐",
    description: "View session details and status",
  },
];

export default function UserDropdown({
  username,
  coordinatorAddr,
  onLogout,
  onMenuSelect,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (menuId: string) => {
    setIsOpen(false);
    onMenuSelect(menuId);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Info Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
          {username.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-start">
          <span className="font-medium text-gray-900">{username}</span>
          <span
            className="font-mono text-xs text-gray-500 truncate max-w-32 cursor-help"
            title={coordinatorAddr}
          >
            {coordinatorAddr}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-500 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-gray-900">{username}</span>
                <span className="text-sm text-gray-500">Signed in</span>
                <span
                  className="font-mono text-xs text-gray-400 truncate"
                  title={coordinatorAddr}
                >
                  {coordinatorAddr}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {userMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.description}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center px-4 py-3 text-left hover:bg-red-50 transition-colors"
          >
            <span className="text-lg mr-3">🚪</span>
            <div className="flex flex-col">
              <span className="font-medium text-red-600">Logout</span>
              <span className="text-sm text-gray-500">
                Sign out of your account
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
