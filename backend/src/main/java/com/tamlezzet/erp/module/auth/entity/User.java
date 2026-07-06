package com.tamlezzet.erp.module.auth.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean mfaEnabled = false;

    private String mfaSecret;

    private LocalDateTime lastLoginAt;

    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;

    public enum Role {
        SUPER_ADMIN, ADMIN, MANAGER, ACCOUNTANT, STAFF, VIEWER
    }
}
