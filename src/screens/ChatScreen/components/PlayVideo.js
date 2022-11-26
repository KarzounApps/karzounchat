import React from "react"
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import Video from 'react-native-video';
// import Video from 'react-native-af-video-player'

import { withStyles, Icon } from '@ui-kitten/components';
import { messageStamp } from "../../../helpers/TimeHelper";

const PlayVideo = (props) => { 
    const { message, theme, type } = props
    const [loading, setLoading] = React.useState(false)
    const [showVideo, setshowVideo] = React.useState(false)
    const [showControls, setShowControls] = React.useState(true)
    const url = 'https://your-url.com/video.mp4' 
    // console.log('message',message);
    return (

        <View style={styles.container}>
            {

                showVideo
                    ?

                    null
                    :
                    <TouchableOpacity
                        onPress={() => setshowVideo(true)}
                    >
                        <Icon width={60} height={60}
                            fill={props.type==="outgoing"?"white":theme['color-primary-default']}
                            name="video-outline"
                        />
                        <Text style={{fontSize:10,color:props.type==="outgoing"?"white":theme['color-primary-default']}}>{messageStamp({ time: props.created_at })}</Text>
                    </TouchableOpacity>

            }

            {showVideo ?

                <TouchableOpacity
                    disabled
                    // onPress={() => setShowControls(!showControls)}
                >
                    <Video source={{ uri: message.data_url }}
                        style={styles.backgroundVideo}
                        controls={true}
                        poster='https://app.karzoun.chat/brand-assets/logo.png'
                        resizeMode="cover"
                        // posterResizeMode="cover"
                    />
                </TouchableOpacity>
                :

                null
            }








        </View>



    )
}



export default PlayVideo

const styles = StyleSheet.create(
    {
        container: {


        },
        backgroundVideo: {
            width: 300,
            height: 200
        },
        header: {
            width: "100%",
            height: 50,
        }
    }
)