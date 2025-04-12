import { useEffect, useState } from "react"

const CrimeDataDisplay = () => {
    const [crimes, setCrimes] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [crimeSummary, setCrimeSummary] = useState([]);
    const [loading, setLoading] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [crimesResponse, communitiesResponse, summaryResponse] = await Promise.all([
                    await fetch('/api/allCrimes'),
                    await fetch('/api/allCommunities'),
                    await fetch('/api/crimeSummary')
                ]);

                if (!crimesResponse.ok 
                    || !communitiesResponse.ok
                    || !summaryResponse.ok
                ) {
                    throw new Error('Internal API call error');
                }

                const crimesData = await crimesResponse.json();
                const communitiesData = await communitiesResponse.json();
                const summaryData = await summaryResponse.json();

                setCrimes(crimesData);
                setCommunities(communitiesData);
                setCrimeSummary(summaryData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Communities</h2>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Sector</th>
                        </tr>
                    </thead>
                    <tbody>
                        {communities.map((community) => (
                            <tr key={community._id}>
                                <td>{community.name}</td>
                                <td>{community.sector}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2>Crime Summary by Community</h2>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            <table>
                <thead>
                    <tr>
                        <th>Community</th>
                        <th>Total Crimes</th>
                    </tr>
                </thead>
                <tbody>
                    {crimeSummary.map((summary) => (
                        <tr key={summary._id}>
                            <td>{summary._id}</td>
                            <td>{summary.totalCrimes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            <h2>Crime Data</h2>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Community</th>
                            <th>Category</th>
                            <th>Count</th>
                            <th>Year</th>
                            <th>Month</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crimes.map((crime) => (
                            <tr key={crime._id}>
                                <td>{crime.community}</td>
                                <td>{crime.category}</td>
                                <td>{crime.crimeCount}</td>
                                <td>{crime.year}</td>
                                <td>{crime.month}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CrimeDataDisplay;