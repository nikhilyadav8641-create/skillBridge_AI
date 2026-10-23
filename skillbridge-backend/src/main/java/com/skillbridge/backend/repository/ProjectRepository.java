package com.skillbridge.backend.repository;

import com.skillbridge.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findAllByUser_Id(Long userId);

    Optional<Project> findByIdAndUser_Id(
            Long projectId,
            Long userId
    );

    List<Project> findAllByGenerationIdAndUser_Id(
            String generationId,
            Long userId
    );
}
