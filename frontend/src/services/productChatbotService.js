/**
 * Service để nhận diện danh mục từ câu trả lời của người dùng
 */

/**
 * Nhận diện category từ text input
 * @param {string} text - Câu trả lời của người dùng
 * @param {Array} categories - Danh sách categories từ API
 * @returns {Object|null} - Category được nhận diện hoặc null
 */
export const detectCategory = (text, categories = []) => {
  if (!text || !categories.length) return null;

  const lowerText = text.toLowerCase().trim();

  // 1. Tìm kiếm exact match với tên category
  for (const category of categories) {
    const categoryName = category.name.toLowerCase();
    // Exact match
    if (lowerText === categoryName) {
      return category;
    }
    // Contains match
    if (
      lowerText.includes(categoryName) ||
      categoryName.includes(lowerText)
    ) {
      return category;
    }
  }

  // 2. Fuzzy matching - tìm kiếm các từ đơn lẻ
  const words = lowerText.split(/\s+/);
  for (const word of words) {
    if (word.length < 2) continue; // Bỏ qua từ quá ngắn

    for (const category of categories) {
      const categoryName = category.name.toLowerCase();
      if (categoryName.includes(word) || word.includes(categoryName)) {
        return category;
      }
    }
  }

  return null;
};

/**
 * Lấy suggestions cho category dựa trên input
 * @param {string} text - Input của người dùng
 * @param {Array} categories - Danh sách categories
 * @returns {Array} - Danh sách suggestions
 */
export const getCategorySuggestions = (text, categories = []) => {
  if (!text || !categories.length) return categories.slice(0, 6);

  const lowerText = text.toLowerCase().trim();
  const suggestions = [];

  // Tìm các categories có chứa từ khóa
  for (const category of categories) {
    const categoryName = category.name.toLowerCase();
    if (categoryName.includes(lowerText) || lowerText.includes(categoryName)) {
      suggestions.push(category);
    }
  }

  // Nếu không tìm thấy, trả về top categories
  return suggestions.length > 0
    ? suggestions.slice(0, 6)
    : categories.slice(0, 6);
};

/**
 * Tạo message phản hồi cho bot dựa trên kết quả nhận diện
 * @param {Object|null} category - Category được nhận diện
 * @param {Array} products - Danh sách sản phẩm
 * @returns {Object} - Message object cho bot
 */
export const createBotResponse = (category, products = []) => {
  if (!category) {
    return {
      content:
        "Xin lỗi, tôi chưa hiểu rõ danh mục bạn muốn tìm. Bạn có thể chọn một trong các danh mục sau hoặc nhập lại:",
      showCategories: true,
    };
  }

  if (products.length === 0) {
    return {
      content: `Xin lỗi, hiện tại chưa có sản phẩm nào trong danh mục "${category.name}". Bạn có muốn tìm kiếm danh mục khác không?`,
      showCategories: true,
    };
  }

  return {
    content: `Tôi đã tìm thấy ${products.length} sản phẩm trong danh mục "${category.name}":`,
    products: products,
  };
};

