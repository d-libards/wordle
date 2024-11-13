import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WORD_LENGTH = 5;
const TOTAL_GUESSES = 6;

function App() {
  const [guessedWords, setGuessedWords] = useState(
    new Array(TOTAL_GUESSES).fill('     ')
  );
  const [correctWord, setCorrectWord] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [currentWord, setCurrentWord] = useState('     ');
  const [gameOver, setGameOver] = useState(false);

  async function fetchData() {
    const response = await axios.get(
      'https://api.datamuse.com/words?sp=?????&max=1000'
    );
    const words = response.data;
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex].word;
    console.log(word);
    setCorrectWord(word);
  }

  //Getting Correct Word
  useEffect(() => {
    fetchData();
  }, []);

  function handleEnter() {
    if (currentWord === correctWord) {
      setGameOver(true);
      toast.success("YOU'VE WON");
      return;
    }

    if (currentWord !== correctWord && wordCount === TOTAL_GUESSES - 1) {
      setGameOver(true);
      toast.error("YOU'VE LOST");
      return;
    }

    if (letterCount !== WORD_LENGTH) {
      alert('words must be five letters');
      return;
    }

    setGuessedWords((current) => {
      const updatedGuessedWords = [...current];
      updatedGuessedWords[wordCount] = currentWord;
      return updatedGuessedWords;
    });

    setWordCount((current) => current + 1);
    setLetterCount(0);
    setCurrentWord('     ');
  }

  function handleBackspace() {
    if (letterCount === 0) {
      return;
    }

    setCurrentWord((currentWord) => {
      const currentWordArray = currentWord.split('');
      currentWordArray[letterCount - 1] = ' ';
      const newWord = currentWordArray.join('');
      return newWord;
    });

    setLetterCount((current) => current - 1);
  }

  function handleAlphabet(key) {
    if (letterCount === WORD_LENGTH) return;

    setCurrentWord((currentWord) => {
      const currentWordArray = currentWord.split('');
      currentWordArray[letterCount] = key;
      const newWord = currentWordArray.join('').toLocaleLowerCase();
      return newWord;
    });

    setLetterCount((current) => current + 1);
  }

  useEffect(() => {
    function handleKeydown(e) {
      if (e.key === 'Enter') {
        handleEnter();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleAlphabet(e.key);
      } else {
        return;
      }
    }

    document.addEventListener('keydown', handleKeydown);

    if (gameOver) {
      document.removeEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleAlphabet, handleEnter, handleBackspace, gameOver]);

  useEffect(() => {
    console.log(currentWord, letterCount);
  }, [currentWord]);

  function handleReset() {
    setGuessedWords(new Array(TOTAL_GUESSES).fill('     '));
    fetchData();
    setCurrentWord('     ');
    setWordCount(0);
    setLetterCount(0);
    setGameOver(false);
  }

  return (
    <div className="h-screen bg-stone-900 flex justify-center items-center flex-col">
      <span className="text-8xl font-extrabold text-white text-center ">
        WORDLE!
      </span>
      <div>
        {guessedWords.map((word, index) => {
          if (index === wordCount) {
            return (
              <WordLine
                key={index}
                correctWord={correctWord}
                word={currentWord}
                revealed={false || gameOver}
              />
            );
          }
          return (
            <WordLine
              key={index}
              correctWord={correctWord}
              word={word}
              revealed={true}
            />
          );
        })}
      </div>
      <div>
        <button
          className="m-4 p-4 border-2 text-white rounded-md border-white font-semibold hover:bg-gray-700"
          onClick={(e) => {
            handleReset();
            e.target.blur();
          }}
        >
          RESET GAME
        </button>
      </div>
    </div>
  );
}

function WordLine({ word, correctWord, revealed }) {
  return (
    <div className="flex flex-row space-x-2 mt-4">
      {word.split('').map((letter, index) => {
        const hasCorrectLocation = letter === correctWord[index];
        const hasCorrectLetter = correctWord.includes(letter);

        return (
          <LetterBox
            key={index}
            green={hasCorrectLocation && hasCorrectLetter && revealed}
            yellow={!hasCorrectLocation && hasCorrectLetter && revealed}
            letter={letter}
          />
        );
      })}
    </div>
  );
}

function LetterBox({ letter, green, yellow }) {
  return (
    <div
      className={`size-24 border-4 text-4xl font-bold border-black bg-white text-black rounded-xl uppercase grid place-items-center ${
        green ? 'bg-green-500' : yellow ? 'bg-yellow-500' : ''
      }`}
    >
      {letter}
    </div>
  );
}

export default App;
