document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Funky Parallax Blobs ---
    const blobs = document.querySelectorAll('.blob');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 0.1;
            blob.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.clientX) / speed;
            const yOffset = (window.innerHeight / 2 - e.clientY) / speed;
            // Combine scroll and mouse movement if possible, but for now just mouse is fine for "float"
            // Actually, let's keep the CSS animation for float and just add slight mouse interaction
            // blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`; 
        });
    });

    // --- Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- 3D Tilt Effect ---
    const tiltCards = document.querySelectorAll('.course-card, .team-card, .glass-card');

    tiltCards.forEach(card => {
        card.classList.add('tilt-card'); // Ensure class exists

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Modals Logic ---
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloses = document.querySelectorAll('.modal-close');
    const modals = document.querySelectorAll('.modal');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modalOverlay.classList.add('active');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = '';
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    modalCloses.forEach(close => {
        close.addEventListener('click', closeModal);
    });

    modalOverlay.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // --- DJ Deck Simulator Logic ---
    const playBtn = document.getElementById('playBtn');
    const cueBtn = document.getElementById('cueBtn');
    const vinylRecord = document.getElementById('vinylRecord');
    const toneArm = document.getElementById('toneArm');
    const speedSlider = document.getElementById('speedSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const crossfader = document.getElementById('crossfader');

    // EQ Knobs
    const eqHighKnob = document.getElementById('eqHigh');
    const eqMidKnob = document.getElementById('eqMid');
    const eqLowKnob = document.getElementById('eqLow');

    // FX Knobs
    const fxCrushKnob = document.getElementById('fxCrush');
    const fxDelayKnob = document.getElementById('fxDelay');

    // Display & Visualizer
    const bpmDisplay = document.getElementById('bpmDisplay');
    const modeDisplay = document.getElementById('modeDisplay');
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    // Pads
    const pads = document.querySelectorAll('.te-pad');

    let isPlaying = false;
    let audioContext;
    let masterGain;
    let deckAGain;
    let deckBGain;
    let analyser;

    // EQ Nodes
    let eqHigh, eqMid, eqLow;

    // FX Nodes
    let bitcrusher, delayNode, delayFeedback, delayGain;

    // Beat State
    let nextNoteTime = 0.0;
    let beatCount = 0;
    let tempo = 120;
    let timerID;
    const lookahead = 25.0;
    const scheduleAheadTime = 0.1;

    // Scratch Variables
    let isDragging = false;
    let lastAngle = 0;
    let currentRotation = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let scratchSource;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Master Chain
            masterGain = audioContext.createGain();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            // FX Chain: EQ -> Bitcrusher -> Delay -> Master

            // EQ
            eqHigh = audioContext.createBiquadFilter();
            eqHigh.type = 'highshelf';
            eqHigh.frequency.value = 3000;

            eqMid = audioContext.createBiquadFilter();
            eqMid.type = 'peaking';
            eqMid.frequency.value = 1000;
            eqMid.Q.value = 1;

            eqLow = audioContext.createBiquadFilter();
            eqLow.type = 'lowshelf';
            eqLow.frequency.value = 300;

            // Bitcrusher (ScriptProcessor or AudioWorklet - using simplified approach for now)
            // Actually, let's use a highpass/lowpass combo or distortion for "Crush" to keep it simple without worklets
            // Or a WaveShaper
            bitcrusher = audioContext.createWaveShaper();
            bitcrusher.curve = makeDistortionCurve(0); // Start with 0 distortion
            bitcrusher.oversample = '4x';

            // Delay
            delayNode = audioContext.createDelay();
            delayNode.delayTime.value = 0.5; // 500ms
            delayFeedback = audioContext.createGain();
            delayFeedback.gain.value = 0.4;
            delayGain = audioContext.createGain();
            delayGain.gain.value = 0; // Start dry

            // Connections
            // Decks -> EQ Low
            deckAGain = audioContext.createGain();
            deckBGain = audioContext.createGain();

            deckAGain.connect(eqLow);
            deckBGain.connect(eqLow);

            eqLow.connect(eqMid);
            eqMid.connect(eqHigh);
            eqHigh.connect(bitcrusher);

            // Split to Delay
            bitcrusher.connect(masterGain);
            bitcrusher.connect(delayNode);

            delayNode.connect(delayFeedback);
            delayFeedback.connect(delayNode);
            delayFeedback.connect(delayGain);
            delayGain.connect(masterGain);

            masterGain.connect(analyser);
            analyser.connect(audioContext.destination);

            // Initial Mix
            updateCrossfader();

            // Start Visualizer
            drawVisualizer();
        }
    }

    function makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    let lastOut = 0;

    function createScratchSound(velocity) {
        if (!audioContext) return;

        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        // Pitch follows velocity
        osc.frequency.setValueAtTime(100 + (velocity * 5), audioContext.currentTime);

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(Math.min(velocity / 50, 0.5), audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000 + (velocity * 10), audioContext.currentTime);
        filter.Q.value = 1;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain); // Connect to master (post-EQ? or pre-EQ? Let's go post for clarity)

        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    }

    function playKick(time, gainNode) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(gainNode);
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    function playSnare(time, gainNode) {
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = audioContext.createGain();
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gainNode);
        noiseGain.gain.setValueAtTime(1, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noise.start(time);
    }

    function playHiHat(time, gainNode) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(8000, time);
        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(gainNode);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        osc.start(time);
        osc.stop(time + 0.05);
    }

    function playBass(time, note, gainNode) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note, time);
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, time);
        filter.Q.value = 5;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(gainNode);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.4);
        osc.start(time);
        osc.stop(time + 0.4);
    }

    function scheduleNote(beatNumber, time) {
        if (beatNumber % 4 === 0) {
            playKick(time, deckAGain);
            playBass(time, 55, deckAGain);
        }
        if (beatNumber % 4 === 2) {
            playSnare(time, deckAGain);
        }
        if (beatNumber % 4 === 1 || beatNumber % 4 === 3) {
            if (Math.random() > 0.5) playKick(time + 0.25, deckAGain);
        }
        playHiHat(time, deckAGain);
        playHiHat(time + 0.25, deckAGain);

        playKick(time, deckBGain);
        if (beatNumber % 4 === 0) {
            playBass(time, 40, deckBGain);
        } else if (beatNumber % 4 === 2) {
            playBass(time, 80, deckBGain);
        }
        playHiHat(time + 0.25, deckBGain);
    }

    function scheduler() {
        while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
            scheduleNote(beatCount, nextNoteTime);
            nextNoteTime += 60.0 / (tempo * speedSlider.value);
            beatCount = (beatCount + 1) % 4;
        }
        timerID = requestAnimationFrame(scheduler);
    }

    function startPlayback() {
        if (isPlaying) return;
        initAudio();
        if (audioContext.state === 'suspended') audioContext.resume();

        isPlaying = true;
        beatCount = 0;
        nextNoteTime = audioContext.currentTime + 0.1;

        playBtn.classList.add('active');
        vinylRecord.classList.add('spinning');
        toneArm.classList.add('active');

        scheduler();
    }

    function stopPlayback() {
        isPlaying = false;
        cancelAnimationFrame(timerID);

        playBtn.classList.remove('active');
        vinylRecord.classList.remove('spinning');
        toneArm.classList.remove('active');
    }

    playBtn.addEventListener('click', () => {
        if (isPlaying) stopPlayback();
        else startPlayback();
    });

    cueBtn.addEventListener('mousedown', () => {
        if (!isPlaying) startPlayback();
    });

    cueBtn.addEventListener('mouseup', () => {
        if (isPlaying && !playBtn.classList.contains('active')) stopPlayback();
        else if (isPlaying) stopPlayback();
    });

    volumeSlider.addEventListener('input', (e) => {
        if (masterGain) masterGain.gain.value = e.target.value;
    });

    speedSlider.addEventListener('input', (e) => {
        const speed = e.target.value;
        vinylRecord.style.animationDuration = `${2 / speed}s`;
        bpmDisplay.innerText = `${Math.round(120 * speed)} BPM`;
    });

    function updateCrossfader() {
        if (!deckAGain || !deckBGain) return;
        const val = parseFloat(crossfader.value);
        deckAGain.gain.value = 1 - val;
        deckBGain.gain.value = val;

        modeDisplay.innerText = val < 0.5 ? "HIP-HOP" : "TECHNO";
    }
    crossfader.addEventListener('input', updateCrossfader);

    // Knob Logic (Generic)
    function setupKnob(knob, callback) {
        let isDraggingKnob = false;
        let startY;
        let startVal;

        knob.addEventListener('mousedown', (e) => {
            isDraggingKnob = true;
            startY = e.clientY;
            const transform = knob.style.transform || 'rotate(0deg)';
            startVal = parseInt(transform.replace('rotate(', '').replace('deg)', '')) || 0;
            document.body.style.cursor = 'ns-resize';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDraggingKnob) return;
            e.preventDefault();
            const delta = startY - e.clientY;
            let newVal = startVal + delta * 2;
            newVal = Math.max(-135, Math.min(135, newVal));

            knob.style.transform = `rotate(${newVal}deg)`;

            // Normalize to 0-1 or -1 to 1
            const normalized = (newVal + 135) / 270;
            callback(normalized);
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingKnob) {
                isDraggingKnob = false;
                document.body.style.cursor = '';
            }
        });
    }

    // Setup Knobs
    setupKnob(eqHighKnob, (val) => { if (eqHigh) eqHigh.gain.value = (val - 0.5) * 40; });
    setupKnob(eqMidKnob, (val) => { if (eqMid) eqMid.gain.value = (val - 0.5) * 40; });
    setupKnob(eqLowKnob, (val) => { if (eqLow) eqLow.gain.value = (val - 0.5) * 40; });

    setupKnob(fxCrushKnob, (val) => {
        if (bitcrusher) bitcrusher.curve = makeDistortionCurve(val * 400);
    });

    setupKnob(fxDelayKnob, (val) => {
        if (delayGain) delayGain.gain.value = val;
    });

    // Pads Logic
    pads.forEach(pad => {
        pad.addEventListener('mousedown', () => {
            initAudio();
            const type = pad.dataset.sample;
            playSample(type);
            pad.style.transform = 'scale(0.95)';
            setTimeout(() => pad.style.transform = '', 100);
        });
    });

    function playSample(type) {
        if (!audioContext) return;
        const now = audioContext.currentTime;

        if (type === 'kick') playKick(now, masterGain);
        if (type === 'snare') playSnare(now, masterGain);
        if (type === 'hat') playHiHat(now, masterGain);
        if (type === 'airhorn') {
            // Simple Airhorn Synth
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.3);

            gain.gain.setValueAtTime(0.5, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    }

    // Visualizer
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.fillStyle = '#000';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = '#00ff41'; // Matrix Green
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    // Scratching
    vinylRecord.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        vinylRecord.classList.remove('spinning');
        const rect = vinylRecord.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        lastAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const rect = vinylRecord.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

        let delta = angle - lastAngle;
        if (delta > Math.PI) delta -= 2 * Math.PI;
        if (delta < -Math.PI) delta += 2 * Math.PI;

        currentRotation += delta * (180 / Math.PI);
        vinylRecord.style.transform = `rotate(${currentRotation}deg)`;

        const velocity = Math.abs(delta) * 100;
        if (velocity > 1) createScratchSound(velocity);

        lastAngle = angle;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            if (isPlaying) {
                vinylRecord.classList.add('spinning');
                vinylRecord.style.transform = '';
            }
        }
    });
});
