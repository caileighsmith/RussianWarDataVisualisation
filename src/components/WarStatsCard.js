import React, { useEffect, useState } from 'react';
import './WarStatsCard.css'; // Import the CSS file for styling

function WarStatsCard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        async function fetchWarStats() {
            const apiUrl = "https://ukr.warspotting.net/api/stats/russia/";
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching war stats:', error);
            }
        }

        fetchWarStats();
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2>Russian Losses Statistics</h2>
            </div>
            <div className="card-body">
                <h3>Counts by Status</h3>
                <ul>
                    {Object.entries(data.counts_by_status).map(([status, count]) => (
                        <li key={status}>{status}: {count}</li>
                    ))}
                </ul>
                <h3>Counts by Type</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Losses</th>
                            <th>New Losses</th>
                            <th>Damaged</th>
                            <th>New Damaged</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.counts_by_type.map((item, index) => (
                            <tr key={index}>
                                <td>{item.type_name}</td>
                                <td>{item.counts.losses}</td>
                                <td>{item.counts.losses_new}</td>
                                <td>{item.counts.damaged}</td>
                                <td>{item.counts.damaged_new}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default WarStatsCard;