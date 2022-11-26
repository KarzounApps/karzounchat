import React, { useCallback, useRef, useState } from 'react';
import { View, Dimensions, TextInput, Text, TouchableOpacity, Platform, PermissionsAndroid, Animated, I18nManager } from 'react-native';
import { MentionInput } from 'react-native-controlled-mentions';
import { withStyles, Icon } from '@ui-kitten/components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AttachmentPreview from './AttachmentPreview';
import Attachment from './Attachment';
import i18n from 'i18n';
import { sendMessage, toggleTypingStatus } from 'actions/conversation';
import { findFileSize } from 'helpers/FileHelper';
import { MAXIMUM_FILE_UPLOAD_SIZE } from 'constants';
import { showToast } from 'helpers/ToastHelper';
import CannedResponses from './CannedResponses';
import MentionUser from './MentionUser.js';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs'   
// import { captureEvent } from 'helpers/Analytics';
const propTypes = {
  conversationId: PropTypes.number,
  conversationDetails: PropTypes.object,
  eva: PropTypes.shape({
    theme: PropTypes.object,
    style: PropTypes.object,
  }).isRequired,
  cannedResponses: PropTypes.array.isRequired,
};
const audioRecorderPlayer = new AudioRecorderPlayer()
const ReplyBox = ({
  eva: { theme, style },
  conversationId,
  conversationDetails,
  cannedResponses,
}) => {
  const [isPrivate, setPrivateMode] = useState(false);
  const [ccEmails, setCCEmails] = useState([]);
  const [bccEmails, setBCCEmails] = useState([]);
  const [emailFields, toggleEmailFields] = useState(false);
  const [message, setMessage] = useState('');
  const agents = useSelector(state => state.agent.data);
  const verifiedAgents = agents.filter(agent => agent.confirmed);
  const [filteredCannedResponses, setFilteredCannedResponses] = useState([]);
  const [attachmentDetails, setAttachmentDetails] = useState(null);
  const dispatch = useDispatch();
  const [recordSecs, setRecordSecs] = useState(0)
  const recordedFileName = useRef()
  const scale=useRef(new Animated.Value(1)).current
  const {account_id} = useSelector(state=>state.auth.user)
  // console.log('accoundId',account_id);
  const onNewMessageChange = text => {
    setMessage(text);
    if (text.charAt(0) === '/') {
      const query = text.substring(1).toLowerCase();
      const responses = cannedResponses.filter(item => item.title.toLowerCase().includes(query));
      if (responses.length) {
        showCannedResponses({ responses });
      } else {
        hideCannedResponses();
      }
    } else {
      hideCannedResponses();
    }
  };
  async function startRecorderingHandler() {
    try {
      recordedFileName.current=`${Date.now()}.ogg`
      Animated.spring(scale,{toValue:1.5,useNativeDriver:true}).start()
      const path = Platform.select({
          android:`${RNFS.CachesDirectoryPath}/${recordedFileName.current}`,
          ios:`${recordedFileName.current}`
      })
      if (Platform.OS === 'android') {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        // console.log('write external stroage', grants);
        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          const result = await audioRecorderPlayer.startRecorder(path);
          audioRecorderPlayer.addRecordBackListener((e) => {
            setRecordSecs(e.currentPosition)
          });
          // console.log(result);
        } else {
          console.log('All required permissions not granted');
          showToast({message:'permissions required to enable audio recording'})
        }
      }else{
        const result = await audioRecorderPlayer.startRecorder(path);
        audioRecorderPlayer.addRecordBackListener((e) => {
          setRecordSecs(e.currentPosition)
        });
        // console.log(result);
      }
    } catch (error) {
      console.log('start recording error', error);
    }
  }
  async function stopRecordingHandler() {
    try {
      if(recordSecs > 0){
        Animated.spring(scale,{toValue:1,useNativeDriver:true}).start()
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setRecordSecs(0)
        onSelectAttachment({attachment:{fileName:recordedFileName.current, type:account_id == 1 ? "video/mp4" : "audio/mp4", uri:result}})
      }
      // await audioRecorderPlayer.stopPlayer()
      // await audioRecorderPlayer.startPlayer(result)
      // console.log(result);
      // onNewMessageAdd({fileName:recordedFileName.current, type: "audio/wav", uri:result})
      // onNewMessageAdd({fileName:recordedFileName.current, type: "audio/mp4", uri:result})
    } catch (error) {
      console.log('stop recording error', error);
    }
  }
  async function requestPermissions() {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  }
  const onCCMailChange = mail => {
    setCCEmails(mail);
  };
  const onBCCMailChange = mail => {
    setBCCEmails(mail);
  };
  const showCannedResponses = ({ responses }) => {
    setFilteredCannedResponses(responses);
  };

  const hideCannedResponses = () => {
    setFilteredCannedResponses([]);
  };

  const isAnEmailChannelAndNotInPivateNote = () => {
    if (conversationDetails && conversationDetails.meta) {
      const channel = conversationDetails.meta.channel;
      return channel === 'Channel::Email' && !isPrivate;
    }
    return false;
  };

  const toggleCcBccInputs = () => {
    toggleEmailFields(true);
  };

  const inputBorderColor = () => {
    isAnEmailChannelAndNotInPivateNote() ? { borderTopWidth: 0 } : { borderTopWidth: 1 };
  };

  const onBlur = () => {
    dispatch(toggleTypingStatus({ conversationId, typingStatus: 'off' }));
  };
  const onFocus = () => {
    dispatch(toggleTypingStatus({ conversationId, typingStatus: 'on' }));
  };

  const onCannedReponseSelect = content => {
    // captureEvent({ eventName: 'Canned response selected' });
    setFilteredCannedResponses([]);
    setMessage(content);
  };

  const onSelectAttachment = useCallback(({ attachment }) => {
    // captureEvent({ eventName: 'Attachment selected' });
    // console.log('attachment',attachment);
    const { fileSize } = attachment;
    if(fileSize){
      if (parseFloat(findFileSize(fileSize)) <= MAXIMUM_FILE_UPLOAD_SIZE) {
        setAttachmentDetails(attachment);
      } else {
        showToast({ message: i18n.t('CONVERSATION.FILE_SIZE_LIMIT') });
      }
    }else{
      setAttachmentDetails(attachment);
    }
  }, []);

  const onRemoveAttachment = () => {
    setAttachmentDetails(null);
  };

  const togglePrivateMode = () => {
    // captureEvent({ eventName: 'Toggle private mode' });
    setPrivateMode(!isPrivate);
  };

  const onNewMessageAdd = (audioFile=undefined) => {
    const updatedMessage = message.replace(
      /@\[([\w\d.-]+)\]\((\d+)\)/g,
      '[@$1](mention://user/$2/$1)',
    );
    if (message || attachmentDetails || audioFile) {
      // console.log('audioFile',audioFile);
      const payload = {
        conversationId,
        message: { content: updatedMessage },
        isPrivate,
        file: attachmentDetails || audioFile,
      };
      if (ccEmails) {
        payload.message.cc_emails = ccEmails;
      }
      if (bccEmails) {
        payload.message.bcc_emails = bccEmails;
      }
      // captureEvent({ eventName: 'Messaged sent' });
      dispatch(sendMessage(payload));

      setMessage('');
      setCCEmails('');
      setBCCEmails('');
      setAttachmentDetails(null);
      setPrivateMode(false);
    }
  };

  const inputFieldColor = () =>
    !isPrivate
      ? { backgroundColor: theme['color-background'] }
      : { backgroundColor: theme['color-background-private'] };

  const sendMessageButtonWrapStyles = () => {
    return !(!message && !attachmentDetails)
      ? { backgroundColor: theme['color-info-75'] }
      : { backgroundColor: theme['color-info-200'] };
  };

  // eslint-disable-next-line react/prop-types
  const renderSuggestions = ({ keyword, onSuggestionPress }) => {
    if (keyword == null || !isPrivate) {
      return null;
    }
    return (
      <View>
        {verifiedAgents
          // eslint-disable-next-line react/prop-types
          .filter(one => one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
          .map((item, index) => (
            <MentionUser
              name={item.name}
              thumbnail={item.thumbnail}
              availabilityStatus={item.availability_status}
              email={item.email}
              key={item.id}
              lastItem={agents.length - 1 === index}
              onUserSelect={() => onSuggestionPress(item)}
            />
          ))}
      </View>
    );
  };

  return (
    <React.Fragment>
      {attachmentDetails && (
        <AttachmentPreview
          attachmentDetails={attachmentDetails}
          onRemoveAttachment={onRemoveAttachment}
        />
      )}

      {filteredCannedResponses && (
        <CannedResponses
          cannedResponses={filteredCannedResponses}
          onCannedReponseSelect={onCannedReponseSelect}
        />
      )}
      {isAnEmailChannelAndNotInPivateNote() && emailFields && (
        <View style={style.emailFields}>
          <View style={style.emailFieldsTextWrap}>
            <Text style={style.emailFieldLabel}>{'Cc'}</Text>
            <TextInput
              style={style.ccInputView}
              value={ccEmails}
              onChangeText={onCCMailChange}
              placeholder="Emails separeted by commas"
            />
          </View>
          <View style={style.emailFieldsTextWrap}>
            <Text style={style.emailFieldLabel}>{'Bcc'}</Text>
            <TextInput
              style={style.bccInputView}
              value={bccEmails}
              onChangeText={onBCCMailChange}
              placeholder="Emails separeted by commas"
            />
          </View>
        </View>
      )}

      <View style={[isPrivate ? style.privateView : style.replyView, inputBorderColor()]}>
        {isAnEmailChannelAndNotInPivateNote() && !emailFields && (
          <Text style={style.emailFieldToggleButton} onPress={toggleCcBccInputs}>
            {'Cc/Bcc'}
          </Text>
        )}
        <MentionInput
          style={[style.inputView, inputFieldColor()]}
          value={message}
          onChange={onNewMessageChange}
          partTypes={[
            {
              allowedSpacesCount: 0,
              isInsertSpaceAfterMention: true,
              trigger: '@',
              renderSuggestions,
              textStyle: { fontWeight: 'bold', color: 'white', backgroundColor: '#8c9eb6' },
            },
          ]}
          multiline={true}
          placeholderTextColor={theme['text-basic-color']}
          placeholder={
            recordSecs > 0 ? audioRecorderPlayer.mmss(Math.floor(recordSecs / 1000)) :
              isPrivate
                ? `${i18n.t('CONVERSATION.PRIVATE_MSG_INPUT')}`
                : `${i18n.t('CONVERSATION.TYPE_MESSAGE')}`
          }
          onBlur={onBlur}
          onFocus={onFocus}
          editable={recordSecs == 0}
        />

        <View style={style.buttonViews}>
          <View style={style.attachIconView}>
            <Attachment conversationId={conversationId} onSelectAttachment={onSelectAttachment} />
            <Animated.View style={{transform:[{scale}]}}>
              <TouchableOpacity style={{ marginHorizontal: 12 }} onLongPress={startRecorderingHandler} onPressOut={stopRecordingHandler}>
                <Icon name='mic-outline' fill={theme['text-hint-color']} width={24} height={24} />
              </TouchableOpacity>
            </Animated.View>
            <View style={style.privateNoteView}>
              <Icon
                name="lock-outline"
                width={24}
                height={24}
                fill={isPrivate ? theme['color-primary-default'] : theme['text-hint-color']}
                onPress={togglePrivateMode}
              />
            </View>
          </View>
          <View style={[style.sendButtonView, sendMessageButtonWrapStyles()]}>
            <Icon
              name="paper-plane"
              style={style.sendButton}
              width={24}
              height={24}
              fill={
                !(!message && !attachmentDetails)
                  ? theme['color-primary-default']
                  : theme['color-background']
              }
              onPress={()=>recordSecs == 0 && onNewMessageAdd()}
            />
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

const styles = theme => ({
  replyView: {
    padding: 6,
    paddingHorizontal: 14,
    backgroundColor: theme['background-basic-color-1'],
    borderTopColor: theme['color-border'],
  },
  privateView: {
    padding: 6,
    paddingHorizontal: 14,
    backgroundColor: theme['color-background-private-light'],
    borderTopColor: theme['color-border'],
    borderTopWidth: 1,
  },
  inputView: {
    fontSize: theme['font-size-medium'],
    color: theme['text-basic-color'],
    borderRadius: 8,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    textAlignVertical: 'top',
    textAlign:I18nManager.isRTL ? 'right' : 'left',
    maxHeight: 160,
  },
  emailFields: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: theme['background-basic-color-1'],
  },
  emailFieldsTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
  },
  emailFieldLabel: {
    fontSize: theme['font-size-extra-small'],
    width: '8%',
  },
  emailFieldToggleButton: {
    position: 'absolute',
    backgroundColor: theme['color-background'],
    color: theme['color-primary-500'],
    fontWeight: theme['font-semi-bold'],
    padding: 4,
    right: 24,
    top: 14,
    zIndex: 1,
  },
  ccInputView: {
    fontSize: theme['font-size-small'],
    color: theme['text-basic-color'],
    backgroundColor: theme['color-background-light'],
    width: '92%',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  bccInputView: {
    backgroundColor: theme['color-background-light'],
    width: '92%',
    borderRadius: 8,
    fontSize: theme['font-size-small'],
    color: theme['text-basic-color'],
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  buttonViews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  attachIconView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  privateNoteView: {
    // paddingLeft: 12,
  },
  sendButtonView: {
    padding: 8,
    borderRadius: 30,
    transform:[{scale:I18nManager.isRTL ? -1 : 1 }]
  },
  lockButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'flex-start',
  },
  sendButton: {
    padding: 12,
    transform: [{ rotate: '45deg'}],
    backgroundColor: 'transparent'
  },
  overflowMenu: {
    padding: 8,
    borderRadius: 8,
    width: Dimensions.get('window').width / 1.5,
  },
});

ReplyBox.propTypes = propTypes;

const ReplyBoxItem = withStyles(ReplyBox, styles);
export default ReplyBoxItem;
