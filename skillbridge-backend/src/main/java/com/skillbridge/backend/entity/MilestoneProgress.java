
package com.skillbridge.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "milestone_progress",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"user_id", "project_id", "milestone_title"}
        )
)
public class MilestoneProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "milestone_title", nullable = false)
    private String milestoneTitle;

    @Column(nullable = false)
    private boolean completed = false;

    public MilestoneProgress() {
    }

    public MilestoneProgress(
            Long userId,
            Long projectId,
            String milestoneTitle) {
        this.userId = userId;
        this.projectId = projectId;
        this.milestoneTitle = milestoneTitle;
        this.completed = false;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public String getMilestoneTitle() {
        return milestoneTitle;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
