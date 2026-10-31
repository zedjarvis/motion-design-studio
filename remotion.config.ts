import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
Config.setBrowserExecutable(process.env.CHROME_PATH || '/usr/bin/google-chrome');
Config.setChromiumOpenGlRenderer('swangle');
// Studio's on-demand dependency chunks can race while mounting the asynchronous
// canvas adapters (observed with zod/v4/core/memoizer.js). Eager compilation
// keeps Studio and the already-eager production bundles on the same module graph.
Config.overrideWebpackConfig((config) => ({
  ...config,
  experiments: {...config.experiments, lazyCompilation: false},
}));
