import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

// Rename the current component to DetailedResults
function DetailedResults({ type, wing, center, instinctStack, healthLevel, userId }) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || !userId) return;
    
    setIsSubmitting(true);
    try {
      const feedbackData = {
        text: feedback.trim(),
        createdAt: new Date()
      };

      await updateDoc(doc(db, "users", userId), {
        'feedback': arrayUnion(feedbackData)
      });

      setSubmitStatus('success');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCenterDescription = (center) => {
    switch (center) {
      case "gut":
        return "a gut type person";
      case "heart":
        return "a heart type person";
      case "head":
        return "a head type person";
      default:
        return "";
    }
  };

  const getInstinctStack = (stack) => {
    if (!stack || !stack.scores) return "";
    
    // Get the order from the scores
    const scores = stack.scores;
    const order = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([instinct]) => instinct);

    // Convert to full names and add descriptions
    const fullNames = order.map(instinct => {
      switch(instinct) {
        case 'sp': return 'Self-Preservation';
        case 'so': return 'Social';
        case 'sx': return 'Sexual/One-to-One';
        default: return instinct;
      }
    });

    if (fullNames.length !== 3) return "";

    return `${fullNames[0]} (Dominant), ${fullNames[1]} (Secondary), and ${fullNames[2]} (Blind Spot)`;
  };

  // Clean up the type and wing values
  const cleanType = type?.toString().replace(/[^1-9]/g, '') || '';
  // Get the wing number from the wing selector result
  const cleanWing = wing?.toString().replace(/[^1-9]/g, '').replace(cleanType, '') || '';

  return (
    <div className="centered-container">
      <div className="form-box" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ 
          color: 'white', 
          fontSize: '22px', 
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          Your Results
        </h2>
        
        <div className="results-box" style={{
          background: '#333',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '450px',
          margin: '0 auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div className="result-item" style={{
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #444'
          }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '16px', 
              marginBottom: '10px', 
              fontWeight: '500' 
            }}>
              Enneagram Type
            </h3>
            <p style={{ 
              color: 'white', 
              fontSize: '15px', 
              lineHeight: '1.5',
              background: '#444',
              padding: '10px 14px',
              borderRadius: '8px'
            }}>
              You're a Type {cleanType} with a wing {cleanWing}.
            </p>
          </div>

          <div className="result-item" style={{
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #444'
          }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '16px', 
              marginBottom: '10px', 
              fontWeight: '500' 
            }}>
              Instinctual Variants
            </h3>
            <p style={{ 
              color: 'white', 
              fontSize: '15px', 
              lineHeight: '1.5',
              background: '#444',
              padding: '10px 14px',
              borderRadius: '8px'
            }}>
              Your order of instinctual variants are {getInstinctStack(instinctStack)}.
            </p>
          </div>

          <div className="result-item" style={{
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #444'
          }}>
            <h3 style={{ 
              color: 'white', 
              fontSize: '16px', 
              marginBottom: '10px', 
              fontWeight: '500' 
            }}>
              Health Level
            </h3>
            <p style={{ 
              color: 'white', 
              fontSize: '15px', 
              lineHeight: '1.5',
              background: '#444',
              padding: '10px 14px',
              borderRadius: '8px'
            }}>
              Your current health level is {healthLevel}.
            </p>
          </div>

          <div className="result-item" style={{ marginTop: '15px' }}>
            <p style={{ 
              color: 'white', 
              fontSize: '15px', 
              lineHeight: '1.5',
              textAlign: 'center',
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              Thank you for completing the assessment!
            </p>
            <p style={{ 
              color: 'white', 
              fontSize: '15px', 
              lineHeight: '1.5',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              Alex will be in touch shortly.
            </p>
          </div>
        </div>

        <div className="feedback-box" style={{
          background: '#333',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '450px',
          margin: '20px auto 0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            color: 'white', 
            fontSize: '16px', 
            marginBottom: '15px', 
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Optional Feedback
          </h3>
          
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts about the assessment..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: '#444',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical',
              marginBottom: '15px',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedback.trim() || isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: feedback.trim() ? '#4caf50' : '#666',
                color: 'white',
                fontSize: '14px',
                cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.2s ease',
                minWidth: '120px'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>

          {submitStatus === 'success' && (
            <p style={{
              color: '#4caf50',
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '14px',
              marginBottom: '0'
            }}>
              Thank you for your feedback!
            </p>
          )}

          {submitStatus === 'error' && (
            <p style={{
              color: '#f44336',
              textAlign: 'center',
              marginTop: '10px',
              fontSize: '14px',
              marginBottom: '0'
            }}>
              There was an error submitting your feedback. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// New simple Results component
function Results({ type, wing, center, instinctStack, healthLevel, userId }) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || !userId) return;
    
    setIsSubmitting(true);
    try {
      const feedbackData = {
        text: feedback.trim(),
        createdAt: new Date()
      };

      await updateDoc(doc(db, "users", userId), {
        'feedback': arrayUnion(feedbackData)
      });

      setSubmitStatus('success');
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="results-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h2 style={{ color: 'white', marginBottom: '30px' }}>Thank You!</h2>
      <p style={{ 
        color: 'white', 
        fontSize: '18px', 
        lineHeight: '1.6',
        marginBottom: '40px',
        maxWidth: '600px',
        margin: '0 auto 40px'
      }}>
        Thank you for completing the assessment. Alex will be in touch with you shortly to discuss your results.
      </p>

      <div className="feedback-section" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Share Your Experience</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How was your experience with this assessment?"
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px',
            borderRadius: '6px',
            border: '1px solid #333',
            background: '#222',
            color: 'white',
            fontSize: '14px'
          }}
        />
        <button 
          onClick={handleFeedbackSubmit}
          disabled={isSubmitting || !feedback.trim()}
          style={{
            padding: '12px 24px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: isSubmitting || !feedback.trim() ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
        {submitStatus === 'success' && (
          <p style={{ color: '#4caf50', marginTop: '15px' }}>Thank you for your feedback!</p>
        )}
        {submitStatus === 'error' && (
          <p style={{ color: '#f44336', marginTop: '15px' }}>Error submitting feedback. Please try again.</p>
        )}
      </div>
    </div>
  );
}

export { Results, DetailedResults }; 