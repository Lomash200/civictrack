package com.civic.complaintsystem.config;

import com.civic.complaintsystem.entity.Department;
import com.civic.complaintsystem.entity.Role;
import com.civic.complaintsystem.entity.User;
import com.civic.complaintsystem.repository.DepartmentRepository;
import com.civic.complaintsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the database with a default admin user and standard departments
 * on first startup, so the app is usable immediately after docker-compose up.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedDepartments();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail("admin@civic.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@civic.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
        }
    }

    private void seedDepartments() {
        List<String> departments = List.of(
                "Sanitation Department",
                "Public Works (Roads)",
                "Water Board",
                "Electricity Board",
                "Street Lighting",
                "Sewage Department",
                "Transport Authority"
        );

        for (String name : departments) {
            departmentRepository.findByDepartmentNameIgnoreCase(name)
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder().departmentName(name).build()));
        }
    }
}
