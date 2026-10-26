package com.employee.leave;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "eureka.client.enabled=false"
})
class LeaveManagementServiceApplicationTest {

    @Test
    void contextLoads() {
        assertNotNull(LeaveManagementServiceApplication.class);
    }
}
