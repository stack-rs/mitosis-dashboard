import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import SubmitTask from "./tasks/SubmitTask";
import QueryTask from "./tasks/QueryTask";
import ListTasks from "./tasks/ListTasks";
import ManageTask from "./tasks/ManageTask";
import CancelTask from "./tasks/CancelTask";
import TaskDetail from "./TaskDetail";
import QueryAttachment from "./attachments/QueryAttachment";
import ListAttachments from "./attachments/ListAttachments";
import DownloadAttachment from "./attachments/DownloadAttachment";
import UploadAttachment from "./attachments/UploadAttachment";
import DeleteAttachment from "./attachments/DeleteAttachment";
import UploadArtifact from "./artifacts/UploadArtifact";
import DownloadArtifact from "./artifacts/DownloadArtifact";
import DeleteArtifact from "./artifacts/DeleteArtifact";
import QueryWorker from "./workers/QueryWorker";
import ListWorkers from "./workers/ListWorkers";
import ManageWorker from "./workers/ManageWorker";
import CancelWorker from "./workers/CancelWorker";
import CreateGroup from "./groups/CreateGroup";
import GetGroup from "./groups/GetGroup";
import ManageGroup from "./groups/ManageGroup";
import ChangePassword from "./users/ChangePassword";
import MyGroups from "./users/MyGroups";
import CurrentSession from "./users/CurrentSession";
import ManageUsers from "./admin/ManageUsers";
import ManageGroups from "./admin/ManageGroups";
import ManageWorkers from "./admin/ManageWorkers";
import ManageTasks from "./admin/ManageTasks";
import SystemControl from "./admin/SystemControl";
import Footer from "./Footer";
import { NestedMenu, menuConfig } from "./NestedMenu";
import UserDropdown from "./UserDropdown";
import { authUtils, type UserSession } from "../utils/auth";
import { setLogoutHandler } from "../utils/errorUtils";
import type { TaskQueryInfo } from "../types/schemas";

interface User {
  username: string;
  token: string;
  coordinatorAddr: string;
}

type ActiveTab = string; // Now supports all menu item IDs from menuConfig

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [totalTaskCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<TaskQueryInfo | null>(null);
  const [uploadContext, setUploadContext] = useState<{
    uuid?: string;
    groupName?: string;
  }>({});

  // Define logout handler
  const handleLogout = () => {
    authUtils.clearSession();
    setUser(null);
    setActiveTab("overview");
    setSelectedTask(null);
    setUploadContext({});
  };

  // Try to restore session on component mount
  useEffect(() => {
    const savedSession = authUtils.loadSession();
    if (savedSession) {
      setUser({
        username: savedSession.username,
        token: savedSession.token,
        coordinatorAddr: savedSession.coordinatorAddr,
      });
    }
    setIsLoading(false);

    // Set up global logout handler for 401 errors
    setLogoutHandler(handleLogout);
  }, []);

  const handleLogin = (
    token: string,
    username: string,
    coordinatorAddr: string,
    retain: boolean = true,
  ) => {
    const session: UserSession = {
      username,
      token,
      coordinatorAddr,
      loginTime: Date.now(),
      retain,
    };

    authUtils.saveSession(session);
    setUser({ username, token, coordinatorAddr });
    setActiveTab("overview");
  };




  const handleTaskDetailClose = () => {
    setSelectedTask(null);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              Mitosis Dashboard
            </div>
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Mitosis Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Web Interface for Mitosis, A Unified Transport Evaluation
                Framework
              </p>
            </div>
            <LoginForm onLogin={handleLogin} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Mitosis Dashboard
              </h2>
              <p className="text-gray-600 mb-4">
                This web interface provides access to Mitosis's services with
                organized navigation. Use the sidebar menu to access different
                features and manage your distributed computing workflow.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuConfig.slice(1, 7).map((section) => (
                  <button
                    key={section.id}
                    onClick={() =>
                      setActiveTab(section.submenu?.[0]?.id || section.id)
                    }
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                  >
                    <div className="text-2xl mb-2">{section.icon}</div>
                    <div className="font-medium text-gray-900">
                      {section.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {section.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalTaskCount}
                  </div>
                  <div className="text-sm text-blue-700">Total Tasks Found</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadContext.uuid ? "1" : "0"}
                  </div>
                  <div className="text-sm text-green-700">
                    Recent Submissions
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.username}
                  </div>
                  <div className="text-sm text-purple-700">Active User</div>
                </div>
              </div>
            </div>
          </div>
        );

      // Tasks
      case "tasks.submit":
        return (
          <SubmitTask
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "tasks.query":
        return (
          <QueryTask
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "tasks.list":
        return (
          <ListTasks
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "tasks.manage":
        return (
          <ManageTask
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "tasks.cancel":
        return (
          <CancelTask
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      // Artifacts
      case "artifacts.upload":
        return (
          <UploadArtifact
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "artifacts.download":
        return (
          <DownloadArtifact
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "artifacts.delete":
        return (
          <DeleteArtifact
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      // Attachments
      case "attachments.upload":
        return (
          <UploadAttachment
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.download":
        return (
          <DownloadAttachment
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.query":
        return (
          <QueryAttachment
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.delete":
        return (
          <DeleteAttachment
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.list":
        return (
          <ListAttachments
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      // Users
      case "users.password":
        return (
          <ChangePassword
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "users.groups":
        return (
          <MyGroups
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "users.session":
        return (
          <CurrentSession
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      // Workers
      case "workers.query":
        return (
          <QueryWorker
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "workers.list":
        return (
          <ListWorkers
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "workers.manage":
        return (
          <ManageWorker
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "workers.cancel":
        return (
          <CancelWorker
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      // Groups
      case "groups.create":
        return (
          <CreateGroup
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      case "groups.get":
        return (
          <GetGroup token={user.token} coordinatorAddr={user.coordinatorAddr} />
        );

      case "groups.manage":
        return (
          <ManageGroup
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
          />
        );

      // Admin
      case "admin.users":
        return (
          <ManageUsers
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "admin.groups":
        return (
          <ManageGroups
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "admin.workers":
        return (
          <ManageWorkers
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "admin.tasks":
        return (
          <ManageTasks
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "admin.system":
        return (
          <SystemControl
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Feature Not Implemented
            </h2>
            <p className="text-gray-600 mt-2">
              The feature "{activeTab}" is not yet implemented.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Side: App Name + Navigation */}
      <div className="w-64 bg-white flex flex-col">
        {/* Area 1: App Name/Logo (Left Top) */}
        <div className="p-4 bg-white h-20 flex flex-col justify-center border-r border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">Mitosis Dashboard</h1>
          <div className="text-xs text-gray-500">Transport Evaluation</div>
        </div>

        {/* Area 3: Sidebar Navigation (Left Bottom) */}
        <div className="flex-1 bg-white overflow-y-auto">
          <NestedMenu
            items={menuConfig}
            activeItem={activeTab}
            onItemSelect={setActiveTab}
            className="h-full"
          />
        </div>
      </div>

      {/* Right Side: Top Navigation + Content + Footer */}
      <div className="flex-1 flex flex-col">
        {/* Area 2: Top Navigation (Right Top) */}
        <nav className="bg-white h-20 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {menuConfig.find(
                (item) =>
                  item.id === activeTab ||
                  item.submenu?.find((sub) => sub.id === activeTab),
              )?.label || "Dashboard"}
            </h2>
          </div>

          <UserDropdown
            username={user.username}
            coordinatorAddr={user.coordinatorAddr}
            onLogout={handleLogout}
            onMenuSelect={setActiveTab}
          />
        </nav>

        {/* Area 4: Main Content (Right Middle) */}
        <div className="flex-1 overflow-y-auto p-6">{renderMainContent()}</div>

        {/* Area 5: Footer (Right Bottom) */}
        <Footer />
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          uuid={selectedTask.uuid}
          token={user.token}
          coordinatorAddr={user.coordinatorAddr}
          onClose={handleTaskDetailClose}
        />
      )}
    </div>
  );
}
