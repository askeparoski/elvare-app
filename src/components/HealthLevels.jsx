import React from 'react';
import { healthLevels } from '../healthLevelData';

function HealthLevels({ type }) {
  if (!type || !healthLevels[type]) {
    return null;
  }

  const typeData = healthLevels[type];

  return (
    <div className="health-levels">
      <h2>{typeData.name} - Health Levels</h2>
      
      <div className="health-section">
        <h3>Healthy Levels</h3>
        <ul>
          {typeData.levels.healthy.map((trait, index) => (
            <li key={`healthy-${index}`}>{trait}</li>
          ))}
        </ul>
      </div>

      <div className="health-section">
        <h3>Average Levels</h3>
        <ul>
          {typeData.levels.average.map((trait, index) => (
            <li key={`average-${index}`}>{trait}</li>
          ))}
        </ul>
      </div>

      <div className="health-section">
        <h3>Unhealthy Levels</h3>
        <ul>
          {typeData.levels.unhealthy.map((trait, index) => (
            <li key={`unhealthy-${index}`}>{trait}</li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .health-levels {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .health-section {
          margin-bottom: 30px;
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
        }

        h2 {
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        h3 {
          color: #444;
          margin-bottom: 15px;
          border-bottom: 2px solid #ddd;
          padding-bottom: 5px;
        }

        ul {
          list-style-type: none;
          padding: 0;
        }

        li {
          margin-bottom: 10px;
          padding: 8px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

export default HealthLevels; 