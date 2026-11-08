import { useState, useEffect, useRef } from 'react';
import { moments, type Level, type Moment } from './data/match';
import { StartScreen } from './components/StartScreen';
import { MatchScreen } from './components/MatchScreen';
import { RevealScreen, type AnalystCall } from './components/RevealScreen';
import { ScoreScreen } from './components/ScoreScreen';

type Screen = 'start' | 'match' | 'reveal' | 'score';

// Background fetch for Live AI Analyst with 8-second timeout & offline fallback
function fetchLiveAnalyst(moment: Moment, currentLevel: Level): Promise<AnalystCall> {
  const fallback: AnalystCall = {
    pick: moment.analystPick,
    why: moment.analystWhy[currentLevel],
    source: 'offline',
  };

  // Hidden test switch: if the page URL contains ?offline=1, skip API call & use fallback
  const isOffline =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('offline') === '1';

  if (isOffline) {
    return Promise.resolve(fallback);
  }

  return new Promise<AnalystCall>((resolve) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      resolve(fallback);
    }, 8000); // 8 second timeout

    fetch('/api/analyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        situation: moment.situation[currentLevel],
        question: moment.question,
        options: moment.options,
        level: currentLevel,
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          resolve(fallback);
          return;
        }
        const data = await res.json();
        if (
          typeof data.pick === 'number' &&
          [0, 1, 2].includes(data.pick) &&
          typeof data.why === 'string' &&
          data.why.trim().length > 0 &&
          data.why.length < 200
        ) {
          resolve({
            pick: data.pick,
            why: data.why.trim(),
            source: 'live',
          });
        } else {
          resolve(fallback);
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        resolve(fallback);
      });
  });
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [level, setLevel] = useState<Level>('newcomer');
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [analystScore, setAnalystScore] = useState(0);
  const [userPick, setUserPick] = useState<number | null>(null);
  const [analystCall, setAnalystCall] = useState<AnalystCall | null>(null);
  const [isWaitingForAnalyst, setIsWaitingForAnalyst] = useState(false);

  const analystPromiseRef = useRef<Promise<AnalystCall> | null>(null);
  const currentMoment = moments[currentMomentIndex];

  // Initiate Live AI Analyst prefetch in background when match moment starts
  useEffect(() => {
    if (screen === 'match' && currentMoment) {
      analystPromiseRef.current = fetchLiveAnalyst(currentMoment, level);
    }
  }, [screen, currentMomentIndex, level, currentMoment]);

  // Start the match from StartScreen
  const handleStartMatch = () => {
    setCurrentMomentIndex(0);
    setUserScore(0);
    setAnalystScore(0);
    setUserPick(null);
    setAnalystCall(null);
    setIsWaitingForAnalyst(false);
    setScreen('match');
  };

  // Called when user picks an option or timer runs out in MatchScreen
  const handlePick = async (selectedIndex: number | null) => {
    setUserPick(selectedIndex);

    // If live answer is not ready when the user picks, wait for it up to the 8 second limit
    let resolvedCall: AnalystCall;
    if (analystPromiseRef.current) {
      setIsWaitingForAnalyst(true);
      resolvedCall = await analystPromiseRef.current;
      setIsWaitingForAnalyst(false);
    } else {
      resolvedCall = {
        pick: currentMoment.analystPick,
        why: currentMoment.analystWhy[level],
        source: 'offline',
      };
    }

    setAnalystCall(resolvedCall);

    // Scoring logic: 1 point each for correct pick
    if (selectedIndex !== null && selectedIndex === currentMoment.correctIndex) {
      setUserScore((prev) => prev + 1);
    }
    // Live AI or fallback analyst pick used for scoring
    if (resolvedCall.pick === currentMoment.correctIndex) {
      setAnalystScore((prev) => prev + 1);
    }

    setScreen('reveal');
  };

  // Advance from RevealScreen to next moment or score screen
  const handleNextMoment = () => {
    if (currentMomentIndex + 1 < moments.length) {
      setCurrentMomentIndex((prev) => prev + 1);
      setUserPick(null);
      setAnalystCall(null);
      setIsWaitingForAnalyst(false);
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
    setAnalystCall(null);
    setIsWaitingForAnalyst(false);
    analystPromiseRef.current = null;
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
          isWaitingForAnalyst={isWaitingForAnalyst}
          onPick={handlePick}
        />
      )}

      {screen === 'reveal' && currentMoment && analystCall && (
        <RevealScreen
          moment={currentMoment}
          momentIndex={currentMomentIndex}
          totalMoments={moments.length}
          level={level}
          userPick={userPick}
          analystCall={analystCall}
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
