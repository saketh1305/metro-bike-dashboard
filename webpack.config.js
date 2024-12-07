module.exports = {
    // Other configurations...
    ignoreWarnings: [
      (warning) =>
        warning.message.includes('Failed to parse source map') &&
        warning.file.includes('wgsl_reflect'),
    ],
  };
  