package com.eCommerce.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer;

@Configuration
public class WebConfig {
    @Bean
    PageableHandlerMethodArgumentResolverCustomizer pageSizeLimit() {
        return resolver -> resolver.setMaxPageSize(100);
    }
}
