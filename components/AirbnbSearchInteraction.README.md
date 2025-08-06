# AirbnbSearchInteraction Component

A fully functional React Native component that replicates Airbnb's search bar expansion animation using React Native Reanimated.

## Features

- 🎯 **Smooth Animations**: Uses React Native Reanimated for buttery-smooth animations
- 📱 **Responsive Design**: Works on all screen sizes
- 🎨 **Airbnb-inspired UI**: Matches Airbnb's visual design language
- ⚡ **Touch Feedback**: Interactive press animations and gestures
- 🔄 **Full-screen Modal**: Expands from collapsed state to full-screen search interface
- 📋 **Multiple Search Fields**: Where, When, and Who sections
- 🏷️ **Tab Navigation**: Homes, Experiences, and Services tabs

## States

### Collapsed State
- Compact, pill-shaped search bar
- White background with subtle shadow
- Search icon and "Where to?" placeholder text
- Tap to expand animation

### Expanded State
- Full-screen modal with semi-transparent overlay
- Smooth spring animation from bottom of screen
- Close button (X) in top-left corner
- Three tabs: Homes, Experiences (default), Services
- Search form with three sections divided by lines
- Large search button at bottom

## Usage

### Basic Implementation

```tsx
import { AirbnbSearchInteraction } from '@/components/AirbnbSearchInteraction';

export default function MyScreen() {
  const handleSearch = (searchData) => {
    console.log('Search data:', searchData);
    // Handle search logic here
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <AirbnbSearchInteraction onSearch={handleSearch} />
    </View>
  );
}
```

### Search Data Interface

```tsx
interface SearchData {
  where: string;  // Destination search
  when: string;   // Date selection
  who: string;    // Guest count
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSearch` | `(searchData: SearchData) => void` | No | Callback function called when user taps the search button |

## Demo

To see the component in action:

1. Navigate to `/app/airbnb-demo.tsx` in your Expo app
2. Or import the component into any existing screen
3. Tap the search bar to see the expansion animation
4. Fill in search fields and tap "Search" to see the data

## Animations

The component uses several animation techniques:

- **Spring animations** for natural feel
- **Timing animations** for smooth transitions  
- **Scale transforms** for press feedback
- **Translate transforms** for modal entry/exit
- **Opacity changes** for fade effects

## Dependencies

This component requires:
- `react-native-reanimated` (already installed)
- `lucide-react-native` (already installed)
- `expo` and React Native components

## Customization

You can customize the component by:

1. **Colors**: Modify the `Colors` import or pass theme colors
2. **Animation timing**: Adjust duration and spring config values
3. **Tab names**: Change the `tabs` array
4. **Search fields**: Add/remove sections in the search card
5. **Styling**: Override styles in the StyleSheet

## File Structure

```
components/
├── AirbnbSearchInteraction.tsx     # Main component
├── AirbnbSearchInteraction.README.md # This documentation

examples/
├── AirbnbSearchExample.tsx         # Basic usage example

app/
├── airbnb-demo.tsx                # Full demo screen
```

## Integration Tips

1. **In Tab Navigation**: Add as a new tab in `(tabs)/_layout.tsx`
2. **In Existing Screen**: Import and place in any screen component
3. **Header Integration**: Use in place of existing search functionality
4. **Modal Usage**: Component handles its own modal state internally

## Animation Performance

- Uses native driver animations for 60fps performance
- Optimized for both iOS and Android
- Minimal re-renders with proper animation patterns
- Smooth on lower-end devices

## Troubleshooting

If animations aren't working:
1. Make sure React Native Reanimated is properly installed
2. Check that you have the latest version (3.17.4+)
3. Verify metro bundler is running
4. Try cleaning cache: `expo r -c`