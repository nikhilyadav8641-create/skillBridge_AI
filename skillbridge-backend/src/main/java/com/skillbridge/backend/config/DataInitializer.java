
package com.skillbridge.backend.config;

import com.skillbridge.backend.entity.Project;
import com.skillbridge.backend.repository.ProjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeProjects(ProjectRepository repository) {
        return args -> {
            if (repository.count() == 0) {

                Project project1 = new Project(
                        "Student Management System",
                        "Build a CRUD application using Java and MySQL.",
                        List.of(
                                "Design database tables",
                                "Create CRUD operations",
                                "Connect Java with MySQL",
                                "Test the application"
                        )
                );

                Project project2 = new Project(
                        "SkillBridge AI",
                        "Build a career-readiness and skill-gap analysis application.",
                        List.of(
                                "Build the React dashboard",
                                "Create Spring Boot APIs",
                                "Connect the database",
                                "Integrate resume analysis"
                        )
                );

                repository.saveAll(List.of(project1, project2));
            }
        };
    }
}
