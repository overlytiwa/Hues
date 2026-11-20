"""Render the original hand sculpture and upright handset in Blender.
Run from the project root: blender -b --python scripts/render-scene.py
No downloaded models, photos, generated imagery, or external textures.
"""
import bpy, json, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=96
scene.cycles.use_denoising=False
scene.render.resolution_x=1100;scene.render.resolution_y=1350;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.film_transparent=True
scene.world.color=(.13,.13,.13)
scene.view_settings.view_transform='AgX'

def material(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 return m
skin=material('Skin — warm natural satin',(.46,.285,.196),0,.48)
nodes=skin.node_tree.nodes;links=skin.node_tree.links;bs=nodes.get('Principled BSDF')
bs.inputs['Subsurface Weight'].default_value=.14;bs.inputs['Subsurface Radius'].default_value=(1,.38,.18)
bs.inputs['Subsurface Scale'].default_value=.065
noise=nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=190;noise.inputs['Detail'].default_value=3;noise.inputs['Roughness'].default_value=.7
bump=nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.14;bump.inputs['Distance'].default_value=.014;links.new(noise.outputs['Fac'],bump.inputs['Height']);links.new(bump.outputs['Normal'],bs.inputs['Normal'])
macro=nodes.new('ShaderNodeTexNoise');macro.inputs['Scale'].default_value=4;macro.inputs['Detail'].default_value=3
ramp=nodes.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.15;ramp.color_ramp.elements[0].color=(.35,.18,.12,1);ramp.color_ramp.elements[1].position=.85;ramp.color_ramp.elements[1].color=(.55,.35,.25,1)
links.new(macro.outputs['Fac'],ramp.inputs['Fac']);links.new(ramp.outputs['Color'],bs.inputs['Base Color'])
nail=material('Natural translucent nails',(.60,.40,.32),0,.29);nbs=nail.node_tree.nodes.get('Principled BSDF');nbs.inputs['Coat Weight'].default_value=.32;nbs.inputs['Subsurface Weight'].default_value=.1
cuticle=material('Soft nail bed',(.42,.245,.17),0,.6)
crease=material('Fine skin creases',(.24,.12,.075),0,.75)
materials={'skin':skin,'nail':nail,'cuticle':cuticle,'crease':crease}
for i,part in enumerate(json.loads((ROOT/'scripts/hand-mesh.json').read_text())):
 xyz=part['positions'];idx=part['indices'];vertices=[tuple(xyz[n:n+3]) for n in range(0,len(xyz),3)];faces=[tuple(idx[n:n+3]) for n in range(0,len(idx),3)]
 mesh=bpy.data.meshes.new('Hand sculpture '+str(i));mesh.from_pydata(vertices,[],faces);mesh.update()
 obj=bpy.data.objects.new('Hand '+part['kind']+str(i),mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(materials[part['kind']])
 for poly in mesh.polygons:poly.use_smooth=True
 # Merge coincident marching-cube vertices for consistent smooth normals.
 if part['kind']=='skin':
  bpy.context.view_layer.objects.active=obj;obj.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.0001);bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');obj.select_set(False)
  sub=obj.modifiers.new('Sculpture smoothing','SMOOTH');sub.factor=.65;sub.iterations=3

def cube(name,loc,scale,mat,bevel):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 o.data.materials.append(mat);b=o.modifiers.new('Rounded machined edges','BEVEL');b.width=bevel;b.segments=8;n=o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o
metal=material('Brushed titanium',(.28,.29,.32),.92,.22)
black=material('Polished black glass',(.006,.007,.009),.1,.15)
cube('Phone titanium body',(0,0,0),(2.66,5.38,.25),metal,.18)
cube('Black bezel',(0,0,.128),(2.57,5.29,.04),black,.22)
# Rounded screen plane with explicit UV mapping and an emissive local UI.
w=2.43;h=5.13;r=.205;verts=[(0,0,.155)]
for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
 for j in range(17):
  a=math.radians(start+j*90/16);verts.append((cx+r*math.cos(a),cy+r*math.sin(a),.155))
# The corner order above is CCW: top-right, top-left, bottom-left, bottom-right.
faces=[(0,i,1 if i==len(verts)-1 else i+1) for i in range(1,len(verts))]
mesh=bpy.data.meshes.new('Display UV mesh');mesh.from_pydata(verts,[],faces);mesh.update();uv=mesh.uv_layers.new()
for poly in mesh.polygons:
 for li in poly.loop_indices:
  co=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=((co.x+w/2)/w,(co.y+h/2)/h)
display=bpy.data.objects.new('Original Heus phone interface',mesh);bpy.context.collection.objects.link(display)
screen=bpy.data.materials.new('Heus display');screen.use_nodes=True;n=screen.node_tree.nodes;n.clear();output=n.new('ShaderNodeOutputMaterial');em=n.new('ShaderNodeEmission');em.inputs['Strength'].default_value=.85;tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT/'public/assets/phone-screen.png'));screen.node_tree.links.new(tex.outputs['Color'],em.inputs['Color']);screen.node_tree.links.new(em.outputs[0],output.inputs['Surface']);display.data.materials.append(screen)
cube('Power button',(1.343,.6,0),(.05,.52,.09),metal,.02)
cube('Volume control',(-1.343,1.02,0),(.05,.75,.09),metal,.02)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=12,radius=1,location=(0,2.43,.16));lens=bpy.context.object;lens.name='Android hole-punch camera';lens.scale=(.046,.046,.009);lens.data.materials.append(black)

def area(name,loc,color,power,size):
 light=bpy.data.lights.new(name,'AREA');light.energy=power;light.color=color;light.shape='DISK';light.size=size;obj=bpy.data.objects.new(name,light);bpy.context.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,-1,0))-obj.location).to_track_quat('-Z','Y').to_euler()
area('Large soft key',(-4,5,7),(1,.91,.82),650,5)
area('Cool fill',(4,1,6),(.72,.80,1),280,4)
area('Silver rim',(1,4,-4),(.87,.83,1),800,3)
area('Hand bounce',(-3,-4,4),(1,.79,.66),110,3)
bpy.ops.object.camera_add(location=(0,-.83,18));camera=bpy.context.object;camera.rotation_euler=(Vector((0,-.83,0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=8.2;scene.camera=camera
scene.render.filepath=str(ROOT/'public/assets/heus-hand-phone.png')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'artwork/heus-scene.blend'))
bpy.ops.render.render(write_still=True)
print('Custom 3D scene rendered')
