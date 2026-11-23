import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlbumStackParamList } from './types';
import { AlbumsScreen } from '../screens/albums/AlbumsScreen';
import { AlbumDetailScreen } from '../screens/albums/AlbumDetailScreen';
import { PhotoViewerScreen } from '../screens/gallery/PhotoViewerScreen';
import { PhotoEditorScreen } from '../screens/gallery/PhotoEditorScreen';

const Stack = createNativeStackNavigator<AlbumStackParamList>();

export function AlbumStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Albums" component={AlbumsScreen} />
      <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
      <Stack.Screen
        name="PhotoViewer"
        component={PhotoViewerScreen as any}
        options={{
          animation: 'fade',
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="PhotoEditor"
        component={PhotoEditorScreen as any}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
}
