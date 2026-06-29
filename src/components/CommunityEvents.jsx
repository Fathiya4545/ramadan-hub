import { useState } from 'react';

const initialEvents = [
  {
    id: 1,
    badge: 'Today',
    title: 'Community Iftar',
    desc: 'Join us for a community iftar at Central Mosque',
    time: '6:30 PM - 8:30 PM',
    action: 'RSVP',
  },
  {
    id: 2,
    badge: 'Tomorrow',
    title: 'Quranic Study Circle',
    desc: 'Learn and discuss Quranic teachings together',
    time: '2:00 PM - 4:00 PM',
    action: 'Join',
  },
  {
    id: 3,
    badge: 'Upcoming',
    title: 'Charity Drive',
    desc: 'Support our community through charitable giving',
    time: 'All Day Event',
    action: 'Donate',
  },
];

export default function CommunityEvents() {
  const [joined, setJoined] = useState({});

  function handleAction(id) {
    setJoined((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <section id="community" className="scroll-mt-20 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800">Community Events</h2>
      <p className="text-gray-500 mt-2">Join local Ramadan activities and events</p>

      <div className="grid md:grid-cols-3 gap-6 mt-10 max-w-5xl mx-auto text-left">
        {initialEvents.map((ev) => (
          <div key={ev.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <span className="inline-block text-xs font-medium bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              {ev.badge}
            </span>
            <h3 className="font-semibold text-gray-800 mt-3">{ev.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{ev.desc}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-gray-500">{ev.time}</span>
              <button
                onClick={() => handleAction(ev.id)}
                disabled={joined[ev.id]}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm px-4 py-1.5 rounded-full font-medium"
              >
                {joined[ev.id] ? 'Done' : ev.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
