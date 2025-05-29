import { useState, useMemo } from "react";
import { db } from "./firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import './App.css';
import { centerFinderQuestions, tiebreakers } from "./centerFinderData";
import { typeResolverQuestions } from "./typeResolverData";
import { wingSelectorQuestions } from "./wingSelectorData";
import { instinctStackQuestions } from "./instinctStackData";
import HealthLevelAssessment from "./components/HealthLevelAssessment";
import Results from "./components/Results";

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function ProgressBar({ progress }) {
  return (
    <div style={{
      height: 8,
      background: '#eee',
      borderRadius: 4,
      marginBottom: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 100
    }}>
      <div style={{
        width: `${progress * 100}%`,
        height: '100%',
        background: '#4caf50',
        borderRadius: 4,
        transition: 'width 0.3s'
      }} />
    </div>
  );
}

function App() {
  // --- State for all steps ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState("name");
  const [startTime, setStartTime] = useState(null);

  // --- Center Finder ---
  const [centerIdx, setCenterIdx] = useState(0);
  const [centerOrder] = useState(() => shuffle(centerFinderQuestions));
  const [centerScores, setCenterScores] = useState({ Gut: 0, Heart: 0, Head: 0 });
  const [centerAnswers, setCenterAnswers] = useState([]);
  const [centerResult, setCenterResult] = useState(null);
  const [shownCenterQuestions, setShownCenterQuestions] = useState(new Set());

  // --- Type Resolver ---
  const [typeIdx, setTypeIdx] = useState(0);
  const [typeOrder, setTypeOrder] = useState([]);
  const [typeScores, setTypeScores] = useState({});
  const [typeAnswers, setTypeAnswers] = useState([]);
  const [typeTiebreaker, setTypeTiebreaker] = useState(false);
  const [typeResult, setTypeResult] = useState(null);
  const [shownTypeQuestions, setShownTypeQuestions] = useState(new Set());

  // --- Wing Selector ---
  const [wingOptions, setWingOptions] = useState([]);
  const [wingResult, setWingResult] = useState(null);

  // --- Instinct Stack ---
  const [instinctIdx, setInstinctIdx] = useState(0);
  const [instinctOrder] = useState(() => shuffle(instinctStackQuestions));
  const [instinctAnswers, setInstinctAnswers] = useState([]);
  const [instinctScores, setInstinctScores] = useState({ sp: 0, so: 0, sx: 0 });
  const [instinctMost, setInstinctMost] = useState(null);
  const [instinctLeast, setInstinctLeast] = useState(null);
  const [shownInstinctQuestions, setShownInstinctQuestions] = useState(new Set());

  // --- Health Level ---
  const [healthLevel, setHealthLevel] = useState(null);

  // --- Progress Bar Calculation ---
  const calculateProgress = () => {
    // Calculate total questions across all steps
    const totalCenterQuestions = centerOrder.length;
    const totalTypeQuestions = typeOrder.length + (typeTiebreaker ? 1 : 0);
    const totalWingQuestions = 1; // Always 1 question
    const totalInstinctQuestions = instinctOrder.length;
    const totalHealthQuestions = 1; // Always 1 question

    const totalQuestions = totalCenterQuestions + totalTypeQuestions + totalWingQuestions + totalInstinctQuestions + totalHealthQuestions;

    // Calculate answered questions based on current step
    let answeredQuestions = 0;

    // Center questions
    if (step === "center") {
      answeredQuestions = centerIdx;
    }
    // Type questions
    else if (step === "type") {
      answeredQuestions = totalCenterQuestions + (typeTiebreaker ? typeIdx + 1 : typeIdx);
    }
    // Wing questions
    else if (step === "wing") {
      answeredQuestions = totalCenterQuestions + totalTypeQuestions + (wingResult ? 1 : 0);
    }
    // Instinct questions
    else if (step === "instinct") {
      answeredQuestions = totalCenterQuestions + totalTypeQuestions + totalWingQuestions + instinctIdx;
    }
    // Health questions
    else if (step === "health") {
      answeredQuestions = totalCenterQuestions + totalTypeQuestions + totalWingQuestions + totalInstinctQuestions + (healthLevel ? 1 : 0);
    }
    // Results page
    else if (step === "results") {
      answeredQuestions = totalQuestions;
    }

    return (answeredQuestions / totalQuestions) * 100;
  };

  // --- Current Questions ---
  const getNextAvailableQuestion = (questions, shownQuestions, currentIdx) => {
    let nextIdx = currentIdx;
    while (shownQuestions.has(nextIdx) && nextIdx < questions.length) {
      nextIdx++;
    }
    return nextIdx < questions.length ? nextIdx : currentIdx;
  };

  const currentCenterQuestion = centerOrder[getNextAvailableQuestion(centerOrder, shownCenterQuestions, centerIdx)];
  const shuffledCenterOptions = useMemo(
    () => shuffle(currentCenterQuestion?.options || []),
    [centerIdx, centerOrder, currentCenterQuestion]
  );
  const currentTypeQuestion = typeOrder[getNextAvailableQuestion(typeOrder, shownTypeQuestions, typeIdx)];
  const shuffledTypeOptions = useMemo(
    () => currentTypeQuestion ? shuffle(currentTypeQuestion.options) : [],
    [typeIdx, typeOrder, currentTypeQuestion]
  );
  const shuffledWingOptions = useMemo(
    () => shuffle(wingOptions),
    [wingOptions]
  );
  const currentInstinctQuestion = instinctOrder[getNextAvailableQuestion(instinctOrder, shownInstinctQuestions, instinctIdx)];
  const shuffledInstinctOptions = useMemo(
    () => shuffle(currentInstinctQuestion?.options || []),
    [instinctIdx, instinctOrder, currentInstinctQuestion]
  );

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const startTimestamp = new Date();
    setStartTime(startTimestamp);
    setShownCenterQuestions(new Set());
    setShownTypeQuestions(new Set());
    setShownInstinctQuestions(new Set());
    
    const userRef = await addDoc(collection(db, "users"), {
      profile: {
        firstName,
        lastName,
        startTime: startTimestamp
      },
      results: {
        enneagramType: null,
        wing: null,
        instinctualVariants: null,
        healthLevel: null,
        completionTime: null
      },
      answers: {
        centerFinder: [],
        typeResolver: [],
        wingSelector: null,
        instinctStack: []
      }
    });
    setUserId(userRef.id);
    setStep("instructions");
  };

  const handleStartAssessment = () => {
    setStep("center");
  };

  const handleCenterAnswer = async (center) => {
    const newScores = { ...centerScores, [center]: centerScores[center] + 1 };
    setCenterScores(newScores);
    setCenterAnswers([...centerAnswers, { 
      question: currentCenterQuestion.prompt,
      answer: center,
      timestamp: new Date()
    }]);
    setShownCenterQuestions(prev => new Set([...prev, centerIdx]));
    
    if (centerIdx + 1 < centerOrder.length) {
      setCenterIdx(centerIdx + 1);
    } else {
      // After all 9 questions, find the center with highest score
      const values = Object.values(newScores);
      const centers = Object.keys(newScores);
      const maxScore = Math.max(...values);
      const topCenters = centers.filter(c => newScores[c] === maxScore);
      
      let result;
      if (topCenters.length === 1) {
        result = topCenters[0];
      } else {
        // If tied, use the first center (you can modify this logic if needed)
        result = topCenters[0];
      }

      await updateDoc(doc(db, "users", userId), {
        'answers.centerFinder': [...centerAnswers, { 
          question: currentCenterQuestion.prompt,
          answer: center,
          timestamp: new Date()
        }]
      });
      
      setCenterResult(result);
      startTypeResolver(result);
      setStep("type");
    }
    setCenterScores(newScores);
  };

  function startTypeResolver(center) {
    let triad = center;
    if (triad.includes("Gut")) triad = "Gut";
    if (triad.includes("Heart")) triad = "Heart";
    if (triad.includes("Head")) triad = "Head";
    const triadQuestions = typeResolverQuestions[triad].filter(q => !q.tiebreaker);
    const triadTiebreaker = typeResolverQuestions[triad].find(q => q.tiebreaker);
    setTypeOrder(shuffle(triadQuestions).concat(triadTiebreaker ? [triadTiebreaker] : []));
    setTypeScores({});
    setTypeAnswers([]);
    setTypeTiebreaker(false);
    setTypeIdx(0);
    setTypeResult(null);
  }

  const handleTypeAnswer = async (type) => {
    const newScores = { ...typeScores, [type]: (typeScores[type] || 0) + 1 };
    setTypeScores(newScores);
    setTypeAnswers([...typeAnswers, { 
      question: currentTypeQuestion.prompt,
      answer: type,
      timestamp: new Date()
    }]);
    setShownTypeQuestions(prev => new Set([...prev, typeIdx]));
    
    const values = Object.values(newScores);
    const max = Math.max(...values);
    const maxType = Object.keys(newScores).find(k => newScores[k] === max);
    if (max === 3) {
      await updateDoc(doc(db, "users", userId), {
        'answers.typeResolver': [...typeAnswers, { 
          question: currentTypeQuestion.prompt,
          answer: type,
          timestamp: new Date()
        }]
      });
      setTypeResult(maxType);
      startWingSelector(maxType);
      setStep("wing");
      return;
    }
    if (typeIdx + 1 < typeOrder.length - 1) {
      setTypeIdx(typeIdx + 1);
    } else {
      const types = Object.keys(newScores);
      const top = types.filter(t => newScores[t] === Math.max(...values));
      if (top.length === 1) {
        await updateDoc(doc(db, "users", userId), {
          'answers.typeResolver': [...typeAnswers, { 
            question: currentTypeQuestion.prompt,
            answer: top[0],
            timestamp: new Date()
          }]
        });
        setTypeResult(top[0]);
        startWingSelector(top[0]);
        setStep("wing");
      } else {
        setTypeTiebreaker(true);
        setTypeIdx(typeOrder.length - 1);
      }
    }
    setTypeScores(newScores);
  };

  function startWingSelector(type) {
    const typeKey = typeof type === "string" && type.includes(" or ") ? type.split(" or ")[0] : type;
    setWingOptions(wingSelectorQuestions[typeKey] || []);
    setWingResult(null);
  }

  const handleWingAnswer = async (wing) => {
    await updateDoc(doc(db, "users", userId), {
      'answers.wingSelector': {
        wing,
        timestamp: new Date()
      }
    });
    setWingResult(wing);
    setStep("instinct");
  };

  const handleInstinctSelect = (optionIdx, which) => {
    if (which === "most") {
      setInstinctMost(optionIdx === instinctLeast ? null : optionIdx);
    } else {
      setInstinctLeast(optionIdx === instinctMost ? null : optionIdx);
    }
  };

  const handleInstinctNext = async () => {
    const most = shuffledInstinctOptions[instinctMost];
    const least = shuffledInstinctOptions[instinctLeast];
    const noneIdx = [0, 1, 2].find(i => i !== instinctMost && i !== instinctLeast);
    const none = shuffledInstinctOptions[noneIdx];

    const newScores = { ...instinctScores };
    newScores[most.instinct] += 2;
    newScores[least.instinct] -= 1;

    const newAnswers = [
      ...instinctAnswers,
      {
        question: currentInstinctQuestion.prompt,
        most: most.text,
        mostInstinct: most.instinct,
        least: least.text,
        leastInstinct: least.instinct,
        none: none.text,
        noneInstinct: none.instinct,
        timestamp: new Date()
      }
    ];

    setInstinctScores(newScores);
    setInstinctAnswers(newAnswers);
    setInstinctMost(null);
    setInstinctLeast(null);
    setShownInstinctQuestions(prev => new Set([...prev, instinctIdx]));

    if (instinctIdx + 1 < instinctOrder.length) {
      setInstinctIdx(instinctIdx + 1);
    } else {
      const sortedScores = Object.entries(newScores)
        .sort((a, b) => b[1] - a[1])
        .map(([instinct]) => instinct);

      await updateDoc(doc(db, "users", userId), {
        'answers.instinctStack': newAnswers
      });
      setStep("health");
    }
  };

  const handleInstinctBack = () => {
    if (instinctIdx === 0) return;
    const prevAnswers = instinctAnswers.slice(0, -1);
    const prevScores = { sp: 0, so: 0, sx: 0 };
    prevAnswers.forEach(ans => {
      prevScores[ans.mostInstinct] += 2;
      prevScores[ans.leastInstinct] -= 1;
    });
    setInstinctAnswers(prevAnswers);
    setInstinctScores(prevScores);
    setInstinctIdx(instinctIdx - 1);
    setInstinctMost(null);
    setInstinctLeast(null);
  };

  const handleHealthLevelComplete = async (level) => {
    const endTime = new Date();
    const completionTime = (endTime - startTime) / 1000; // Convert to seconds

    await updateDoc(doc(db, "users", userId), {
      'results': {
        enneagramType: typeResult.split(" or ")[0],
        wing: wingResult,
        instinctualVariants: Object.entries(instinctScores)
          .sort((a, b) => b[1] - a[1])
          .map(([instinct]) => instinct),
        healthLevel: level,
        completionTime
      }
    });
    
    setHealthLevel(level);
    setStep("results");
  };

  const handleBack = () => {
    if (step === "center") {
      if (centerIdx > 0) {
        setCenterIdx(centerIdx - 1);
        setCenterAnswers(centerAnswers.slice(0, -1));
        const prevCenter = centerAnswers[centerAnswers.length - 1]?.answer;
        if (prevCenter) {
          setCenterScores({ ...centerScores, [prevCenter]: centerScores[prevCenter] - 1 });
        }
        // Remove the last shown question from the set
        setShownCenterQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(centerIdx - 1);
          return newSet;
        });
      }
    } else if (step === "type") {
      if (typeTiebreaker) {
        setTypeTiebreaker(false);
        setTypeIdx(typeOrder.length - 2);
      } else if (typeIdx > 0) {
        setTypeIdx(typeIdx - 1);
        setTypeAnswers(typeAnswers.slice(0, -1));
        const prevType = typeAnswers[typeAnswers.length - 1]?.answer;
        if (prevType) {
          setTypeScores({ ...typeScores, [prevType]: typeScores[prevType] - 1 });
        }
        setShownTypeQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(typeIdx - 1);
          return newSet;
        });
      } else {
        setStep("center");
      }
    } else if (step === "wing") {
      setWingResult(null);
      setStep("type");
    } else if (step === "instinct") {
      if (instinctIdx > 0) {
        handleInstinctBack();
        setShownInstinctQuestions(prev => {
          const newSet = new Set(prev);
          newSet.delete(instinctIdx - 1);
          return newSet;
        });
      } else {
        setStep("wing");
      }
    } else if (step === "health") {
      setStep("instinct");
    } else if (step === "results") {
      setStep("health");
    }
  };

  return (
    <>
      {step !== "name" && (
        <div className="progress-container" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: '#333',
          zIndex: 1000
        }}>
          <div 
            className="progress-bar" 
            style={{ 
              width: `${calculateProgress()}%`,
              height: '100%',
              background: '#4caf50',
              transition: 'width 0.3s ease-in-out',
              borderRadius: '0 2px 2px 0'
            }}
          />
        </div>
      )}
      {step === "name" && (
        <div className="centered-container">
          <div className="form-box">
            <h2>Welcome to Elvare</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label>First Name:<br />
                  <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div style={{ marginTop: 10 }}>
                <label>Last Name:<br />
                  <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </label>
              </div>
              <button type="submit" style={{ marginTop: 20 }}>Start</button>
            </form>
          </div>
        </div>
      )}

      {step === "instructions" && (
        <div className="centered-container">
          <div className="form-box" style={{ 
            maxWidth: '600px', 
            margin: '0 auto',
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <p style={{ 
              color: 'white', 
              fontSize: '18px', 
              lineHeight: '1.6',
              marginBottom: '30px'
            }}>
              There's no right or wrong answer, pick what resonates the most with you at first glance, go with your instinct, don't overthink it.
            </p>
            <button 
              onClick={handleStartAssessment}
              style={{
                padding: '12px 30px',
                fontSize: '16px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Begin Assessment
            </button>
          </div>
        </div>
      )}

      {step === "center" && (
        <div className="centered-container">
          <div className="form-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>{currentCenterQuestion.prompt}</h3>
            {shuffledCenterOptions.map((opt, i) => (
              <button
                key={i}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  margin: '6px 0',
                  padding: '8px',
                  background: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleCenterAnswer(opt.center)}
              >
                {opt.text}
              </button>
            ))}
            <button
              onClick={handleBack}
              disabled={centerIdx === 0}
              style={{ 
                marginTop: '10px', 
                opacity: centerIdx === 0 ? 0.5 : 1,
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === "type" && (
        <div className="centered-container">
          <div className="form-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {!typeTiebreaker ? (
              <>
                <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>{currentTypeQuestion.prompt}</h3>
                {shuffledTypeOptions.map((opt, i) => (
                  <button
                    key={i}
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      margin: '6px 0',
                      padding: '8px',
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleTypeAnswer(opt.type)}
                  >
                    {opt.text}
                  </button>
                ))}
                <button
                  onClick={handleBack}
                  disabled={typeIdx === 0}
                  style={{ 
                    marginTop: '10px', 
                    opacity: typeIdx === 0 ? 0.5 : 1,
                    fontSize: '12px',
                    padding: '6px 12px'
                  }}
                >
                  Back
                </button>
              </>
            ) : (
              <>
                <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>{currentTypeQuestion.prompt}</h3>
                {shuffledTypeOptions.map((opt, i) => (
                  <button
                    key={i}
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      margin: '6px 0',
                      padding: '8px',
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleTypeTiebreakerAnswer(opt.type)}
                  >
                    {opt.text}
                  </button>
                ))}
                <button
                  onClick={handleBack}
                  disabled={typeIdx === 0}
                  style={{ 
                    marginTop: '10px', 
                    opacity: typeIdx === 0 ? 0.5 : 1,
                    fontSize: '12px',
                    padding: '6px 12px'
                  }}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {step === "wing" && (
        <div className="centered-container">
          <div className="form-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>Which statement fits you best?</h3>
            {shuffledWingOptions.map((opt, i) => (
              <button
                key={i}
                style={{ 
                  display: 'block', 
                  width: '100%', 
                  margin: '6px 0',
                  padding: '8px',
                  background: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleWingAnswer(opt.wing)}
              >
                {opt.text}
              </button>
            ))}
            <button
              onClick={handleBack}
              style={{ 
                marginTop: '10px',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === "instinct" && (
        <div className="centered-container">
          <div className="form-box">
            <h3 style={{ color: 'white' }}>{currentInstinctQuestion.prompt}</h3>
            
            <div className="instinct-options">
              {shuffledInstinctOptions.map((opt, i) => (
                <div key={i} className="instinct-option">
                  <div className="option-content">
                    <div className="selection-squares">
                      <div 
                        className={`square most ${instinctMost === i ? 'selected' : ''}`}
                        onClick={() => handleInstinctSelect(i, "most")}
                      >
                        Most
                      </div>
                      <div 
                        className={`square least ${instinctLeast === i ? 'selected' : ''}`}
                        onClick={() => handleInstinctSelect(i, "least")}
                      >
                        Least
                      </div>
                    </div>
                    <p className="option-text">{opt.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="navigation-buttons">
              <button
                onClick={handleBack}
                disabled={instinctIdx === 0}
                style={{ opacity: instinctIdx === 0 ? 0.5 : 1 }}
              >
                Back
              </button>
              <button
                onClick={handleInstinctNext}
                disabled={instinctMost === null || instinctLeast === null}
                style={{ 
                  background: (instinctMost !== null && instinctLeast !== null) ? '#4caf50' : '#eee',
                  color: (instinctMost !== null && instinctLeast !== null) ? '#fff' : '#222'
                }}
              >
                Next
              </button>
            </div>

            <div className="instinct-instructions" style={{ marginTop: '20px' }}>
              <div className="instruction-box">
                <div className="square most">Most</div>
              </div>
              <div className="instruction-box">
                <div className="square least">Least</div>
              </div>
            </div>
            <p className="instruction-text">For each statement, select which one resonates with you the most and which one the least. One statement should remain unselected.</p>

            <style jsx>{`
              .instinct-instructions {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin: 5px 0 10px;
              }

              .instruction-box {
                text-align: center;
              }

              .instruction-text {
                text-align: center;
                color: white;
                font-size: 13px;
                margin: 10px 0 0;
                font-weight: 500;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
              }

              .square {
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s ease;
                color: #333;
                font-size: 12px;
              }

              .square.most {
                background: #e8f5e9;
                border-color: #4caf50;
                color: #2e7d32;
              }

              .square.least {
                background: #ffebee;
                border-color: #f44336;
                color: #c62828;
              }

              .square.selected {
                transform: scale(1.05);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }

              .square.selected.most {
                background: #4caf50;
                color: white;
              }

              .square.selected.least {
                background: #f44336;
                color: white;
              }

              .instinct-options {
                margin: 10px 0;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
              }

              .instinct-option {
                margin: 6px 0;
                padding: 8px;
                background: #333;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }

              .option-content {
                display: flex;
                align-items: center;
                gap: 8px;
              }

              .selection-squares {
                display: flex;
                gap: 4px;
                flex-shrink: 0;
              }

              .option-text {
                margin: 0;
                flex: 1;
                font-size: 13px;
                color: white;
                line-height: 1.2;
              }

              .navigation-buttons {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
              }

              .navigation-buttons button {
                padding: 6px 12px;
                font-size: 13px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                background: #4caf50;
                color: white;
              }

              .navigation-buttons button:disabled {
                cursor: not-allowed;
                opacity: 0.5;
                background: #ccc;
                color: #666;
              }
            `}</style>
          </div>
        </div>
      )}

      {step === "health" && (
        <div className="centered-container">
          <div className="form-box">
            <HealthLevelAssessment
              type={typeResult.split(" or ")[0]}
              onComplete={handleHealthLevelComplete}
              onBack={() => setStep("instinct")}
            />
          </div>
        </div>
      )}

      {step === "results" && (
        <div className="centered-container">
          <div className="form-box">
            <Results
              type={typeResult.split(" or ")[0]}
              wing={wingResult}
              center={centerResult}
              instinctStack={{
                answers: instinctAnswers,
                scores: instinctScores
              }}
              healthLevel={healthLevel}
              userId={userId}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;