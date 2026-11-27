# Adds the "AnswerPhone" animation and a cell phone to Griffin_2.blend, then
# exports public/Phone/model/griffin.glb. Run with:
#   /Applications/Blender.app/Contents/MacOS/Blender -b "<path>/Griffin_2.blend" \
#     --python scripts/build-answer-animation.py -- <out dir> glb=public/Phone/model/griffin.glb
# Add "render" after <out dir> to also write preview PNGs of key frames.

import bpy, bmesh, sys, os, math
from mathutils import Matrix, Vector, Quaternion

args = sys.argv[sys.argv.index("--") + 1:]
OUT_DIR = args[0]
RENDER = "render" in args
GLB = next((a.split("=", 1)[1] for a in args if a.startswith("glb=")), None)

scene = bpy.context.scene
rig = bpy.data.objects["CXB_Rig"]
pbs = rig.pose.bones

# A small bone between the hand and the phone, so the phone can turn in the
# grip (to lie flat against his head) without bending the hand.
bpy.context.view_layer.objects.active = rig
rig.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
hand_eb = rig.data.edit_bones["hand.R"]
grip = rig.data.edit_bones.new("phone_grip")
grip.head, grip.tail, grip.roll = hand_eb.head, hand_eb.tail, hand_eb.roll
grip.parent = hand_eb
grip.use_deform = False
bpy.ops.object.mode_set(mode="OBJECT")
pbs = rig.pose.bones

# ---- base pose: idle frame 0 --------------------------------------------
ad = rig.animation_data
ad.action = bpy.data.actions["Idle_CXB"]
if ad.action.slots:
    ad.action_slot = ad.action.slots[0]
scene.frame_set(0)
base = {}
for pb in pbs:
    base[pb.name] = (pb.location.copy(), pb.rotation_quaternion.copy(),
                     pb.rotation_euler.copy(), pb.scale.copy())

act = bpy.data.actions.new("AnswerPhone")
act.use_fake_user = True
ad.action = act
for pb in pbs:
    l, q, e, s = base[pb.name]
    pb.location, pb.rotation_quaternion, pb.rotation_euler, pb.scale = l, q, e, s

END = 100
# How far up the hand, from the wrist toward the fingertips, the phone sits.
PHONE_ALONG_FINGERS = 0.115

def key_all(frame):
    for pb in pbs:
        pb.keyframe_insert("location", frame=frame)
        pb.keyframe_insert("rotation_euler" if pb.rotation_mode != "QUATERNION" else "rotation_quaternion", frame=frame)
        pb.keyframe_insert("scale", frame=frame)

key_all(0)
key_all(END)

def upd():
    bpy.context.view_layer.update()

def place(name, pos, key=True):
    pb = pbs[name]
    m = pb.matrix.copy()
    m.translation = Vector(pos)
    pb.matrix = m
    upd()
    if key:
        pb.keyframe_insert("location", frame=scene.frame_current)

def hand_axes(fingers, palm):
    y = Vector(fingers).normalized()
    p = Vector(palm)
    p = (p - y * p.dot(y)).normalized()
    x = -p
    z = x.cross(y)
    return Matrix((x, y, z)).transposed()

def orient_hand(fingers, palm):
    pb = pbs["hand.R"]
    if fingers == "forearm":
        # Straight wrist: the hand carries on in line with the forearm.
        fa = pbs["forearm.R"]
        fingers = fa.tail - fa.head
    m = hand_axes(fingers, palm).to_4x4()
    m.translation = pb.head
    pb.matrix = m
    upd()
    pb.keyframe_insert("rotation_quaternion", frame=scene.frame_current)

def thumb(angle):
    for n, k in (("thumb.01.R", 0.5), ("thumb.02.R", 0.8), ("thumb.03.R", 0.8)):
        pb = pbs[n]
        pb.rotation_quaternion = base[n][1] @ Quaternion((1, 0, 0), math.radians(angle * k))
        pb.keyframe_insert("rotation_quaternion", frame=scene.frame_current)

def head(tilt_deg, turn_deg=0):
    pb = pbs["spine.006"]
    pb.rotation_quaternion = base["spine.006"][1] @ Quaternion((0, 0, 1), math.radians(tilt_deg)) @ Quaternion((0, 1, 0), math.radians(turn_deg))
    pb.keyframe_insert("rotation_quaternion", frame=scene.frame_current)

def curl(amount):
    # Wrap the fingers around the phone's edge.
    for f in ("index", "middle", "ring", "pinky"):
        for i, k in ((1, 0.6), (2, 1.0), (3, 0.8)):
            n = f"f_{f}.0{i}.R"
            pb = pbs[n]
            pb.rotation_quaternion = base[n][1] @ Quaternion((1, 0, 0), math.radians(amount * k))
            pb.keyframe_insert("rotation_quaternion", frame=scene.frame_current)

# (frame, wrist, elbow pole, fingers dir, palm normal, thumb, curl, head tilt)
LOOK = ((-0.10, -0.22, 1.24), (-0.5, 0.25, 0.9), (0, -0.83, 0.55), (0.1, 0.3, 0.45))

def drift(t):
    # While he looks at the phone his hand keeps easing up toward his face
    # instead of freezing: t runs 0..1 across that stretch.
    (x, y, z), pole, fingers, palm = LOOK
    return (x + 0.015 * t, y + 0.02 * t, z + 0.04 * t), pole, fingers, palm

POSES = [
    (0,  None, None, None, None, 0, 0, 0),
    # Hand comes to the side of the shorts, palm flat against the hip, elbow out.
    (14, (-0.34, 0.03, 1.08), (-1.0, 0.35, 1.25), (0, 0.05, -1), (1, 0, 0), 0, 5, 0),
    # Plunges into the side pocket and grabs the phone, then straight back out.
    (24, (-0.27, 0.05, 0.84), (-1.1, 0.3, 1.1), (0, 0.05, -1), (1, 0, 0), 0, 18, 0),
    # Pulls the phone out, elbow still out to the side.
    (34, (-0.35, -0.02, 1.08), (-0.95, 0.3, 0.95), (0, -0.2, -1), (1, 0.2, 0), 0, 18, 0),
    # Looks at the phone and presses answer, the hand still drifting slowly.
    (46, *drift(0), 0, 18, -12),
    (52, *drift(0.35), 35, 18, -12),
    (56, *drift(0.6), 0, 18, -12),
    (64, *drift(1), 0, 18, -12),
    # Phone to the ear with the elbow out to the side: the wrist and elbow are
    # worked out by solve_ear() below, and the hand stays in line with the
    # forearm.
    (82, "ear", None, "forearm", (1, 0, 0), 0, 18, 6),
    (END, "ear", None, "forearm", (1, 0, 0), 0, 18, 6),
]

# The arm alone can't reach into the pocket, so the body helps: (frame, how far
# the hips sink with bent knees, sideways lean toward the pocket in degrees,
# how far the right shoulder drops in degrees).
BODY = {
    14: (0.03, 4, 6),
    24: (0.08, 9, 14),
    34: (0.03, 3, 4),
    46: (0.0, 0, 0),
}

def reset_rotation(pb):
    pb.rotation_quaternion = base[pb.name][1]
    pb.rotation_euler = base[pb.name][2]

def key_rotation(pb):
    pb.keyframe_insert("rotation_euler" if pb.rotation_mode != "QUATERNION" else "rotation_quaternion", frame=scene.frame_current)

def swing(name, deg):
    # Rotate a bone about the front-to-back axis through its head. Negative
    # degrees tip it toward his right side.
    pb = pbs[name]
    reset_rotation(pb)
    upd()
    h = pb.head.copy()
    pb.matrix = (Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, "Y")
                 @ Matrix.Translation(-h) @ pb.matrix)
    upd()
    key_rotation(pb)

def body(drop, lean, shoulder):
    pb = pbs["spine"]
    pb.location = base["spine"][0]
    upd()
    m = pb.matrix.copy()
    m.translation.z -= drop
    pb.matrix = m
    upd()
    pb.keyframe_insert("location", frame=scene.frame_current)
    swing("spine.001", -lean)
    swing("shoulder.R", -shoulder)

def elbow_circle(samples):
    # The rig's IK pole is offset by about 85 degrees, so rather than aiming it
    # by eye, try poles all the way around the arm and report where the elbow
    # lands for each.
    shoulder = pbs["upper_arm.R"].head.copy()
    wrist = pbs["IKarm.R"].head.copy()
    axis = (wrist - shoulder).normalized()
    side = axis.orthogonal().normalized()
    up = axis.cross(side)
    mid = (shoulder + wrist) / 2
    for i in range(samples):
        a = 2 * math.pi * i / samples
        pole = mid + (side * math.cos(a) + up * math.sin(a)) * 0.6
        place("IKelbow.R", pole, key=False)
        yield pole, pbs["forearm.R"].head.copy(), pbs["forearm.R"].tail.copy()

def solve_ear():
    """Find a wrist and elbow that put the phone on the ear, with the elbow
    out to the side near shoulder height and the hand straight in line with
    the forearm. Folding the elbow too tightly or lifting it well above the
    shoulder crumples this model's arm, so both are penalised."""
    head = pbs["spine.006"].head
    shoulder = pbs["upper_arm.R"].head.copy()
    phone_at = head + Vector((-0.10, -0.035, 0.02))
    out = Vector((-0.9, shoulder.y, shoulder.z))

    def score(wrist_target):
        place("IKarm.R", wrist_target, key=False)
        best = None
        for pole, elbow, wrist in elbow_circle(24):
            d = (elbow - out).length
            if best is None or d < best[0]:
                best = (d, pole, elbow, wrist)
        _, pole, elbow, wrist = best
        u = (wrist - elbow).normalized()
        palm = Vector((1, 0, 0))
        palm = (palm - u * palm.dot(u)).normalized()
        phone = wrist + u * PHONE_ALONG_FINGERS + palm * 0.022
        cost = (phone - phone_at).length
        cost += 0.6 * max(0, elbow.x + 0.40)                  # elbow out to the side
        cost += 0.6 * max(0, elbow.z - (shoulder.z + 0.08))   # not far above the shoulder
        cost += 0.6 * max(0, (shoulder.z - 0.15) - elbow.z)   # nor dropped low
        cost += 0.6 * max(0, (shoulder.y - 0.12) - elbow.y)   # nor swung forward
        cost += 0.8 * max(0, 0.20 - (wrist - shoulder).length)  # elbow not folded shut
        return cost, pole

    def search(center, step, n):
        best = None
        for i in range(-n, n + 1):
            for j in range(-n, n + 1):
                for k in range(-n, n + 1):
                    w = center + Vector((i, j, k)) * step
                    c, pole = score(w)
                    if best is None or c < best[0]:
                        best = (c, w, pole)
        return best

    _, w, _ = search(Vector((-0.26, 0.03, 1.65)), 0.03, 5)
    cost, w, pole = search(w, 0.01, 3)
    print("EAR wrist", tuple(round(v, 3) for v in w), "cost", round(cost, 3))
    return w, pole

ear_pose = None

for frame, wrist, pole, fingers, palm, th, cu, tilt in POSES:
    scene.frame_set(frame)
    if frame in BODY:
        body(*BODY[frame])
    head(tilt)
    if wrist == "ear":
        ear_pose = ear_pose or solve_ear()
        wrist, pole = ear_pose
    if wrist:
        place("IKelbow.R", pole)
        place("IKarm.R", wrist)
        orient_hand(fingers, palm)
    thumb(th)
    curl(cu)

# ---- phone -----------------------------------------------------------------
def mat(name, color, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = 0.35
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1)
        bsdf.inputs["Emission Strength"].default_value = 1.0
    return m

def box(name, size, material, offset=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=size, verts=bm.verts)
    bmesh.ops.translate(bm, vec=offset, verts=bm.verts)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(material)
    ob = bpy.data.objects.new(name, me)
    scene.collection.objects.link(ob)
    return ob

W, L, T = 0.075, 0.155, 0.011
phone = box("CellPhone", (W, L, T), mat("PhoneBody", (0.03, 0.03, 0.035)))
screen = box("CellPhoneScreen", (W * 0.9, L * 0.9, 0.002), mat("PhoneScreen", (0.05, 0.1, 0.2), (0.08, 0.18, 0.4)), (0, 0, T / 2 + 0.001))
answer = box("AnswerButton", (0.018, 0.018, 0.002), mat("AnswerGreen", (0.1, 0.8, 0.2), (0.1, 0.9, 0.2)), (0, -L * 0.3, T / 2 + 0.002))
screen.parent = phone
answer.parent = phone

# Seat the phone in the palm at the "looking at it" pose: long axis along the
# fingers, screen (+Z of the phone) facing out of the palm.
scene.frame_set(50)
upd()
hb = pbs["phone_grip"]
hm = rig.matrix_world @ hb.matrix
hx, hy, hz = (hm.to_3x3().col[i].normalized() for i in range(3))
palm = -hx
center = hm.translation + hy * PHONE_ALONG_FINGERS * rig.scale.x + palm * 0.022 * rig.scale.x + hz * 0.005
rot = Matrix((hz, hy, palm)).transposed()  # phone X, Y (long), Z (screen)
phone.parent = rig
phone.parent_type = "BONE"
phone.parent_bone = "phone_grip"
upd()
phone.matrix_world = Matrix.Translation(center) @ rot.to_4x4() @ Matrix.Scale(rig.scale.x, 4)
upd()

# At the ear, turn the phone in the grip so it lies flat against the side of
# his head (screen toward the head, top up by the ear, bottom angled toward his
# mouth), whatever angle the hand is at. It turns while the hand travels up.
gp = pbs["phone_grip"]
def grip_identity():
    gp.location = (0, 0, 0)
    gp.rotation_quaternion = (1, 0, 0, 0)
    upd()

for f in (0, 64):
    scene.frame_set(f)
    grip_identity()
    gp.keyframe_insert("location", frame=f)
    gp.keyframe_insert("rotation_quaternion", frame=f)

screen = Vector((1, 0, 0))
top = Vector((0, 0.3, 1)).normalized()
side = top.cross(screen)
flat = Matrix((side, top, screen)).transposed()  # phone X, Y (long), Z (screen)
for f in (82, END):
    scene.frame_set(f)
    grip_identity()
    now = phone.matrix_world.copy()
    want = Matrix.Translation(now.translation) @ (rig.matrix_world.to_3x3() @ flat).normalized().to_4x4() @ Matrix.Scale(rig.scale.x, 4)
    bone_w = rig.matrix_world @ gp.matrix
    k = bone_w.inverted() @ now
    gp.matrix = rig.matrix_world.inverted() @ want @ k.inverted()
    upd()
    gp.keyframe_insert("location", frame=f)
    gp.keyframe_insert("rotation_quaternion", frame=f)

ad.action = act
if act.slots:
    # Name the slot like the rig's other actions ("Legacy Slot"), so picking a
    # different action in Blender's Action Editor keeps the rig animating
    # instead of leaving it with no slot assigned.
    act.slots[0].name_display = "Legacy Slot"
    ad.action_slot = act.slots[0]
print("SLOTS", {a.name: [sl.identifier for sl in a.slots] for a in bpy.data.actions})
scene.frame_start, scene.frame_end = 0, END

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT_DIR, "griffin_answer.blend"), copy=True)

# ---- mouth -----------------------------------------------------------------
# A dark mouth opening laid over the mouth painted on his face texture. It's
# fixed to the head bone and has a "MouthOpen" shape key: at 0 it's a flat
# line along the upper lip (invisible), at 1 it opens down to the lower lip.
# The site drives that key from the loudness of the voice recordings.

# Where the painted mouth is in Tex_GriffHead.png (256x256 px). The face is
# mirrored: the middle of his face is the face island's left edge, x = 13-14.
TEX = 256
MOUTH_UV = {
    "upper": (14.5, 183),  # upper lip, middle of the face
    "lower": (14.5, 198),  # lower lip, middle of the face
    "corner": (49, 181),   # corner of the mouth
}

body = bpy.data.objects["Head_Griff"]
head_slot = [i for i, sl in enumerate(body.material_slots)
             if sl.material and sl.material.name == "Mat_GriffHead"][0]
scene.frame_set(0)
dg = bpy.context.evaluated_depsgraph_get()
posed = body.evaluated_get(dg).to_mesh()
posed.calc_loop_triangles()
uvs = posed.uv_layers.active.data
to_world = body.matrix_world

def on_face(px, py):
    """Every spot on the posed head where the texture pixel (px, py) lands,
    as (world position, world normal). Mirrored halves give two hits."""
    p = Vector((px / TEX, 1 - py / TEX))
    hits = []
    for tri in posed.loop_triangles:
        if tri.material_index != head_slot:
            continue
        a, b, c = (uvs[i].uv for i in tri.loops)
        d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)
        if abs(d) < 1e-12:
            continue
        w1 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / d
        w2 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / d
        w3 = 1 - w1 - w2
        if min(w1, w2, w3) < -1e-6:
            continue
        va, vb, vc = (posed.vertices[i].co for i in tri.vertices)
        pos = to_world @ (va * w1 + vb * w2 + vc * w3)
        normal = (to_world.to_3x3() @ tri.normal).normalized()
        hits.append((pos, normal))
    return hits

def front_most(hits):
    return min(hits, key=lambda h: h[0].y)   # he faces -Y

upper_hits = on_face(*MOUTH_UV["upper"])
upper, _ = front_most(upper_hits)
# Each half of the low-poly face is one big tilted triangle here, so average
# the mirrored pair to get a normal pointing straight out of the face.
normal = sum((h[1] for h in upper_hits), Vector()).normalized()
lower, _ = front_most(on_face(*MOUTH_UV["lower"]))
corners = on_face(*MOUTH_UV["corner"])
left = max(corners, key=lambda h: h[0].x)[0]
right = min(corners, key=lambda h: h[0].x)[0]
print("MOUTH upper", tuple(round(v, 3) for v in upper), "lower", tuple(round(v, 3) for v in lower),
      "left", tuple(round(v, 3) for v in left), "right", tuple(round(v, 3) for v in right))

# A frame at the middle of the upper lip: X across the mouth, Z out of the
# face, Y up.
z_axis = normal
x_axis = (left - right)
x_axis = (x_axis - z_axis * x_axis.dot(z_axis)).normalized()
y_axis = z_axis.cross(x_axis)
frame = Matrix((x_axis, y_axis, z_axis)).transposed().to_4x4()
frame.translation = upper
local = lambda v: frame.inverted() @ v

half = (local(left).x - local(right).x) / 2
corner_l = local(left)
depth = -local(lower).y             # upper lip down to lower lip
corner_up = corner_l.y               # corners sit a bit higher than the middle
corner_back = corner_l.z             # and further back around the face
LIFT = 0.004                         # just in front of the skin, never inside it

N = 12
top, bottom = [], []
for i in range(N + 1):
    t = -1 + 2 * i / N               # -1 .. 1 across the mouth
    y = corner_up * t * t
    z = corner_back * t * t + LIFT
    top.append(Vector((t * half, y, z)))
    bottom.append(Vector((t * half, y - depth * math.sqrt(max(0.0, 1 - t * t)), z)))

mesh = bpy.data.meshes.new("MouthOverlay")
mesh.from_pydata([*top, *top], [], [(i, i + 1, N + 2 + i, N + 1 + i) for i in range(N)])
mesh.materials.append(mat("MouthInside", (0.06, 0.015, 0.015)))
overlay = bpy.data.objects.new("MouthOverlay", mesh)
scene.collection.objects.link(overlay)
overlay.shape_key_add(name="Basis")
opened = overlay.shape_key_add(name="MouthOpen")
for i, v in enumerate(bottom):
    opened.data[N + 1 + i].co = v
opened.value = float(os.environ.get("MOUTH", "0"))

# Fix it to the head bone. A bone child hangs off the bone's tail, so work out
# its local transform from the posed head bone rather than assigning
# matrix_world (which lands scaled and shifted here).
head_bone = pbs["spine.006"]
overlay.parent = rig
overlay.parent_type = "BONE"
overlay.parent_bone = "spine.006"
overlay.matrix_parent_inverse = Matrix.Identity(4)
bone_world = rig.matrix_world @ head_bone.matrix @ Matrix.Translation((0, head_bone.length, 0))
overlay.matrix_basis = bone_world.inverted() @ frame
upd()

if RENDER:
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.color_type = "TEXTURE"
    scene.display.shading.light = "STUDIO"
    scene.render.resolution_x, scene.render.resolution_y = 420, 520
    scene.render.film_transparent = False
    cam_data = bpy.data.cameras.new("PreviewCam")
    cam = bpy.data.objects.new("PreviewCam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam_data.lens = 85
    target = Vector((-0.1, 0, float(os.environ.get("TARGET_Z", "1.35"))))
    k = float(os.environ.get("VIEW_SCALE", "1"))
    target.x = float(os.environ.get("TARGET_X", "-0.1"))
    views = {"straight": Vector((0, -2.8, 0.1)) * k + target, "front": Vector((-1.0, -2.6, 0.15)) * k + target, "side": Vector((-2.8, -0.2, 0.15)) * k + target, "back": Vector((-1.6, 2.4, 0.25)) * k + target}
    for f in [int(x) for x in os.environ.get("FRAMES", "0,14,24,38,50,56,80").split(",")]:
        for vname, pos in views.items():
            cam.location = pos
            cam.rotation_euler = (target - pos).to_track_quat("-Z", "Y").to_euler()
            scene.frame_set(f)
            phone.hide_render = f < 24
            for c in phone.children:
                c.hide_render = f < 24
            scene.render.filepath = os.path.join(OUT_DIR, f"f{f:03d}_{vname}.png")
            bpy.ops.render.render(write_still=True)

if GLB:
    for o in bpy.data.objects:
        if o.type == "CAMERA":
            bpy.data.objects.remove(o)
    bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB", export_apply=True,
                              export_animations=True, export_animation_mode="ACTIONS")
