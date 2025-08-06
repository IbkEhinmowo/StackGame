/** @format */

export default {
  base: "/StackGame/", // This is needed because the site is served from this path on GitHub Pages
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        format: "es", // Ensure ES module format
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  optimizeDeps: {
    include: ["three", "cannon-es"], // Pre-bundle these dependencies
  },
};
