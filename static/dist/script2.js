const imageUpload = document.getElementById('imageUpload');
Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('static/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('static/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('static/models'),
]).then(start)


async function start(){
    console.log('start')
    const container = document.createElement('div')
    container.style.position = 'relative'
    document.body.append(container)
    const labelFaceDescriptors = await loadLabeledImages()
    let image
    let canvas
    document.body.append('Loaded')
    imageUpload.addEventListener('change', async() =>{
        console.log('start process')
        if(image) image.remove()
        if(canvas) canvas.remove()
        image = await faceapi.bufferToImage(imageUpload.files[0])
        container.append(image)
        canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = {width: image.width, height: image.height}
        faceapi.matchDimensions(canvas, displaySize)


        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const faceMatcher = new faceapi.FaceMatcher(labelFaceDescriptors,0.6)
        const result = resizedDetections.map(x => faceMatcher.findBestMatch(x.descriptor))
        result.forEach((res,i) => {
            const box = resizedDetections[i].detection.box
            const drawbox = new faceapi.draw.DrawBox(box,{label:result.toString()})
            console.log(result.toString())
            drawbox.draw(canvas)
        })
        console.log('end process')
    })
    console.log('end')
}



function loadLabeledImages(){
    const labels = ['bondan', 'miftah', 'umar', 'wawan']
    return Promise.all(
        labels.map(async label => {
            console.log('start laodLabeledImages')
            const descriptions = []
            for (let index = 1; index <= 2; index++) {
                const image = await faceapi.fetchImage(`http://localhost:5000/static/labeled_images/${label}/${index}.png`)
                const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }
            console.log('end loadLabeledImages')

            return new faceapi.LabeledFaceDescriptors(label,descriptions)
        })

    )
}