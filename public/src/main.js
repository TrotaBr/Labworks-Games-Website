import * as THREE from 'three';
import { LoadGLTFByPath } from './Helpers/ModelHelper.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';





const SCREEN_MESH_NAME = "ClickTarget";
const TEAM_MESH_NAME = "TeamTrigger"; 
const INSPECT_POS = new THREE.Vector3(14.850, -0.550, 5.775);
const INSPECT_ROT = new THREE.Euler(0, 0, 0, 'YXZ');


const TEAM_GRID_CONFIG = {
    columns: 4,
    spacingX: .5,
    spacingY: .6,
    scale: 0.0013,

    
    gridPosition: new THREE.Vector3(.6, .2, 0), 
    gridRotation: new THREE.Euler(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(180)),        

    
    
    inspectPosition: new THREE.Vector3(.6, .4, 0),
    inspectRotation: new THREE.Euler(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), THREE.MathUtils.degToRad(180)),      
    inspectScale: 0.002,    
};


const TEAM_MEMBERS = [
    { name: "Volx64", role: "Lead Developer", desc: "Lead Developer across all Labworks Games projects. He has been the driving force behind the original Labworks mod and both iterations of the Version Control series.", img: "/images/team/volx.jpg" },
    { name: "Evro", role: "Technical Developer", desc: "Technical Developer specializing in the inner workings for Labworks Games. He has played a key role in the Labworks mod and the development of both Version Control projects.", img: "/images/team/evro.jpg" },
    { name: "Garebeu", role: "Lead Art Director", desc: "Art Director, 3D Modeler, and responsible on the story Version Control (The Game) and Version Control (The Mod). Also made this website 👍", img: "/images/team/Garebeu.png" },
    { name: "Jerbinstein", role: "Level Designer", desc: "Level Designer and Narrative Developer for Version Control (The Game), and was the original voice behind the Developer in the first Version Control mod.", img: "/images/team/jerb.jpg" },
    { name: "SegaTitan", role: "Voice Actor", desc: "The primary voice actor for the Version Control game, bringing the Developer character to life for this standalone experience.", img: "/images/team/segatitan.gif" },
    { name: "KadenZombie8", role: "Composer", desc: "Composer and Developer who created the BIMOS Interaction System. Currently crafting the original soundtrack for Version Control.", img: "/images/team/Pooey.png" },
    { name: "Zaxoosh", role: "Community Manager", desc: "Community Manager and Developer who helped manage the Labworks community after its release.", img: "/images/team/zax.jpg" }
];

const GAME_CONFIG = {
    "GameCase": {
        title: "Version Control",
        subtitle: "The Sequel",
        desc: "The sequel to the award-winning 2024 BONEJAM mod of the same name, Version Control returns with a new storyline set in the same universe, expanding on its experimental physics, narrative focus, and self-aware comedic narration.",
        genre: "Narrative Adventure",
        release: "Coming Soon",
        platform: "Steam / Meta Quest",
        storeUrl: "https://store.steampowered.com/app/4187070/Version_Control/",
        offsetPos: new THREE.Vector3(0, 0, 0),
        offsetRot: new THREE.Euler(0, 0, 0)
    },
    "GameCoverVC": {
        title: "Version Control",
        subtitle: "The Mod",
        desc: "Version Control is a Stanley Parable-inspired short map made for BONEJAM. Filled with multiple jokes and references, Version Control has you playing as a playtester through an unfinished map, being shown along the way by the narrator developer. The less you know the better!",
        genre: "Narrative Adventure",
        release: "September 2024",
        platform: "Bonelab",
        storeUrl: "https://mod.io/g/bonelab/m/version-control",
        offsetPos: new THREE.Vector3(-1.6, 0, 2.3),
        offsetRot: new THREE.Euler(0, 0, 0)
    },
    "GameCoverLabworks": {
        title: "Labworks",
        subtitle: "Boneworks Port",
        desc: "Labworks is a mod for the game Bonelab that ports Boneworks (Previously a PC-exclusive), running natively on Quest 2.",
        genre: "Action Adventure",
        release: "October 2022",
        platform: "Bonelab",
        storeUrl: "https://mod.io/g/bonelab/m/boneworks",
        offsetPos: new THREE.Vector3(0, -2.4, 0),
        offsetRot: new THREE.Euler(0, 0, 0)
    }
};

const TARGETS = {
    TV: {
        name: SCREEN_MESH_NAME,
        position: new THREE.Vector3(-0.840, 1.260, -0.840),
        euler: new THREE.Euler(0, THREE.MathUtils.degToRad(46), 0, 'YXZ'),
        fov: 50,
        enablePointerEvents: true
    },
    GAME: {
        position: new THREE.Vector3(0.5, 1.1, 0.5),
        euler: new THREE.Euler(0, THREE.MathUtils.degToRad(-20), 0, 'YXZ'),
        fov: 40,
        enablePointerEvents: false
    },
    SHELF: {
        position: new THREE.Vector3(0.680, 1.620, -0.040),
        euler: new THREE.Euler(THREE.MathUtils.degToRad(-4), THREE.MathUtils.degToRad(0), 0, 'YXZ'),
        fov: 20,
        enablePointerEvents: true
    }
}





const loadingScreen = document.getElementById("loading-screen")
const loadingProgress = document.getElementById("loading-progress")
const loadingText = document.getElementById("loading-text")
const loadingManager = new THREE.LoadingManager()

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = Math.round((itemsLoaded / itemsTotal) * 100)
    if (loadingProgress) loadingProgress.style.width = progress + "%"
    if (loadingText) loadingText.textContent = "LOADING " + progress + "%"
}

loadingManager.onLoad = function () {
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add("hidden");
            loadingScreen.style.pointerEvents = "none"; 
        }
        initAudio();
    }, 500);
}

const scene = new THREE.Scene()
const sceneCSSBack = new THREE.Scene()
const sceneCSSFront = new THREE.Scene()

let renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#background'),
    antialias: true,
    alpha: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowType = THREE.PCFSoftShadowMap
renderer.setPixelRatio(window.devicePixelRatio)
renderer.toneMapping = THREE.NoToneMapping
renderer.toneMappingExposure = 1
renderer.useLegacyLights = false
renderer.setClearColor(0x000000, 0)
renderer.outputColorSpace = THREE.SRGBColorSpace

const webGLCanvas = document.querySelector('#background');
webGLCanvas.style.position = 'absolute';
webGLCanvas.style.zIndex = '1';
webGLCanvas.style.pointerEvents = 'auto';

let cssRendererBack = new CSS3DRenderer();
cssRendererBack.setSize(window.innerWidth, window.innerHeight);
cssRendererBack.domElement.style.position = 'absolute';
cssRendererBack.domElement.style.top = '0';
cssRendererBack.domElement.style.zIndex = '0';
cssRendererBack.domElement.style.pointerEvents = 'auto';
document.body.appendChild(cssRendererBack.domElement);

let cssRendererFront = new CSS3DRenderer();
cssRendererFront.setSize(window.innerWidth, window.innerHeight);
cssRendererFront.domElement.style.position = 'absolute';
cssRendererFront.domElement.style.top = '0';
cssRendererFront.domElement.style.zIndex = '100'; 
cssRendererFront.domElement.style.pointerEvents = 'none'; 
document.body.appendChild(cssRendererFront.domElement);

cssRendererFront.domElement.firstChild.style.pointerEvents = 'none';
cssRendererFront.domElement.firstChild.style.transformStyle = 'preserve-3d';

let cameraList = []
let camera
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
const rawMouse = new THREE.Vector2(); 

let currentFocusState = 'IDLE';
let isTransitioning = false
let transitionProgress = 0
const transitionSpeed = 0.02
let isManualMute = false;

let startPosition = new THREE.Vector3()
let endPosition = new THREE.Vector3()
let startQuaternion = new THREE.Quaternion()
let endQuaternion = new THREE.Quaternion()
let startFov = 75
let endFov = 75

const originalPosition = new THREE.Vector3()
const originalQuaternion = new THREE.Quaternion()
let originalFov = 75

let gameCases = [];
let activeGameCase = null;
const gameAnimSpeed = 0.05;


let teamCards = [];
let teamHitboxes = []; 
let isTeamVisible = false;
let activeTeamCard = null; 

const tvCssContainer = new THREE.Group();
const tempVec = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const tempScale = new THREE.Vector3();

let audioContext, clickBuffer, musicBuffer, ambienceBuffer, pooeyHappyBuffer;
let musicSource, ambienceSource, musicGain, ambienceGain
let audioInitialized = false
const MUSIC_VOLUME = .6
const AMBIENCE_VOLUME = 0.2
const FADE_TIME = 0.7
let isMutedByFocus = false





async function initAudio() {
    if (audioInitialized) return
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    async function loadSound(path) {
        const response = await fetch(path)
        const arrayBuffer = await response.arrayBuffer()
        return await audioContext.decodeAudioData(arrayBuffer)
    }

    try {
        clickBuffer = await loadSound('/sounds/click.mp3')
        musicBuffer = await loadSound('/sounds/music.mp3')
        ambienceBuffer = await loadSound('/sounds/ambience.mp3')
        
        pooeyHappyBuffer = await loadSound('/sounds/PooeyHappy.mp3') 
        musicGain = audioContext.createGain()
        ambienceGain = audioContext.createGain()
        musicGain.gain.value = MUSIC_VOLUME
        ambienceGain.gain.value = AMBIENCE_VOLUME
        musicGain.connect(audioContext.destination)
        ambienceGain.connect(audioContext.destination)
        startLoops()
        audioInitialized = true
    } catch (e) { console.warn("Audio error:", e); }
}

function startLoops() {
    musicSource = audioContext.createBufferSource()
    musicSource.buffer = musicBuffer
    musicSource.loop = true
    musicSource.connect(musicGain)
    ambienceSource = audioContext.createBufferSource()
    ambienceSource.buffer = ambienceBuffer
    ambienceSource.loop = true
    ambienceSource.connect(ambienceGain)
    musicSource.start()
    ambienceSource.start()
}

function playPooeySound() {
    if (!audioInitialized || !pooeyHappyBuffer) return
    const source = audioContext.createBufferSource()
    source.buffer = pooeyHappyBuffer
    source.connect(audioContext.destination)
    source.start()
}

function playClickSound() {
    if (!audioInitialized) return
    const source = audioContext.createBufferSource()
    source.buffer = clickBuffer
    source.playbackRate.value = 0.95 + Math.random() * 0.1
    const gainNode = audioContext.createGain()
    gainNode.gain.value = 1 + Math.random() * 0.2
    source.connect(gainNode)
    gainNode.connect(audioContext.destination)
    source.start()
}

function toggleAudioManually() {
    const btn = document.getElementById('audio-toggle');
    isManualMute = !isManualMute;

    if (isManualMute) {
        btn.classList.add('muted');
        fadeAudio(0, 0, 0.3); 
    } else {
        btn.classList.remove('muted');
        fadeAudio(MUSIC_VOLUME, AMBIENCE_VOLUME, 0.5); 
    }
    playClickSound();
}

document.getElementById('audio-toggle').addEventListener('click', toggleAudioManually);

function fadeAudio(targetMusicVolume, targetAmbienceVolume, duration = FADE_TIME) {
    if (!audioInitialized || !audioContext) return;

    const now = audioContext.currentTime;

    const musicTarget = Math.max(0.0001, targetMusicVolume);
    const ambienceTarget = Math.max(0.0001, targetAmbienceVolume);

    musicGain.gain.cancelScheduledValues(now);
    ambienceGain.gain.cancelScheduledValues(now);

    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    ambienceGain.gain.setValueAtTime(ambienceGain.gain.value, now);

    musicGain.gain.exponentialRampToValueAtTime(musicTarget, now + duration);
    ambienceGain.gain.exponentialRampToValueAtTime(ambienceTarget, now + duration);

    if (targetMusicVolume === 0) {
        musicGain.gain.setValueAtTime(0, now + duration + 0.01);
    }
}

function handleFocusLoss() {
    if (!audioInitialized) return;
    isMutedByFocus = true;
    fadeAudio(0, 0, 0.5);
}

function handleFocusGain() {
    if (!audioInitialized || !isMutedByFocus || isManualMute) return;
    isMutedByFocus = false;
    fadeAudio(MUSIC_VOLUME, AMBIENCE_VOLUME);
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) handleFocusLoss()
    else handleFocusGain()
})


let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0
let baseQuaternion = new THREE.Quaternion()
const offsetQuaternion = new THREE.Quaternion()
const tempEuler = new THREE.Euler(0, 0, 0, 'YXZ')
const smoothFactor = 0.01
const maxRotation = -0.1

injectHoloStyles();

LoadGLTFByPath(scene, loadingManager)
    .then(() => {
        retrieveListOfCameras(scene);
        setupTVScreen(scene);
        setupGameCases(scene);
    })
    .catch((error) => console.error('Error loading GLTF scene:', error))

function retrieveListOfCameras(scene) {
    scene.traverse(function (object) {
        if (object.isCamera) cameraList.push(object)
    })

    if (cameraList.length === 0) {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.set(0, 1.6, 3)
        scene.add(camera)
    } else {
        camera = cameraList[0]
    }

    updateCameraAspect(camera)
    originalPosition.copy(camera.position)
    originalQuaternion.copy(camera.quaternion)
    originalFov = camera.fov
    baseQuaternion.copy(camera.quaternion)
    animate()
}

function setupTVScreen(scene) {
    const screenMesh = scene.getObjectByName(SCREEN_MESH_NAME);
    if (!screenMesh) return;

    const maskMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0,
        blending: THREE.NoBlending,
        side: THREE.DoubleSide
    });
    screenMesh.material = maskMaterial;

    const div = document.createElement('div');
    div.style.width = '1920px';
    div.style.height = '1500px';
    div.style.backgroundColor = '#000';

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0px';
    iframe.src = '/html/tv_interface.html';
    div.appendChild(iframe);

    const cssObject = new CSS3DObject(div);
    cssObject.scale.set(0.0006, 0.0006, 0.0006);
    cssObject.position.set(-0.5, -0.12, -0.04);
    cssObject.rotation.x = -Math.PI / 2;
    cssObject.rotation.y = Math.PI / 2;
    cssObject.rotation.z = Math.PI;

    tvCssContainer.add(cssObject);
    sceneCSSBack.add(tvCssContainer);
}

function setupGameCases(scene) {
    Object.keys(GAME_CONFIG).forEach(name => {
        const gameMesh = scene.getObjectByName(name);
        if (!gameMesh) return;

        const config = GAME_CONFIG[name];
        const div = document.createElement('div');
        div.className = 'game-info-card';
        div.style.willChange = 'transform, opacity';

        div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <h1 style="margin: 0; font-size: 1.8em; text-transform: uppercase; letter-spacing: 2px;">${config.title}</h1>
                    </div>
                    <h3 style="margin: 5px 0 15px 0; font-weight: 300; color: #aaa; font-size: 0.9em;">${config.subtitle}</h3>
                    <p style="line-height: 1.5; color: #ddd; font-size: 0.85em; margin-bottom: 15px;">${config.desc}</p>
                    <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;" />
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8em; margin-bottom: 20px;">
                        <div><strong style="color: #888; font-size: 0.7em; text-transform: uppercase;">GENRE</strong><br/>${config.genre}</div>
                        <div><strong style="color: #888; font-size: 0.7em; text-transform: uppercase;">RELEASE</strong><br/>${config.release}</div>
                    </div>

                    <button onclick="window.open('${config.storeUrl}', '_blank')" 
                        style="width: 100%; padding: 12px; background: #fff; color: #000; border: none; border-radius: 4px; font-weight: bold; font-size: 0.8em; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; pointer-events: auto; transition: transform 0.1s active;">
                        VIEW ON STORE
                    </button>
                `;

                // --- UPDATED STYLES (Notice pointerEvents is now 'auto') ---
                Object.assign(div.style, {
                    width: '380px', 
                    padding: '25px', 
                    color: 'white', 
                    background: 'rgba(15, 15, 15, 0.98)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    borderLeft: '4px solid #fff',
                    borderRadius: '4px', 
                    fontFamily: "'Segoe UI', sans-serif", 
                    opacity: '0',
                    transition: 'opacity 0.4s ease', 
                    pointerEvents: 'auto' // Important!
                });

        const labelObject = new CSS3DObject(div);
        labelObject.scale.set(0.0005, 0.0005, 0.0005);
        labelObject.position.set(0.35, 0, 0);
        const cssGroup = new THREE.Group();
        cssGroup.add(labelObject);
        sceneCSSFront.add(cssGroup);

        gameCases.push({
            name, mesh: gameMesh, config, originalPos: gameMesh.position.clone(),
            originalRot: gameMesh.quaternion.clone(), cssGroup, infoCard: div
        });
    });
}

function updateCameraAspect(camera) {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    cssRendererBack.setSize(window.innerWidth, window.innerHeight)
    cssRendererFront.setSize(window.innerWidth, window.innerHeight)
    updateCameraAspect(camera)
})

window.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1
    const mouseY = (event.clientY / window.innerHeight) * 2 - 1
    targetY = mouseX * maxRotation
    targetX = mouseY * maxRotation

    rawMouse.x = event.clientX;
    rawMouse.y = event.clientY;
})


function onTeamCardClick(index) {
    const cardObj = teamCards[index];
    activeTeamCard = cardObj;

    cardObj.userData.isFlipped = false;

    const targetPos = TEAM_GRID_CONFIG.inspectPosition.clone();
    
    cardObj.userData.targetPos = targetPos;
    cardObj.userData.targetScale = TEAM_GRID_CONFIG.inspectScale;
    cardObj.userData.isInspecting = true;

    const instr = document.getElementById('flip-instruction');
    if(instr) {
        instr.style.opacity = '1';
        instr.classList.add('active');
    }

    teamCards.forEach((c, i) => {
        if(i !== index) c.element.style.opacity = '0.1';
    });
}

function closeTeamInspection() {
    if (!activeTeamCard) return;

    const instr = document.getElementById('flip-instruction');
    if(instr) {
        instr.style.opacity = '0';
        instr.classList.remove('active');
    }

    activeTeamCard.userData.isInspecting = false;
    activeTeamCard.userData.isFlipped = false; 
    activeTeamCard = null;
    
    teamCards.forEach(c => c.element.style.opacity = '1');
}

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    playClickSound();

    raycaster.setFromCamera(mouse, camera);


    if (isTeamVisible) {

        const teamIntersects = raycaster.intersectObjects(teamHitboxes);

        if (teamIntersects.length > 0) {
            const hit = teamIntersects[0].object;
            const index = hit.userData.id;
            

            if (activeTeamCard === teamCards[index]) {
                activeTeamCard.userData.isFlipped = !activeTeamCard.userData.isFlipped;
            } 

            else {
                if (activeTeamCard) closeTeamInspection();
                onTeamCardClick(index);
            }
        } else {

            if (activeTeamCard) {
                closeTeamInspection();
            } else {
                toggleTeamCards();
            }
        }
        return; 
    }

    const intersects = raycaster.intersectObjects(scene.children, true);
    

    const handleClickAway = () => {
        if (currentFocusState === 'GAME') {
            moveToTarget('SHELF');
        } else {
            moveToTarget('IDLE');
        }
    };

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        let foundTarget = null;
        let foundGameCaseData = null;

        while (obj) {

            if (obj.name === "Pooey") {
            playPooeySound();
            }

            if (obj.name === TEAM_MESH_NAME) {
                toggleTeamCards();
                return;
            }
            

            if (obj.name === TARGETS.TV.name) {
                foundTarget = 'TV';
            }
            const gameCaseData = gameCases.find(g => g.name === obj.name);
            if (gameCaseData) {
                foundTarget = 'GAME';
                foundGameCaseData = gameCaseData;
            }
            if (foundTarget) break;
            obj = obj.parent;
        }

        if (foundTarget) {
            if (currentFocusState === 'GAME' && foundTarget === 'GAME' && activeGameCase?.name === foundGameCaseData.name) {
                if (foundGameCaseData.config.storeUrl) {
                    window.open(foundGameCaseData.config.storeUrl, '_blank');
                    return;
                }
            }
            moveToTarget(foundTarget, foundGameCaseData);
        } else {
            handleClickAway();
        }
    } else {
        handleClickAway();
    }
});

window.addEventListener('keydown', (event) => {
    if (event.code === "Space") {
        if (activeTeamCard) {
            closeTeamInspection();
        } else {
            moveToTarget('IDLE');
            if (isTeamVisible) toggleTeamCards();
        }
    }
    if (event.code === "KeyT") {
        toggleTeamCards();
        playClickSound();
    }
});



function toggleTeamCards() {
    const setTVPointerEvents = (state) => {
        if (tvCssContainer.children.length > 0) {
            tvCssContainer.children[0].element.style.pointerEvents = state;
        }
    };

    if (isTeamVisible) {
        
        teamCards.forEach(card => {
            sceneCSSFront.remove(card);
            card.element.onclick = null;
        });
        
        teamHitboxes.forEach(box => {
            scene.remove(box);
            box.geometry.dispose();
            box.material.dispose();
        });
        teamHitboxes = [];
        teamCards = [];

        isTeamVisible = false;
        activeTeamCard = null;
        
        moveToTarget('IDLE'); 
        
        document.querySelector('#background').style.pointerEvents = 'auto'; 
        setTVPointerEvents('auto'); 
        cssRendererBack.domElement.style.pointerEvents = 'auto';
        cssRendererFront.domElement.style.pointerEvents = 'none'; 
        return;
    }

    
    setTVPointerEvents('none');
    cssRendererBack.domElement.style.pointerEvents = 'none';
    document.querySelector('#background').style.pointerEvents = 'auto'; 
    cssRendererFront.domElement.style.pointerEvents = 'none'; 

    const { columns, spacingX, spacingY, scale } = TEAM_GRID_CONFIG;
    const anchorPos = TEAM_GRID_CONFIG.gridPosition.clone();
    
    
    const hitboxGeo = new THREE.PlaneGeometry(320, 440);
    const hitboxMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        side: THREE.DoubleSide,
        visible: false 
    });

    TEAM_MEMBERS.forEach((member, i) => {
        const div = document.createElement('div');
        div.className = 'card';
        div.setAttribute('data-rarity', 'radiant rare');
        div.style.pointerEvents = 'none'; 
        div.style.cursor = 'default';

        
        div.innerHTML = `
            <div class="card__front">
                <div class="card__shine"></div>
                <div class="card__glare"></div>
                <div class="card__content">
                    <div style="height:100%; display:flex; flex-direction:column; justify-content:flex-end; padding:20px; box-sizing:border-box;">
                        <div style="background: rgba(0,0,0,0.7); padding: 10px; border-radius: 8px; text-align:center;">
                             <h2 style="margin:0; font-size: 24px; color: white; font-family:sans-serif;">${member.name}</h2>
                             <p style="margin:5px 0 0 0; font-size: 14px; color: #ccc; font-family:sans-serif;">${member.role}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card__back">
                <h2 style="margin:0 0 10px 0; color:#fff; font-family:sans-serif; border-bottom:1px solid #555; padding-bottom:10px;">${member.name}</h2>
                <h4 style="margin:0 0 20px 0; color:#aaa; font-family:sans-serif;">${member.role}</h4>
                <p style="color:#ddd; line-height:1.6; font-family:sans-serif; font-size:16px;">${member.desc}</p>
                <div style="margin-top:auto; font-size:12px; color:#666; text-align:center;">
                    Click again to flip back
                </div>
            </div>
        `;
        
        
        const frontFace = div.querySelector('.card__front');
        frontFace.style.backgroundImage = `url(${member.img})`;
        frontFace.style.backgroundSize = 'cover';
        frontFace.style.backgroundPosition = 'center';

        const cssObj = new CSS3DObject(div);
        
        
        const row = Math.floor(i / columns);
        const col = i % columns;
        const itemsInThisRow = Math.min(columns, TEAM_MEMBERS.length - (row * columns));
        const rowWidth = (itemsInThisRow - 1) * spacingX;
        const totalRows = Math.ceil(TEAM_MEMBERS.length / columns);
        const totalHeight = (totalRows - 1) * spacingY;
        const xOffset = (col * spacingX) - (rowWidth / 2);
        const yOffsetVal = -(row * spacingY) + (totalHeight / 2);

        const gridQuat = new THREE.Quaternion().setFromEuler(TEAM_GRID_CONFIG.gridRotation);
        const rightDir = new THREE.Vector3(1, 0, 0).applyQuaternion(gridQuat);
        const upDir = new THREE.Vector3(0, 1, 0).applyQuaternion(gridQuat);

        const finalPos = anchorPos.clone()
            .add(rightDir.clone().multiplyScalar(xOffset))
            .add(upDir.clone().multiplyScalar(yOffsetVal));

        cssObj.position.copy(finalPos);
        cssObj.rotation.copy(TEAM_GRID_CONFIG.gridRotation);
        cssObj.scale.set(scale, scale, scale);
        
        cssObj.userData = {
            originalPos: finalPos.clone(),
            originalRot: cssObj.quaternion.clone(),
            originalScale: scale,
            isInspecting: false,
            isFlipped: false
        };

        sceneCSSFront.add(cssObj);
        teamCards.push(cssObj);

        
        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.position.copy(finalPos);
        hitbox.quaternion.copy(TEAM_GRID_CONFIG.gridRotation);
        hitbox.scale.set(scale, scale, scale);
        hitbox.userData = { id: i }; 
        
        scene.add(hitbox);
        teamHitboxes.push(hitbox);
    });

    isTeamVisible = true;

    if (cssRendererFront.domElement.firstChild) {
        cssRendererFront.domElement.firstChild.style.pointerEvents = 'none';
    }
}

function updateHoloEffect() {
    teamCards.forEach(cssObj => {
        const el = cssObj.element;
        const rect = el.getBoundingClientRect();
        
        const isHovering = (
            rawMouse.x >= rect.left &&
            rawMouse.x <= rect.right &&
            rawMouse.y >= rect.top &&
            rawMouse.y <= rect.bottom
        );

        if (isHovering && !cssObj.userData.isFlipped) {
            const absoluteX = rawMouse.x - rect.left;
            const absoluteY = rawMouse.y - rect.top;
            
            const percentX = Math.round((absoluteX / rect.width) * 100);
            const percentY = Math.round((absoluteY / rect.height) * 100);
            
            const centerX = percentX - 50;
            const centerY = percentY - 50;

            cssObj.userData.hoverTilt = {
                x: centerY * 0.05, 
                y: -centerX * 0.05 
            };

            el.style.setProperty('--pointer-x', `${percentX}%`);
            el.style.setProperty('--pointer-y', `${percentY}%`);
            el.style.setProperty('--background-x', `${50 + (centerX * -1)}%`);
            el.style.setProperty('--background-y', `${50 + (centerY * -1)}%`);
            
            const hyp = Math.sqrt(centerX*centerX + centerY*centerY);
            el.style.setProperty('--hyp', hyp);
            el.style.setProperty('--holo-opacity', 1);
        } else {
            
            cssObj.userData.hoverTilt = { x: 0, y: 0 };
            el.style.setProperty('--holo-opacity', 0);
        }
    });
}

function injectHoloStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
       
        .card {
            width: 320px;
            height: 440px;
            position: relative;
            z-index: 999 !important; 
           
            transform-style: preserve-3d !important;
            cursor: pointer;
            background: transparent;

           
            --clip-borders: inset(2.8% 4% round 2.55% / 1.5%);
            --clip: inset( 9.85% 8% 52.85% 8% );
            --card-glow: hsla(0, 100%, 100%, 0.5);
            --foil: url("/images/grain.webp"); 
            --glitter: url("/images/glitter.png");
        }

       
        .card__front, .card__back {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
           
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            border-radius: 15px;
            overflow: hidden;
        }

        .card__front {
            background-color: #222;
            z-index: 2;
           
            transform: translateZ(1px);
        }

        .card__back {
           
            transform: rotateY(180deg) translateZ(1px);
            background: #1a1a1a;
            color: white;
            display: flex;
            flex-direction: column;
            padding: 30px;
            box-sizing: border-box;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
        }

        .card__content {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 5;
            pointer-events: none; 
        }

        .card__shine, .card__glare {
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            border-radius: 15px;
            z-index: 8;
            opacity: var(--holo-opacity, 0); 
            transition: opacity 0.3s ease;
            pointer-events: none !important;
        }
        .card__glare { z-index: 9; }

       
        .card[data-rarity="radiant rare"] .card__shine { clip-path: var(--clip-borders); }
        .card[data-rarity="radiant rare"] .card__shine:after { clip-path: var(--clip); }

       
        .card[data-rarity="radiant rare"] .card__shine {
            --barwidth: 1.2%;
            --space: 200px;
            --hue: 50;
            --imgsize: cover;
            
            background-image: 
                radial-gradient( farthest-corner ellipse at calc( ((var(--pointer-x)) * 0.5) + 25% ) calc( ((var(--pointer-y)) * 0.5) + 25% ), hsl(0, 0%, 95%) 20%, var(--card-glow) 130% ),
                repeating-linear-gradient( 45deg, hsl(0,0%,10%) 0% , hsl(0,0%,10%) 1% , hsl(0,0%,10%) var(--barwidth), hsl(0,0%,20%) calc( var(--barwidth) + 0.01% ) , hsl(0,0%,20%) calc( var(--barwidth) * 2 ), hsl(0,0%,35%) calc( var(--barwidth) * 2 + 0.01% ) , hsl(0,0%,35%) calc( var(--barwidth) * 3 ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 3 + 0.01% ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 4 ) , hsl(0,0%,50%) calc( var(--barwidth) * 4 + 0.01% ) , hsl(0,0%,50%) calc( var(--barwidth) * 5 ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 5 + 0.01% ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 6 ) , hsl(0,0%,35%) calc( var(--barwidth) * 6 + 0.01% ) , hsl(0,0%,35%) calc( var(--barwidth) * 7 ) , hsl(0,0%,20%) calc( var(--barwidth) * 7 + 0.01% ) , hsl(0,0%,20%) calc( var(--barwidth) * 8 ) , hsl(0,0%,10%) calc( var(--barwidth) * 8 + 0.01% ) , hsl(0,0%,10%) calc( var(--barwidth) * 9 ) , hsl(0,0%,0%) calc( var(--barwidth) * 9 + 0.01% ) , hsl(0,0%,0%) calc( var(--barwidth) * 10 ) ),
                repeating-linear-gradient( -45deg, hsl(0,0%,10%) 0% , hsl(0,0%,10%) 1% , hsl(0,0%,10%) var(--barwidth), hsl(0,0%,20%) calc( var(--barwidth) + 0.01% ) , hsl(0,0%,20%) calc( var(--barwidth) * 2 ), hsl(0,0%,35%) calc( var(--barwidth) * 2 + 0.01% ) , hsl(0,0%,35%) calc( var(--barwidth) * 3 ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 3 + 0.01% ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 4 ) , hsl(0,0%,50%) calc( var(--barwidth) * 4 + 0.01% ) , hsl(0,0%,50%) calc( var(--barwidth) * 5 ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 5 + 0.01% ) , hsl(0,0%,42.5%) calc( var(--barwidth) * 6 ) , hsl(0,0%,35%) calc( var(--barwidth) * 6 + 0.01% ) , hsl(0,0%,35%) calc( var(--barwidth) * 7 ) , hsl(0,0%,20%) calc( var(--barwidth) * 7 + 0.01% ) , hsl(0,0%,20%) calc( var(--barwidth) * 8 ) , hsl(0,0%,10%) calc( var(--barwidth) * 8 + 0.01% ) , hsl(0,0%,10%) calc( var(--barwidth) * 9 ) , hsl(0,0%,0%) calc( var(--barwidth) * 9 + 0.01% ) , hsl(0,0%,0%) calc( var(--barwidth) * 10 ) );
            background-size: cover, 210% 210%, 210% 210%;
            background-position: center, calc( ((var(--background-x) - 50%) * 1.5) + 50% ) calc( ((var(--background-y) - 50%) * 1.5) + 50% ), calc( ((var(--background-x) - 50%) * 1.5) + 50% ) calc( ((var(--background-y) - 50%) * 1.5) + 50% );
            background-blend-mode: exclusion, darken, color-dodge;
            filter: brightness(.5) contrast(2) saturate(1.75);
            mix-blend-mode: color-dodge;
        }

        .card[data-rarity="radiant rare"] .card__shine:after {
            content: "";
            background-image: var(--foil), repeating-linear-gradient( 55deg, hsl(3, 95%, 85%) calc(var(--space)*1), hsl(207, 100%, 84%) calc(var(--space)*2), hsl(29, 100%, 85%) calc(var(--space)*3), hsl(160, 100%, 86%) calc(var(--space)*4), hsl(309, 94%, 87%) calc(var(--space)*5), hsl(188, 95%, 85%) calc(var(--space)*6), hsl(3, 95%, 85%) calc(var(--space)*7) );
            background-size: var(--imgsize), 400% 100%;
            background-position: center, calc( ((var(--background-x) - 50%) * -2.5) + 50% ) calc( ((var(--background-y) - 50%) * -2.5) + 50% );
            filter: brightness(.6) contrast(3) saturate(2);
            mix-blend-mode: color-dodge;
            background-blend-mode: hard-light;
            position: absolute; top:0; left:0; width:100%; height:100%;
        }

        .card[data-rarity="radiant rare"] .card__shine:before {
            content: ""; z-index: 2; grid-area: 1/1;
            background-image: var(--glitter), radial-gradient( farthest-corner ellipse at calc( ((var(--pointer-x)) * 0.5) + 25% ) calc( ((var(--pointer-y)) * 0.5) + 25% ), hsla(0, 0%, 58%, 0.8) 10%, hsla(0, 0%, 20%, 0.9) 20%, hsla(0, 0%, 20%, 0.5) 50% );
            background-position: center;
            background-size: 15% 15%, 350% 350%;
            background-blend-mode: color-dodge;
            mix-blend-mode: overlay;
            filter: brightness(.66) contrast(2) saturate(.5);
            position: absolute; top:0; left:0; width:100%; height:100%;
        }

        .card[data-rarity="radiant rare"] .card__glare {
            background-image: radial-gradient( farthest-corner circle at var(--pointer-x) var(--pointer-y), hsla(0, 0%, 100%, 0.33) 0%, hsl(0, 0%, 25%) 110% );
            filter: brightness(1) contrast(1.5);
            mix-blend-mode: hard-light;
        }
    `;
    document.head.appendChild(style);
}





function moveToTarget(targetKey, specificGameData = null) {
    if (currentFocusState === targetKey && !specificGameData) return;
    if (isTransitioning) return;

    if (targetKey === 'GAME') {
        activeGameCase = specificGameData;
    } else {
        activeGameCase = null;
    }

    startPosition.copy(camera.position);
    startQuaternion.copy(camera.quaternion);
    startFov = camera.fov;

    if (targetKey === 'IDLE') {
        endPosition.copy(originalPosition);
        endQuaternion.copy(originalQuaternion);
        endFov = originalFov;
    } else {
        const targetConfig = TARGETS[targetKey];
        endPosition.copy(targetConfig.position);
        const q = new THREE.Quaternion().setFromEuler(targetConfig.euler);
        endQuaternion.copy(q);
        endFov = targetConfig.fov;
    }

    gameCases.forEach(gc => {
        if (activeGameCase && gc.name === activeGameCase.name && targetKey === 'GAME') {
            gc.infoCard.style.opacity = '1';
        } else {
            gc.infoCard.style.opacity = '0';
        }
    });

    const bg = document.querySelector('#background');
    if (targetKey === 'TV') {
        bg.style.pointerEvents = 'none';
        cssRendererBack.domElement.style.pointerEvents = 'auto';
    } else {
        bg.style.pointerEvents = 'auto';
        cssRendererBack.domElement.style.pointerEvents = 'none';
    }

    currentFocusState = targetKey;
    transitionProgress = 0;
    isTransitioning = true;
}

function setupFlipInstruction() {
    const div = document.createElement('div');
    div.id = 'flip-instruction';
    div.innerHTML = "Click the card <br> to flip it"; 
    
    Object.assign(div.style, {
        position: 'fixed',
        top: '50%',
        left: '15%',
        transform: 'translateY(-50%)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        pointerEvents: 'none', 
        opacity: '0',          
        transition: 'opacity 0.5s ease',
        zIndex: '1001',
        lineHeight: '1.8'
    });
    
    document.body.appendChild(div);
}
setupFlipInstruction();

window.addEventListener('message', (event) => {
    if (event.data === 'zoomOut' && currentFocusState === 'TV') {
        moveToTarget('IDLE');
        return;
    }
    if (event.data.type === 'toggleTeam') {
        if (!isTeamVisible) { 
            toggleTeamCards();
        }
        return;
    }
    if (event.data.type === 'cameraMove') {
        const { position, rotation, fov } = event.data.detail;
        startPosition.copy(camera.position);
        startQuaternion.copy(camera.quaternion);
        startFov = camera.fov;
        endPosition.set(position.x, position.y, position.z);
        const customEuler = new THREE.Euler(
            THREE.MathUtils.degToRad(rotation.x),
            THREE.MathUtils.degToRad(rotation.y),
            THREE.MathUtils.degToRad(rotation.z),
            'YXZ'
        );
        endQuaternion.setFromEuler(customEuler);
        endFov = fov || 50;
        currentFocusState = 'TV';
        document.querySelector('#background').style.pointerEvents = 'none';
        cssRendererBack.domElement.style.pointerEvents = 'auto';
        transitionProgress = 0;
        isTransitioning = true;
    }
});

function animate() {
    requestAnimationFrame(animate)

    currentX += (targetX - currentX) * smoothFactor
    currentY += (targetY - currentY) * smoothFactor

    if (isTransitioning) {
        transitionProgress += transitionSpeed
        const t = 1 - Math.pow(1 - transitionProgress, 3)
        camera.position.lerpVectors(startPosition, endPosition, t)
        camera.quaternion.copy(startQuaternion).slerp(endQuaternion, t)
        camera.fov = THREE.MathUtils.lerp(startFov, endFov, t)
        camera.updateProjectionMatrix()
        if (transitionProgress >= 1) {
            isTransitioning = false
            tempEuler.set(currentX, currentY, 0)
            offsetQuaternion.setFromEuler(tempEuler)
            baseQuaternion.copy(camera.quaternion).multiply(offsetQuaternion.invert())
        }
    } else {
        tempEuler.set(currentX, currentY, 0)
        offsetQuaternion.setFromEuler(tempEuler)
        camera.quaternion.copy(baseQuaternion).multiply(offsetQuaternion)
    }

    if (isTeamVisible) {
        updateHoloEffect();
        
        teamCards.forEach((card, i) => {
            const hitbox = teamHitboxes[i];

            if (card.userData.isInspecting) {
                
                card.position.lerp(card.userData.targetPos, 0.1);
                const s = THREE.MathUtils.lerp(card.scale.x, card.userData.targetScale, 0.1);
                card.scale.set(s, s, s);

                
                const baseRot = TEAM_GRID_CONFIG.inspectRotation;
                const tilt = card.userData.hoverTilt || { x: 0, y: 0 };
                
                
                const flipOffset = card.userData.isFlipped ? Math.PI : 0;

                card.rotation.x = THREE.MathUtils.lerp(card.rotation.x, baseRot.x + THREE.MathUtils.degToRad(tilt.x), 0.2);
                
                
                card.rotation.y = THREE.MathUtils.lerp(card.rotation.y, baseRot.y + THREE.MathUtils.degToRad(tilt.y) + flipOffset, 0.15);
                
                card.rotation.z = baseRot.z; 
                
            } else {
                
                card.position.lerp(card.userData.originalPos, 0.1);
                card.quaternion.slerp(card.userData.originalRot, 0.1);
                const s = THREE.MathUtils.lerp(card.scale.x, card.userData.originalScale, 0.1);
                card.scale.set(s, s, s);
            }

            
            if (hitbox) {
                hitbox.position.copy(card.position);
                hitbox.quaternion.copy(card.quaternion);
                hitbox.scale.copy(card.scale);
            }
        });
    }

    
    gameCases.forEach(gc => {
        const isSelected = activeGameCase && activeGameCase.name === gc.name;
        if (isSelected && currentFocusState === 'GAME') {
            const targetPos = INSPECT_POS.clone().add(gc.config.offsetPos);
            const targetRotEuler = new THREE.Euler(
                INSPECT_ROT.x + gc.config.offsetRot.x,
                INSPECT_ROT.y + gc.config.offsetRot.y,
                INSPECT_ROT.z + gc.config.offsetRot.z,
                'YXZ'
            );
            const targetRot = new THREE.Quaternion().setFromEuler(targetRotEuler);
            gc.mesh.position.lerp(targetPos, gameAnimSpeed);
            gc.mesh.quaternion.slerp(targetRot, gameAnimSpeed);
            gc.mesh.updateMatrixWorld();
            gc.mesh.matrixWorld.decompose(tempVec, tempQuat, tempScale);
            gc.cssGroup.position.copy(tempVec);
            gc.cssGroup.quaternion.copy(tempQuat);
        } else {
            gc.mesh.position.lerp(gc.originalPos, gameAnimSpeed);
            gc.mesh.quaternion.slerp(gc.originalRot, gameAnimSpeed);
        }
    });

    const tvMesh = scene.getObjectByName(SCREEN_MESH_NAME);
    if (tvMesh) {
        tvMesh.updateMatrixWorld();
        tvMesh.matrixWorld.decompose(tempVec, tempQuat, tempScale);
        tvCssContainer.position.copy(tempVec);
        tvCssContainer.quaternion.copy(tempQuat);
        tvCssContainer.scale.copy(tempScale);
    }

    cssRendererBack.render(sceneCSSBack, camera)
    renderer.render(scene, camera)
    cssRendererFront.render(sceneCSSFront, camera)
}