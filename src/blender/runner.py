"""Runs inside Blender for Maxx:  blender -b --factory-startup --python runner.py -- job.json

job: {kit, mode: build|render|inspect, script, blend, save, out, quality, samples,
      frames, video, camera, engine, width, height}
It prints one line "MAXX_RESULT {json}" that Maxx reads.
"""

import json
import os
import sys
import time
import traceback

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
job = json.load(open(argv[0], encoding="utf-8"))
sys.path.insert(0, job["kit"])

import bpy  # noqa: E402
import maxx_scene as S  # noqa: E402

result = {"ok": False, "mode": job.get("mode", "build")}


def emit():
    sys.stdout.write("\nMAXX_RESULT " + json.dumps(result) + "\n")
    sys.stdout.flush()


def user_error(e, path):
    tb = traceback.extract_tb(e.__traceback__)
    mine = [f for f in tb if os.path.abspath(f.filename) == os.path.abspath(path)]
    frame = mine[-1] if mine else (tb[-1] if tb else None)
    line = frame.lineno if mine else getattr(e, "lineno", None)
    src = open(path, encoding="utf-8").read().splitlines() if path and os.path.exists(path) else []
    near = []
    if line:
        for i in range(max(1, line - 2), min(len(src), line + 2) + 1):
            near.append(f"{'>' if i == line else ' '}{i:4d}| {src[i - 1]}")
    kit = [f"{os.path.basename(f.filename)}:{f.lineno} {f.name}" for f in tb if f.filename.endswith("maxx_scene.py")]
    return {"type": type(e).__name__, "message": str(e), "line": line, "near": near, "inside_kit": kit[-2:]}


def render_still(out):
    os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
    sc = bpy.context.scene
    sc.render.filepath = out
    t = time.time()
    bpy.ops.render.render(write_still=True)
    result["render_seconds"] = round(time.time() - t, 1)
    result["image"] = out


def render_frames(out, frames, video):
    sc = bpy.context.scene
    a, b = frames
    sc.frame_start, sc.frame_end = a, b
    t = time.time()
    if video:
        im = sc.render.image_settings
        if hasattr(im, "media_type"):
            im.media_type = "VIDEO"
        im.file_format = "FFMPEG"
        ff = sc.render.ffmpeg
        ff.format = "MPEG4"
        ff.codec = "H264"
        ff.constant_rate_factor = "HIGH"
        ff.audio_codec = "NONE"
        os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
        sc.render.filepath = out
        bpy.ops.render.render(animation=True)
        # Blender names the file after the frame range when the path has no extension.
        d = os.path.dirname(out) or "."
        base = os.path.basename(out)
        made = sorted((f for f in os.listdir(d) if f.startswith(base.rsplit(".", 1)[0]) and f.endswith((".mp4", ".mkv", ".avi"))), key=lambda f: os.path.getmtime(os.path.join(d, f)))
        result["video"] = os.path.join(d, made[-1]) if made else out
    else:
        os.makedirs(out, exist_ok=True)
        sc.render.filepath = os.path.join(out, "frame_")
        sc.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(animation=True)
        result["frames_dir"] = out
    result["render_seconds"] = round(time.time() - t, 1)
    # A still of the middle frame to look at.
    sc.frame_set((a + b) // 2)
    if hasattr(sc.render.image_settings, "media_type"):
        sc.render.image_settings.media_type = "IMAGE"
    sc.render.image_settings.file_format = "PNG"
    still = job.get("still")
    if still:
        sc.render.filepath = still
        bpy.ops.render.render(write_still=True)
        result["image"] = still


try:
    mode = job.get("mode", "build")
    if mode == "build":
        S.reset()
        path = job["script"]
        src = open(path, encoding="utf-8").read()
        ns = {"S": S, "bpy": bpy, "math": __import__("math"), "random": __import__("random"), "Vector": S.Vector, "__name__": "__maxx_scene__", "__file__": path}
        try:
            code = compile(src, path, "exec")
            os.chdir(job.get("cwd") or os.path.dirname(path))
            exec(code, ns)
        except SyntaxError as e:
            result["error"] = {"type": "SyntaxError", "message": e.msg, "line": e.lineno, "near": [f"{e.lineno:4d}| {(e.text or '').rstrip()}"], "inside_kit": []}
            raise SystemExit
        except Exception as e:
            result["error"] = user_error(e, path)
            raise SystemExit
        if not S._state["world"]:
            S.stage("clear-day")
            S.note("no light was set, so Maxx used S.stage('clear-day')")
        if bpy.context.scene.camera is None:
            S.auto_camera()
            S.note("no camera was set, so Maxx framed the scene from a three-quarter view")
    else:
        bpy.ops.wm.open_mainfile(filepath=job["blend"])
        if job.get("camera"):
            cam = bpy.data.objects.get(job["camera"])
            if cam is None or cam.type != "CAMERA":
                cams = [o.name for o in bpy.data.objects if o.type == "CAMERA"]
                result["error"] = {"type": "ValueError", "message": f"no camera called {job['camera']!r}; cameras: {', '.join(cams) or 'none'}", "line": None, "near": [], "inside_kit": []}
                raise SystemExit
            bpy.context.scene.camera = cam
        if bpy.context.scene.camera is None:
            S.auto_camera()
            S.note("the file had no camera, so Maxx framed the scene")
    sc = bpy.context.scene
    if job.get("engine"):
        sc.render.engine = {"cycles": "CYCLES", "eevee": "BLENDER_EEVEE_NEXT" if S.V < (5, 0) else "BLENDER_EEVEE"}[job["engine"]]
    if job.get("width") and job.get("height"):
        S.frame(job["width"], job["height"])
    if mode != "inspect" or job.get("out"):
        S.quality(job.get("quality", "preview"), samples=job.get("samples"))
        if job.get("width") and job.get("height"):
            sc.render.resolution_percentage = 100  # an exact size was asked for
        if sc.render.engine == "CYCLES":
            result["device"] = S.gpu()
    result["issues"] = S.audit()
    if job.get("save"):
        os.makedirs(os.path.dirname(job["save"]) or ".", exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=job["save"], compress=True)
        result["saved"] = job["save"]
    if job.get("out"):
        if job.get("frames"):
            render_frames(job["out"], job["frames"], job.get("video", True))
        else:
            render_still(job["out"])
    result["facts"] = S.facts()
    result["ok"] = True
except SystemExit:
    pass
except Exception as e:
    result["error"] = {"type": type(e).__name__, "message": str(e), "line": None, "near": [], "inside_kit": [traceback.format_exc()[-1500:]]}
emit()
