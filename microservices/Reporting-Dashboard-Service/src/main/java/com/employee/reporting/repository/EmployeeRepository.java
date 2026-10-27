package com.employee.reporting.repository;

import com.employee.reporting.entity.Employee;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface EmployeeRepository extends ReactiveCrudRepository<Employee, Long> {

    Flux<Employee> findByDepartmentId(Long departmentId);

    Flux<Employee> findByManagerId(Long managerId);

    Mono<Long> countByEmploymentStatus(String status);
}
