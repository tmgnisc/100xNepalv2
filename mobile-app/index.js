import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {ErrorBoundary} from './src/components/ErrorBoundary';

// Wrap App with ErrorBoundary to prevent crashes
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

AppRegistry.registerComponent(appName, () => AppWithErrorBoundary);

