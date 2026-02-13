export interface DetectedArtifact {
  type: "code" | "text";
  language?: string | undefined;
  content: string;
  startIndex: number;
  endIndex: number;
}

const CODE_FENCE_REGEX = /```(\w+)?\n([\s\S]*?)```/g;

export function detectArtifacts(content: string): DetectedArtifact[] {
  const artifacts: DetectedArtifact[] = [];

  let match: RegExpExecArray | null = CODE_FENCE_REGEX.exec(content);
  while (match !== null) {
    const language = match[1] ?? undefined;
    const codeContent = match[2] ?? "";

    if (codeContent.trim().length > 50) {
      artifacts.push({
        type: "code",
        language,
        content: codeContent.trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
    match = CODE_FENCE_REGEX.exec(content);
  }

  return artifacts;
}
