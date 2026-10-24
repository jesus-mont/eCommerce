package com.eCommerce.api.product.service.util;

import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.domain.ProductCategory;
import com.eCommerce.api.product.repository.ProductRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.io.InputStreamReader;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CsvProductImporter {

    private final ProductRepository productRepository;

    public void importProductsIfNeeded() {
        if (productRepository.count() > 0) {
            return;
        }

        try (CSVReader reader = new CSVReader(new InputStreamReader(new ClassPathResource("products.csv").getInputStream()))) {

            String[] nextLine;
            int lineNumber = 0;
            boolean isHeader = true;

            while ((nextLine = reader.readNext()) != null) {
                lineNumber++;

                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                if (nextLine.length < 7) {
                    System.err.println("Line " + lineNumber + " ignored by missing fields.");
                    continue;
                }

                try {
                    String name = nextLine[0].trim();
                    String sku = nextLine[1].trim();

                    if (productRepository.existsBySku(sku)) {
                        System.err.println("Line " + lineNumber + " ignored: SKU " + sku + " already exists.");
                        continue;
                    }
                    String description = nextLine[2].trim();

                    ProductCategory category;
                    try {
                        String rawCategory = nextLine[3].trim().toUpperCase().replace(" ", "_");
                        category = ProductCategory.valueOf(rawCategory);
                    } catch (IllegalArgumentException e) {
                        category = ProductCategory.MISC;
                    }

                    String sanitizedPrice = nextLine[4].trim().replaceAll("[^0-9.]", "");
                    if (sanitizedPrice.isEmpty()) {
                        throw new IllegalArgumentException("Invalid or free price, skipping import.");
                    }
                    BigDecimal price = new BigDecimal(sanitizedPrice);
                    if (price.compareTo(BigDecimal.ZERO) <= 0) {
                        throw new IllegalArgumentException("price should be positive upper than 0");
                    }

                    Integer stock = Integer.parseInt(nextLine[5].trim());
                    if (stock < 0) {
                        throw new IllegalArgumentException("stock should be positive number.");
                    }

                    String sanitizedWeight = nextLine[6].trim().replaceAll("[^0-9.]", "");
                    if (sanitizedWeight.isEmpty()) {
                        throw new IllegalArgumentException("Invalid Weighht, skipping import.");
                    }

                    BigDecimal weightKg = new BigDecimal(sanitizedWeight);
                    if (weightKg.compareTo(BigDecimal.ZERO) <0) {
                        throw new IllegalArgumentException("Weight must be greater than zero");
                    }

                    Product product = Product.builder()
                            .name(name)
                            .sku(sku)
                            .description(description)
                            .category(category)
                            .price(price)
                            .stock(stock)
                            .weightKg(weightKg)
                            .build();

                    productRepository.save(product);

                } catch (Exception rowError) {
                    System.err.println("Error procesing line " + lineNumber + ": " + rowError.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Could not read initialization CSV file: " + e.getMessage());
        }
    }
}