package com.nexcore.erp.aspect;

import com.nexcore.erp.entity.AuditLog;
import com.nexcore.erp.entity.User;
import com.nexcore.erp.repository.AuditLogRepository;
import com.nexcore.erp.repository.UserRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Aspect
@Component
public class AuditLogAspect {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AuditLogAspect(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Pointcut("execution(* com.nexcore.erp.service.*.create*(..)) || " +
              "execution(* com.nexcore.erp.service.*.update*(..)) || " +
              "execution(* com.nexcore.erp.service.*.delete*(..)) || " +
              "execution(* com.nexcore.erp.service.*.save*(..)) || " +
              "execution(* com.nexcore.erp.service.*.record*(..)) || " +
              "execution(* com.nexcore.erp.service.*.process*(..))")
    public void serviceWriteMethods() {}

    @AfterReturning(pointcut = "serviceWriteMethods()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                return;
            }

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (user == null) return;

            String methodName = joinPoint.getSignature().getName();
            String action = "UPDATE";
            if (methodName.startsWith("create") || methodName.startsWith("add")) {
                action = "CREATE";
            } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
                action = "DELETE";
            }

            String entityName = "Unknown";
            Long entityId = 0L;
            String diff = "{}";

            if (result != null) {
                entityName = result.getClass().getSimpleName();
                try {
                    java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                    Object idVal = getIdMethod.invoke(result);
                    if (idVal instanceof Long) {
                        entityId = (Long) idVal;
                    }
                } catch (Exception e) {
                    // fall back
                }
                diff = String.format("{\"method\":\"%s\", \"status\":\"SUCCESS\"}", methodName);
            }

            AuditLog log = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entity(entityName)
                    .entityId(entityId)
                    .timestamp(LocalDateTime.now())
                    .diff(diff)
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            // fail-silent to not disrupt main transactional workflow
        }
    }
}
