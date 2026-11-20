"""Original phone app artwork drawn deterministically with Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math
ROOT=Path(__file__).resolve().parent.parent
W,H=768,1536
im=Image.new('RGB',(W,H),'#08080b');d=ImageDraw.Draw(im)
def text(t,x,y,size=30,fill='#eeeeF5',bold=False):
    f=ImageFont.truetype(str(ROOT/'public/assets'/('manrope-semibold.ttf' if bold else 'manrope-regular.ttf')),size)
    d.text((x,y),t,font=f,fill=fill)
text('9:41',49,37,27,bold=True)
for n in range(4):d.rounded_rectangle((600+n*10,57-n*5,605+n*10,65),2,fill='#eeeeF5')
d.rounded_rectangle((654,41,703,64),6,fill='#eeeeF5');d.rectangle((705,48,709,57),fill='#eeeeF5')
text('Heus.',49,120,57,bold=True)
text('Your space.',49,228,66,bold=True);text('Your way.',49,304,66,bold=True)
text('A little change of atmosphere.',50,398,26,fill='#9696a6')
art=Image.new('RGB',(670,426));p=art.load()
for y in range(426):
 for x in range(670):
  t=x/670;s=y/426;g=math.exp(-(((x-560)/420)**2+((y-50)/350)**2))
  p[x,y]=(int(31+g*126+s*7),int(39+g*107+s*5),int(73+g*117+s*10))
ad=ImageDraw.Draw(art)
for y in range(426):
 for x in range(670):
  wave=280+65*math.sin(x/150)+50*math.cos(x/310)
  if y>wave:
   t=(y-wave)/230
   p[x,y]=(int(95*(1-t)+22*t),int(96*(1-t)+29*t),int(150*(1-t)+61*t))
art=art.filter(ImageFilter.GaussianBlur(1.2));im.paste(art,(49,478));d=ImageDraw.Draw(im)
text('Stillness',82,824,35,bold=True)
text('BRING IT TO THE BIG SCREEN',51,978,22,fill='#a2a2b2',bold=True)
text('Meet your new favourite view.',51,1034,31)
d.rounded_rectangle((49,1125,719,1229),52,fill='#f1edf7')
d.rounded_rectangle((248,1160,282,1184),4,outline='#17141e',width=3);d.line((259,1191,273,1191),fill='#17141e',width=3)
text('Pair a TV',305,1148,34,fill='#17141e',bold=True)
text('Choose a mood. Make it yours.',130,1265,23,fill='#898999')
d.line((49,1365,719,1365),fill='#24242d',width=1)
text('Explore',162,1408,24,fill='#d5c8f3',bold=True);text('My TV',495,1408,24,fill='#898999')
im.save(ROOT/'public/assets/phone-screen.png')
print('Original phone UI drawn')
