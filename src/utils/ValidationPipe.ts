import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { response } from "express";
import { ApiResponse } from "./ApiResponse";

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        const exceptionResponse = exception.getResponse() as any;

        // Extract validation messages
        let message = 'Validation failed';
        let errors = null;

        if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
            // Multiple validation errors
            errors = exceptionResponse.message;
            message = 'Validation failed : ' + (errors as any)[0];
        } else if (exceptionResponse.message) {
            // Single validation error
            message = exceptionResponse.message;
        }

        const errorResponse = ApiResponse.error(message, { errors });

        response.status(status).json(errorResponse);
    }
}
