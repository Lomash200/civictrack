package com.civic.complaintsystem.service;

import com.civic.complaintsystem.entity.Notification;
import com.civic.complaintsystem.entity.User;
import com.civic.complaintsystem.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void notify(User user, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public long unreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public void markAllRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
