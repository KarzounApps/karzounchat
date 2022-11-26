import React, { createRef } from 'react';
import { withStyles, Icon } from '@ui-kitten/components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ActionSheet from 'react-native-actions-sheet';
import { Keyboard, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import PropTypes from 'prop-types';

import AttachmentActionItem from './AttachmentActionItem';

const styles = theme => ({
  button: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    flex: 1,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
});
const propTypes = {
  eva: PropTypes.shape({
    style: PropTypes.object,
    theme: PropTypes.object,
  }).isRequired,
  conversationId: PropTypes.number,
  onSelectAttachment: PropTypes.func,
};

const imagePickerOptions = {
  noData: true,
};
const Attachment = ({ conversationId, eva: { style, theme }, onSelectAttachment }) => {
  const actionSheetRef = createRef();
  const handleChoosePhoto = () => {
    Keyboard.dismiss();
    timeOut && clearTimeout(timeOut)
    const timeOut = setTimeout(() => {
      actionSheetRef.current?.show();
    }, 10);
  };
  const openCamera = () => {
    launchCamera(imagePickerOptions, response => {
      if (response?.assets[0].uri) {
        onSelectAttachment({ attachment: response?.assets[0] });
      }
    });
  };
  const openGallery = () => {
    launchImageLibrary(imagePickerOptions, response => {
      if (response?.assets[0].uri) {
        onSelectAttachment({ attachment: response?.assets[0] });
      }
    });
  };
  const openDocumentOrVideo = async (isVideo=false) => {
    try {
      const res = await DocumentPicker.pickSingle(isVideo ? {type:[DocumentPicker.types.video]} : {
        type: [
          DocumentPicker.types.allFiles,
          DocumentPicker.types.images,
          DocumentPicker.types.plainText,
          DocumentPicker.types.audio,
          DocumentPicker.types.pdf,
          DocumentPicker.types.zip,
          DocumentPicker.types.csv,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
        ],
      });
      const attachment = { uri: res.uri, type: res.type, fileSize: res.size, fileName: res.name };
      onSelectAttachment({ attachment });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };
  const onPressItem = ({ itemType }) => {
    actionSheetRef.current?.hide();
    setTimeout(() => {
      if (itemType === 'upload_camera') {
        openCamera();
      }
      if (itemType === 'upload_gallery') { 
        openGallery();
      }
      if (itemType === 'upload_file') {
        openDocumentOrVideo();
      }
      if(itemType === 'upload_video'){
        openDocumentOrVideo(true);
      }
    }, 500);
  };

  return (
    <React.Fragment>
      <TouchableOpacity onPress={handleChoosePhoto}>
        <Icon
          name="attach-outline"
          width={24}
          height={24}
          isAttachmentMode
          fill={theme['text-hint-color']}
        />
      </TouchableOpacity>
      <ActionSheet
        openAnimationSpeed={40}
        ref={actionSheetRef}
        gestureEnabled
        defaultOverlayOpacity={0.6}>
        <AttachmentActionItem
          text="Camera"
          iconName="camera-outline"
          itemType="upload_camera"
          onPressItem={onPressItem}
        />
        <AttachmentActionItem
          text="Photo Library"
          iconName="image-outline"
          itemType="upload_gallery"
          onPressItem={onPressItem}
        />
        <AttachmentActionItem
          text="Video Library"
          iconName="video-outline"
          itemType="upload_video"
          onPressItem={onPressItem}
        />
        <AttachmentActionItem
          text="Document"
          iconName="file-outline"
          itemType="upload_file"
          onPressItem={onPressItem}
        />
      </ActionSheet>
    </React.Fragment>
  );
};

Attachment.propTypes = propTypes;

const AttachmentItem = withStyles(Attachment, styles);
export default AttachmentItem;
