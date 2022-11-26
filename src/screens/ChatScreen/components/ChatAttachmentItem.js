import React, { useState } from 'react';
import { TouchableOpacity, View, Dimensions, Image,Text, Linking } from 'react-native';
import PropTypes from 'prop-types';
import { withStyles, Icon } from '@ui-kitten/components';
// import { AudioPlayer } from 'react-native-simple-audio-player';
import RecordSlider from "./RecordSlider"
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

import ImageLoader from 'components/ImageLoader';
import { messageStamp } from 'helpers/TimeHelper';
import CustomText from 'components/Text';
import i18n from 'i18n';
import PlayVideo from "./PlayVideo"

const LockIcon = style => {
  return <Icon {...style} name="lock" />;
};

const styles = theme => ({
  fileView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    maxWidth: Dimensions.get('window').width - 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fileViewRight: {
    backgroundColor: theme['color-primary-default'],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 4,
  },
  fileViewLeft: {
    backgroundColor: theme['background-basic-color-1'],
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 8,
    borderColor: theme['color-border'],
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8,
    borderWidth: 1,
  },
  imageViewLeft: {
    backgroundColor: theme['background-basic-color-1'],
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 8,
    borderColor: theme['color-border'],
    borderTopLeftRadius: 4,
    borderTopRightRadius: 8,
    borderWidth: 1,
    padding: 4,
  },
  imageViewRight: {
    backgroundColor: theme['color-primary-default'],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 4,
    padding: 4,
  },
  privateMessageContainer: {
    backgroundColor: theme['color-background-private-light'],
    borderColor: theme['color-border-activity'],
    borderWidth: 1,
    color: theme['text-basic-color'],
    paddingTop: 8,
  },
  imageLoader: {
    alignItems: 'center',
    borderRadius: 8,
    borderTopLeftRadius: 8,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    opacity: 0.7,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  image: {
    height: deviceHeight / 5,
    width: deviceWidth / 2,
    alignSelf: 'center',
  },
  fileAttachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentIconView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
  },
  fileAttachmentView: {
    flexDirection: 'row',
  },
  attachmentTextView: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  filenameRightText: {
    color: theme['color-basic-100'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
  },

  filenameLeftText: {
    color: theme['color-message-left'],
    fontSize: theme['font-size-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
  },

  downloadRightText: {
    color: theme['color-background-message'],
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  downloadLeftText: {
    color: '#005fb8',
    fontSize: theme['font-size-extra-small'],
    fontWeight: theme['font-medium'],
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  attachmentText: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    color: 'white',
    paddingBottom: 4,
    paddingLeft: 8,
  },
  attachmentPrivateText: {
    fontSize: theme['text-primary-size'],
    fontWeight: theme['font-medium'],
    color: theme['text-basic-color'],
    paddingBottom: 4,
    paddingLeft: 8,
  },
  dateView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  dateRight: {
    color: theme['color-background-message'],
    fontSize: theme['font-size-extra-extra-small'],
    paddingTop: 4,
  },
  dateLeft: {
    color: theme['color-gray'],
    fontSize: theme['font-size-extra-extra-small'],
    paddingTop: 4,
  },
  iconView: {
    paddingLeft: 8,
  },
  icon: {
    width: 16,
    height: 16,
  },
});

const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  type: PropTypes.string,
  showAttachment: PropTypes.func,
  message: PropTypes.shape({
    content: PropTypes.string,
    private: PropTypes.bool,
    attachments: PropTypes.arrayOf(
      PropTypes.shape({
        file_type: PropTypes.string,
        data_url: PropTypes.string,
      }),
    ),
  }),
  created_at: PropTypes.number,
};

export const FileIcon = style => {
  return <Icon {...style} name="play-circle-outline" width={24} height={24} />

};

const ChatAttachmentItemComponent = ({
  type,
  showAttachment,
  created_at,
  message,
  eva: { style, theme },
}) => {
  const { attachments, content  } = message;

  const [imageLoading, onLoadImage] = useState(false);
  
  const dateStyle = type === 'outgoing' ? style.dateRight : style.dateLeft;
  if (attachments[0]) {
    const { file_type: fileType, data_url: dataUrl } = attachments[0];
    const fileExt = dataUrl?.split('.').reverse()[0]
    // const fileName = dataUrl ? dataUrl.split('/').reverse()[0] : '';

  //  console.log('fileType',attachments[0]);
    return (
      <React.Fragment>
        {fileType === 'image' ? (
          <TouchableOpacity
            onPress={() => showAttachment({ type: 'image', dataUrl })}
            style={[
              type === 'outgoing' ? style.imageViewRight : style.imageViewLeft,
              message.private && style.privateMessageContainer,
            ]}>
            {content !== '' && (
              <CustomText
                style={message.private ? style.attachmentPrivateText : style.attachmentText}>
                {content}
              </CustomText>
            )}
            <Image
              style={style.image}
              source={{
                uri: dataUrl,
              }}
              onLoadStart={() => onLoadImage(true)}
              onLoadEnd={() => {
                onLoadImage(false);
              }}
            />

            {imageLoading && <ImageLoader style={style.imageLoader} />}
            <View style={style.dateView}>
              <CustomText
                style={[
                  dateStyle,
                  message.private && {
                    color: theme['color-gray'],
                  },
                ]}>
                {messageStamp({ time: created_at })} 
              </CustomText>
              {message.private && (
                <View style={style.iconView}>
                  <LockIcon style={style.icon} fill={theme['text-basic-color']} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              type === 'outgoing' ? style.fileViewRight : style.fileViewLeft,
              style.fileView,
            ]}>
            <View style={style.fileAttachmentContainer}>
              <View style={style.fileAttachmentView}> 
                {

                  (fileType == "audio" || fileExt === 'mp3' || fileExt === 'ogg')
                    ?
                    <RecordSlider
                      url={dataUrl}
                      message={attachments[0]}
                      theme={theme}
                      type={type}
                      created_at={created_at}
                    />
                    :
                    (fileExt === 'mp4' || fileExt === 'mkv' || fileExt === 'flv') ? <PlayVideo
                    message={attachments[0]}
                      theme={theme}
                      type={type}
                      created_at={created_at}
                    /> : <View style={{flexDirection:'row',alignItems:'center'}}>
                          <Text style={{marginEnd:10,color: theme['text-light-color'],fontWeight:theme['font-regular']}}>invalid file type</Text>
                          <TouchableOpacity onPress={()=>Linking.openURL(dataUrl).catch(err=>console.log(err))}>
                            <Icon fill={theme['color-primary-default']} name={"download-outline"} width={36} height={36} />
                          </TouchableOpacity>
                    </View>  
                }
              </View>
            </View>
          </View>
        )}
      </React.Fragment>
    );
  }
  return null;
};

ChatAttachmentItemComponent.propTypes = propTypes;

const ChatAttachmentItem = React.memo(withStyles(ChatAttachmentItemComponent, styles));
export default ChatAttachmentItem;
