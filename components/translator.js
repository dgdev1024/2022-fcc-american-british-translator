const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

// Create counterpart objects for british-to-american spelling and titles.
const britishToAmericanSpelling = Object.keys(americanToBritishSpelling).reduce(
  (obj, spelling) => ({
    ...obj,
    [americanToBritishSpelling[spelling]]: spelling,
  }),
  {}
);

// Assign the spelling translations.
const spelling = {
  "american-to-british": americanToBritishSpelling,
  "british-to-american": britishToAmericanSpelling,
};

// Assign the locale-exclusive translations.
const exclusive = {
  "american-to-british": americanOnly,
  "british-to-american": britishOnly,
};

// Regular expressions for matching time signatures.
const timeRegex = {
  "american-to-british": /^(?:1[0-2]|\d{1})\:(?:[0-5]\d)/,
  "british-to-american": /^(?:1[0-2]|\d{1})\.(?:[0-5]\d)/,
};

// Regular expressions for matching titles.
const titleRegex = {
  "american-to-british": /^(?:mr|mrs|ms|mx|dr|prof)\./i,
  "british-to-american": /^(?:mr|mrs|ms|mx|dr|prof)/i,
};

// Regular expression to catch punctuation at the end of a sentence.
const punctuationRegex = /[\.\?\!\:\,\;]$/;

/**
 * Utility function for capitalizing the first character in a string.
 */
const capitalize = (str) => {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
};

class Translator {
  /**
   * If a substring matching one of the time regular expressions is encountered by the
   * 'translate' method, this method will translate that time string using the proper
   * locale.
   *
   * @param {string} timeString The time string to be translated.
   * @param {"american-to-british" | "british-to-american"} locale The locale string passed into the 'translate' method.
   * @return {string} The translated time string.
   */
  _translateTime(timeString, locale) {
    if (locale === "american-to-british") {
      return `<span class="highlight">${timeString.replace(":", ".")}</span>`;
    } else if (locale === "british-to-american") {
      // Since a string is being passed in as the first argument, only the first instance
      // of that string in our time string will be replaced. As such, if a time string
      // with a trailing period is given, that trailing period should not be affected.
      return `<span class="highlight">${timeString.replace(".", ":")}</span>`;
    }
  }

  /**
   * If a substring matching one of the title regular expressions is encountered by the
   * 'translate' method, this method will translate that title string using the proper
   * locale.
   *
   * @param {string} titleString The title string to be translated.
   * @param {"american-to-british" | "british-to-american"} locale The locale string passed into the 'translate' method.
   * @return {string} The translated title string.
   */
  _translateTitle(titleString, locale) {
    if (locale === "american-to-british") {
      return `<span class="highlight">${titleString.slice(0, -1)}</span>`;
    } else {
      return `<span class="highlight">${titleString}.</span>`;
    }
  }

  /**
   * @typedef TranslateExpressionResult
   * @brief Defines the return value of the '_translateExpression' method.
   * @type {object}
   * @property {string} translation The translated expression, if any.
   * @property {number} wordsUsed How many words were in the expression that was translated.
   */

  /**
   * Takes the first three words in the 'words' array in its current form, and uses any or all of them
   * as an expression to be translated.
   * @param {string} firstWord The first word in the expression to be translated.
   * @param {string} secondWord The second word in the expression to be translated.
   * @param {string} thirdWord The third word in the expression to be translated.
   * @param {"american-to-british" | "british-to-american"} locale The locale string passed into the 'translate' method.
   * @return {TranslateExpressionResult} The result of the expression translation.
   */
  _translateExpression(firstWord, secondWord, thirdWord, locale) {
    // Get the proper dictionary of exclusive translations.
    const translations = exclusive[locale];

    // Check to see if the first word is capitalized.
    const isCapitalized = firstWord[0] === firstWord[0].toUpperCase();

    // First, take all three words and check for an expression.
    if (firstWord && secondWord && thirdWord) {
      const threeWordPhrase = [firstWord, secondWord, thirdWord]
        .join(" ")
        .toLowerCase()
        .replace(punctuationRegex, "");
      const hasPunctuation = punctuationRegex.test(thirdWord);
      if (translations[threeWordPhrase]) {
        return {
          translation: `<span class="highlight">${
            isCapitalized
              ? capitalize(translations[threeWordPhrase])
              : translations[threeWordPhrase]
          }</span>${hasPunctuation ? thirdWord.at(-1) : ""}`,
          wordsUsed: 3,
        };
      }
    }

    // Next, use only the first two.
    if (firstWord && secondWord) {
      const twoWordPhrase = [firstWord, secondWord]
        .join(" ")
        .toLowerCase()
        .replace(punctuationRegex, "");
      const hasPunctuation = punctuationRegex.test(secondWord);
      if (translations[twoWordPhrase]) {
        return {
          translation: `<span class="highlight">${
            isCapitalized
              ? capitalize(translations[twoWordPhrase])
              : translations[twoWordPhrase]
          }</span>${hasPunctuation ? secondWord.at(-1) : ""}`,
          wordsUsed: 2,
        };
      }
    }

    // Finally, use only one.
    if (firstWord) {
      const oneWordPhrase = firstWord
        .toLowerCase()
        .replace(punctuationRegex, "");
      const hasPunctuation = punctuationRegex.test(firstWord);
      if (translations[oneWordPhrase]) {
        return {
          translation: `<span class="highlight">${
            isCapitalized
              ? capitalize(translations[oneWordPhrase])
              : translations[oneWordPhrase]
          }</span>${hasPunctuation ? firstWord.at(-1) : ""}`,
          wordsUsed: 1,
        };
      }
    }

    return { translation: "", wordsUsed: 0 };
  }

  _translateSpelling(word, locale) {
    const isCapitalized = word[0] === word[0].toUpperCase();
    const hasPunctuation = punctuationRegex.test(word);
    const wordLower = word.toLowerCase().replace(punctuationRegex, "");
    const dictionary = spelling[locale];

    if (dictionary[wordLower]) {
      return `<span class="highlight">${
        isCapitalized
          ? capitalize(dictionary[wordLower])
          : dictionary[wordLower]
      }</span>${hasPunctuation ? word.at(-1) : ""}`;
    }

    return word;
  }

  /**
   * Uses a dictionary of translations between American and British English
   * dialect to translate the given sentence.
   *
   * @param {string} sentence The sentence to be translated.
   * @param {"american-to-british" | "british-to-american"} locale The locale to translate with. Are we translating from American or from British?
   * @return {string} The translated sentence.
   */
  translate(sentence, locale) {
    // Early out if no sentence was provided.
    if (!sentence) {
      return { error: "No text to translate" };
    }

    // Early out if an invalid string was provided for the locale.
    if (locale !== "american-to-british" && locale !== "british-to-american") {
      return { error: "Invalid value for locale field" };
    }

    // Keep an array of words containing the translations.
    const translatedWords = [];

    // Split the sententce using a space separator.
    let words = sentence.split(" ");
    while (words.length > 0) {
      // Grab the first three entries from the words array.
      const [firstWord, secondWord, thirdWord] = words;

      // Check to see if the first word matches the proper time regex.
      if (timeRegex[locale].test(firstWord) === true) {
        translatedWords.push(this._translateTime(firstWord, locale));
        words.shift();
        continue;
      }

      // Check to see if the first word matches the proper title regex.
      if (titleRegex[locale].test(firstWord) === true) {
        translatedWords.push(this._translateTitle(firstWord, locale));
        words.shift();
        continue;
      }

      // Check to see if any sequence of the first three words in the words array
      // can be used to form an expression that can be translated.
      const expressionTranslation = this._translateExpression(
        firstWord,
        secondWord,
        thirdWord,
        locale
      );
      if (expressionTranslation.wordsUsed > 0) {
        translatedWords.push(expressionTranslation.translation);
        words = words.slice(expressionTranslation.wordsUsed);
        continue;
      }

      translatedWords.push(this._translateSpelling(firstWord, locale));
      words.shift();
    }

    const translation = translatedWords.join(" ");

    return {
      text: sentence,
      translation:
        sentence !== translation ? translation : "Everything looks good to me!",
    };
  }
}

module.exports = Translator;
