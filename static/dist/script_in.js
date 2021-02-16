

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

var data_response
var data_ip

console.log("outside")

if(video != null){
    console.log("inside if video null")
    
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(  'static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri( 'static/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('static/models'),
    faceapi.nets.faceExpressionNet.loadFromUri( 'static/models'),
    ]).then(startWebcam);

    function startWebcam(){
        console.log("inside startwebcam")
        navigator.getUserMedia({video:{}}, (stream) => (video.srcObject = stream), (err) => console.error(err))
    }
    console.log("video addeventlistener")
    video.addEventListener('play', renderVideo);

    async function renderVideo(){
        console.log("inside rendervideo")
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
            
            console.log("Sending request. . .");
            let request = $.ajax({
                type:"POST",
                url:"/face_match_in",
                data: JSON.stringify({"img_data":canvas.toDataURL(), "ip":data_ip}),
                dataType: "json",
                contentType: "application/json"
            })
            console.log("Finishing request. . .");
            request.done(function(response, textStatus, jqXHR){
                data_response = response
                console.log(response)

                $.ajax({
                    url:"/get_attendance_in",
                    dataType: "json",
                    contentType: "application/json"
                }).done(function(response, textStatus, jqXHR){
                    let data_ip
                    alldata = response
                    let text_html = ""
                    alldata.forEach(function(data,index){
                        let temp = "<li>" + data['name'] + " | " + data['time'] + "</li>"
                        text_html += "Clock In : "+temp
                        if(data_ip == data['ip']) 
                            checked = true
                    })
                    if( text_html != "" || text_html.length > 0 ){
                        // rename field attendance
                        $(".subparticipants-contents").html(text_html)
                    }
                    
                })

                Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(  'static/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri( 'static/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('static/models'),
                faceapi.nets.faceExpressionNet.loadFromUri( 'static/models'),
                ]).then(startWebcam);
            })
            
            return
        }

        setTimeout(() => renderVideo(),500)
    }
}