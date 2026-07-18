package com.civic.complaintsystem.repository;

import com.civic.complaintsystem.entity.Complaint;
import com.civic.complaintsystem.entity.ComplaintHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintHistoryRepository extends JpaRepository<ComplaintHistory, Long> {
    List<ComplaintHistory> findByComplaintOrderByChangedAtAsc(Complaint complaint);
}
