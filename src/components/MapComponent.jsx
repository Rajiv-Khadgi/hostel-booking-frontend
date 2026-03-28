import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
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
    html: `<div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
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
                        <Popup>
                            <div className="font-bold text-blue-600">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Render Hostel Markers */}
                {points.map((pt, idx) => {
                    if (isNaN(pt.lat) || isNaN(pt.lng)) return null;
                    return (
                        <Marker key={idx} position={[pt.lat, pt.lng]}>
                            <Popup>
                                <div className="min-w-[150px]">
                                    <h4 className="font-bold text-gray-900 leading-tight mb-1">{pt.name}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{pt.address}</p>
                                    
                                    {pt.distance !== undefined && (
                                        <div className="text-xs font-semibold text-emerald-600 mb-2">
                                            {parseFloat(pt.distance).toFixed(2)} km away
                                        </div>
                                    )}
                                    
                                    {!singleHostel && pt.hostel_id && (
                                        <Link 
                                            to={`/hostels/${pt.hostel_id}`}
                                            className="block w-full text-center bg-emerald-600 text-white text-xs py-1 rounded hover:bg-emerald-700 transition"
                                        >
                                            View Details
                                        </Link>
                                    )}
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${pt.lat},${pt.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-center bg-blue-600 text-white text-xs py-1 mt-1 rounded hover:bg-blue-700 transition"
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
