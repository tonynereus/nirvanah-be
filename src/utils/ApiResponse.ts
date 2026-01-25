// api-response.ts
export class ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T | null;

  constructor(status: boolean, message: string, data: T | null = null) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  // Static method for success responses
  static success<T = any>(message: string = 'Success', data: T | null = null): ApiResponse<T> {
    return new ApiResponse<T>(true, message, data);
  }

  // Static method for error responses
  static error<T = any>(message: string = 'Error', data: T | null = null): ApiResponse<T> {
    return new ApiResponse<T>(false, message, data);
  }
}
