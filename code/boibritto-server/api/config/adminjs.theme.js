const customTheme = {
  colors: {
    // Primary colors to match your frontend's amber theme
    primary100: "#D97706", // amber-100
    primary80: "#FDE68A", // amber-200
    primary60: "#F59E0B", // amber-500
    primary40: "#D97706", // amber-600
    primary20: "#92400E", // amber-800

    // Background colors
    bg: "#FFFBEB", // amber-50
    white: "#FFFFFF",
    grey100: "#F3F4F6",
    grey80: "#E5E7EB",
    grey60: "#9CA3AF",
    grey40: "#6B7280",
    grey20: "#374151",

    // Accent colors
    accent: "#F59E0B", // amber-500
    love: "#EF4444", // red-500
    success: "#10B981", // emerald-500
    warning: "#F59E0B", // amber-500
    error: "#EF4444", // red-500

    // Text colors - FIXED: Made input text much darker for better visibility
    text: "#1F2937", // gray-800 - main text
    textLight: "#374151", // gray-700 - FIXED: changed from light to dark

    // Additional text colors for better form visibility
    inputText: "#1F2937", // Dark text for inputs
    placeholderText: "#9CA3AF", // Light gray for placeholders
  },
  // Shadows and borders
  shadows: {
    login: "0 10px 25px rgba(245, 158, 11, 0.1)",
    card: "0 4px 6px rgba(0, 0, 0, 0.05)",
  },
  borders: {
    default: "1px solid #E5E7EB",
    primary: "1px solid #F59E0B",
  },
};

export default customTheme;
