import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase/client';

interface PageImage {
  id: string;
  page_name: string;
  image_url: string;
  image_name: string;
  uploaded_by: string;
  file_size: number;
  mime_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UsePageImageResult {
  imageUrl: string | null;
  image: PageImage | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch page images from the database with fallback to static images
 * 
 * @param pageName - The name of the page to fetch the image for
 * @param fallbackImagePath - Optional fallback static image path
 * @returns Object containing image data, loading state, and error handling
 * 
 * Usage:
 * ```typescript
 * const { imageUrl, loading, error, refetch } = usePageImage('home', '/images/default-home.png');
 * 
 * // In component:
 * {loading ? (
 *   <div>Loading...</div>
 * ) : (
 *   <img src={imageUrl} alt="Page image" onError={(e) => {
 *     // Optional: Handle image load errors
 *     e.currentTarget.src = fallbackImagePath;
 *   }} />
 * )}
 * ```
 */
export const usePageImage = (pageName: string, fallbackImagePath?: string): UsePageImageResult => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [image, setImage] = useState<PageImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageImage = async () => {
    if (!pageName) {
      setError('Page name is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (fallbackImagePath) {
        setImageUrl(fallbackImagePath);
        setImage(null);
        return;
      }

      // Invoke the get-page-image edge function using Supabase client
      const supabase = getSupabaseClient();
      const { data, error: functionError } = await supabase.functions.invoke('get-page-image', {
        body: { pageName }
      });

      if (functionError) {
        console.warn(`Failed to fetch dynamic image for page '${pageName}':`, functionError);
        // Use fallback image if available
        if (fallbackImagePath) {
          setImageUrl(fallbackImagePath);
          setImage(null);
        } else {
          setError(functionError.message || 'Failed to fetch page image');
        }
        return;
      }

      if (data?.image) {
        setImage(data.image);
        setImageUrl(data.image.image_url);
      } else {
        // No dynamic image found, use fallback
        if (fallbackImagePath) {
          setImageUrl(fallbackImagePath);
          setImage(null);
        } else {
          setError('No image found for this page');
        }
      }
    } catch (err) {
      console.error('Error fetching page image:', err);
      // Use fallback image on error
      if (fallbackImagePath) {
        setImageUrl(fallbackImagePath);
        setImage(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch page image');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageImage();
  }, [pageName, fallbackImagePath]);

  return {
    imageUrl,
    image,
    loading,
    error,
    refetch: fetchPageImage
  };
};

export default usePageImage;