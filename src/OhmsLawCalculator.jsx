import React, { useState } from 'react';

function OhmsLawCalculator({ onBack }) {
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Ohm's Law Calculator
  const BasicOhmsLaw = () => {
    const [voltage, setVoltage] = useState('');
    const [current, setCurrent] = useState('');
    const [resistance, setResistance] = useState('');
    const [power, setPower] = useState('');

    const calculateValues = () => {
      const V = parseFloat(voltage) || 0;
      const I = parseFloat(current) || 0;
      const R = parseFloat(resistance) || 0;
      const P = parseFloat(power) || 0;

      let results = { voltage: V, current: I, resistance: R, power: P };

      // Calculate missing values based on what's provided
      if (V && I && !R && !P) {
        results.resistance = V / I;
        results.power = V * I;
      } else if (V && R && !I && !P) {
        results.current = V / R;
        results.power = (V * V) / R;
      } else if (I && R && !V && !P) {
        results.voltage = I * R;
        results.power = I * I * R;
      } else if (V && P && !I && !R) {
        results.current = P / V;
        results.resistance = (V * V) / P;
      } else if (I && P && !V && !R) {
        results.voltage = P / I;
        results.resistance = P / (I * I);
      } else if (R && P && !V && !I) {
        results.voltage = Math.sqrt(P * R);
        results.current = Math.sqrt(P / R);
      }

      return results;
    };

    const results = calculateValues();

    const clearAll = () => {
      setVoltage('');
      setCurrent('');
      setResistance('');
      setPower('');
    };

    return (
      <div>
        <h3>Basic Ohm's Law Calculator</h3>
        <p className="small">Enter any two values to calculate the rest</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Voltage (V):</label>
          <input 
            type="number" 
            value={voltage} 
            onChange={(e) => setVoltage(e.target.value)}
            placeholder="Volts"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Current (I):</label>
          <input 
            type="number" 
            value={current} 
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="Amps"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Resistance (R):</label>
          <input 
            type="number" 
            value={resistance} 
            onChange={(e) => setResistance(e.target.value)}
            placeholder="Ohms"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Power (P):</label>
          <input 
            type="number" 
            value={power} 
            onChange={(e) => setPower(e.target.value)}
            placeholder="Watts"
          />
        </div>

        <button onClick={clearAll} style={{ marginBottom: '20px', backgroundColor: '#6b7280' }}>
          Clear All
        </button>

        <div className="result">
          <div><strong>Calculated Values:</strong></div>
          <div>Voltage: {results.voltage.toFixed(2)} V</div>
          <div>Current: {results.current.toFixed(2)} A</div>
          <div>Resistance: {results.resistance.toFixed(2)} Ω</div>
          <div>Power: {results.power.toFixed(2)} W</div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>Formulas:</strong>
          <div>V = I × R &nbsp;&nbsp; I = V ÷ R &nbsp;&nbsp; R = V ÷ I</div>
          <div>P = V × I &nbsp;&nbsp; P = I² × R &nbsp;&nbsp; P = V² ÷ R</div>
        </div>
      </div>
    );
  };

  // Series Circuit Calculator
  const SeriesCalculator = () => {
    const [resistors, setResistors] = useState(['']);
    const [sourceVoltage, setSourceVoltage] = useState('');

    const addResistor = () => {
      setResistors([...resistors, '']);
    };

    const removeResistor = (index) => {
      if (resistors.length > 1) {
        setResistors(resistors.filter((_, i) => i !== index));
      }
    };

    const updateResistor = (index, value) => {
      const newResistors = [...resistors];
      newResistors[index] = value;
      setResistors(newResistors);
    };

    const calculateSeries = () => {
      const resistorValues = resistors.map(r => parseFloat(r) || 0).filter(r => r > 0);
      const voltage = parseFloat(sourceVoltage) || 0;

      if (resistorValues.length === 0) return null;

      const totalResistance = resistorValues.reduce((sum, r) => sum + r, 0);
      const totalCurrent = voltage > 0 ? voltage / totalResistance : 0;
      const totalPower = voltage > 0 ? (voltage * voltage) / totalResistance : 0;

      const resistorAnalysis = resistorValues.map((r, index) => ({
        resistance: r,
        voltage: totalCurrent * r,
        power: totalCurrent * totalCurrent * r
      }));

      return {
        totalResistance,
        totalCurrent,
        totalPower,
        resistorAnalysis
      };
    };

    const results = calculateSeries();

    return (
      <div>
        <h3>Series Circuit Calculator</h3>
        <p className="small">Calculate total resistance and individual component values</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Source Voltage (optional):</label>
          <input 
            type="number" 
            value={sourceVoltage} 
            onChange={(e) => setSourceVoltage(e.target.value)}
            placeholder="Total voltage across circuit"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Resistors:</label>
          {resistors.map((resistor, index) => (
  <div key={index} style={{ 
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px'
  }}>
    <input 
      type="number" 
      value={resistor} 
      onChange={(e) => updateResistor(index, e.target.value)}
      placeholder={`R${index + 1} (Ohms)`}
      style={{ width: '100%', marginBottom: resistors.length > 2 ? '8px' : '0' }}
    />
    {resistors.length > 1 && (
      <button 
        onClick={() => removeResistor(index)}
        style={{ 
          backgroundColor: '#ef4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          width: '100%'
        }}
      >
        Remove
      </button>
    )}
  </div>
))}
          <button 
            onClick={addResistor}
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            Add Resistor
          </button>
        </div>

        {results && (
          <div className="result">
            <div><strong>Series Circuit Results:</strong></div>
            <div>Total Resistance: {results.totalResistance.toFixed(2)} Ω</div>
            {sourceVoltage && (
              <>
                <div>Total Current: {results.totalCurrent.toFixed(3)} A</div>
                <div>Total Power: {results.totalPower.toFixed(2)} W</div>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Individual Resistor Analysis:</strong>
                  {results.resistorAnalysis.map((resistor, index) => (
                    <div key={index} style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '4px' 
                    }}>
                      <div>R{index + 1}: {resistor.resistance} Ω</div>
                      <div>Voltage Drop: {resistor.voltage.toFixed(2)} V</div>
                      <div>Power: {resistor.power.toFixed(2)} W</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>Series Circuit Rules:</strong>
          <div>• Current is the same through all components</div>
          <div>• Total resistance = R₁ + R₂ + R₃ + ...</div>
          <div>• Voltage divides proportionally across resistors</div>
        </div>
      </div>
    );
  };

  // Parallel Circuit Calculator
  const ParallelCalculator = () => {
    const [resistors, setResistors] = useState(['']);
    const [sourceVoltage, setSourceVoltage] = useState('');

    const addResistor = () => {
      setResistors([...resistors, '']);
    };

    const removeResistor = (index) => {
      if (resistors.length > 1) {
        setResistors(resistors.filter((_, i) => i !== index));
      }
    };

    const updateResistor = (index, value) => {
      const newResistors = [...resistors];
      newResistors[index] = value;
      setResistors(newResistors);
    };

    const calculateParallel = () => {
      const resistorValues = resistors.map(r => parseFloat(r) || 0).filter(r => r > 0);
      const voltage = parseFloat(sourceVoltage) || 0;

      if (resistorValues.length === 0) return null;

      // 1/Rtotal = 1/R1 + 1/R2 + 1/R3 + ...
      const reciprocalSum = resistorValues.reduce((sum, r) => sum + (1 / r), 0);
      const totalResistance = 1 / reciprocalSum;
      const totalCurrent = voltage > 0 ? voltage / totalResistance : 0;
      const totalPower = voltage > 0 ? (voltage * voltage) / totalResistance : 0;

      const resistorAnalysis = resistorValues.map((r, index) => ({
        resistance: r,
        current: voltage > 0 ? voltage / r : 0,
        power: voltage > 0 ? (voltage * voltage) / r : 0
      }));

      return {
        totalResistance,
        totalCurrent,
        totalPower,
        resistorAnalysis
      };
    };

    const results = calculateParallel();

    return (
      <div>
        <h3>Parallel Circuit Calculator</h3>
        <p className="small">Calculate equivalent resistance and branch currents</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Source Voltage (optional):</label>
          <input 
            type="number" 
            value={sourceVoltage} 
            onChange={(e) => setSourceVoltage(e.target.value)}
            placeholder="Voltage across all branches"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Resistors:</label>
          {resistors.map((resistor, index) => (
  <div key={index} style={{ 
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px'
  }}>
    <input 
      type="number" 
      value={resistor} 
      onChange={(e) => updateResistor(index, e.target.value)}
      placeholder={`R${index + 1} (Ohms)`}
      style={{ width: '100%', marginBottom: resistors.length > 2 ? '8px' : '0' }}
    />
    {resistors.length > 1 && (
      <button 
        onClick={() => removeResistor(index)}
        style={{ 
          backgroundColor: '#ef4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          width: '100%'
        }}
      >
        Remove
      </button>
    )}
  </div>
))}
          <button 
            onClick={addResistor}
            style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              padding: '8px 12px',
              fontSize: '14px',
              marginTop: '8px'
            }}
          >
            Add Resistor
          </button>
        </div>

        {results && (
          <div className="result">
            <div><strong>Parallel Circuit Results:</strong></div>
            <div>Total Resistance: {results.totalResistance.toFixed(2)} Ω</div>
            {sourceVoltage && (
              <>
                <div>Total Current: {results.totalCurrent.toFixed(3)} A</div>
                <div>Total Power: {results.totalPower.toFixed(2)} W</div>
                
                <div style={{ marginTop: '15px' }}>
                  <strong>Individual Branch Analysis:</strong>
                  {results.resistorAnalysis.map((resistor, index) => (
                    <div key={index} style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '4px' 
                    }}>
                      <div>R{index + 1}: {resistor.resistance} Ω</div>
                      <div>Branch Current: {resistor.current.toFixed(3)} A</div>
                      <div>Power: {resistor.power.toFixed(2)} W</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>Parallel Circuit Rules:</strong>
          <div>• Voltage is the same across all branches</div>
          <div>• 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...</div>
          <div>• Current divides inversely with resistance</div>
          <div>• Total current = sum of all branch currents</div>
        </div>
      </div>
    );
  };

  const tabComponents = {
    basic: <BasicOhmsLaw />,
    series: <SeriesCalculator />,
    parallel: <ParallelCalculator />
  };

  return (
  <div className="calculator-container">
    {onBack && (
  <button onClick={onBack} style={{ marginBottom: '20px' }}>
    ← Back to Menu
  </button>
)}
    <h2>Ohm's Law & Circuit Analysis</h2>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setActiveTab('basic')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'basic' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'basic' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Basic Ohm's Law
        </button>
        <button 
          onClick={() => setActiveTab('series')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'series' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'series' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Series Circuits
        </button>
        <button 
          onClick={() => setActiveTab('parallel')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'parallel' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'parallel' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Parallel Circuits
        </button>
      </div>

      {/* Active Tab Content */}
      {tabComponents[activeTab]}
    </div>
  );
}

export default OhmsLawCalculator;
