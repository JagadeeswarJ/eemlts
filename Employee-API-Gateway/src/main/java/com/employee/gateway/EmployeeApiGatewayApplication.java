package com.employee.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class EmployeeApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeApiGatewayApplication.class, args);
    }
}
