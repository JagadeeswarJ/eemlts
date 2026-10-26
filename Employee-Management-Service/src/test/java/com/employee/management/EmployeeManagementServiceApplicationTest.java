package com.employee.management;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "eureka.client.enabled=false"
})
class EmployeeManagementServiceApplicationTest {

    @Test
    void contextLoads() {
        assertNotNull(EmployeeManagementServiceApplication.class);
    }
}
