/**
 * Progress Tracking Types
 * Source of truth for all progress reporting structures
 */

// === PROGRESS BASE TYPES ===

export interface ProgressUpdate {
  step: string;
  progress: number; // 0-100
  message: string;
  timestamp: string;
  repoName?: string;
  data?: any;
  currentStep?: string; // For backward compatibility
}

// === SPECIFIC PROGRESS TYPES ===

export interface FileDownloadProgress extends ProgressUpdate {
  step: 'downloading_files';
  repoName: string;
  fileName: string;
  fileIndex: number;
  totalFiles: number;
  downloadedFiles: string[];
  skippedFiles: string[];
  currentStep?: string; // For backward compatibility
}

export interface AIParsingProgress extends ProgressUpdate {
  step: 'parsing_ai';
  repoName: string;
  provider: string;
  stage: 'preparing' | 'calling_api' | 'parsing_response' | 'validating' | 'complete';
  tokenCount?: number;
  methodsFound?: number;
  currentStep?: string; // For backward compatibility
}

export interface RepoAnalysisProgress extends ProgressUpdate {
  step: 'fetching_repo';
  repoName: string;
  stage: 'starting' | 'fetching' | 'complete';
  currentStep?: string; // For backward compatibility
}

export interface SearchProgress extends ProgressUpdate {
  currentRepo?: string;
  totalRepos: number;
  completedRepos: number;
  failedRepos: string[];
}

export interface ComputingMetricsProgress extends ProgressUpdate {
  step: 'computing_metrics';
  repoName: string;
  stage: 'analyzing' | 'classifying' | 'validating' | 'complete';
}

// === PROGRESS RESULT TYPES ===

export type ProgressResult<T> = {
  type: 'progress';
  data: ProgressUpdate;
} | {
  type: 'result';
  data: T;
};

export type ProgressCallback = (progress: ProgressUpdate) => void;

export interface ProgressOptions {
  enableProgress?: boolean;
  progressCallback?: ProgressCallback;
  reportInterval?: number; // milliseconds
}

// === UTILITY FUNCTIONS ===

export function createProgressUpdate(
  step: string,
  progress: number,
  message: string,
  repoName?: string,
  data?: any
): ProgressUpdate {
  return {
    step,
    progress: Math.max(0, Math.min(100, progress)),
    message,
    timestamp: new Date().toISOString(),
    repoName,
    data
  };
}

export function createFileDownloadProgress(
  repoName: string,
  fileName: string,
  fileIndex: number,
  totalFiles: number,
  downloadedFiles: string[],
  skippedFiles: string[]
): FileDownloadProgress {
  const progress = Math.round((fileIndex / totalFiles) * 100);
  return {
    step: 'downloading_files',
    progress,
    message: `Downloading ${fileName} (${fileIndex}/${totalFiles})`,
    timestamp: new Date().toISOString(),
    repoName,
    fileName,
    fileIndex,
    totalFiles,
    downloadedFiles,
    skippedFiles
  };
}

export function createAIParsingProgress(
  repoName: string,
  provider: string,
  stage: AIParsingProgress['stage'],
  progress: number,
  tokenCount?: number,
  methodsFound?: number
): AIParsingProgress {
  const stageMessages = {
    preparing: 'Preparing AI analysis',
    calling_api: `Calling ${provider} API`,
    parsing_response: 'Parsing AI response',
    validating: 'Validating results',
    complete: 'AI analysis complete'
  };

  return {
    step: 'parsing_ai',
    progress,
    message: stageMessages[stage],
    timestamp: new Date().toISOString(),
    repoName,
    provider,
    stage,
    tokenCount,
    methodsFound
  };
}

export function createRepoAnalysisProgress(
  repoName: string,
  stage: RepoAnalysisProgress['stage'],
  progress: number
): RepoAnalysisProgress {
  const stageMessages = {
    starting: 'Starting repository analysis',
    fetching: 'Fetching repository data',
    complete: 'Repository fetch complete'
  };

  return {
    step: 'fetching_repo',
    progress,
    message: stageMessages[stage],
    timestamp: new Date().toISOString(),
    repoName,
    stage
  };
}

export function createSearchProgress(
  totalRepos: number,
  completedRepos: number,
  failedRepos: string[],
  currentRepo?: string
): SearchProgress {
  const progress = Math.round((completedRepos / totalRepos) * 100);
  const message = currentRepo 
    ? `Analyzing ${currentRepo} (${completedRepos}/${totalRepos})`
    : `Completed ${completedRepos}/${totalRepos} repositories`;

  return {
    step: 'search_progress',
    progress,
    message,
    timestamp: new Date().toISOString(),
    currentRepo,
    totalRepos,
    completedRepos,
    failedRepos
  };
}

// === TYPE GUARDS ===

export function isProgressUpdate(obj: any): obj is ProgressUpdate {
  return obj && 
    typeof obj.step === 'string' && 
    typeof obj.progress === 'number' && 
    typeof obj.message === 'string' &&
    typeof obj.timestamp === 'string';
}

export function isFileDownloadProgress(obj: any): obj is FileDownloadProgress {
  return isProgressUpdate(obj) &&
    obj.step === 'downloading_files' &&
    typeof (obj as FileDownloadProgress).fileName === 'string' &&
    typeof (obj as FileDownloadProgress).fileIndex === 'number';
}

export function isAIParsingProgress(obj: any): obj is AIParsingProgress {
  return isProgressUpdate(obj) &&
    obj.step === 'parsing_ai' &&
    typeof (obj as AIParsingProgress).provider === 'string' &&
    typeof (obj as AIParsingProgress).stage === 'string';
}

export function isRepoAnalysisProgress(obj: any): obj is RepoAnalysisProgress {
  return isProgressUpdate(obj) &&
    obj.step === 'fetching_repo' &&
    typeof (obj as RepoAnalysisProgress).stage === 'string';
}
