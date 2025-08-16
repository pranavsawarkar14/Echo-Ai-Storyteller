import { useEffect } from 'react';
import { AppRegistry } from 'react-native';
import { createRoot } from 'react-dom/client';
import { name as appName } from '../app.json';
import App from '../App';

// Register the app
AppRegistry.registerComponent(appName, () => App);

export default function Index() {
  useEffect(() => {
    // Start the app
    const rootTag = document.getElementById('root') || document.getElementById('__next');
    if (rootTag) {
      const root = createRoot(rootTag);
      root.render(<App />);
    }
  }, []);

  return null;
}