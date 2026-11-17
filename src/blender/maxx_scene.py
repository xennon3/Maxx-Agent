"""maxx_scene: Maxx's realism kit for Blender scenes (Blender 4.2 and newer).

A scene script gets this module as S, plus bpy, math, Vector and random:

    S.stage("golden-hour")                      # sky, sun, exposure, colour look
    S.ground(mat="grass")                       # a big ground with real texture
    S.box((2, 1, 0.9), at=(0, 0, 0), mat="wood", bevel=0.02)
    S.camera(at=(4, -6, 1.6), look=(0, 0, 0.6), lens=50)

Everything is in metres and "at" is where the object stands (the middle of
its base), so nothing floats or sinks. Maxx saves the .blend and renders it.
"""

import bpy
import bmesh
import math
import os
import random
import sys
import json
from mathutils import Vector, Euler

KIT_VERSION = "1.0.0"
HERE = os.path.dirname(os.path.abspath(__file__))
HDRI_DIR = os.path.join(HERE, "hdri")
V = tuple(int(x) for x in bpy.app.version[:2])

_state = {"preset": None, "notes": [], "world": False, "camera_set": False, "quality": "preview"}


def note(msg):
    """Leave a note in the report Maxx reads after the run."""
    _state["notes"].append(str(msg))


# ---------------------------------------------------------------- helpers

def _vec(v, n=3, fill=0.0):
    if v is None:
        return Vector([fill] * n)
    if isinstance(v, (int, float)):
        return Vector([float(v)] * n)
    v = list(v) + [fill] * (n - len(v))
    return Vector([float(x) for x in v[:n]])


def _rgb(c, default=(0.8, 0.8, 0.8)):
    """'#aabbcc', (r, g, b) in 0-1 (sRGB, like a colour picker), or a name."""
    if c is None:
        c = default
    if isinstance(c, str):
        named = {
            "white": "#f2f2f0", "black": "#121212", "red": "#a8161b", "green": "#2f6b2a", "blue": "#1c3f8c",
            "yellow": "#e3b51c", "orange": "#d4651a", "grey": "#7a7a7a", "gray": "#7a7a7a", "silver": "#b8b9bc",
            "gold": "#d4a03a", "brown": "#5a3a22", "beige": "#cdbb9b", "navy": "#14213d", "teal": "#1f6f6b",
            "pink": "#d98fa6", "purple": "#5b2a86", "cream": "#ede3cc",
        }
        c = named.get(c.lower(), c)
        h = c.lstrip("#")
        if len(h) == 3:
            h = "".join(x * 2 for x in h)
        c = tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    c = list(c)[:3]
    if any(x > 1.0 for x in c):
        c = [x / 255 for x in c]
    # sRGB to linear, as Blender's colour pickers do.
    lin = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return (lin[0], lin[1], lin[2], 1.0)


def kelvin(k):
    """Colour of light at a temperature (1000-12000 K), linear RGB."""
    t = max(1000, min(40000, k)) / 100
    if t <= 66:
        r = 255
        g = 99.4708025861 * math.log(t) - 161.1195681661
        b = 0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307
    else:
        r = 329.698727446 * (t - 60) ** -0.1332047592
        g = 288.1221695283 * (t - 60) ** -0.0755148492
        b = 255
    c = [max(0, min(255, x)) / 255 for x in (r, g, b)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c)


def _try(thing, **values):
    """Set what this Blender version has; skip the rest."""
    for k, v in values.items():
        try:
            setattr(thing, k, v)
        except Exception:
            pass


def _link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    return obj


def _select(obj):
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def _nodes(holder):
    try:
        if not holder.use_nodes:
            holder.use_nodes = True
    except Exception:
        pass
    return holder.node_tree


def _smooth(obj, angle=35):
    """Smooth shading, with edges sharper than `angle` degrees kept crisp."""
    me = obj.data
    if not isinstance(me, bpy.types.Mesh):
        return
    try:
        me.shade_smooth()
        me.set_sharp_from_angle(angle=math.radians(angle))
    except Exception:
        for p in me.polygons:
            p.use_smooth = True


def _bevel(obj, width, segments=3):
    if not width or width <= 0:
        return
    m = obj.modifiers.new("Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(40)
    try:
        m.harden_normals = True
    except Exception:
        pass


def _place(obj, at, rot=None, base=True):
    """Put the object's base (lowest point) at `at`, after rotating it."""
    if rot is not None:
        r = _vec(rot)
        obj.rotation_euler = Euler([math.radians(x) for x in r], "XYZ")
    bpy.context.view_layer.update()
    at = _vec(at)
    if base:
        lo = min((obj.matrix_world @ Vector(c)).z for c in obj.bound_box)
        obj.location.z += at.z - lo
        obj.location.x += at.x
        obj.location.y += at.y
    else:
        obj.location += at
    return obj


def _from_mesh(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return _link(bpy.data.objects.new(name, me))


def _assign(obj, mat):
    if mat is None:
        return
    m = material(mat) if not isinstance(mat, bpy.types.Material) else mat
    if obj.data and hasattr(obj.data, "materials"):
        obj.data.materials.clear()
        obj.data.materials.append(m)


# ---------------------------------------------------------------- reset & render settings

def reset():
    """Empty the scene: no default cube, camera or light."""
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.curves):
        for d in list(coll):
            if d.users == 0:
                coll.remove(d)
    sc = bpy.context.scene
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 1.0
    sc.render.engine = "CYCLES"
    sc.view_settings.view_transform = "AgX"
    _look("Medium High Contrast")
    sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
    sc.render.film_transparent = False
    if sc.world is None:
        sc.world = bpy.data.worlds.new("World")
    _state.update(preset=None, world=False, camera_set=False)
    _state["notes"].clear()
    random.seed(7)


def _look(name):
    vs = bpy.context.scene.view_settings
    for n in (f"AgX - {name}", name, "None"):
        try:
            vs.look = n
            return
        except Exception:
            continue


def frame(width=1920, height=1080):
    """Picture size and shape, e.g. frame(1080, 1350) for a portrait shot."""
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = int(width), int(height)


def exposure(stops=0.0):
    bpy.context.scene.view_settings.exposure = stops


def gpu():
    """Use the graphics card for Cycles if Blender finds one. Returns its name or 'CPU'."""
    sc = bpy.context.scene
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
    except Exception:
        sc.cycles.device = "CPU"
        return "CPU"
    for kind in ("OPTIX", "CUDA", "HIP", "ONEAPI", "METAL"):
        try:
            prefs.compute_device_type = kind
        except Exception:
            continue
        try:
            prefs.refresh_devices()
        except Exception:
            try:
                prefs.get_devices()
            except Exception:
                pass
        devs = [d for d in prefs.devices if d.type == kind]
        if devs:
            for d in prefs.devices:
                d.use = d.type == kind
            sc.cycles.device = "GPU"
            return f"{kind}: {', '.join(d.name for d in devs)}"
    sc.cycles.device = "CPU"
    return "CPU"


QUALITY = {
    # samples, adaptive threshold, scale of the frame size, time limit (s)
    "draft": (16, 0.1, 0.35, 45),
    "preview": (48, 0.05, 0.5, 120),
    "final": (256, 0.01, 1.0, 900),
    "4k": (512, 0.008, 2.0, 2400),
}


def quality(q="preview", samples=None, time_limit=None):
    sc = bpy.context.scene
    s, thr, scale, limit = QUALITY.get(q, QUALITY["preview"])
    _state["quality"] = q
    if sc.render.engine == "CYCLES":
        c = sc.cycles
        c.samples = int(samples or s)
        c.use_adaptive_sampling = True
        c.adaptive_threshold = thr
        c.use_denoising = True
        try:
            c.denoiser = "OPENIMAGEDENOISE"
        except Exception:
            pass
        c.max_bounces = 12
        c.diffuse_bounces = 4
        c.glossy_bounces = 6
        c.transmission_bounces = 12
        c.volume_bounces = 2
        c.transparent_max_bounces = 16
        c.sample_clamp_indirect = 10.0
        c.caustics_reflective = False
        c.caustics_refractive = False
        if hasattr(c, "time_limit"):
            c.time_limit = float(time_limit if time_limit is not None else limit)
    sc.render.resolution_percentage = int(round(scale * 100))
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"


# ---------------------------------------------------------------- world: sky, HDRI, presets

def _world_nodes():
    sc = bpy.context.scene
    if sc.world is None:
        sc.world = bpy.data.worlds.new("World")
    nt = _nodes(sc.world)
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    out.location = (600, 0)
    _state["world"] = True
    return nt, out


def _sky_node(nt, elevation, azimuth, haze=1.0, air=1.0):
    n = nt.nodes.new("ShaderNodeTexSky")
    types = [e.identifier for e in n.bl_rna.properties["sky_type"].enum_items]
    for t in ("MULTIPLE_SCATTERING", "NISHITA", "SINGLE_SCATTERING", "HOSEK_WILKIE"):
        if t in types:
            n.sky_type = t
            break
    for k, v in (("sun_disc", True), ("sun_elevation", math.radians(elevation)), ("sun_rotation", math.radians(azimuth)),
                 ("air_density", air), ("dust_density", haze), ("aerosol_density", haze), ("ozone_density", 1.0),
                 ("sun_size", math.radians(0.545)), ("sun_intensity", 1.0), ("altitude", 0.0), ("turbidity", 2.0 + 3 * haze)):
        if hasattr(n, k):
            try:
                setattr(n, k, v)
            except Exception:
                pass
    return n


def sky(elevation=40, azimuth=135, strength=0.25, haze=1.0, sun=True, sun_strength=None, warm=None):
    """A physical sky with the sun at `elevation` degrees above the horizon,
    coming from `azimuth` degrees (0 = from +Y, 90 = from +X).
    sun: also add a sun lamp lined up with it for crisp shadows."""
    nt, out = _world_nodes()
    s = _sky_node(nt, elevation, azimuth, haze)
    if hasattr(s, "sun_disc"):
        s.sun_disc = False  # the sun lamp below makes the light; the disc only adds noise
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    nt.links.new(s.outputs[0], bg.inputs["Color"])
    nt.links.new(bg.outputs[0], out.inputs["Surface"])
    if sun:
        if sun_strength is None:
            # Weaker sun near the horizon, as the air takes it.
            sun_strength = 4.5 * max(0.08, math.sin(math.radians(max(elevation, 1)))) ** 0.6
        k = warm if warm else (2200 + 4300 * min(1, max(0, elevation) / 35))
        sun_lamp(elevation, azimuth, strength=sun_strength, kelvin=k, softness=0.6 + 1.5 * haze)
    return s


def hdri(name="studio", strength=1.0, rotation=0.0, background=True, blur=0.0):
    """Light the scene with a photographed sky. name: one of the built-in skies
    (bridge city dawn forest night park sky studio sunrise sunset venice warehouse)
    or a path to an .exr/.hdr file (find_assets can download big ones).
    background=False keeps the light but shows a plain colour behind."""
    path = name if os.path.exists(str(name)) else os.path.join(HDRI_DIR, f"{name}.exr")
    if not os.path.exists(path):
        have = sorted(f[:-4] for f in os.listdir(HDRI_DIR)) if os.path.isdir(HDRI_DIR) else []
        raise ValueError(f"no sky called {name!r}; built-in skies: {', '.join(have)}")
    nt, out = _world_nodes()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Rotation"].default_value[2] = math.radians(rotation)
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(path, check_existing=True)
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs[0], env.inputs["Vector"])
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    nt.links.new(env.outputs[0], bg.inputs["Color"])
    if background is True and blur <= 0:
        nt.links.new(bg.outputs[0], out.inputs["Surface"])
    else:
        # Light from the photo, but the camera sees a colour (or a soft version).
        lp = nt.nodes.new("ShaderNodeLightPath")
        bg2 = nt.nodes.new("ShaderNodeBackground")
        if isinstance(background, (tuple, list, str)):
            bg2.inputs["Color"].default_value = _rgb(background)
            bg2.inputs["Strength"].default_value = 1.0
        else:
            bg2.inputs["Color"].default_value = (0.05, 0.05, 0.055, 1)
        mix = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
        nt.links.new(bg.outputs[0], mix.inputs[1])
        nt.links.new(bg2.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return env


def world_color(color="#20242a", strength=1.0):
    nt, out = _world_nodes()
    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = _rgb(color)
    bg.inputs["Strength"].default_value = strength
    nt.links.new(bg.outputs[0], out.inputs["Surface"])


PRESETS = {
    "clear-day": "bright midday sun, crisp shadows, blue sky",
    "golden-hour": "low warm sun, long shadows, glowing haze",
    "overcast": "soft grey daylight, no hard shadows, true colours",
    "blue-hour": "just after sunset: deep blue sky, warm horizon, lights on",
    "night": "city night: dark blue sky, moonlight; add lamps and lit windows",
    "studio": "product shot: soft boxes, seamless grey backdrop",
    "interior": "a room by day: window light plus warm lamps",
    "misty-forest": "damp woods in morning mist, soft green light",
    "desert": "harsh high sun, bleached colours, dusty air",
}


def stage(preset="clear-day", sun_azimuth=None, backdrop=None):
    """Set the whole light at once. Presets: """ + ", ".join(PRESETS)
    if preset not in PRESETS:
        raise ValueError(f"unknown preset {preset!r}; pick one of {', '.join(PRESETS)}")
    _state["preset"] = preset
    az = 135 if sun_azimuth is None else sun_azimuth
    sc = bpy.context.scene
    _look("Medium High Contrast")
    exposure(0)
    if preset == "clear-day":
        sky(elevation=48, azimuth=az, strength=0.14, haze=0.6, sun_strength=4.5)
        exposure(-0.8)
    elif preset == "golden-hour":
        sky(elevation=11, azimuth=az, strength=0.22, haze=2.0, warm=2600, sun_strength=4.0)
        exposure(-0.4)
    elif preset == "overcast":
        hdri("city", strength=0.9, background="#b9bec4")
        sun_lamp(60, az, strength=0.6, kelvin=6800, softness=25)
        exposure(-0.3)
        _look("Base Contrast")
    elif preset == "blue-hour":
        sky(elevation=-3.5, azimuth=az, strength=1.4, haze=1.5, sun=False)
        exposure(1.6)
    elif preset == "night":
        hdri("night", strength=0.35, background="#070b14")
        sun_lamp(35, az + 60, strength=0.08, kelvin=7800, softness=1.5, name="Moon")
        exposure(1.6)
    elif preset == "studio":
        hdri("studio", strength=0.6, background="#3c3d40")
        area_light(at=(-3.2, -3.2, 3.4), look=(0, 0, 0.5), size=2.2, power=900, kelvin=5600, name="Key")
        area_light(at=(3.6, -2.6, 2.2), look=(0, 0, 0.5), size=3.0, power=300, kelvin=6200, name="Fill")
        area_light(at=(0.5, 4.0, 3.0), look=(0, 0, 0.8), size=1.5, power=600, kelvin=7000, name="Rim")
        if backdrop is None or backdrop:
            S_backdrop()
    elif preset == "interior":
        hdri("park", strength=0.6, background=False)
        sun_lamp(28, az, strength=3.0, kelvin=5200, softness=1.0)
        exposure(0.6)
    elif preset == "misty-forest":
        hdri("forest", strength=0.8)
        sun_lamp(22, az, strength=1.6, kelvin=4300, softness=3.0)
        fog(density=0.035, color="#c9d3cc")
        _look("Base Contrast")
    elif preset == "desert":
        sky(elevation=62, azimuth=az, strength=0.16, haze=2.5, sun_strength=5.0, warm=5600)
        exposure(-1.0)
        _look("High Contrast")
    return preset


def S_backdrop(size=24, color="#8a8b8e", curve=1.6):
    """A seamless studio backdrop: floor that curves up into a back wall."""
    bm = bmesh.new()
    half = size / 2
    prof = []
    for i in range(13):
        t = i / 12 * (math.pi / 2)
        prof.append((half * 0.25 + curve * math.sin(t), curve - curve * math.cos(t)))
    prof = [(-half, 0.0)] + prof + [(half * 0.25 + curve, size * 0.6)]
    rows = []
    for (y, z) in prof:
        rows.append([bm.verts.new((x, y, z)) for x in (-half, half)])
    for a, b in zip(rows, rows[1:]):
        bm.faces.new((a[0], a[1], b[1], b[0]))
    obj = _from_mesh("Backdrop", bm)
    _smooth(obj, 80)
    _assign(obj, material("plastic", color=color, roughness=0.6))
    obj["maxx_ground"] = True
    return obj


backdrop = S_backdrop


def fog(density=0.02, color="#d0d4d8", size=None, height=None):
    """Haze in the air. density: 0.005 light haze, 0.03 mist, 0.1 thick fog.
    It fills a box `size` metres wide (default: around everything so far)."""
    lo, hi = _bounds(include_ground=False)
    span = max(60.0, (hi - lo).length * 2.5) if size is None else size
    h = height or max(20.0, span / 3)
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj = bpy.context.active_object
    obj.name = "Fog"
    obj.scale = (span, span, h)
    obj.location = ((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, h / 2 - 0.5)
    m = bpy.data.materials.new("Fog")
    nt = _nodes(m)
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Density"].default_value = density
    vol.inputs["Color"].default_value = _rgb(color)
    vol.inputs["Anisotropy"].default_value = 0.35
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    obj.data.materials.append(m)
    obj.visible_shadow = False
    obj["maxx_fog"] = True
    return obj


# ---------------------------------------------------------------- lights

def _aim(obj, target):
    d = _vec(target) - obj.location
    if d.length > 1e-6:
        obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def sun_lamp(elevation=45, azimuth=135, strength=4.0, kelvin=5800, softness=0.6, name="Sun"):
    """Sunlight from `elevation` degrees up, `azimuth` degrees round. softness: the
    sun's size in degrees (0.5 crisp, 3 hazy, 20+ overcast)."""
    ld = bpy.data.lights.new(name, "SUN")
    ld.energy = strength
    ld.angle = math.radians(softness)
    ld.color = kelvin_color(kelvin)
    obj = _link(bpy.data.objects.new(name, ld))
    el, az = math.radians(elevation), math.radians(azimuth)
    direction = Vector((math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), math.sin(el)))
    obj.location = direction * 50
    obj.rotation_euler = (-direction).to_track_quat("-Z", "Y").to_euler()
    return obj


def kelvin_color(k):
    return kelvin(k)


def area_light(at=(2, -2, 3), look=(0, 0, 0), size=1.0, power=200, kelvin=5000, name="Area", shape="SQUARE", spread=180):
    """A soft box. power in watts (a softbox 300-1000 W, a window 1000-3000 W)."""
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = power
    ld.shape = shape
    if isinstance(size, (tuple, list)):
        ld.shape = "RECTANGLE"
        ld.size, ld.size_y = size[0], size[1]
    else:
        ld.size = size
    ld.color = kelvin_color(kelvin)
    try:
        ld.spread = math.radians(spread)
    except Exception:
        pass
    obj = _link(bpy.data.objects.new(name, ld))
    obj.location = _vec(at)
    _aim(obj, look)
    return obj


def point_light(at=(0, 0, 2.5), power=60, kelvin=2700, radius=0.05, name="Lamp"):
    """A bulb. power in watts of light (a 60 W household bulb is about 8-15 here)."""
    ld = bpy.data.lights.new(name, "POINT")
    ld.energy = power
    ld.shadow_soft_size = radius
    ld.color = kelvin_color(kelvin)
    obj = _link(bpy.data.objects.new(name, ld))
    obj.location = _vec(at)
    return obj


def spot_light(at=(0, 0, 4), look=(0, 0, 0), power=500, angle=45, blend=0.3, kelvin=4000, radius=0.05, name="Spot"):
    ld = bpy.data.lights.new(name, "SPOT")
    ld.energy = power
    ld.spot_size = math.radians(angle)
    ld.spot_blend = blend
    ld.shadow_soft_size = radius
    ld.color = kelvin_color(kelvin)
    obj = _link(bpy.data.objects.new(name, ld))
    obj.location = _vec(at)
    _aim(obj, look)
    return obj


# ---------------------------------------------------------------- materials

def _n(nt, kind, x=0, y=0, **inputs):
    node = nt.nodes.new(kind)
    node.location = (x, y)
    for k, v in inputs.items():
        if k in node.inputs:
            node.inputs[k].default_value = v
        elif hasattr(node, k):
            setattr(node, k, v)
    return node


def _ramp(nt, src, c1, c2, x=-300, y=0, lo=0.3, hi=0.7):
    r = _n(nt, "ShaderNodeValToRGB", x, y)
    r.color_ramp.elements[0].position = lo
    r.color_ramp.elements[1].position = hi
    r.color_ramp.elements[0].color = c1
    r.color_ramp.elements[1].color = c2
    nt.links.new(src, r.inputs[0])
    return r


def _map_range(nt, src, a, b, x=-300, y=0):
    m = _n(nt, "ShaderNodeMapRange", x, y)
    m.inputs["To Min"].default_value = a
    m.inputs["To Max"].default_value = b
    nt.links.new(src, m.inputs["Value"])
    return m


def _coords(nt, scale=1.0, stretch=(1, 1, 1)):
    tc = _n(nt, "ShaderNodeTexCoord", -1400, 0)
    mp = _n(nt, "ShaderNodeMapping", -1200, 0)
    s = _vec(stretch, fill=1)
    mp.inputs["Scale"].default_value = (s.x / scale, s.y / scale, s.z / scale)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    return mp.outputs[0], tc


def _triplanar_brick(nt, vec, tc, scale, mortar_col, brick1, brick2, mortar=0.012, w=0.25, h=0.065, squash=1.0, offset=0.5):
    """Brick/tile pattern that lies right on walls, floors and ceilings."""
    sep = _n(nt, "ShaderNodeSeparateXYZ", -1000, 300)
    nt.links.new(vec, sep.inputs[0])
    outs, facs = [], []
    for i, (a, b) in enumerate((("Y", "Z"), ("X", "Z"), ("X", "Y"))):
        cmb = _n(nt, "ShaderNodeCombineXYZ", -850, 500 - i * 220)
        nt.links.new(sep.outputs[a], cmb.inputs["X"])
        nt.links.new(sep.outputs[b], cmb.inputs["Y"])
        br = _n(nt, "ShaderNodeTexBrick", -650, 500 - i * 220)
        br.offset = offset
        br.squash = squash
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Mortar Size"].default_value = mortar
        br.inputs["Brick Width"].default_value = w
        br.inputs["Row Height"].default_value = h
        br.inputs["Color1"].default_value = brick1
        br.inputs["Color2"].default_value = brick2
        br.inputs["Mortar"].default_value = mortar_col
        nt.links.new(cmb.outputs[0], br.inputs["Vector"])
        outs.append(br)
    # Blend by which way the surface faces.
    nrm = _n(nt, "ShaderNodeVectorMath", -1000, -200, operation="ABSOLUTE")
    nt.links.new(tc.outputs["Normal"], nrm.inputs[0])
    sepn = _n(nt, "ShaderNodeSeparateXYZ", -850, -200)
    nt.links.new(nrm.outputs[0], sepn.inputs[0])
    # Pick the strongest axis (a hard switch, no blurry blending).
    gx = _n(nt, "ShaderNodeMath", -650, -150, operation="GREATER_THAN")
    nt.links.new(sepn.outputs["X"], gx.inputs[0])
    nt.links.new(sepn.outputs["Y"], gx.inputs[1])
    zbig = _n(nt, "ShaderNodeMath", -650, -300, operation="GREATER_THAN")
    mx = _n(nt, "ShaderNodeMath", -800, -350, operation="MAXIMUM")
    nt.links.new(sepn.outputs["X"], mx.inputs[0])
    nt.links.new(sepn.outputs["Y"], mx.inputs[1])
    nt.links.new(sepn.outputs["Z"], zbig.inputs[0])
    nt.links.new(mx.outputs[0], zbig.inputs[1])
    col = _n(nt, "ShaderNodeMix", -450, 300, data_type="RGBA")
    nt.links.new(gx.outputs[0], col.inputs["Factor"])
    nt.links.new(outs[1].outputs["Color"], col.inputs[6])
    nt.links.new(outs[0].outputs["Color"], col.inputs[7])
    col2 = _n(nt, "ShaderNodeMix", -300, 300, data_type="RGBA")
    nt.links.new(zbig.outputs[0], col2.inputs["Factor"])
    nt.links.new(col.outputs[2], col2.inputs[6])
    nt.links.new(outs[2].outputs["Color"], col2.inputs[7])
    fac = _n(nt, "ShaderNodeMix", -450, 0, data_type="FLOAT")
    nt.links.new(gx.outputs[0], fac.inputs["Factor"])
    nt.links.new(outs[1].outputs["Fac"], fac.inputs[2])
    nt.links.new(outs[0].outputs["Fac"], fac.inputs[3])
    fac2 = _n(nt, "ShaderNodeMix", -300, 0, data_type="FLOAT")
    nt.links.new(zbig.outputs[0], fac2.inputs["Factor"])
    nt.links.new(fac.outputs[0], fac2.inputs[2])
    nt.links.new(outs[2].outputs["Fac"], fac2.inputs[3])
    return col2.outputs[2], fac2.outputs[0]


# name: (colour A, colour B, roughness lo-hi, metallic, pattern scale m, bump, pattern, extras)
MATS = {
    "concrete": ("#8d8b86", "#6f6d69", (0.75, 0.95), 0, 0.6, 0.25, "noise", {}),
    "asphalt": ("#3a3a3c", "#262628", (0.7, 0.95), 0, 0.15, 0.35, "noise", {}),
    "pavement": ("#9a978f", "#7c7a74", (0.7, 0.9), 0, 1.0, 0.3, "tiles", {"tile": (0.6, 0.6), "gap": 0.006}),
    "brick": ("#7a3422", "#5a2516", (0.75, 0.95), 0, 1.0, 0.45, "brick", {"mortar": "#9c968a"}),
    "tiles": ("#e8e6e1", "#dcdad5", (0.05, 0.2), 0, 1.0, 0.25, "tiles", {"tile": (0.3, 0.3), "gap": 0.004, "mortar": "#b5b1a8"}),
    "plaster": ("#e4ddd0", "#d6cfc1", (0.8, 0.95), 0, 0.4, 0.12, "noise", {}),
    "wood": ("#7a5235", "#4f331d", (0.35, 0.6), 0, 0.25, 0.15, "wood", {}),
    "oak": ("#9a7752", "#6b4f33", (0.35, 0.55), 0, 0.25, 0.12, "wood", {}),
    "walnut": ("#5a3a26", "#3a2316", (0.3, 0.5), 0, 0.25, 0.12, "wood", {}),
    "planks": ("#9b6a3f", "#6c4527", (0.4, 0.65), 0, 1.0, 0.25, "planks", {}),
    "metal": ("#a8a9ad", "#8d8e92", (0.25, 0.45), 1, 0.3, 0.05, "noise", {}),
    "brushed-metal": ("#b9babd", "#a3a4a8", (0.2, 0.35), 1, 0.3, 0.04, "brushed", {}),
    "steel": ("#8f9296", "#7b7e82", (0.3, 0.5), 1, 0.4, 0.05, "noise", {}),
    "rust": ("#7a3d1d", "#4a2a18", (0.7, 0.95), 0.2, 0.3, 0.5, "noise", {}),
    "chrome": ("#e8e8ea", "#e0e0e3", (0.02, 0.06), 1, 1.0, 0.0, "none", {}),
    "gold": ("#ffcf6b", "#f2b84a", (0.12, 0.25), 1, 0.4, 0.02, "noise", {}),
    "copper": ("#f0a07a", "#d8845e", (0.18, 0.35), 1, 0.4, 0.03, "noise", {}),
    "glass": ("#ffffff", "#ffffff", (0.0, 0.0), 0, 1.0, 0.0, "none", {"glass": 1.0, "ior": 1.5}),
    "frosted-glass": ("#f4f8fa", "#f4f8fa", (0.35, 0.45), 0, 1.0, 0.0, "none", {"glass": 1.0, "ior": 1.5}),
    "water": ("#d7eef2", "#d7eef2", (0.02, 0.05), 0, 2.0, 0.08, "waves", {"glass": 1.0, "ior": 1.333}),
    "plastic": ("#cfcfcf", "#c4c4c4", (0.35, 0.45), 0, 0.5, 0.02, "noise", {}),
    "rubber": ("#1b1b1c", "#151516", (0.8, 0.95), 0, 0.2, 0.05, "noise", {}),
    "car-paint": ("#9e1b1f", "#8f171b", (0.3, 0.38), 0.6, 0.05, 0.0, "flakes", {"coat": 1.0}),
    "fabric": ("#6d7480", "#5d6470", (0.85, 1.0), 0, 0.004, 0.12, "noise", {"sheen": 0.6}),
    "leather": ("#4a2d1f", "#3a2216", (0.45, 0.65), 0, 0.01, 0.15, "noise", {"coat": 0.15}),
    "marble": ("#ecebe6", "#8e8c88", (0.06, 0.15), 0, 0.8, 0.0, "marble", {"coat": 0.3}),
    "ceramic": ("#f2f0eb", "#ebe8e2", (0.05, 0.12), 0, 1.0, 0.0, "none", {"coat": 0.6}),
    "skin": ("#d9a58a", "#c98f73", (0.4, 0.55), 0, 0.03, 0.04, "noise", {"sss": 1.0}),
    "grass": ("#4a6b2a", "#2f4a1a", (0.75, 0.95), 0, 0.5, 0.25, "noise", {}),
    "dirt": ("#5a4632", "#3f3022", (0.85, 1.0), 0, 0.4, 0.4, "noise", {}),
    "sand": ("#d8c39c", "#c4ab80", (0.8, 0.95), 0, 0.08, 0.3, "noise", {}),
    "bark": ("#4a3a2c", "#2a2018", (0.8, 0.95), 0, 0.12, 0.9, "bark", {}),
    "rock": ("#7c7870", "#56524b", (0.7, 0.95), 0, 0.6, 0.6, "noise", {}),
    "snow": ("#f4f6f8", "#e8edf2", (0.4, 0.6), 0, 0.5, 0.15, "noise", {"sss": 0.5}),
    "mud": ("#4a3a28", "#2e2418", (0.3, 0.7), 0, 0.5, 0.3, "noise", {}),
    "paper": ("#f1eee6", "#ebe7de", (0.75, 0.9), 0, 0.01, 0.03, "noise", {"sss": 0.15}),
    "emissive": ("#ffd9a8", "#ffd9a8", (0.5, 0.5), 0, 1.0, 0.0, "none", {"emit": 10.0}),
    "neon": ("#ff2ea0", "#ff2ea0", (0.3, 0.3), 0, 1.0, 0.0, "none", {"emit": 40.0}),
    "screen": ("#0a0a0a", "#0a0a0a", (0.05, 0.1), 0, 1.0, 0.0, "none", {"coat": 1.0}),
}

_mat_cache = {}


def material(kind="plastic", color=None, roughness=None, scale=None, metallic=None, emit=None, name=None, wet=0.0):
    """A ready PBR surface. kind: """ + ", ".join(MATS) + """.
    color tints it ('#c03030', 'navy', (0.8, 0.2, 0.1)); scale is the pattern size in metres;
    wet 0-1 darkens it and makes it shine like after rain."""
    if isinstance(kind, bpy.types.Material):
        return kind
    key = (kind, str(color), roughness, scale, metallic, emit, name, wet)
    if key in _mat_cache and _mat_cache[key].name in bpy.data.materials:
        return _mat_cache[key]
    if kind not in MATS:
        if os.path.isdir(str(kind)):
            return pbr(kind, scale=scale or 2.0)
        raise ValueError(f"unknown material {kind!r}; pick one of {', '.join(MATS)} or pass a folder of PBR textures")
    ca, cb, rough, metal, pscale, bump, pattern, ex = MATS[kind]
    A, B = _rgb(ca), _rgb(cb)
    if color is not None:
        tint = _rgb(color)
        # Keep the pattern's light/dark variation, change the colour.
        A = tint
        B = tuple(x * 0.78 for x in tint[:3]) + (1,)
    if scale:
        pscale = scale
    m = bpy.data.materials.new(name or (kind if color is None else f"{kind} {color}"))
    m["maxx_kind"] = kind
    nt = _nodes(m)
    nt.nodes.clear()
    out = _n(nt, "ShaderNodeOutputMaterial", 600, 0)
    bsdf = _n(nt, "ShaderNodeBsdfPrincipled", 250, 0)
    nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
    vec, tc = _coords(nt, pscale, stretch=(1, 1, 1))
    rlo, rhi = rough if roughness is None else (max(0, roughness - 0.05), min(1, roughness + 0.05))
    metal = metal if metallic is None else metallic
    bsdf.inputs["Metallic"].default_value = metal
    height = None
    col_out = None
    fac_out = None
    if pattern in ("noise", "flakes", "waves"):
        nz = _n(nt, "ShaderNodeTexNoise", -950, 0)
        nz.inputs["Scale"].default_value = 1.0 if pattern != "flakes" else 400.0
        nz.inputs["Detail"].default_value = 8.0 if pattern != "flakes" else 2.0
        nz.inputs["Roughness"].default_value = 0.6
        nt.links.new(vec, nz.inputs["Vector"])
        # Large blotches + fine grain.
        nz2 = _n(nt, "ShaderNodeTexNoise", -950, -250)
        nz2.inputs["Scale"].default_value = 30.0 if pattern != "flakes" else 12.0
        nz2.inputs["Detail"].default_value = 4.0
        nt.links.new(vec, nz2.inputs["Vector"])
        mixf = _n(nt, "ShaderNodeMath", -750, -100, operation="MULTIPLY_ADD")
        nt.links.new(nz.outputs["Fac"], mixf.inputs[0])
        mixf.inputs[1].default_value = 0.7
        mul2 = _n(nt, "ShaderNodeMath", -750, -300, operation="MULTIPLY")
        nt.links.new(nz2.outputs["Fac"], mul2.inputs[0])
        mul2.inputs[1].default_value = 0.3
        nt.links.new(mul2.outputs[0], mixf.inputs[2])
        fac_out = mixf.outputs[0]
        col_out = _ramp(nt, fac_out, B, A, -450, 150, 0.35, 0.65).outputs[0]
        height = fac_out if pattern != "flakes" else nz.outputs["Fac"]
    elif pattern == "brushed":
        nz = _n(nt, "ShaderNodeTexNoise", -950, 0)
        nt.links.new(vec, nz.inputs["Vector"])
        mp = nt.nodes[-2] if False else None
        # Stretch the noise along X for brushed streaks.
        st = _n(nt, "ShaderNodeMapping", -1100, -200)
        st.inputs["Scale"].default_value = (2.0, 300.0, 300.0)
        nt.links.new(vec, st.inputs["Vector"])
        nt.links.new(st.outputs[0], nz.inputs["Vector"])
        nz.inputs["Detail"].default_value = 6.0
        fac_out = nz.outputs["Fac"]
        col_out = _ramp(nt, fac_out, B, A, -450, 150).outputs[0]
        height = fac_out
    elif pattern == "bark":
        st = _n(nt, "ShaderNodeMapping", -1100, -200)
        st.inputs["Scale"].default_value = (1.0, 1.0, 0.15)
        nt.links.new(vec, st.inputs["Vector"])
        vo = _n(nt, "ShaderNodeTexVoronoi", -900, 0)
        vo.feature = "DISTANCE_TO_EDGE" if False else "F1"
        vo.inputs["Scale"].default_value = 3.0
        nt.links.new(st.outputs[0], vo.inputs["Vector"])
        nz = _n(nt, "ShaderNodeTexNoise", -900, -250)
        nz.inputs["Scale"].default_value = 6.0
        nz.inputs["Detail"].default_value = 8.0
        nt.links.new(st.outputs[0], nz.inputs["Vector"])
        add = _n(nt, "ShaderNodeMath", -700, -100, operation="MULTIPLY_ADD")
        nt.links.new(vo.outputs["Distance"], add.inputs[0])
        add.inputs[1].default_value = 0.7
        nt.links.new(nz.outputs["Fac"], add.inputs[2])
        fac_out = add.outputs[0]
        col_out = _ramp(nt, fac_out, B, A, -450, 150, 0.2, 0.9).outputs[0]
        height = fac_out
    elif pattern == "wood":
        st = _n(nt, "ShaderNodeMapping", -1100, -200)
        st.inputs["Scale"].default_value = (1.0, 1.0, 0.08)
        nt.links.new(vec, st.inputs["Vector"])
        wv = _n(nt, "ShaderNodeTexWave", -900, 0)
        wv.wave_type = "RINGS"
        wv.inputs["Scale"].default_value = 6.0
        wv.inputs["Distortion"].default_value = 6.0
        wv.inputs["Detail"].default_value = 3.0
        wv.inputs["Detail Scale"].default_value = 1.5
        nt.links.new(st.outputs[0], wv.inputs["Vector"])
        fac_out = wv.outputs["Fac"]
        col_out = _ramp(nt, fac_out, B, A, -450, 150, 0.2, 0.8).outputs[0]
        height = fac_out
    elif pattern in ("brick", "tiles", "planks"):
        mortar = _rgb(ex.get("mortar", "#3b2a1d" if pattern == "planks" else "#9c968a"))
        if pattern == "brick":
            col_out, fac_out = _triplanar_brick(nt, vec, tc, pscale, mortar, A, B)
        elif pattern == "tiles":
            tw, th = ex.get("tile", (0.3, 0.3))
            col_out, fac_out = _triplanar_brick(nt, vec, tc, pscale, mortar, A, B, mortar=ex.get("gap", 0.004), w=tw, h=th, offset=0.0)
        else:
            col_out, fac_out = _triplanar_brick(nt, vec, tc, pscale, mortar, A, B, mortar=0.003, w=1.6, h=0.18, offset=0.37)
            # Wood grain on top of the planks.
            st = _n(nt, "ShaderNodeMapping", -1100, -500)
            st.inputs["Scale"].default_value = (0.15, 3.0, 3.0)
            nt.links.new(vec, st.inputs["Vector"])
            nz = _n(nt, "ShaderNodeTexNoise", -900, -500)
            nz.inputs["Detail"].default_value = 6.0
            nt.links.new(st.outputs[0], nz.inputs["Vector"])
            ov = _n(nt, "ShaderNodeMix", -150, 300, data_type="RGBA", blend_type="OVERLAY")
            ov.inputs["Factor"].default_value = 0.5
            nt.links.new(col_out, ov.inputs[6])
            nt.links.new(nz.outputs["Color"], ov.inputs[7])
            col_out = ov.outputs[2]
        # Grime so not every brick is the same.
        nz = _n(nt, "ShaderNodeTexNoise", -950, -650)
        nz.inputs["Scale"].default_value = 3.0
        nz.inputs["Detail"].default_value = 8.0
        nt.links.new(vec, nz.inputs["Vector"])
        dirt = _n(nt, "ShaderNodeMix", 0, 300, data_type="RGBA", blend_type="MULTIPLY")
        dirt.inputs["Factor"].default_value = 0.35
        nt.links.new(col_out, dirt.inputs[6])
        nt.links.new(nz.outputs["Color"], dirt.inputs[7])
        col_out = dirt.outputs[2]
        height = fac_out
    elif pattern == "marble":
        nz = _n(nt, "ShaderNodeTexNoise", -1000, 0)
        nz.inputs["Scale"].default_value = 1.5
        nz.inputs["Detail"].default_value = 10.0
        nt.links.new(vec, nz.inputs["Vector"])
        wv = _n(nt, "ShaderNodeTexWave", -800, 0)
        wv.inputs["Scale"].default_value = 2.0
        wv.inputs["Distortion"].default_value = 12.0
        wv.inputs["Detail"].default_value = 8.0
        nt.links.new(nz.outputs["Color"], wv.inputs["Vector"])
        fac_out = wv.outputs["Fac"]
        col_out = _ramp(nt, fac_out, A, B, -450, 150, 0.9, 1.0).outputs[0]
    else:
        bsdf.inputs["Base Color"].default_value = A
    if col_out is not None:
        nt.links.new(col_out, bsdf.inputs["Base Color"])
    if fac_out is not None and rhi > rlo:
        nt.links.new(_map_range(nt, fac_out, rlo, rhi, -100, -150).outputs[0], bsdf.inputs["Roughness"])
    else:
        bsdf.inputs["Roughness"].default_value = rlo
    if height is not None and bump > 0:
        bp = _n(nt, "ShaderNodeBump", 0, -350)
        bp.inputs["Strength"].default_value = bump
        bp.inputs["Distance"].default_value = 0.02 * pscale if pattern not in ("brick", "tiles", "planks") else 0.01
        nt.links.new(height, bp.inputs["Height"])
        nt.links.new(bp.outputs[0], bsdf.inputs["Normal"])
    if ex.get("glass"):
        bsdf.inputs["Transmission Weight"].default_value = ex["glass"]
        bsdf.inputs["IOR"].default_value = ex.get("ior", 1.45)
    if ex.get("coat"):
        bsdf.inputs["Coat Weight"].default_value = ex["coat"]
        bsdf.inputs["Coat Roughness"].default_value = 0.03
    if ex.get("sheen"):
        bsdf.inputs["Sheen Weight"].default_value = ex["sheen"]
    if ex.get("sss"):
        bsdf.inputs["Subsurface Weight"].default_value = ex["sss"]
        bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
        bsdf.inputs["Subsurface Scale"].default_value = 0.01
    e = emit if emit is not None else ex.get("emit")
    if e:
        bsdf.inputs["Emission Color"].default_value = A
        bsdf.inputs["Emission Strength"].default_value = e
    if wet:
        # Darker colour, glossier top: a wet look.
        if col_out is not None:
            dk = _n(nt, "ShaderNodeMix", 100, 450, data_type="RGBA", blend_type="MULTIPLY")
            dk.inputs["Factor"].default_value = 0.45 * wet
            dk.inputs[7].default_value = (0.35, 0.35, 0.35, 1)
            nt.links.new(col_out, dk.inputs[6])
            nt.links.new(dk.outputs[2], bsdf.inputs["Base Color"])
        bsdf.inputs["Coat Weight"].default_value = max(bsdf.inputs["Coat Weight"].default_value, wet)
        bsdf.inputs["Coat Roughness"].default_value = 0.05
    _mat_cache[key] = m
    return m


mat = material


def pbr(folder, scale=2.0, name=None):
    """A material from a folder of photo textures (color/normal/roughness/ao/height
    images, as find_assets downloads from Poly Haven). scale: metres per repeat."""
    files = {f.lower(): os.path.join(folder, f) for f in os.listdir(folder)}

    def pick(*words):
        for w in words:
            for f, p in files.items():
                if w in f and f.rsplit(".", 1)[-1] in ("png", "jpg", "jpeg", "exr", "tif", "tiff", "webp"):
                    return p
        return None

    m = bpy.data.materials.new(name or os.path.basename(folder.rstrip("/\\")))
    m["maxx_kind"] = "pbr"
    nt = _nodes(m)
    nt.nodes.clear()
    out = _n(nt, "ShaderNodeOutputMaterial", 600, 0)
    bsdf = _n(nt, "ShaderNodeBsdfPrincipled", 250, 0)
    nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
    vec, tc = _coords(nt, scale)

    def tex(path, data, y):
        t = _n(nt, "ShaderNodeTexImage", -600, y)
        t.image = bpy.data.images.load(path, check_existing=True)
        t.projection = "BOX"
        t.projection_blend = 0.2
        if data:
            t.image.colorspace_settings.name = "Non-Color"
        nt.links.new(vec, t.inputs["Vector"])
        return t

    c = pick("diff", "color", "albedo", "basecolor", "col")
    if c:
        nt.links.new(tex(c, False, 300).outputs["Color"], bsdf.inputs["Base Color"])
    r = pick("rough")
    if r:
        nt.links.new(tex(r, True, 0).outputs["Color"], bsdf.inputs["Roughness"])
    else:
        arm = pick("arm")
        if arm:
            t = tex(arm, True, 0)
            sp = _n(nt, "ShaderNodeSeparateColor", -300, 0)
            nt.links.new(t.outputs["Color"], sp.inputs[0])
            nt.links.new(sp.outputs[1], bsdf.inputs["Roughness"])
            nt.links.new(sp.outputs[2], bsdf.inputs["Metallic"])
    mtl = pick("metal")
    if mtl:
        nt.links.new(tex(mtl, True, -150).outputs["Color"], bsdf.inputs["Metallic"])
    nr = pick("nor_gl", "normal_gl", "normal", "nor")
    if nr:
        t = tex(nr, True, -300)
        nm = _n(nt, "ShaderNodeNormalMap", -200, -300)
        nt.links.new(t.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs[0], bsdf.inputs["Normal"])
    return m


# ---------------------------------------------------------------- objects

def _tag(obj, name, mat):
    if name:
        obj.name = name
    _assign(obj, mat)
    return obj


def box(size=(1, 1, 1), at=(0, 0, 0), mat="plastic", bevel=0.01, rot=None, name=None, **mat_args):
    """A box size=(width x, depth y, height z) in metres, standing on `at`.
    bevel rounds the edges (real things are never razor sharp: 0.003-0.03)."""
    s = _vec(size, fill=1)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * s.x, v.co.y * s.y, v.co.z * s.z))
    obj = _from_mesh(name or "Box", bm)
    _bevel(obj, min(bevel, min(s) * 0.45) if bevel else 0)
    _smooth(obj)
    _tag(obj, name, material(mat, **mat_args) if isinstance(mat, str) else mat)
    return _place(obj, at, rot)


def cylinder(radius=0.5, height=1.0, at=(0, 0, 0), mat="plastic", bevel=0.005, segments=64, rot=None, name=None, top_radius=None, **mat_args):
    """A cylinder standing on `at` (top_radius: a cone or tapered post)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments, radius1=radius,
                          radius2=radius if top_radius is None else top_radius, depth=height)
    obj = _from_mesh(name or "Cylinder", bm)
    _bevel(obj, min(bevel, radius * 0.4, height * 0.4) if bevel else 0)
    _smooth(obj, 50)
    _tag(obj, name, material(mat, **mat_args) if isinstance(mat, str) else mat)
    return _place(obj, at, rot)


def sphere(radius=0.5, at=(0, 0, 0), mat="plastic", rot=None, name=None, squash=1.0, **mat_args):
    """A smooth ball resting on `at`. squash < 1 flattens it."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=radius)
    for v in bm.verts:
        v.co.z *= squash
    obj = _from_mesh(name or "Sphere", bm)
    _smooth(obj, 180)
    _tag(obj, name, material(mat, **mat_args) if isinstance(mat, str) else mat)
    return _place(obj, at, rot)


def torus(radius=0.5, thickness=0.1, at=(0, 0, 0), mat="metal", rot=None, name=None, **mat_args):
    bpy.ops.mesh.primitive_torus_add(major_radius=radius, minor_radius=thickness, major_segments=96, minor_segments=32)
    obj = bpy.context.active_object
    _smooth(obj, 180)
    _tag(obj, name or "Torus", material(mat, **mat_args) if isinstance(mat, str) else mat)
    return _place(obj, at, rot)


def text(body="Maxx", size=0.5, depth=0.05, at=(0, 0, 0), mat="metal", rot=(90, 0, 0), name=None, bevel=0.004, **mat_args):
    """3D letters standing upright facing -Y (the default camera side)."""
    cu = bpy.data.curves.new(name or "Text", "FONT")
    cu.body = body
    cu.size = size
    cu.extrude = depth / 2
    cu.bevel_depth = bevel
    cu.align_x = "CENTER"
    obj = _link(bpy.data.objects.new(name or "Text", cu))
    _assign(obj, material(mat, **mat_args) if isinstance(mat, str) else mat)
    return _place(obj, at, rot)


def ground(size=6000, mat="concrete", at=(0, 0, 0), name="Ground", **mat_args):
    """A wide ground (it reaches the horizon so the world doesn't end)."""
    if bpy.data.objects.get("Backdrop") is not None and at == (0, 0, 0):
        note("skipped S.ground(): the studio backdrop is already the floor")
        return bpy.data.objects["Backdrop"]
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size / 2)
    obj = _from_mesh(name, bm)
    _assign(obj, material(mat, **mat_args) if isinstance(mat, str) else mat)
    obj.location = _vec(at)
    obj["maxx_ground"] = True
    return obj


def terrain(size=120, height=6.0, at=(0, 0, 0), mat="grass", seed=1, flat_middle=12.0, detail=200, name="Terrain", **mat_args):
    """Rolling land: hills `height` m high, kept flat within `flat_middle` m of the
    centre so things can stand there."""
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=detail, y_segments=detail, size=size / 2)
    rnd = random.Random(seed)
    ox, oy = rnd.uniform(0, 1000), rnd.uniform(0, 1000)
    from mathutils import noise
    for v in bm.verts:
        p = Vector((v.co.x / size * 3 + ox, v.co.y / size * 3 + oy, 0))
        h = noise.fractal(p, 0.6, 2.0, 5) * height
        r = math.hypot(v.co.x, v.co.y)
        k = min(1.0, max(0.0, (r - flat_middle) / (flat_middle + 1e-6)))
        v.co.z = h * k * k
    obj = _from_mesh(name, bm)
    _smooth(obj, 180)
    _assign(obj, material(mat, **mat_args) if isinstance(mat, str) else mat)
    obj.location = _vec(at)
    obj["maxx_ground"] = True
    return obj


def rock(size=1.0, at=(0, 0, 0), seed=None, mat="rock", name=None, flat=0.7, **mat_args):
    """A natural-looking boulder about `size` metres across."""
    seed = random.randint(0, 9999) if seed is None else seed
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=5, radius=size / 2)
    from mathutils import noise
    rnd = random.Random(seed)
    off = Vector((rnd.uniform(0, 100), rnd.uniform(0, 100), rnd.uniform(0, 100)))
    for v in bm.verts:
        n = v.co.normalized()
        d = noise.fractal(n * 1.6 + off, 0.55, 2.2, 6)
        v.co = v.co * (1 + 0.35 * d)
        v.co.z *= flat
    obj = _from_mesh(name or "Rock", bm)
    _smooth(obj, 180)
    obj.rotation_euler.z = rnd.uniform(0, math.tau)
    _assign(obj, material(mat, **mat_args) if isinstance(mat, str) else mat)
    _place(obj, at)
    obj.location.z -= size * 0.12  # sit it into the ground a little
    return obj


def ocean(size=200, waves=1.0, at=(0, 0, 0), mat="water", choppy=1.0, name="Ocean", seed=0):
    """A real ocean surface (Blender's ocean simulation). waves: wave scale."""
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size / 2)
    obj = _from_mesh(name, bm)
    m = obj.modifiers.new("Ocean", "OCEAN")
    m.geometry_mode = "DISPLACE" if False else "GENERATE"
    try:
        m.geometry_mode = "GENERATE"
        m.size = 1.0
        m.repeat_x = m.repeat_y = max(1, int(size / 50))
        m.spatial_size = 50
    except Exception:
        pass
    m.resolution = 12
    m.wave_scale = waves
    m.choppiness = choppy
    m.random_seed = seed
    _smooth(obj, 180)
    _assign(obj, material(mat) if isinstance(mat, str) else mat)
    obj.location = _vec(at) - Vector((size / 2, size / 2, 0)) if m.geometry_mode == "GENERATE" else _vec(at)
    obj["maxx_ground"] = True
    return obj


def model(path, at=(0, 0, 0), height=None, width=None, rot=None, name=None):
    """Bring in a model: .glb/.gltf/.fbx/.obj/.stl/.blend. height or width in metres
    scales it to a real size (a door 2.0, a car about 1.45 high, a person 1.75)."""
    path = os.path.abspath(path)
    ext = path.rsplit(".", 1)[-1].lower()
    before = set(bpy.data.objects)
    if ext in ("glb", "gltf"):
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == "fbx":
        bpy.ops.import_scene.fbx(filepath=path)
    elif ext == "obj":
        bpy.ops.wm.obj_import(filepath=path)
    elif ext == "stl":
        bpy.ops.wm.stl_import(filepath=path)
    elif ext == "blend":
        with bpy.data.libraries.load(path, link=False) as (src, dst):
            dst.objects = list(src.objects)
        for o in dst.objects:
            if o is not None:
                _link(o)
    else:
        raise ValueError(f"can't import .{ext}; use glb, gltf, fbx, obj, stl or blend")
    new = [o for o in bpy.data.objects if o not in before]
    roots = [o for o in new if o.parent is None or o.parent not in new]
    if not roots:
        raise ValueError(f"{path} had nothing in it")
    root = bpy.data.objects.new(name or os.path.splitext(os.path.basename(path))[0], None)
    _link(root)
    for o in roots:
        o.parent = root
    bpy.context.view_layer.update()
    lo, hi = _bounds_of(new)
    if height or width:
        dims = hi - lo
        k = (height / max(dims.z, 1e-6)) if height else (width / max(dims.x, dims.y, 1e-6))
        root.scale = (k, k, k)
        bpy.context.view_layer.update()
        lo, hi = _bounds_of(new)
    if rot is not None:
        root.rotation_euler = Euler([math.radians(x) for x in _vec(rot)], "XYZ")
        bpy.context.view_layer.update()
        lo, hi = _bounds_of(new)
    at = _vec(at)
    root.location += Vector((at.x - (lo.x + hi.x) / 2, at.y - (lo.y + hi.y) / 2, at.z - lo.z))
    return root


def scatter(items, on, count=200, seed=1, scale=(0.7, 1.3), radius=None, avoid=None, upright=True, name="Scatter"):
    """Spread copies of objects over a surface (trees, rocks, grass tufts).
    items: an object or list of objects to copy (they are hidden as templates).
    radius: only within this many metres of the centre. avoid: (x, y, r) clearings."""
    items = items if isinstance(items, (list, tuple)) else [items]
    coll = bpy.data.collections.new(f"{name} items")
    bpy.context.scene.collection.children.link(coll)
    for it in items:
        for c in list(it.users_collection):
            c.objects.unlink(it)
        coll.objects.link(it)
        it.location = (0, 0, 0)
    coll.hide_render = False
    try:
        bpy.context.view_layer.layer_collection.children[coll.name].exclude = True
    except Exception:
        pass
    rnd = random.Random(seed)
    deps = bpy.context.evaluated_depsgraph_get()
    lo, hi = _bounds_of([on])
    placed = 0
    holder = bpy.data.objects.new(name, None)
    _link(holder)
    tries = 0
    avoid = avoid or []
    if avoid and isinstance(avoid[0], (int, float)):
        avoid = [avoid]
    while placed < count and tries < count * 20:
        tries += 1
        x, y = rnd.uniform(lo.x, hi.x), rnd.uniform(lo.y, hi.y)
        if radius and math.hypot(x, y) > radius:
            continue
        if any(math.hypot(x - a[0], y - a[1]) < a[2] for a in avoid):
            continue
        hit, loc, nrm, _i, ob, _m = bpy.context.scene.ray_cast(deps, Vector((x, y, hi.z + 50)), Vector((0, 0, -1)))
        if not hit or ob != on:
            continue
        src = rnd.choice(items)
        inst = bpy.data.objects.new(f"{src.name}.{placed}", None)
        inst.instance_type = "COLLECTION"
        inst.instance_collection = _single(src)
        inst.location = loc
        k = rnd.uniform(*scale)
        inst.scale = (k, k, k)
        inst.rotation_euler = (0, 0, rnd.uniform(0, math.tau))
        if not upright:
            inst.rotation_euler = nrm.to_track_quat("Z", "Y").to_euler()
            inst.rotation_euler.rotate_axis("Z", rnd.uniform(0, math.tau))
        inst.parent = holder
        _link(inst)
        placed += 1
    return holder


_singles = {}


def _single(obj):
    c = _singles.get(obj.name)
    if c is None:
        c = bpy.data.collections.new(f"one {obj.name}")
        c.objects.link(obj)
        _singles[obj.name] = c
    return c


def grass(on, density=400, height=0.12, seed=2, radius=None, color=None):
    """Real grass blades growing on a surface: density blades per square metre
    (Blender's hair, rendered by Cycles). radius: only within this many metres
    of the centre (keeps big terrains fast)."""
    me = on.data
    if radius:
        vg = on.vertex_groups.new(name="grass")
        for v in me.vertices:
            w = (on.matrix_world @ v.co)
            d = math.hypot(w.x, w.y)
            k = 1.0 if d < radius * 0.8 else max(0.0, 1 - (d - radius * 0.8) / (radius * 0.2 + 1e-6))
            if k > 0:
                vg.add([v.index], k, "REPLACE")
    ps = on.modifiers.new("Grass", "PARTICLE_SYSTEM").particle_system
    st = ps.settings
    st.type = "HAIR"
    lo, hi = _bounds_of([on])
    area = max(1.0, (hi.x - lo.x) * (hi.y - lo.y))
    if radius:
        area = min(area, math.pi * radius * radius)
    kids = 60
    st.count = int(min(400000, max(500, area * density / kids)))
    st.child_type = "INTERPOLATED"
    st.rendered_child_count = kids
    _try(st, child_nbr=6, child_percent=6)
    st.child_length = 1.0
    st.child_length_threshold = 0.3
    st.child_radius = 0.25
    st.roughness_2 = height * 0.6
    st.roughness_2_size = 1.0
    st.roughness_endpoint = height * 0.25
    st.use_advanced_hair = True
    st.normal_factor = 1.0
    st.factor_random = 0.0
    st.brownian_factor = 0.0
    st.hair_length = height
    try:
        st.root_radius = 0.0025
        st.tip_radius = 0.0
        st.radius_scale = 1.0
        st.use_close_tip = True
    except Exception:
        pass
    st.render_step = 3
    st.display_step = 2
    st.display_percentage = 10
    ps.seed = seed
    if radius:
        ps.vertex_group_density = "grass"
        ps.vertex_group_length = "grass"
    # Hair takes the surface's second material slot.
    gm = bpy.data.materials.new("Grass blades")
    nt = _nodes(gm)
    nt.nodes.clear()
    out = _n(nt, "ShaderNodeOutputMaterial", 600, 0)
    bsdf = _n(nt, "ShaderNodeBsdfPrincipled", 250, 0)
    info = _n(nt, "ShaderNodeHairInfo", -500, 0)
    base = _rgb(color or "#4f7a2c")
    c1 = tuple(x * 0.45 for x in base[:3]) + (1,)
    c2 = tuple(min(1, x * 1.25) for x in base[:3]) + (1,)
    rp = _ramp(nt, info.outputs["Random"], c1, c2, -250, 150, 0.0, 1.0)
    # Darker at the root, lighter at the tip.
    tip = _n(nt, "ShaderNodeMix", 0, 200, data_type="RGBA", blend_type="MULTIPLY")
    nt.links.new(rp.outputs[0], tip.inputs[6])
    grad = _ramp(nt, info.outputs["Intercept"], (0.45, 0.45, 0.4, 1), (1, 1, 1, 1), -250, 350, 0.0, 0.6)
    nt.links.new(grad.outputs[0], tip.inputs[7])
    tip.inputs["Factor"].default_value = 1.0
    nt.links.new(tip.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.5
    bsdf.inputs["Subsurface Weight"].default_value = 0.4
    bsdf.inputs["Subsurface Scale"].default_value = 0.003
    nt.links.new(bsdf.outputs[0], out.inputs["Surface"])
    on.data.materials.append(gm)
    st.material = len(on.data.materials)
    return ps


def _leaf_material(color, name):
    """Leaves: an oval cut out of each card, light shining through, every leaf
    a slightly different green (from the 'rand' UV map)."""
    m = bpy.data.materials.new(name)
    nt = _nodes(m)
    nt.nodes.clear()
    out = _n(nt, "ShaderNodeOutputMaterial", 700, 0)
    uv = _n(nt, "ShaderNodeUVMap", -900, 0)
    uv.uv_map = "UVMap"
    sep = _n(nt, "ShaderNodeSeparateXYZ", -700, 0)
    nt.links.new(uv.outputs[0], sep.inputs[0])
    dx = _n(nt, "ShaderNodeMath", -550, 60, operation="SUBTRACT")
    nt.links.new(sep.outputs["X"], dx.inputs[0])
    dx.inputs[1].default_value = 0.5
    dy = _n(nt, "ShaderNodeMath", -550, -60, operation="SUBTRACT")
    nt.links.new(sep.outputs["Y"], dy.inputs[0])
    dy.inputs[1].default_value = 0.5
    ln = _n(nt, "ShaderNodeCombineXYZ", -400, 0)
    nt.links.new(dx.outputs[0], ln.inputs["X"])
    nt.links.new(dy.outputs[0], ln.inputs["Y"])
    lg = _n(nt, "ShaderNodeVectorMath", -250, 0, operation="LENGTH")
    nt.links.new(ln.outputs[0], lg.inputs[0])
    cut = _n(nt, "ShaderNodeMath", -100, 0, operation="LESS_THAN")
    nt.links.new(lg.outputs["Value"], cut.inputs[0])
    cut.inputs[1].default_value = 0.5
    ruv = _n(nt, "ShaderNodeUVMap", -900, 300)
    ruv.uv_map = "rand"
    rsep = _n(nt, "ShaderNodeSeparateXYZ", -700, 300)
    nt.links.new(ruv.outputs[0], rsep.inputs[0])
    base = _rgb(color)
    rp = _ramp(nt, rsep.outputs["X"], tuple(x * 0.5 for x in base[:3]) + (1,), tuple(min(1, x * 1.35) for x in base[:3]) + (1,), -300, 300, 0.0, 1.0)
    bsdf = _n(nt, "ShaderNodeBsdfPrincipled", 150, 200)
    nt.links.new(rp.outputs[0], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.45
    tr = _n(nt, "ShaderNodeBsdfTranslucent", 150, -100)
    nt.links.new(rp.outputs[0], tr.inputs["Color"])
    mix = _n(nt, "ShaderNodeMixShader", 350, 100)
    mix.inputs[0].default_value = 0.3
    nt.links.new(bsdf.outputs[0], mix.inputs[1])
    nt.links.new(tr.outputs[0], mix.inputs[2])
    tp = _n(nt, "ShaderNodeBsdfTransparent", 350, -150)
    mix2 = _n(nt, "ShaderNodeMixShader", 520, 0)
    nt.links.new(cut.outputs[0], mix2.inputs[0])
    nt.links.new(tp.outputs[0], mix2.inputs[1])
    nt.links.new(mix.outputs[0], mix2.inputs[2])
    nt.links.new(mix2.outputs[0], out.inputs["Surface"])
    m["maxx_kind"] = "leaves"
    return m


def _leaves_mesh(clusters, size, rnd, needle=False, name="Leaves"):
    """Leaf cards as real geometry. clusters: (centre, radii xyz, count)."""
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    rl = bm.loops.layers.uv.new("rand")
    for c, rad, n in clusters:
        for _ in range(n):
            # Mostly in the outer shell of the crown, where leaves get light.
            while True:
                d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-1, 1)))
                if 0.05 < d.length <= 1:
                    break
            d = d.normalized() * (0.25 + 0.75 * rnd.random() ** 0.4)
            p = Vector((c[0] + d.x * rad[0], c[1] + d.y * rad[1], c[2] + d.z * rad[2]))
            k = size * rnd.uniform(0.7, 1.3)
            w, h = (k * 0.16, k) if needle else (k * 0.62, k)
            q = Euler((rnd.uniform(-1.2, 1.2), rnd.uniform(-1.2, 1.2), rnd.uniform(0, math.tau))).to_matrix()
            corners = [q @ Vector(v) for v in ((-w / 2, 0, 0), (w / 2, 0, 0), (w / 2, h, 0), (-w / 2, h, 0))]
            vs = [bm.verts.new(p + v) for v in corners]
            f = bm.faces.new(vs)
            r = rnd.random()
            for loop, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                loop[uv].uv = t
                loop[rl].uv = (r, 0)
    return _from_mesh(name, bm)


def _limb(base, end, r1, r2, mat, segments=10, name="Bough"):
    """A tapering branch from base to end."""
    v = _vec(end) - _vec(base)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=segments, radius1=r1, radius2=r2, depth=v.length)
    for vert in bm.verts:
        vert.co.z += v.length / 2
    obj = _from_mesh(name, bm)
    _smooth(obj, 60)
    _assign(obj, mat)
    obj.rotation_euler = v.to_track_quat("Z", "Y").to_euler()
    obj.location = _vec(base)
    return obj


def tree(height=8.0, at=(0, 0, 0), seed=None, kind="broadleaf", name=None, leaves=1.0):
    """A procedural tree: tapering trunk, boughs and tens of thousands of real
    leaf cards (light shines through them). kind: broadleaf, pine or birch.
    leaves: more or fewer (0.5-2). For a hero tree in close-up, a scanned
    model from blender_assets looks even better."""
    seed = random.randint(0, 9999) if seed is None else seed
    rnd = random.Random(seed)
    at = _vec(at)
    parts = []
    bark_col = {"birch": "#d8d3c8", "pine": "#4a3a2c"}.get(kind, "#5a4636")
    bark = material("bark", color=bark_col, name=f"Bark {kind}")
    leaf_col = {"pine": "#2c4a22", "birch": "#7a9a34"}.get(kind, "#4a6e2a")
    lm = bpy.data.materials.get(f"Leaves {kind}") or _leaf_material(leaf_col, f"Leaves {kind}")
    trunk_h = height * (0.55 if kind != "pine" else 0.95)
    r0 = height * (0.022 if kind != "birch" else 0.015)
    parts.append(_limb(at, at + Vector((rnd.uniform(-0.2, 0.2), rnd.uniform(-0.2, 0.2), trunk_h)), r0, r0 * 0.45, bark, 20, "Trunk"))
    clusters = []
    if kind == "pine":
        layers = 9
        for i in range(layers):
            t = i / (layers - 1)
            r = height * 0.26 * (1 - t) ** 0.9 + 0.2
            z = at.z + height * (0.22 + 0.72 * t)
            for j in range(rnd.randint(5, 8)):
                ang = rnd.uniform(0, math.tau)
                end = Vector((at.x + math.cos(ang) * r, at.y + math.sin(ang) * r, z - r * 0.25))
                parts.append(_limb(Vector((at.x, at.y, z)), end, r0 * 0.18, r0 * 0.05, bark, 6))
                mid = (Vector((at.x, at.y, z)) + end) / 2
                clusters.append((mid, (r * 0.55, r * 0.55, height * 0.05), int(900 * r * leaves)))
        size, needle = 0.16, True
    else:
        # Leaf clusters spread through an egg-shaped crown, each on its own bough.
        n_crowns = rnd.randint(11, 15) if kind != "birch" else rnd.randint(8, 11)
        crown_r = height * (0.3 if kind != "birch" else 0.22)
        crown_c = Vector((at.x, at.y, at.z + trunk_h + crown_r * 0.55))
        for i in range(n_crowns):
            while True:
                d = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.8, 1)))
                if d.length <= 1:
                    break
            end = crown_c + Vector((d.x * crown_r, d.y * crown_r, d.z * crown_r * 0.8))
            r = height * rnd.uniform(0.08, 0.14)
            base = Vector((at.x, at.y, at.z + trunk_h * rnd.uniform(0.7, 1.0)))
            parts.append(_limb(base, end, r0 * 0.35, r0 * 0.08, bark, 8))
            clusters.append((end, (r * rnd.uniform(0.9, 1.3), r * rnd.uniform(0.9, 1.3), r * 0.7), int(6000 * r * r * leaves)))
        size, needle = (0.12 if kind != "birch" else 0.09), False
    foliage = _leaves_mesh(clusters, size, rnd, needle, f"{kind.title()} leaves")
    _assign(foliage, lm)
    parts.append(foliage)
    root = bpy.data.objects.new(name or "Tree", None)
    _link(root)
    root.location = at
    bpy.context.view_layer.update()
    for p in parts:
        p["maxx_part"] = True
        mw = p.matrix_world.copy()
        p.parent = root
        p.matrix_world = mw
    return root


# ---------------------------------------------------------------- camera

def camera(at=(6, -8, 1.6), look=(0, 0, 0.8), lens=40, fstop=None, focus=None, name="Camera"):
    """The camera at `at` looking at `look`. lens in mm (24 wide, 35-50 natural,
    85-135 portrait/product). fstop (1.4-8) blurs what isn't at `focus` (default: look)."""
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36
    cd.clip_start = 0.05
    cd.clip_end = 5000
    obj = _link(bpy.data.objects.new(name, cd))
    obj.location = _vec(at)
    _aim(obj, look)
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = ((_vec(focus) if focus is not None else _vec(look)) - obj.location).length
    bpy.context.scene.camera = obj
    _state["camera_set"] = True
    return obj


def auto_camera(lens=45, height=None, side=-35):
    """A three-quarter view that frames everything (used when a script sets no camera)."""
    lo, hi = _bounds(include_ground=False)
    if (hi - lo).length < 1e-3:
        lo, hi = Vector((-1, -1, 0)), Vector((1, 1, 1.5))
    c = (lo + hi) / 2
    radius = max((hi - lo).length / 2, 0.3)
    fov = 2 * math.atan(18 / lens)  # horizontal, 36 mm sensor
    dist = radius / math.sin(fov / 2) * 1.05
    az = math.radians(side)
    el = math.radians(14 if height is None else math.degrees(math.atan2(height - c.z, dist)))
    pos = c + Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * dist
    pos.z = max(pos.z, 0.3)
    return camera(at=tuple(pos), look=tuple(c), lens=lens)


def orbit(seconds=6, fps=30, target=None, radius=None, height=None, lens=50):
    """A turntable: the camera circles the scene once (render with frames)."""
    sc = bpy.context.scene
    lo, hi = _bounds(include_ground=False)
    c = _vec(target) if target is not None else (lo + hi) / 2
    r = radius or max(2.0, (hi - lo).length * 1.1)
    h = height if height is not None else c.z + r * 0.3
    pivot = bpy.data.objects.new("Orbit", None)
    _link(pivot)
    pivot.location = c
    cam = camera(at=(c.x, c.y - r, h), look=tuple(c), lens=lens)
    cam.parent = pivot
    cam.matrix_parent_inverse = pivot.matrix_world.inverted()
    sc.render.fps = fps
    sc.frame_start, sc.frame_end = 1, int(seconds * fps)
    pivot.rotation_euler.z = 0
    pivot.keyframe_insert("rotation_euler", index=2, frame=1)
    pivot.rotation_euler.z = math.tau
    pivot.keyframe_insert("rotation_euler", index=2, frame=sc.frame_end + 1)
    _linear(pivot)
    return cam


def key(obj, frame, at=None, rot=None, scale=None):
    """Keyframe an object (animation): key(car, 1, at=(0,0,0)); key(car, 90, at=(20,0,0))."""
    if at is not None:
        obj.location = _vec(at)
        obj.keyframe_insert("location", frame=frame)
    if rot is not None:
        obj.rotation_euler = Euler([math.radians(x) for x in _vec(rot)], "XYZ")
        obj.keyframe_insert("rotation_euler", frame=frame)
    if scale is not None:
        obj.scale = _vec(scale, fill=1)
        obj.keyframe_insert("scale", frame=frame)
    sc = bpy.context.scene
    sc.frame_end = max(sc.frame_end if sc.frame_end != 250 else 1, frame)


def _linear(obj):
    try:
        for fc in obj.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
    except Exception:
        # Blender 5 keeps curves in layered actions.
        try:
            for layer in obj.animation_data.action.layers:
                for strip in layer.strips:
                    for bag in strip.channelbags:
                        for fc in bag.fcurves:
                            for kp in fc.keyframe_points:
                                kp.interpolation = "LINEAR"
        except Exception:
            pass


# ---------------------------------------------------------------- bounds, audit, report

def _bounds_of(objs):
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    found = False
    deps = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type not in ("MESH", "CURVE", "FONT", "SURFACE", "META"):
            continue
        for c in o.bound_box:
            p = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, p))
            hi = Vector(map(max, hi, p))
            found = True
    if not found:
        return Vector((0, 0, 0)), Vector((0, 0, 0))
    return lo, hi


def _things(include_ground=False):
    out = []
    for o in bpy.context.scene.objects:
        if o.type not in ("MESH", "CURVE", "FONT") or o.get("maxx_fog") or o.get("maxx_template"):
            continue
        if not include_ground and o.get("maxx_ground"):
            continue
        if o.hide_render or any(c.hide_render for c in o.users_collection):
            continue
        out.append(o)
    # Collection instances count as their contents.
    return out


def _bounds(include_ground=False):
    objs = _things(include_ground)
    inst = [o for o in bpy.context.scene.objects if o.instance_type == "COLLECTION" and o.instance_collection]
    lo, hi = _bounds_of(objs)
    for o in inst:
        p = o.matrix_world.translation
        if not objs and o is inst[0]:
            lo, hi = p.copy(), p.copy()
        lo = Vector(map(min, lo, p))
        hi = Vector(map(max, hi, p))
    if not objs and not inst:
        return Vector((0, 0, 0)), Vector((0, 0, 0))
    return lo, hi


def _issue(out, cost, what, fix):
    out.append({"cost": cost, "what": what, "fix": fix})


def audit():
    """Things that make a render look fake, with how to fix each."""
    sc = bpy.context.scene
    issues = []
    objs = _things(include_ground=True)
    meshes = [o for o in objs if o.type == "MESH"]
    lights = [o for o in sc.objects if o.type == "LIGHT"]
    ground = [o for o in objs if o.get("maxx_ground")]
    cam = sc.camera
    if cam is None:
        _issue(issues, 15, "no camera", "S.camera(at=(x, y, 1.6), look=(target), lens=35-50)")
    # World light.
    w = sc.world
    world_kind = "none"
    if w and w.node_tree:
        kinds = {n.bl_idname for n in w.node_tree.nodes}
        world_kind = "sky" if "ShaderNodeTexSky" in kinds else "hdri" if "ShaderNodeTexEnvironment" in kinds else "colour"
    if world_kind in ("none", "colour") and not lights:
        _issue(issues, 18, "no sky or lights: the scene is lit by a flat grey void", "S.stage('clear-day') (or golden-hour, overcast, studio, night...)")
    elif world_kind in ("none", "colour"):
        _issue(issues, 8, "the world is a flat colour, so nothing reflects a sky", "S.stage(preset) or S.hdri('studio') for sky light")
    if sc.view_settings.view_transform == "Standard":
        _issue(issues, 12, "colour is 'Standard': highlights clip like a 2005 game", "Keep AgX (S.reset sets it)")
    if sc.render.engine == "CYCLES" and sc.cycles.samples < 16:
        _issue(issues, 6, f"only {sc.cycles.samples} samples", "Leave samples to the quality setting")
    # Materials.
    no_mat = [o.name for o in meshes if not any(s.material for s in o.material_slots)]
    if no_mat:
        _issue(issues, min(20, 8 + 2 * len(no_mat)), f"{len(no_mat)} object(s) have no material and render as clay: {', '.join(no_mat[:6])}", "Give every object mat='...' (S.MATS kinds) or S.pbr(folder)")
    plain = []
    for m in {s.material for o in meshes for s in o.material_slots if s.material}:
        if m.get("maxx_kind"):
            continue
        nt = m.node_tree
        if nt and not any(n.bl_idname.startswith("ShaderNodeTex") for n in nt.nodes):
            plain.append(m.name)
    if len(plain) > 2:
        _issue(issues, min(12, 2 * len(plain)), f"{len(plain)} materials are one flat colour with no texture: {', '.join(plain[:5])}", "Use S.mat kinds (they carry grain, wear and bump) or photo textures")
    for m in {s.material for o in meshes for s in o.material_slots if s.material}:
        try:
            b = m.node_tree.nodes.get("Principled BSDF")
            if b and not b.inputs["Base Color"].is_linked:
                c = b.inputs["Base Color"].default_value
                lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
                if lum < 0.004 and b.inputs["Metallic"].default_value < 0.5 and b.inputs["Emission Strength"].default_value == 0 and not m.get("maxx_kind"):
                    _issue(issues, 3, f"'{m.name}' is pure black; nothing real is", "Use a very dark grey (#141414) so it still shows shape")
                if lum > 0.9 and b.inputs["Transmission Weight"].default_value < 0.5:
                    _issue(issues, 3, f"'{m.name}' is pure white; it will glare", "Real white is about #e8e8e4")
        except Exception:
            pass
    # Sharp edges.
    sharp = []
    for o in meshes:
        if o.get("maxx_ground") or o.get("maxx_part"):
            continue
        me = o.data
        if len(me.polygons) <= 12 and len(me.vertices) <= 24 and not any(m.type in ("BEVEL", "SUBSURF") for m in o.modifiers):
            sharp.append(o.name)
    if sharp:
        _issue(issues, min(10, 2 + len(sharp)), f"{len(sharp)} object(s) have razor-sharp edges (a CG giveaway): {', '.join(sharp[:6])}", "Make them with S.box(..., bevel=0.01) or add a Bevel modifier")
    # Ground and floating.
    if not ground and meshes:
        lo, hi = _bounds_of(meshes)
        if lo.z > -0.01:
            _issue(issues, 15, "nothing to stand on: objects hang in an empty world", "S.ground(mat='concrete'/'grass'/...), S.terrain() or S.backdrop()")
    deps = bpy.context.evaluated_depsgraph_get()
    floating = []
    cands = []
    for o in meshes:
        if o.get("maxx_ground") or o.parent is not None:
            continue
        lo, hi = _bounds_of([o])
        if lo.z >= 0.05:
            cands.append((o, lo, hi))
    boxes = [(o2, *_bounds_of([o2])) for o2 in meshes if not o2.get("maxx_ground")]

    def touching(o, lo, hi):
        # Resting on another object's top (a cup on a table, a top on its legs).
        for o2, lo2, hi2 in boxes:
            if o2 is o or abs(hi2.z - lo.z) > 0.03 and not (lo2.z < lo.z < hi2.z):
                continue
            if lo2.x < hi.x and hi2.x > lo.x and lo2.y < hi.y and hi2.y > lo.y:
                return True
        return False

    for o, lo, hi in cands[:60]:
        if touching(o, lo, hi):
            continue
        # Look straight down from the base (the object itself hidden) at the
        # 9×9 points under it (edges too, where legs are); it floats only if every ray finds a gap.
        was = o.hide_viewport
        o.hide_viewport = True
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        gaps = []
        steps = (0.03, 0.08, 0.15, 0.3, 0.5, 0.7, 0.85, 0.92, 0.97)
        for fx, fy in [(a, b) for a in steps for b in steps]:
            p = Vector((lo.x + (hi.x - lo.x) * fx, lo.y + (hi.y - lo.y) * fy, lo.z + 0.01))
            hit, loc, _n2, _i, ob, _m = sc.ray_cast(dg, p, Vector((0, 0, -1)))
            gaps.append(lo.z - loc.z if hit else lo.z)
        o.hide_viewport = was
        g = min(gaps)
        if g > 0.03:
            floating.append(f"{o.name} ({g:.2f} m up)")
    if cands:
        bpy.context.view_layer.update()
    if floating and len(floating) <= 12:
        _issue(issues, min(10, 3 * len(floating)), f"floating with nothing under them: {', '.join(floating[:5])}", "Use at=(x, y, z) where z is the surface it stands on (objects stand on 'at')")
    # Scale.
    if meshes:
        lo, hi = _bounds(include_ground=False)
        size = (hi - lo).length
        if size > 5000:
            _issue(issues, 6, f"the scene is {size:.0f} m across: is it in metres?", "1 unit = 1 m; a person 1.75, a door 2.0, a car 4.5 long")
    # Camera framing.
    if cam is not None and meshes:
        from bpy_extras.object_utils import world_to_camera_view
        seen = 0
        nonground = [o for o in meshes if not o.get("maxx_ground")]
        for o in nonground:
            lo, hi = _bounds_of([o])
            p = world_to_camera_view(sc, cam, (lo + hi) / 2)
            if 0 <= p.x <= 1 and 0 <= p.y <= 1 and p.z > 0:
                seen += 1
        if nonground and seen == 0:
            _issue(issues, 25, "the camera sees none of the objects", "Point S.camera(look=...) at the subject, or leave the camera out and Maxx frames it")
        if cam.location.z < 0.05 and ground:
            _issue(issues, 5, "the camera is at or under the ground", "Eye height is about 1.6 m; low hero shots 0.3-0.8 m")
    issues.sort(key=lambda i: -i["cost"])
    return issues


def facts():
    sc = bpy.context.scene
    objs = [o for o in sc.objects]
    tris = 0
    deps = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type == "MESH":
            try:
                ev = o.evaluated_get(deps)
                me = ev.to_mesh()
                tris += sum(len(p.vertices) - 2 for p in me.polygons)
                ev.to_mesh_clear()
            except Exception:
                pass
    lo, hi = _bounds(include_ground=False)
    cam = sc.camera
    out = {
        "blender": bpy.app.version_string,
        "kit": KIT_VERSION,
        "preset": _state["preset"],
        "engine": sc.render.engine,
        "size": [sc.render.resolution_x * sc.render.resolution_percentage // 100, sc.render.resolution_y * sc.render.resolution_percentage // 100],
        "samples": sc.cycles.samples if sc.render.engine == "CYCLES" else None,
        "objects": len([o for o in objs if o.type in ("MESH", "CURVE", "FONT")]),
        "instances": len([o for o in objs if o.instance_type == "COLLECTION"]),
        "lights": [f"{o.name} {o.data.type.lower()} {o.data.energy:g}W" for o in objs if o.type == "LIGHT"][:8],
        "triangles": tris,
        "extent": [round(x, 2) for x in (hi - lo)],
        "camera": None if cam is None else {"at": [round(x, 2) for x in cam.location], "lens": round(cam.data.lens, 1)},
        "frames": [sc.frame_start, sc.frame_end],
        "materials": sorted({s.material.name for o in objs if o.type == "MESH" for s in o.material_slots if s.material})[:20],
        "notes": _state["notes"],
        "list": [],
    }
    for o in objs:
        if o.type in ("MESH", "CURVE", "FONT", "EMPTY") and o.parent is None and len(out["list"]) < 40:
            if o.type == "EMPTY" and o.instance_type == "COLLECTION":
                continue
            lo2, hi2 = _bounds_of([o] + list(o.children_recursive))
            dims = hi2 - lo2
            mats = [s.material.name for s in o.material_slots if s.material][:2] if o.type != "EMPTY" else []
            out["list"].append(f"{o.name}: {dims.x:.2f}×{dims.y:.2f}×{dims.z:.2f} m at ({o.location.x:.1f}, {o.location.y:.1f}, {o.location.z:.1f})" + (f" [{', '.join(mats)}]" if mats else ""))
    return out
