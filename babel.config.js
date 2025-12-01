module.exports = function (api) {
  api.cache(true)
  return {
  presets: [
    ['babel-preset-expo', {
      unstable_transformProfile: 'hermes-stable'
    }]
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@app': './src/app',
          '@pages': './src/pages',

          '@auth': './src/modules/auth',
          '@onboarding': './src/modules/onboarding',
          '@theme': './src/modules/theme',

          '@modules': './src/modules',
          
          '@api': './src/core/api',
          '@lib': './src/core/lib',
          '@utils': './src/core/utils',
          '@storage': './src/core/storage',
          '@locales': './src/core/locales',

          '@mobx-toolbox': './src/core/mobx-toolbox',

          '@core': './src/core',
          
			    '@config': './src/core/config',
			    '@widgets': './src/core/widgets',
			    '@modals': './src/core/widgets/modals',
			    '@bottomsheets': './src/core/widgets/bottomsheets',
			    '@navigations': './src/core/widgets/navigations',
			    '@headers': './src/core/widgets/headers',
			    '@hooks': './src/core/hooks',
          '@stores': './src/core/stores',
          
          '@images': './src/assets/images',
          '@icons': './src/assets/icons',
          '@fonts': './src/assets/fonts',
          '@sounds': './src/assets/sounds',
          '@videos': './src/assets/videos',
          '@styles': './src/assets/styles',
          '@animations': './src/assets/animations',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    ['babel-plugin-react-compiler', {
      target: '19'
    }],
    ['react-native-reanimated/plugin'],
  ],
  }
}