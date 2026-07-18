package com.civic.complaintsystem.service;

import com.civic.complaintsystem.ai.OllamaService;
import com.civic.complaintsystem.entity.ComplaintStatus;
import com.civic.complaintsystem.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final OllamaService ollamaService;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new LinkedHashMap<>();

        long total = complaintRepository.countByDeletedFalse();
        long pending = complaintRepository.countByStatusAndDeletedFalse(ComplaintStatus.PENDING);
        long assigned = complaintRepository.countByStatusAndDeletedFalse(ComplaintStatus.ASSIGNED);
        long inProgress = complaintRepository.countByStatusAndDeletedFalse(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatusAndDeletedFalse(ComplaintStatus.RESOLVED);
        long rejected = complaintRepository.countByStatusAndDeletedFalse(ComplaintStatus.REJECTED);

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime startOfTomorrow = startOfToday.plusDays(1);
        long today = complaintRepository.countCreatedBetween(startOfToday, startOfTomorrow);

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long monthly = complaintRepository.countByDeletedFalseAndCreatedAtGreaterThanEqual(startOfMonth);

        stats.put("totalComplaints", total);
        stats.put("pending", pending);
        stats.put("assigned", assigned);
        stats.put("inProgress", inProgress);
        stats.put("resolved", resolved);
        stats.put("rejected", rejected);
        stats.put("todaysComplaints", today);
        stats.put("monthlyComplaints", monthly);

        stats.put("categoryBreakdown", toMap(complaintRepository.countByCategory()));
        stats.put("departmentBreakdown", toMap(complaintRepository.countByDepartment()));
        stats.put("monthlyTrend", monthlyTrend(complaintRepository.countByMonth()));

        return stats;
    }

    public String generateAiSummary() {
        Map<String, Object> stats = getDashboardStats();
        String aggregated = String.format(
                "Total=%s, Pending=%s, Assigned=%s, InProgress=%s, Resolved=%s, Rejected=%s, CategoryBreakdown=%s, DepartmentBreakdown=%s",
                stats.get("totalComplaints"), stats.get("pending"), stats.get("assigned"),
                stats.get("inProgress"), stats.get("resolved"), stats.get("rejected"),
                stats.get("categoryBreakdown"), stats.get("departmentBreakdown"));
        return ollamaService.summarize(aggregated);
    }

    private Map<String, Long> toMap(List<Object[]> rows) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String key = String.valueOf(row[0]);
            Long value = ((Number) row[1]).longValue();
            map.put(key, value);
        }
        return map;
    }

    private List<Map<String, Object>> monthlyTrend(List<Object[]> rows) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", String.valueOf(row[0]));
            entry.put("count", ((Number) row[1]).longValue());
            result.add(entry);
        }
        return result;
    }
}
