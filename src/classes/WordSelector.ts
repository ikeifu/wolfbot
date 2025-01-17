import { generateSlug } from "random-word-slugs";

export enum Adjectives {
    Appearence = "appearence",
    Color = "color",
    Condition = "condition",
    Personality = "personality",
    Quantity = "quantity",
    Shape = "shapes",
    Size = "size",
    Sound = "sounds",
    Taste = "taste",
    Time = "time",
    Touch = "touch"
}

export enum Nouns {
    Animal = "animals",
    Business = "business",
    Education = "education",
    Family = "family",
    Food = "food",
    Health = "health",
    Media = "media",
    People = "people",
    Place = "place",
    Profession = "profession",
    Religion = "religion",
    Science = "science",
    Sport = "sports",
    Technology = "technology",
    Thing = "thing",
    Time = "time",
    Transportation = "transportation"
}

export enum Categories {
    Noun = "noun",
    Adjective = "adjective"
}

export interface WordPair {
    minorityWord: string;
    majorityWord: string;
}

export class WordSelector{

    static Validate(input: string) : boolean {
        let valid = input.includes('|');

        if(valid){
            let splitWords = input.split('|');

            valid = splitWords.length === 2 &&
                    splitWords[0].trim().length > 0 &&
                    splitWords[1].trim().length > 0 &&
                    splitWords[0].trim().toLowerCase() !== splitWords[1].trim().toLowerCase();
        }

        return valid;
    }

    static ExtractWords(input: string) : WordPair | undefined {
        let splitWords = input.split('|');

        if(splitWords.length === 2 &&
           splitWords[0].trim().length > 0 &&
           splitWords[1].trim().length > 0 &&
           splitWords[0]){

            return {
                        majorityWord: splitWords[0].trim().toLowerCase(), 
                        minorityWord: splitWords[1].trim().toLowerCase()
                   };

        }

        return undefined;
    }

    static RandomWords(matchSpeechPart: boolean = true, matchCategory: boolean = matchSpeechPart) : WordPair {

        let speechPart = Math.floor(Math.random() * 2) ? Categories.Noun : Categories.Adjective;



        if(matchSpeechPart){
                
            /*
            * Get the count of the elements in the enums depending on speech part.
            * In the case of string only element enums, Object.keys().length will return the count.
            * See 
            * https://stackoverflow.com/questions/38034673/determine-the-number-of-enum-elements-typescript
            * for explanation
            */
            const categoryPerSpeechPart = speechPart === Categories.Noun ? Nouns : Adjectives;
            const categoryElementCount = Object.keys(categoryPerSpeechPart).length;

            let randomCategory = Object.values(categoryPerSpeechPart).at(Math.floor(Math.random() * categoryElementCount))!;

            console.log(speechPart);
            console.log(categoryPerSpeechPart);
            console.log(categoryElementCount);
            console.log(randomCategory);

            console.log({ partsOfSpeech: [ speechPart ], categories: { [speechPart]: [ randomCategory ] }});

            const firstWord = generateSlug(1, { partsOfSpeech: [ speechPart ], categories: { [speechPart]: [ randomCategory ] }});

            console.log(firstWord);

            if(matchCategory){

                let secondWord; 

                do {
                    secondWord = generateSlug(1, { partsOfSpeech: [ speechPart ], categories: { [speechPart]: [ randomCategory ] }});
                } while(secondWord === firstWord);

                return { majorityWord: firstWord, minorityWord: secondWord };
            }

            randomCategory = Object.values(categoryPerSpeechPart).at(Math.floor(Math.random() * categoryElementCount))!;
            let secondWord;
            
            do {
                secondWord = generateSlug(1, { partsOfSpeech: [ speechPart ], categories: { [speechPart]: [ randomCategory ] }});
            } while(secondWord === firstWord);

            return { majorityWord: firstWord, minorityWord: secondWord };

        }
        else{
            const firstWord = generateSlug(1);
        
            let secondWord; 
    
            do {
                secondWord = generateSlug(1);
            } while(secondWord === firstWord);
            
    
    
            return { majorityWord: firstWord, minorityWord: secondWord };
        }
    }


}