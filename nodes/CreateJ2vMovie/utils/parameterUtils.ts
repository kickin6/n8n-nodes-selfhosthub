import {
        IDataObject,
        IExecuteFunctions,
        NodeParameterValue,
} from 'n8n-workflow';

/**
 * Helper function to calculate X and Y coordinates based on position presets
 *
 * Note: In JSON2Video API, x,y coordinates refer to the CENTER of the element.
 * This function provides intuitive positioning while respecting this API behavior.
 * 
 * Important: The JSON2Video API uses a coordinate system where:
 * - (0,0) is the TOP-LEFT corner of the video
 * - Positive X goes RIGHT
 * - Positive Y goes DOWN
 *
 * The positions are designed to be predictable without artificially constraining
 * elements to be fully visible, allowing for creative uses including animations
 * where elements may be partially off-screen.
 *
 * NOTE: For better compatibility with the JSON2Video API, use mapPositionPresetToApiFormat
 * to convert position presets to the API's expected format (e.g., 'center-center').
 */
export function calculatePositionFromPreset(
        positionPreset: string,
        width: number,
        height: number,
        elementWidth: number = 0,
        elementHeight: number = 0,
): { x: number, y: number } {
        // Default video dimensions
        const videoWidth = width || 1024;
        const videoHeight = height || 768;

        // For positions that need to reference element edges, determine offsets
        // Use either half the element dimensions or a default offset of 50px
        const elemWidthOffset = elementWidth ? elementWidth / 2 : 50;
        const elemHeightOffset = elementHeight ? elementHeight / 2 : 50;

        // Handle different position presets
        switch (positionPreset) {
                case 'center':
                        // Center of the video frame
                        return { x: videoWidth / 2, y: videoHeight / 2 };

                case 'top_left':
                        // Place element with its top-left at frame's top-left
                        // Offset by half its dimensions to place at the corner
                        return {
                                x: elemWidthOffset,
                                y: elemHeightOffset
                        };

                case 'top_center':
                        // Top edge centered horizontally
                        return {
                                x: videoWidth / 2,
                                y: elemHeightOffset
                        };

                case 'top_right':
                        // Top-right corner
                        return {
                                x: videoWidth - elemWidthOffset,
                                y: elemHeightOffset
                        };

                case 'middle_left':
                        // Left edge, vertically centered
                        return {
                                x: elemWidthOffset,
                                y: videoHeight / 2
                        };

                case 'middle_right':
                        // Right edge, vertically centered
                        return {
                                x: videoWidth - elemWidthOffset,
                                y: videoHeight / 2
                        };

                case 'bottom_left':
                        // Bottom-left corner
                        return {
                                x: elemWidthOffset,
                                y: videoHeight - elemHeightOffset
                        };

                case 'bottom_center':
                        // Bottom edge, horizontally centered
                        return {
                                x: videoWidth / 2,
                                y: videoHeight - elemHeightOffset
                        };

                case 'bottom_right':
                        // Bottom-right corner
                        return {
                                x: videoWidth - elemWidthOffset,
                                y: videoHeight - elemHeightOffset
                        };

                default:
                        // Default to center if unknown preset
                        return { x: videoWidth / 2, y: videoHeight / 2 };
        }
}

/**
 * Maps internal position presets to JSON2Video API position format
 * The JSON2Video API expects position values like "center-center", "top-left", etc.
 */
export function mapPositionPresetToApiFormat(positionPreset: string): string {
    // Convert from n8n preset to JSON2Video position format
    const positionMap: {[key: string]: string} = {
        'center': 'center-center',
        'top_left': 'top-left',
        'top_center': 'top-center',
        'top_right': 'top-right',
        'middle_left': 'center-left',
        'middle_right': 'center-right',
        'bottom_left': 'bottom-left',
        'bottom_center': 'bottom-center',
        'bottom_right': 'bottom-right'
    };
    
    return positionMap[positionPreset] || 'center-center';
}

/**
 * Helper function to retrieve a parameter value for a given operation and mode
 * This centralizes parameter retrieval logic, making it easier to maintain
 */
export function getParameterValue(
        this: IExecuteFunctions,
        parameterName: string,
        itemIndex = 0,
        defaultValue: NodeParameterValue = '',
): NodeParameterValue {
        try {
                return this.getNodeParameter(parameterName, itemIndex, defaultValue) as NodeParameterValue;
        } catch (error: any) {
                // Parameter doesn't exist or is not available with current settings
                return defaultValue;
        }
}

/**
 * Builds a JSON2Video request body based on provided parameters
 * Centralizes the logic for building request bodies across different operations
 */
export function buildRequestBody(
        this: IExecuteFunctions,
        operation: string,
        itemIndex = 0,
        isAdvancedMode = false,
): IDataObject {
        console.log('DEBUG - buildRequestBody called with operation:', operation, 'isAdvancedMode:', isAdvancedMode);
        const requestBody: IDataObject = {};

        // If in advanced mode, use the JSON template directly
        if (isAdvancedMode) {
                const paramName = operation === 'createMovie'
                        ? 'jsonTemplate'
                        : operation === 'mergeVideoAudio'
                                ? 'jsonTemplateMergeAudio'
                                : 'jsonTemplateMergeVideos';

                const jsonTemplate = this.getNodeParameter(paramName, itemIndex, '{}') as string;

                try {
                        // Parse the JSON template
                        const parsedTemplate = JSON.parse(jsonTemplate);
                        // Return the parsed template as the request body
                        return parsedTemplate; // Send directly as the API expects
                } catch (error: any) {
                        throw new Error(`Invalid JSON template: ${error.message || 'Unknown parsing error'}`);
                }
        }

        // For basic mode, build the request body based on the operation
        switch (operation) {
                case 'createMovie':
                        return buildCreateMovieRequestBody.call(this, itemIndex);
                case 'mergeVideoAudio':
                        return buildMergeVideoAudioRequestBody.call(this, itemIndex);
                case 'mergeVideos':
                        return buildMergeVideosRequestBody.call(this, itemIndex);
                case 'checkStatus':
                        // No need to build a request body for status check
                        return {};
                default:
                        throw new Error(`Unsupported operation: ${operation}`);
        }
}

/**
 * Process an element object based on its type and return the API-compatible format
 */
function processElement(
        this: IExecuteFunctions,
        element: IDataObject,
        videoWidth: number,
        videoHeight: number
): IDataObject {
        const processedElement: IDataObject = {
                type: element.type,
                start: element.start,
                duration: element.duration,
        };

        // Process element properties based on type
        switch (element.type) {
                case 'image':
                        processedElement.src = element.src;

                        // Handle positioning using either named positions or custom x,y
                        if (element.positionPreset && element.positionPreset !== 'custom') {
                                // Use named position (JSON2Video API preferred approach)
                                processedElement.position = mapPositionPresetToApiFormat(element.positionPreset as string);
                                
                                // For backward compatibility, also calculate x,y coordinates
                                // Calculate position based on preset
                                const position = calculatePositionFromPreset(
                                        element.positionPreset as string,
                                        videoWidth,
                                        videoHeight,
                                        element.width as number,
                                        element.height as number,
                                );

                                // Apply calculated position as fallback
                                processedElement.x = position.x;
                                processedElement.y = position.y;
                        } else {
                                // Use custom position with explicit x,y coordinates
                                processedElement.position = 'custom';
                                processedElement.x = element.x;
                                processedElement.y = element.y;
                        }

                        // Add other image properties
                        if ((element.width as number) > 0) processedElement.width = element.width;
                        if ((element.height as number) > 0) processedElement.height = element.height;
                        if ((element.zoom as number) !== 0) processedElement.zoom = element.zoom;
                        break;

                case 'video':
                        processedElement.src = element.src;
                        
                        // Apply the same position handling as for images
                        if (element.positionPreset && element.positionPreset !== 'custom') {
                                processedElement.position = mapPositionPresetToApiFormat(element.positionPreset as string);
                        } else if (element.x !== undefined && element.y !== undefined) {
                                processedElement.position = 'custom';
                                processedElement.x = element.x;
                                processedElement.y = element.y;
                        }
                        
                        // Add video-specific properties
                        if (element.volume !== undefined) processedElement.volume = element.volume;
                        if (element.muted !== undefined) processedElement.muted = element.muted;
                        if (element.crop !== undefined) processedElement.crop = element.crop;
                        break;

                case 'text':
                        processedElement.text = element.text;

                        // Handle positioning using either named positions or custom x,y
                        if (element.positionPreset && element.positionPreset !== 'custom') {
                                // Use named position (JSON2Video API preferred approach)
                                processedElement.position = mapPositionPresetToApiFormat(element.positionPreset as string);
                                
                                // For backward compatibility, also calculate x,y coordinates
                                // Calculate position based on preset
                                const position = calculatePositionFromPreset(
                                        element.positionPreset as string,
                                        videoWidth,
                                        videoHeight,
                                );

                                // Apply calculated position as fallback
                                processedElement.x = position.x;
                                processedElement.y = position.y;
                        } else {
                                // Use custom position with explicit x,y coordinates
                                processedElement.position = 'custom';
                                processedElement.x = element.x;
                                processedElement.y = element.y;
                        }

                        // Add other text properties
                        processedElement['font-family'] = element['font-family'];
                        processedElement['font-size'] = element['font-size'];
                        processedElement.color = element.color;
                        break;

                case 'audio':
                        processedElement.src = element.src;
                        processedElement.volume = element.volume;
                        break;

                case 'voice':
                        processedElement.text = element.text;
                        processedElement.voice = element.voice;
                        break;

                case 'subtitles':
                        // Handle subtitle source based on the source type
                        if (element.subtitleSourceType === 'text') {
                                processedElement.text = element.text;
                        } else if (element.subtitleSourceType === 'src') {
                                processedElement.src = element.src;
                        }

                        // Add common subtitle parameters
                        processedElement.language = element.language;
                        processedElement.position = element.position;

                        // Add styling parameters if they exist
                        if (element['font-family']) processedElement['font-family'] = element['font-family'];
                        if (element['font-size']) processedElement['font-size'] = element['font-size'];
                        if (element.color) processedElement.color = element.color;
                        if (element['background-color']) processedElement['background-color'] = element['background-color'];
                        if (element.style) processedElement.style = element.style;
                        if (element.opacity) processedElement.opacity = element.opacity;
                        break;
        }

        return processedElement;
}

/**
 * Builds the request body for the createMovie operation in basic mode
 */
function buildCreateMovieRequestBody(
        this: IExecuteFunctions,
        itemIndex = 0,
): IDataObject {
        // Create the basic movie structure for the API
        const requestBody: IDataObject = {
                fps: this.getNodeParameter('framerate', itemIndex, 25),
                width: this.getNodeParameter('output_width', itemIndex, 1024),
                height: this.getNodeParameter('output_height', itemIndex, 768),
                scenes: [],
        };

        // Add quality parameter
        const quality = this.getNodeParameter('quality', itemIndex, '') as string;
        if (quality) {
                requestBody.quality = quality;
        }
        
        // Add optional parameters that are allowed at the top level
        try {
            const cache = this.getNodeParameter('cache', itemIndex, undefined);
            if (cache !== undefined) {
                requestBody.cache = cache;
            }
        } catch (error) {
            this.logger.debug('Cache parameter not available');
        }
        
        try {
            const draft = this.getNodeParameter('draft', itemIndex, undefined);
            if (draft !== undefined) {
                requestBody.draft = draft;
            }
        } catch (error) {
            this.logger.debug('Draft parameter not available');
        }
        
        // Get movie-level elements (same across all scenes)
        try {
            const movieElements = this.getNodeParameter('movieElements.elementValues', itemIndex, []) as IDataObject[];
            console.log('DEBUG movieElements path1:', movieElements);
            
            if (Array.isArray(movieElements) && movieElements.length > 0) {
                // Process each movie element
                requestBody.elements = movieElements.map(element => 
                    processElement.call(
                        this,
                        element, 
                        requestBody.width as number, 
                        requestBody.height as number
                    )
                );
            }
        } catch (error) {
            // Try alternative path for backward compatibility or different parameter structure
            try {
                console.log('DEBUG: Could not get movieElements:', error);
                const elements = this.getNodeParameter('movieElements', itemIndex, []) as IDataObject[];
                console.log('DEBUG movieElements path2:', elements);
                
                if (Array.isArray(elements) && elements.length > 0) {
                    requestBody.elements = elements.map(element => 
                        processElement.call(
                            this,
                            element, 
                            requestBody.width as number, 
                            requestBody.height as number
                        )
                    );
                }
            } catch (altError) {
                this.logger.debug('Movie elements collection not available or empty');
            }
        }

        // Get scene-specific elements
        const scenes: Array<{elements: IDataObject[]}> = [];
        
        try {
            const sceneElements = this.getNodeParameter('elements.elementValues', itemIndex, []) as IDataObject[];
            console.log('DEBUG sceneElements path1:', sceneElements);
            
            if (Array.isArray(sceneElements) && sceneElements.length > 0) {
                // Create a scene with the elements
                const scene = {
                    elements: sceneElements.map(element => 
                        processElement.call(
                            this,
                            element, 
                            requestBody.width as number, 
                            requestBody.height as number
                        )
                    )
                };
                scenes.push(scene);
            }
        } catch (error) {
            // Try alternative path for backward compatibility
            try {
                console.log('DEBUG: Could not get scene elements:', error);
                const elements = this.getNodeParameter('elements', itemIndex, []) as IDataObject[];
                
                if (Array.isArray(elements) && elements.length > 0) {
                    const scene = {
                        elements: elements.map(element => 
                            processElement.call(
                                this,
                                element, 
                                requestBody.width as number, 
                                requestBody.height as number
                            )
                        )
                    };
                    scenes.push(scene);
                }
            } catch (altError) {
                this.logger.debug('Scene elements collection not available or empty');
            }
        }
        
        // Add the scenes to the request body
        requestBody.scenes = scenes;
        
        return requestBody;
}

/**
 * Builds the request body for the mergeVideoAudio operation in basic mode
 */
export function buildMergeVideoAudioRequestBody(
        this: IExecuteFunctions,
        itemIndex = 0,
): IDataObject {
        // Create the basic structure for video audio merge
        const requestBody: IDataObject = {};
        
        // Get video element
        try {
            const videoDetails = this.getNodeParameter('videoElement.videoDetails', itemIndex, {}) as IDataObject;
            if (videoDetails && videoDetails.src) {
                // Set video source
                requestBody.video = videoDetails.src;
                
                // Add optional video parameters
                if (videoDetails.start !== undefined) requestBody.video_start = videoDetails.start;
                if (videoDetails.duration !== undefined) requestBody.video_duration = videoDetails.duration;
                if (videoDetails.speed !== undefined) requestBody.video_speed = videoDetails.speed;
                if (videoDetails.volume !== undefined) requestBody.video_volume = videoDetails.volume;
            }
        } catch (error) {
            this.logger.debug('Video element not available or missing required properties');
        }
        
        // Get audio element
        try {
            const audioDetails = this.getNodeParameter('audioElement.audioDetails', itemIndex, {}) as IDataObject;
            if (audioDetails && audioDetails.src) {
                // Set audio source
                requestBody.audio = audioDetails.src;
                
                // Add optional audio parameters
                if (audioDetails.start !== undefined) requestBody.audio_start = audioDetails.start;
                if (audioDetails.duration !== undefined) requestBody.audio_duration = audioDetails.duration;
                if (audioDetails.volume !== undefined) requestBody.audio_volume = audioDetails.volume;
                if (audioDetails.loop !== undefined) requestBody.audio_loop = audioDetails.loop;
            }
        } catch (error) {
            this.logger.debug('Audio element not available or missing required properties');
        }
        
        // Get output settings
        try {
            const outputSettings = this.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as IDataObject;
            if (outputSettings) {
                if (outputSettings.width !== undefined) requestBody.width = outputSettings.width;
                if (outputSettings.height !== undefined) requestBody.height = outputSettings.height;
                if (outputSettings.fps !== undefined) requestBody.fps = outputSettings.fps;
                if (outputSettings.quality !== undefined) requestBody.quality = outputSettings.quality;
                if (outputSettings.format !== undefined) requestBody.format = outputSettings.format;
            }
        } catch (error) {
            this.logger.debug('Output settings not available or error accessing properties');
        }
        
        // Set default values if not specified
        if (requestBody.width === undefined) requestBody.width = 1024;
        if (requestBody.height === undefined) requestBody.height = 768;
        if (requestBody.fps === undefined) requestBody.fps = 30;
        
        return requestBody;
}

/**
 * Builds the request body for the mergeVideos operation in basic mode
 */
export function buildMergeVideosRequestBody(
        this: IExecuteFunctions,
        itemIndex = 0,
): IDataObject {
        const requestBody: IDataObject = {};
        const videoConfigurations: IDataObject[] = [];
        
        // Get video elements collection
        try {
            const videoElements = this.getNodeParameter('videoElements.videoDetails', itemIndex, []) as IDataObject[];
            
            if (Array.isArray(videoElements) && videoElements.length > 0) {
                // Process each video element into a video configuration
                videoElements.forEach((videoElement) => {
                    if (videoElement.src) {
                        const videoConfig: IDataObject = {
                            src: videoElement.src,
                        };
                        
                        // Add additional video properties if provided
                        if (videoElement.start !== undefined) videoConfig.start = videoElement.start;
                        // Using explicit null check and casting to handle TypeScript typing
                        const videoDuration = videoElement.duration;
                        if (videoDuration !== undefined && videoDuration !== null) {
                            const duration = Number(videoDuration);
                            if (!isNaN(duration) && duration > 0) {
                                videoConfig.duration = duration;
                            }
                        }
                        if (videoElement.speed !== undefined) videoConfig.speed = videoElement.speed;
                        if (videoElement.volume !== undefined) videoConfig.volume = videoElement.volume;
                        
                        videoConfigurations.push(videoConfig);
                    }
                });
                
                // Add videos array to request body if we have any valid configurations
                if (videoConfigurations.length > 0) {
                    requestBody.videos = videoConfigurations;
                }
            } else {
                // Handle backwards compatibility or error case - we need at least one video
                this.logger.debug('No video elements found or empty array');
                requestBody.videos = [];
            }
        } catch (error) {
            this.logger.debug('Error accessing video elements collection');
            requestBody.videos = [];
        }
        
        // Get transition settings
        try {
            const transition = this.getNodeParameter('transition', itemIndex, 'none') as string;
            if (transition && transition !== 'none') {
                requestBody.transition = transition;
                
                const transitionDuration = this.getNodeParameter('transitionDuration', itemIndex, 1) as number;
                if (transitionDuration > 0) {
                    requestBody.transition_duration = transitionDuration;
                }
            }
        } catch (error) {
            this.logger.debug('Error accessing transition settings');
        }
        
        // Get output settings
        try {
            const outputSettings = this.getNodeParameter('outputSettings.outputDetails', itemIndex, {}) as IDataObject;
            if (outputSettings) {
                if (outputSettings.width !== undefined) requestBody.width = outputSettings.width;
                if (outputSettings.height !== undefined) requestBody.height = outputSettings.height;
                if (outputSettings.fps !== undefined) requestBody.fps = outputSettings.fps;
                if (outputSettings.quality !== undefined) requestBody.quality = outputSettings.quality;
                if (outputSettings.format !== undefined) requestBody.format = outputSettings.format;
            }
        } catch (error) {
            this.logger.debug('No output settings found or error accessing output settings properties');
        }
        
        // Always ensure default values for output settings regardless of whether they were specified
        if (requestBody.width === undefined) requestBody.width = 1024;
        if (requestBody.height === undefined) requestBody.height = 768;
        if (requestBody.fps === undefined) requestBody.fps = 30;
        
        return requestBody;
}