package com.nexcore.erp.util;

import com.nexcore.erp.entity.User;
import com.nexcore.erp.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AccessDeniedException("Not authenticated");
        }
        Object principal = authentication.getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("User not found"));
    }

    public void checkWriteInventory() {
        User user = getCurrentUser();
        if (!user.getRole().isWriteInventory()) {
            throw new AccessDeniedException("Access denied: missing write inventory permission");
        }
    }

    public void checkWriteSales() {
        User user = getCurrentUser();
        if (!user.getRole().isWriteSales()) {
            throw new AccessDeniedException("Access denied: missing write sales permission");
        }
    }

    public void checkWriteFinance() {
        User user = getCurrentUser();
        if (!user.getRole().isWriteFinance()) {
            throw new AccessDeniedException("Access denied: missing write finance permission");
        }
    }

    public void checkWriteHR() {
        User user = getCurrentUser();
        if (!user.getRole().isWriteHR()) {
            throw new AccessDeniedException("Access denied: missing write HR permission");
        }
    }

    public void checkWriteSettings() {
        User user = getCurrentUser();
        if (!user.getRole().isWriteSettings()) {
            throw new AccessDeniedException("Access denied: missing write settings permission");
        }
    }
}
