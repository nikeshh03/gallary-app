import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { AspectRatioPreset } from '../../types/editor';

export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOverlayProps {
  layoutWidth: number;
  layoutHeight: number;
  preset: AspectRatioPreset;
  cropBox: CropBox;
  onCropBoxChange: (box: CropBox) => void;
}

const MIN_SIZE = 50;
const HANDLE_SIZE = 20;

export function CropOverlay({
  layoutWidth,
  layoutHeight,
  preset,
  cropBox,
  onCropBoxChange,
}: CropOverlayProps) {
  const currentBoxRef = useRef<CropBox>(cropBox);
  currentBoxRef.current = cropBox;

  const dragStartBoxRef = useRef<CropBox>(cropBox);

  // Apply preset ratio when preset changes
  useEffect(() => {
    if (layoutWidth <= 0 || layoutHeight <= 0) return;

    let targetRatio: number | null = null;
    if (preset === '1:1') targetRatio = 1;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '16:9') targetRatio = 16 / 9;

    if (targetRatio !== null) {
      let newW = currentBoxRef.current.width;
      let newH = newW / targetRatio;

      if (newH > layoutHeight) {
        newH = layoutHeight * 0.8;
        newW = newH * targetRatio;
      }
      if (newW > layoutWidth) {
        newW = layoutWidth * 0.8;
        newH = newW / targetRatio;
      }

      const newX = Math.max(0, (layoutWidth - newW) / 2);
      const newY = Math.max(0, (layoutHeight - newH) / 2);

      const adjusted: CropBox = {
        x: newX,
        y: newY,
        width: newW,
        height: newH,
      };
      onCropBoxChange(adjusted);
    }
  }, [preset, layoutWidth, layoutHeight]);

  // Center pan responder (move whole crop box)
  const centerPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartBoxRef.current = { ...currentBoxRef.current };
      },
      onPanResponderMove: (_, gestureState) => {
        const start = dragStartBoxRef.current;
        const newX = Math.min(
          Math.max(0, start.x + gestureState.dx),
          layoutWidth - start.width,
        );
        const newY = Math.min(
          Math.max(0, start.y + gestureState.dy),
          layoutHeight - start.height,
        );

        onCropBoxChange({
          x: newX,
          y: newY,
          width: start.width,
          height: start.height,
        });
      },
    }),
  ).current;

  // Corner resize helper
  const createCornerPan = (corner: 'tl' | 'tr' | 'bl' | 'br') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartBoxRef.current = { ...currentBoxRef.current };
      },
      onPanResponderMove: (_, gestureState) => {
        const start = dragStartBoxRef.current;
        let { x, y, width, height } = start;
        const { dx, dy } = gestureState;

        if (corner === 'br') {
          width = Math.max(MIN_SIZE, Math.min(start.width + dx, layoutWidth - start.x));
          height = Math.max(MIN_SIZE, Math.min(start.height + dy, layoutHeight - start.y));
        } else if (corner === 'bl') {
          const maxLeftShift = start.x;
          const shiftX = Math.max(-maxLeftShift, Math.min(dx, start.width - MIN_SIZE));
          x = start.x + shiftX;
          width = start.width - shiftX;
          height = Math.max(MIN_SIZE, Math.min(start.height + dy, layoutHeight - start.y));
        } else if (corner === 'tr') {
          const maxTopShift = start.y;
          const shiftY = Math.max(-maxTopShift, Math.min(dy, start.height - MIN_SIZE));
          y = start.y + shiftY;
          height = start.height - shiftY;
          width = Math.max(MIN_SIZE, Math.min(start.width + dx, layoutWidth - start.x));
        } else if (corner === 'tl') {
          const maxLeftShift = start.x;
          const shiftX = Math.max(-maxLeftShift, Math.min(dx, start.width - MIN_SIZE));
          const maxTopShift = start.y;
          const shiftY = Math.max(-maxTopShift, Math.min(dy, start.height - MIN_SIZE));
          x = start.x + shiftX;
          y = start.y + shiftY;
          width = start.width - shiftX;
          height = start.height - shiftY;
        }

        // Apply aspect ratio constraints if requested
        if (preset === '1:1') {
          const size = Math.min(width, height);
          width = size;
          height = size;
        } else if (preset === '4:3') {
          const ratio = 4 / 3;
          height = width / ratio;
          if (y + height > layoutHeight) {
            height = layoutHeight - y;
            width = height * ratio;
          }
        } else if (preset === '16:9') {
          const ratio = 16 / 9;
          height = width / ratio;
          if (y + height > layoutHeight) {
            height = layoutHeight - y;
            width = height * ratio;
          }
        }

        onCropBoxChange({ x, y, width, height });
      },
    });

  const panTL = useRef(createCornerPan('tl')).current;
  const panTR = useRef(createCornerPan('tr')).current;
  const panBL = useRef(createCornerPan('bl')).current;
  const panBR = useRef(createCornerPan('br')).current;

  if (layoutWidth <= 0 || layoutHeight <= 0) return null;

  return (
    <View style={[styles.container, { width: layoutWidth, height: layoutHeight }]}>
      {/* 4 dark shaded quadrants outside cropBox */}
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          { top: 0, left: 0, width: layoutWidth, height: cropBox.y },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            top: cropBox.y + cropBox.height,
            left: 0,
            width: layoutWidth,
            height: Math.max(0, layoutHeight - (cropBox.y + cropBox.height)),
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            top: cropBox.y,
            left: 0,
            width: cropBox.x,
            height: cropBox.height,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            top: cropBox.y,
            left: cropBox.x + cropBox.width,
            width: Math.max(0, layoutWidth - (cropBox.x + cropBox.width)),
            height: cropBox.height,
          },
        ]}
      />

      {/* Crop Box Window */}
      <View
        style={[
          styles.cropBox,
          {
            left: cropBox.x,
            top: cropBox.y,
            width: cropBox.width,
            height: cropBox.height,
          },
        ]}
        {...centerPan.panHandlers}
      >
        {/* Rule-of-thirds grid */}
        <View pointerEvents="none" style={[styles.gridLineH, { top: '33.33%' }]} />
        <View pointerEvents="none" style={[styles.gridLineH, { top: '66.66%' }]} />
        <View pointerEvents="none" style={[styles.gridLineV, { left: '33.33%' }]} />
        <View pointerEvents="none" style={[styles.gridLineV, { left: '66.66%' }]} />

        {/* Corner Handles */}
        <View
          style={[styles.cornerHitbox, styles.hitboxTL]}
          {...panTL.panHandlers}
        >
          <View style={styles.handleSquare} />
        </View>

        <View
          style={[styles.cornerHitbox, styles.hitboxTR]}
          {...panTR.panHandlers}
        >
          <View style={styles.handleSquare} />
        </View>

        <View
          style={[styles.cornerHitbox, styles.hitboxBL]}
          {...panBL.panHandlers}
        >
          <View style={styles.handleSquare} />
        </View>

        <View
          style={[styles.cornerHitbox, styles.hitboxBR]}
          {...panBR.panHandlers}
        >
          <View style={styles.handleSquare} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cropBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cornerHitbox: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  hitboxTL: {
    top: -20,
    left: -20,
  },
  hitboxTR: {
    top: -20,
    right: -20,
  },
  hitboxBL: {
    bottom: -20,
    left: -20,
  },
  hitboxBR: {
    bottom: -20,
    right: -20,
  },
  handleSquare: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: '#FFFFFF',
  },
});
