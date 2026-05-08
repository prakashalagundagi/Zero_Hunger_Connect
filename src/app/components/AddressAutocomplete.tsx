import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onSelect: (address: string, lat: number, lng: number) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function AddressAutocomplete({
  value,
  onSelect,
  onChange,
  placeholder = 'Search for a pickup address...',
  required,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (query: string) => {
    if (query.trim().length < 4) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=6&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setIsVerified(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 500);
  };

  const handleSelect = (result: NominatimResult) => {
    const address = result.display_name;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onChange(address);
    onSelect(address, lat, lng);
    setIsVerified(true);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    onChange('');
    setIsVerified(false);
    setSuggestions([]);
    setShowDropdown(false);
    onSelect('', 0, 0);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={`w-full pl-10 pr-10 py-2 border rounded-md text-sm outline-none transition-colors
            ${isVerified
              ? 'border-green-500 bg-green-50 focus:ring-2 focus:ring-green-300'
              : 'border-gray-300 bg-white focus:ring-2 focus:ring-green-200 focus:border-green-400'
            }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          {isVerified && !isSearching && (
            <span className="text-green-600 text-xs font-medium">✓ Verified</span>
          )}
          {value && !isSearching && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((result) => (
            <li key={result.place_id}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                onClick={() => handleSelect(result)}
              >
                <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800 line-clamp-2">{result.display_name}</span>
              </button>
            </li>
          ))}
          <li className="px-4 py-2 text-xs text-gray-400 text-right border-t border-gray-100">
            © OpenStreetMap contributors
          </li>
        </ul>
      )}

      {/* Hint when typing but not yet verified */}
      {!isVerified && value.length >= 4 && !showDropdown && !isSearching && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <span>⚠</span> Please select an address from the suggestions list to verify it
        </p>
      )}
      {isVerified && (
        <p className="text-xs text-green-600 mt-1">✓ Address verified on OpenStreetMap</p>
      )}
    </div>
  );
}
