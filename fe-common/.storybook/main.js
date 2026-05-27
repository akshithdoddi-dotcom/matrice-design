/** @type {import("@storybook/react-vite").StorybookConfig} */
const config = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  staticDirs: ["../public"],
  framework: "@storybook/react-vite",
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    const { default: tsconfigPaths } = await import("vite-tsconfig-paths");

    config.plugins = [
      tailwindcss(),
      tsconfigPaths(),
      ...(config.plugins ?? []),
    ];

    return config;
  },
};

export default config;
