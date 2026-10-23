
package com.skillbridge.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "roadmap_tasks")
public class RoadmapTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private CareerRoadmap roadmap;

    @Column(nullable = false)
    private int stepNumber;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 100)
    private String duration;

    @Column(nullable = false)
    private boolean completed = false;

    public RoadmapTask() {
    }

    public Long getId() {
        return id;
    }

    public CareerRoadmap getRoadmap() {
        return roadmap;
    }

    public void setRoadmap(CareerRoadmap roadmap) {
        this.roadmap = roadmap;
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getTitle() {
        return title;
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

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
