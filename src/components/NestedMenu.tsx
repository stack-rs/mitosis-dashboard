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
        label: "Submit a Task",
        icon: "➕",
        description: "Create and submit new computational tasks",
      },
      {
        id: "tasks.query",
        label: "Query a Task",
        icon: "🔍",
        description: "Query a single task by UUID",
      },
      {
        id: "tasks.list",
        label: "List Tasks",
        icon: "📋",
        description: "Search and filter tasks in the system",
      },
      {
        id: "tasks.manage",
        label: "Manage a Task",
        icon: "⚙️",
        description: "Change task spec and update labels",
      },
      {
        id: "tasks.cancel",
        label: "Cancel a Task",
        icon: "🛑",
        description: "Cancel running or pending tasks",
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
        id: "attachments.query",
        label: "Query an Attachment",
        icon: "🔍",
        description: "Get specific attachment by group and key",
      },
      {
        id: "attachments.list",
        label: "List Attachments",
        icon: "📋",
        description: "View all attachments in a group",
      },
      {
        id: "attachments.download",
        label: "Download an Attachment",
        icon: "⬇️",
        description: "Download specific attachment files",
      },
      {
        id: "attachments.upload",
        label: "Upload an Attachment",
        icon: "⬆️",
        description: "Upload shared file attachments",
      },
      {
        id: "attachments.delete",
        label: "Delete an Attachment",
        icon: "🗑️",
        description: "Remove attachment files",
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
        label: "Query a Worker",
        icon: "🔍",
        description: "Get specific worker by ID",
      },
      {
        id: "workers.list",
        label: "List Workers",
        icon: "📋",
        description: "Filter and browse workers",
      },
      {
        id: "workers.manage",
        label: "Manage a Worker",
        icon: "⚙️",
        description: "Update tags, labels, and groups",
      },
      {
        id: "workers.cancel",
        label: "Cancel a Worker",
        icon: "🛑",
        description: "Cancel worker operations",
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
        id: "groups.get",
        label: "Get a Group",
        icon: "🔍",
        description: "Retrieve group information and details",
      },
      {
        id: "groups.manage",
        label: "Manage a Group",
        icon: "⚙️",
        description: "Add/remove users and manage roles",
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: "🔐",
    description: "Administrative functions",
    submenu: [
      {
        id: "admin.users",
        label: "Manage Users",
        icon: "👥",
        description: "Create, delete, and manage user accounts",
      },
      {
        id: "admin.groups",
        label: "Manage Groups",
        icon: "🏢",
        description:
          "Create groups, manage storage quotas, and user permissions",
      },
      {
        id: "admin.workers",
        label: "Manage Workers",
        icon: "⚙️",
        description:
          "Control worker lifecycle, tags, labels, and group relationships",
      },
      {
        id: "admin.tasks",
        label: "Manage Tasks",
        icon: "📋",
        description:
          "Monitor and control task execution, manage task properties",
      },
      {
        id: "admin.system",
        label: "System Control",
        icon: "🎛️",
        description:
          "System operations, Redis management, and coordinator shutdown",
      },
    ],
  },
];
