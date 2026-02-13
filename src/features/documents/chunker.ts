const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

export interface TextChunk {
  content: string;
  index: number;
}

/**
 * Split text into overlapping chunks for embedding and retrieval.
 * Splits by paragraphs first, then combines or splits to respect chunk size.
 */
export function chunkText(text: string): TextChunk[] {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const chunks: TextChunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    if (currentChunk.length + trimmed.length + 1 > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({ content: currentChunk.trim(), index: chunkIndex });
      chunkIndex++;

      // Keep overlap from end of previous chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-CHUNK_OVERLAP);
      currentChunk = `${overlapWords.join(" ")} ${trimmed}`;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    }

    // Handle paragraphs larger than chunk size
    if (currentChunk.length > CHUNK_SIZE * 2) {
      const words = currentChunk.split(/\s+/);
      let wordChunk = "";
      for (const word of words) {
        if (wordChunk.length + word.length + 1 > CHUNK_SIZE && wordChunk.length > 0) {
          chunks.push({ content: wordChunk.trim(), index: chunkIndex });
          chunkIndex++;
          wordChunk = word;
        } else {
          wordChunk = wordChunk ? `${wordChunk} ${word}` : word;
        }
      }
      currentChunk = wordChunk;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ content: currentChunk.trim(), index: chunkIndex });
  }

  return chunks;
}
