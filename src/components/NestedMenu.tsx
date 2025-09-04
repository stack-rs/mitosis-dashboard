import React, { useState } from "react";

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  submenu?: MenuItem[];
  description?: string;
}

export interface NestedMenuProps {
  items: MenuItem[];
  activeItem: string;
  onItemSelect: (itemId: string) => void;
  className?: string;
}

export function NestedMenu({
  items,
  activeItem,
  onItemSelect,
  className = "",
}: NestedMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeItem === item.id;
    const paddingLeft = `${(level + 1) * 16}px`;

    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => {
            if (hasSubmenu) {
              toggleExpanded(item.id);
            } else {
              onItemSelect(item.id);
            }
          }}
          className={`w-full flex items-center justify-between py-3 px-4 text-left transition-colors ${
            isActive
              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500"
              : "text-gray-700 hover:bg-gray-50"
          }`}
          style={{ paddingLeft }}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            <span className={`font-medium ${isActive ? "text-blue-700" : ""}`}>
              {item.label}
            </span>
          </div>
          {hasSubmenu && (
            <span
              className={`transform transition-transform ${
                isExpanded ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && isExpanded && (
          <div className="bg-gray-25">
            {item.submenu!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className={`bg-white border-r border-gray-200 overflow-y-auto ${className}`}
    >
      {items.map((item) => renderMenuItem(item))}
    </nav>
  );
}

// Menu configuration based on API endpoints
export const menuConfig: MenuItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "🏠",
    description: "Dashboard home and quick stats",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: "⚡",
    description: "Task management and execution",
    submenu: [
      {
        id: "tasks.submit",
        label: "Submit Task",
        icon: "➕",
        description: "Create and submit new computational tasks",
      },
      {
        id: "tasks.query",
        label: "Query Task",
        icon: "🔍",
        description: "Query a single task by UUID",
      },
      {
        id: "tasks.list",
        label: "List Tasks",
        icon: "📋",
        description: "View all tasks in a list",
      },
      {
        id: "tasks.labels",
        label: "Manage Labels",
        icon: "🏷️",
        description: "Update task labels and tags",
      },
    ],
  },
  {
    id: "artifacts",
    label: "Artifacts",
    icon: "📁",
    description: "Task result files and outputs",
    submenu: [
      {
        id: "artifacts.upload",
        label: "Upload Artifact",
        icon: "⬆️",
        description: "Upload task result artifacts",
      },
      {
        id: "artifacts.download",
        label: "Download Artifact",
        icon: "⬇️",
        description: "Download task result files",
      },
      {
        id: "artifacts.delete",
        label: "Delete Artifact",
        icon: "🗑️",
        description: "Delete task result artifacts",
      },
    ],
  },
  {
    id: "attachments",
    label: "Attachments",
    icon: "📎",
    description: "Shared files and resources",
    submenu: [
      {
        id: "attachments.upload",
        label: "Upload Attachment",
        icon: "📤",
        description: "Upload shared file attachments",
      },
      {
        id: "attachments.download",
        label: "Download Attachment",
        icon: "⬇️",
        description: "Download specific attachments",
      },
      {
        id: "attachments.query",
        label: "Query Attachments",
        icon: "🔍",
        description: "Search and filter attachments",
      },
      {
        id: "attachments.delete",
        label: "Delete Attachments",
        icon: "🗑️",
        description: "Remove attachment files",
      },
      {
        id: "attachments.list",
        label: "List Attachments",
        icon: "📋",
        description: "View all available attachments",
      },
    ],
  },
  {
    id: "workers",
    label: "Workers",
    icon: "⚙️",
    description: "Worker nodes and compute resources",
    submenu: [
      {
        id: "workers.query",
        label: "Query Workers",
        icon: "🔍",
        description: "Search and filter worker nodes",
      },
      {
        id: "workers.manage",
        label: "Manage Workers",
        icon: "🛠️",
        description: "Control worker nodes and assignments",
      },
      {
        id: "workers.tags",
        label: "Worker Tags",
        icon: "🏷️",
        description: "Manage worker tags and labels",
      },
    ],
  },
  {
    id: "groups",
    label: "Groups",
    icon: "👥",
    description: "User groups and permissions",
    submenu: [
      {
        id: "groups.create",
        label: "Create Group",
        icon: "➕",
        description: "Create new user groups",
      },
      {
        id: "groups.manage",
        label: "Manage Groups",
        icon: "⚙️",
        description: "View and configure groups",
      },
      {
        id: "groups.roles",
        label: "Group Roles",
        icon: "🔐",
        description: "Manage user roles in groups",
      },
      {
        id: "groups.storage",
        label: "Storage Quota",
        icon: "💾",
        description: "Manage group storage limits",
      },
    ],
  },
  {
    id: "users",
    label: "Users",
    icon: "👤",
    description: "User accounts and profiles",
    submenu: [
      {
        id: "users.profile",
        label: "My Profile",
        icon: "👤",
        description: "View and edit user profile",
      },
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
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: "⚡",
    description: "Administrative functions",
    submenu: [
      {
        id: "admin.users",
        label: "Manage Users",
        icon: "👥",
        description: "Create and manage user accounts",
      },
      {
        id: "admin.workers",
        label: "Admin Workers",
        icon: "🔧",
        description: "Advanced worker administration",
      },
      {
        id: "admin.groups",
        label: "Admin Groups",
        icon: "🏢",
        description: "Advanced group administration",
      },
      {
        id: "admin.storage",
        label: "Storage Management",
        icon: "💽",
        description: "Manage storage quotas and usage",
      },
      {
        id: "admin.system",
        label: "System Control",
        icon: "🔄",
        description: "System shutdown and maintenance",
      },
    ],
  },
  {
    id: "redis",
    label: "Redis",
    icon: "🔴",
    description: "Redis connection and monitoring",
  },
];
