
package com.skillbridge.backend.entity;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private String generationId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ElementCollection
    @CollectionTable(
            name = "project_milestones",
            joinColumns = @JoinColumn(name = "project_id")
    )
    @Column(name = "milestone")
    private List<String> milestones = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "project_tech_stack",
            joinColumns = @JoinColumn(name = "project_id")
    )
    @Column(name = "technology")
    private List<String> techStack = new ArrayList<>();

    @ElementCollection
    @CollectionTable(
            name = "project_required_skills",
            joinColumns = @JoinColumn(name = "project_id")
    )
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    @Column(length = 30)
    private String difficulty;

    @Column(length = 50)
    private String duration;

    @Column(length = 150)
    private String jobRole;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Project() {
    }

    public Project(
            String title,
            String description,
            List<String> milestones
    ) {
        this.title = title;
        this.description = description;
        this.milestones = milestones;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getGenerationId() {
        return generationId;
    }

    public void setGenerationId(String generationId) {
        this.generationId = generationId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<String> milestones) {
        this.milestones = milestones == null
                ? new ArrayList<>()
                : milestones;
    }

    public List<String> getTechStack() {
        return techStack;
    }

    public void setTechStack(List<String> techStack) {
        this.techStack = techStack == null
                ? new ArrayList<>()
                : techStack;
    }

    public List<String> getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(List<String> requiredSkills) {
        this.requiredSkills = requiredSkills == null
                ? new ArrayList<>()
                : requiredSkills;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
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
}
