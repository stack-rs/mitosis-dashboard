// TypeScript interfaces matching the Python SDK schemas

// Enums matching Python SDK
export enum TaskState {
  PENDING = "Pending",
  READY = "Ready",
  RUNNING = "Running",
  FINISHED = "Finished",
  CANCELLED = "Cancelled",
  UNKNOWN = "Unknown",
}

export enum ArtifactContentType {
  RESULT = "result",
  EXEC_LOG = "exec-log",
  STD_LOG = "std-log",
}

export enum AttachmentContentType {
  NOT_SET = "NotSet",
}

export enum GroupWorkerRole {
  READ = "Read",
  WRITE = "Write",
  ADMIN = "Admin",
}

export enum TaskExecState {
  WORKER_EXITED = "WorkerExited",
  FETCH_RESOURCE = "FetchResource",
  FETCH_RESOURCE_FINISHED = "FetchResourceFinished",
  FETCH_RESOURCE_ERROR = "FetchResourceError",
  FETCH_RESOURCE_TIMEOUT = "FetchResourceTimeout",
  FETCH_RESOURCE_NOT_FOUND = "FetchResourceNotFound",
  FETCH_RESOURCE_FORBIDDEN = "FetchResourceForbidden",
  WATCH = "Watch",
  WATCH_FINISHED = "WatchFinished",
  WATCH_TIMEOUT = "WatchTimeout",
  EXEC_PENDING = "ExecPending",
  EXEC_SPAWNED = "ExecSpawned",
  EXEC_FINISHED = "ExecFinished",
  EXEC_TIMEOUT = "ExecTimeout",
  UPLOAD_RESULT = "UploadResult",
  UPLOAD_FINISHED_RESULT = "UploadFinishedResult",
  UPLOAD_CANCELLED_RESULT = "UploadCancelledResult",
  UPLOAD_RESULT_FINISHED = "UploadResultFinished",
  UPLOAD_RESULT_TIMEOUT = "UploadResultTimeout",
  TASK_COMMITTED = "TaskCommitted",
  UNKNOWN = "Unknown",
}

export enum TaskResultMessage {
  FETCH_RESOURCE_TIMEOUT = "FetchResourceTimeout",
  EXEC_TIMEOUT = "ExecTimeout",
  UPLOAD_RESULT_TIMEOUT = "UploadResultTimeout",
  RESOURCE_NOT_FOUND = "ResourceNotFound",
  RESOURCE_FORBIDDEN = "ResourceForbidden",
  WATCH_TIMEOUT = "WatchTimeout",
  USER_CANCELLATION = "UserCancellation",
}

// Base interfaces
export interface UserLoginArgs {
  username: string;
  password: string;
  retain?: boolean;
}

export interface UserLoginReq {
  username: string;
  md5_password: number[]; // Array of 16 integers
  retain?: boolean;
}

export interface UserLoginResp {
  token: string;
}

export interface RemoteResourceArtifact {
  uuid: string;
  content_type: ArtifactContentType;
}

export interface RemoteResourceAttachment {
  key: string;
}

export interface RemoteResource {
  Artifact?: RemoteResourceArtifact;
  Attachment?: RemoteResourceAttachment;
}

export interface RemoteResourceDownload {
  remote_file: RemoteResource;
  local_path: string;
}

export interface RemoteResourceDownloadResp {
  url: string;
  size: number;
}

export interface TaskSpec {
  args: string[];
  envs?: { [key: string]: string };
  resources?: RemoteResourceDownload[];
  terminal_output?: boolean;
  watch?: [string, TaskExecState] | null; // [UUID4, TaskExecState]
}

export interface TaskResultSpec {
  exit_status: number;
  msg?: TaskResultMessage | null;
}

export interface TasksQueryReq {
  creator_usernames?: string[] | null;
  group_name?: string | null;
  tags?: string[] | null;
  labels?: string[] | null;
  states?: TaskState[] | null;
  exit_status?: string | null;
  priority?: string | null;
  limit?: number | null;
  offset?: number | null;
  count?: boolean;
}

export interface TaskQueryInfo {
  uuid: string;
  creator_username: string;
  group_name: string;
  task_id: number;
  tags: string[];
  labels: string[];
  created_time: string;
  started_time?: string;
  finished_time?: string;
  state: TaskState;
  exit_status?: number;
  timeout: number;
  priority: number;
  spec: any; // Raw spec object
  result?: any | null;
  assigned_worker_uuid?: string;
}

export interface ParsedTaskQueryInfo {
  uuid: string;
  creator_username: string;
  group_name: string;
  task_id: number;
  tags: string[];
  labels: string[];
  created_at: string;
  updated_at: string;
  state: TaskState;
  timeout: number;
  priority: number;
  spec: TaskSpec;
  result?: TaskResultSpec | null;
}

export interface TasksQueryResp {
  count: number;
  tasks: TaskQueryInfo[];
  group_name: string;
}

export interface ArtifactQueryResp {
  content_type: ArtifactContentType;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface TaskQueryResp {
  info: ParsedTaskQueryInfo;
  artifacts: ArtifactQueryResp[];
}

export interface SubmitTaskReq {
  group_name: string;
  tags?: string[];
  labels?: string[];
  timeout?: string;
  priority?: number;
  task_spec: TaskSpec;
}

export interface SubmitTaskResp {
  task_id: number;
  uuid: string;
}

export interface UploadArtifactReq {
  content_type: ArtifactContentType;
  content_length: number;
}

export interface UploadArtifactResp {
  url: string;
}

export interface UploadAttachmentReq {
  key: string;
  content_length: number;
}

export interface UploadAttachmentResp {
  url: string;
}

export interface AttachmentMetadata {
  key: string;
  content_type?: string;
  content_length: number;
  created_time: string;
  updated_time?: string;
}

export interface AttachmentsQueryResp {
  attachments: AttachmentMetadata[];
  count: number;
}

