//
//package com.skillbridge.backend.service;
//
//import com.skillbridge.backend.dto.ProgressResponse;
//import com.skillbridge.backend.entity.CareerRoadmap;
//import com.skillbridge.backend.entity.ResumeAnalysis;
//import com.skillbridge.backend.entity.RoadmapTask;
//import com.skillbridge.backend.repository.CareerRoadmapRepository;
//import com.skillbridge.backend.repository.ResumeAnalysisRepository;
//
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//public class ProgressService {
//
//    private final CareerRoadmapRepository roadmapRepository;
//    private final ResumeAnalysisRepository analysisRepository;
//
//    public ProgressService(
//            CareerRoadmapRepository roadmapRepository,
//            ResumeAnalysisRepository analysisRepository
//    ) {
//        this.roadmapRepository = roadmapRepository;
//        this.analysisRepository = analysisRepository;
//    }
//
//    @Transactional(readOnly = true)
//    public ProgressResponse getProgress(Long userId) {
//
//        List<CareerRoadmap> roadmaps =
//                roadmapRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);
//
//        long totalTasks = 0;
//        long completedTasks = 0;
//
//        for (CareerRoadmap roadmap : roadmaps) {
//            for (RoadmapTask task : roadmap.getTasks()) {
//                totalTasks++;
//
//                if (task.isCompleted()) {
//                    completedTasks++;
//                }
//            }
//        }
//
//        double completionPercentage = totalTasks == 0
//                ? 0
//                : Math.round(completedTasks * 100.0 / totalTasks);
//
//        List<ResumeAnalysis> analyses =
//                analysisRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);
//
//        Double latestScore = null;
//        Double previousScore = null;
//        Double scoreChange = null;
//        String jobRole = null;
//
//        if (!analyses.isEmpty()) {
//            ResumeAnalysis latest = analyses.get(0);
//            latestScore = latest.getScore();
//            jobRole = latest.getJobRole();
//
//            for (int i = 1; i < analyses.size(); i++) {
//                ResumeAnalysis candidate = analyses.get(i);
//
//                if (candidate.getJobRole() != null
//                        && jobRole != null
//                        && candidate.getJobRole().equalsIgnoreCase(jobRole)) {
//                    previousScore = candidate.getScore();
//                    scoreChange = latestScore - previousScore;
//                    break;
//                }
//            }
//        }
//
//
//        final String selectedJobRole = jobRole;
//
//        List<ProgressResponse.ScorePoint> scoreHistory =
//                analyses.stream()
//                        .filter(a -> a.getJobRole() != null
//                                && selectedJobRole != null
//                                && a.getJobRole().equalsIgnoreCase(
//                                selectedJobRole))
//                        .map(a -> new ProgressResponse.ScorePoint(
//                                a.getScore(),
//                                a.getJobRole(),
//                                a.getCreatedAt() == null
//                                        ? ""
//                                        : a.getCreatedAt().toString()
//                        ))
//                        .toList();
//
//
//        return new ProgressResponse(
//                completedTasks,
//                totalTasks,
//                completionPercentage,
//                latestScore,
//                previousScore,
//                scoreChange,
//                jobRole,
//                scoreHistory
//        );
//    }
//}

package com.skillbridge.backend.service;

import com.skillbridge.backend.dto.ProgressResponse;
import com.skillbridge.backend.entity.CareerRoadmap;
import com.skillbridge.backend.entity.ResumeAnalysis;
import com.skillbridge.backend.entity.RoadmapTask;
import com.skillbridge.backend.repository.CareerRoadmapRepository;
import com.skillbridge.backend.repository.ResumeAnalysisRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProgressService {

    private final CareerRoadmapRepository roadmapRepository;
    private final ResumeAnalysisRepository analysisRepository;

    public ProgressService(
            CareerRoadmapRepository roadmapRepository,
            ResumeAnalysisRepository analysisRepository
    ) {
        this.roadmapRepository = roadmapRepository;
        this.analysisRepository = analysisRepository;
    }

    @Transactional(readOnly = true)
    public ProgressResponse getProgress(Long userId) {

        List<CareerRoadmap> roadmaps =
                roadmapRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);

        long totalTasks = 0;
        long completedTasks = 0;

        for (CareerRoadmap roadmap : roadmaps) {
            for (RoadmapTask task : roadmap.getTasks()) {
                totalTasks++;

                if (task.isCompleted()) {
                    completedTasks++;
                }
            }
        }

        double completionPercentage = totalTasks == 0
                ? 0
                : Math.round(completedTasks * 100.0 / totalTasks);

        // Only individual resume analyses; exclude career comparisons
        List<ResumeAnalysis> analyses =
                analysisRepository
                        .findAllByUser_IdAndCareerComparisonFalseOrderByCreatedAtDesc(
                                userId
                        );

        Double latestScore = null;
        Double previousScore = null;
        Double scoreChange = null;
        String jobRole = null;

        if (!analyses.isEmpty()) {
            ResumeAnalysis latest = analyses.get(0);

            latestScore = latest.getScore();
            jobRole = latest.getJobRole();

            // Find the previous analysis for the same job role
            for (int i = 1; i < analyses.size(); i++) {
                ResumeAnalysis candidate = analyses.get(i);

                if (candidate.getJobRole() != null
                        && jobRole != null
                        && candidate.getJobRole().equalsIgnoreCase(jobRole)) {

                    previousScore = candidate.getScore();
                    scoreChange = latestScore - previousScore;
                    break;
                }
            }
        }

        final String selectedJobRole = jobRole;

        List<ProgressResponse.ScorePoint> scoreHistory =
                analyses.stream()
                        .filter(a -> a.getJobRole() != null
                                && selectedJobRole != null
                                && a.getJobRole().equalsIgnoreCase(
                                selectedJobRole
                        ))
                        .map(a -> new ProgressResponse.ScorePoint(
                                a.getScore(),
                                a.getJobRole(),
                                a.getCreatedAt() == null
                                        ? ""
                                        : a.getCreatedAt().toString()
                        ))
                        .toList();

        return new ProgressResponse(
                completedTasks,
                totalTasks,
                completionPercentage,
                latestScore,
                previousScore,
                scoreChange,
                jobRole,
                scoreHistory
        );
    }
}
