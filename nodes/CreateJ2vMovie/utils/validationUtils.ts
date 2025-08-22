// nodes/CreateJ2vMovie/utils/validationUtils.ts

import { IDataObject } from 'n8n-workflow';

/**
 * Validates that no subtitle elements are present in scene-level elements
 * Subtitles can only be used at movie level according to JSON2Video API
 */
export function validateNoSubtitlesInSceneElements(elements: IDataObject[]): string[] {
    const errors: string[] = [];
    
    if (!Array.isArray(elements)) {
        return errors;
    }
    
    elements.forEach((element, index) => {
        if (element.type === 'subtitles') {
            errors.push(`Element ${index + 1}: Subtitles can only be added at movie level, not in individual scenes. Please move this subtitle to the Movie Elements section.`);
        }
    });
    
    return errors;
}

/**
 * Validates that subtitle elements in movie-level collections have required properties
 */
export function validateMovieLevelSubtitles(elements: IDataObject[]): string[] {
    const errors: string[] = [];
    
    if (!Array.isArray(elements)) {
        return errors;
    }
    
    elements.forEach((element, index) => {
        if (element.type === 'subtitles') {
            // Validate that captions or auto-generation is specified
            if (!element.captions && !element.text && !element.src) {
                errors.push(`Subtitle element ${index + 1}: Must specify captions content, URL, or enable auto-generation from audio`);
            }
            
            // Validate language if specified
            if (element.language && typeof element.language !== 'string') {
                errors.push(`Subtitle element ${index + 1}: Language must be a valid language code (e.g., 'en', 'es', 'fr')`);
            }
        }
    });
    
    return errors;
}

/**
 * Comprehensive element validation for scene-level elements
 */
export function validateSceneElements(elements: IDataObject[], elementContext: string = 'scene'): string[] {
    const errors: string[] = [];
    
    // Check for subtitles in scene elements
    const subtitleErrors = validateNoSubtitlesInSceneElements(elements);
    errors.push(...subtitleErrors);
    
    // Add other scene-level validations here in the future
    // e.g., required properties, valid ranges, etc.
    
    return errors;
}

/**
 * Comprehensive element validation for movie-level elements
 */
export function validateMovieElements(elements: IDataObject[]): string[] {
    const errors: string[] = [];
    
    // Validate subtitle elements specifically
    const subtitleErrors = validateMovieLevelSubtitles(elements);
    errors.push(...subtitleErrors);
    
    // Add other movie-level validations here in the future
    
    return errors;
}