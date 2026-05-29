module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        { jsxImportSource: 'nativewind', tsconfigPaths: true },
      ],
      'nativewind/babel',
    ],
  };
};
