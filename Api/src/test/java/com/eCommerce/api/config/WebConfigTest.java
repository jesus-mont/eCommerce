package com.eCommerce.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer;
import org.springframework.core.MethodParameter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WebConfigTest {
    @Test
    void capsRequestedPageSizeAtOneHundred() throws Exception {
        PageableHandlerMethodArgumentResolver resolver = new PageableHandlerMethodArgumentResolver();
        PageableHandlerMethodArgumentResolverCustomizer customizer = new WebConfig().pageSizeLimit();
        customizer.customize(resolver);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setParameter("page", "0");
        request.setParameter("size", "500");
        MethodParameter parameter = new MethodParameter(
                PageableEndpoint.class.getDeclaredMethod("page", Pageable.class), 0);

        Pageable pageable = resolver.resolveArgument(parameter, null, new ServletWebRequest(request), null);

        assertEquals(100, pageable.getPageSize());
    }

    private static class PageableEndpoint {
        void page(Pageable pageable) { }
    }
}
