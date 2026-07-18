package com.civic.complaintsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus newStatus;

    private String changedBy;

    @Column(updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }
}
