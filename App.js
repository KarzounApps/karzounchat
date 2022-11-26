/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Alert, BackHandler, Platform, StatusBar,Text } from 'react-native';
import BackgroundColor from 'react-native-background-color';
import SplashScreen from 'react-native-splash-screen';
import { PersistGate } from 'redux-persist/integration/react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
// import * as Sentry from '@sentry/react-native';
import NoNetworkBar from './src/components/NoNetworkBar';
import ErrorHelper from './src/helpers/ErrorHelper';
import { theme } from './src/theme';
import Router from './src/Router';
import { store, persistor } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n from './src/i18n';

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */

const App = () => {

  useEffect(() => {
    ErrorHelper.init();
    SplashScreen.hide();
    if (Platform.OS === 'android') {
      BackgroundColor.setColor('#FFFFFF');
    }
  }, []);
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };
  }, []);
  const handleBackButtonClick = () => {
    Alert.alert(
      i18n.t('EXIT.TITLE'),
      i18n.t('EXIT.SUBTITLE'),
      [
        {
          text: i18n.t('EXIT.CANCEL'),
          onPress: () => {},
          style: 'cancel',
        },
        { text: i18n.t('EXIT.OK'), onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false },
    );
    return true;
  };

  return (
    <SafeAreaProvider style={{flex: 1}}>
      <GestureHandlerRootView style={{flex: 1}}>
        <StatusBar barStyle="dark-content" />
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={theme}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <NoNetworkBar />
              <Router />
            </PersistGate>
          </Provider>
        </ApplicationProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
