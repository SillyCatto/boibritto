/**
 * utils for interacting with Google Books API
 */

export interface BookDetails {
  title: string;
  authors: string[];
  thumbnail: string;
}

export interface FullBookData {
  title: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  categories?: string[];
  averageRating?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

/**
 * Fetches book details from Google Books API
 */
export const fetchBookDetails = async (
  volumeId: string
): Promise<FullBookData> => {
  // Early return for invalid volume IDs
  if (!volumeId || volumeId.trim() === "") {
    console.warn("Invalid volume ID provided:", volumeId);
    return {
      title: "Unknown Title",
      authors: ["Unknown Author"],
      imageLinks: { thumbnail: "" },
    };
  }

  try {
    console.log(`Fetching book details for volume ID: ${volumeId}`);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${volumeId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `API response not ok: ${response.status} ${response.statusText}`
      );
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const bookData = await response.json();

    // Check if the response has the expected structure
    if (!bookData || !bookData.volumeInfo) {
      console.warn(`Invalid book data structure for ${volumeId}:`, bookData);
      throw new Error("Invalid book data structure");
    }

    console.log(
      `Successfully fetched book data for ${volumeId}:`,
      bookData.volumeInfo?.title
    );

    const volumeInfo = bookData.volumeInfo;

    return {
      title: volumeInfo.title || "Unknown Title",
      authors: volumeInfo.authors || ["Unknown Author"],
      publishedDate: volumeInfo.publishedDate || undefined,
      description: volumeInfo.description || undefined,
      categories: volumeInfo.categories || undefined,
      averageRating: volumeInfo.averageRating || undefined,
      imageLinks: {
        thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || undefined,
        smallThumbnail: volumeInfo.imageLinks?.smallThumbnail || undefined,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch details for book ${volumeId}:`, error);
    return {
      title: "Unknown Title",
      authors: ["Unknown Author"],
      imageLinks: { thumbnail: "" },
    };
  }
};

/**
 * Fetches multiple book details in parallel
 */
export const fetchMultipleBookDetails = async (
  volumeIds: string[]
): Promise<FullBookData[]> => {
  return Promise.all(volumeIds.map((volumeId) => fetchBookDetails(volumeId)));
};
