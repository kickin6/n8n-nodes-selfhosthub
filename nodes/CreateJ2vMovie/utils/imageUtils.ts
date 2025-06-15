import { IExecuteFunctions } from 'n8n-workflow';
import { get } from 'http';
import { get as httpsGet } from 'https';

/**
 * Checks if dimensions should be auto-detected
 * This happens when both width and height are zero, null, or undefined
 */
export function shouldAutoDetectDimensions(width?: number, height?: number): boolean {
    return (width === undefined || width === null || width === 0) && 
           (height === undefined || height === null || height === 0);
}

/**
 * Attempts to determine the dimensions of an image or video from its URL
 * This is a simplified implementation that works for many image types
 * 
 * @param url The URL of the media file
 * @returns A promise resolving to {width, height} or null if dimensions couldn't be determined
 */
export async function getMediaDimensions(
    this: IExecuteFunctions,
    url: string
): Promise<{ width: number, height: number } | null> {
    // Skip fetching dimensions for local files or when we're in test mode
    if (url.startsWith('file://') || process.env.NODE_ENV === 'test') {
        return null;
    }

    try {
        // Check if it's an image URL
        if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i)) {
            return await getImageDimensions.call(this, url);
        } 
        
        // For other media types, return null (we could implement video dimension detection in the future)
        return null;
    } catch (error) {
        // Log the error but don't throw
        this.logger.warn(`Failed to get media dimensions for ${url}: ${error}`);
        return null;
    }
}

/**
 * Get image dimensions by downloading just enough of the file to extract the header information
 * This avoids downloading the entire file for large images
 */
async function getImageDimensions(
    this: IExecuteFunctions,
    url: string
): Promise<{ width: number, height: number } | null> {
    const isHttps = url.startsWith('https://');
    const httpGet = isHttps ? httpsGet : get;

    return new Promise((resolve, reject) => {
        const req = httpGet(url, (response) => {
            // We'll download only a small part of the image, just enough to get dimensions
            const chunks: Buffer[] = [];
            let totalLength = 0;
            const MAX_BYTES = 10240; // Only download up to 10KB

            response.on('data', (chunk: Buffer) => {
                chunks.push(chunk);
                totalLength += chunk.length;
                
                // Once we have enough data, try to extract dimensions
                if (totalLength >= MAX_BYTES) {
                    req.abort(); // Stop downloading
                    const buffer = Buffer.concat(chunks);
                    
                    try {
                        // Try to determine dimensions from the partial buffer
                        const dimensions = extractImageDimensions(buffer, url);
                        if (dimensions) {
                            resolve(dimensions);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
                        resolve(null);
                    }
                }
            });

            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                
                try {
                    const dimensions = extractImageDimensions(buffer, url);
                    resolve(dimensions || null);
                } catch (e) {
                    resolve(null);
                }
            });

            response.on('error', (e) => {
                reject(e);
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        // Set a timeout to avoid hanging
        req.setTimeout(5000, () => {
            req.abort();
            reject(new Error('Timeout while fetching image dimensions'));
        });
    });
}

/**
 * Extract dimensions from image buffer 
 * This is a very simplified implementation that only handles some common formats
 */
function extractImageDimensions(
    buffer: Buffer, 
    url: string
): { width: number, height: number } | null {
    // JPEG format
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return extractJpegDimensions(buffer);
    }
    
    // PNG format
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return extractPngDimensions(buffer);
    }
    
    // For other formats or if we couldn't determine dimensions, return null
    return null;
}

/**
 * Extract dimensions from a JPEG image buffer
 */
function extractJpegDimensions(buffer: Buffer): { width: number, height: number } | null {
    let i = 2;
    
    while (i < buffer.length) {
        // Check for Start of Frame markers (SOF0, SOF1, SOF2)
        if (buffer[i] === 0xFF && (buffer[i + 1] >= 0xC0 && buffer[i + 1] <= 0xC2)) {
            // Skip marker and length
            i += 4;
            
            // Extract height and width (big-endian format)
            const height = (buffer[i] << 8) + buffer[i + 1];
            const width = (buffer[i + 2] << 8) + buffer[i + 3];
            
            return { width, height };
        }
        
        // Move to the next marker
        i += 1;
        if (buffer[i] === 0xFF) continue;
        
        // Skip segment based on length
        if (i + 1 < buffer.length) {
            const segmentLength = (buffer[i] << 8) + buffer[i + 1];
            i += segmentLength;
        } else {
            break;
        }
    }
    
    return null;
}

/**
 * Extract dimensions from a PNG image buffer
 */
function extractPngDimensions(buffer: Buffer): { width: number, height: number } | null {
    // PNG stores dimensions at a fixed position in the IHDR chunk
    if (buffer.length >= 24) {
        // Width is at bytes 16-19, height at bytes 20-23 (big-endian)
        const width = buffer.readUInt32BE(16);
        const height = buffer.readUInt32BE(20);
        
        return { width, height };
    }
    
    return null;
}