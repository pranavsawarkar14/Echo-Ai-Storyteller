import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="collections" />
      <Stack.Screen name="downloads" />
      <Stack.Screen name="finished" />
    </Stack>
  );
}