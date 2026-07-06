package com.tamlezzet.erp.module.auth.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.module.auth.dto.AuthResponse;
import com.tamlezzet.erp.module.auth.dto.LoginRequest;
import com.tamlezzet.erp.module.auth.dto.UserDTO;
import com.tamlezzet.erp.module.auth.entity.User;
import com.tamlezzet.erp.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login with email, password, and optional TOTP")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refreshToken(body.get("refreshToken"))));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails user) {
        authService.logout(user.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
    }

    @GetMapping("/mfa/setup")
    public ResponseEntity<ApiResponse<String>> mfaSetup(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.ok(authService.setupMfa(user.getUsername())));
    }

    @PostMapping("/mfa/confirm")
    public ResponseEntity<ApiResponse<Void>> mfaConfirm(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, String> body) {
        authService.confirmMfa(user.getUsername(), body.get("code"));
        return ResponseEntity.ok(ApiResponse.ok("MFA enabled", null));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, String> body) {
        authService.changePassword(user.getUsername(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(ApiResponse.ok("Password changed", null));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDTO>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(authService.listUsers()));
    }

    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody Map<String, String> body) {
        User user = authService.createUser(
                body.get("email"),
                body.get("password"),
                body.get("fullName"),
                User.Role.valueOf(body.getOrDefault("role", "STAFF")));
        return ResponseEntity.ok(ApiResponse.ok(UserDTO.builder()
                .id(user.getId()).email(user.getEmail())
                .fullName(user.getFullName()).role(user.getRole()).build()));
    }
}
