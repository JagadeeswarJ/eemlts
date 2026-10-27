package com.employee.reporting;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "eureka.client.enabled=false"
})
class ReportingDashboardServiceApplicationTest {

    @Test
    void contextLoads() {
        assertNotNull(ReportingDashboardServiceApplication.class);
    }
}
