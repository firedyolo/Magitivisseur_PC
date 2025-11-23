import config from '../config.json' with { type: 'json' };

const debugMode = config.debugMode;

function debugAudio(audio_process) {
    // DEBUG AUDIO
    if (audio_process !== undefined && audio_process !== null) {
        audio_process.on('error', err => {
            console.error(`Can't start : ${err}`);
        });

        audio_process.stdin.on('data', data => {
            console.log(`[AUDIO] STDIN: ${data}`);
        });

        audio_process.stderr.on('data', (data) => {
            console.error(`[AUDIO] STDERR: ${data}`);
        });

        audio_process.on('close', code => {
            console.log(`[AUDIO] closed with code : ${code}`);
        });
    }
}

function debugVideo(video_process) {
    // DEBUG VIDEO
    if (video_process !== undefined && video_process !== null) {
        video_process.on('error', err => {
            console.error(`[VIDEO] Can't start : ${err}`);
        });

        video_process.stdin.on('data', data => {
            console.log(`[VIDEO] STDIN: ${data}`);
        });

        video_process.stderr.on('data', (data) => {
            console.error(`[VIDEO] STDERR: ${data}`);
        });

        video_process.on('close', code => {
            console.log(`[VIDEO] closed with code : ${code}`);
        });
    }
}

function debugPrint(processus, print_Name) {
    processus.stdout.on('data', (data) => {
        console.log(`[${print_Name}] STDOUT : ${data}`);
    });

    processus.stderr.on("data", (data) => {
        console.error(`[${print_Name}] STDERR : ${data}`);
    });
}

export { debugAudio, debugVideo, debugPrint, debugMode }