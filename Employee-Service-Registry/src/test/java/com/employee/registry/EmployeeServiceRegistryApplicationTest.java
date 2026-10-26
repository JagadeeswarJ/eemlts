package com.employee.registry;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EmployeeServiceRegistryApplicationTest {

    @Test
    void contextLoads() {
        assertNotNull(EmployeeServiceRegistryApplication.class);
    }
}
