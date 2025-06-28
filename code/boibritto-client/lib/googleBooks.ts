/**
 * utils for interacting with Google Books API
 */

export interface BookDetails {
  title: string;
  authors: string[];
  thumbnail: string;
}

/**
 * Fetches book details from Google Books API
 */
export const fetchBookDetails = async (
  volumeId: string
): Promise<BookDetails> => {
  // Early return for invalid volume IDs
  if (!volumeId || volumeId.trim() === "") {
    console.warn("Invalid volume ID provided:", volumeId);
    return {
      title: "Unknown Title",
      authors: ["Unknown Author"],
      thumbnail: "",
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

    return {
      title: bookData.volumeInfo.title || "Unknown Title",
      authors: bookData.volumeInfo.authors || ["Unknown Author"],
      thumbnail:
        bookData.volumeInfo.imageLinks?.thumbnail ||
        bookData.volumeInfo.imageLinks?.smallThumbnail ||
        "",
    };
  } catch (error) {
    console.error(`Failed to fetch details for book ${volumeId}:`, error);
    return {
      title: "Unknown Title",
      authors: ["Unknown Author"],
      thumbnail: "",
    };
  }
};

/**
 * Fetches multiple book details in parallel
 */
export const fetchMultipleBookDetails = async (
  volumeIds: string[]
): Promise<BookDetails[]> => {
  return Promise.all(volumeIds.map((volumeId) => fetchBookDetails(volumeId)));
};
