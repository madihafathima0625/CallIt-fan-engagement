import { useState } from 'react';
import { moments, type Level } from './data/match';
import { StartScreen } from './components/StartScreen';
import { MatchScreen } from './components/MatchScreen';
import { RevealScreen } from './components/RevealScreen';
import { ScoreScreen } from './components/ScoreScreen';

type Screen = 'start' | 'match' | 'reveal' | 'score';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [level, setLevel] = useState<Level>('newcomer');
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [analystScore, setAnalystScore] = useState(0);
  const [userPick, setUserPick] = useState<number | null>(null);

  const currentMoment = moments[currentMomentIndex];

  // Start the match from StartScreen
  const handleStartMatch = () => {
    setCurrentMomentIndex(0);
    setUserScore(0);
    setAnalystScore(0);
    setUserPick(null);
    setScreen('match');
  };

  // Called when user picks an option or timer runs out in MatchScreen
  const handlePick = (selectedIndex: number | null) => {
    setUserPick(selectedIndex);

    // Scoring logic: 1 point each for correct pick
    if (selectedIndex !== null && selectedIndex === currentMoment.correctIndex) {
      setUserScore((prev) => prev + 1);
    }
    if (currentMoment.analystPick === currentMoment.correctIndex) {
      setAnalystScore((prev) => prev + 1);
    }

    setScreen('reveal');
  };

  // Advance from RevealScreen to next moment or score screen
  const handleNextMoment = () => {
    if (currentMomentIndex + 1 < moments.length) {
      setCurrentMomentIndex((prev) => prev + 1);
      setUserPick(null);
      setScreen('match');
    } else {
      setScreen('score');
    }
  };

  // Reset match and return to StartScreen, keeping the chosen level
  const handlePlayAgain = () => {
    setCurrentMomentIndex(0);
    setUserScore(0);
    setAnalystScore(0);
    setUserPick(null);
    setScreen('start');
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 selection:bg-[#C6FF3D] selection:text-[#0B1220]">
      {screen === 'start' && (
        <StartScreen
          level={level}
          onSelectLevel={setLevel}
          onStartMatch={handleStartMatch}
        />
      )}

      {screen === 'match' && currentMoment && (
        <MatchScreen
          key={currentMoment.id}
          moment={currentMoment}
          momentIndex={currentMomentIndex}
          totalMoments={moments.length}
          level={level}
          onPick={handlePick}
        />
      )}

      {screen === 'reveal' && currentMoment && (
        <RevealScreen
          moment={currentMoment}
          momentIndex={currentMomentIndex}
          totalMoments={moments.length}
          level={level}
          userPick={userPick}
          onNext={handleNextMoment}
        />
      )}

      {screen === 'score' && (
        <ScoreScreen
          userScore={userScore}
          analystScore={analystScore}
          totalMoments={moments.length}
          level={level}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
