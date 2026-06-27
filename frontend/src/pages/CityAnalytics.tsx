import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, FiSearch, FiSliders, FiInfo, FiTrendingUp, FiFilter, 
  FiCpu, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { getMapData, getReports } from '@/services/api';

// Fix Leaflet marker icon asset paths
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Map panning/flying sub-component using Leaflet's useMap hook
interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Custom Glassmorphic Recharts Tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/20 dark:border-slate-800/85 p-4 rounded-2xl shadow-2xl space-y-2 text-left text-xs min-w-[200px]">
        <p className="font-black text-slate-800 dark:text-white text-sm flex items-center space-x-1.5">
          <span className="text-indigo-400">🏙️</span>
          <span>{label} Hub</span>
        </p>
        <hr className="border-slate-200/30 dark:border-slate-800 my-1" />
        {payload.map((pld: any) => (
          <div key={pld.name} className="flex justify-between items-center space-x-3 font-semibold">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: pld.fill || pld.color }} />
              <span className="text-slate-400">{pld.name}:</span>
            </div>
            <span className="font-black text-slate-700 dark:text-white">{pld.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CityAnalytics: React.FC = () => {
  // Baseline 18-City India Mental Health Dataset
  const baselineCitiesData = useMemo(() => [
    // West
    { city: 'Mumbai', state: 'Maharashtra', zone: 'West', count: 245, risk: 58.4, anxiety: 51.2, depression: 48.6, lat: 19.0760, lon: 72.8777, topAge: '21-35', topJob: 'Employee' },
    { city: 'Pune', state: 'Maharashtra', zone: 'West', count: 124, risk: 42.2, anxiety: 34.5, depression: 38.2, lat: 18.5204, lon: 73.8567, topAge: '18-25', topJob: 'Student' },
    { city: 'Ahmedabad', state: 'Gujarat', zone: 'West', count: 98, risk: 36.5, anxiety: 28.4, depression: 31.8, lat: 23.0225, lon: 72.5714, topAge: '36-50', topJob: 'Business' },
    { city: 'Surat', state: 'Gujarat', zone: 'West', count: 76, risk: 39.8, anxiety: 32.1, depression: 33.5, lat: 21.1702, lon: 72.8311, topAge: '26-35', topJob: 'Business' },
    
    // North
    { city: 'Delhi', state: 'Delhi NCR', zone: 'North', count: 312, risk: 62.8, anxiety: 56.4, depression: 54.1, lat: 28.7041, lon: 77.1025, topAge: '21-35', topJob: 'Employee' },
    { city: 'Lucknow', state: 'Uttar Pradesh', zone: 'North', count: 88, risk: 44.5, anxiety: 38.6, depression: 40.2, lat: 26.8467, lon: 80.9462, topAge: '18-25', topJob: 'Student' },
    { city: 'Jaipur', state: 'Rajasthan', zone: 'North', count: 82, risk: 41.2, anxiety: 33.4, depression: 36.8, lat: 26.9124, lon: 75.7873, topAge: '26-35', topJob: 'Business' },
    { city: 'Chandigarh', state: 'Punjab & Haryana', zone: 'North', count: 64, risk: 34.1, anxiety: 26.8, depression: 29.5, lat: 30.7333, lon: 76.7794, topAge: '18-25', topJob: 'Student' },
    
    // South
    { city: 'Bangalore', state: 'Karnataka', zone: 'South', count: 215, risk: 48.6, anxiety: 42.1, depression: 39.8, lat: 12.9716, lon: 77.5946, topAge: '21-35', topJob: 'Freelancer' },
    { city: 'Chennai', state: 'Tamil Nadu', zone: 'South', count: 118, risk: 38.2, anxiety: 31.2, depression: 34.5, lat: 13.0827, lon: 80.2707, topAge: '36-50', topJob: 'Employee' },
    { city: 'Hyderabad', state: 'Telangana', zone: 'South', count: 142, risk: 45.8, anxiety: 39.4, depression: 37.6, lat: 17.3850, lon: 78.4867, topAge: '21-35', topJob: 'Student' },
    { city: 'Kochi', state: 'Kerala', zone: 'South', count: 58, risk: 32.4, anxiety: 24.6, depression: 28.1, lat: 9.9312, lon: 76.2673, topAge: '36-50', topJob: 'Employee' },
    
    // East & Northeast
    { city: 'Kolkata', state: 'West Bengal', zone: 'East', count: 135, risk: 51.5, anxiety: 44.8, depression: 47.2, lat: 22.5726, lon: 88.3639, topAge: '18-25', topJob: 'Student' },
    { city: 'Bhubaneswar', state: 'Odisha', zone: 'East', count: 52, risk: 37.6, anxiety: 29.8, depression: 32.4, lat: 20.2961, lon: 85.8245, topAge: '26-35', topJob: 'Employee' },
    { city: 'Guwahati', state: 'Assam', zone: 'East', count: 48, risk: 43.2, anxiety: 36.4, depression: 38.9, lat: 26.1158, lon: 91.7086, topAge: '18-25', topJob: 'Student' },
    { city: 'Patna', state: 'Bihar', zone: 'East', count: 94, risk: 49.2, anxiety: 42.1, depression: 44.8, lat: 25.5941, lon: 85.1376, topAge: '18-25', topJob: 'Student' },

    // Central
    { city: 'Bhopal', state: 'Madhya Pradesh', zone: 'Central', count: 67, risk: 40.5, anxiety: 32.8, depression: 35.1, lat: 23.2599, lon: 77.4126, topAge: '26-35', topJob: 'Employee' },
    { city: 'Indore', state: 'Madhya Pradesh', zone: 'Central', count: 72, risk: 42.4, anxiety: 35.2, depression: 36.9, lat: 22.7196, lon: 75.8577, topAge: '21-35', topJob: 'Business' }
  ], []);

  // API Live States
  const [liveMapData, setLiveMapData] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map Navigation States
  const [selectedCityName, setSelectedCityName] = useState<string>('Delhi');
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.7041, 77.1025]); // Delhi
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [mapMode, setMapMode] = useState<'Pins' | 'Heatmap' | 'Bubbles'>('Pins');
  
  // Filters
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // Fetch live map data and raw reports
  useEffect(() => {
    const fetchGeospatialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [mapRes, reportsRes] = await Promise.all([
          getMapData(),
          getReports()
        ]);
        setLiveMapData(mapRes.data);
        setReports(reportsRes.data);
      } catch (err: any) {
        setError(err || 'Failed to connect to the mental health map server.');
      } finally {
        setLoading(false);
      }
    };
    fetchGeospatialData();
  }, []);

  // Hybrid Merging Algorithm: Baseline 18-City Dataset + Live Database Aggregates
  const indiaCitiesData = useMemo(() => {
    // Count real database reports per city
    const cityCounts = new Map<string, number>();
    reports.forEach((r: any) => {
      const cityName = r.City.toLowerCase();
      cityCounts.set(cityName, (cityCounts.get(cityName) || 0) + 1);
    });

    // Create a lookup map of live city aggregates
    const liveMap = new Map<string, any>();
    liveMapData.forEach((item: any) => {
      liveMap.set(item.City.toLowerCase(), item);
    });

    // Overwrite baseline cities with live data if available
    const updatedBaseline = baselineCitiesData.map(c => {
      const cityNameLower = c.city.toLowerCase();
      const liveItem = liveMap.get(cityNameLower);
      const count = cityCounts.get(cityNameLower) || 0;
      
      if (liveItem) {
        // Remove from map to track remaining new cities
        liveMap.delete(cityNameLower);
        return {
          ...c,
          count: count > 0 ? count : c.count,
          risk: liveItem.Risk_Score,
          anxiety: liveItem.Anxiety_Percent,
          depression: liveItem.Depression_Percent,
          lat: liveItem.Latitude || c.lat,
          lon: liveItem.Longitude || c.lon
        };
      }
      return c;
    });

    // Append any brand-new cities added in the database
    const newCities: any[] = [];
    liveMap.forEach((liveItem, cityNameLower) => {
      const count = cityCounts.get(cityNameLower) || 1;
      newCities.push({
        city: liveItem.City,
        state: 'Custom Hub',
        zone: 'Central', // default zone
        count: count,
        risk: liveItem.Risk_Score,
        anxiety: liveItem.Anxiety_Percent,
        depression: liveItem.Depression_Percent,
        lat: liveItem.Latitude || 20.5937,
        lon: liveItem.Longitude || 78.9629,
        topAge: '21-35',
        topJob: 'Employee'
      });
    });

    return [...updatedBaseline, ...newCities];
  }, [reports, liveMapData, baselineCitiesData]);

  // Filtered Data Computation
  const filteredCities = useMemo(() => {
    return indiaCitiesData.filter(c => {
      const matchesZone = zoneFilter === 'All' || c.zone === zoneFilter;
      const matchesRisk = riskFilter === 'All' || 
        (riskFilter === 'High' && c.risk >= 50) ||
        (riskFilter === 'Medium' && c.risk >= 40 && c.risk < 50) ||
        (riskFilter === 'Low' && c.risk < 40);
      return matchesZone && matchesRisk;
    });
  }, [indiaCitiesData, zoneFilter, riskFilter]);

  // Selected City details
  const selectedCityInfo = useMemo(() => {
    return indiaCitiesData.find(c => c.city.toLowerCase() === selectedCityName.toLowerCase()) || indiaCitiesData[0];
  }, [indiaCitiesData, selectedCityName]);

  // Filter search dropdown results
  const searchDropdownResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return indiaCitiesData.filter(c => 
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [indiaCitiesData, searchQuery]);

  // Helper to get custom glowing Leaflet DivIcons
  const getCustomMarkerIcon = (risk: number) => {
    const colorClass = risk >= 50 ? 'bg-red-500 shadow-red-500/50' :
                       risk >= 40 ? 'bg-amber-500 shadow-amber-500/50' :
                       'bg-emerald-500 shadow-emerald-500/50';
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-6 h-6 rounded-full ${colorClass} border-2 border-white dark:border-slate-800 shadow-lg flex items-center justify-center animate-pulse"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  // Selection handlers
  const handleCitySelect = (cityName: string, lat: number, lon: number) => {
    setSelectedCityName(cityName);
    setMapCenter([lat, lon]);
    setMapZoom(9); // Fly/Zoom in to hub
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setShowSearchDropdown(false);
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-[550px] flex flex-col justify-center items-center space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin [animation-duration:0.8s]" />
          <div className="absolute inset-2 rounded-full border-4 border-b-violet-500 border-l-violet-500 border-t-transparent border-r-transparent animate-spin [animation-duration:1.2s] [animation-direction:reverse]" />
          <div className="absolute inset-5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 animate-ping" />
        </div>
        <div className="space-y-1.5 text-center">
          <h4 className="text-xs text-indigo-400 font-bold uppercase tracking-widest animate-pulse">
            Initializing Geographic Grid
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
            Querying India Mental Health Observatory
          </p>
        </div>
      </div>
    );
  }

  // Connection Error view
  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 bg-red-950/10 border border-red-500/20 rounded-3xl backdrop-blur-md relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/25 text-red-400 dark:text-red-400">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2.5">
            <h4 className="text-base font-black text-slate-800 dark:text-white leading-none flex items-center space-x-2">
              Diagnostic Warning: Connection Failure
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              {error}. Make sure the FastAPI backend server is running and reachable on port 8000.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center space-x-2 px-4.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
              style={{ color: '#fca5a5' }}
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
              <span>Retry Handshake</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left font-medium">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight flex items-center space-x-2.5">
            <span className="text-indigo-600 dark:text-indigo-400">🗺️</span>
            <span>Geospatial Observatory & City Analytics</span>
          </h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-1.5">
            Geographic Mapping of mental health metrics and comparative analysis across urban hubs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => { setZoneFilter('All'); setRiskFilter('All'); }}
            className="flex items-center space-x-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold py-2.5 px-4 transition-all"
          >
            <FiSliders className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Map and Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Geospatial Canvas Card */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[560px] relative overflow-hidden">
          {/* Map Header Overlay */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center z-[1000] absolute top-6 left-6 right-6 gap-3">
            {/* Autocomplete Search input */}
            <div className="relative w-full sm:w-64" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center space-x-2.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg">
                <FiSearch className="text-slate-400 w-4 h-4 flex-shrink-0" />
                <input 
                  type="text"
                  placeholder="Search Urban Hub..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="bg-transparent border-none text-xs text-slate-800 dark:text-white outline-none w-full font-bold placeholder-slate-400 dark:placeholder-slate-600"
                />
              </div>
              {/* Search Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchDropdownResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-12 left-0 right-0 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-[1100]"
                  >
                    {searchDropdownResults.map(c => (
                      <button
                        key={c.city}
                        onClick={() => handleCitySelect(c.city, c.lat, c.lon)}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors border-b border-slate-100/50 dark:border-slate-900/50 last:border-0"
                      >
                        <span className="font-extrabold text-slate-800 dark:text-white">{c.city}</span>, {c.state} ({c.zone})
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Layer Selector Toggles */}
            <div className="flex bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg justify-center self-start sm:self-auto">
              {(['Pins', 'Heatmap', 'Bubbles'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setMapMode(mode)}
                  className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg transition-all ${
                    mapMode === mode 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Map Canvas Layer */}
          <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 z-0">
            <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              
              {/* Custom controller to manage center & zooms programmatically */}
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Render active filtered cities based on Layer Modes */}
              {filteredCities.map((c, i) => {
                const isHigh = c.risk >= 50;
                const isMedium = c.risk >= 40 && c.risk < 50;
                const color = isHigh ? '#ef4444' : isMedium ? '#f97316' : '#10b981';

                if (mapMode === 'Pins') {
                  return (
                    <Marker 
                      key={i} 
                      position={[c.lat, c.lon]} 
                      icon={getCustomMarkerIcon(c.risk)}
                      eventHandlers={{
                        click: () => { setSelectedCityName(c.city); setMapCenter([c.lat, c.lon]); }
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-2.5 space-y-2 font-medium max-w-xs text-left">
                          <h6 className="font-black text-sm text-slate-900 dark:text-white flex items-center space-x-1.5 leading-tight">
                            <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
                            <span>{c.city}</span>
                          </h6>
                          <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase leading-none">{c.state} &bull; {c.zone} Zone</p>
                          <hr className="my-1.5 border-slate-100 dark:border-slate-800" />
                          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <p className="flex justify-between"><span>Intake Volume:</span> <span className="font-extrabold text-slate-800 dark:text-white">{c.count}</span></p>
                            <p className="flex justify-between"><span>Avg Stress Risk:</span> <span className="font-black text-red-500">{c.risk.toFixed(1)}%</span></p>
                            <p className="flex justify-between"><span>Avg Anxiety:</span> <span className="font-black text-amber-500">{c.anxiety.toFixed(1)}%</span></p>
                            <p className="flex justify-between"><span>Avg Depression:</span> <span className="font-black text-indigo-600 dark:text-indigo-400">{c.depression.toFixed(1)}%</span></p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                } else if (mapMode === 'Heatmap') {
                  // Overlapping glowing blurred heat signature circles
                  return (
                    <Circle
                      key={i}
                      center={[c.lat, c.lon]}
                      radius={c.count * 600} // Radius proportional to volume
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.18,
                        stroke: false
                      }}
                      eventHandlers={{
                        click: () => { setSelectedCityName(c.city); setMapCenter([c.lat, c.lon]); }
                      }}
                    />
                  );
                } else {
                  // Bubbles Cluster view scaling by intake counts
                  return (
                    <CircleMarker
                      key={i}
                      center={[c.lat, c.lon]}
                      radius={Math.sqrt(c.count) * 2.5 + 4.5} // Scaling factor
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: 0.65,
                        color: '#ffffff',
                        weight: 1.5
                      }}
                      eventHandlers={{
                        click: () => { setSelectedCityName(c.city); setMapCenter([c.lat, c.lon]); }
                      }}
                    >
                      <Popup>
                        <div className="p-2 space-y-1 text-left font-medium">
                          <h6 className="font-black text-xs text-slate-900 dark:text-white flex items-center space-x-1">
                            <FiMapPin className="text-indigo-600" />
                            <span>{c.city}</span>
                          </h6>
                          <p className="text-[9px] text-slate-400 leading-none">{c.state}</p>
                          <hr className="my-1 border-slate-100" />
                          <p className="text-[10px] text-slate-600 text-slate-600">Assessments: <span className="font-bold text-slate-800">{c.count}</span></p>
                          <p className="text-[10px] text-slate-600 text-slate-600">Avg Risk: <span className="font-bold text-red-500">{c.risk.toFixed(1)}%</span></p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                }
              })}
            </MapContainer>
          </div>

          {/* Map Floating Legend (Bottom-Right) */}
          <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/85 shadow-xl z-[1000] w-48 text-[10px] font-bold space-y-2.5">
            <p className="uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center space-x-1.5">
              <FiInfo className="w-3.5 h-3.5" />
              <span>Geospatial Legend</span>
            </p>
            <hr className="border-slate-100 dark:border-slate-850" />
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-sm" />
                <span className="text-slate-600 dark:text-slate-300">High Stress Risk (≥50%)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" />
                <span className="text-slate-600 dark:text-slate-300">Medium Risk (40% - 50%)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
                <span className="text-slate-600 dark:text-slate-300">Low Stress Risk (&lt;40%)</span>
              </div>
            </div>
            {mapMode === 'Bubbles' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850 space-y-1">
                <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 tracking-wide leading-tight">Symbol Size Weight</p>
                <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 mt-1">
                  <span className="w-2 h-2 rounded-full border border-slate-300 dark:border-slate-750 inline-block" />
                  <span>Low Volume</span>
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-750 inline-block" />
                  <span>High Volume</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hub Inspector & Filters Sidebar */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[560px] justify-between space-y-6">
          {/* Filters Section */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center space-x-2">
              <FiFilter className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span>Geographic Filter Hub</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Region Zone Filter */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Region Zone
                </label>
                <div className="relative">
                  <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="All">All Regions</option>
                    <option value="North">North Zone</option>
                    <option value="South">South Zone</option>
                    <option value="East">East Zone</option>
                    <option value="West">West Zone</option>
                    <option value="Central">Central Zone</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Risk Rating Filter */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Risk Rating
                </label>
                <div className="relative">
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="All">All Risks</option>
                    <option value="High">High (≥50%)</option>
                    <option value="Medium">Medium (40-50%)</option>
                    <option value="Low">Low (&lt;40%)</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <hr className="border-slate-100 dark:border-slate-850" />
          </div>

          {/* Hub Inspector */}
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            <div className="border-l-4 border-indigo-600 dark:border-indigo-400 pl-4 space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Observed Hub</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {selectedCityInfo.city}
              </h4>
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase leading-none">{selectedCityInfo.state} &bull; {selectedCityInfo.zone} Zone</p>
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-850 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-lg" />
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Assessment Volume</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{selectedCityInfo.count}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-850 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 rounded-full blur-lg" />
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Average Stress Risk</p>
                <p className="text-2xl font-black text-red-500 mt-1">{selectedCityInfo.risk.toFixed(1)}%</p>
              </div>
            </div>

            {/* AI Demographic Insights Card */}
            <motion.div
              key={selectedCityInfo.city}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative p-5 rounded-2xl border border-indigo-500/20 dark:border-indigo-500/10 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.08)] overflow-hidden text-left"
            >
              {/* Glowing Corner Accents */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/5 dark:from-indigo-400/10 to-transparent rounded-full blur-xl pointer-events-none" />
              
              {/* AI Spark Header */}
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/30 rounded-lg blur-md animate-pulse" />
                  <FiCpu className="w-4 h-4 relative z-10 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 text-transparent">
                  AI Hub Insights Engine
                </span>
              </div>

              {/* Metric Summary Grid inside Insights */}
              <div className="space-y-2.5 text-[11px] leading-relaxed font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex justify-between items-center bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-slate-400">📍 Region:</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{selectedCityInfo.city}</span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-slate-400">👥 Elevated Cohort:</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{selectedCityInfo.topAge}</span>
                </div>
                <div className="flex justify-between items-center bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-slate-400">💼 Occupation Focus:</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{selectedCityInfo.topJob}</span>
                </div>
                <p className="text-slate-400 dark:text-slate-500 mt-2 text-[10px] leading-normal font-semibold">
                  Clinical predictive metrics suggest high stress indexes mostly clustered among the <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedCityInfo.topAge}</span> demographic working as <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedCityInfo.topJob.toLowerCase()}s</span>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Comparative Regional Observatory Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-50 dark:border-slate-850">
          <div>
            <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center space-x-2">
              <FiTrendingUp className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span>Inter-Hub Comparative Observatory</span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-1">Comparative Risk, Anxiety, and Depression Across Filtered Hubs ({filteredCities.length} Cities)</p>
          </div>
        </div>
        
        {filteredCities.length > 0 ? (
          <div className="h-96 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCities} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/80" vertical={false} />
                <XAxis dataKey="city" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" domain={[0, 100]} />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                <Legend 
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', paddingTop: 20, letterSpacing: '0.05em' }} 
                />
                <Bar dataKey="risk" fill="#ef4444" radius={[6, 6, 0, 0]} name="Stress Risk" maxBarSize={32} />
                <Bar dataKey="anxiety" fill="#f97316" radius={[6, 6, 0, 0]} name="Anxiety Intensity" maxBarSize={32} />
                <Bar dataKey="depression" fill="#6366f1" radius={[6, 6, 0, 0]} name="Depression Intensity" maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-5 bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold">No urban hubs match the active filter criteria. Reset the filters to view comparative stats.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityAnalytics;
