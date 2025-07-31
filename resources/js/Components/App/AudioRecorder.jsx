import { MicrophoneIcon, StopCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const AudioRecorder = ({ fileReady }) => {
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);

    const onMicrophoneClick = async () => {
        if (recording) {
            setRecording(false);

            if (mediaRecorder) {
                mediaRecorder.stop();
                setMediaRecorder(null);
            }
            return;
        }

        setRecording(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const newMediaRecorder = new MediaRecorder(stream);
            const chunks = [];

            newMediaRecorder.addEventListener('dataavailable', (event) => {
                chunks.push(event.data);
            });

            newMediaRecorder.addEventListener('stop', () => {
                let audioBlob = new Blob(chunks, {
                    type: 'audio/ogg; codecs=opus'
                });
                let AudioFile = new File([audioBlob], 'recorded_audio.ogg', {
                    type: 'audio/ogg; codecs=opus'
                });
                const url = URL.createObjectURL(AudioFile);

                fileReady(AudioFile, url);
            });

            newMediaRecorder.start();
            setMediaRecorder(newMediaRecorder);
        } catch (error) {
            setRecording(false);
            console.error('Error accessing microphone:', error);
        }
    };

    return (
        <button 
            onClick={onMicrophoneClick} 
            className="text-gray-400 hover:text-gray-200 flex items-start justify-start"
        >
            {recording && <StopCircleIcon className="w-5 h-5 text-red-600" />}
            {!recording && <MicrophoneIcon className="w-5 h-5" />}
        </button>
    );
};

export default AudioRecorder;
