/**
 * @format
 */
 import 'react-native-gesture-handler';
 import { AppRegistry } from 'react-native';
//  import * as Sentry from '@sentry/react-native';
//  import Config from 'react-native-config';
 import { name as appName } from './app.json';
//  import { initAnalytics } from './src/helpers/Analytics';
 
 import App from './App';
 
 AppRegistry.registerComponent(appName, () => App);
 
//  if (!__DEV__) {
//    Sentry.init({
//      dsn: Config.SENTRY_DSN,
//      tracesSampleRate: 1.0,
//    });
//  }
//  initAnalytics();
