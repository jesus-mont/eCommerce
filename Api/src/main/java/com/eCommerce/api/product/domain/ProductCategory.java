package com.eCommerce.api.product.domain;

public enum ProductCategory {
    FOOTWEAR("Footwear"),
    FOOD_AND_BEVERAGE("Food & Beverage"),
    ELECTRONICS("Electronics"),
    ACCESSORIES("Accessories"),
    OUTDOORS("Outdoors"),
    SPORTS("Sports"),
    HOME_AND_OFFICE("Home & Office"),
    CLOTHING("Clothing"),
    KITCHEN("Kitchen"),
    BOOKS("Books"),
    BEAUTY("Beauty"),
    STATIONERY("Stationery"),
    GAMES("Games"),
    MISC("Misc"),
    GIFTS("Gifts"),
    PETS("Pets"),
    HEALTH("Health"),
    TOOLS("Tools");

    private final String displayName;

    ProductCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
