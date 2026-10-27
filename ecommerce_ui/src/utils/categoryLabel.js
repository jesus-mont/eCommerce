const categoryLabels = {
  FOOTWEAR: 'Footwear',
  FOOD_AND_BEVERAGE: 'Food & Beverage',
  ELECTRONICS: 'Electronics',
  ACCESSORIES: 'Accessories',
  OUTDOORS: 'Outdoors',
  SPORTS: 'Sports',
  HOME_AND_OFFICE: 'Home & Office',
  CLOTHING: 'Clothing',
  KITCHEN: 'Kitchen',
  BOOKS: 'Books',
  BEAUTY: 'Beauty',
  STATIONERY: 'Stationery',
  GAMES: 'Games',
  MISC: 'Misc',
  GIFTS: 'Gifts',
  PETS: 'Pets',
  HEALTH: 'Health',
  TOOLS: 'Tools'
};

export default function categoryLabel(category) {
  if (!category) return 'N/A';
  return categoryLabels[category] || category;
}
