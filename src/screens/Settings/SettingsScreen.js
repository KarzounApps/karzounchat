import React, { useEffect, useState } from 'react';
import { withStyles } from '@ui-kitten/components';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { SafeAreaView, Platform, ScrollView } from 'react-native';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import ChatWootWidget from '@chatwoot/react-native-widget';
import { View, Image } from 'react-native';
import UserAvatar from 'components/UserAvatar';
import CustomText from 'components/Text';
import { onLogOut } from 'actions/auth';
import i18n from 'i18n';
import images from 'constants/images';
import styles from './SettingsScreen.style';
import SettingsItem from './components/SettingsItem';
import { HELP_URL } from 'constants/url.js';
import { openURL } from 'helpers/UrlHelper';
import { SETTINGS_ITEMS } from 'constants';
import HeaderBar from 'components/HeaderBar';
import { getNotificationSettings } from 'actions/settings';
import packageFile from '../../../package.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { captureEvent } from 'helpers/Analytics';
import { getCurrentUserAvailabilityStatus } from '../../helpers';
import DeleteApiHelper from '../../helpers/DeleteApiHelper'
import axios from 'axios';
const appName = DeviceInfo.getApplicationName();

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  onLogOut: PropTypes.func,
  getNotificationSettings: PropTypes.func,
};
const defaultProps = {
  onLogOut: () => { },
};

const Settings = ({ eva: { theme, style } }) => {
  const dispatch = useDispatch();
  const [showWidget, toggleWidget] = useState(false);
  const navigation = useNavigation();
  const user = useSelector(store => store.auth.user);
  const email = user ? user.email : '';
  const accounts = user ? user.accounts : [];
  const avatar_url = user ? user.avatar_url : '';
  const name = user ? user.name : '';
  const identifierHash = user ? user.identifier_hash : '';

  const availabilityStatus = getCurrentUserAvailabilityStatus({ user });

  const userDetails = {
    identifier: email,
    name,
    avatar_url,
    email,
    identifier_hash: identifierHash,
  };

  const customAttributes = {
    originatedFrom: 'mobile-app',
    appName,
    appVersion: packageFile.version,
    deviceId: DeviceInfo.getDeviceId(),
    packageName: packageFile.name,
    operatingSystem: Platform.OS, // android/ios
  };

  const [deleteAccount, setDeleteAccount] = React.useState(0)
  useEffect(() => {
    dispatch(getNotificationSettings());

    AsyncStorage.getItem("delete_account_from_server").then(deleteAccount=>{
      setDeleteAccount(deleteAccount)
    }).catch(err=>onslotchange.log('delete_account_from_server error',err))

  }, [dispatch]);


  const doDeleteAccount = async () => {
    await AsyncStorage.setItem("delecte_account", "1")
    await AsyncStorage.removeItem('cwCookie');
    dispatch(onLogOut());
  }
  const onPressItem = async ({ itemName }) => {
    switch (itemName) {
      case 'language':
        navigation.navigate('Language');
        break;

      case 'logout':
        await AsyncStorage.removeItem('cwCookie');
        dispatch(onLogOut());
        break;

      case 'switch-account':
        navigation.navigate('Account', { accounts });
        break;

      case 'availability':
        navigation.navigate('Availability');
        break;

      case 'notification':
        navigation.navigate('NotificationPreference', { accounts });
        break;
      case 'chat_with_us':
        // captureEvent({ eventName: 'Opened help support button' });
        toggleWidget(true);
        break;
      case "remove_account":

        doDeleteAccount()
        break

      case 'help':
        // captureEvent({ eventName: 'Opened help docs' });
        openURL({ URL: HELP_URL });

        break;

      default:
        break;
    }
  };

  let settingsMenu =
    accounts && accounts.length > 1
      ? SETTINGS_ITEMS
      : SETTINGS_ITEMS.filter(e => e.itemName !== 'switch-account');

  settingsMenu = SETTINGS_ITEMS
  // appName === 'Chatwoot' ? SETTINGS_ITEMS : SETTINGS_ITEMS.filter(e => e.itemName !== 'help');

  return (
    <SafeAreaView style={style.container}>
      <HeaderBar title={i18n.t('SETTINGS.HEADER_TITLE')} />
      <ScrollView>
        <View style={style.profileContainer}>
          <UserAvatar
            userName={name}
            thumbnail={avatar_url}
            defaultBGColor={theme['color-primary-default']}
            availabilityStatus={availabilityStatus}
          />
          <View style={style.detailsContainer}>
            <CustomText style={style.nameLabel}>{name}</CustomText>
            <CustomText style={style.emailLabel}>{email}</CustomText>
          </View>
        </View>
        <View style={style.itemListView}>
          {settingsMenu.map((item, index) => (


            index == 6 && deleteAccount == 0 ?

              null
              :
              <SettingsItem
                key={item.text}
                text={i18n.t(`SETTINGS.${item.text}`)}
                checked={item.checked}
                iconSize={item.iconSize}
                itemType={item.itemType}
                iconName={item.iconName}
                itemName={item.itemName}
                onPressItem={onPressItem}
              />
          ))}
        </View>
        <View style={style.aboutView}>
          <Image style={style.aboutImage} source={images.appLogo} />
        </View>

        <View style={style.appDescriptionView}>
          {/*  1.4.6 */}
          <CustomText style={style.appDescriptionText}>{`v${packageFile.version}`}</CustomText>
        </View>
        {!!Config.CHATWOOT_WEBSITE_TOKEN && !!Config.CHATWOOT_BASE_URL && !!showWidget && (
          <ChatWootWidget
            websiteToken={Config.CHATWOOT_WEBSITE_TOKEN}
            locale="en"
            baseUrl={Config.CHATWOOT_BASE_URL}
            closeModal={() => toggleWidget(false)}
            isModalVisible={showWidget}
            user={userDetails}
            customAttributes={customAttributes}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

Settings.propTypes = propTypes;
Settings.defaultProps = defaultProps;

const SettingsScreen = withStyles(Settings, styles);
export default SettingsScreen;
