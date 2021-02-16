

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

var data_response
var data_ip

if(video != null){
    
    
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(  'static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri( 'static/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('static/models'),
    faceapi.nets.faceExpressionNet.loadFromUri( 'static/models'),
    ]).then(startWebcam);

    function startWebcam(){
        navigator.getUserMedia({video:{}}, (stream) => (video.srcObject = stream), (err) => console.error(err))
    }

    video.addEventListener('play', renderVideo);

    async function renderVideo(){
        const displaySize = { width: video.width, height: video.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        
        const resizeDetections = faceapi.resizeResults(detections,displaySize)
        canvas.getContext('2d').clearRect(0,0,canvas.width, canvas.height)
        
        faceapi.draw.drawDetections(canvas, resizeDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
        
        if(detections.length > 0){
            canvas.getContext('2d').drawImage(video,0,0,canvas.width, canvas.height)
            video.pause()
            
            await $.getJSON('https://api.ipify.org?format=json', function(data){
                data_ip = data.ip
            });
            
            let request = $.ajax({
                type:"POST",
                url:"/face_match",
                data: JSON.stringify({"img_data":canvas.toDataURL(), "ip":data_ip}),
                dataType: "json",
                contentType: "application/json"
            })
            
            request.done(function(response, textStatus, jqXHR){
                data_response = response
                console.log(response)
                if(data_response.error == "DetectFaceError")
                {
                    Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(  'static/models'),
                    faceapi.nets.faceLandmark68Net.loadFromUri( 'static/models'),
                    faceapi.nets.faceRecognitionNet.loadFromUri('static/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri( 'static/models'),
                    ]).then(startWebcam);
                }
            })
            
            return
        }

        setTimeout(() => renderVideo(),1)
    }
}