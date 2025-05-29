import React, { useState } from 'react';
import { typeHealthQuestions } from '../healthQuestions';

function HealthLevelAssessment({ type, onComplete, onBack }) {
  const [answers, setAnswers] = useState({});
  const questions = typeHealthQuestions[type] || [];

  const handleAnswer = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const calculateHealthLevel = () => {
    let totalScore = 0;
    questions.forEach((question, index) => {
      const answer = answers[index];
      if (answer === undefined) return;
      totalScore += question.score[answer];
    });

    // Convert score to health level (1-9)
    // Score range is -8 to +8
    // We want to map this to 1-9 where 1 is healthiest
    const normalizedScore = Math.round(((totalScore + 8) / 16) * 8) + 1;
    return normalizedScore;
  };

  const handleSubmit = () => {
    const healthLevel = calculateHealthLevel();
    onComplete(healthLevel);
  };

  const allQuestionsAnswered = Object.keys(answers).length === questions.length;

  if (!questions.length) {
    return <div>No health questions available for this type.</div>;
  }

  return (
    <div className="centered-container">
      <div className="form-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ 
          color: 'white', 
          fontSize: '16px', 
          marginBottom: '16px',
          textAlign: 'center',
          fontWeight: '500',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.4'
        }}>
          Over the past two weeks, how often did you notice this in yourself?
        </h3>
        
        {questions.map((question, index) => (
          <div key={index} className="question-box">
            <p className="question-text">{question.text}</p>
            <div className="likert-scale">
              {[
                { value: 0, label: "Never", color: "#f44336" },
                { value: 1, label: "Rarely", color: "#ff9800" },
                { value: 2, label: "Sometimes", color: "#ffc107" },
                { value: 3, label: "Often", color: "#8bc34a" },
                { value: 4, label: "Always", color: "#4caf50" }
              ].map(({ value, label, color }) => (
                <label key={value} className="likert-option">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={value}
                    checked={answers[index] === value}
                    onChange={() => handleAnswer(index, value)}
                  />
                  <span style={{ 
                    color: answers[index] === value ? color : 'white',
                    fontSize: '12px',
                    fontWeight: answers[index] === value ? '600' : '400'
                  }}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          maxWidth: '500px', 
          margin: '20px auto 0',
          gap: '12px'
        }}>
          <button
            onClick={onBack}
            style={{ 
              fontSize: '13px',
              padding: '8px 16px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s ease'
            }}
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered}
            style={{ 
              fontSize: '13px',
              padding: '8px 16px',
              background: allQuestionsAnswered ? '#4caf50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: allQuestionsAnswered ? 'pointer' : 'not-allowed',
              flex: 1,
              transition: 'all 0.2s ease'
            }}
          >
            Submit
          </button>
        </div>

        <style jsx>{`
          .question-box {
            margin: 12px 0;
            padding: 12px;
            background: #333;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
            transition: all 0.2s ease;
          }

          .question-box:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          .question-text {
            margin: 0 0 12px;
            color: white;
            line-height: 1.4;
            font-size: 15px;
            font-weight: 500;
          }

          .likert-scale {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            padding: 0 4px;
          }

          .likert-option {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            height: 50px;
            transition: all 0.2s ease;
          }

          .likert-option:hover {
            transform: translateY(-1px);
          }

          .likert-option input[type="radio"] {
            margin: 0 0 6px 0;
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: white;
          }

          .likert-option span {
            text-align: center;
            color: white;
            line-height: 1.2;
            transition: all 0.2s ease;
          }

          .likert-option input[type="radio"]:checked + span {
            font-weight: 600;
          }
        `}</style>
      </div>
    </div>
  );
}

export default HealthLevelAssessment; 