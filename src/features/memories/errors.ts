import type { HttpStatusCode } from "@/core/api/errors";

export type MemoryErrorCode = "MEMORY_NOT_FOUND";

export class MemoryError extends Error {
  readonly code: MemoryErrorCode;
  readonly statusCode: HttpStatusCode;

  constructor(message: string, code: MemoryErrorCode, statusCode: HttpStatusCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class MemoryNotFoundError extends MemoryError {
  constructor(id: string) {
    super(`Memory not found: ${id}`, "MEMORY_NOT_FOUND", 404);
  }
}
