import React from 'react';
import { Book } from 'lucide-react';
import { getBookIconColor, generateBookColor } from '@/lib/bookIconUtils';

interface BookIconProps {
  bookId?: string;
  title?: string;
  size?: number;
  className?: string;
  color?: string; // Override color
  useGeneratedColor?: boolean; // Use color based on title
}

export const BookIcon: React.FC<BookIconProps> = ({
  bookId,
  title,
  size = 48,
  className = '',
  color,
  useGeneratedColor = false
}) => {
  // Determine the color to use
  const getColor = () => {
    if (color) return color;
    if (useGeneratedColor && title) return generateBookColor(title);
    if (bookId) return getBookIconColor(bookId);
    return '#d97706'; // Default amber
  };

  return (
    <Book 
      size={size}
      className={className}
      style={{ color: getColor() }}
    />
  );
};

export default BookIcon;
