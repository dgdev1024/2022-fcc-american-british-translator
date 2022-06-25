const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server.js");

chai.use(chaiHttp);

let Translator = require("../components/translator.js");

suite("Functional Tests", () => {
  suite("POST /api/translate", () => {
    test("Translate with valid text and locale fields.", () => {
      const text = "We watched the footie match for a while.";
      const expected =
        'We watched the <span class="highlight">soccer</span> match for a while.';

      chai
        .request(server)
        .post("/api/translate")
        .send({
          text,
          locale: "british-to-american",
        })
        .end((_, res) => {
          assert.strictEqual(res.status, 200);
          assert.strictEqual(res.type, "application/json");

          assert.notProperty(res.body, "error");
          assert.property(res.body, "text");
          assert.property(res.body, "translation");

          assert.strictEqual(res.body.text, text);
          assert.strictEqual(res.body.translation, expected);
        });
    });

    test("Translate with text and invalid locale field.", () => {
      const text = "The car boot sale at Boxted Airfield was called off.";

      chai
        .request(server)
        .post("/api/translate")
        .send({ text, locale: "american-to-irish" })
        .end((_, res) => {
          assert.strictEqual(res.type, "application/json");

          assert.property(res.body, "error");
          assert.notProperty(res.body, "text");
          assert.notProperty(res.body, "translation");

          assert.strictEqual(res.body.error, "Invalid value for locale field");
        });
    });

    test("Translate with missing text field.", () => {
      chai
        .request(server)
        .post("/api/translate")
        .send({ text: undefined, locale: "american-to-british" })
        .end((_, res) => {
          assert.strictEqual(res.type, "application/json");

          assert.property(res.body, "error");
          assert.notProperty(res.body, "text");
          assert.notProperty(res.body, "translation");

          assert.strictEqual(res.body.error, "Required field(s) missing");
        });
    });

    test("Translate with missing locale field.", () => {
      chai
        .request(server)
        .post("/api/translate")
        .send({ text: "Test", locale: undefined })
        .end((_, res) => {
          assert.strictEqual(res.type, "application/json");

          assert.property(res.body, "error");
          assert.notProperty(res.body, "text");
          assert.notProperty(res.body, "translation");

          assert.strictEqual(res.body.error, "Required field(s) missing");
        });
    });

    test("Translate with empty text.", () => {
      chai
        .request(server)
        .post("/api/translate")
        .send({ text: "", locale: "american-to-british" })
        .end((_, res) => {
          assert.strictEqual(res.type, "application/json");

          assert.property(res.body, "error");
          assert.notProperty(res.body, "text");
          assert.notProperty(res.body, "translation");

          assert.strictEqual(res.body.error, "No text to translate");
        });
    });

    test("Translate with text that does not need to be translated.", () => {
      const text = "The car boot sale at Boxted Airfield was called off.";

      chai
        .request(server)
        .post("/api/translate")
        .send({ text, locale: "american-to-british" })
        .end((_, res) => {
          assert.strictEqual(res.type, "application/json");

          assert.notProperty(res.body, "error");
          assert.property(res.body, "text");
          assert.property(res.body, "translation");

          assert.strictEqual(res.body.text, text);
          assert.strictEqual(
            res.body.translation,
            "Everything looks good to me!"
          );
        });
    });
  });
});
