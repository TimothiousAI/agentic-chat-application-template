/**
 * Placeholder embedding function.
 *
 * In production, replace with a real embedding provider:
 * - OpenAI: text-embedding-3-small (1536 dims) or text-embedding-3-large (3072 dims)
 * - Cohere: embed-english-v3.0 (1024 dims)
 * - Voyage: voyage-3 (1024 dims)
 *
 * The vector dimension must match the column definition in the database schema.
 * Current schema uses 384 dimensions.
 */

const EMBEDDING_DIMENSION = 384;

/**
 * Generate a placeholder embedding vector for a given text.
 * Returns a normalized random vector of the configured dimension.
 *
 * TODO: Replace with real embedding API call.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Simple deterministic-ish placeholder based on text hash
  const vector: number[] = [];
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) | 0;
  }

  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    seed = (seed * 1103515245 + 12345) | 0;
    vector.push(((seed >> 16) & 0x7fff) / 0x7fff - 0.5);
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => v / magnitude);
}

/**
 * Generate embeddings for multiple text chunks.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
  }
  return results;
}
