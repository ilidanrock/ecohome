import { ErrorAuthTypes } from "@/types/https";
import { CustomError } from "./auth";

export function errorHandle(errorType: ErrorAuthTypes, code: number) {
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {    
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args: unknown[]) {
            try {
                const result = originalMethod.apply(this, args);
                
                if (result instanceof Promise) {
                    return result.catch((error) => {
                        // Customize the error for async functions
                        const customError = new CustomError(
                            errorType,
                            `Error in ${String(propertyKey)}: ${error.message}`,
                            code
                        );
                        throw customError;
                    });
                }           
                return result;
            } catch (error) {
                // Customize the error for sync functions
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                throw new CustomError(
                    errorType,
                    `Error in ${String(propertyKey)}: ${errorMessage}`,
                    500
                );
            }
        };
        
        return descriptor;
    };
}