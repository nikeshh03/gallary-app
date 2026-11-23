import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GalleryStackParamList } from './types';
import { GalleryScreen } from '../screens/gallery/GalleryScreen';
import { PhotoViewerScreen } from '../screens/gallery/PhotoViewerScreen';
import { PhotoEditorScreen } from '../screens/gallery/PhotoEditorScreen';

const Stack = createNativeStackNavigator<GalleryStackParamList>();

export function GalleryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen
        name="PhotoViewer"
        component={PhotoViewerScreen}
        options={{
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="PhotoEditor"
        component={PhotoEditorScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
}
