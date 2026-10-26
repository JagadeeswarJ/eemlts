package com.employee.attendance.repository;

import com.employee.attendance.entity.Employee;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface EmployeeRepository extends ReactiveCrudRepository<Employee, Long> {

    Flux<Employee> findByDepartmentId(Long departmentId);
}
