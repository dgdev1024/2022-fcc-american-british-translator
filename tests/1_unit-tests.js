const chai = require("chai");
const sanitize = require("sanitize-html");
const assert = chai.assert;

const Translator = require("../components/translator.js");
const translator = new Translator();

const translateWithoutTags = (expression, americanToBritish = true) => {
  const res = translator.translate(
    expression,
    americanToBritish === true ? "american-to-british" : "british-to-american"
  );

  if (res.error) {
    return res;
  } else {
    return {
      text: res.text,
      translation: sanitize(res.translation, {
        allowedTags: [],
      }),
    };
  }
};

const americanExpressions = [
  ["Mangoes are my favorite fruit.", "Mangoes are my favourite fruit."],
  ["I ate yogurt for breakfast.", "I ate yoghurt for breakfast."],
  [
    "We had a party at my friend's condo.",
    "We had a party at my friend's flat.",
  ],
  [
    "Can you toss this in the trashcan for me?",
    "Can you toss this in the bin for me?",
  ],
  ["The parking lot was full.", "The car park was full."],
  [
    "Like a high tech Rube Goldberg machine.",
    "Like a high tech Heath Robinson device.",
  ],
  [
    "To play hooky means to skip class or work.",
    "To bunk off means to skip class or work.",
  ],
  ["No Mr. Bond, I expect you to die.", "No Mr Bond, I expect you to die."],
  ["Dr. Grosh will see you now.", "Dr Grosh will see you now."],
  ["Lunch is at 12:15 today.", "Lunch is at 12.15 today."],
  [
    "Dr. Grosh and his rube goldberg machine will be here for the soccer match today at 12:15.",
    "Dr Grosh and his Heath Robinson device will be here for the football match today at 12.15.",
  ],
  [
    "I would like to see this decentralized.",
    "I would like to see this decentralised.",
  ],
];

const britishExpressions = [
  [
    "We watched the footie match for a while.",
    "We watched the soccer match for a while.",
  ],
  [
    "Paracetamol takes up to an hour to work.",
    "Tylenol takes up to an hour to work.",
  ],
  ["First, caramelise the onions.", "First, caramelize the onions."],
  [
    "I spent the bank holiday at the funfair.",
    "I spent the public holiday at the carnival.",
  ],
  [
    "I had a bicky then went to the chippy.",
    "I had a cookie then went to the fish-and-chip shop.",
  ],
  [
    "I've just got bits and bobs in my bum bag.",
    "I've just got odds and ends in my fanny pack.",
  ],
  [
    "The car boot sale at Boxted Airfield was called off.",
    "The swap meet at Boxted Airfield was called off.",
  ],
  ["Have you met Mrs Kalyani?", "Have you met Mrs. Kalyani?"],
  [
    "Prof Joyner of King's College, London.",
    "Prof. Joyner of King's College, London.",
  ],
  [
    "Remember, the onions first have to be caramelised!",
    "Remember, the onions first have to be caramelized!",
  ],
  [
    "The footie match with Dr Grosh is today at 1.15.",
    "The soccer match with Dr. Grosh is today at 1:15.",
  ],
];

const highlightTranslations = [
  [
    "Mangoes are my favorite fruit.",
    'Mangoes are my <span class="highlight">favourite</span> fruit.',
  ],
  [
    "I ate yogurt for breakfast.",
    'I ate <span class="highlight">yoghurt</span> for breakfast.',
  ],
  [
    "We watched the footie match for a while.",
    'We watched the <span class="highlight">soccer</span> match for a while.',
  ],
  [
    "Paracetamol takes up to an hour to work.",
    '<span class="highlight">Tylenol</span> takes up to an hour to work.',
  ],
];

suite("Unit Tests", () => {
  suite("Translate American English to British English", () => {
    for (const expression of americanExpressions) {
      const [sentence, translation] = expression;

      test(`'${sentence}'`, () => {
        const res = translateWithoutTags(sentence);

        assert.notProperty(res, "error");
        assert.property(res, "text");
        assert.property(res, "translation");

        assert.strictEqual(res.text, sentence);
        assert.strictEqual(res.translation, translation);
      });
    }
  });

  suite("Translate British English to American English", () => {
    for (const expression of britishExpressions) {
      const [sentence, translation] = expression;

      test(`'${sentence}'`, () => {
        const res = translateWithoutTags(sentence, false);

        assert.notProperty(res, "error");
        assert.property(res, "text");
        assert.property(res, "translation");

        assert.strictEqual(res.text, sentence);
        assert.strictEqual(res.translation, translation);
      });
    }
  });

  suite("Highlight Translations", () => {
    for (let i = 0; i < highlightTranslations.length; ++i) {
      const isAmerican = i < 2;
      const [sentence, translation] = highlightTranslations[i];

      test(`'${sentence}'`, () => {
        const res = translator.translate(
          sentence,
          isAmerican ? "american-to-british" : "british-to-american"
        );

        assert.notProperty(res, "error");
        assert.property(res, "text");
        assert.property(res, "translation");

        assert.strictEqual(res.text, sentence);
        assert.strictEqual(res.translation, translation);
      });
    }
  });
});
