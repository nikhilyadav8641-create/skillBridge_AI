
package com.skillbridge.backend.repository;

import com.skillbridge.backend.entity.MilestoneProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MilestoneProgressRepository
        extends JpaRepository<MilestoneProgress, Long> {

    List<MilestoneProgress> findByUserIdAndProjectId(
            Long userId,
            Long projectId
    );

    Optional<MilestoneProgress> findByUserIdAndProjectIdAndMilestoneTitle(
            Long userId,
            Long projectId,
            String milestoneTitle
    );
}
