document.addEventListener("DOMContentLoaded", function () {
    /*
    Create a file input that allows the user to select an audio file.
    */
    var song;
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "audio/*";
    fileInput.addEventListener("change", function (e) {
        song = e.target.files[0];
    });
    document.body.appendChild(fileInput);
    /*
    Create a submit button that can be enabled when an audio file is chosen and
    submits the file for processing.
    */

    var submitButton = document.createElement("button");
    submitButton.innerHTML = "Submit";
    submitButton.disabled = true;
    fileInput.addEventListener("click", function () {
        submitButton.disabled = false;
    });
    document.body.appendChild(submitButton);
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    /*
    Create an HTML5 canvas element to display the audio waveform.
    */

    var canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "15%";
    canvas.style.left = "15%";
    canvas.style.width = "70%";
    canvas.style.height = "40%";
    canvas.style.borderRadius = "10px";
    canvas.style.border = "1px solid grey";
    canvas.style.backgroundColor = "grey";
    document.body.appendChild(canvas);

    var canvasContext = canvas.getContext("2d");
    canvasContext.strokeStyle = "#FF0000";

    /*
    Create an HTML5 audio element to play the processed audio.
    */

    var audio = document.createElement("audio");
    audio.controls = true;
    audio.style.position = "absolute";
    audio.style.top = "55%";
    audio.style.left = "15%";
    audio.style.width = "70%";
    audio.style.height = "25px";
    audio.style.borderRadius = "10px";
    audio.style.border = "1px solid white";
    audio.style.backgroundColor = "white";
    document.body.appendChild(audio);

    var stream, source;

    
    var dataArray = new Float32Array(1024);
    const fileReader = new FileReader();

    /*
    Create an AnalyserNode to perform the FFT to get the audio waveform.
    */
    const analyser = audioContext.createAnalyser();

    /*
    Create a GainNode to control the volume of the audio.
    */
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.25;
    gainNode.gain.minValue = 0.1;
    gainNode.gain.maxValue = 0.75;

    /*
    Create a DynamicsCompressorNode to compress the dynamic range of the audio.
    */
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, audioContext.currentTime);
    compressor.knee.setValueAtTime(40, audioContext.currentTime);
    compressor.ratio.setValueAtTime(12, audioContext.currentTime);
    compressor.attack.setValueAtTime(0, audioContext.currentTime);
    compressor.release.setValueAtTime(0.25, audioContext.currentTime);
    compressor.connect(gainNode);

    audio.addEventListener("loadeddata", function (e) {
        const sUsrAg = navigator.userAgent;

        if (sUsrAg.indexOf("Firefox") > -1) {
            console.log("Firefox");
            stream = audio.mozCaptureStream();
        } else {
            console.log("Other");
            stream = audio.captureStream();
        }

        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.connect(compressor);
    });
    fileReader.addEventListener("load", function (e) {
        audio.src = e.target.result;
    });
    submitButton.addEventListener("click", function () {
        fileReader.readAsDataURL(song);
    });

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    var playing = false;
    const H = canvas.height / 2;
    const sliceWidth = (canvas.width * 1.0) / 1024.0;
    /*
    Add event listeners to the audio HTML5 element to control playback.
    */
    audio.addEventListener("play", () => {

        audioContext.resume();
        if (!playing) {
            playing = true;
            draw();
        } else {
            playing = true;
        }
    });
    audio.addEventListener("playing", () => {
        audioContext.resume();
        if (!playing) {
            playing = true;
            draw();
        } else {
            playing = true;
        }
    });
    audio.addEventListener("pause", () => {
        playing = false;
        audioContext.suspend();
    });
    audio.addEventListener("ended", () => {
        playing = false;
        audioContext.suspend();

        fileReader.readAsDataURL(song);
    });
     /*
    Create a slider to control the attack effect of the compressor.
    */
    var attackSlider = document.createElement('input');
    attackSlider.type = 'range';
    attackSlider.min = 0.0;
    attackSlider.max = 1.0;
    attackSlider.step = 0.01;
    attackSlider.value = 0.5;
    attackSlider.oninput = function () {
        compressor.attack.setValueAtTime(parseFloat(attackSlider.value), audioContext.currentTime);
    };
    attackSlider.style.position = "absolute";
    attackSlider.style.top = "60%";
    attackSlider.style.left = "15%";
    attackSlider.style.width = "70%";
    attackSlider.style.height = "25px";
    document.body.appendChild(attackSlider);
     /*
    Create a slider to control the release effect of the compressor.
    */

    /*
    Create a slider to control the ratio effect of the compressor.
    */

    /*
    Create a slider to control the threshold effect of the compressor.
    */

    /*
    Create a slider to control the threshold effect of the compressor.
    */

    ////////////// JS FUNCTIONS /////////////////
    /*
    * Updates the oscilloscope display with the current audio data. 
    */
    function draw() {
        requestAnimationFrame(draw);
        analyser.getFloatTimeDomainData(dataArray);
        canvasContext.fillStyle = "rgb(200, 200, 200)";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = "rgb(0, 0, 0)";
        canvasContext.beginPath();

        let x = 0;
        for (var i = 0; i < 1024; i++) {
        var y = H + dataArray[i] * H;
        if (i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }
        x += sliceWidth;
        }
        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();
    }

    /**
     * This function is the Fast Fourier Transform algorithm.
     *
     * @param {array} data The data to be transformed.
     * @returns {array} The Fourier transform of the inputted data.
     */
    function fft(data) {
        var n = data.length;
        if (n == 1) {
        return [data[0]];
        }
        var even = [];
        var odd = [];
        for (var i = 0; i < n; i++) {
        if (i % 2 == 0) {
            even.push(data[i]);
        } else {
            odd.push(data[i]);
        }
        }
        var evenFFT = fft(even);
        var oddFFT = fft(odd);
        var result = [];
        for (var i = 0; i < n / 2; i++) {
        var theta = (-2 * Math.PI * i) / n;
        var c = Math.cos(theta);
        var s = Math.sin(theta);
        result.push(evenFFT[i] + c * oddFFT[i] - s * oddFFT[i]);
        result.push(evenFFT[i] - c * oddFFT[i] + s * oddFFT[i]);
        }
        return result;
    }

});		