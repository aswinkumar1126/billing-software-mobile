package com.billing.config.Response.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class ApiResponse<T>{

    private ApiStatus status ;
    private String message;
    private T data;
    private int HttpStatus;

}
