import { shouldAutoDetectDimensions, getMediaDimensions } from '../../../../nodes/CreateJ2vMovie/utils/imageUtils';
import { IExecuteFunctions } from 'n8n-workflow';
import * as http from 'http';
import * as https from 'https';
import { EventEmitter } from 'events';

// Mock http and https modules
jest.mock('http');
jest.mock('https');

describe('imageUtils', () => {
  describe('shouldAutoDetectDimensions', () => {
    test('should return true when both width and height are undefined', () => {
      expect(shouldAutoDetectDimensions(undefined, undefined)).toBe(true);
    });

    test('should return true when both width and height are null', () => {
      expect(shouldAutoDetectDimensions(null as unknown as number, null as unknown as number)).toBe(true);
    });

    test('should return true when both width and height are 0', () => {
      expect(shouldAutoDetectDimensions(0, 0)).toBe(true);
    });

    test('should return false when width is defined but height is not', () => {
      expect(shouldAutoDetectDimensions(100, undefined)).toBe(false);
    });

    test('should return false when height is defined but width is not', () => {
      expect(shouldAutoDetectDimensions(undefined, 100)).toBe(false);
    });

    test('should return false when both width and height are defined', () => {
      expect(shouldAutoDetectDimensions(100, 100)).toBe(false);
    });
  });

  describe('getMediaDimensions', () => {
    // Mock logger
    const mockLogger = {
      warn: jest.fn(),
    };

    // Create a mock IExecuteFunctions
    const mockExecuteFunctions = {
      logger: mockLogger,
    } as unknown as IExecuteFunctions;

    // Helper to create mock response
    const createMockResponse = () => {
      const eventEmitter = new EventEmitter();
      return {
        on: eventEmitter.on.bind(eventEmitter),
        emit: eventEmitter.emit.bind(eventEmitter),
      };
    };

    // Helper to create mock request
    const createMockRequest = () => {
      const eventEmitter = new EventEmitter();
      return {
        on: eventEmitter.on.bind(eventEmitter),
        emit: eventEmitter.emit.bind(eventEmitter),
        abort: jest.fn(),
        setTimeout: jest.fn((ms, callback) => {
          // Simulate a timeout by invoking the callback directly
          if (typeof callback === 'function') {
            setTimeout(callback, 0);
          }
          return 123; // mock timer ID
        }),
      };
    };

    beforeEach(() => {
      jest.clearAllMocks();
      // Start tests in 'test' environment
      process.env.NODE_ENV = 'test';
    });

    test('should return null for local file URLs', async () => {
      const result = await getMediaDimensions.call(mockExecuteFunctions, 'file:///path/to/image.jpg');
      expect(result).toBeNull();
    });

    test('should return null in test environment', async () => {
      const result = await getMediaDimensions.call(mockExecuteFunctions, 'https://example.com/image.jpg');
      expect(result).toBeNull();
    });

    test('should return null for non-image URLs', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';
      
      const result = await getMediaDimensions.call(mockExecuteFunctions, 'https://example.com/video.mp4');
      expect(result).toBeNull();
    });

    test('should handle errors gracefully', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';
      
      // Mock http get to throw an error
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        throw new Error('Network error');
      });

      const result = await getMediaDimensions.call(mockExecuteFunctions, 'http://example.com/image.jpg');
      
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    // Additional test cases to cover more lines
    test('should handle HTTP image requests for JPEG format', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Create a JPEG-like buffer to simulate a valid JPEG file with SOF0 marker
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, // JPEG SOI marker
        0xFF, 0xC0, // SOF0 marker
        0x00, 0x11, // Length field (17 bytes, includes this field)
        0x08,       // Data precision (8 bits)
        0x01, 0x00, // Height (256 in big-endian)
        0x01, 0x00  // Width (256 in big-endian)
      ]);

      // Emit data and end events to complete the request
      mockRes.emit('data', jpegBuffer);
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Just check that we got a valid result with width and height properties
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
    });

    test('should handle HTTP image requests for PNG format', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.png'
      );

      // Create a PNG-like buffer with known dimensions
      const pngBuffer = Buffer.alloc(30);
      // PNG magic number
      pngBuffer[0] = 0x89;
      pngBuffer[1] = 0x50;
      pngBuffer[2] = 0x4E;
      pngBuffer[3] = 0x47;
      // Skip to width/height positions
      pngBuffer.writeUInt32BE(256, 16); // Width: 256
      pngBuffer.writeUInt32BE(256, 20); // Height: 256

      // Emit data and end events to complete the request
      mockRes.emit('data', pngBuffer);
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Just check that we got a valid result with width and height properties
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
      expect(result?.width).toBe(256);
      expect(result?.height).toBe(256);
    });

    test('should handle HTTPS image requests', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock https.get to return our mock request and invoke callback with mock response
      (https.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'https://example.com/image.png'
      );

      // Create a PNG-like buffer with known dimensions
      const pngBuffer = Buffer.alloc(30);
      // PNG magic number
      pngBuffer[0] = 0x89;
      pngBuffer[1] = 0x50;
      pngBuffer[2] = 0x4E;
      pngBuffer[3] = 0x47;
      // Skip to width/height positions
      pngBuffer.writeUInt32BE(512, 16); // Width: 512
      pngBuffer.writeUInt32BE(512, 20); // Height: 512

      // Emit data and end events to complete the request
      mockRes.emit('data', pngBuffer);
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Just check that we got a valid result with width and height properties
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
    });

    test('should handle empty response', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Emit end event without any data
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Since we didn't send valid image data, we expect null
      expect(result).toBeNull();
    });

    test('should handle incremental data chunks', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Create a JPEG-like buffer in two parts
      const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF]);
      const jpegData = Buffer.from([
        0xC0, 0x00, 0x11, 0x08, 0x02, 0x00, 0x03, 0x00, 0x00 // SOF0 with dimensions
      ]);

      // Emit data in chunks to test multiple data events
      mockRes.emit('data', jpegHeader);
      mockRes.emit('data', jpegData);
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Just check that we got a valid result
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');
    });

    test('should handle response error', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Emit error event to test error handling
      mockRes.emit('error', new Error('Response error'));

      // Wait for promise to resolve
      try {
        await dimensionsPromise;
      } catch (error) {
        // We expect an error to be caught by the getMediaDimensions function
        // and null to be returned, so this shouldn't execute
        expect(error).toBeUndefined();
      }
      
      // Confirm that our error was handled and logged
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    test('should handle request error', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Emit error event on the request to test error handling
      mockReq.emit('error', new Error('Request error'));

      // Wait for promise to resolve
      try {
        await dimensionsPromise;
      } catch (error) {
        // We expect an error to be caught by the getMediaDimensions function
        // and null to be returned, so this shouldn't execute
        expect(error).toBeUndefined();
      }
      
      // Confirm that our error was handled and logged
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    test('should handle timeout error', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Trigger the timeout callback directly
      const timeoutCallback = mockReq.setTimeout.mock.calls[0][1];
      timeoutCallback();

      // Wait for promise to resolve
      try {
        await dimensionsPromise;
      } catch (error) {
        // We expect an error to be caught by the getMediaDimensions function
        // and null to be returned, so this shouldn't execute
        expect(error).toBeUndefined();
      }
      
      // Confirm that our error was handled and logged
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    test('should handle large data chunks that exceed MAX_BYTES', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Create a large buffer that exceeds MAX_BYTES (10KB)
      // Start with proper JPEG SOI marker followed by SOF0 marker with dimensions
      const jpegHeader = Buffer.from([
        0xFF, 0xD8, 0xFF, // SOI marker
        0xC0, 0x00, 0x11, 0x08, // SOF0 marker, length, precision
        0x04, 0x00, // Height (1024)
        0x03, 0x00  // Width (768)
      ]);
      
      // Then add padding to exceed 10KB
      const largeBuffer = Buffer.alloc(15000);
      jpegHeader.copy(largeBuffer);

      // Emit the large data chunk
      mockRes.emit('data', largeBuffer);

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Check that we got a result and the request was aborted
      expect(result).not.toBeNull();
      expect(mockReq.abort).toHaveBeenCalled();
    });

    test('should return null for invalid JPEG data', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.jpg'
      );

      // Create an invalid JPEG buffer (just the FF D8 FF header but no SOF marker)
      const invalidJpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);

      // Emit data and end events
      mockRes.emit('data', invalidJpegBuffer);
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Since we didn't send valid JPEG data with SOF marker, we expect null
      expect(result).toBeNull();
    });

    test('should return null for invalid PNG data', async () => {
      // Change environment to simulate production
      process.env.NODE_ENV = 'production';

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();
      
      // Mock http.get to return our mock request and invoke callback with mock response
      (http.get as jest.Mock).mockImplementation((url, callback) => {
        callback(mockRes);
        return mockReq;
      });

      // Create promise for async test
      const dimensionsPromise = getMediaDimensions.call(
        mockExecuteFunctions, 
        'http://example.com/image.png'
      );

      // Create a PNG-like buffer that's too small to contain dimensions
      const invalidPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

      // Emit data and end events
      mockRes.emit('data', invalidPngBuffer);
      mockRes.emit('end');

      // Wait for promise to resolve
      const result = await dimensionsPromise;
      
      // Since the buffer is too small to extract dimensions, we expect null
      expect(result).toBeNull();
    });
  });
});