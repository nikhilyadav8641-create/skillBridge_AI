
package com.skillbridge.backend.repository;

import com.skillbridge.backend.entity.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CareerRoadmapRepository
        extends JpaRepository<CareerRoadmap, Long> {

    Optional<CareerRoadmap> findFirstByUser_IdOrderByCreatedAtDesc(
            Long userId
    );

    List<CareerRoadmap> findAllByUser_IdOrderByCreatedAtDesc(
            Long userId
    );

    Optional<CareerRoadmap> findByIdAndUser_Id(
            Long roadmapId,
            Long userId
    );
}
