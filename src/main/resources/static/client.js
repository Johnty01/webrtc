//connecting to our signaling server
var conn = new WebSocket('ws://localhost:8080/socket');
var streamVideo = document.getElementById("stream-video");
var yourVideo = document.getElementById("your-video");
var streamStarted = false;

conn.onopen = function() {
    console.log("Connected to the signaling server");
    initialize();
};

conn.onmessage = function(msg) {
    console.log("Got message", msg.data);
    var content = JSON.parse(msg.data);
    var data = content.data;
    switch (content.event) {
        // when somebody wants to call us
        case "offer":
            handleOffer(data);
            break;
        case "answer":
            handleAnswer(data);
            break;
        // when a remote peer sends an ice candidate to us
        case "candidate":
            handleCandidate(data);
            break;
        default:
            break;
    }
};

function send(message) {
    conn.send(JSON.stringify(message));
}

var peerConnection = new RTCPeerConnection();
var dataChannel;
var input = document.getElementById("messageInput");

peerConnection.ontrack = async (event) => {
    console.log("hi");
};

function initialize() {
    // Setup ice handling
    peerConnection.onicecandidate = function(event) {
        if (event.candidate) {
            send({
                event : "candidate",
                data : event.candidate
            });
        }
    };

    // creating data channel
    dataChannel = peerConnection.createDataChannel("dataChannel", {
        reliable : true
    });

    dataChannel.onerror = function(error) {
        console.log("Error occured on datachannel:", error);
    };

    // when we receive a message from the other peer, printing it on the console
    dataChannel.onmessage = function(event) {
        console.log("message:", event.data);
    };


    dataChannel.onclose = function() {
        console.log("data channel is closed");
    };

    peerConnection.ondatachannel = function (event) {
        dataChannel = event.channel;
    };

    peerConnection.ontrack = function (event) {
        if(!streamStarted) {
            streamVideo.play();
            streamStarted = true;
        }
        streamVideo.srcObject = event.streams[0];
    }


    navigator.mediaDevices.getUserMedia({audio: true, video: true})
        .then(function (stream) {
            yourVideo.srcObject = stream;
        });
}

function createOffer() {
    peerConnection.createOffer(function(offer) {
        send({
            event : "offer",
            data : offer,
            type: 2
        });
        peerConnection.setLocalDescription(offer);
    }, function(error) {
        alert("Error creating an offer");
    });
}


function handleOffer(offer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // create and send an answer to an offer
    peerConnection.createAnswer(function(answer) {
        peerConnection.setLocalDescription(answer);
        send({
            event : "answer",
            data : answer
        });



        navigator.mediaDevices.getUserMedia({audio: true, video: true})
            .then(function (stream) {
                streamVideo.srcObject = stream;
                for (const track of stream.getTracks()) {
                    peerConnection.addTrack(track, stream);
                }
            });
    }, function(error) {
        alert("Error creating an answer");
    });

};

function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

function handleAnswer(answer) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("connection established successfully!!");
};

function sendMessage() {
    dataChannel.send(input.value);
    input.value = "";
}