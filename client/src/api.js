export async function findAllCommunityBoundaries() {
    const fetchResult = await fetch(`/api/allCommunities`)
    if (fetchResult.ok) {
        return await fetchResult.json();
    }
    throw new Error('Fetch failed');
}