export async function findAllCommunityBoundaries() {
    const fetchResult = await fetch(`/api/allCommunities`)
    if (fetchResult.ok) {
        return await fetchResult.json();
    }
    throw new Error('Fetch failed');
}

export async function findCommunityByCommCode(commCode) {
    const fetchResult = await fetch(`/api/community/${commCode}`);
    if (fetchResult.ok) {
        return await fetchResult.json();
    }
    throw new Error(`Fetch of Community by Comm Code ${commCode} failed.`);
}