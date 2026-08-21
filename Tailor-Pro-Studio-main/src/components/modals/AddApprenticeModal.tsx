import React, { useState } from 'react';
import { X, GraduationCap, UserPlus } from 'lucide-react';
import { Apprentice } from '../../types';

interface AddApprenticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveApprentice: (apprentice: Apprentice) => void;
  mentorsList: string[];
}

export const AddApprenticeModal: React.FC<AddApprenticeModalProps> = ({
  isOpen,
  onClose,
  onSaveApprentice,
  mentorsList
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Apprentice Scholar');
  const [mentor, setMentor] = useState(mentorsList[0] || 'Master Atelier');
  const [specialty, setSpecialty] = useState('');
  const [stipend, setStipend] = useState('');

  const avatarSamples = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80'
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(avatarSamples[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newApprentice: Apprentice = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase() || 'AP',
      role,
      mentor,
      isLinked: true,
      handshakeLocked: false,
      hasCert: true,
      avatarUrl: selectedAvatar,
      hoursCompleted: 0,
      totalRequiredHours: 500,
      certifications: ['Pattern Drafting', 'Overlock Machine Safety'],
      tasksCount: 0,
      status: 'On Track',
      specialty
    };

    onSaveApprentice(newApprentice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 pt-10 sm:pt-12 pb-6 sm:pb-8 overflow-y-auto animate-fade-in font-['Outfit']">
      <div className="glass-card rounded-3xl p-5 sm:p-8 max-w-md w-full relative shadow-2xl border border-white/80 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#0E3832] text-[#DCA134] flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5 text-[#DCA134]" />
          </div>
          <div>
            <h3 className="font-['Outfit'] font-bold text-xl text-[#0E3832]">
              Register Apprentice Scholar
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Enroll apprentice into studio mentorship program
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Avatar</label>
            <div className="flex items-center gap-3">
              {avatarSamples.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(url)}
                  className={`w-12 h-12 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                    selectedAvatar === url ? 'border-[#0E3832] scale-110 shadow-md' : 'border-white opacity-70'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Tanaka"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Mentor</label>
            <select
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            >
              {mentorsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Apprentice Title / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Artistic Specialty</label>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Monthly Stipend</label>
            <input
              type="text"
              value={stipend}
              onChange={(e) => setStipend(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0E3832] hover:bg-[#0A2B26] text-white font-bold text-xs fab-shadow transition-all hover:scale-105"
            >
              Register Scholar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
