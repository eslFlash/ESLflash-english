// === GET TOPIC FROM URL ===
const params = new URLSearchParams(window.location.search);
const topic = params.get("topic");

if (!topic) {
    document.body.innerHTML = "<h2>No grammar topic selected</h2>";
    throw new Error("No topic provided");
}

// === LOAD JSON ===
fetch(`grammar/${topic}.json`)
    .then(res => res.json())
    .then(data => startGame(data))
    .catch(err => {
        document.body.innerHTML = "<h2>Grammar file not found</h2>";
        console.error(err);
    });

function startGame(sentences) {
    let score = 0;
    let currentIndex = 0;
    let resetCount = 0;

    // Random 10 sentences
    sentences = sentences.sort(() => 0.5 - Math.random()).slice(0, 10);

    const container = document.getElementById("game-container");

    function loadSentence() {
        resetCount = 0;

        if (currentIndex >= sentences.length) {
            container.innerHTML = `
                <h2>Great job! 🎉</h2>
                <p>Your score: ${score} / 10</p>
                <p>You’re building real grammar power 💪</p>
            `;
            return;
        }

        const sentence = sentences[currentIndex];
        const words = [...sentence.words];
        const shuffled = [...words].sort(() => 0.5 - Math.random());

        container.innerHTML = `
            <div id="slots"></div>
            <div id="word-buttons"></div>
        `;

        const slots = document.getElementById("slots");
        const buttons = document.getElementById("word-buttons");

        let chosen = [];

        words.forEach(() => {
            const slot = document.createElement("div");
            slot.className = "slot";
            slots.appendChild(slot);
        });

        shuffled.forEach(word => {
            const btn = document.createElement("button");
            btn.className = "word-btn";
            btn.textContent = word;
            btn.onclick = () => selectWord(word, btn);
            buttons.appendChild(btn);
        });

        function selectWord(word, btn) {
            chosen.push(word);
            btn.disabled = true;

            const slot = slots.children[chosen.length - 1];
            slot.textContent = word;

            speak(word);

            if (chosen.length === words.length) {
                checkAnswer();
            }
        }

        function checkAnswer() {
            if (chosen.join(" ") === words.join(" ")) {
                score++;
                currentIndex++;
                setTimeout(loadSentence, 800);
            } else {
                resetCount++;
                chosen = [];
                Array.from(slots.children).forEach(s => s.textContent = "");
                Array.from(buttons.children).forEach(b => b.disabled = false);

                if (resetCount >= 3) {
                    highlightCorrect();
                }
            }
        }

        function highlightCorrect() {
            words.forEach((correctWord, i) => {
                const btn = Array.from(buttons.children)
                    .find(b => b.textContent === correctWord);
                if (btn) btn.style.border = "3px solid orange";
            });
        }
    }

    loadSentence();
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
}
