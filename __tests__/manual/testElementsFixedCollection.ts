/**
 * This test checks the new elements fixedCollection functionality
 * and movie elements in Jest format
 */
import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeParameters } from 'n8n-workflow';
import { CreateJ2vMovie } from '../../nodes/CreateJ2vMovie/CreateJ2vMovie.node';

describe('Elements FixedCollection', () => {
  /**
   * Helper function to create a mock execute function with given parameters
   */
  const createMockExecuteFunction = (nodeParameters: INodeParameters) => {
    const mockExecute = {
      getNodeParameter: (
        parameterName: string,
        itemIndex: number,
        fallbackValue?: any
      ) => {
        // Handle dotted path notation for 'movieElements.elementValues' and 'elements.elementValues'
        if (parameterName === 'movieElements.elementValues' && nodeParameters.movieElements) {
          return nodeParameters.movieElements;
        }
        if (parameterName === 'elements.elementValues' && nodeParameters.elements) {
          return nodeParameters.elements;
        }
        
        return (
          nodeParameters[parameterName] !== undefined
            ? nodeParameters[parameterName]
            : fallbackValue
        );
      },
      getInputData: jest.fn().mockReturnValue([{}]),
      getCredentials: jest.fn().mockImplementation((type: string) => {
        if (type === 'json2VideoApiCredentials') {
          return { apiKey: 'test-api-key' };
        }
        throw new Error(`Unknown credentials type: ${type}`);
      }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        returnJsonArray: jest.fn((data: IDataObject | IDataObject[]) => {
          if (Array.isArray(data)) {
            return data.map((item: IDataObject) => ({ json: item }));
          } else {
            return [{ json: data }];
          }
        }),
        request: jest.fn().mockImplementation(async (options) => {
          // Mock request based on options
          const { method, url } = options;
  
          // For any POST request to create videos
          if (method === 'POST' && url.includes('https://api.json2video.com/v2/movies')) {
            return {
              id: 'test-job-id',
              status: 'queued',
            };
          }
          
          throw new Error(`Unexpected request in test mock: ${method} ${url}`);
        }),
        constructExecutionMetaData: jest.fn((data: INodeExecutionData[], { itemData }: { itemData: INodeExecutionData[] }) => {
          return data.map((item: INodeExecutionData, index: number) => {
            return {
              ...item,
              pairedItem: {
                item: index,
              },
            };
          });
        }),
      },
    };
    return mockExecute as unknown as IExecuteFunctions;
  };

  test('should process a mix of movie and scene elements', async () => {
    // Arrange
    const nodeParameters: INodeParameters = {
      operation: 'createMovie',
      recordId: 'test123',
      webhookUrl: 'https://example.com/webhook',
      output_width: 1024,
      output_height: 768,
      quality: 'medium',
      framerate: 30,
      advancedMode: false,
      
      // Movie elements (global elements)
      movieElements: [
        {
          // Global background image
          type: 'image',
          src: 'https://example.com/background.jpg',
          positionPreset: 'center',
          width: 1024,
          height: 768,
          start: 0,
          duration: -2 // -2 means "until end of movie"
        },
        {
          // Global background music
          type: 'audio',
          src: 'https://example.com/music.mp3',
          volume: 0.5,
          start: 0,
          duration: -2
        },
        {
          // Global watermark
          type: 'image',
          src: 'https://example.com/logo.png',
          positionPreset: 'bottom_right',
          width: 100,
          height: 50,
          start: 0,
          duration: -2
        }
      ],
      
      // Scene elements (first scene only)
      elements: [
        {
          // Scene-specific image
          type: 'image',
          src: 'https://example.com/scene-image.jpg',
          positionPreset: 'center',
          width: 400,
          height: 300,
          start: 1,
          duration: 5
        },
        {
          // Scene-specific text
          type: 'text',
          text: 'Scene Title',
          positionPreset: 'top_center',
          'font-family': 'Arial',
          'font-size': 48,
          color: 'white',
          start: 1,
          duration: 4
        }
      ]
    };

    const mockExecuteFunction = createMockExecuteFunction(nodeParameters);
    const createJ2vMovie = new CreateJ2vMovie();

    // Act
    const result = await createJ2vMovie.execute.call(mockExecuteFunction);

    // Assert
    const requestCall = (mockExecuteFunction.helpers.request as jest.Mock).mock.calls[0][0];
    console.log('Elements test request:', JSON.stringify(requestCall, null, 2));

    // Verify request body contains both 'elements' (movie elements) and 'scenes' with scene elements
    expect(requestCall.body).toHaveProperty('elements');
    expect(requestCall.body.elements).toHaveLength(3);
    expect(requestCall.body).toHaveProperty('scenes');
    expect(requestCall.body.scenes[0].elements).toHaveLength(2);

    // Check movie elements were processed correctly
    expect(requestCall.body.elements[0].type).toBe('image');
    expect(requestCall.body.elements[0].src).toBe('https://example.com/background.jpg');
    expect(requestCall.body.elements[1].type).toBe('audio');
    expect(requestCall.body.elements[2].type).toBe('image');
    expect(requestCall.body.elements[2].src).toBe('https://example.com/logo.png');

    // Check scene elements
    expect(requestCall.body.scenes[0].elements[0].type).toBe('image');
    expect(requestCall.body.scenes[0].elements[0].src).toBe('https://example.com/scene-image.jpg');
    expect(requestCall.body.scenes[0].elements[1].type).toBe('text');
    expect(requestCall.body.scenes[0].elements[1].text).toBe('Scene Title');

    // Verify the API response was returned
    expect(result).toEqual([[
      {
        json: {
          id: 'test-job-id',
          status: 'queued',
        },
        pairedItem: { item: 0 },
      }
    ]]);
  });
});
