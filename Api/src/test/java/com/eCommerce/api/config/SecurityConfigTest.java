package com.eCommerce.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;

import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigTest {
    @Test
    void createsConfiguredAdminWithEncodedPasswordAndAdminRole() {
        UserDetailsService userDetailsService = new SecurityConfig()
                .userDetailsService("catalog-admin", "secret-password");
        UserDetails admin = userDetailsService.loadUserByUsername("catalog-admin");

        assertEquals("catalog-admin", admin.getUsername());
        assertTrue(admin.getAuthorities().stream().anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
        assertNotEquals("secret-password", admin.getPassword());
        assertTrue(PasswordEncoderFactories.createDelegatingPasswordEncoder()
                .matches("secret-password", admin.getPassword()));
    }
}
