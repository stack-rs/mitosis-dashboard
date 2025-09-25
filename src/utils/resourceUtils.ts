import type {
  RemoteResourceDownload,
  ArtifactContentType,
} from "../types/schemas";

/**
 * Parse resource lines into RemoteResourceDownload objects
 * Supports two formats:
 * 1. artifacts={uuid}:{content_type}:{local_path}
 * 2. attachments={key}:{local_path}
 */
export function parseResourceLines(
  resourceText: string,
): RemoteResourceDownload[] {
  const resourcesArray: RemoteResourceDownload[] = [];

  if (!resourceText.trim()) {
    return resourcesArray;
  }

  const resourceLines = resourceText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of resourceLines) {
    // Check for artifacts format: artifacts={uuid}:{content_type}:{local_path}
    if (line.startsWith("artifacts=")) {
      const content = line.substring("artifacts=".length);
      const parts = content.split(":");

      if (parts.length >= 3) {
        const [uuid, contentType, ...localPathParts] = parts;
        const localPath = localPathParts.join(":");

        if (uuid && contentType) {
          resourcesArray.push({
            remote_file: {
              Artifact: {
                uuid: uuid,
                content_type: contentType as ArtifactContentType,
              },
            },
            local_path: localPath,
          });
        }
      }
    }
    // Check for attachments format: attachments={key}:{local_path}
    else if (line.startsWith("attachments=")) {
      const content = line.substring("attachments=".length);
      const parts = content.split(":");

      if (parts.length >= 2) {
        const [key, ...localPathParts] = parts;
        const localPath = localPathParts.join(":");

        if (key) {
          resourcesArray.push({
            remote_file: {
              Attachment: {
                key: key,
              },
            },
            local_path: localPath,
          });
        }
      }
    }
    // For backward compatibility, also support the old format: type:value:path
    else {
      const parts = line.split(":");
      if (parts.length >= 3) {
        const [type, value, ...localPathParts] = parts;
        const localPath = localPathParts.join(":");

        if (type === "artifact" && value) {
          resourcesArray.push({
            remote_file: {
              Artifact: {
                uuid: value,
                content_type: "result" as ArtifactContentType,
              },
            },
            local_path: localPath,
          });
        } else if (type === "attachment" && value) {
          resourcesArray.push({
            remote_file: {
              Attachment: {
                key: value,
              },
            },
            local_path: localPath,
          });
        }
      }
    }
  }

  return resourcesArray;
}
