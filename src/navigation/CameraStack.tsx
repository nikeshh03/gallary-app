import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CameraStackParamList } from './types';
import { CameraScreen } from '../screens/camera/CameraScreen';
import { PreviewScreen } from '../screens/camera/PreviewScreen';

const Stack = createNativeStackNavigator<CameraStackParamList>();

export function CameraStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
    </Stack.Navigator>
  );
}
