"use client";

import { Button } from "@/src/components/ui/button";
import { FileChip } from "@/src/components/ui/file-chip";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/general-utils";
import { formatBytes } from "@/src/lib/file-utils";
import { ALLOWED_FILE_EXTENSIONS } from "@garzaglue/shared";
import { AlertTriangle, ChevronUp, Mic, MicOff, Paperclip, Send, Square } from "lucide-react";
import React, { useCallback, useEffect, useRef } from "react";
import { useAgentContext } from "./AgentContextProvider";

interface WebSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { length: number; [index: number]: { isFinal: boolean; 0: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

export interface AgentInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
  maxLength?: number;
  compact?: boolean;
  showCharCount?: boolean;
  inputContainerRef?: React.RefObject<HTMLDivElement | null>;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  containerClassName?: string;
  inputClassName?: string;
  scrollToBottom?: () => void;
}

export function AgentInputArea({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  placeholder = "Message Garza Glue...",
  maxLength = 50000,
  compact = false,
  showCharCount = false,
  inputContainerRef,
  inputRef: inputRefProp,
  containerClassName,
  inputClassName,
  scrollToBottom,
}: AgentInputAreaProps) {
  const internalInputRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = inputRefProp ?? internalInputRef;

  const {
    pendingFiles,
    sessionFiles,
    isProcessingFiles,
    isDragging,
    fileInputRef,
    handleFilesUpload,
    handlePendingFileRemove,
    handleSessionFileRemove,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  } = useAgentContext();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && value.length <= maxLength) {
          onSend();
          scrollToBottom?.();
        }
      }
    },
    [value, maxLength, onSend, scrollToBottom],
  );

  useEffect(() => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    const maxH = compact ? 100 : 200;
    if (compact && !value.trim()) {
      el.style.height = "52px";
      return;
    }
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, [value, compact]);

  // Voice recording state
  const [isRecording, setIsRecording] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recognitionRef = React.useRef<WebSpeechRecognition | null>(null);
  const [speechSupported, setSpeechSupported] = React.useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition: WebSpeechRecognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      let finalTranscript = value;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + transcript;
            onChange(finalTranscript);
          } else {
            interim = transcript;
          }
        }
        if (interim) {
          onChange(finalTranscript + (finalTranscript ? " " : "") + interim);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } else {
      // Fallback: record audio as file attachment
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          const chunks: BlobPart[] = [];

          mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
          mediaRecorder.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            const blob = new Blob(chunks, { type: "audio/webm" });
            const file = new File([blob], `voice-memo-${Date.now()}.webm`, {
              type: "audio/webm",
            });
            handleFilesUpload([file]);
            setIsRecording(false);
          };

          mediaRecorderRef.current = mediaRecorder;
          mediaRecorder.start();
          setIsRecording(true);
        })
        .catch(() => {
          setIsRecording(false);
        });
    }
  }, [isRecording, value, onChange, handleFilesUpload]);

  const canSend = value.trim() && value.length <= maxLength;
  const showCount = showCharCount && value.length > maxLength * 0.8;

  return (
    <div
      ref={inputContainerRef}
      className={cn(!compact && "flex-shrink-0 bg-background/95 backdrop-blur-sm")}
    >
      <div className={cn(compact ? "p-0" : "mx-0 sm:mx-2 lg:mx-6 pb-4 px-2 sm:px-4")}>
        <div className={cn(!compact && "max-w-7xl mx-auto")}>
          <div
            className={cn(
              "relative flex flex-col overflow-hidden transition-all duration-200",
              "bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20",
              "backdrop-blur-sm border border-border/50",
              "hover:border-border/80 focus-within:border-border/80",
              compact
                ? "rounded-lg gap-1 shadow-sm"
                : "rounded-2xl gap-2 shadow-sm hover:shadow-md focus-within:shadow-md",
              containerClassName,
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isDragging && (
              <div
                className={cn(
                  "absolute inset-0 bg-primary/10 border-2 border-dashed border-primary z-10 flex items-center justify-center backdrop-blur-sm",
                  compact ? "rounded-lg" : "rounded-2xl",
                )}
              >
                <div className="text-primary font-medium text-sm">Drop files here</div>
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className={cn("flex flex-wrap gap-2", compact ? "px-3 pt-2" : "px-4 pt-3")}>
                {pendingFiles.map((file) => (
                  <FileChip
                    key={file.key}
                    file={file}
                    onRemove={handlePendingFileRemove}
                    size="compact"
                    rounded="md"
                    showOriginalName={true}
                    maxWidth="300px"
                  />
                ))}
              </div>
            )}

            <div
              className={cn(
                "relative flex items-center gap-2",
                compact ? "px-1.5 pb-1 pt-0.5" : "",
              )}
            >
              <input
                ref={fileInputRef as React.RefObject<HTMLInputElement>}
                type="file"
                multiple
                accept={ALLOWED_FILE_EXTENSIONS.join(",")}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesUpload(Array.from(e.target.files));
                    e.target.value = "";
                  }
                }}
              />

              <Textarea
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={compact ? 2 : undefined}
                className={cn(
                  "flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                  compact
                    ? "!min-h-[32px] max-h-[100px] text-sm py-1.5 px-2 pr-20"
                    : "min-h-[44px] max-h-[200px] text-[15px] py-3 px-4 pr-28",
                  inputClassName,
                )}
              />

              <div
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5",
                  compact && "right-2 gap-1",
                )}
              >
                <div
                  className={cn(
                    "flex items-center rounded-xl overflow-hidden",
                    "bg-gradient-to-br from-white/60 to-white/30 dark:from-white/10 dark:to-white/5",
                    "backdrop-blur-sm border border-black/5 dark:border-white/10",
                  )}
                >
                  {sessionFiles.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-all",
                            "border-r border-black/5 dark:border-white/10",
                            compact ? "h-8 px-1.5 min-w-[14px]" : "h-9 px-2 min-w-[16px]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full",
                              compact ? "h-3.5 px-1 min-w-[14px]" : "h-4 px-1 min-w-[16px]",
                            )}
                          >
                            {sessionFiles.length}
                          </span>
                          <ChevronUp className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className={cn(
                          "w-auto min-w-[250px] max-w-[280px] p-3",
                          "bg-gradient-to-br from-white/90 to-white/70 dark:from-neutral-900/95 dark:to-neutral-900/80",
                          "backdrop-blur-xl border border-black/10 dark:border-white/10",
                          "shadow-lg shadow-black/10 dark:shadow-black/30",
                        )}
                        align="end"
                        side="top"
                        sideOffset={8}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-foreground/70">
                            Session Files
                          </span>
                          <span className="text-xs text-muted-foreground/60">
                            {formatBytes(sessionFiles.reduce((acc, f) => acc + (f.size || 0), 0))}
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
                          {sessionFiles.map((file) => (
                            <FileChip
                              key={file.key}
                              file={file}
                              onRemove={handleSessionFileRemove}
                              size="compact"
                              rounded="md"
                              showOriginalName={true}
                              showSize={true}
                              className="w-full"
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "p-0 rounded-none border-0 bg-transparent hover:bg-black/5 dark:hover:bg-white/10",
                      "text-muted-foreground hover:text-foreground transition-all",
                      compact ? "h-8 w-8" : "h-9 w-9",
                    )}
                    onClick={() => (fileInputRef.current as HTMLInputElement | null)?.click()}
                    disabled={isProcessingFiles}
                  >
                    <Paperclip className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "p-0 rounded-xl",
                    isRecording
                      ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse"
                      : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground",
                    "transition-all",
                    compact ? "h-8 w-8" : "h-9 w-9",
                  )}
                  onClick={handleToggleRecording}
                  disabled={isLoading}
                  title={isRecording ? "Stop recording" : "Voice input"}
                >
                  {isRecording ? (
                    <MicOff className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
                  ) : (
                    <Mic className={cn(compact ? "w-4 h-4" : "w-5 h-5")} />
                  )}
                </Button>

                <Button
                  onClick={isLoading ? onStop : onSend}
                  disabled={!isLoading && (!canSend || !value.trim())}
                  size="sm"
                  className={cn(
                    "p-0 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground shadow-sm",
                    compact ? "h-8 w-8" : "h-9 w-9",
                  )}
                  variant="default"
                >
                  {isLoading ? (
                    <Square className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                  ) : (
                    <Send className={cn(compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {showCount && (
            <div className="flex justify-start items-center mt-2 px-2">
              <span
                className={cn(
                  "text-xs",
                  value.length > maxLength
                    ? "text-amber-600 dark:text-amber-500 font-medium"
                    : "text-muted-foreground/60",
                )}
              >
                {value.length > maxLength ? (
                  <>
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {value.length.toLocaleString()}/{maxLength.toLocaleString()} chars
                  </>
                ) : (
                  `${value.length.toLocaleString()}/${maxLength.toLocaleString()} chars`
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
