
package com.skillbridge.backend.repository;

import com.skillbridge.backend.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeAnalysisRepository
        extends JpaRepository<ResumeAnalysis, Long> {

    // Latest analysis, including career comparisons
    Optional<ResumeAnalysis>
    findFirstByUser_IdOrderByCreatedAtDesc(Long userId);

    // Latest individual resume analysis only
    Optional<ResumeAnalysis>
    findFirstByUser_IdAndCareerComparisonFalseOrderByCreatedAtDesc(
            Long userId
    );

    // All individual resume analyses, excluding career comparisons
    List<ResumeAnalysis>
    findAllByUser_IdAndCareerComparisonFalseOrderByCreatedAtDesc(
            Long userId
    );

    // Find one analysis belonging to a specific user
    Optional<ResumeAnalysis>
    findByIdAndUser_Id(Long id, Long userId);

    // Find all analyses belonging to a user
    List<ResumeAnalysis>
    findAllByUser_IdOrderByCreatedAtDesc(Long userId);

    // Delete all analyses belonging to a user
    void deleteAllByUser_Id(Long userId);
}
