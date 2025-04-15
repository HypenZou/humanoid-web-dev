import React, { useState, useCallback, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Upload, X, AlertCircle, CheckCircle, Folder } from "lucide-react";
import LoadingOverlay from "@achmadk/react-loading-overlay";
import { Toast, ProgressBar, Spinner } from "react-bootstrap";
import { ToastProvider, useToast } from "./ToastProvider";
import { v4 as uuidv4 } from "uuid";
import { formData } from "zod-form-data";
import axios, { AxiosProgressEvent } from "axios";
import { UploadRequest } from "@/types/models";
import { OpensourceLicence } from "@/types/licence";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  relativePath?: string;
}

interface TagCategory {
  name: string;
  tags: string[];
}

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<TagCategory[]>([]);
  const [license, setLicense] = useState<OpensourceLicence>("MIT");
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const { showToast } = useToast();

  const LICENSES = ["MIT", "Apache 2.0", "BSD", "GPL", "Creative Commons"];

  const validateModelName = (value: string): string | null => {
    if (!value) {
      return "Model name is required";
    }

    // Check length
    if (value.length > 255) {
      return "Model name must be less than 255 characters";
    }

    // Check for valid characters (alphanumeric, hyphen, underscore)
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
      return "Model name can only contain letters, numbers, hyphens, and underscores, and must start with a letter or number";
    }

    return null;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setNameError(validateModelName(newName));
  };

  useEffect(() => {
    fetchTags();
    fetchUserProfile();
  }, []);

  const fetchTags = async () => {
    try {
      const { data: tagData, error } = await supabase
        .from("tags")
        .select("category, name")
        .order("category")
        .order("name");
      console.log(tagData, error);

      if (error) throw error;

      // Group tags by category
      const groupedTags = tagData.reduce((acc: TagCategory[], tag) => {
        const existingCategory = acc.find((c) => c.name === tag.category);
        if (existingCategory) {
          existingCategory.tags.push(tag.name);
        } else {
          acc.push({ name: tag.category, tags: [tag.name] });
        }
        return acc;
      }, []);

      setAvailableTags(groupedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      showToast("Failed to load tags", "danger");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setDisplayName(data.display_name || user.email?.split("@")[0] || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const processFiles = async (items: DataTransferItemList) => {
    const newFiles: UploadFile[] = [];

    const readEntry = async (entry: FileSystemEntry, path = "") => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        await new Promise<void>((resolve) => {
          fileEntry.file((file) => {
            newFiles.push({
              id: uuidv4(),
              file,
              progress: 0,
              status: "pending",
              relativePath: path ? `${path}/${file.name}` : file.name,
            });
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();

        await new Promise<void>((resolve) => {
          const readEntries = async () => {
            dirReader.readEntries(async (entries) => {
              if (entries.length === 0) {
                resolve();
                return;
              }

              await Promise.all(
                entries.map((entry) =>
                  readEntry(
                    entry,
                    path ? `${path}/${dirEntry.name}` : dirEntry.name
                  )
                )
              );

              readEntries();
            });
          };
          readEntries();
        });
      }
    };

    await Promise.all(
      Array.from(items)
        .map((item) => item.webkitGetAsEntry())
        .filter((entry): entry is FileSystemEntry => entry !== null)
        .map((entry) => readEntry(entry))
    );

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      await processFiles(e.dataTransfer.items);
    } else {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  }, []);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      console.log(selectedFiles);
      const newFiles: UploadFile[] = selectedFiles.map((file) => {
        let relativePath = file.webkitRelativePath ? file.webkitRelativePath.substring(file.webkitRelativePath.indexOf('/') + 1) : undefined;
        relativePath = relativePath || file.name;
        return {
          id: uuidv4(),
          file,
          progress: 0,
          status: "pending",
          relativePath: relativePath,
        };
      });
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: "pending",
      relativePath: file.name,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleTagSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value;
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const uploadFile = async (file: UploadFile, filePathPrefix: string) => {
    try {
      const filePath = `${filePathPrefix}/${
        file.relativePath || file.file.name
      }`;

      // Upload file to Supabase storage
      const url = `${process.env
        .NEXT_PUBLIC_SUPABASE_URL!}/storage/v1/object/models/${filePath}`;
      let session = await supabase.auth.getSession();
      // @ts-ignore
      const headers = supabase.auth.headers;
      headers["Authorization"] = `Bearer ${session.data.session!.access_token}`;
      console.log(headers);

      const formData = new FormData();
      formData.append("cacheControl", "3600");
      formData.append("", file.file);
      let r = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...headers,
        },
        onUploadProgress: (evt: AxiosProgressEvent) => {
          const percentage =
            Math.round(evt.loaded / (evt.total || Infinity)) * 100;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, progress: percentage, status: "uploading" }
                : f
            )
          );
        },
      });
      if (r.status != 200) throw new Error("Upload Failed!");

      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, progress: 100, status: "completed" } : f
        )
      );
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? { ...f, status: "error", error: "Upload failed" }
            : f
        )
      );
      throw error;
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    const nameValidationError = validateModelName(name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    setUploading(true);
    try {
      const auth = await supabase.auth.getUser();
      if (!auth.data.user) throw new Error("Not authenticated");

      // upload file
      const filePathPrefix = `${auth.data.user.id}/${name}-${Date.now()}`;
      await Promise.all(files.map((file) => uploadFile(file, filePathPrefix)));
      showToast("All files uploaded successfully", "success");

      // update database
      let token = (await supabase.auth.getSession()).data.session
        ?.access_token!;
      let modelName = `${displayName}/${name}`;
      let req: UploadRequest = {
        name: modelName,
        description,
        tags,
        license,
        folder_path: filePathPrefix,
      };
      let resp = await fetch("/api/upload", {
        method: "POST",
        headers: {
          authorization: token,
        },
        body: JSON.stringify(req),
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        showToast(error.message, "danger");
      } else {
        showToast("unknown error when upload model", "danger");
      }
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      case "uploading":
        return <Spinner animation="border" size="sm" variant="primary" />;
      default:
        return null;
    }
  };

  const getProgressVariant = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "error":
        return "danger";
      case "uploading":
        return "primary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Upload Models</h1>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"
            >
              <div>
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-2">
                  Drag and drop your model files or folder here, or{" "}
                  <label className="text-blue-600 cursor-pointer hover:text-blue-700 mr-2">
                    browse files
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(e) =>
                        e.target.files && addFiles(Array.from(e.target.files))
                      }
                    />
                  </label>
                  <label className="text-blue-600 cursor-pointer hover:text-blue-700">
                    select folder
                    <input
                      type="file"
                      className="hidden"
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={handleFolderSelect}
                    />
                  </label>
                </p>
                <p className="text-gray-500 text-sm">
                  Supported formats: .pth, .onnx, .h5, .pb
                </p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">
                          {file.relativePath || file.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(file.status)}
                        {file.status !== "completed" && (
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                    <ProgressBar
                      now={file.progress}
                      variant={getProgressVariant(file.status)}
                      label={`${file.progress}%`}
                      animated={file.status === "uploading"}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Model Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Model Name
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 px-3 py-2 rounded-l-lg text-gray-600 border border-r-0 border-gray-300">
                  {displayName}/
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className={`flex-1 px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    nameError ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
              </div>
              {nameError && (
                <p className="mt-1 text-sm text-red-500">{nameError}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Only letters, numbers, hyphens, and underscores are allowed.
                Must start with a letter or number.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={handleTagSelect}
                value=""
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a tag...</option>
                {availableTags.map((category) => (
                  <optgroup key={category.name} label={category.name}>
                    {category.tags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* License */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                License
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {LICENSES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={files.length === 0 || uploading || !!nameError}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {uploading ? "Uploading..." : "Upload Models"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
