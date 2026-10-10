#### Use `-solid` colour tokens for fills without text

Each colour in `src/lib/theme/theme.css` has `--akui-color-<name>-bg`, `-fg`, `-border` and `-solid`.

*   `-bg`, `-fg` and `-border` are for badges, boxes and text. `-fg` is a deep shade in light mode so text stays readable.
*   `-solid` is for filled blocks with no text on them, such as `ProgressBar` and `ProgressXmasTree`. It is a single mid-tone `hsl()` shared by light and dark.
*   Don't use `-fg` as a fill colour. It looks heavy and muddy in light mode.
*   When adding a colour, add all four tokens. Keep `-solid` close to the existing ones in lightness and saturation, and check it in both modes in the `Kitchen Sink` story.
