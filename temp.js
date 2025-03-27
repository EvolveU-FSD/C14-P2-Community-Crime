function randomCapitalization(input) {
    // Var for new string and character to add.
    let output;
    let char;

    // Get a random num
    let randomVal;

    // For loop to iterate the string.
    for (let i = 0; i < input.length; i++) {
        randomVal = Math.random();
        char = input[i];

        // Test if random is over or under to determine case.
        if (randomVal > .5){

            output += char.toUpperCase();
        } else {
            output += char.toLowerCase();
        }
    }    

    //Return the new string
    return output
}

console.log(randomCapitalization("my favourite colour is green"));