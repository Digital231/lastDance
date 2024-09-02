import { useState, useEffect } from "react";

const GuessNumberGame = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
  }, []);

  const handleGuess = () => {
    const guessNum = parseInt(guess);
    setAttempts(attempts + 1);

    if (isNaN(guessNum)) {
      setMessage("Please enter a valid number");
    } else if (guessNum === targetNumber) {
      setMessage(
        `Congratulations! You guessed the number in ${attempts + 1} attempts!`
      );
    } else if (guessNum < targetNumber) {
      setMessage("Too low! Try a higher number.");
    } else {
      setMessage("Too high! Try a lower number.");
    }
  };

  const resetGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setMessage("");
    setAttempts(0);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10 bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl font-bold mb-4">
            Guess the Number
          </h2>
          <p className="mb-4">What is the secret number?</p>
          <input
            type="number"
            placeholder="Enter your guess"
            className="input input-bordered w-full max-w-xs mb-4"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button className="btn btn-primary mb-4" onClick={handleGuess}>
            Submit Guess
          </button>
          {message && (
            <div
              className={`alert ${
                message.includes("Congratulations")
                  ? "alert-success"
                  : "alert-info"
              }`}
            >
              <span>{message}</span>
            </div>
          )}
          <button className="btn btn-outline btn-sm mt-4" onClick={resetGame}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessNumberGame;
