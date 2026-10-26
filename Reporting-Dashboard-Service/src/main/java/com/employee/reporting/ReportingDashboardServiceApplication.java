package com.employee.reporting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableR2dbcRepositories
public class ReportingDashboardServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReportingDashboardServiceApplication.class, args);
    }
}
