package com.employee.management.repository;

import com.employee.management.entity.Department;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface DepartmentRepository extends ReactiveCrudRepository<Department, Long> {

    Mono<Department> findByCode(String code);

    Mono<Department> findByName(String name);

    Flux<Department> findByIsActiveTrue();

    Flux<Department> findAllByOrderByDepartmentIdAsc();

    Mono<Boolean> existsByCode(String code);

    Mono<Boolean> existsByName(String name);
}
