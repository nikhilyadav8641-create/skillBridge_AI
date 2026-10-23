
package com.skillbridge.backend.repository;

import com.skillbridge.backend.entity.RoadmapTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoadmapTaskRepository
        extends JpaRepository<RoadmapTask, Long> {

    Optional<RoadmapTask> findByIdAndRoadmap_User_Id(
            Long taskId,
            Long userId
    );
}
