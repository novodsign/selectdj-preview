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
    const tiltCards = document.querySelectorAll('.course-card, .team-card, .glass-card, .bento-card');

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

    // --- Hero Logo Tilt Effect (More viscous/fluid feel) ---
    const logoContainer = document.querySelector('.hero-logo-container');
    const logoMask = document.querySelector('.logo-mask');
    const logoStroke = document.querySelector('.logo-stroke-svg');

    // --- Hero Logo Tilt Effect REMOVED as requested (User wanted static, no rotation) ---
    // The logo will now use a CSS-only shimmer effect on hover.
    /* 
    if (logoContainer) {
       // Logic removed to prevent "spinning"
    } 
    */

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

    // --- Button Hover Effect (Radial Gradient) ---
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            btn.style.setProperty('--x', `${x}px`);
            btn.style.setProperty('--y', `${y}px`);
        });
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
    const gainKnob = document.getElementById('gainKnob'); // New Gain

    // FX Knobs
    const fxCrushKnob = document.getElementById('fxCrush');
    const fxDelayKnob = document.getElementById('fxDelay');
    const fxReverbKnob = document.getElementById('fxReverb');
    const fxFilterKnob = document.getElementById('fxFilter');

    // Pro DJ Controls
    const nudgePlus = document.getElementById('nudgePlus');
    const nudgeMinus = document.getElementById('nudgeMinus');
    const hotCueBtns = document.querySelectorAll('.hot-cue');
    const loopInBtn = document.getElementById('loopInBtn');
    const loopOutBtn = document.getElementById('loopOutBtn');
    const loopExitBtn = document.getElementById('loopExitBtn');
    const syncBtn = document.getElementById('syncBtn');
    const vuSegments = document.querySelectorAll('.vu-segment');

    // Sampler Controls
    const recBtn = document.getElementById('recBtn');
    const loopBtn = document.getElementById('loopBtn');
    const bankBtn = document.getElementById('bankBtn');
    const pads = document.querySelectorAll('.te-pad');

    // Display & Visualizer
    const bpmDisplay = document.getElementById('bpmDisplay');
    const modeDisplay = document.getElementById('modeDisplay');
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    let isPlaying = false;
    let audioContext;
    let masterGain;
    let inputGain; // New Input Gain
    let deckAGain;
    let deckBGain;
    let analyser;

    // EQ Nodes
    let eqHigh, eqMid, eqLow;

    // FX Nodes
    let bitcrusher, delayNode, delayFeedback, delayGain;
    let reverbNode, reverbGain;
    let filterNode;

    // Sampler State
    let currentBank = 'A'; // A, B, C (User)
    let isLooping = false;
    let isRecording = false;
    let recArmed = false;
    let mediaRecorder;
    let recordedChunks = [];
    let userSamples = [null, null, null, null];

    // Beat State
    let nextNoteTime = 0.0;
    let current16thNote = 0;
    let tempo = 120;
    let timerID;
    const scheduleAheadTime = 0.1;
    const lookahead = 25.0;

    // Pro DJ State
    let nudgeFactor = 0;
    let hotCues = [null, null, null, null];
    let loopStart = null;
    let loopEnd = null;
    let isManualLooping = false;
    let loopLength = 0;

    // Scratch Variables
    let isDragging = false;
    let lastAngle = 0;
    let currentRotation = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;

    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Master Chain
            masterGain = audioContext.createGain();
            inputGain = audioContext.createGain(); // Input Gain Stage
            inputGain.gain.value = 1.0;

            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            // FX Chain: EQ -> Filter -> Bitcrusher -> Delay -> Reverb -> Master

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

            // DJ Filter
            filterNode = audioContext.createBiquadFilter();
            filterNode.type = 'allpass';
            filterNode.frequency.value = 20000;

            // Bitcrusher
            bitcrusher = audioContext.createWaveShaper();
            bitcrusher.curve = makeDistortionCurve(0);
            bitcrusher.oversample = '4x';

            // Delay
            delayNode = audioContext.createDelay();
            delayNode.delayTime.value = 0.375; // Dotted 8th at 120ish
            delayFeedback = audioContext.createGain();
            delayFeedback.gain.value = 0.4;
            delayGain = audioContext.createGain();
            delayGain.gain.value = 0;

            // Reverb
            reverbNode = audioContext.createConvolver();
            reverbNode.buffer = createImpulseResponse(2, 2, false);
            reverbGain = audioContext.createGain();
            reverbGain.gain.value = 0;

            // Connections
            deckAGain = audioContext.createGain();
            deckBGain = audioContext.createGain();

            deckAGain.connect(inputGain);
            deckBGain.connect(inputGain);

            inputGain.connect(eqLow); // Input Gain feeds EQ

            eqLow.connect(eqMid);
            eqMid.connect(eqHigh);
            eqHigh.connect(filterNode);
            filterNode.connect(bitcrusher);

            bitcrusher.connect(masterGain);

            bitcrusher.connect(delayNode);
            delayNode.connect(delayFeedback);
            delayFeedback.connect(delayNode);
            delayFeedback.connect(delayGain);
            delayGain.connect(masterGain);

            bitcrusher.connect(reverbNode);
            reverbNode.connect(reverbGain);
            reverbGain.connect(masterGain);

            masterGain.connect(analyser);
            analyser.connect(audioContext.destination);

            updateCrossfader();
            drawVisualizer();
            updateVUMeter();
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

    function createImpulseResponse(duration, decay, reverse) {
        const sampleRate = audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = audioContext.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            const n = reverse ? length - i : i;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }
        return impulse;
    }

    // --- Sampler Logic ---

    bankBtn.addEventListener('click', () => {
        if (currentBank === 'A') currentBank = 'B';
        else if (currentBank === 'B') currentBank = 'C';
        else currentBank = 'A';

        bankBtn.innerText = `BANK ${currentBank}`;
        if (currentBank === 'C') bankBtn.innerText = 'USER (MIC)';
    });

    loopBtn.addEventListener('click', () => {
        isLooping = !isLooping;
        loopBtn.classList.toggle('active', isLooping);
    });

    // Improved Recording Workflow: Arm -> Tap Pad
    recBtn.addEventListener('click', () => {
        if (currentBank !== 'C') {
            // Auto-switch to Bank C
            currentBank = 'C';
            bankBtn.innerText = 'USER (MIC)';
        }

        recArmed = !recArmed;
        recBtn.classList.toggle('recording', recArmed);

        if (!recArmed && isRecording) {
            // If disarmed while recording, stop
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }
    });

    pads.forEach((pad, index) => {
        pad.addEventListener('mousedown', async () => {
            initAudio();
            if (audioContext.state === 'suspended') audioContext.resume();

            if (recArmed && currentBank === 'C') {
                if (isRecording) {
                    // Stop Recording
                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                } else {
                    // Start Recording
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder = new MediaRecorder(stream);
                        recordedChunks = [];

                        pad.classList.add('recording-active');
                        recBtn.classList.add('active'); // Solid red
                        isRecording = true;

                        mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
                        mediaRecorder.onstop = async () => {
                            const blob = new Blob(recordedChunks, { type: 'audio/ogg; codecs=opus' });
                            const arrayBuffer = await blob.arrayBuffer();
                            userSamples[index] = await audioContext.decodeAudioData(arrayBuffer);

                            pad.classList.remove('recording-active');
                            recBtn.classList.remove('active');
                            recBtn.classList.remove('recording'); // Disarm after recording
                            recArmed = false;
                            isRecording = false;
                        };

                        mediaRecorder.start();
                    } catch (err) { console.error(err); }
                }
            } else {
                // Playback
                playSample(index);
                pad.classList.add('active');
                setTimeout(() => pad.classList.remove('active'), 100);
            }
        });
    });

    function playSample(index) {
        if (!audioContext) return;
        const now = audioContext.currentTime;

        if (currentBank === 'A') {
            if (index === 0) playKick(now, masterGain, 1);
            if (index === 1) playSnare(now, masterGain, 1);
            if (index === 2) playHiHat(now, masterGain, 1);
            if (index === 3) playBass(now, 55, masterGain, 0.5);
        }
        else if (currentBank === 'B') {
            if (index === 0) playAirhorn(now);
            if (index === 1) playLaser(now);
            if (index === 2) playChord(now, [440, 554, 659]);
            if (index === 3) playChord(now, [392, 493, 587]);
        }
        else if (currentBank === 'C') {
            if (userSamples[index]) {
                const source = audioContext.createBufferSource();
                source.buffer = userSamples[index];
                source.connect(masterGain);
                source.loop = isLooping;
                source.start(now);
            }
        }
    }

    // --- Custom DJ Scrollbar Logic ---
    const carouselTrack = document.querySelector('.carousel-track');
    const djSlider = document.getElementById('teamScroll');

    if (carouselTrack && djSlider) {
        let isDragging = false;
        let animationFrameId;

        // 1. Sync Slider -> Scroll (User drags slider)
        djSlider.addEventListener('input', () => {
            isDragging = true;
            const scrollableWidth = carouselTrack.scrollWidth - carouselTrack.clientWidth;
            const scrollValue = (djSlider.value / 100) * scrollableWidth;

            // Use auto behavior for direct 1:1 control during drag
            carouselTrack.scrollTo({
                left: scrollValue,
                behavior: 'auto'
            });
        });

        djSlider.addEventListener('change', () => {
            isDragging = false; // Released
        });

        // Also reset on mouseup/touchend to be safe
        djSlider.addEventListener('mouseup', () => isDragging = false);
        djSlider.addEventListener('touchend', () => isDragging = false);

        // 2. Sync Scroll -> Slider (User swipes cards)
        carouselTrack.addEventListener('scroll', () => {
            if (!isDragging) {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);

                animationFrameId = requestAnimationFrame(() => {
                    const scrollableWidth = carouselTrack.scrollWidth - carouselTrack.clientWidth;
                    if (scrollableWidth > 0) {
                        const navValue = (carouselTrack.scrollLeft / scrollableWidth) * 100;
                        djSlider.value = navValue;
                    }
                });
            }
        });

        // Initial set
        carouselTrack.dispatchEvent(new Event('scroll'));
    }

    // --- Stats Counter Animation ---
    function playAirhorn(time) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, time);
        osc.frequency.linearRampToValueAtTime(800, time + 0.3);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.5);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    function playLaser(time) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.frequency.setValueAtTime(1000, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.2);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    function playChord(time, freqs) {
        freqs.forEach(f => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, time);
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 1);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(time);
            osc.stop(time + 1);
        });
    }

    function playKick(time, gainNode, velocity = 1) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(gainNode);
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
        gain.gain.setValueAtTime(velocity, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        osc.start(time);
        osc.stop(time + 0.5);
    }

    function playSnare(time, gainNode, velocity = 1) {
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) { output[i] = Math.random() * 2 - 1; }
        const noise = audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        const noiseGain = audioContext.createGain();
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gainNode);
        noiseGain.gain.setValueAtTime(velocity, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noise.start(time);
    }

    function playHiHat(time, gainNode, velocity = 1, open = false) {
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

        const decay = open ? 0.3 : 0.05;
        gain.gain.setValueAtTime(velocity * 0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + decay);
        osc.start(time);
        osc.stop(time + decay);
    }

    function playBass(time, note, gainNode, velocity = 1) {
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
        gain.gain.setValueAtTime(velocity * 0.5, time);
        gain.gain.linearRampToValueAtTime(0, time + 0.4);
        osc.start(time);
        osc.stop(time + 0.4);
    }

    // --- Sophisticated Beat Engine (16-step) ---
    // Patterns: [Kick, Snare, Hat, Bass]
    // 0 = rest, 1 = hit, 0.5 = ghost

    const patterns = {
        hiphop: {
            kick: [1, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], // Half-time feel
            hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], // 8ths with roll
            bass: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        },
        techno: {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // 4/4
            snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            hat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0], // Off-beats
            bass: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]  // Rumble
        }
    };

    function scheduleNote(step, time) {
        // Swing: Delay odd 16th notes (1, 3, 5...)
        const swingAmount = 0.03; // 30ms swing
        const isSwing = step % 2 !== 0;
        const swingTime = isSwing ? time + swingAmount : time;

        // Deck A: Hip Hop
        const hh = patterns.hiphop;
        if (hh.kick[step]) playKick(swingTime, deckAGain, hh.kick[step]);
        if (hh.snare[step]) playSnare(swingTime, deckAGain, hh.snare[step]);
        if (hh.hat[step]) playHiHat(swingTime, deckAGain, hh.hat[step], false);
        if (hh.bass[step]) playBass(swingTime, 55, deckAGain, hh.bass[step]);

        // Deck B: Techno
        const tech = patterns.techno;
        if (tech.kick[step]) playKick(time, deckBGain, tech.kick[step]); // No swing on techno
        if (tech.hat[step]) playHiHat(time, deckBGain, tech.hat[step], true); // Open hats
        if (tech.bass[step]) playBass(time, 40, deckBGain, tech.bass[step]);
    }

    function scheduler() {
        while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
            scheduleNote(current16thNote, nextNoteTime);

            // Calculate speed with nudge
            const currentSpeed = parseFloat(speedSlider.value) + nudgeFactor;
            const secondsPerBeat = 60.0 / (tempo * currentSpeed);
            const secondsPer16th = secondsPerBeat / 4;

            nextNoteTime += secondsPer16th;

            // Manual Loop Logic
            if (isManualLooping && current16thNote === loopEnd) {
                current16thNote = loopStart;
            } else {
                current16thNote = (current16thNote + 1) % 16;
            }
        }
        timerID = requestAnimationFrame(scheduler);
    }

    // --- Transport Logic (Play/Cue) ---

    function startPlayback() {
        if (isPlaying) return;
        initAudio();
        if (audioContext.state === 'suspended') audioContext.resume();

        isPlaying = true;
        // If not resuming from a cue point, reset or continue? 
        // Standard DJ: Play continues from where it left off unless Cue is used.
        // For this simulator, we'll just continue if paused.
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

    // Play Button: Toggle
    playBtn.addEventListener('click', () => {
        if (isPlaying) stopPlayback();
        else startPlayback();
    });

    // Cue Button: Momentary Play (Standard DJ)
    // If Paused: Hold to play, Release to stop & return to cue (start).
    // If Playing: Stop & return to start.

    cueBtn.addEventListener('mousedown', () => {
        initAudio();
        if (isPlaying) {
            // If playing, stop and return to start
            stopPlayback();
            current16thNote = 0; // Return to start (Cue Point)
        } else {
            // If paused, play while held
            startPlayback();
        }
    });

    cueBtn.addEventListener('mouseup', () => {
        // If we started playback via Cue (and Play button isn't latched), stop on release
        // We can check if playBtn has 'active' class, but we just added it in startPlayback.
        // We need a way to know if it was a "Cue Hold" or "Play Toggle".
        // Simple logic: If Cue is released, and we are playing, stop.
        // UNLESS Play button was pressed *during* the hold (latching).
        // But for now, simple momentary behavior:

        // If we are playing, and Play button was NOT clicked (we can't easily track that without state),
        // let's just say: If Cue released, Stop.
        // But wait, if we pressed Cue while playing (to stop), we don't want to stop AGAIN (already stopped).

        if (isPlaying && !playBtn.classList.contains('active')) { // If not latched
            stopPlayback();
            current16thNote = 0;
        }
    });

    // To support "Latch", we'd need Play button to set a flag if pressed while Cue is held.
    // Let's keep it simple: Cue is momentary play. Play is toggle.
    // If you press Play, it stays. If you press Cue, it plays until release.

    // Nudge
    nudgePlus.addEventListener('mousedown', () => nudgeFactor = 0.1);
    nudgePlus.addEventListener('mouseup', () => nudgeFactor = 0);
    nudgePlus.addEventListener('mouseleave', () => nudgeFactor = 0);

    nudgeMinus.addEventListener('mousedown', () => nudgeFactor = -0.1);
    nudgeMinus.addEventListener('mouseup', () => nudgeFactor = 0);
    nudgeMinus.addEventListener('mouseleave', () => nudgeFactor = 0);

    // Hot Cues
    hotCueBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cueIdx = parseInt(btn.dataset.cue) - 1;
            if (hotCues[cueIdx] === null) {
                // Set Cue
                hotCues[cueIdx] = current16thNote;
                btn.classList.add('active');
            } else {
                // Jump to Cue
                current16thNote = hotCues[cueIdx];
                if (!isPlaying) startPlayback();
            }
        });
    });

    // Manual Loop
    loopInBtn.addEventListener('click', () => {
        loopStart = current16thNote;
        loopInBtn.classList.add('active');
    });

    loopOutBtn.addEventListener('click', () => {
        if (loopStart !== null) {
            loopEnd = current16thNote;
            isManualLooping = true;
            loopOutBtn.classList.add('active');
            loopExitBtn.classList.remove('active');
        }
    });

    loopExitBtn.addEventListener('click', () => {
        isManualLooping = false;
        loopStart = null;
        loopEnd = null;
        loopInBtn.classList.remove('active');
        loopOutBtn.classList.remove('active');
        loopExitBtn.classList.add('active');
        setTimeout(() => loopExitBtn.classList.remove('active'), 200);
    });

    // Sync
    syncBtn.addEventListener('click', () => {
        speedSlider.value = 1.0; // Reset Pitch
        bpmDisplay.innerText = "120 BPM";
        current16thNote = 0; // Reset Phase
        syncBtn.classList.add('active');
        setTimeout(() => syncBtn.classList.remove('active'), 200);
    });

    // VU Meter Logic
    function updateVUMeter() {
        requestAnimationFrame(updateVUMeter);
        if (!analyser) return;
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        const average = array.reduce((a, b) => a + b) / array.length;
        const level = average / 255; // 0 to 1

        vuSegments.forEach((seg, i) => {
            // Thresholds: 0.2, 0.4, 0.6, 0.8, 0.95
            const threshold = (i + 1) * 0.2;
            if (level > threshold) seg.classList.add('active');
            else seg.classList.remove('active');
        });
    }

    volumeSlider.addEventListener('input', (e) => {
        if (masterGain) masterGain.gain.value = e.target.value;
    });

    speedSlider.addEventListener('input', (e) => {
        const speed = e.target.value;
        vinylRecord.style.animationDuration = `${1.8 / speed}s`;
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

    // Knob Logic
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

    setupKnob(eqHighKnob, (val) => { if (eqHigh) eqHigh.gain.value = (val - 0.5) * 40; });
    setupKnob(eqMidKnob, (val) => { if (eqMid) eqMid.gain.value = (val - 0.5) * 40; });
    setupKnob(eqLowKnob, (val) => { if (eqLow) eqLow.gain.value = (val - 0.5) * 40; });
    setupKnob(gainKnob, (val) => { if (inputGain) inputGain.gain.value = val * 2; }); // Gain 0-2x

    setupKnob(fxCrushKnob, (val) => {
        if (bitcrusher) bitcrusher.curve = makeDistortionCurve(val * 400);
    });

    setupKnob(fxDelayKnob, (val) => {
        if (delayGain) delayGain.gain.value = val;
    });

    setupKnob(fxReverbKnob, (val) => {
        if (reverbGain) reverbGain.gain.value = val * 2;
    });

    setupKnob(fxFilterKnob, (val) => {
        if (filterNode) {
            if (val < 0.45) {
                filterNode.type = 'lowpass';
                const freq = 20 + (val / 0.45) * 20000;
                filterNode.frequency.value = freq;
                filterNode.Q.value = 1;
            } else if (val > 0.55) {
                filterNode.type = 'highpass';
                const freq = 20 + ((val - 0.55) / 0.45) * 20000;
                filterNode.frequency.value = freq;
                filterNode.Q.value = 1;
            } else {
                filterNode.type = 'allpass';
                filterNode.frequency.value = 20000;
            }
        }
    });

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
            const r = barHeight + (25 * (i / bufferLength));
            const g = 250 * (i / bufferLength);
            const b = 50;
            canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
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

    function createScratchSound(velocity) {
        if (!audioContext) return;
        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
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
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioContext.currentTime + 0.1);
    }

    // --- Custom Cursor Logic ---
    const cursor = document.querySelector('.custom-cursor');
    const hoverElements = document.querySelectorAll('a, button, .te-knob, .te-fader, .te-pad, .faq-question, input, .gallery-item');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    // --- Text Scramble Effect ---
    const scrambleElements = document.querySelectorAll('[data-scramble]');
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                scrambleText(entry.target);
                scrambleObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    scrambleElements.forEach(el => scrambleObserver.observe(el));

    function scrambleText(element) {
        let iterations = 0;
        const originalText = element.dataset.scramble;
        const interval = setInterval(() => {
            element.innerText = originalText.split("")
                .map((letter, index) => {
                    if (index < iterations) return originalText[index];
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("");

            if (iterations >= originalText.length) clearInterval(interval);
            iterations += 1 / 3;
        }, 30);
    }

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    // Open the first item by default
    if (faqItems.length > 0) {
        faqItems[0].classList.add('faq-open');
    }

    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            // Check if this item is currently open
            const isOpen = item.classList.contains('faq-open');

            // Close all items
            faqItems.forEach(i => i.classList.remove('faq-open'));

            // If it wasn't open, open it (toggle behavior)
            if (!isOpen) {
                item.classList.add('faq-open');
            }
        });
    });

    // --- Step-Based Carousel with Auto-Flip & Drag ---
    const track = document.querySelector('.carousel-track');

    if (track) {
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID;
        let autoPlayInterval;

        const getPositionX = (event) => {
            return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
        }

        const touchStart = (index) => {
            return function (event) {
                isDragging = true;
                startPos = getPositionX(event);
                animationID = requestAnimationFrame(animation);
                track.style.cursor = 'grabbing';
                clearInterval(autoPlayInterval); // Pause auto-play on interaction
            }
        }

        const touchEnd = () => {
            isDragging = false;
            cancelAnimationFrame(animationID);
            track.style.cursor = 'grab';

            const movedBy = currentTranslate - prevTranslate;

            // Threshold to trigger slide
            if (movedBy < -50) {
                moveNext();
            } else if (movedBy > 50) {
                movePrev();
            } else {
                // Snap back if didn't move enough
                track.style.transform = 'translateX(0)';
            }

            currentTranslate = 0;
            prevTranslate = 0;

            // Restart auto-play
            startAutoPlay();
        }

        const touchMove = (event) => {
            if (isDragging) {
                const currentPosition = getPositionX(event);
                currentTranslate = prevTranslate + currentPosition - startPos;
            }
        }

        // --- Click to Flip (User Request) ---
        const teamCards = document.querySelectorAll('.team-card');
        teamCards.forEach(card => {
            card.addEventListener('click', () => {
                // Toggle flipped class
                card.classList.toggle('flipped');
            });
            // Optional: Remove hover effect if click is preferred? 
            // The user said "on hover clicks should flip" is ambiguous. 
            // "Upon hovering, clicks should flip" -> implies hover does nothing?
            // "Check that they don't get cut off on flip"
            // Usually keeping hover + click is safe.
        });

        // --- Arrow Navigation ---
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn && nextBtn) {
            const getScrollAmount = () => {
                const firstCard = track.querySelector('.team-card');
                return firstCard ? (firstCard.offsetWidth + 24) : 320; // card width + gap (24px)
            };

            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
            });

            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            });
        }

        const animation = () => {
            if (isDragging) {
                track.style.transform = `translateX(${currentTranslate}px)`;
                requestAnimationFrame(animation);
            }
        }

        // Event Listeners
        track.addEventListener('touchstart', touchStart(0));
        track.addEventListener('touchend', touchEnd);
        track.addEventListener('touchmove', touchMove);

        track.addEventListener('mousedown', touchStart(0));
        track.addEventListener('mouseup', touchEnd);
        track.addEventListener('mouseleave', () => {
            if (isDragging) touchEnd();
        });
        track.addEventListener('mousemove', touchMove);

        // Prevent context menu on long press
        window.oncontextmenu = function (event) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        const moveNext = () => {
            const cards = track.querySelectorAll('.team-card');
            if (cards.length === 0) return;

            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const gap = 30;
            const moveAmount = cardWidth + gap;

            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${moveAmount}px)`;

            track.addEventListener('transitionend', () => {
                track.style.transition = 'none';
                track.style.transform = 'translateX(0)';
                track.appendChild(firstCard);
            }, { once: true });
        };

        const movePrev = () => {
            const cards = track.querySelectorAll('.team-card');
            if (cards.length === 0) return;

            const lastCard = cards[cards.length - 1];
            const cardWidth = cards[0].offsetWidth;
            const gap = 30;
            const moveAmount = cardWidth + gap;

            // Move last card to front instantly
            track.style.transition = 'none';
            track.prepend(lastCard);
            track.style.transform = `translateX(-${moveAmount}px)`;

            // Force reflow
            void track.offsetWidth;

            // Animate to 0
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = 'translateX(0)';
        };

        const startAutoPlay = () => {
            clearInterval(autoPlayInterval);
            // autoPlayInterval = setInterval(moveNext, 3500); // Disabled Auto-Scroll as requested
        }

        // --- Musical Note Animation on Click ---
        document.addEventListener('click', (e) => {
            // Create multiple notes for a "burst" effect on ANY click
            const noteCount = 3;
            for (let i = 0; i < noteCount; i++) {
                setTimeout(() => {
                    createMusicalNote(e.clientX, e.clientY);
                }, i * 100); // Stagger them slightly
            }
        });
        function createMusicalNote(x, y) {
            const note = document.createElement('span');
            note.classList.add('musical-note');

            const notes = ['♪', '♫', '♩', '♬', '♭', '♮', '♯'];
            note.innerText = notes[Math.floor(Math.random() * notes.length)];

            // Randomize styles
            const colors = ['var(--primary-color)', 'var(--secondary-color)', '#fff', '#ff8fa3', '#9d7bf5'];
            note.style.color = colors[Math.floor(Math.random() * colors.length)];

            // Random offset to make them spread out
            const offsetX = (Math.random() - 0.5) * 40;
            const offsetY = (Math.random() - 0.5) * 20;

            note.style.left = `${x + offsetX}px`;
            note.style.top = `${y + offsetY}px`;

            // Random rotation for the animation
            const rotation = (Math.random() - 0.5) * 60; // -30 to +30 deg
            note.style.setProperty('--rotation', `${rotation}deg`);

            document.body.appendChild(note);

            // Clean up
            setTimeout(() => {
                note.remove();
            }, 1000);
        }
    }
});
