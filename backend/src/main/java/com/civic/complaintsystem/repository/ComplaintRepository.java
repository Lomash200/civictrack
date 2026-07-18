package com.civic.complaintsystem.repository;

import com.civic.complaintsystem.entity.Complaint;
import com.civic.complaintsystem.entity.ComplaintStatus;
import com.civic.complaintsystem.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Page<Complaint> findByUserAndDeletedFalse(User user, Pageable pageable);

    Page<Complaint> findByDeletedFalse(Pageable pageable);

    long countByDeletedFalse();

    long countByStatusAndDeletedFalse(ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.deleted = false AND c.createdAt >= :start AND c.createdAt < :end")
    long countCreatedBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c WHERE c.deleted = false GROUP BY c.category")
    List<Object[]> countByCategory();

    @Query("SELECT c.assignedDepartment.departmentName, COUNT(c) FROM Complaint c WHERE c.deleted = false AND c.assignedDepartment IS NOT NULL GROUP BY c.assignedDepartment.departmentName")
    List<Object[]> countByDepartment();

    @Query("SELECT FUNCTION('date_trunc', 'month', c.createdAt), COUNT(c) FROM Complaint c WHERE c.deleted = false GROUP BY FUNCTION('date_trunc', 'month', c.createdAt) ORDER BY 1")
    List<Object[]> countByMonth();

    long countByDeletedFalseAndCreatedAtGreaterThanEqual(LocalDateTime start);
}
