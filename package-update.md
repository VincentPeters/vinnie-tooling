# Package Update Instructions

To enable the Markdown ↔ HTML Converter tool, you need to install the following packages:

```bash
npm install marked turndown
npm install --save-dev @types/marked @types/turndown
```

After installing these packages, the converter will use the actual libraries instead of the placeholder implementations.

## About the Libraries

1. **marked** - A full-featured markdown parser and compiler for converting Markdown to HTML.
2. **turndown** - A library that converts HTML to Markdown.

## Implementation Notes

The current implementation includes placeholder functions that mimic basic functionality of these libraries. For production use, please install the actual libraries as described above.

After installing, no code changes should be needed as the component is already set up to use these libraries when available.
