export type EditorTool = 'crop' | 'rotate' | 'flip';

export interface CropState {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export type AspectRatioPreset = 'Free' | '1:1' | '4:3' | '16:9';

export interface EditorState {
  sourceUri: string;
  currentUri: string;
  activeTool: EditorTool | null;
  crop: CropState | null;
  rotation: 0 | 90 | 180 | 270;
  isProcessing: boolean;
}
