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
    const statusLight = document.getElementById('statusLight');

    // EQ Knobs
    const eqHighKnob = document.getElementById('eqHigh');
    const eqMidKnob = document.getElementById('eqMid');
    const eqLowKnob = document.getElementById('eqLow');

    let isPlaying = false;
    let audioContext;
    let masterGain;
    let deckAGain;
    let deckBGain;

    // EQ Nodes
    let eqHigh, eqMid, eqLow;

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

            // EQ Chain
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

            // Connect EQ: Low -> Mid -> High -> Master
            eqLow.connect(eqMid);
            eqMid.connect(eqHigh);
            eqHigh.connect(masterGain);
            masterGain.connect(audioContext.destination);

            // Decks connect to EQ Low
            deckAGain = audioContext.createGain();
            deckBGain = audioContext.createGain();

            deckAGain.connect(eqLow);
            deckBGain.connect(eqLow);

            // Initial Mix
            updateCrossfader();

            // Scratch Setup
            setupScratch();
        }
    }

    function setupScratch() {
        // Create a buffer with pink noise for better scratch sound
        const bufferSize = audioContext.sampleRate * 2;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for gain loss
        }
        // Actually just use white noise filtered
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
        // High frequency for metallic sound
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
        // Beat A: Old School Hip Hop (90 BPM feel)
        // Kick: 1, 3 (with swing)
        // Snare: 2, 4
        // HiHat: 8th notes

        // Beat B: House / Techno (4/4)
        // Kick: 1, 2, 3, 4
        // Snare: -
        // HiHat: Off-beats

        // --- Deck A (Hip Hop) ---
        if (beatNumber % 4 === 0) {
            playKick(time, deckAGain); // Beat 1
            playBass(time, 55, deckAGain); // A1
        }
        if (beatNumber % 4 === 2) {
            playSnare(time, deckAGain); // Beat 3 (Snare)
        }
        if (beatNumber % 4 === 1 || beatNumber % 4 === 3) {
            // Syncopated kicks for hip hop feel
            if (Math.random() > 0.5) playKick(time + 0.25, deckAGain);
        }
        // HiHats every 8th
        playHiHat(time, deckAGain);
        playHiHat(time + 0.25, deckAGain);

        // --- Deck B (House/Techno) ---
        playKick(time, deckBGain); // 4-on-the-floor
        if (beatNumber % 4 === 0) {
            playBass(time, 40, deckBGain); // Low E
        } else if (beatNumber % 4 === 2) {
            playBass(time, 80, deckBGain); // Octave up
        }
        playHiHat(time + 0.25, deckBGain); // Off-beat open hat feel
    }

    function scheduler() {
        while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
            scheduleNote(beatCount, nextNoteTime);
            nextNoteTime += 60.0 / (tempo * speedSlider.value); // Adjust for pitch slider
            beatCount = (beatCount + 1) % 4;
        }
        timerID = requestAnimationFrame(scheduler);
    }

    function startPlayback() {
        if (isPlaying) return;
        initAudio();

        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        isPlaying = true;
        beatCount = 0;
        nextNoteTime = audioContext.currentTime + 0.1;

        playBtn.classList.add('active');
        vinylRecord.classList.add('spinning');
        toneArm.classList.add('active');
        statusLight.classList.add('active');

        scheduler();
    }

    function stopPlayback() {
        isPlaying = false;
        cancelAnimationFrame(timerID);

        playBtn.classList.remove('active');
        vinylRecord.classList.remove('spinning');
        toneArm.classList.remove('active');
        statusLight.classList.remove('active');
    }

    playBtn.addEventListener('click', () => {
        if (isPlaying) stopPlayback();
        else startPlayback();
    });

    // Cue Button (Hold to Play)
    cueBtn.addEventListener('mousedown', () => {
        if (!isPlaying) {
            startPlayback();
            // Cue mode: only play while held, so we don't toggle UI state fully or we do?
            // Let's just start playback but mark it as temporary
        }
    });

    cueBtn.addEventListener('mouseup', () => {
        if (isPlaying && !playBtn.classList.contains('active')) {
            // If it was started by Cue (playBtn not 'active' logic is tricky here, let's simplify)
            // Actually, if we just started it, stop it.
            stopPlayback();
        } else if (isPlaying) {
            // If it was already playing, Cue usually stops and resets to cue point.
            stopPlayback();
        }
    });

    // Volume
    volumeSlider.addEventListener('input', (e) => {
        if (masterGain) masterGain.gain.value = e.target.value;
    });

    // Pitch Control
    speedSlider.addEventListener('input', (e) => {
        const speed = e.target.value;
        vinylRecord.style.animationDuration = `${2 / speed}s`;
        // The scheduler already uses speedSlider.value for tempo adjustment
    });

    // Crossfader
    function updateCrossfader() {
        if (!deckAGain || !deckBGain) return;
        const val = parseFloat(crossfader.value);
        // Simple linear crossfade
        // val = 0 -> Deck A = 1, Deck B = 0
        // val = 1 -> Deck A = 0, Deck B = 1
        deckAGain.gain.value = 1 - val;
        deckBGain.gain.value = val;
    }
    crossfader.addEventListener('input', updateCrossfader);

    // Knob Logic
    function setupKnob(knob, filterNode, type) {
        let isDraggingKnob = false;
        let startY;
        let startVal;

        knob.addEventListener('mousedown', (e) => {
            isDraggingKnob = true;
            startY = e.clientY;
            // Get current rotation
            const transform = knob.style.transform || 'rotate(0deg)';
            startVal = parseInt(transform.replace('rotate(', '').replace('deg)', '')) || 0;
            document.body.style.cursor = 'ns-resize';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDraggingKnob) return;
            e.preventDefault();
            const delta = startY - e.clientY;
            let newVal = startVal + delta * 2;
            newVal = Math.max(-135, Math.min(135, newVal)); // Limit rotation

            knob.style.transform = `rotate(${newVal}deg)`;

            // Map rotation (-135 to 135) to gain (-20dB to 20dB)
            if (filterNode) {
                const gain = (newVal / 135) * 20;
                filterNode.gain.value = gain;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingKnob) {
                isDraggingKnob = false;
                document.body.style.cursor = '';
            }
        });
    }

    // Initialize Knobs when audio is ready (or just setup listeners now and link later)
    // We need to link them after initAudio.
    // Let's wrap setupKnob calls in initAudio or check for existence.
    // Actually, we can setup listeners now and check `eqHigh` inside the listener.

    [eqHighKnob, eqMidKnob, eqLowKnob].forEach((knob, i) => {
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

            if (audioContext) {
                const gain = (newVal / 135) * 20;
                if (i === 0 && eqHigh) eqHigh.gain.value = gain;
                if (i === 1 && eqMid) eqMid.gain.value = gain;
                if (i === 2 && eqLow) eqLow.gain.value = gain;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDraggingKnob) {
                isDraggingKnob = false;
                document.body.style.cursor = '';
            }
        });
    });

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

        // Scratch Sound
        const velocity = Math.abs(delta) * 100;
        if (velocity > 1) {
            createScratchSound(velocity);
        }

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
