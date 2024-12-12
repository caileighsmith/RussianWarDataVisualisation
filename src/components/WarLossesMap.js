import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WarLossesMap.css'; // Import the CSS file for styling

function WarLossesMap() {
    const [data, setData] = useState(null);
    const [showRecentLosses, setShowRecentLosses] = useState(false);
    const [selectedLoss, setSelectedLoss] = useState(null);
    const mapRef = useRef();
    const mapContainerRef = useRef();

    useEffect(() => {
        async function fetchLosses() {
            const apiUrl = "https://ukr.warspotting.net/api/losses/russia/";
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching war losses:', error);
            }
        }

        fetchLosses();
    }, []);

    useEffect(() => {
        if (selectedLoss && selectedLoss.geo) {
            const [lat, lon] = selectedLoss.geo.split(',').map(Number);
            const map = mapRef.current;
            if (map) {
                map.flyTo([lat, lon], 10);
            }
            if (mapContainerRef.current) {
                mapContainerRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [selectedLoss]);

    if (!data) {
        return <div>Loading...</div>;
    }

    // Identify the most recent losses
    const recentLosses = data.losses.filter(loss => {
        const lossDate = new Date(loss.date);
        const today = new Date();
        const timeDiff = Math.abs(today - lossDate);
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays <= 7; // Highlight losses within the last 7 days
    });

    // Calculate days without reported losses
    const lastLossDate = new Date(Math.max(...data.losses.map(loss => new Date(loss.date))));
    const today = new Date();
    const daysWithoutLosses = Math.ceil((today - lastLossDate) / (1000 * 3600 * 24));

    const markers = data.losses
        .filter(loss => loss.geo)
        .map(loss => {
            const [lat, lon] = loss.geo.split(',').map(Number);
            const isSelected = selectedLoss && selectedLoss.id === loss.id;
            return (
                <Marker key={loss.id} position={[lat, lon]} opacity={isSelected ? 1 : 0.5}>
                    <Popup>
                        <div>
                            <h3>{loss.type}</h3>
                            <p>Model: {loss.model}</p>
                            <p>Status: {loss.status}</p>
                            <p>Lost by: {loss.lost_by}</p>
                            <p>Date: {loss.date}</p>
                            <p>Location: {loss.nearest_location}</p>
                            <p>Tags: {loss.tags}</p>
                        </div>
                    </Popup>
                </Marker>
            );
        });

    const handleListItemClick = (loss) => {
        setSelectedLoss(loss);
        const [lat, lon] = loss.geo.split(',').map(Number);
        const map = mapRef.current;
        if (map) {
            map.flyTo([lat, lon], 10);
            setTimeout(() => {
                map.eachLayer((layer) => {
                    if (layer.getLatLng && layer.getLatLng().lat === lat && layer.getLatLng().lng === lon) {
                        layer.openPopup();
                    }
                });
            }, 1000);
        }
        if (mapContainerRef.current) {
            mapContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2>Russian Losses</h2>
                <p>Days <u>without</u> reported losses: {daysWithoutLosses}.</p>
                <small>Strictly showing <strong>reported</strong> losses. Majority of losses will be unreported.</small>
            </div>
            <div className="card-body" ref={mapContainerRef}>
                <MapContainer center={[48.3794, 31.1656]} zoom={6} className="map-container" ref={mapRef}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {markers}
                </MapContainer>
                <button className="toggle-button" onClick={() => setShowRecentLosses(!showRecentLosses)}>
                    {showRecentLosses ? 'Hide Recent Losses' : 'Show Recent Losses'}
                </button>
                {showRecentLosses && (
                    <div className="recent-losses">
                        <h3><u>Most Recent Losses (Last 7 Days)</u>:</h3>
                        <ul className="recent-losses-list">
                            {recentLosses.map(loss => (
                                <li key={loss.id} onClick={() => handleListItemClick(loss)}>
                                    <strong>{loss.type}</strong> - {loss.model} ({loss.status})<br />
                                    <small>{loss.date} - {loss.nearest_location}</small>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WarLossesMap;