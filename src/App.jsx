
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const parseTime = (input) => {
  const match = input.match(/(\d{2})(\d{2})(\d{2})/);
  if (!match) return null;
  const [_, days, hours, minutes] = match.map(Number);
  return ((days * 24 + hours) * 60 + minutes) * 60 * 1000;
};

const Timer = ({ id, label, endTime, onDelete, onEdit }) => {
  const [remaining, setRemaining] = useState(endTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(endTime - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (remaining <= 0) return <div className="text-red-500">{label} - DONE</div>;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div className="p-2 bg-gray-800 rounded-xl shadow mb-2">
      <div className="flex justify-between items-center">
        <div className="text-white">{label} - {`${days}d ${hours}h ${minutes}m ${seconds}s`}</div>
        <div className="space-x-2">
          <button onClick={() => onEdit(id)} className="text-blue-400">✏️</button>
          <button onClick={() => onDelete(id)} className="text-red-400">🗑️</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [timers, setTimers] = useState(() => {
    const stored = localStorage.getItem('timers');
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState('');
  const [label, setLabel] = useState('');

  useEffect(() => {
    localStorage.setItem('timers', JSON.stringify(timers));
  }, [timers]);

  const addTimer = () => {
    const duration = parseTime(input);
    if (!duration) return alert('Enter time in DDHHMM format.');
    const newTimer = {
      id: uuidv4(),
      label,
      endTime: Date.now() + duration,
    };
    setTimers([...timers, newTimer]);
    setInput('');
    setLabel('');
  };

  const deleteTimer = (id) => setTimers(timers.filter(t => t.id !== id));

  const editTimer = (id) => {
    const newLabel = prompt('Enter new label:');
    const newTime = prompt('Enter new DDHHMM time:');
    const duration = parseTime(newTime);
    if (!newLabel || !duration) return;
    setTimers(timers.map(t => t.id === id ? {
      ...t,
      label: newLabel,
      endTime: Date.now() + duration
    } : t));
  };

  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Clash of Clans Builder Timers</h1>
      <div className="mb-4 space-y-2">
        <input
          className="p-2 text-black rounded w-full"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Label (e.g. Archer Tower)"
        />
        <input
          className="p-2 text-black rounded w-full"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Time (DDHHMM)"
        />
        <button onClick={addTimer} className="bg-green-600 px-4 py-2 rounded">Add Timer</button>
      </div>
      <div>
        {timers.map(timer => (
          <Timer key={timer.id} {...timer} onDelete={deleteTimer} onEdit={editTimer} />
        ))}
      </div>
    </div>
  );
};

export default App;
