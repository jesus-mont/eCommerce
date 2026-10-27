package com.eCommerce.api.config;

import com.eCommerce.api.product.service.util.CsvProductImporter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {
    @Mock private CsvProductImporter csvProductImporter;
    @InjectMocks private DataInitializer dataInitializer;

    @Test
    void runsCsvImportDuringApplicationStartup() {
        dataInitializer.run("--profile=test");
        verify(csvProductImporter).importProductsIfNeeded();
    }
}
