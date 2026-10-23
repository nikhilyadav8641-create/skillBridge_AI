
package com.skillbridge.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String jobRole;

    @Column(nullable = false)
    private double score;

    @Column(nullable = false, columnDefinition = "JSON")
    private String resultJson;

    @Column(nullable = false)
    private boolean careerComparison = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public ResumeAnalysis() {
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getJobRole() {
        return jobRole;
    }

    public void setJobRole(String jobRole) {
        this.jobRole = jobRole;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getResultJson() {
        return resultJson;
    }

    public void setResultJson(String resultJson) {
        this.resultJson = resultJson;
    }

    public boolean isCareerComparison() {
        return careerComparison;
    }

    public void setCareerComparison(boolean careerComparison) {
        this.careerComparison = careerComparison;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
