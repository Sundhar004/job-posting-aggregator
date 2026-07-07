'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Award, Check } from 'lucide-react';

interface SkillsEditorProps {
  initialSkills: string[];
  onSave: (skills: string[]) => Promise<void>;
}

export default function SkillsEditor({ initialSkills, onSave }: SkillsEditorProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSkills(initialSkills || []);
  }, [initialSkills]);

  const handleAdd = () => {
    const clean = newSkill.trim();
    if (clean && !skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setSkills([...skills, clean]);
    }
    setNewSkill('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await onSave(skills);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#1a1a2e] border border-[#2d2d4e] rounded-xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-indigo-400" />
        <h2 className="text-base font-bold text-white">Your Skill Profile</h2>
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Add skills you are proficient in (e.g., React, Python, AWS). We will match these automatically against extracted job specifications to calculate your match rate.
      </p>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter..."
          className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-[#2d2d4e] focus:border-indigo-500 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-colors"
        />
        <button
          onClick={handleAdd}
          className="px-3 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 min-h-12 max-h-40 overflow-y-auto mb-5 p-2 bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg">
        {skills.length === 0 ? (
          <span className="text-xs text-gray-600 italic m-auto">No skills added yet.</span>
        ) : (
          skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-500/20"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleRemove(skill)}
                className="text-indigo-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {savedSuccess ? (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
            <Check className="w-3.5 h-3.5" /> Profile updated!
          </span>
        ) : (
          <div />
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-glow disabled:opacity-50 transition-colors"
        >
          {saving ? 'Updating...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
