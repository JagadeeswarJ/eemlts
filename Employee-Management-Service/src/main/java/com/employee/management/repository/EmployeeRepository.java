package com.employee.management.repository;

import com.employee.management.entity.Employee;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface EmployeeRepository extends ReactiveCrudRepository<Employee, Long> {

    Mono<Employee> findByEmail(String email);

    Mono<Employee> findByUserId(Long userId);

    Mono<Employee> findByEmployeeCode(String employeeCode);

    Mono<Boolean> existsByEmail(String email);

    Mono<Boolean> existsByEmployeeCode(String employeeCode);

    Flux<Employee> findByDepartmentId(Long departmentId);

    Flux<Employee> findByManagerId(Long managerId);

    @Query("SELECT e.* FROM employees e WHERE (:deptId IS NULL OR e.department_id = :deptId) " +
           "AND (:status IS NULL OR e.employment_status = :status) " +
           "AND (:search IS NULL OR LOWER(e.first_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.last_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.employee_code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.employee_id ASC LIMIT :limit OFFSET :offset")
    Flux<Employee> findFiltered(Long deptId, String status, String search, long limit, long offset);

    @Query("SELECT COUNT(*) FROM employees e WHERE (:deptId IS NULL OR e.department_id = :deptId) " +
           "AND (:status IS NULL OR e.employment_status = :status) " +
           "AND (:search IS NULL OR LOWER(e.first_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.last_name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.employee_code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Mono<Long> countFiltered(Long deptId, String status, String search);
}
