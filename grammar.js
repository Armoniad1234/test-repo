const PREC = {
  STRING_CONTENT: 1,
};

module.exports = grammar({
  name: "mbjson",

  extras: ($) => [/\s/, $.comment],

  rules: {
    comment: (_) =>
      token(
        choice(
          seq("//", /[^\n\r]*/),

          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
        ),
      ),
    document: ($) => optional($.value),

    value: ($) =>
      choice(
        $.object,
        $.array,
        $.string,
        $.number,
        $.true,
        $.false,
        $.null,
        $.javascript_block,
      ),

    object: ($) =>
      seq(
        "{",
        optional(seq($.pair, repeat(seq(",", $.pair)), optional(","))),
        "}",
      ),

    pair: ($) => seq(field("key", $.string), ":", field("value", $.value)),

    array: ($) =>
      seq(
        "[",
        optional(seq($.value, repeat(seq(",", $.value)), optional(","))),
        "]",
      ),

    string: ($) =>
      seq('"', repeat(choice($.string_content, $.escape_sequence)), '"'),

    string_content: (_) =>
      token.immediate(prec(PREC.STRING_CONTENT, /[^"\\]+/)),

    escape_sequence: (_) =>
      token.immediate(
        seq("\\", choice(/["\\\/bfnrt]/, seq("u", /[A-Fa-f0-9]{4}/))),
      ),

    number: (_) =>
      token(
        seq(
          optional("-"),
          choice("0", seq(/[1-9]/, repeat(/[0-9]/))),
          optional(seq(".", repeat1(/[0-9]/))),
          optional(
            seq(choice("e", "E"), optional(choice("+", "-")), repeat1(/[0-9]/)),
          ),
        ),
      ),

    true: (_) => "true",
    false: (_) => "false",
    null: (_) => "null",

    javascript_block: ($) =>
      seq(
        field("marker", $.javascript_marker),
        field("open", $.javascript_open),
        optional(field("content", $.javascript_content)),
        field("close", $.javascript_close),
      ),

    javascript_marker: (_) => "@js",
    javascript_open: (_) => "<<<",
    javascript_close: (_) => ">>>",

    javascript_content: (_) => token(prec(-1, /([^>]|>[^>]|>>[^>])+/)),
  },
});
