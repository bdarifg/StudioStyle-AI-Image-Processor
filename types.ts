
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface ProcessedImage {
  id: string;
  file: File;
  originalUrl: string;
  status: ImageStatus;
  transparentImageUrl?: string;
  whiteBgImageUrl?: string;
  error?: string;
}
