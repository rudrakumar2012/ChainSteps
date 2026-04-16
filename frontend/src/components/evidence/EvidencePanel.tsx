"use client";

import { useState, useRef } from "react";
import { Button } from "../ui/Button";

interface EvidenceFile {
  name: string;
  ipfsHash: string;
  size: string;
  uploadedAt: string;
}

interface EvidencePanelProps {
  escrowId: string;
  milestoneIndex: number;
  evidenceFiles?: EvidenceFile[];
  onUpload?: (files: File[]) => Promise<void>;
  isLoading?: boolean;
}

export function EvidencePanel({
  escrowId,
  milestoneIndex,
  evidenceFiles = [],
  onUpload,
  isLoading = false,
}: EvidencePanelProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!onUpload || selectedFiles.length === 0) return;
    await onUpload(selectedFiles);
    setSelectedFiles([]);
    setShowUpload(false);
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white">Evidence Files</h4>
          <p className="text-xs text-on-surface-variant">
            Upload files to IPFS as evidence for Milestone {milestoneIndex + 1}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
        >
          <span className="material-symbols-outlined text-sm">
            {showUpload ? "close" : "add"}
          </span>
          {showUpload ? "Cancel" : "Upload"}
        </Button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mb-4 p-6 border-2 border-dashed border-white/10 rounded-xl bg-surface-container-low hover:border-primary/30 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="text-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">
              cloud_upload
            </span>
            <p className="text-sm text-white mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-on-surface-variant">
              Supports any file type. Max 10MB per file.
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-surface-container rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sm text-primary">
                      description
                    </span>
                    <div>
                      <p className="text-sm text-white truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <Button
                variant="primary"
                size="md"
                onClick={handleUpload}
                disabled={isLoading}
                className="w-full mt-3"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Uploading to IPFS...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Upload {selectedFiles.length} file(s) to IPFS
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Evidence Files List */}
      {evidenceFiles.length === 0 && !showUpload ? (
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">
            folder_open
          </span>
          <p className="text-sm text-on-surface-variant">
            No evidence files uploaded yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {evidenceFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm text-primary">
                  description
                </span>
                <div>
                  <p className="text-sm text-white truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-on-surface-variant font-mono">
                    {file.ipfsHash.slice(0, 10)}...{file.ipfsHash.slice(-6)}
                  </p>
                </div>
              </div>
              <a
                href={`https://ipfs.io/ipfs/${file.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}