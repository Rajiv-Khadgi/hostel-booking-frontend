import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// A different colored icon for the user location (using a standard Leaflet feature hack or custom div)
const UserLocationIcon = L.divIcon({
    className: 'custom-user-location-marker',
    html: `<div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); position: relative;"><div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background-color: #ef4444; opacity: 0.4; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-fit bounds when there are multiple points
const ChangeView = ({ center, zoom, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            const leafletBounds = L.latLngBounds(bounds.map(b => [b.lat, b.lng]));
            map.fitBounds(leafletBounds, { padding: [50, 50] });
        } else if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, bounds, map]);
    return null;
};

export default function MapComponent({ 
    center = [27.7172, 85.3240], // Default Kathmandu
    zoom = 13, 
    hostels = [], 
    singleHostel = null, // Used for showing a single point in details page
    userLocation = null, // Used for showing user's current location marker
    height = "400px" 
}) {
    const points = singleHostel 
        ? [{ lat: parseFloat(singleHostel.latitude), lng: parseFloat(singleHostel.longitude), ...singleHostel }] 
        : hostels.filter(h => h.latitude && h.longitude).map(h => ({
            lat: parseFloat(h.latitude),
            lng: parseFloat(h.longitude),
            ...h
        }));

    // If single point or empty, use center and zoom. If multiple, calc bounds.
    let bounds = null;
    let actualCenter = center;

    if (points.length === 1 && !isNaN(points[0].lat) && !isNaN(points[0].lng)) {
        actualCenter = [points[0].lat, points[0].lng];
    } else if (points.length > 1) {
        bounds = points;
    }

    // Always center on user if user location exists and we are rendering for nearby search
    if (userLocation && userLocation.lat && userLocation.lng) {
        actualCenter = [userLocation.lat, userLocation.lng];
        // If there's a userLocation, we can add it to bounds to make sure the user and hostels are all in view
        if (bounds) {
             bounds.push({ lat: userLocation.lat, lng: userLocation.lng });
        }
    }

    // Handle case where we don't have valid coordinates and no userLocation
    if (points.length === 0 && !center && !userLocation) {
        return <div className="bg-gray-100 flex items-center justify-center rounded-xl" style={{ height }}>
            <p className="text-gray-500">Location not available</p>
        </div>;
    }

    return (
        <div style={{ height, width: "100%", zIndex: 0 }} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 z-0">
            <style>{`
                .custom-tooltip {
                    background: white !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 6px !important;
                    padding: 4px 8px !important;
                    font-weight: 600 !important;
                    font-size: 0.75rem !important;
                    color: #1a202c !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                }
                .custom-tooltip:before {
                    border-top-color: white !important;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    background: white !important;
                    color: #1a202c !important;
                    border-radius: 12px !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 12px 16px !important;
                    width: auto !important;
                }
                .custom-popup .leaflet-popup-content a {
                    color: white !important;
                    text-decoration: none !important;
                }
                .custom-popup .leaflet-popup-tip-container {
                    margin-top: -1px !important;
                }
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
            <MapContainer 
                center={actualCenter} 
                zoom={zoom} 
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <ChangeView center={actualCenter} zoom={zoom} bounds={bounds} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Render User Location Marker if Provided */}
                {userLocation && userLocation.lat && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={UserLocationIcon}>
                        <Popup className="custom-popup">
                            <div className="font-bold text-red-600">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Render Hostel Markers */}
                {points.map((pt, idx) => {
                    if (isNaN(pt.lat) || isNaN(pt.lng)) return null;
                    return (
                        <Marker key={idx} position={[pt.lat, pt.lng]}>
                            <Tooltip 
                                permanent 
                                direction="top" 
                                offset={[0, -32]} 
                                className="custom-tooltip"
                            >
                                {pt.name}
                            </Tooltip>
                            <Popup className="custom-popup">
                                <div className="min-w-[180px] p-1">
                                    <h4 className="font-bold text-gray-950 text-sm leading-tight mb-1">{pt.name}</h4>
                                    <p className="text-xs text-gray-600 mb-3">{pt.address}</p>
                                    
                                    {pt.distance !== undefined && (
                                        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-3">
                                            {parseFloat(pt.distance).toFixed(2)} km away
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col gap-2 mt-2">
                                        {!singleHostel && pt.hostel_id && (
                                            <Link 
                                                to={`/hostels/${pt.hostel_id}`}
                                                className="flex items-center justify-center w-full bg-emerald-700 text-white text-[11px] font-semibold py-1.5 rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                                            >
                                                View Details
                                            </Link>
                                        )}
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-full bg-slate-900 text-white text-[11px] font-semibold py-1.5 rounded-lg hover:bg-black transition-colors shadow-sm"
                                        >
                                            Get Directions
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
