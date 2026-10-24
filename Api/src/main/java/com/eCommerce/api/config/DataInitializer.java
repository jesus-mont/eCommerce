package com.eCommerce.api.config;

import com.eCommerce.api.product.service.util.CsvProductImporter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CsvProductImporter csvProductImporter;

    @Override
    public void run(String... args) {
        csvProductImporter.importProductsIfNeeded();
    }
}
