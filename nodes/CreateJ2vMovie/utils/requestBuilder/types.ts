// nodes/CreateJ2vMovie/utils/requestBuilder/types.ts

import { IDataObject } from 'n8n-workflow';

export interface Scene {
  elements: IDataObject[];
  transition?: {
    style: string;
    duration?: number;
  };
  duration?: number;
  comment?: string;
  'background-color'?: string;
}

export interface VideoRequestBody {
  fps: number;
  width: number;
  height: number;
  scenes: Scene[];
  id?: string;
  exports?: Array<{
    destinations: Array<{
      type: string;
      endpoint: string;
    }>;
  }>;
  quality?: string;
  cache?: boolean;
  'client-data'?: IDataObject;
  comment?: string;
  draft?: boolean;
  elements?: IDataObject[];
  webhook?: IDataObject;
  resolution?: string;
}

export interface VideoElement {
  type: 'video';
  src: string;
  duration?: number;
  volume?: number;
  muted?: boolean;
  loop?: number;
  resize?: string;
  start?: number;
  speed?: number;
}

export interface AudioElement {
  type: 'audio';
  src: string;
  start?: number;
  duration?: number;
  volume?: number;
  loop?: number;
}

export interface ActionConfig {
  supportsMovieSubtitles: boolean;
  supportsSceneTransitions: boolean;
  supportsCustomScenes: boolean;
  allowedElementTypes: string[];
}
