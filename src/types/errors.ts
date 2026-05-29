/**
 * Custom API error that carries an HTTP status code and a CORS indicator.
 *
 * - CORS / network failures: status = 0, isCorsError = true
 * - HTTP error responses (4xx, 5xx): status = the HTTP status, isCorsError = false
 */
export class ApiError extends Error {
  /** HTTP status code, or 0 when the request never reached the server (CORS / network). */
  public readonly status: number;

  /** True when the error was caused by a CORS policy violation. */
  public readonly isCorsError: boolean;

  constructor(status: number, message: string, isCorsError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isCorsError = isCorsError;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
