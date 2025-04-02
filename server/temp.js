// fetch("https://data.calgary.ca/resource/78gh-n26t.json")
//     .then((res) => res.json())
//     .then((result) => console.log(result))
//     .catch((err) => console.error(`Fetch error: ${err}`));

// async function getCityAPICrimes() {
//     await fetch("https://data.calgary.ca/resource/78gh-n26t.json")
//         .then((res) => res.json())
//         .then((result) => console.log(result))
//         .catch((err) => console.error(`Fetch error: ${err}`))
// } 

// getCityAPICrimes();

const getCityAPICrimes = async () => {
    try {
        const response = await fetch("https://data.calgary.ca/resource/78gh-n26t.json")
        const result = await response.json();
        console.log(result);
    } catch (err) {
        console.error(`Fetch error: ${err}`);
    }
}

getCityAPICrimes();
