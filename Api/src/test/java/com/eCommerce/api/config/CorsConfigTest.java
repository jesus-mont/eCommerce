package com.eCommerce.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    @Test
    void configuresApiCorsForLocalReactOrigin() {
        CorsRegistry registry = new CorsRegistry();
        new CorsConfig().corsConfigurer().addCorsMappings(registry);

        @SuppressWarnings("unchecked")
        Map<String, CorsConfiguration> configs = (Map<String, CorsConfiguration>) ReflectionTestUtils.invokeMethod(
                registry,
                "getCorsConfigurations"
        );

        CorsConfiguration configuration = configs.get("/api/**");

        assertNotNull(configuration);
        assertEquals(java.util.List.of("http://localhost:3000"), configuration.getAllowedOrigins());
        assertTrue(configuration.getAllowedMethods().contains("GET"));
        assertTrue(configuration.getAllowCredentials());
    }
}
