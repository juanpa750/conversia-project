module.exports = {
  presets: [
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development'
    }],
    ['@babel/preset-typescript', {
      allowNamespaces: true,
      allowDeclareFields: true
    }],
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'ie >= 11']
      },
      modules: false,
      loose: true,
      debug: process.env.NODE_ENV === 'development'
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-transform-unicode-escapes']
  ],
  env: {
    development: {
      plugins: ['react-refresh/babel']
    },
    production: {
      plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]]
    }
  },
  parserOpts: {
    strictMode: false,
    allowImportExportEverywhere: true
  }
};