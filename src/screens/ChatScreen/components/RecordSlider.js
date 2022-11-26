import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native"
import AntDesign from 'react-native-vector-icons/AntDesign';
import Slider from '@react-native-community/slider';
import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSet,
    AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import { withStyles, Icon } from '@ui-kitten/components';
import { useSelector, useDispatch } from "react-redux"
import { IS_RECORD_PLAYING, CHANGE_RECORD_PLAYING_ID } from "../../../constants/actions"
import { messageStamp } from "../../../helpers/TimeHelper";

const audioRecorderPlayer =new AudioRecorderPlayer()
const RecordSlider = (props) => {
    const [currentPositionSec, setCurrentPositionSec] = React.useState(0)
    const [currentDurationSec, setCurrentDurationSec] = React.useState('00:00')
    // const [recordPlaying, setRecordPlaying] = React.useState(false)
    const playerState = React.useRef('stopped')
    const recordPlayingId = useSelector(state => state.conversation.recordPlayingId)
    const dispatch = useDispatch()
    // console.log('rendered',props.message);
    useEffect(()=>{
        if(playerState.current !== 'stopped' && recordPlayingId !== props.message.message_id){
            playerState.current = 'stopped'
            setCurrentPositionSec(0)
        }
        return ()=>{
            audioRecorderPlayer.stopPlayer()
            audioRecorderPlayer.removePlayBackListener() 
        }
    },[recordPlayingId])
    const onStartPlay = async (recordPath) => {
        // dispatch({ type: IS_RECORD_PLAYING, payload: true })
        // await audioRecorderPlayer.stopPlayer()

        // await audioRecorderPlayer.startPlayer(recordPath);
        // currentPositionSec !== 0 && await audioRecorderPlayer.seekToPlayer(currentPositionSec)
        // audioRecorderPlayer.addPlayBackListener(e => {
        //     setCurrentPositionSec(e.duration == e.currentPosition ? 0 : e.currentPosition)
        //     if(e.duration == e.currentPosition){
        //         onStopPlay()
        //         setRecordPlaying(false)
        //     }
        //     currentDurationSec === '00:00' && setCurrentDurationSec(e.duration)
        // });

        if(playerState.current === 'played'){
            dispatch({type:CHANGE_RECORD_PLAYING_ID,payload:props.message.message_id})
            await audioRecorderPlayer.stopPlayer()
            await audioRecorderPlayer.startPlayer(recordPath);
            audioRecorderPlayer.addPlayBackListener(e => {
                if(e.duration == e.currentPosition){
                    playerState.current = 'stopped'
                    onStopPlay()
                }
                setCurrentPositionSec(e.duration == e.currentPosition ? 0 : e.currentPosition)
                currentDurationSec === '00:00' && setCurrentDurationSec(e.duration)
            });
        }else if(playerState.current === 'paused'){
            await audioRecorderPlayer.pausePlayer()
        }else if(playerState.current === 'resumed'){
            await audioRecorderPlayer.resumePlayer()
        }
    }
    async function onStopPlay(){
       await audioRecorderPlayer.stopPlayer()
       audioRecorderPlayer.removePlayBackListener() 
    }
    return (
        <View
            style={styles.container}>
                <TouchableOpacity
                    onPress={() => {
                        switch(playerState.current){
                            case 'stopped' :  
                                playerState.current='played'
                                break;
                            case 'played' :  
                                playerState.current='paused'
                                break;
                            case 'paused' :  
                                playerState.current='resumed'
                                break;
                            default:
                                playerState.current='paused'
                        }
                        onStartPlay(props.message.data_url)
                        // !recordPlaying ? onStartPlay(props.message.data_url) : onStopPlay()
                        // setRecordPlaying(!recordPlaying)
                    }}
                    style={styles.recordButton}>
                    <Icon fill={props.type==="outgoing"? '#fff' : props.theme['color-primary-default']} name={(playerState.current == 'played' || playerState.current == 'resumed') ? "pause-circle-outline" : "play-circle-outline"} width={36} height={36} />
                    {/* <Icon fill={props.theme['color-primary-default']} name={recordPlaying ? "pause-circle-outline" : "play-circle-outline"} width={36} height={36} /> */}
                </TouchableOpacity>
                <View>
                <Slider
                    style={{
                        width: 200,
                        height: 25,
                        // transform: [{ rotate:  I18nManager.isRTL ?'180deg':"0deg" }]
                        //I18nManager.isRTL ?  : '0deg',
                    }}
                    value={currentPositionSec}
                    minimumValue={0}
                    thumbTintColor={props.type==="outgoing"?"white":props.theme['color-primary-default']}
                    maximumValue={currentDurationSec === '00:00' ? 0 : currentDurationSec}
                    minimumTrackTintColor={props.type==="outgoing"?"white":"red"}
                    maximumTrackTintColor={props.type==="outgoing"?"white":props.theme['color-primary-default']}
                    // onValueChange={value => {
                    //     console.log('on change value',value)
                    // }}
                    onSlidingComplete={ v=> audioRecorderPlayer.seekToPlayer(v)}
                />
                <View style={{flexDirection:'row',justifyContent:'space-between',marginHorizontal:11}}>
                    <Text style={{fontSize:10,color:props.type==="outgoing"? '#fff' : '#666'}}>{messageStamp({ time: props.created_at })}</Text>
                    <Text style={{fontSize:10,color:props.type==="outgoing"? '#fff' : '#666'}}>{audioRecorderPlayer.mmss(Math.floor(currentPositionSec / 1000))}</Text>
                </View>
                </View>
        </View>
    )
}


export default React.memo(RecordSlider)

const styles = StyleSheet.create({

    container: {
        // padding: '3%',
        flexDirection:'row',
        alignItems:'center'
    },

    recordButton: {
        // width: 40,
        // height: 40,
        // borderRadius: 20,
        // backgroundColor: 'red',
        // alignItems: 'center',
        // justifyContent: 'center',
        // alignSelf: 'flex-end',
    },

});




// export default class RecordSlider extends React.Component {
//     constructor(props) {
//         super(props)
//         this.state = {
//             currentPositionSec: 0,
//             currentDurationSec: 0,
//             message: props.message,
//             recordPlaying: false
//         }

//         this.audioRecorderPlayer = new AudioRecorderPlayer();
//     }

//     onStartPlay = async (recordPath) => {
//         // dispatch({ type: IS_RECORD_PLAYING, payload: true })
//         const msg = await this.audioRecorderPlayer.startPlayer(recordPath);
//         this.audioRecorderPlayer.addPlayBackListener(e => {
//             // let defaultMessage = message
//             // defaultMessage.currentDurationSec = e.duration;
//             // defaultMessage.currentPositionSec = e.currentPosition;
//             // setMessage(defaultMessage)
//             // setCurrentDurationSec(e.duration)
//             // setCurrentPositionSec(e.currentPosition)

//             this.setState({
//                 currentDurationSec: e.duration,
//                 currentPositionSec: e.currentPosition
//             })

//             if (e.currentPosition === e.duration) {
//                 console.log('finished');
//                 this.audioRecorderPlayer.stopPlayer();
//                 }

//             console.log("pos " + e.currentPosition)
//             console.log("du  " + e.duration)
            

//             return;
//         });

//     }
//     render() {

//         return (
//             <View
//                 style={styles.container}>
//                 <TouchableOpacity
//                     // disabled={isRecordPlaying}
//                     onPress={() => {
//                         this.onStartPlay(this.state.message.data_url);
//                         this.setState({ recordPlaying: true })
//                     }}
//                     style={styles.recordButton}>
//                     <Icon fill={this.props.theme['color-primary-default']} name={this.state.recordPlaying ? "pause-circle-outline" : "play-circle-outline"} width={24} height={24} />
//                 </TouchableOpacity>

//                 <Slider

//                     style={{
//                         width: 200,
//                         height: 40,
//                         transform: [{ rotate:  I18nManager.isRTL ?'180deg':"0deg" }]
//                         //I18nManager.isRTL ?  : '0deg',
//                     }}
//                     minimumValue={0}
//                     maximumValue={this.state.currentDurationSec}
//                     value={this.state.currentPositionSec != -1 ?this.state.currentPositionSec:0}
//                     minimumTrackTintColor={"red"}
//                     maximumTrackTintColor={"white"}
//                     // step={1}
//                 // onSlidingComplete={() => {setCurrentPositionSec(0)}}
//                 // onValueChange={value => { 
//                 //     // setCurrentPositionSec(value)
//                 //     console.log(value)
//                 // }}

//                 />


//             </View>
//         )
//     }
// }
