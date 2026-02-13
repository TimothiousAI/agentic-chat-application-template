import type { HttpStatusCode } from "@/core/api/errors";

export type SharingErrorCode = "SHARE_TOKEN_NOT_FOUND" | "SHARE_TOKEN_EXPIRED";

export class SharingError extends Error {
  readonly code: SharingErrorCode;
  readonly statusCode: HttpStatusCode;

  constructor(message: string, code: SharingErrorCode, statusCode: HttpStatusCode) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ShareTokenNotFoundError extends SharingError {
  constructor(token: string) {
    super(`Share token not found: ${token}`, "SHARE_TOKEN_NOT_FOUND", 404);
  }
}

export class ShareTokenExpiredError extends SharingError {
  constructor(token: string) {
    super(`Share token expired: ${token}`, "SHARE_TOKEN_EXPIRED", 410);
  }
}
