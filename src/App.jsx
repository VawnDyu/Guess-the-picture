import { useState, useEffect, useRef } from 'react'
import './App.css'
import correctSound from "./assets/sounds/correct.mp3";  // Add a correct sound file
import wrongSound from "./assets/sounds/wrong.mp3";      // Add a wrong sound file
import bgMusic from "./assets/sounds/background.mp3";  // Background music

const images = [
  {src: "assets/img/apple.png", answer: "apple", hint: "It's a fruit"},
  {src: "assets/img/ball.png", answer: "ball", hint: "A round object which is used in sports and games"},
  {src: "assets/img/balloon.png", answer: "balloon", hint: "is a bag that is usually filled with gas"},
  {src: "assets/img/banana.jpg", answer: "banana", hint: "It's a fruit."},
  {src: "assets/img/bee.png", answer: "bee", hint: "Collect pollen and nectar from flowers to make honey."},
  {src: "assets/img/cat.png", answer: "cat", hint: "It's a common pet."},
  {src: "assets/img/cherry.jpg", answer: "cherry", hint: "It's a fruit."},
  {src: "assets/img/durian.jpg", answer: "durian", hint: "a large, spiky tropical fruit indigenous to Southeast Asia."},
  {src: "assets/img/pencil.png", answer: "pencil", hint: "Use for writing."}
];

function App() {
  const [screen, setScreen] = useState("start");
  const [playerName, setPlayerName] = useState("");
  const [currentImage, setCurrentImage] = useState(images[0]);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); // 1-minute timer
  const bgMusicRef = useRef(new Audio(bgMusic));

  useEffect(() => {
    const storedLeaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    setLeaderboard(storedLeaderboard);
  }, []);

  useEffect(() => {
    if (screen === "game" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0) {
      endGame();
      setTimeLeft(60); // Reset timer
    }
  }, [screen, timeLeft]);

  useEffect(() => {
    // Listen for Enter key press
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        checkAnswer();
      }
    };

    if (screen === "game") {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [guess, screen]);

  const startGame = () => {
    if (playerName.trim() === "") {
      alert("Please enter your name before starting!");
      return;
    }
    setScreen("game");
    setTimeLeft(60); // Reset timer
    setScore(0)
    setHint("");
    setMessage("");
    setGuess("");

    // Start background music
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.5; // Set volume to 50%
    bgMusicRef.current.play();
  };

  const openLeaderboard = () => {
    setScreen("leaderboard");
  };

  const checkAnswer = () => {
    if (guess.toLowerCase() === currentImage.answer) {
      setMessage("✅ Correct!");
      setScore(score + 1);
      new Audio(correctSound).play();  // Play correct sound
      nextImage();
    } else {
      setMessage("❌ Try again!");
      setHint("");
      new Audio(wrongSound).play();  // Play wrong sound
    }
  };

  const nextImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    setCurrentImage(images[randomIndex]);
    setGuess("");
    setHint("");
  };

  const endGame = () => {
    const newEntry = { name: playerName, score };
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setLeaderboard(updatedLeaderboard);
    localStorage.setItem("leaderboard", JSON.stringify(updatedLeaderboard));

    setScreen("leaderboard");

    // Stop background music
    bgMusicRef.current.pause();
    bgMusicRef.current.currentTime = 0;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1 class="title">🤔 Guess the Picture 🤔</h1>

      {screen === "start" && (
        <div>
          <h2 class="description">Enter your name to Start</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <br /><br />
          <button class="startBtn" onClick={startGame}>🎮 Start Game</button>
          <button class="leaderboardBtn" onClick={openLeaderboard}>🏆 Leaderboard</button>
        </div>
      )}

      {/* Game Screen */}
      {screen === "game" && (
        <div>
          <h2 class="playerName">Player: {playerName}</h2>
          <h2 class="playerScore">Score: {score}</h2>
          <h2 class="playerTime">⏳ Time Left: {timeLeft} sec ⏳</h2>
          <p class="hintMsg">{hint}</p>
          <p class="Msg">{message}</p>
          <img src={currentImage.src} alt="Guess the image" width="200px" />
          <br />
          <input
            type="text"
            placeholder="Enter your guess..."
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          /><br />
          <button class="submitBtn" onClick={checkAnswer}>✅ Submit</button>
          <br />
          <button class="hintBtn" onClick={() => setHint(currentImage.hint)}>💡 Show Hint</button>
          <button class="endBtn" onClick={endGame}>🚩 End Game</button>
        </div>
      )}

      {screen === "leaderboard" && (
        <div>
          <h2 class="leaderboardTitle">🏆 Leaderboard (Top 5) 🏆</h2>
          <ul>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <li key={index}>
                  {index + 1}. {entry.name} - {entry.score} points
                </li>
              ))
            ) : (
              <p>No scores yet!</p>
            )}
          </ul>
          <button class="startBtn" onClick={() => setScreen("start")}>🎮 Play</button>
        </div>
      )}
    </div>
  );
}

export default App;
