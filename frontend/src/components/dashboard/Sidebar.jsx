import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTodo } from '../../contexts/TodoContext';

const Sidebar = ({ onAdd }) => {
  const { setFilters, clearFilters } = useTodo();
  const [q, setQ] = useState('');

  const applySearch = (v) => {
    setQ(v);
    setFilters({ search: v || undefined });
  };

  return (
    <aside className="card space-y-6">
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={q}
            onChange={(e) => applySearch(e.target.value)}
            placeholder="Search"
            className="input pl-10"
          />
        </div>
      </div>

      {/* Sections removed per request: Tasks, Lists, Tags */}

      <div className="pt-4 border-t">
        <button onClick={clearFilters} className="btn btn-secondary w-full">Show All</button>
      </div>
    </aside>
  );
};

export default Sidebar;
