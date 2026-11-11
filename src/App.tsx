import { useState, useEffect, useRef } from 'react';
import { matchInfo, moments, type Level, type Moment } from './data/match';
import { StartScreen } from './components/StartScreen';
import { MatchScreen } from './components/MatchScreen';
import { RevealScreen, type AnalystCall } from './components/RevealScreen';
import { ScoreScreen } from './components/ScoreScreen';
import { AnalystLab } from './components/AnalystLab';

type Screen = 'start' | 'match' | 'reveal' | 'score' | 'lab';

// Background fetch for Live AI Analyst with 9-second timeout & offline fallback
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
    }, 9000); // 9 second timeout

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
  const [, setPrefetchedResults] = useState<Record<number, AnalystCall>>({});

  // Lab Navigation State
  const [labReturnScreen, setLabReturnScreen] = useState<'start' | 'reveal' | 'score'>('start');
  const [labInitialTab, setLabInitialTab] = useState<'scenario' | 'chat'>('scenario');

  const analystPromiseRef = useRef<Promise<AnalystCall> | null>(null);
  const prefetchedPromisesRef = useRef<Map<number, Promise<AnalystCall>>>(new Map());

  const currentMoment = moments[currentMomentIndex];

  // Initiate Live AI Analyst request for the current moment if not already prefetched
  useEffect(() => {
    if (screen === 'match' && currentMoment) {
      let promise = prefetchedPromisesRef.current.get(currentMomentIndex);
      if (!promise) {
        promise = fetchLiveAnalyst(currentMoment, level);
        prefetchedPromisesRef.current.set(currentMomentIndex, promise);
        promise.then((res) => {
          setPrefetchedResults((prev) => ({ ...prev, [currentMomentIndex]: res }));
        });
      }
      analystPromiseRef.current = promise;
    }
  }, [screen, currentMomentIndex, level, currentMoment]);

  // Prefetch: while on the Reveal screen for moment N, prefetch moment N+1 in the background
  useEffect(() => {
    if (screen === 'reveal') {
      const nextIndex = currentMomentIndex + 1;
      if (nextIndex < moments.length) {
        const nextMoment = moments[nextIndex];
        if (!prefetchedPromisesRef.current.has(nextIndex)) {
          const promise = fetchLiveAnalyst(nextMoment, level);
          prefetchedPromisesRef.current.set(nextIndex, promise);
          promise.then((res) => {
            setPrefetchedResults((prev) => ({ ...prev, [nextIndex]: res }));
          });
        }
      }
    }
  }, [screen, currentMomentIndex, level]);

  // Start the match from StartScreen
  const handleStartMatch = () => {
    prefetchedPromisesRef.current.clear();
    setPrefetchedResults({});
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

    // If live answer is not ready when the user picks, wait for it up to the 9-second limit
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
    prefetchedPromisesRef.current.clear();
    setPrefetchedResults({});
    setCurrentMomentIndex(0);
    setUserScore(0);
    setAnalystScore(0);
    setUserPick(null);
    setAnalystCall(null);
    setIsWaitingForAnalyst(false);
    analystPromiseRef.current = null;
    setScreen('start');
  };

  // Open Analyst Lab without losing current match state
  const handleOpenLab = (fromScreen: 'start' | 'reveal' | 'score', tab: 'scenario' | 'chat') => {
    setLabReturnScreen(fromScreen);
    setLabInitialTab(tab);
    setScreen('lab');
  };

  // Return from Analyst Lab preserving match state
  const handleBackFromLab = () => {
    setScreen(labReturnScreen);
  };

  // Build matchContext safely: never include outcomes of unrevealed moments
  const buildMatchContext = (): string => {
    if (labReturnScreen === 'start') {
      return `No match played yet. Fixture: ${matchInfo.title}. (${matchInfo.format})`;
    }
    if (labReturnScreen === 'score') {
      return `Finished match: ${matchInfo.title} (${matchInfo.format}). Final Score: You ${userScore} - ${analystScore} Analyst.`;
    }
    // Revealed so far up to currentMomentIndex
    const momentsSoFar = moments
      .slice(0, currentMomentIndex + 1)
      .map((m) => `${m.over} (${m.score}) - Question: ${m.question}`)
      .join('; ');
    return `In-progress match: ${matchInfo.title}. Moments revealed so far: ${momentsSoFar}`.slice(0, 600);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 selection:bg-[#C6FF3D] selection:text-[#0B1220]">
      {screen === 'start' && (
        <StartScreen
          level={level}
          onSelectLevel={setLevel}
          onStartMatch={handleStartMatch}
          onOpenLab={() => handleOpenLab('start', 'scenario')}
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
          onOpenChat={() => handleOpenLab('reveal', 'chat')}
        />
      )}

      {screen === 'score' && (
        <ScoreScreen
          userScore={userScore}
          analystScore={analystScore}
          totalMoments={moments.length}
          level={level}
          onPlayAgain={handlePlayAgain}
          onOpenLab={() => handleOpenLab('score', 'scenario')}
        />
      )}

      {screen === 'lab' && (
        <AnalystLab
          level={level}
          initialTab={labInitialTab}
          matchContext={buildMatchContext()}
          onBack={handleBackFromLab}
        />
      )}
    </div>
  );
}
