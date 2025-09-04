import React, { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import TaskSubmissionForm from "./TaskSubmissionForm";
import TaskQueryForm from "./TaskQueryForm";
import TaskQueryByUuid from "./TaskQueryByUuid";
import TaskLabelsManager from "./TaskLabelsManager";
import TaskList from "./TaskList";
import TaskDetail from "./TaskDetail";
import FileUploader from "./FileUploader";
import AttachmentManager from "./AttachmentManager";
import AttachmentQueryManager from "./AttachmentQueryManager";
import AttachmentDownload from "./AttachmentDownload";
import AttachmentDelete from "./AttachmentDelete";
import AttachmentList from "./AttachmentList";
import ArtifactManager from "./ArtifactManager";
import ArtifactUpload from "./ArtifactUpload";
import ArtifactDelete from "./ArtifactDelete";
import RedisConnection from "./RedisConnection";
import UserManagement from "./UserManagement";
import WorkerManagement from "./WorkerManagement";
import GroupManagement from "./GroupManagement";
import AdminManagement from "./AdminManagement";
import { NestedMenu, menuConfig } from "./NestedMenu";
import { authUtils, type UserSession } from "../utils/auth";
import type {
  TaskQueryInfo,
  TasksQueryResp,
  SubmitTaskResp,
} from "../types/schemas";

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
  const [tasks, setTasks] = useState<TaskQueryInfo[]>([]);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState<TaskQueryInfo | null>(null);
  const [uploadContext, setUploadContext] = useState<{
    uuid?: string;
    groupName?: string;
  }>({});

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

  const handleLogout = () => {
    authUtils.clearSession();
    setUser(null);
    setActiveTab("overview");
    setTasks([]);
    setSelectedTask(null);
    setUploadContext({});
  };

  const handleTaskSubmitted = (response: SubmitTaskResp) => {
    // Update upload context with the new task UUID
    setUploadContext({ uuid: response.uuid, groupName: user?.username });

    // Show success message with option to view artifacts
    alert(
      `Task submitted successfully!\nTask ID: ${response.task_id}\nUUID: ${response.uuid}\n\nYou can now upload artifacts for this task.`,
    );
  };

  const handleTasksFound = (response: TasksQueryResp) => {
    setTasks(response.tasks);
    setTotalTaskCount(response.count);
  };

  const handleTaskClick = (task: TaskQueryInfo) => {
    setSelectedTask(task);
  };

  const handleTaskDetailClose = () => {
    setSelectedTask(null);
  };

  const handleRefreshTasks = () => {
    // This could trigger a re-query, but for now just clear the list
    setTasks([]);
    setTotalTaskCount(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            Mitosis Dashboard
          </div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
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
          <TaskSubmissionForm
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
            onTaskSubmitted={handleTaskSubmitted}
          />
        );

      case "tasks.query":
        return (
          <TaskQueryByUuid
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "tasks.list":
        return (
          <div className="space-y-8">
            <TaskQueryForm
              token={user.token}
              coordinatorAddr={user.coordinatorAddr}
              username={user.username}
              onTasksFound={handleTasksFound}
            />
            {tasks.length > 0 && (
              <TaskList
                tasks={tasks}
                totalCount={totalTaskCount}
                onTaskClick={handleTaskClick}
                onRefresh={handleRefreshTasks}
              />
            )}
          </div>
        );

      case "tasks.labels":
        return (
          <TaskLabelsManager
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      // Artifacts
      case "artifacts.upload":
        return (
          <ArtifactUpload
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "artifacts.download":
      case "artifacts.manage":
        return (
          <ArtifactManager
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
            activeView={activeTab}
          />
        );

      case "artifacts.delete":
        return (
          <ArtifactDelete
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      // Attachments
      case "attachments.upload":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Attachment</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name (required for attachment upload)
                </label>
                <input
                  type="text"
                  value={uploadContext.groupName || user.username}
                  onChange={(e) =>
                    setUploadContext({
                      ...uploadContext,
                      groupName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                />
              </div>
            </div>
            <FileUploader
              token={user.token}
              coordinatorAddr={user.coordinatorAddr}
              type="attachment"
              groupName={uploadContext.groupName || user.username}
            />
          </div>
        );

      case "attachments.download":
        return (
          <AttachmentDownload
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.query":
        return (
          <AttachmentQueryManager
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.delete":
        return (
          <AttachmentDelete
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.list":
        return (
          <AttachmentList
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
          />
        );

      case "attachments.manage":
        return (
          <AttachmentManager
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            groupName={uploadContext.groupName || user.username}
          />
        );

      // Users
      case "users.profile":
      case "users.password":
      case "users.groups":
        return (
          <UserManagement
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
            activeView={activeTab}
          />
        );

      // Workers
      case "workers.query":
      case "workers.manage":
      case "workers.tags":
        return (
          <WorkerManagement
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
            activeView={activeTab}
          />
        );

      // Groups
      case "groups.create":
      case "groups.manage":
      case "groups.roles":
      case "groups.storage":
        return (
          <GroupManagement
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
            activeView={activeTab}
          />
        );

      // Admin
      case "admin.users":
      case "admin.workers":
      case "admin.groups":
      case "admin.storage":
      case "admin.system":
        return (
          <AdminManagement
            token={user.token}
            coordinatorAddr={user.coordinatorAddr}
            username={user.username}
            activeView={activeTab}
          />
        );

      // Redis
      case "redis":
        return (
          <RedisConnection
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
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-900">Mitosis Dashboard</h1>
          <div className="text-xs text-gray-500">Transport Evaluation</div>
        </div>

        <NestedMenu
          items={menuConfig}
          activeItem={activeTab}
          onItemSelect={setActiveTab}
          className="h-full"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-md border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {menuConfig.find(
                    (item) =>
                      item.id === activeTab ||
                      item.submenu?.find((sub) => sub.id === activeTab),
                  )?.label || "Dashboard"}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium">{user.username}</span>
                  <span className="mx-2">•</span>
                  <span className="font-mono text-xs">
                    {user.coordinatorAddr}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  title="Logout"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 p-6">{renderMainContent()}</div>
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
