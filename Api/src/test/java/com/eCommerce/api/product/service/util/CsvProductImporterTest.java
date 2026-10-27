package com.eCommerce.api.product.service.util;

import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.domain.ProductCategory;
import com.eCommerce.api.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CsvProductImporterTest {
    @Mock
    private ProductRepository productRepository;

    private CsvProductImporter importer;

    @BeforeEach
    void setUp() {
        importer = new CsvProductImporter(productRepository, csvResource(
                "name,sku,description,category,price,stock,weight_kg\n"));
    }

    @Test
    void doesNothingWhenProductsAlreadyExist() {
        when(productRepository.count()).thenReturn(2L);

        importer.importProductsIfNeeded();

        verify(productRepository).count();
        verifyNoMoreInteractions(productRepository);
    }

    @Test
    void importsValidRowsAndSkipsMalformedRowsAndUnknownCategoryDefaultsToMisc() {
        importer = new CsvProductImporter(productRepository, csvResource(
                "name,sku,description,category,price,stock,weight_kg\n" +
                "Wireless Mouse, WM-1 ,Ergonomic,Electronics,$29.99,5,0.12\n" +
                "Incomplete,ROW-2,missing\n" +
                "Unknown Category,UC-3,Description,Unlisted,7.50,2,0.25\n" +
                "Invalid Stock,IS-4,Description,Tools,12,nope,1.0\n"));
        when(productRepository.count()).thenReturn(0L);
        when(productRepository.existsBySku(any())).thenReturn(false);

        importer.importProductsIfNeeded();

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository, times(2)).save(saved.capture());
        List<Product> products = saved.getAllValues();
        assertEquals("Wireless Mouse", products.get(0).getName());
        assertEquals("WM-1", products.get(0).getSku());
        assertEquals(ProductCategory.ELECTRONICS, products.get(0).getCategory());
        assertEquals("29.99", products.get(0).getPrice().toPlainString());
        assertEquals(ProductCategory.MISC, products.get(1).getCategory());
        assertEquals("UC-3", products.get(1).getSku());
    }

    @Test
    void skipsDuplicateSkusAndInvalidNonPositiveWeights() {
        importer = new CsvProductImporter(productRepository, csvResource(
                "name,sku,description,category,price,stock,weight_kg\n" +
                "Duplicate,DUPE,Description,Tools,1.00,1,1.0\n" +
                "Zero Weight,ZW-1,Description,Tools,1.00,1,0\n"));
        when(productRepository.count()).thenReturn(0L);
        when(productRepository.existsBySku("DUPE")).thenReturn(true);
        when(productRepository.existsBySku("ZW-1")).thenReturn(false);

        importer.importProductsIfNeeded();

        verify(productRepository, never()).save(any());
    }

    @Test
    void logsResourceReadFailureWithoutSavingProducts() {
        Resource brokenResource = new ByteArrayResource(new byte[0]) {
            @Override
            public java.io.InputStream getInputStream() throws IOException {
                throw new IOException("read failed");
            }
        };
        importer = new CsvProductImporter(productRepository, brokenResource);
        when(productRepository.count()).thenReturn(0L);

        importer.importProductsIfNeeded();

        verify(productRepository, never()).save(any());
    }

    private Resource csvResource(String csv) {
        return new ByteArrayResource(csv.getBytes(StandardCharsets.UTF_8));
    }
}
