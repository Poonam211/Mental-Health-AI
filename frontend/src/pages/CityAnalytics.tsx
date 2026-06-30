import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMapPin, FiSearch, FiInfo, FiTrendingUp, FiFilter, 
  FiCpu, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { getMapData } from '@/services/api';

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
      <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-2 text-left text-xs min-w-[200px] text-white">
        <p className="font-black text-sm flex items-center space-x-1.5 text-white">
          <span className="text-indigo-400">🏙️</span>
          <span>{label} Hub</span>
        </p>
        <hr className="border-slate-800 my-1" />
        {payload.map((pld: any) => (
          <div key={pld.name} className="flex justify-between items-center space-x-3 font-semibold">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: pld.fill || pld.color }} />
              <span className="text-slate-300">{pld.name}:</span>
            </div>
            <span className="font-black text-white">
              {pld.value !== null && pld.value !== undefined ? pld.value.toFixed(1) : '0.0'}
              {pld.name.includes('AQI') || pld.name.includes('Air Quality') ? '' : '%'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CityAnalytics: React.FC = () => {
  // API Live States
  const [liveMapData, setLiveMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Map Navigation States
  const [selectedCityName, setSelectedCityName] = useState<string>('Delhi');
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.7041, 77.1025]); // Delhi
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [mapMode, setMapMode] = useState<'Pins' | 'Heatmap' | 'Bubbles'>('Pins');
  
  // Filters
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('High');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // Fetch live map data
  useEffect(() => {
    const fetchGeospatialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const mapRes = await getMapData();
        setLiveMapData(mapRes.data);
        // Automatically center map to first hub if exists
        if (mapRes.data && mapRes.data.length > 0) {
          const firstHub = mapRes.data[0];
          setSelectedCityName(firstHub.City);
          if (firstHub.Latitude && firstHub.Longitude) {
            setMapCenter([firstHub.Latitude, firstHub.Longitude]);
          }
        }
      } catch (err: any) {
        setError(err.message || String(err) || 'Failed to connect to the mental health map server.');
      } finally {
        setLoading(false);
      }
    };
    fetchGeospatialData();
  }, []);

  // India Cities Data calculated 100% dynamically from API liveMapData
  const indiaCitiesData = useMemo(() => {
    return liveMapData.map((item: any) => ({
      city: item.City,
      state: item.State || 'India',
      zone: item.Zone || 'Central',
      count: item.Count || 1,
      risk: item.Composite_Risk_Index || item.Risk_Score,
      clinical_risk: item.Risk_Score,
      anxiety: item.Anxiety_Percent,
      depression: item.Depression_Percent,
      lat: item.Latitude,
      lon: item.Longitude,
      topAge: item.Top_Age || '21-35',
      topJob: item.Top_Job || 'Employee',
      aqi: item.aqi,
      population_density: item.population_density,
      google_trends: item.google_trends,
      weather_stress: item.weather_stress,
      employment_stress: item.employment_stress,
      sentiment_index: item.sentiment_index
    }));
  }, [liveMapData]);

  // Filtered Data Computation
  const filteredCities = useMemo(() => {
    return indiaCitiesData.filter(c => {
      const matchesZone = zoneFilter === 'All' || c.zone === zoneFilter;
      const matchesRisk = riskFilter === 'All' || 
        (riskFilter === 'High' && c.risk >= 50) ||
        (riskFilter === 'Medium' && c.risk >= 40 && c.risk < 50) ||
        (riskFilter === 'Low' && c.risk < 40);
      
      const isSearchedCity = c.city.toLowerCase() === selectedCityName.toLowerCase();
      
      return (matchesZone && matchesRisk) || isSearchedCity;
    });
  }, [indiaCitiesData, zoneFilter, riskFilter, selectedCityName]);

  // Scalable chart data: Top 8 High-Risk cities, always including the searched city
  const chartCitiesData = useMemo(() => {
    const sorted = [...filteredCities].sort((a, b) => b.risk - a.risk);
    const top8 = sorted.slice(0, 8);
    const selectedInTop8 = top8.some(c => c.city.toLowerCase() === selectedCityName.toLowerCase());
    
    if (!selectedInTop8) {
      const selectedCity = filteredCities.find(c => c.city.toLowerCase() === selectedCityName.toLowerCase());
      if (selectedCity) {
        top8.push(selectedCity);
      }
    }
    return top8;
  }, [filteredCities, selectedCityName]);

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
    const colorClass = risk >= 65 ? 'bg-red-600 shadow-red-600/50' :
                       risk >= 50 ? 'bg-orange-500 shadow-orange-500/50' :
                       risk >= 35 ? 'bg-yellow-500 shadow-yellow-500/50' :
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
      </div>

      {/* Main Grid: Left Map and Right Inspector */}
      {indiaCitiesData.length > 0 ? (
        <>
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
                const color = c.risk >= 65 ? '#dc2626' :
                              c.risk >= 50 ? '#f97316' :
                              c.risk >= 35 ? '#eab308' : '#10b981';

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
                            <p className="flex justify-between"><span>City Risk Index:</span> <span className="font-black text-red-500">{c.risk.toFixed(1)}%</span></p>
                            <p className="flex justify-between"><span>Clinical Stress:</span> <span className="font-black text-amber-500">{c.clinical_risk.toFixed(1)}%</span></p>
                            <p className="flex justify-between"><span>Air Quality Index:</span> <span className="font-black text-indigo-600 dark:text-indigo-400">{c.aqi} AQI</span></p>
                            <p className="flex justify-between"><span>Avg Anxiety:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{c.anxiety.toFixed(1)}%</span></p>
                            <p className="flex justify-between"><span>Avg Depression:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{c.depression.toFixed(1)}%</span></p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                } else if (mapMode === 'Heatmap') {
                  // Overlapping glowing blurred heat signature circles using concentric circles
                  return (
                    <React.Fragment key={i}>
                      <Circle
                        center={[c.lat, c.lon]}
                        radius={80000 + Math.min(c.count * 10000, 120000)}
                        pathOptions={{
                          fillColor: color,
                          fillOpacity: 0.08,
                          stroke: false
                        }}
                        eventHandlers={{
                          click: () => { setSelectedCityName(c.city); setMapCenter([c.lat, c.lon]); }
                        }}
                      />
                      <Circle
                        center={[c.lat, c.lon]}
                        radius={40000 + Math.min(c.count * 5000, 60000)}
                        pathOptions={{
                          fillColor: color,
                          fillOpacity: 0.15,
                          stroke: false
                        }}
                        eventHandlers={{
                          click: () => { setSelectedCityName(c.city); setMapCenter([c.lat, c.lon]); }
                        }}
                      />
                      <Circle
                        center={[c.lat, c.lon]}
                        radius={15000 + Math.min(c.count * 2000, 25000)}
                        pathOptions={{
                          fillColor: color,
                          fillOpacity: 0.3,
                          stroke: false
                        }}
                        eventHandlers={{
                          click: () => { setSelectedCityName(c.city); setMapCenter([c.lat, c.lon]); }
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="p-2.5 space-y-2 font-medium max-w-xs text-left">
                            <h6 className="font-black text-sm text-slate-900 dark:text-white flex items-center space-x-1.5 leading-tight">
                              <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
                              <span>{c.city} (Heat Signature)</span>
                            </h6>
                            <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase leading-none">{c.state} &bull; {c.zone} Zone</p>
                            <hr className="my-1.5 border-slate-100 dark:border-slate-800" />
                            <div className="space-y-1.5 text-xs text-slate-655 dark:text-slate-300">
                              <p className="flex justify-between"><span>Intake Volume:</span> <span className="font-extrabold text-slate-800 dark:text-white">{c.count}</span></p>
                              <p className="flex justify-between"><span>City Risk Index:</span> <span className="font-black text-red-500">{c.risk.toFixed(1)}%</span></p>
                              <p className="flex justify-between"><span>Clinical Stress:</span> <span className="font-black text-amber-500">{c.clinical_risk.toFixed(1)}%</span></p>
                            </div>
                          </div>
                        </Popup>
                      </Circle>
                    </React.Fragment>
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
                          <p className="text-[10px] text-slate-650">Assessments: <span className="font-bold text-slate-800 dark:text-slate-200">{c.count}</span></p>
                          <p className="text-[10px] text-slate-650">City Risk Index: <span className="font-black text-red-500">{c.risk.toFixed(1)}%</span></p>
                          <p className="text-[10px] text-slate-650">AQI: <span className="font-bold text-slate-850 dark:text-white">{c.aqi} AQI</span></p>
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
                <span className="w-2.5 h-2.5 rounded-full bg-red-650 inline-block shadow-sm" style={{ backgroundColor: '#dc2626' }} />
                <span className="text-slate-600 dark:text-slate-300">Critical Index (≥65%)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm" />
                <span className="text-slate-600 dark:text-slate-300">High Risk (50% - 65%)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-sm" />
                <span className="text-slate-600 dark:text-slate-300">Moderate Risk (35% - 50%)</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" />
                <span className="text-slate-600 dark:text-slate-300">Low Risk (&lt;35%)</span>
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
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-850 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-lg" />
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">Assessment Volume</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{selectedCityInfo.count}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-850 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/5 rounded-full blur-lg" />
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">City Risk Index</p>
                <p className="text-2xl font-black text-red-500 mt-1">{selectedCityInfo.risk.toFixed(1)}%</p>
              </div>
            </div>

            {/* Environmental Stressors Grid */}
            <div className="bg-slate-50 dark:bg-slate-955 p-4 rounded-2xl border border-slate-100/60 dark:border-slate-850 shadow-sm space-y-3">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                🌳 Environmental & Public Indicators
              </p>
              <div className="grid grid-cols-2 gap-3 text-[11px] leading-relaxed font-bold text-slate-600 dark:text-slate-350">
                <div className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">Air Quality (AQI)</span>
                  <span className={`text-[10px] font-black ${selectedCityInfo.aqi === null || selectedCityInfo.aqi === undefined ? 'text-slate-400' : selectedCityInfo.aqi > 150 ? 'text-red-500' : selectedCityInfo.aqi > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {selectedCityInfo.aqi !== null && selectedCityInfo.aqi !== undefined ? `${selectedCityInfo.aqi} AQI` : 'Data Not Available'}
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">Pop. Density</span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white truncate">
                    {selectedCityInfo.population_density !== null && selectedCityInfo.population_density !== undefined ? `${selectedCityInfo.population_density.toLocaleString()} /km²` : 'Data Not Available'}
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">Weather Stress</span>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white">
                    {selectedCityInfo.weather_stress !== null && selectedCityInfo.weather_stress !== undefined ? `${selectedCityInfo.weather_stress.toFixed(1)} / 10` : 'Data Not Available'}
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase tracking-wider">Google Trends</span>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                    {selectedCityInfo.google_trends !== null && selectedCityInfo.google_trends !== undefined ? `${selectedCityInfo.google_trends} / 100` : 'Data Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
           {/* AI Demographic Insights Card (Full Width Horizontal Layout) */}
      <motion.div
        key={selectedCityInfo.city}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative p-6 rounded-3xl border border-indigo-500/20 dark:border-indigo-500/10 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-950 dark:to-indigo-950/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.08)] overflow-hidden text-left"
      >
        {/* Glowing Corner Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/5 dark:from-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Left Side: Header */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/30 rounded-lg blur-md animate-pulse" />
                <FiCpu className="w-4 h-4 relative z-10 animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 text-transparent">
                AI Hub Insights Engine
              </span>
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Demographic Projections
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Real-time cohort and stress projections for {selectedCityInfo.city}
            </p>
          </div>

          {/* Right Side: Metrics Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col justify-between shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Observed Hub</span>
              <span className="font-extrabold text-xs text-slate-800 dark:text-white mt-1">{selectedCityInfo.city}</span>
            </div>
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col justify-between shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Elevated Cohort</span>
              <span className="font-extrabold text-xs text-slate-800 dark:text-white mt-1">{selectedCityInfo.topAge} Years</span>
            </div>
            <div className="bg-white dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-800/60 flex flex-col justify-between shadow-sm">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Occupation Focus</span>
              <span className="font-extrabold text-xs text-slate-800 dark:text-white mt-1">{selectedCityInfo.topJob}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-200/50 dark:border-slate-800/60 my-4" />
        
        <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-350 relative z-10">
          Clinical predictive metrics suggest high stress indexes mostly clustered among the <strong className="text-indigo-600 dark:text-indigo-400 font-black">{selectedCityInfo.topAge}</strong> demographic working as <strong className="text-indigo-600 dark:text-indigo-400 font-black">{selectedCityInfo.topJob.toLowerCase()}s</strong>.
        </p>
      </motion.div>

      {/* Regional Analytics and Environmental Correlation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Inter-Hub Comparative Observatory */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-50 dark:border-slate-850">
            <div>
              <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center space-x-2">
                <FiTrendingUp className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                <span>Inter-Hub Comparative Observatory</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-1">
                Comparative Risk, Anxiety, and Depression Across Filtered Hubs (Top High-Risk)
              </p>
            </div>
          </div>
          
          {chartCitiesData.length > 0 ? (
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCitiesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/80" vertical={false} />
                  <XAxis dataKey="city" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" domain={[0, 100]} />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                  <Legend 
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', paddingTop: 20, letterSpacing: '0.05em' }} 
                  />
                  <Bar dataKey="risk" fill="#ef4444" radius={[6, 6, 0, 0]} name="Stress Risk Index" maxBarSize={20} />
                  <Bar dataKey="anxiety" fill="#f97316" radius={[6, 6, 0, 0]} name="Anxiety Intensity" maxBarSize={20} />
                  <Bar dataKey="depression" fill="#6366f1" radius={[6, 6, 0, 0]} name="Depression Intensity" maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-5 bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-bold">No urban hubs match the active filter criteria.</span>
            </div>
          )}
        </div>

        {/* Environmental Stressor Correlation Analyzer */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-50 dark:border-slate-850">
            <div>
              <h3 className="text-lg font-black text-slate-850 dark:text-white flex items-center space-x-2">
                <span>🌳</span>
                <span>Environmental Stressor Correlation Analyzer</span>
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider mt-1">
                Visualizing how Air Quality (AQI) aligns with Calculated Stress Risk (Top High-Risk)
              </p>
            </div>
          </div>

          {chartCitiesData.length > 0 ? (
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCitiesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/80" vertical={false} />
                  <XAxis dataKey="city" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" />
                  {/* Left Axis for Risk Index */}
                  <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" domain={[0, 100]} />
                  {/* Right Axis for AQI */}
                  <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" fontSize={10} tickLine={false} axisLine={false} className="font-extrabold" domain={[0, 400]} />
                  <Tooltip 
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-955/95 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl space-y-2 text-left text-xs min-w-[200px] text-white">
                            <p className="font-black text-sm">🏙️ {label} Correlation</p>
                            <hr className="border-slate-800 my-1" />
                            <p className="flex justify-between">
                              <span className="text-red-400 font-black">Risk Index:</span>
                              <span className="font-bold text-white">{payload[0]?.value.toFixed(1)}%</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-sky-400 font-black">Air Quality:</span>
                              <span className="font-bold text-white">{payload[1]?.value} AQI</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    iconSize={8}
                    iconType="circle"
                    wrapperStyle={{ fontSize: 9, fontWeight: '800', textTransform: 'uppercase', paddingTop: 20, letterSpacing: '0.05em' }} 
                  />
                  <Bar yAxisId="left" dataKey="risk" fill="#ef4444" radius={[6, 6, 0, 0]} name="City Risk Index" maxBarSize={20} />
                  <Bar yAxisId="right" dataKey="aqi" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Air Quality (AQI)" maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-5 bg-amber-50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-bold">No urban hubs match the active filter criteria.</span>
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center space-y-4 shadow-sm flex flex-col justify-center items-center w-full">
      <span className="text-4xl">🏙️</span>
      <h4 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-wider">No Active Urban Hubs</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-sm leading-relaxed">
        No clinical intakes have been recorded in the database yet. Please complete a mental health assessment first to initialize the geospatial grid.
      </p>
    </div>
  )}
</div>
  );
};

export default CityAnalytics;
