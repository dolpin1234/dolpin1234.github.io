const introScript = [
    "2050년",
    "우주의 균형을 지탱하던 태양계는 알 수 없는 힘에 의해 흩어지고 말았다.",
    "그 결과 우주에는 끝없는 어둠과",
    "",
    "작고 귀여운 달만이 그 자리를 지키고 있었다.",
    "달은 \"모든 행성을 다시 합치면 우주의 평화가 돌아올거야!\" 라고 외치며",
    "행성을 모아 새로운 태양을 만들기 위한 여정을 시작한다.",
    "당신은 이 여정의 유일한 조종사.",
    "마우스를 이용해 행성을 쏘아올리고",
    "같은 행성을 합쳐 진화시키는 것만이",
    "우주의 운명을 되돌릴 수 있는 유일한 방법이다.",
    ""
];

let currentLine = 0;
let currentChar = 0;
const subtitle = document.getElementById("subtitle");
const gameTitle = document.getElementById("gameTitle");
const startButton = document.getElementById("startButton");
const typingSound = document.getElementById("typingSound");
const moonSound = document.getElementById("moonSound");
const titleSound = document.getElementById("titleSound");

let audioInitialized = false;

function initializeAudio() {
    if (!audioInitialized) {
        // 오디오 요소들을 미리 로드
        if (typingSound) typingSound.load();
        if (moonSound) moonSound.load();
        if (titleSound) titleSound.load();
        audioInitialized = true;
    }
}

function typeNextChar() {
    if (currentLine >= introScript.length) {
        if (typingSound) typingSound.pause();
        startButton.style.display = "inline-block";
        gameTitle.style.display = "block";
        if (titleSound) {
            titleSound.currentTime = 0;
            titleSound.play().catch(e => console.log("오디오 재생 실패:", e));
        }
        return;
    }

    const line = introScript[currentLine];
    
    if (currentChar === 0) {
        if (typingSound) {
            typingSound.currentTime = 0;
            typingSound.play().catch(e => console.log("오디오 재생 실패:", e));
        }
    }

    if (currentChar < line.length) {
        subtitle.innerHTML += line[currentChar];
        currentChar++;
        setTimeout(typeNextChar, 50);
    } else {
        if (typingSound) typingSound.pause();
        if (currentLine === 3) {
            initMoonAnimation();
            if (moonSound) {
                moonSound.currentTime = 0;
                moonSound.play().catch(e => console.log("오디오 재생 실패:", e));
            }
        }
        subtitle.innerHTML += "<br/>";
        currentLine++;
        currentChar = 0;
        setTimeout(() => {
            subtitle.innerHTML = '';
            typeNextChar();
        }, 1350);
    }
}

// 페이지 로드 시 오디오 초기화
window.addEventListener('load', () => {
    initializeAudio();
    // 사용자 상호작용을 기다린 후 타이핑 시작
    document.addEventListener('click', () => {
        setTimeout(typeNextChar, 1000);
    }, { once: true });
});

let moonScene, moonCamera, moonRenderer, moonMesh;

function initMoonAnimation() {
    moonScene = new THREE.Scene();
    moonCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    moonCamera.position.z = 3;

    moonRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    moonRenderer.setSize(200, 200);
    document.getElementById('moonCanvasContainer').appendChild(moonRenderer.domElement);

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const texture = new THREE.TextureLoader().load('textures/moon.png');
    const material = new THREE.MeshStandardMaterial({ map: texture });
    moonMesh = new THREE.Mesh(geometry, material);
    moonScene.add(moonMesh);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    moonScene.add(light);

    animateMoon();
}

function animateMoon() {
    requestAnimationFrame(animateMoon);
    moonMesh.rotation.y += 0.01;
    moonRenderer.render(moonScene, moonCamera);
}

function startGame() {
    const intro = document.getElementById('introScreen');
    const gameContainer = document.getElementById('gameContainer');
    
    // 게임 컨테이너를 먼저 표시
    gameContainer.style.display = 'block';
    
    // 인트로 화면 페이드 아웃
    intro.style.animation = "fadeOut 1s forwards";
    
    setTimeout(() => {
        // 인트로 화면 숨기기
        intro.style.display = 'none';
        
        // 게임 초기화
        if (typeof checkLibrariesAndInit === 'function') {
            checkLibrariesAndInit();
        } else {
            console.error('게임 초기화 함수를 찾을 수 없습니다.');
        }
    }, 1000);
}
