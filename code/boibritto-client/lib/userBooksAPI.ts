import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initFirebase, auth } from '@/lib/googleAuth';
import { UserBook, Chapter, CreateUserBookData, UpdateUserBookData, CreateChapterData, UpdateChapterData } from '@/lib/types/userBooks';

// Initialize Firebase
initFirebase();

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Helper function to get auth token - matches your existing pattern
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

// Helper function to make authenticated API calls - matches your existing pattern
const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

// User Books API
export const userBooksAPI = {
  // List user books with optional filters
  getUserBooks: async (params?: {
    author?: string;
    search?: string;
    genre?: string;
    completed?: boolean;
    page?: number;
  }): Promise<{ books: UserBook[] }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/user-books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint, { method: 'GET' });
    return response.data;
  },

  // Get specific user book by ID
  getUserBook: async (id: string): Promise<{ book: UserBook }> => {
    const response = await apiCall(`/user-books/${id}`, { method: 'GET' });
    return response.data;
  },

  // Create new user book
  createUserBook: async (bookData: CreateUserBookData): Promise<{ book: UserBook }> => {
    const response = await apiCall('/user-books', {
      method: 'POST',
      body: JSON.stringify({ data: bookData })
    });
    return response.data;
  },

  // Update user book
  updateUserBook: async (id: string, bookData: UpdateUserBookData): Promise<{ book: UserBook }> => {
    const response = await apiCall(`/user-books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: bookData })
    });
    return response.data;
  },

  // Delete user book
  deleteUserBook: async (id: string): Promise<void> => {
    await apiCall(`/user-books/${id}`, { method: 'DELETE' });
  },

  // Like/unlike user book
  likeUserBook: async (id: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiCall(`/user-books/${id}/like`, { method: 'POST' });
    return response.data;
  },
};

// Chapters API
export const chaptersAPI = {
  // Get chapters for a book
  getChaptersForBook: async (bookId: string, params?: {
    published?: boolean;
  }): Promise<{ chapters: Chapter[] }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/user-books/${bookId}/chapters${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint, { method: 'GET' });
    return response.data;
  },

  // Get specific chapter by ID
  getChapter: async (id: string): Promise<{ chapter: Chapter }> => {
    const response = await apiCall(`/chapters/${id}`, { method: 'GET' });
    return response.data;
  },

  // Create new chapter
  createChapter: async (chapterData: CreateChapterData): Promise<{ chapter: Chapter }> => {
    const response = await apiCall('/chapters', {
      method: 'POST',
      body: JSON.stringify({ data: chapterData })
    });
    return response.data;
  },

  // Update chapter
  updateChapter: async (id: string, chapterData: UpdateChapterData): Promise<{ chapter: Chapter }> => {
    const response = await apiCall(`/chapters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: chapterData })
    });
    return response.data;
  },

  // Delete chapter
  deleteChapter: async (id: string): Promise<void> => {
    await apiCall(`/chapters/${id}`, { method: 'DELETE' });
  },

  // Like/unlike chapter
  likeChapter: async (id: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiCall(`/chapters/${id}/like`, { method: 'POST' });
    return response.data;
  },
};

// Helper function to compress image before upload
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('Image compression timed out'));
    }, 30000); // 30 second timeout

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

  img.onload = () => {
      try {
    // Calculate new dimensions (do not upscale)
    const scale = Math.min(1, maxWidth / img.width, maxWidth / img.height);
    const newWidth = Math.round(img.width * scale);
    const newHeight = Math.round(img.height * scale);

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        if (ctx) {
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          canvas.toBlob(
            (blob) => {
              clearTimeout(timeout);
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          clearTimeout(timeout);
          reject(new Error('Failed to get canvas context'));
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Failed to process image'));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load image'));
    };

    // Create object URL and load image
    try {
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      // Revoke object URL after load (attach inside onload handler chain)
      const originalOnLoad = img.onload;
      img.onload = (ev) => {
        try { URL.revokeObjectURL(objectUrl); } catch {}
        if (originalOnLoad) originalOnLoad.call(img, ev as any);
      };
    } catch (error) {
      clearTimeout(timeout);
      reject(new Error('Failed to create image URL'));
    }
  });
};

// Fallback function to convert image to base64 if Firebase Storage fails
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
};

// Upload cover image to Firebase Storage
export const uploadCoverImage = async (file: File): Promise<string> => {
  try {
    console.log('🚀 Starting upload process...');
    
    // Use the same auth pattern as other API calls
    await getAuthToken(); // This will throw if user is not authenticated
    console.log('✅ Authentication verified');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    // Validate file size (max 10MB for original, will be compressed)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Please upload an image smaller than 10MB.');
    }

    console.log(`📁 Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Try compression, but fall back to original if it fails
    let fileToUpload = file;
    try {
      if (file.size > 1024 * 1024) { // Only compress if larger than 1MB
        console.log('🔄 Compressing image...');
        fileToUpload = await compressImage(file, 800, 0.8);
        console.log(`📦 Compressed file size: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
      } else {
        console.log('⚡ File is small enough, skipping compression');
      }
    } catch (compressionError) {
      console.warn('⚠️ Compression failed, using original file:', compressionError);
      fileToUpload = file; // Use original file if compression fails
    }

    try {
      // Try Firebase Storage first
      console.log('🔧 Attempting Firebase Storage upload...');

      const storage = getStorage();
      const user = auth.currentUser!;
      const timestamp = Date.now();
      const mime = fileToUpload.type;
      const extMap: Record<string,string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      const fileExtension = extMap[mime] || 'jpg';
      const fileName = `covers/${user.uid}/${timestamp}.${fileExtension}`;
      console.log(`📂 Uploading to: ${fileName}`);

      const storageRef = ref(storage, fileName);
      const metadata = { contentType: mime };

      console.log('⬆️ Starting Firebase upload...');
      const uploadPromise = uploadBytes(storageRef, fileToUpload, metadata);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timed out after 90 seconds')), 90000);
      });
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;
      console.log('✅ Firebase upload completed successfully!');

      console.log('🔗 Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);
      return downloadURL;
    } catch (storageError:any) {
      console.warn('⚠️ Firebase Storage failed:', storageError?.message || storageError);
      // Only fallback to base64 for permission or network error; otherwise bubble up.
      const msg = storageError?.message || '';
      if (/unauthorized|permission|network/i.test(msg)) {
        console.log('🔄 Converting to base64 as fallback due to recoverable error...');
        const base64Data = await convertToBase64(fileToUpload);
        console.log('✅ Base64 conversion completed');
        return base64Data;
      }
      throw storageError;
    }
    
  } catch (error) {
    console.error('❌ Error uploading cover image:', error);
    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes('storage/unauthorized')) {
        throw new Error('Storage permission denied. Please check Firebase Storage rules.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.message.includes('timed out')) {
        throw new Error('Upload timed out. Please try with a smaller image.');
      }
      throw error;
    }
    throw new Error('Failed to upload cover image');
  }
};
