/**
 * CommunityList — replaces the old GoogleMapView.
 *
 * The Maps embed needed a public API key that shipped to every visitor and had
 * to be referrer-locked to avoid billing abuse. Coverage is a fixed list of
 * gated communities, not a geographic search, so a list carries the same
 * information with no key and no third-party script.
 */
import { MapPin, Search, Users, PawPrint, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Community {
  name: string;
  location: string;
  petCount: number;
  walkerCount: number;
  rating: number;
  activeWalks: number;
  tower: string;
}

interface CommunityListProps {
  communities: Community[];
  isLightMode: boolean;
  onCommunitySelect?: (community: Community) => void;
}

export default function CommunityList({ communities, isLightMode, onCommunitySelect }: CommunityListProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    );
  }, [communities, query]);

  const card = isLightMode ? 'bg-white border-[#eee3cf]' : 'bg-[#1a1410] border-[#3a2f24]';
  const text = isLightMode ? 'text-[#2a2118]' : 'text-white';
  const sub = isLightMode ? 'text-[#8b7a63]' : 'text-[#a08e73]';

  return (
    <div className="h-full flex flex-col p-4 gap-4 overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${card}`}>
        <Search className={`w-4 h-4 ${sub}`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search communities"
          className={`bg-transparent outline-none flex-1 text-sm ${text}`}
        />
        <span className={`text-xs ${sub}`}>{filtered.length} listed</span>
      </div>

      <div className="flex-1 overflow-y-auto grid gap-3 sm:grid-cols-2 auto-rows-min pr-1">
        {filtered.map((c) => (
          <button
            key={c.tower + c.name}
            onClick={() => onCommunitySelect?.(c)}
            className={`text-left p-4 rounded-2xl border transition hover:-translate-y-0.5 ${card}`}
          >
            <div className={`font-semibold mb-1 ${text}`}>{c.name}</div>
            <div className={`flex items-center gap-1 text-xs mb-3 ${sub}`}>
              <MapPin className="w-3 h-3" />
              {c.location}
            </div>
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${sub}`}>
              <span className="flex items-center gap-1"><PawPrint className="w-3 h-3" />{c.petCount} pets</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.walkerCount} walkers</span>
              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{c.rating}</span>
              {c.activeWalks > 0 && (
                <span className="flex items-center gap-1 text-[#3f6c51]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7a9a4e]" />
                  {c.activeWalks} walking now
                </span>
              )}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className={`col-span-full text-center py-10 text-sm ${sub}`}>
            No community matches “{query}”.
          </div>
        )}
      </div>
    </div>
  );
}
