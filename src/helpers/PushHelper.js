// import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { store } from '../store';
import { navigate } from './NavigationHelper';
import { Linking, Platform } from 'react-native';

export const handlePush = async ({ remoteMessage, type }) => {
  try {
    const { notification } = remoteMessage.data;
    const pushData = JSON.parse(notification);
    const state = store.getState();
    const { isLoggedIn } = state.auth;
    const { notification_type } = pushData;
    console.log('pushData',typeof remoteMessage.data);
    // Check user is logged or not
    if (
      type !== 'foreground' &&
      isLoggedIn &&
      (notification_type === 'conversation_creation' ||
        notification_type === 'conversation_assignment' ||
        notification_type === 'assigned_conversation_new_message' ||
        notification_type === 'conversation_mention')
    ) {
      const { primary_actor, primary_actor_id, primary_actor_type } = pushData;
      let conversationId = null;
      if (primary_actor_type === 'Conversation') {
        conversationId = primary_actor.id;
      } else if (primary_actor_type === 'Message') {
        conversationId = primary_actor.conversation_id; 
      }
      if (conversationId) {
        Linking.openURL(`karzounchat://chat/${conversationId}/"{'primary_actor_id':${primary_actor_id}, 'primary_actor_type':'${primary_actor_type}'}"`).catch(err=>{
          console.log('linking error',err);
        })
        // navigate(
        //   'ChatScreen',
        //   {
        //     conversationId,
        //     primaryActorDetails: { primary_actor_id, primary_actor_type },
        //   },

        //   `ChatScreen+${conversationId}`,
        // );
      }
    }
    return isLoggedIn;
  } catch(error) {
    console.log('error',error)
  }
};

export const clearAllDeliveredNotifications = () => {
  if (Platform.OS === 'android') {
  } else {
    PushNotificationIOS.removeAllDeliveredNotifications();
  }
};

export const updateBadgeCount = ({ count = 0 }) => {
  if (Platform.OS === 'ios') {
    PushNotificationIOS.setApplicationIconBadgeNumber(count);
  }
};
