// Sky files embedded with { type: "file" } (a path on disk, or inside maxx.exe).
declare module "*.exr" {
  const path: string;
  export default path;
}
