package com.billing.config.Response.data;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


public final class ApiResponseBuilder {

    private ApiResponseBuilder() {
        // Prevent object creation
    }

    // =========================
    // 200 OK
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> success(
            String message,
            T data
    ) {

        return build(
                ApiStatus.SUCCESS,
                message,
                data,
                HttpStatus.OK
        );
    }


    // =========================
    // 201 CREATED
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> created(
            String message,
            T data
    ) {

        return build(
                ApiStatus.SUCCESS,
                message,
                data,
                HttpStatus.CREATED
        );
    }


    // =========================
    // 400 BAD REQUEST
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> badRequest(
            String message,
            T data
    ) {

        return build(
                ApiStatus.ERROR,
                message,
                data,
                HttpStatus.BAD_REQUEST
        );
    }


    // =========================
    // 401 UNAUTHORIZED
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(
            String message
    ) {

        return build(
                ApiStatus.ERROR,
                message,
                null,
                HttpStatus.UNAUTHORIZED
        );
    }


    // =========================
    // 403 FORBIDDEN
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> forbidden(
            String message
    ) {

        return build(
                ApiStatus.ERROR,
                message,
                null,
                HttpStatus.FORBIDDEN
        );
    }


    // =========================
    // 404 NOT FOUND
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> notFound(
            String message
    ) {

        return build(
                ApiStatus.ERROR,
                message,
                null,
                HttpStatus.NOT_FOUND
        );
    }


    // =========================
    // 409 CONFLICT
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> conflict(
            String message
    ) {

        return build(
                ApiStatus.ERROR,
                message,
                null,
                HttpStatus.CONFLICT
        );
    }


    // =========================
    // 500 INTERNAL SERVER ERROR
    // =========================

    public static <T> ResponseEntity<ApiResponse<T>> serverError(
            String message
    ) {

        return build(
                ApiStatus.ERROR,
                message,
                null,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }


    // =========================
    // COMMON BUILDER
    // =========================

    private static <T> ResponseEntity<ApiResponse<T>> build(
            ApiStatus status,
            String message,
            T data,
            HttpStatus httpStatus
    ) {

        ApiResponse<T> response = ApiResponse.<T>builder()
                .status(status)

                .message(message)
                .data(data)
                .build();

        return ResponseEntity
                .status(httpStatus)
                .body(response);
    }
}