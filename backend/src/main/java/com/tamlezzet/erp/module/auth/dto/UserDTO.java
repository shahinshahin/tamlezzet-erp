package com.tamlezzet.erp.module.auth.dto;

import com.tamlezzet.erp.module.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private User.Role role;
    private boolean mfaEnabled;
}
