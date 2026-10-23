
package com.skillbridge.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "career_roadmaps")
public class CareerRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String jobRole;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(
            mappedBy = "roadmap",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("stepNumber ASC")
    private List<RoadmapTask> tasks = new ArrayList<>();

    public CareerRoadmap() {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<RoadmapTask> getTasks() {
        return tasks;
    }

    public void addTask(RoadmapTask task) {
        tasks.add(task);
        task.setRoadmap(this);
    }
}
